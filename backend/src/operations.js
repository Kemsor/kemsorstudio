import {rows} from './db.js';
import {retentionPolicy,runRetention,processFileDeletions} from './retention.js';
import {createBackup,cleanupBackupWork} from './backup.js';

export async function housekeeping(db,env=process.env) {
 const sessions=await rows(db,'DELETE FROM cms_sessions WHERE expires_at<UTC_TIMESTAMP()');
 const limits=await rows(db,'DELETE FROM cms_rate_limits WHERE expires_at<UTC_TIMESTAMP()');
 const files=await processFileDeletions(db);
 const backupWork=await cleanupBackupWork(env);
 return {expiredSessions:sessions.affectedRows,expiredRateLimits:limits.affectedRows,files,backupWork};
}
export async function operation(db,job,task,{intervalMinutes=0}={}) {
 const connection=await db.getConnection();let id,locked=false;
 try {
  locked=Number((await rows(connection,'SELECT GET_LOCK(?,0) AS acquired',['kemsor-operations']))[0].acquired)===1;
  if(!locked)return {skipped:'another-operation-is-running'};
  if(intervalMinutes) {
   const recent=await rows(connection,'SELECT id FROM cms_operations_runs WHERE job=? AND started_at>DATE_SUB(UTC_TIMESTAMP(),INTERVAL ? MINUTE) LIMIT 1',[job,intervalMinutes]);
   if(recent.length)return {skipped:'not-due'};
  }
  // A stale running record means the former process stopped before recording a result.
  await rows(connection,"UPDATE cms_operations_runs SET status='failed',finished_at=UTC_TIMESTAMP(),summary=? WHERE status='running'",[JSON.stringify({error:'interrupted'})]);
  id=(await rows(connection,"INSERT INTO cms_operations_runs(job,status) VALUES(?,'running')",[job])).insertId;
  const result=await task();
  await rows(connection,"UPDATE cms_operations_runs SET status='success',summary=?,finished_at=UTC_TIMESTAMP() WHERE id=?",[JSON.stringify(result),id]);return result;
 }catch(error){
  // Do not store command stderr, SQL, credentials or personal data in operations logs.
  if(id)await rows(connection,"UPDATE cms_operations_runs SET status='failed',summary=?,finished_at=UTC_TIMESTAMP() WHERE id=?",[JSON.stringify({error:'Operation failed; check service configuration and private server logs.'}),id]).catch(()=>{});
  throw error;
 }finally{if(locked)await rows(connection,'SELECT RELEASE_LOCK(?)',['kemsor-operations']).catch(()=>{});connection.release();}
}
export async function runScheduledOperations(db,env=process.env) {
 const errors=[];
 const attempt=async task=>{try{await task();}catch(error){errors.push(error);}};
 await attempt(()=>operation(db,'housekeeping',()=>housekeeping(db,env),{intervalMinutes:60}));
 await attempt(async()=>{
  const policy=retentionPolicy(env);
  if(policy.enquiry||policy.application)await operation(db,'retention',()=>runRetention(db,policy,{apply:policy.enabled}),{intervalMinutes:policy.enabled?60:1440});
 });
 if(env.BACKUP_ENABLED==='true')for(const [kind,minutes] of [['database',1440],['application',10080]])await attempt(async()=>{
  const latest=await rows(db,"SELECT id FROM cms_operations_runs WHERE job=? AND status='success' AND finished_at>DATE_SUB(UTC_TIMESTAMP(),INTERVAL ? MINUTE) LIMIT 1",[`backup-${kind}`,minutes]);
  if(!latest.length)await operation(db,`backup-${kind}`,()=>createBackup(db,{kind,env}),{intervalMinutes:60});
 });
 if(errors.length)throw new AggregateError(errors,'One or more operations failed');
}
export function startOperationsWorker(db,env=process.env) {
 if(env.OPERATIONS_ENABLED==='false')return async()=>{};
 let stopped=false,running=null;
 const tick=()=>{if(stopped||running)return;running=runScheduledOperations(db,env).catch(error=>console.error('Operations job failed:',error.code||'configuration-or-job-error')).finally(()=>{running=null;});};
 const initial=setTimeout(tick,10000),timer=setInterval(tick,60000);initial.unref();timer.unref();
 return async()=>{stopped=true;clearTimeout(initial);clearInterval(timer);await running;};
}
