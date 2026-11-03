import {rows,json,audit} from './db.js';
import {configuration,periodFor,buildScorecard} from './kpi.js';

// Local report drafts only. No account connection, approval or outbound delivery.
export async function generateDueReports(db,date=new Date().toISOString().slice(0,10)){
 const connection=await db.getConnection();let locked=false,transaction=false;const created=[];
 try{
  locked=Number((await rows(connection,"SELECT GET_LOCK('kemsor-kpi-reporting',0) AS acquired"))[0].acquired)===1;
  if(!locked)return created;
  const setting=(await rows(connection,'SELECT configuration FROM cms_kpi_settings WHERE id=1'))[0];
  if(!setting||!configuration(json(setting.configuration)).automaticDrafts)return created;
  for(const cadence of ['weekly','monthly','quarterly']){
   const current=periodFor(cadence,date),period=periodFor(cadence,current.previous),key=`${cadence}:${period.start}`;
   if((await rows(connection,'SELECT id FROM cms_kpi_reports WHERE automatic_key=?',[key])).length)continue;
   await rows(connection,'SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');await connection.beginTransaction();transaction=true;
   const card={...await buildScorecard(connection,period),origin:'scheduled'};
   // A supplied historical clock in tests must never bypass period completion.
   if(card.period.inProgress){await connection.rollback();transaction=false;continue;}
   const result=await rows(connection,'INSERT INTO cms_kpi_reports(automatic_key,cadence,period_start,period_end,snapshot) VALUES(?,?,?,?,?)',[key,cadence,period.start,period.end,JSON.stringify(card)]);
   await audit(connection,null,'scheduled_draft','kpi_report',result.insertId);await connection.commit();transaction=false;created.push(result.insertId);
  }
  return created;
 }catch(error){if(transaction)await connection.rollback();throw error;}
 finally{if(locked)await rows(connection,"SELECT RELEASE_LOCK('kemsor-kpi-reporting')").catch(()=>{});connection.release();}
}
export function startKpiWorker(db){
 let stopped=false,running=null;
 const tick=()=>{if(stopped||running)return;running=generateDueReports(db).catch(()=>console.error('KPI draft generation failed; check reporting configuration and database access.')).finally(()=>{running=null;});};
 const initial=setTimeout(tick,15000),timer=setInterval(tick,15*60*1000);initial.unref();timer.unref();
 return async()=>{stopped=true;clearTimeout(initial);clearInterval(timer);await running;};
}
