import {queueCastingMail} from './casting-mail.js';
import {Router} from 'express';
import {rows,json,audit} from './db.js';
import {canEdit,rateLimited} from './security.js';
import {castingToday} from './casting-calls.js';
import {castingRoleKey} from './casting-role.js';
const ensure=(ok,message,status=422)=>{if(!ok)throw Object.assign(new Error(message),{status});};
const text=(value,max,label)=>{ensure(typeof value==='string'&&value.trim().length<=max,`${label} must be text, up to ${max} characters.`);return value.trim();};
export const applicationStates=['submitted','reviewing','shortlisted','rejected'];
export function auditionLinks(value){
 const raw=text(value??'',8000,'Audition links');const links=[...new Set(raw.split(/\r?\n/).map(value=>value.trim()).filter(Boolean))];ensure(links.length<=5,'Use up to five audition links.');
 return links.map(link=>{let url;try{url=new URL(link);}catch{}ensure(link.length<=1500&&url?.protocol==='https:'&&!url.username&&!url.password,'Use direct HTTPS audition or portfolio links without login credentials.');return url.href;});
}
export function castingApplicationsRouter(db){
 const router=Router();
 router.param('id',(req,res,next,id)=>{ensure(/^[1-9]\d{0,9}$/.test(id),'Record not found.',404);next();});
 const staff=(req,res,next)=>canEdit(req.user)?next():next(Object.assign(new Error('Casting review access required.'),{status:403}));
 const administrator=(req,res,next)=>req.user?.role==='admin'?next():next(Object.assign(new Error('Administrator access required.'),{status:403}));
 const artist=async(req,res,next)=>{const account=req.session.memberId?(await rows(db,"SELECT * FROM talent_accounts WHERE id=? AND role='artist' AND status!='suspended'",[req.session.memberId]))[0]:null;ensure(account,'Sign in with a talent account to continue.',401);req.castingApplicant=account;next();};
 router.get('/api/casting-application-settings',async(req,res)=>{
  const setting=(await rows(db,'SELECT enabled,terms_version,terms FROM casting_application_settings WHERE id=1'))[0];const enabled=Boolean(setting?.enabled&&setting.terms_version&&setting.terms);
  res.set('Cache-Control','no-store').json(enabled?{enabled,terms:setting.terms,version:setting.terms_version}:{enabled:false});
 });
 router.get('/api/casting-applications',artist,async(req,res)=>{
  const page=Math.max(1,Math.min(10000,Number.parseInt(req.query.page,10)||1));
  const applications=await rows(db,'SELECT id,call_id,call_title,role_name,status,created_at,updated_at FROM casting_applications WHERE account_id=? ORDER BY id DESC LIMIT 31 OFFSET ?',[req.castingApplicant.id,(page-1)*30]);
  res.set('Cache-Control','no-store').json({applications:applications.slice(0,30),page,hasMore:applications.length>30});
 });
 router.post('/api/casting-calls/:id/applications',artist,async(req,res)=>{
  ensure(!(await rateLimited(db,`casting-application:${req.castingApplicant.id}`,20,3600)),'Too many applications. Please try later.',429);
  const message=text(req.body.message,4000,'Message');ensure(message,'Add a message for the casting team.');const links=auditionLinks(req.body.audition_links);const roleKey=text(req.body.role_key,64,'Role');ensure(/^[a-f0-9]{64}$/.test(roleKey),'Choose a valid role.');
  const connection=await db.getConnection();let id;
  try{
   await connection.beginTransaction();
   const config=(await rows(connection,'SELECT * FROM casting_application_settings WHERE id=1 FOR UPDATE'))[0];ensure(config?.enabled&&config.terms&&config.terms_version,'Applications are not currently open.',403);
   ensure(req.body.consent===true&&req.body.terms_version===config.terms_version,'Read and accept the current casting application terms.');
   const call=(await rows(connection,"SELECT c.* FROM casting_calls c JOIN cms_entries p ON p.id=c.production_id WHERE c.id=? AND c.status='published' AND c.published_at<=UTC_TIMESTAMP() AND p.type='production' AND p.status='published' AND p.published_at<=UTC_TIMESTAMP() FOR UPDATE",[req.params.id]))[0];ensure(call,'Casting call not found.',404);ensure(call.call_state==='open'&&call.deadline>=castingToday(),'This casting call is closed.',409);
   const role=json(call.roles).find(role=>castingRoleKey(role.name)===roleKey);ensure(role,'This role is no longer available. Refresh the call and choose a current role.',409);
   const account=(await rows(connection,"SELECT * FROM talent_accounts WHERE id=? AND role='artist' AND status!='suspended' FOR UPDATE",[req.castingApplicant.id]))[0];ensure(account,'Talent account unavailable.',403);
   const snapshot=Object.fromEntries(['name','city','profession','languages','skills','bio','credits','availability','showreel'].map(key=>[key,account[key]||'']));
   id=(await rows(connection,'INSERT INTO casting_applications(call_id,account_id,role_key,call_title,role_name,role_eligibility,profile_snapshot,message,audition_links,terms_version,terms_snapshot,consent_at,reviewer_note) VALUES(?,?,?,?,?,?,?,?,?,?,?,UTC_TIMESTAMP(),?)',[call.id,account.id,roleKey,call.title,role.name,role.eligibility,JSON.stringify(snapshot),message,JSON.stringify(links),config.terms_version,config.terms,''])).insertId;
   await rows(connection,"INSERT INTO casting_application_events(application_id,status,note) VALUES(?,'submitted','')",[id]);await queueCastingMail(connection,{id,call_title:call.title,role_name:role.name},account,'submitted');await audit(connection,null,'submit','casting_application',id);await connection.commit();
  }catch(error){await connection.rollback();if(error.code==='ER_DUP_ENTRY')throw Object.assign(new Error('You have already applied for this role.'),{status:409});throw error;}finally{connection.release();}
  res.status(201).json({id,status:'submitted',message:'Your application has been received. Track its status in My applications.'});
 });
 router.get('/admin/casting-application-settings',administrator,async(req,res)=>res.render('casting-application-settings',{config:(await rows(db,'SELECT * FROM casting_application_settings WHERE id=1'))[0]}));
 router.post('/admin/casting-application-settings',administrator,async(req,res)=>{
  const enabled=req.body.enabled==='on',terms=text(req.body.terms,20000,'Terms'),version=text(req.body.terms_version,100,'Terms version');ensure(!enabled||(terms&&version&&req.body.approved==='on'),'Add the client-approved terms, a version and confirm approval before enabling applications.');
  const previous=(await rows(db,'SELECT * FROM casting_application_settings WHERE id=1'))[0];ensure(!previous.terms||previous.terms===terms||previous.terms_version!==version,'Use a new version when changing the terms.');
  await rows(db,'UPDATE casting_application_settings SET enabled=?,terms=?,terms_version=?,updated_by=? WHERE id=1',[enabled,terms,version,req.user.id]);await audit(db,req.user,'configure','casting_applications',1);res.redirect(303,'/admin/casting-application-settings?saved=1');
 });
 router.get('/admin/casting-applications',staff,async(req,res)=>{
  const status=applicationStates.includes(req.query.status)?req.query.status:'',callId=/^[1-9]\d*$/.test(req.query.call||'')?req.query.call:'',page=Math.max(1,Math.min(10000,Number.parseInt(req.query.page,10)||1));
  const applications=await rows(db,"SELECT a.id,a.call_title,a.role_name,a.status,a.created_at,t.name,t.email FROM casting_applications a JOIN talent_accounts t ON t.id=a.account_id WHERE (?='' OR a.status=?) AND (?='' OR a.call_id=?) ORDER BY a.id DESC LIMIT 31 OFFSET ?",[status,status,callId,callId,(page-1)*30]);
  res.render('casting-applications',{applications:applications.slice(0,30),hasMore:applications.length>30,page,status,callId,states:applicationStates});
 });
 router.get('/admin/casting-applications/:id',staff,async(req,res)=>{
  const application=(await rows(db,'SELECT a.*,t.name,t.email FROM casting_applications a JOIN talent_accounts t ON t.id=a.account_id WHERE a.id=?',[req.params.id]))[0];ensure(application,'Application not found.',404);application.profile_snapshot=json(application.profile_snapshot);application.audition_links=json(application.audition_links);
  res.render('casting-application',{application,states:applicationStates,emails:await rows(db,'SELECT id,receipt_key,recipient,subject,status,attempts,last_error,sent_at,created_at FROM cms_email_outbox WHERE casting_application_id=? ORDER BY id DESC',[application.id]),events:await rows(db,'SELECT e.status,e.note,e.created_at,u.name FROM casting_application_events e LEFT JOIN cms_users u ON u.id=e.user_id WHERE application_id=? ORDER BY e.id DESC',[application.id])});
 });
 router.post('/admin/casting-applications/:id',staff,async(req,res)=>{
  ensure(applicationStates.includes(req.body.status),'Choose a valid application status.');const note=text(req.body.note||'',4000,'Reviewer note');const connection=await db.getConnection();
  try{await connection.beginTransaction();const application=(await rows(connection,'SELECT a.*,t.email,t.name FROM casting_applications a JOIN talent_accounts t ON t.id=a.account_id WHERE a.id=? FOR UPDATE',[req.params.id]))[0];ensure(application,'Application not found.',404);ensure(application.status===req.body.expected_status,'Another reviewer updated this application. Reload before saving.',409);
   await rows(connection,'UPDATE casting_applications SET status=?,reviewer_note=?,updated_by=? WHERE id=?',[req.body.status,note,req.user.id,req.params.id]);const event=await rows(connection,'INSERT INTO casting_application_events(application_id,status,note,user_id) VALUES(?,?,?,?)',[req.params.id,req.body.status,note,req.user.id]);if(application.status!==req.body.status&&['shortlisted','rejected'].includes(req.body.status))await queueCastingMail(connection,application,application,req.body.status,event.insertId);await audit(connection,req.user,'review','casting_application',req.params.id);await connection.commit();
  }catch(error){await connection.rollback();throw error;}finally{connection.release();}res.redirect(303,`/admin/casting-applications/${req.params.id}?saved=1`);
 });
 router.post('/admin/casting-applications/:id/emails/:mailId/retry',staff,async(req,res)=>{
  const result=await rows(db,"UPDATE cms_email_outbox SET status='pending',attempts=0,available_at=UTC_TIMESTAMP(),claim_token=NULL,last_error=NULL WHERE id=? AND casting_application_id=? AND status='failed'",[req.params.mailId,req.params.id]);ensure(result.affectedRows,'Only failed emails belonging to this application can be retried.',409);await audit(db,req.user,'retry','casting_email',req.params.mailId);res.redirect(303,`/admin/casting-applications/${req.params.id}?saved=1`);
 });
 return router;
}
