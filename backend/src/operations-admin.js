import {Router} from 'express';
import {rows,audit} from './db.js';
import {retentionPolicy,retentionPreview,retentionResources,deletePersonalRecord} from './retention.js';
export function operationsRouter(db) {
 const router=Router();
 router.use('/admin/operations',(req,res,next)=>req.user?.role==='admin'?next():next(Object.assign(new Error('Administrator access required.'),{status:403})));
 router.get('/admin/operations',async(req,res)=>{
  const policy=retentionPolicy();
  res.render('operations',{policy,preview:await retentionPreview(db,policy),runs:await rows(db,'SELECT job,status,summary,started_at,finished_at FROM cms_operations_runs ORDER BY id DESC LIMIT 30'),pendingFiles:(await rows(db,'SELECT COUNT(*) AS total FROM cms_file_deletions'))[0].total,backupEnabled:process.env.BACKUP_ENABLED==='true',offsiteConfigured:Boolean(process.env.BACKUP_REMOTE_HOST&&process.env.BACKUP_REMOTE_DIR)});
 });
 router.post('/admin/operations/:resource/:id/hold',async(req,res)=>{
  const config=Object.hasOwn(retentionResources,req.params.resource)?retentionResources[req.params.resource]:null;if(!config)throw Object.assign(new Error('Unknown resource.'),{status:422});
  if(!['true','false'].includes(req.body.retention_hold))throw Object.assign(new Error('Choose whether to place or release the hold.'),{status:422});
  const hold=req.body.retention_hold==='true';
  const result=await rows(db,`UPDATE ${config.table} SET retention_hold=? WHERE id=?`,[hold,req.params.id]);
  if(!result.affectedRows)throw Object.assign(new Error('Record not found.'),{status:404});
  await audit(db,req.user,hold?'retention_hold':'retention_hold_released',req.params.resource,req.params.id);
  res.redirect(`/admin/${req.params.resource==='enquiry'?'enquiries':'applications'}/${req.params.id}?saved=1`);
 });
 router.post('/admin/operations/application/:id/delete',async(req,res)=>{
  if(req.body.confirm!=='delete')throw Object.assign(new Error('Confirm permanent deletion.'),{status:422});
  await deletePersonalRecord(db,'application',req.params.id,{user:req.user});
  res.redirect('/admin/applications?saved=1');
 });
 return router;
}
