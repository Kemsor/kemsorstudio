import path from 'node:path';
import {unlink,realpath,mkdir} from 'node:fs/promises';
import {rows,audit} from './db.js';

export const storageDirectory = new URL('../storage/',import.meta.url).pathname;
export const retentionResources = {
 enquiry:{table:'cms_enquiries',file:'attachment_filename',area:'uploads',terminal:['closed','rejected','spam'],prefix:'KEM'},
 application:{table:'career_applications',file:'resume_filename',area:'career-resumes',terminal:['rejected'],prefix:'APP'},
};
const failure=(message,status=422)=>Object.assign(new Error(message),{status});
export function retentionPolicy(env=process.env) {
 const days = name => {const raw=env[name];if(!raw||raw==='0')return 0;if(!/^\d+$/.test(raw)||Number(raw)>36500)throw new Error(`Invalid ${name}`);return Number(raw);};
 const policy={enabled:env.RETENTION_ENABLED==='true',version:env.RETENTION_POLICY_VERSION||'',enquiry:days('RETENTION_ENQUIRY_DAYS'),application:days('RETENTION_APPLICATION_DAYS')};
 if(policy.enabled&&(!policy.version.trim()||policy.version.length>100||(!policy.enquiry&&!policy.application)))throw new Error('Retention requires an approved policy version and at least one retention period');
 return policy;
}
const candidates=(resource,days)=>{
 const config=retentionResources[resource];
 return {sql:`FROM ${config.table} WHERE retention_hold=0 AND status IN (${config.terminal.map(()=>'?').join(',')}) AND updated_at<DATE_SUB(UTC_TIMESTAMP(),INTERVAL ? DAY)`,params:[...config.terminal,days]};
};
export async function retentionPreview(db,policy) {
 const result={};
 for(const resource of Object.keys(retentionResources)) {
  if(!policy[resource]){result[resource]=0;continue;}
  const query=candidates(resource,policy[resource]);
  result[resource]=Number((await rows(db,`SELECT COUNT(*) AS total ${query.sql}`,query.params))[0].total);
 }
 return result;
}
export async function deletePersonalRecord(db,resource,id,{user=null,policyVersion='manual-request',retentionDays=0}={}) {
 const config=Object.hasOwn(retentionResources,resource)?retentionResources[resource]:null;if(!config)throw failure('Unknown personal-data resource');
 const connection=await db.getConnection();
 try {
  await connection.beginTransaction();
  const record=(await rows(connection,`SELECT *, updated_at<DATE_SUB(UTC_TIMESTAMP(),INTERVAL ? DAY) AS eligible_age FROM ${config.table} WHERE id=? FOR UPDATE`,[retentionDays,id]))[0];
  if(!record)throw failure('Record not found.',404);
  if(record.retention_hold)throw failure('This record is on retention hold. An administrator must release the hold before deletion.',409);
  if(retentionDays&&(!record.eligible_age||!config.terminal.includes(record.status))){await connection.rollback();return false;}
  const receipt=`${config.prefix}-${String(id).padStart(6,'0')}`;
  // Lock the receipt before deleting it; do not race an actively claimed delivery.
  const outbox=await rows(connection,'SELECT id,status FROM cms_email_outbox WHERE receipt_key=? FOR UPDATE',[receipt]);
  if(outbox.some(record=>record.status==='sending'))throw failure('Confirmation delivery is in progress. Retry deletion after it finishes.',409);
  if(record[config.file])await rows(connection,'INSERT IGNORE INTO cms_file_deletions(area,filename) VALUES(?,?)',[config.area,record[config.file]]);
  if(resource==='enquiry')await rows(connection,'DELETE FROM cms_notification_history WHERE category="enquiry" AND source_id=?',[id]);
  await rows(connection,'DELETE FROM cms_email_outbox WHERE receipt_key=?',[receipt]);
  await rows(connection,'INSERT IGNORE INTO cms_data_deletions(resource,source_id,source_created_at,policy_version) VALUES(?,?,?,?)',[resource,id,record.created_at,policyVersion]);
  await rows(connection,`DELETE FROM ${config.table} WHERE id=?`,[id]);
  await audit(connection,user,'delete_personal_data',resource,id);
  await connection.commit();return true;
 }catch(error){await connection.rollback();throw error;}finally{connection.release();}
}
export async function processFileDeletions(db,root=storageDirectory) {
 let deleted=0,failed=0;
 await mkdir(root,{recursive:true,mode:0o700});root=await realpath(root);
 for(const item of await rows(db,'SELECT * FROM cms_file_deletions ORDER BY id LIMIT 100')) {
  try {
   if(!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(item.filename)||!['uploads','career-resumes'].includes(item.area))throw new Error('Unsafe filename');
   const folder=path.resolve(root,item.area);
   // Reject a symlinked storage area; never follow it outside private storage.
   try {if(await realpath(folder)!==folder)throw new Error('Symlinked storage area');}catch(error){if(error.code!=='ENOENT')throw error;}
   await unlink(path.join(folder,item.filename)).catch(error=>{if(error.code!=='ENOENT')throw error;});
   await rows(db,'DELETE FROM cms_file_deletions WHERE id=?',[item.id]);deleted++;
  }catch {await rows(db,'UPDATE cms_file_deletions SET attempts=attempts+1 WHERE id=?',[item.id]);failed++;}
 }
 return {deleted,failed};
}
export async function runRetention(db,policy,{apply=false,limit=100}={}) {
 if(apply&&!policy.enabled)throw new Error('Automatic retention deletion is disabled');
 const preview=await retentionPreview(db,policy),deleted={enquiry:0,application:0};
 if(apply)for(const resource of Object.keys(retentionResources)) {
  if(!policy[resource])continue;
  const query=candidates(resource,policy[resource]);
  const records=await rows(db,`SELECT id ${query.sql} ORDER BY id LIMIT ${Math.min(1000,Math.max(1,Number(limit)||100))}`,query.params);
  for(const record of records)try {if(await deletePersonalRecord(db,resource,record.id,{policyVersion:policy.version,retentionDays:policy[resource]}))deleted[resource]++;}catch(error){if(![404,409].includes(error.status))throw error;}
 }
 return {mode:apply?'apply':'preview',policyVersion:policy.version,candidates:preview,deleted};
}

// Run against an isolated restored database while mail and application workers are stopped.
export async function reconcileDeletions(restoredDb,ledger) {
 let erased=0;
 for(const entry of ledger) {
  const config=retentionResources[entry.resource];if(!config)continue;
  const matching=await rows(restoredDb,`SELECT id FROM ${config.table} WHERE id=? AND created_at=?`,[entry.source_id,entry.source_created_at]);
  if(!matching.length)continue;
  // The current ledger records a completed erasure, overriding a hold in an older snapshot.
  await rows(restoredDb,`UPDATE ${config.table} SET retention_hold=0 WHERE id=?`,[entry.source_id]);
  await rows(restoredDb,"UPDATE cms_email_outbox SET status='failed',claim_token=NULL WHERE receipt_key=? AND status='sending'",[`${config.prefix}-${String(entry.source_id).padStart(6,'0')}`]);
  if(await deletePersonalRecord(restoredDb,entry.resource,entry.source_id,{policyVersion:'recovery-reconciliation'}))erased++;
 }
 return erased;
}
