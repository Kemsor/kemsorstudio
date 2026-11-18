import {Router} from 'express';
import {randomUUID} from 'node:crypto';
import {rows,audit} from './db.js';
import {canEnquire} from './security.js';
import {mailConfiguration} from './mail.js';
import {workflowReturn,workflowRecordUrl} from './follow-up.js';

const resources={
 enquiry:{prefix:'KEM',table:'cms_enquiries',select:'SELECT id,name,email,subject,message FROM cms_enquiries WHERE id=?',back:'/admin/enquiries/'},
 application:{prefix:'APP',table:'career_applications',select:'SELECT id,name,email,career_title AS subject,message FROM career_applications WHERE id=?',back:'/admin/applications/'},
 talent:{prefix:'TAL',table:'talent_enquiries',select:'SELECT e.id,a.name,a.email,e.project AS subject,e.message FROM talent_enquiries e JOIN talent_accounts a ON a.id=e.sender_id WHERE e.id=?',back:'/admin/talent/enquiries'},
};
const fail=(ok,message,status=422)=>{if(!ok)throw Object.assign(new Error(message),{status});};
export function enquiryRepliesRouter(db,env=process.env){
 const router=Router();
 router.use('/admin/replies/:kind/:id',async(req,res,next)=>{
  try{
   const resource=Object.hasOwn(resources,req.params.kind)?resources[req.params.kind]:null;
   fail(resource,'Enquiry not found.',404);
   fail(req.params.kind==='talent'?req.user?.role==='admin':canEnquire(req.user),'Enquiry access required.',403);
   fail(/^[1-9]\d{0,15}$/.test(req.params.id),'Enquiry not found.',404);
   const record=(await rows(db,resource.select,[req.params.id]))[0];fail(record,'Enquiry not found.',404);
   req.reply={resource,record,kind:req.params.kind,reference:`${resource.prefix}-${String(record.id).padStart(6,'0')}`};next();
  }catch(error){next(error);}
 });
 router.get('/admin/replies/:kind/:id',async(req,res)=>{
  const {record,resource,reference,kind}=req.reply;
  const replies=await rows(db,'SELECT subject,body,recipient,status,created_at,sent_at,last_error FROM cms_email_outbox WHERE receipt_key LIKE ? ORDER BY id DESC',[`${reference}-REPLY-%`]);
  const returnTo=kind!=='talent'&&typeof req.query.return_to==='string'?workflowReturn(req.query.return_to,kind):'';
  res.render('enquiry-reply',{record,reference,kind,replies,replyToken:randomUUID(),queued:req.query.queued==='1',configuration:mailConfiguration(env),returnTo,back:kind==='talent'?resource.back:workflowRecordUrl(kind,record.id,returnTo)});
 });
 router.post('/admin/replies/:kind/:id',async(req,res)=>{
  const {record,resource,reference,kind}=req.reply;
  fail(mailConfiguration(env).enabled,'Email delivery is disabled. Ask an administrator to configure the email service.',503);
  const subject=typeof req.body.subject==='string'?req.body.subject.trim():'';
  const message=typeof req.body.message==='string'?req.body.message.trim():'';
  fail(subject.length>0&&subject.length<=200&&!/[\r\n]/.test(subject),'Enter a subject of up to 200 characters on one line.');
  fail(message.length>0&&message.length<=8000,'Enter a reply of up to 8,000 characters.');
  fail(/^[^\s@<>;,]+@[^\s@<>;,]+\.[^\s@<>;,]+$/.test(record.email),'The recorded recipient email address is invalid.');
  fail(typeof req.body.reply_token==='string'&&/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(req.body.reply_token),'Reload the reply form before sending.');
  const key=`${reference}-REPLY-${req.body.reply_token}`;
  const connection=await db.getConnection();
  try{
   await connection.beginTransaction();
   // Serialize replies with personal-data deletion and verify the source still exists.
   const locked=await rows(connection,`SELECT id FROM ${resource.table} WHERE id=? FOR UPDATE`,[record.id]);fail(locked.length,'Enquiry not found.',404);
   const existing=(await rows(connection,'SELECT id,subject,body FROM cms_email_outbox WHERE receipt_key=?',[key]))[0];
   if(existing)fail(existing.subject===subject&&existing.body===message,'This reply form has already been used. Reload it to write another reply.',409);
   else{
    const result=await rows(connection,'INSERT INTO cms_email_outbox(receipt_key,recipient,subject,body,available_at) VALUES(?,?,?,?,UTC_TIMESTAMP())',[key,record.email,subject,message]);
    await audit(connection,req.user,'queue_email_reply',kind,record.id);
    await audit(connection,req.user,'compose_reply','email',result.insertId);
   }
   await connection.commit();
  }catch(error){await connection.rollback();throw error;}finally{connection.release();}
  const query=new URLSearchParams({queued:'1'});const returnTo=req.body.return_to||req.query.return_to;if(kind!=='talent'&&returnTo)query.set('return_to',workflowReturn(returnTo,kind));
  res.redirect(303,`/admin/replies/${kind}/${record.id}?${query}`);
 });
 return router;
}
