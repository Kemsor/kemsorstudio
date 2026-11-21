import {Router} from 'express';
import {rows,audit} from './db.js';
import {processFileDeletions} from './retention.js';
const fail=(ok,message,status=422)=>{if(!ok)throw Object.assign(new Error(message),{status});};
const administrator=(req,res,next)=>req.user?.role==='admin'?next():next(Object.assign(new Error('Administrator access required.'),{status:403}));
const idFrom=value=>{const id=Number(value);fail(Number.isSafeInteger(id)&&id>0,'Choose a valid account.');return id;};
// Keep files shared with published content, another member, or saved revisions.
async function sharedPortrait(conn,id,memberId){
 const paths=[`/media/${id}`,`/media/${id}/video.mp4`,`/media/${id}/document.pdf`,`/media/${id}/captions.vtt`];
 if((await rows(conn,'SELECT id FROM talent_accounts WHERE image_id=? AND id<>? LIMIT 1',[id,memberId])).length)return true;
 if((await rows(conn,'SELECT id FROM production_people WHERE image_id=? LIMIT 1',[id])).length)return true;
 if((await rows(conn,"SELECT id FROM cms_entries WHERE image_id=? OR JSON_CONTAINS(COALESCE(JSON_EXTRACT(metadata,'$.gallery'),JSON_ARRAY()),JSON_OBJECT('media_id',?)) LIMIT 1",[id,id])).length)return true;
 if((await rows(conn,"SELECT id FROM cms_entry_revisions WHERE JSON_EXTRACT(snapshot,'$.image_id')=? OR JSON_CONTAINS(COALESCE(JSON_EXTRACT(snapshot,'$.metadata.gallery'),JSON_ARRAY()),JSON_OBJECT('media_id',?)) LIMIT 1",[id,id])).length)return true;
 for(const [table,columns] of [['cms_entries',['metadata']],['cms_entry_revisions',['snapshot']],['cms_site_modules',['draft','published']],['cms_site_module_revisions',['snapshot']],['cms_managed_content',['draft','published']],['cms_managed_revisions',['snapshot']]]){
  const checks=columns.flatMap(column=>paths.map(()=>`JSON_SEARCH(${column},'one',?) IS NOT NULL`));
  if((await rows(conn,`SELECT 1 FROM ${table} WHERE ${checks.join(' OR ')} LIMIT 1`,columns.flatMap(()=>paths))).length)return true;
 }return false;
}
export function accountDeletionRouter(db){
 const router=Router();
 router.post('/admin/users/:id/delete',administrator,async(req,res)=>{
  fail(req.body.confirm_delete==='delete','Confirm permanent account deletion.');const id=idFrom(req.params.id),conn=await db.getConnection();
  try{
   await conn.beginTransaction();
   const admins=await rows(conn,"SELECT id FROM cms_users WHERE role='admin' AND active=1 ORDER BY id FOR UPDATE");
   fail(admins.some(user=>user.id===req.user.id),'Administrator access required. Sign in again.',403);
   const target=(await rows(conn,'SELECT id,role,active,is_default_admin FROM cms_users WHERE id=? FOR UPDATE',[id]))[0];fail(target,'Staff account not found.',404);
   fail(!target.is_default_admin,'The default administrator cannot be deleted.',403);
   fail(target.role===req.body.previous_role&&String(target.active)===req.body.previous_active,'This account’s access changed. Reload the users page before deleting.',409);
   const replacement=id===req.user.id?admins.find(user=>user.id!==id)?.id:req.user.id;
   fail(replacement,'Keep at least one active administrator.');
   const enquiries=await rows(conn,'UPDATE cms_enquiries SET assigned_to=? WHERE assigned_to=?',[replacement,id]);
   const applications=await rows(conn,'UPDATE career_applications SET assigned_to=? WHERE assigned_to=?',[replacement,id]);
   const actions=await rows(conn,'UPDATE cms_kpi_actions SET owner_id=?,version=version+1 WHERE owner_id=?',[replacement,id]);
   await rows(conn,"DELETE FROM cms_sessions WHERE JSON_EXTRACT(data,'$.userId')=?",[id]);
   await audit(conn,req.user,'delete_account','user',id,{changes:[{field:'Staff account',before:target.role,after:'Deleted'},{field:'Assigned enquiries transferred',before:enquiries.affectedRows,after:`Staff #${replacement}`},{field:'Assigned applications transferred',before:applications.affectedRows,after:`Staff #${replacement}`},{field:'KPI actions transferred',before:actions.affectedRows,after:`Staff #${replacement}`}]});
   await rows(conn,'DELETE FROM cms_users WHERE id=?',[id]);await conn.commit();
  }catch(error){await conn.rollback();throw error;}finally{conn.release();}
  if(id===req.user.id){await new Promise((resolve,reject)=>req.session.destroy(error=>error?reject(error):resolve()));if(req.get('Accept')?.includes('application/json'))return res.json({ok:true,redirect:'/admin/login?deleted=1'});return res.redirect('/admin/login?deleted=1');}
  res.redirect('/admin/users?saved=1');
 });
 router.post('/admin/talent/:id/delete',administrator,async(req,res)=>{
  fail(req.body.confirm_delete==='delete','Confirm permanent member deletion.');const id=idFrom(req.params.id),conn=await db.getConnection();
  try{
   await conn.beginTransaction();
   fail((await rows(conn,"SELECT id FROM cms_users WHERE id=? AND role='admin' AND active=1 FOR UPDATE",[req.user.id])).length,'Administrator access required. Sign in again.',403);
   const member=(await rows(conn,'SELECT id,email,status,image_id FROM talent_accounts WHERE id=? FOR UPDATE',[id]))[0];fail(member,'Member account not found.',404);
   fail(member.email===req.body.previous_email&&member.status===req.body.previous_status,'This member changed. Reload the profile before deleting.',409);
   const projects=await rows(conn,'SELECT id,script_filename FROM production_projects WHERE account_id=? FOR UPDATE',[id]);
   const sharedDocuments=await rows(conn,'SELECT script_filename FROM filmdesk_submissions WHERE account_id=? FOR UPDATE',[id]);
   for(const document of sharedDocuments)if(document.script_filename)await rows(conn,"INSERT IGNORE INTO cms_file_deletions(area,filename) VALUES('uploads',?)",[document.script_filename]);
   const casting=await rows(conn,'SELECT id FROM casting_applications WHERE account_id=? FOR UPDATE',[id]);
   const mail=await rows(conn,'SELECT id,status FROM cms_email_outbox WHERE casting_application_id IN (SELECT id FROM casting_applications WHERE account_id=?) FOR UPDATE',[id]);
   fail(!mail.some(item=>item.status==='sending'),'An application email is being delivered. Retry deletion after it finishes.',409);
   for(const project of projects)if(project.script_filename)await rows(conn,"INSERT IGNORE INTO cms_file_deletions(area,filename) VALUES('uploads',?)",[project.script_filename]);
   if(member.image_id){
    const image=(await rows(conn,'SELECT id,filename FROM cms_media WHERE id=? FOR UPDATE',[member.image_id]))[0];
    if(image&&!await sharedPortrait(conn,image.id,id)){
     await rows(conn,'UPDATE talent_accounts SET image_id=NULL WHERE id=?',[id]);
     await rows(conn,'DELETE FROM cms_media WHERE id=?',[image.id]);await rows(conn,"INSERT IGNORE INTO cms_file_deletions(area,filename) VALUES('uploads',?)",[image.filename]);
    }
   }
   await rows(conn,"UPDATE cms_sessions SET data=JSON_REMOVE(data,'$.memberId') WHERE JSON_EXTRACT(data,'$.memberId')=? AND JSON_EXTRACT(data,'$.userId') IS NOT NULL",[id]);
   await rows(conn,"DELETE FROM cms_sessions WHERE JSON_EXTRACT(data,'$.memberId')=?",[id]);
   await rows(conn,"DELETE FROM cms_notification_history WHERE category='talent' AND source_id=?",[id]);
   await rows(conn,'DELETE FROM talent_accounts WHERE id=?',[id]);
   await audit(conn,req.user,'delete_account','talent',id,{changes:[{field:'Member account',after:'Deleted',before:'Registered'},{field:'Linked production projects removed',before:projects.length,after:0},{field:'Linked casting applications removed',before:casting.length,after:0}]});
   await conn.commit();
  }catch(error){await conn.rollback();throw error;}finally{conn.release();}
  if(Number(req.session.memberId)===id){delete req.session.memberId;await new Promise((resolve,reject)=>req.session.save(error=>error?reject(error):resolve()));}
  await processFileDeletions(db).catch(()=>{});
  res.redirect('/admin/talent?saved=1');
 });return router;
}
