import careerContent from '../../shared/careers-content.json' with {type:'json'};
import { saveWithReceipt } from './mail.js';
import {Router} from 'express';
import {tableView} from './admin-tables.js';
import {workflowFilters,followUpOrder,followUpState,workflowReturn,workflowRecordUrl,workflowDetails,workflowChanges,workflowSummary,recordTimeline} from './follow-up.js';
import {rows,audit} from './db.js';
import {canEnquire,rateLimited} from './security.js';
import {mkdir,writeFile,unlink} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import path from 'node:path';
const storage=new URL('../storage/career-resumes/',import.meta.url);
const fail=(ok,message,status=422)=>{if(!ok)throw Object.assign(new Error(message),{status});};
const text=(value,max,required=false)=>{fail(value===undefined||typeof value==='string','Invalid application details.');const result=(value||'').trim();fail(result.length<=max&&(!required||result),'Complete the required application fields.');return result;};
const intakeLabels={general:'General application',internship:'Internship',freelance:'Freelance crew'};
const states=['new','reviewing','shortlisted','rejected'];
export function careersRouter(db){
 const router=Router();
 const staff=(req,res,next)=>canEnquire(req.user)?next():next(Object.assign(new Error('Enquiry staff access required.'),{status:403}));
 router.post('/api/careers/:id/applications',async(req,res)=>{
  const kind=Object.hasOwn(intakeLabels,req.params.id)?req.params.id:'role';
  const b=req.body;
  let role;
  if(kind==='role') {
   fail(/^\d+$/.test(req.params.id),'This opportunity is no longer available.',404);
   role=(await rows(db,'SELECT id,title,metadata FROM cms_entries WHERE id=? AND type="career" AND status="published" AND published_at<=UTC_TIMESTAMP()',[req.params.id]))[0];
   const metadata=role?(typeof role.metadata==='string'?JSON.parse(role.metadata):role.metadata):{};
   fail(role&&!/^sample\b/i.test(role.title)&&!/sample|example/i.test(metadata?.category||''),'This opportunity is no longer available.',404);
  } else {
   const title=text(b.role_title,150,true);
   role={id:null,title:`${intakeLabels[kind]} — ${title}`};
  }
  const team=text(b.team,100,kind!=='role');
  fail(!team||careerContent.teams.some(([name])=>name===team),'Choose a team from the list.');
  fail(!(await rateLimited(db,`career-application:${req.ip}`,5,600)),'Too many applications. Please try again later.',429);
  fail(!b.website,'Please leave the website field empty.');
  const name=text(b.name,100,true),email=text(b.email,254,true),phone=text(b.phone,40,true),city=text(b.city,100),experience=text(b.experience,200),message=text(b.message,8000);
  fail(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),'Enter a valid email address.');fail(b.consent==='true'||b.consent==='on','Accept the application privacy notice.');
  const portfolio=text(b.portfolio_url,1000);if(portfolio){let url;try{url=new URL(portfolio)}catch{fail(false,'Enter a valid HTTPS portfolio URL.')}fail(url.protocol==='https:','Use an HTTPS portfolio URL.');}
  const resume=req.files?.attachment?.[0];fail(resume,'Upload your résumé as a PDF.');fail(resume.mimetype==='application/pdf'&&path.extname(resume.originalname).toLowerCase()==='.pdf'&&resume.buffer.subarray(0,5).toString()==='%PDF-','Upload a PDF résumé, up to 5 MB.');
  const filename=`${randomUUID()}.pdf`;await mkdir(storage,{recursive:true});await writeFile(new URL(filename,storage),resume.buffer,{mode:0o600});
  try{const reference=await saveWithReceipt(db,'application',name,email,connection=>rows(connection,'INSERT INTO career_applications(career_id,career_title,name,email,phone,city,experience,message,resume_filename,resume_name,consent_version,portfolio_url,team,application_type) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[role.id,role.title,name,email,phone,city,experience,message,filename,path.basename(resume.originalname).slice(0,255),'career-application-v2',portfolio,team,kind]));res.status(201).json({reference});}
  catch(error){await unlink(new URL(filename,storage)).catch(()=>{});throw error;}
 });
 router.get('/admin/applications',staff,async(req,res)=>{
  const state=states.includes(req.query.status)?req.query.status:'',search=text(req.query.q,100),workflow=workflowFilters(req.query,req.user.id,'application');
  const base='(?="" OR status=?) AND (name LIKE ? OR email LIKE ? OR career_title LIKE ? OR team LIKE ?)',params=[state,state,...Array(4).fill(`%${search}%`),...workflow.params];
  const where=`WHERE ${base} AND ${workflow.where}`;
  const total=Number((await rows(db,`SELECT COUNT(*) AS total FROM career_applications ${where}`,params))[0].total);
  const summary=await workflowSummary(db,'career_applications',`${base} AND ${workflow.withoutDue}`,params,workflow.active);
  const table=tableView(req,total,{name:'name',opportunity:'career_title',status:'status',received:'created_at',follow_up:followUpOrder('application')},'follow_up',{q:search,status:state,owner:workflow.owner,priority:workflow.priority,due:workflow.due},'asc');const page=table.page;
  const applications=await rows(db,`SELECT id,career_title,name,email,status,created_at,assigned_to,priority,follow_up_at,next_action,(SELECT CONCAT(u.name,IF(u.active=0,' (inactive)','')) FROM cms_users u WHERE u.id=career_applications.assigned_to) AS assigned_name FROM career_applications ${where} ORDER BY ${table.order} LIMIT ${table.limit} OFFSET ${table.offset}`,params);res.render('applications',{applications,total,page,state,search,states,table,workflow,summary,followUpState});
 });
 router.get('/admin/applications/:id',staff,async(req,res)=>{
  const application=(await rows(db,'SELECT * FROM career_applications WHERE id=?',[req.params.id]))[0];fail(application,'Application not found.',404);
  const notes=await rows(db,'SELECT n.*,u.name AS staff_name FROM career_application_notes n LEFT JOIN cms_users u ON u.id=n.user_id WHERE application_id=? ORDER BY n.id DESC',[application.id]);
  const history=await rows(db,'SELECT h.*,u.name AS staff_name FROM career_application_history h LEFT JOIN cms_users u ON u.id=h.user_id WHERE application_id=? ORDER BY h.id DESC',[application.id]);
  const related=await rows(db,'SELECT id,career_title,status,created_at FROM career_applications WHERE email=? ORDER BY id DESC',[application.email]);
  const users=await rows(db,'SELECT id,name,active FROM cms_users WHERE (active=1 AND role IN ("admin","enquiry_manager")) OR id=?',[application.assigned_to||0]);
  const timeline=await recordTimeline(db,'application',application,notes,history,users);
  res.set('Content-Security-Policy',"default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; frame-src 'self'; object-src 'none'; form-action 'self'; frame-ancestors 'none'; base-uri 'self'");
  res.render('application',{application,states,notes,history,related,users,timeline,back:workflowReturn(req.query.return_to,'application'),returnTo:typeof req.query.return_to==='string'?workflowReturn(req.query.return_to,'application'):'',followUp:followUpState(application,'application')});
 });
 router.post('/admin/applications/:id',staff,async(req,res)=>{
  fail(states.includes(req.body.status),'Choose a valid application status.');const note=text(req.body.note,4000);
  const conn=await db.getConnection();try{
   await conn.beginTransaction();const old=(await rows(conn,'SELECT * FROM career_applications WHERE id=? FOR UPDATE',[req.params.id]))[0];fail(old,'Application not found.',404);
   const fields=workflowDetails(req.body,old),changes=workflowChanges(old,fields);
   if(fields.assigned&&fields.assigned!==old.assigned_to)fail((await rows(conn,'SELECT id FROM cms_users WHERE id=? AND active=1 AND role IN ("admin","enquiry_manager")',[fields.assigned])).length,'Choose an active enquiry manager.');
   await rows(conn,'UPDATE career_applications SET status=?,assigned_to=?,priority=?,follow_up_at=?,next_action=? WHERE id=?',[req.body.status,fields.assigned,fields.priority,fields.followUp,fields.nextAction,req.params.id]);
   if(old.status!==req.body.status||Object.keys(changes).length)await rows(conn,'INSERT INTO career_application_history(application_id,user_id,from_status,to_status,changes) VALUES(?,?,?,?,?)',[req.params.id,req.user.id,old.status,req.body.status,JSON.stringify(changes)]);
   if(note)await rows(conn,'UPDATE career_applications SET updated_at=UTC_TIMESTAMP() WHERE id=?',[req.params.id]);
   if(note)await rows(conn,'INSERT INTO career_application_notes(application_id,user_id,note) VALUES(?,?,?)',[req.params.id,req.user.id,note]);
   await audit(conn,req.user,'review','career_application',req.params.id);await conn.commit();
  }catch(error){await conn.rollback();throw error;}finally{conn.release();}
  res.redirect(workflowRecordUrl('application',req.params.id,req.body.return_to,true));
 });
 router.get('/admin/applications/:id/resume/preview',staff,async(req,res)=>{
  const application=(await rows(db,'SELECT resume_filename FROM career_applications WHERE id=?',[req.params.id]))[0];fail(application,'Résumé not found.',404);
  res.set({'X-Frame-Options':'SAMEORIGIN','Content-Security-Policy':"frame-ancestors 'self'; object-src 'none'",'Content-Type':'application/pdf','Content-Disposition':'inline; filename="resume.pdf"','Cache-Control':'private, no-store'});
  res.sendFile(path.join(storage.pathname,application.resume_filename));
 });
 router.get('/admin/applications/:id/resume',staff,async(req,res)=>{const application=(await rows(db,'SELECT resume_filename,resume_name FROM career_applications WHERE id=?',[req.params.id]))[0];fail(application,'Résumé not found.',404);res.download(path.join(storage.pathname,application.resume_filename),application.resume_name);});
 return router;
}
