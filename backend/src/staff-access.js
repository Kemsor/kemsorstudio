import {Router} from 'express';
import {rows,audit} from './db.js';

export const staffRoles = {admin:'Administrator',editor:'Editor',enquiry_manager:'Enquiry manager'};
export const permissionGuide = [
 {area:'Content, website pages and media',admin:'View, edit, publish, archive and remove unused media',editor:'View, edit, publish, archive and remove unused media',enquiry_manager:'No access'},
 {area:'Casting calls, applications and production people',admin:'Publish calls and profiles; review applications',editor:'Publish calls and profiles; review applications',enquiry_manager:'No access'},
 {area:'Contact enquiries and career applications',admin:'View, assign, update, reply and delete',editor:'No access',enquiry_manager:'View, assign, update and reply; no deletion'},
 {area:'KPI reporting',admin:'Manage, review and approve',editor:'No access',enquiry_manager:'Prepare reporting and manage assigned work; no approval'},
 {area:'Reports and exports',admin:'All reports',editor:'Publishing reports',enquiry_manager:'Enquiry and career application reports'},
 {area:'Members and private production projects',admin:'Review and manage',editor:'No access',enquiry_manager:'No access'},
 {area:'Legal documents, hero slides and protected page areas',admin:'Edit, publish and restore',editor:'No access',enquiry_manager:'No access'},
 {area:'Settings, campaigns, email delivery, activity and backups',admin:'Manage',editor:'No access',enquiry_manager:'No access'},
 {area:'Staff accounts and roles',admin:'Create accounts, change roles, enable or disable access and delete non-default accounts',editor:'No access',enquiry_manager:'No access'},
 {area:'Own profile, password and notifications',admin:'Manage own account',editor:'Manage own account',enquiry_manager:'Manage own account'},
];
const fail=(ok,message,status=422)=>{if(!ok)throw Object.assign(new Error(message),{status});};
export function staffAccessRouter(db){
 const router=Router();
 router.get('/admin/permissions',(req,res)=>res.render('permissions',{staffRoles,permissionGuide,title:'Roles and permissions | Kemsor CMS'}));
 const changeAccess=async(req,res)=>{
  fail(req.user?.role==='admin','Administrator access required.',403);
  const id=Number(req.params.id),b={...req.body},legacy=req.path.endsWith('/toggle');
  fail(Number.isSafeInteger(id)&&id>0,'Choose a valid staff account.');
  fail(id!==req.user.id,'You cannot change your own role or disable your own account.');
  if(!legacy)fail(Object.hasOwn(staffRoles,b.role),'Choose a valid role.');
  if(!legacy)fail(['0','1'].includes(b.active),'Choose active or disabled access.');
  if(!legacy)fail(Object.hasOwn(staffRoles,b.previous_role)&&['0','1'].includes(b.previous_active),'Reload the staff account before changing access.',409);
  const conn=await db.getConnection();
  try{
   await conn.beginTransaction();
   // Serialize access changes, and recheck the acting administrator under the same lock.
   const admins=await rows(conn,"SELECT id FROM cms_users WHERE role='admin' AND active=1 ORDER BY id FOR UPDATE");
   fail(admins.some(account=>account.id===req.user.id),'Administrator access required. Sign in again.',403);
   const target=(await rows(conn,'SELECT id,role,active,is_default_admin FROM cms_users WHERE id=? FOR UPDATE',[id]))[0];
   fail(target,'Staff account not found.',404);
   if(legacy)Object.assign(b,{role:target.role,active:target.active?'0':'1',previous_role:target.role,previous_active:String(target.active)});
   fail(!target.is_default_admin||(b.role==='admin'&&b.active==='1'),'The default administrator must remain an active administrator.');
   fail(target.role===b.previous_role&&String(target.active)===b.previous_active,'This account’s access changed. Reload the users page before saving.',409);
   fail(!(target.role==='admin'&&target.active&&(b.role!=='admin'||b.active==='0')&&admins.length<=1),'Keep at least one active administrator.');
   if(target.role!==b.role||String(target.active)!==b.active){
    await rows(conn,'UPDATE cms_users SET role=?,active=? WHERE id=?',[b.role,Number(b.active),id]);
    await rows(conn,"DELETE FROM cms_sessions WHERE JSON_EXTRACT(data,'$.userId')=?",[id]);
    await audit(conn,req.user,`access_${target.role}_${target.active}_to_${b.role}_${b.active}`,'user',id,{changes:[{field:'Role',before:staffRoles[target.role],after:staffRoles[b.role]},{field:'Account access',before:target.active?'Active':'Disabled',after:b.active==='1'?'Active':'Disabled'}].filter(change=>change.before!==change.after)});
   }
   await conn.commit();
  }catch(error){await conn.rollback();throw error;}finally{conn.release();}
  res.redirect('/admin/users?saved=1');
 };
 router.post('/admin/users/:id/access',changeAccess);
 router.post('/admin/users/:id/toggle',changeAccess);
 return router;
}
