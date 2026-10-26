import { saveWithReceipt } from './mail.js';
import {Router} from 'express';
import {tableView} from './admin-tables.js';
import {rows,audit} from './db.js';
import {canEnquire,rateLimited} from './security.js';
import {mkdir,writeFile,unlink} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import path from 'node:path';
const storage=new URL('../storage/career-resumes/',import.meta.url);
const fail=(ok,message,status=422)=>{if(!ok)throw Object.assign(new Error(message),{status});};
const text=(value,max,required=false)=>{fail(value===undefined||typeof value==='string','Invalid application details.');const result=(value||'').trim();fail(result.length<=max&&(!required||result),'Complete the required application fields.');return result;};
const states=['new','reviewing','shortlisted','rejected'];
export function careersRouter(db){
 const router=Router();
 const staff=(req,res,next)=>canEnquire(req.user)?next():next(Object.assign(new Error('Enquiry staff access required.'),{status:403}));
 router.post('/api/careers/:id/applications',async(req,res)=>{
  const role=(await rows(db,'SELECT id,title FROM cms_entries WHERE id=? AND type="career" AND status="published" AND published_at<=UTC_TIMESTAMP()',[req.params.id]))[0];fail(role,'This opportunity is no longer available.',404);
  fail(!(await rateLimited(db,`career-application:${req.ip}`,5,600)),'Too many applications. Please try again later.',429);
  const b=req.body;fail(!b.website,'Please leave the website field empty.');
  const name=text(b.name,100,true),email=text(b.email,254,true),phone=text(b.phone,40,true),city=text(b.city,100),experience=text(b.experience,200),message=text(b.message,8000);
  fail(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),'Enter a valid email address.');fail(b.consent==='true'||b.consent==='on','Accept the application privacy notice.');
  const resume=req.files?.attachment?.[0];fail(resume,'Upload your résumé as a PDF.');fail(resume.mimetype==='application/pdf'&&path.extname(resume.originalname).toLowerCase()==='.pdf'&&resume.buffer.subarray(0,5).toString()==='%PDF-','Upload a PDF résumé, up to 5 MB.');
  const filename=`${randomUUID()}.pdf`;await mkdir(storage,{recursive:true});await writeFile(new URL(filename,storage),resume.buffer,{mode:0o600});
  try{const reference=await saveWithReceipt(db,'application',name,email,connection=>rows(connection,'INSERT INTO career_applications(career_id,career_title,name,email,phone,city,experience,message,resume_filename,resume_name,consent_version) VALUES(?,?,?,?,?,?,?,?,?,?,?)',[role.id,role.title,name,email,phone,city,experience,message,filename,path.basename(resume.originalname).slice(0,255),'career-application-v1']));res.status(201).json({reference});}
  catch(error){await unlink(new URL(filename,storage)).catch(()=>{});throw error;}
 });
 router.get('/admin/applications',staff,async(req,res)=>{
  const state=states.includes(req.query.status)?req.query.status:'';const search=text(req.query.q,100);
  const where='WHERE (?="" OR status=?) AND (name LIKE ? OR email LIKE ? OR career_title LIKE ?)';const params=[state,state,...Array(3).fill(`%${search}%`)];
  const total=Number((await rows(db,`SELECT COUNT(*) AS total FROM career_applications ${where}`,params))[0].total);
  const table=tableView(req,total,{name:'name',opportunity:'career_title',status:'status',received:'created_at'},'received',{q:search,status:state});const page=table.page;
  const applications=await rows(db,`SELECT id,career_title,name,email,status,created_at FROM career_applications ${where} ORDER BY ${table.order} LIMIT ${table.limit} OFFSET ${table.offset}`,params);res.render('applications',{applications,total,page,state,search,states,table});
 });
 router.get('/admin/applications/:id',staff,async(req,res)=>{
  const application=(await rows(db,'SELECT * FROM career_applications WHERE id=?',[req.params.id]))[0];fail(application,'Application not found.',404);
  const notes=await rows(db,'SELECT n.*,u.name AS staff_name FROM career_application_notes n LEFT JOIN cms_users u ON u.id=n.user_id WHERE application_id=? ORDER BY n.id DESC',[application.id]);
  const history=await rows(db,'SELECT h.*,u.name AS staff_name FROM career_application_history h LEFT JOIN cms_users u ON u.id=h.user_id WHERE application_id=? ORDER BY h.id DESC',[application.id]);
  const related=await rows(db,'SELECT id,career_title,status,created_at FROM career_applications WHERE email=? ORDER BY id DESC',[application.email]);
  res.set('Content-Security-Policy',"default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; frame-src 'self'; object-src 'none'; form-action 'self'; frame-ancestors 'none'; base-uri 'self'");
  res.render('application',{application,states,notes,history,related});
 });
 router.post('/admin/applications/:id',staff,async(req,res)=>{
  fail(states.includes(req.body.status),'Choose a valid application status.');const note=text(req.body.note,4000);
  const conn=await db.getConnection();try{
   await conn.beginTransaction();const old=(await rows(conn,'SELECT status FROM career_applications WHERE id=? FOR UPDATE',[req.params.id]))[0];fail(old,'Application not found.',404);
   if(old.status!==req.body.status){await rows(conn,'UPDATE career_applications SET status=? WHERE id=?',[req.body.status,req.params.id]);await rows(conn,'INSERT INTO career_application_history(application_id,user_id,from_status,to_status) VALUES(?,?,?,?)',[req.params.id,req.user.id,old.status,req.body.status]);}
   if(note)await rows(conn,'INSERT INTO career_application_notes(application_id,user_id,note) VALUES(?,?,?)',[req.params.id,req.user.id,note]);
   await audit(conn,req.user,'review','career_application',req.params.id);await conn.commit();
  }catch(error){await conn.rollback();throw error;}finally{conn.release();}
  res.redirect(`/admin/applications/${req.params.id}?saved=1`);
 });
 router.get('/admin/applications/:id/resume/preview',staff,async(req,res)=>{
  const application=(await rows(db,'SELECT resume_filename FROM career_applications WHERE id=?',[req.params.id]))[0];fail(application,'Résumé not found.',404);
  res.set({'X-Frame-Options':'SAMEORIGIN','Content-Security-Policy':"frame-ancestors 'self'; object-src 'none'",'Content-Type':'application/pdf','Content-Disposition':'inline; filename="resume.pdf"','Cache-Control':'private, no-store'});
  res.sendFile(path.join(storage.pathname,application.resume_filename));
 });
 router.get('/admin/applications/:id/resume',staff,async(req,res)=>{const application=(await rows(db,'SELECT resume_filename,resume_name FROM career_applications WHERE id=?',[req.params.id]))[0];fail(application,'Résumé not found.',404);res.download(path.join(storage.pathname,application.resume_filename),application.resume_name);});
 return router;
}
