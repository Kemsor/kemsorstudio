import {Router} from 'express';
import {rows,json,audit} from './db.js';
import {canEnquire} from './security.js';
import {csvCell} from './reports.js';
import {businessCategories,metricDefinitions,sectionKeys,periodFor,configuration,validateConfiguration,validateInputs,buildScorecard,display,text,validDay} from './kpi.js';
import {categories} from './enquiry-options.js';
const fail=(message,status=422)=>{throw Object.assign(new Error(message),{status});};
const integer=(value,label)=>{if(typeof value!=='string'||!/^\d+$/.test(value)||!Number.isSafeInteger(Number(value)))fail(`Invalid ${label}.`);return Number(value);};
const periodFrom=req=>periodFor(req.method==='GET'?req.query.cadence:req.body.cadence,req.method==='GET'?req.query.date:req.body.date);
const urlFor=p=>`/admin/kpi?${new URLSearchParams({cadence:p.cadence,date:p.start})}`;
const sectionLabels={executive:'Executive summary',observations:'Observations and outcomes',root_causes:'Root-cause analysis',seo_review:'SEO and content outcome review',technical_review:'Security, performance and backup exceptions',strategic_review:'Strategic review and next-period priorities'};
export function kpiRouter(db){
 const router=Router();
 router.use('/admin/kpi',(req,res,next)=>canEnquire(req.user)?next():next(Object.assign(new Error('KPI reporting access required.'),{status:403})));
 const admin=(req,res,next)=>req.user.role==='admin'?next():next(Object.assign(new Error('Administrator access required.'),{status:403}));
 const locals={display,metricDefinitions,sectionKeys,sectionLabels,urlFor,clip:(s,n)=>s.length>n?s.slice(0,n)+'…':s};
 const render=async(req,res,snapshot=null,report=null)=>{
  const card=snapshot||await buildScorecard(db,periodFrom(req));
  const reports=await rows(db,'SELECT r.id,r.cadence,r.period_start,r.created_at,r.approved_at,u.name AS author,v.name AS approver FROM cms_kpi_reports r LEFT JOIN cms_users u ON u.id=r.created_by LEFT JOIN cms_users v ON v.id=r.approved_by ORDER BY r.id DESC LIMIT 40');
  const users=await rows(db,"SELECT id,name FROM cms_users WHERE active=1 AND role IN ('admin','enquiry_manager') ORDER BY name,id");
  res.render('kpi',{...locals,card,report,reports,users,summaryOnly:req.query.view==='summary',categories});
 };
 router.get('/admin/kpi',async(req,res)=>render(req,res));
 router.get('/admin/kpi/settings',admin,async(req,res)=>{
  const setting=(await rows(db,'SELECT * FROM cms_kpi_settings WHERE id=1'))[0];
  res.render('kpi-settings',{...locals,config:configuration(json(setting.configuration)),version:setting.version,businessCategories,categories});
 });
 router.post('/admin/kpi/settings',admin,async(req,res)=>{
  const config=validateConfiguration(req.body),version=integer(req.body.version,'settings version');
  const result=await rows(db,'UPDATE cms_kpi_settings SET configuration=?,version=version+1,updated_by=? WHERE id=1 AND version=?',[JSON.stringify(config),req.user.id,version]);
  if(!result.affectedRows)fail('Reporting settings changed. Reload before saving.',409);
  await audit(db,req.user,'update','kpi_settings',version+1);res.redirect('/admin/kpi/settings?saved=1');
 });
 router.post('/admin/kpi/inputs',admin,async(req,res)=>{
  const period=periodFrom(req),payload=validateInputs(req.body),version=integer(req.body.version,'input version');
  if(version===0){try{await rows(db,'INSERT INTO cms_kpi_inputs(cadence,period_start,payload,updated_by) VALUES(?,?,?,?)',[period.cadence,period.start,JSON.stringify(payload),req.user.id]);}catch(error){if(error.code==='ER_DUP_ENTRY')fail('Period inputs changed. Reload before saving.',409);throw error;}}
  else{const result=await rows(db,'UPDATE cms_kpi_inputs SET payload=?,version=version+1,updated_by=? WHERE cadence=? AND period_start=? AND version=?',[JSON.stringify(payload),req.user.id,period.cadence,period.start,version]);if(!result.affectedRows)fail('Period inputs changed. Reload before saving.',409);}
  await audit(db,req.user,'update','kpi_inputs',`${period.cadence}:${period.start}`);res.redirect(urlFor(period)+'&saved=1#inputs');
 });
 router.post('/admin/kpi/actions',async(req,res)=>{
  const p=periodFrom(req),b=req.body,title=text(b.title,200,'action title',true),expected=text(b.expected_outcome,3000,'expected outcome',true),key=text(b.metric_key,80,'metric',true);
  if(!['overall',...metricDefinitions.map(m=>m.key)].includes(key))fail('Choose a valid metric.');
  const owner=integer(b.owner_id,'owner');if(!(await rows(db,"SELECT id FROM cms_users WHERE id=? AND active=1 AND role IN ('admin','enquiry_manager')",[owner])).length)fail('Choose an active reporting owner.');
  if(!validDay(b.due_date))fail('Enter a valid due date.');
  const r=await rows(db,'INSERT INTO cms_kpi_actions(cadence,period_start,metric_key,title,owner_id,due_date,expected_outcome,evidence,created_by) VALUES(?,?,?,?,?,?,?,?,?)',[p.cadence,p.start,key,title,owner,b.due_date,expected,'',req.user.id]);
  await audit(db,req.user,'create','kpi_action',r.insertId);res.redirect(urlFor(p)+'&saved=1#actions');
 });
 router.post('/admin/kpi/actions/:id',async(req,res)=>{
  const id=integer(req.params.id,'action'),version=integer(req.body.version,'action version');
  const action=(await rows(db,'SELECT * FROM cms_kpi_actions WHERE id=?',[id]))[0];if(!action)fail('Action not found.',404);
  const status=req.body.status;if(!['open','in_progress','done','cancelled'].includes(status))fail('Choose a valid action status.');
  const evidence=text(req.body.evidence,4000,'progress and outcome evidence',status==='done'||status==='cancelled');
  const result=await rows(db,'UPDATE cms_kpi_actions SET status=?,evidence=?,version=version+1 WHERE id=? AND version=?',[status,evidence,id,version]);
  if(!result.affectedRows)fail('Action changed. Reload before saving.',409);
  await audit(db,req.user,'update','kpi_action',id);res.redirect(urlFor(periodFor(action.cadence,String(action.period_start).slice(0,10)))+'&saved=1#actions');
 });
 router.post('/admin/kpi/snapshots',async(req,res)=>{
  const p=periodFrom(req),connection=await db.getConnection();let result;
  try{
   await rows(connection,'SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');await connection.beginTransaction();const card=await buildScorecard(connection,p);
   if(card.configurationVersion!==integer(req.body.configuration_version,'settings version')||card.inputVersion!==integer(req.body.input_version,'input version'))fail('Report inputs changed. Reload the scorecard before saving a snapshot.',409);
   result=await rows(connection,'INSERT INTO cms_kpi_reports(cadence,period_start,period_end,snapshot,created_by) VALUES(?,?,?,?,?)',[p.cadence,p.start,p.end,JSON.stringify(card),req.user.id]);
   await audit(connection,req.user,'snapshot','kpi_report',result.insertId);await connection.commit();
  }catch(error){await connection.rollback();throw error;}finally{connection.release();}
  res.redirect(`/admin/kpi/reports/${result.insertId}?saved=1`);
 });
 const reportById=async id=>{const report=(await rows(db,'SELECT r.*,u.name AS author,v.name AS approver FROM cms_kpi_reports r LEFT JOIN cms_users u ON u.id=r.created_by LEFT JOIN cms_users v ON v.id=r.approved_by WHERE r.id=?',[integer(id,'report')]))[0];if(!report)fail('Report not found.',404);return report;};
 router.get('/admin/kpi/reports/:id',async(req,res)=>{const report=await reportById(req.params.id);return render(req,res,json(report.snapshot),report);});
 router.post('/admin/kpi/reports/:id/approve',admin,async(req,res)=>{
  const report=await reportById(req.params.id),card=json(report.snapshot);
  if(report.approved_at)fail('This snapshot is already approved.',409);
  if(card.period.inProgress||card.period.end>=new Date().toISOString().slice(0,10))fail('Only a completed reporting period can be approved. Create a fresh snapshot after the period ends.');
  if(req.body.confirm!=='approve')fail('Confirm review of the figures, limitations and source evidence.');
  for(const key of ['executive','observations','root_causes','seo_review','technical_review',...(card.period.cadence==='quarterly'?['strategic_review']:[])])if(!card.input[key])fail(`Complete ${sectionLabels[key]} in period inputs, then create a new snapshot.`);
  const result=await rows(db,'UPDATE cms_kpi_reports SET approved_by=?,approved_at=UTC_TIMESTAMP() WHERE id=? AND approved_at IS NULL',[req.user.id,report.id]);
  if(!result.affectedRows)fail('This snapshot was already approved.',409);
  await audit(db,req.user,'approve','kpi_report',report.id);res.redirect(`/admin/kpi/reports/${report.id}?saved=1`);
 });
 router.get('/admin/kpi/export.csv',async(req,res)=>{
  const report=req.query.report?await reportById(req.query.report):null,card=report?json(report.snapshot):await buildScorecard(db,periodFrom(req));
  const records=[['KEMSOR KPI report',card.period.cadence,card.period.start,card.period.end],['Generated UTC',card.generatedAt],['Approval',report?.approved_at?`Approved ${report.approved_at} by ${report.approver}`:'Not approved'],['Settings version',card.configurationVersion],['Business categories',card.configuration.categories.join('; ')],['Amber threshold %',card.configuration.amberPercent],['Prior period',card.previousPeriod.start,card.previousPeriod.end],['Limitations','CMS cohort counts reflect retained records and recorded milestones. Unavailable differs from zero. Current and previous periods may be incomplete. No revenue or uptime guarantee is inferred.'],[],['Metric','Actual','Target','Previous period','Change','Change %','Status','Unit','Source','Definition'],...card.metrics.map(m=>[m.label,m.actual??'Unavailable',m.target??'Not set',m.previous??'Unavailable',m.change??'Unavailable',m.percentChange??'Unavailable',m.rag,m.unit,m.source,m.definition]),[],['Source','Reference','Property / timezone / filters','Extracted on'],['GA4',card.input.analytics?.reference,card.input.analytics?.filters,card.input.analytics?.extracted_on],['Search Console',card.input.search?.reference,card.input.search?.filters,card.input.search?.extracted_on],[],...sectionKeys.map(key=>[sectionLabels[key],card.input[key]||'Not recorded']),[],['Action','Metric','Owner','Due date','Status','Expected outcome','Evidence'],...[...card.actions,...card.carried].map(a=>[a.title,a.metric_key,a.owner,a.due_date,a.status,a.expected_outcome,a.evidence]),[],['Operation','Status','Runs','Last finish UTC'],...card.operations.map(o=>[o.job,o.status,o.total,o.last_finished])];
  await audit(db,req.user,'download','kpi_report',report?.id||`${card.period.cadence}:${card.period.start}`);
  res.set({'Content-Type':'text/csv; charset=utf-8','Content-Disposition':`attachment; filename="kemsor-kpi-${card.period.cadence}-${card.period.start}.csv"`}).send('\uFEFF'+records.map(r=>r.map(csvCell).join(',')).join('\r\n'));
 });
 return router;
}
