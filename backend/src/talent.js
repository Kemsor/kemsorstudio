import { Router } from 'express';
import {tableView} from './admin-tables.js';
import { rows, json, audit } from './db.js';
import { hashPassword, verifyPassword, rateLimited, token } from './security.js';
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
const storage=new URL('../storage/uploads/',import.meta.url);
const fail=(ok,message,status=422)=>{if(!ok)throw Object.assign(new Error(message),{status});};
const value=(v,max=500)=>{fail(v===undefined || typeof v==='string','Invalid field.');const t=(v||'').trim();fail(t.length<=max,`Use at most ${max} characters.`);return t;};
const fields='id,name,role,status,city,profession,languages,skills,organisation,bio,credits,availability,showreel,image_id,visible,contact_checked';
const publicFields='id,name,city,profession,languages,skills,bio,credits,availability,showreel,image_id';
const save=req=>new Promise((resolve,reject)=>req.session.save(e=>e?reject(e):resolve()));
const renew=req=>new Promise((resolve,reject)=>req.session.regenerate(e=>e?reject(e):resolve()));
export function talentRouter(db,{imageKind}){
 const router=Router();
 router.use(async(req,res,next)=>{try{req.member=req.session.memberId?(await rows(db,`SELECT ${fields},email FROM talent_accounts WHERE id=? AND status!='suspended'`,[req.session.memberId]))[0]:null;next();}catch(e){next(e);}});
 const member=(req,res,next)=>req.member?next():next(Object.assign(new Error('Sign in to continue.'),{status:401}));
 const hirer=(req,res,next)=>req.member?.role==='hirer'&&req.member.status==='approved'&&req.member.contact_checked?next():next(Object.assign(new Error('An approved hirer account with checked contact details is required.'),{status:403}));
 router.get('/api/talent/session',(req,res)=>res.json({user:req.member||null,analysisAvailable:false}));
 router.post('/api/talent/register',async(req,res)=>{
  fail(!(await rateLimited(db,`talent-register:${req.ip}`,5,3600)),'Too many registrations. Try later.',429);
  const b=req.body,name=value(b.name,100),email=value(b.email,254).toLowerCase(),password=value(b.password,200);
  fail(name&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),'Enter your name and a valid email.');fail(['artist','hirer'].includes(b.role),'Choose Artist or Casting Director / Producer.');fail(password.length>=12,'Use a password of at least 12 characters.');fail(b.consent===true,'Accept profile processing to register.');fail(b.adult===true,'Registration is currently available to people aged 18 or over.');
  const result=await rows(db,'INSERT INTO talent_accounts(name,email,password_hash,role) VALUES(?,?,?,?)',[name,email,await hashPassword(password),b.role]);
  await audit(db,null,'register','talent',result.insertId);await renew(req);req.session.memberId=result.insertId;req.session.csrf=token();await save(req);res.status(201).json({ok:true});
 });
 router.post('/api/talent/login',async(req,res)=>{
  const email=value(req.body.email,254).toLowerCase();fail(!(await rateLimited(db,`talent-login:${req.ip}`,25,900))&&!(await rateLimited(db,`talent-email:${email}`,10,900)),'Too many attempts. Try again in 15 minutes.',429);
  const user=(await rows(db,'SELECT id,password_hash,status FROM talent_accounts WHERE email=?',[email]))[0];const valid=await verifyPassword(value(req.body.password,200),user?.password_hash||await hashPassword('invalid-account-dummy'));
  fail(user&&valid&&user.status!=='suspended','Email or password is incorrect.',401);await audit(db,null,'member_login','talent',user.id);await renew(req);req.session.memberId=user.id;req.session.csrf=token();await save(req);res.json({ok:true});
 });
 router.post('/api/talent/logout',member,async(req,res)=>{await audit(db,null,'member_logout','talent',req.member.id);delete req.session.memberId;req.session.csrf=token();await save(req);res.json({ok:true});});
 router.post('/api/talent/profile',member,async(req,res)=>{
  const b=req.body,showreel=value(b.showreel,500);if(showreel){let u;try{u=new URL(showreel);}catch{}fail(u?.protocol==='https:'&&!u.username&&!u.password,'Use an HTTPS portfolio or showreel URL.');}
  const data=[value(b.name,100),value(b.city,100),value(b.profession,100),value(b.languages,300),value(b.skills,500),value(b.organisation,150),value(b.bio,3000),value(b.credits,3000),value(b.availability,300),showreel,b.visible===true?1:0];fail(data[0],'Name is required.');
  await rows(db,"UPDATE talent_accounts SET name=?,city=?,profession=?,languages=?,skills=?,organisation=?,bio=?,credits=?,availability=?,showreel=?,visible=?,status='pending' WHERE id=?",[...data,req.member.id]);await audit(db,null,'profile_update','talent',req.member.id);res.json({ok:true,message:'Profile saved and submitted for review.'});
 });
 router.post('/api/talent/photo',member,async(req,res)=>{
  const file=req.files?.image?.[0];fail(file,'Choose a portrait photo.');const kind=imageKind(file);fail(kind,'Use a valid PNG, JPEG or WebP photo.');await mkdir(storage,{recursive:true});const filename=`${randomUUID()}.${kind[0]}`;await writeFile(new URL(filename,storage),file.buffer,{mode:0o600});
  try{const result=await rows(db,'INSERT INTO cms_media(filename,original_name,mime,size,alt,created_by) VALUES(?,?,?,?,?,NULL)',[filename,path.basename(file.originalname).slice(0,255),kind[1],file.size,`${req.member.name} portfolio portrait`]);await rows(db,"UPDATE talent_accounts SET image_id=?,status='pending' WHERE id=?",[result.insertId,req.member.id]);res.json({ok:true});}catch(e){await unlink(new URL(filename,storage)).catch(()=>{});throw e;}
 });
 router.get('/api/talent',async(req,res)=>{
  const q=value(req.query.q,100),city=value(req.query.city,100),profession=value(req.query.profession,100),language=value(req.query.language,100);const page=Math.max(1,Math.min(100,Number(req.query.page)||1));
  const people=await rows(db,`SELECT ${publicFields} FROM talent_accounts WHERE role='artist' AND status='approved' AND contact_checked=1 AND visible=1 AND (name LIKE ? OR skills LIKE ?) AND city LIKE ? AND profession LIKE ? AND languages LIKE ? ORDER BY updated_at DESC LIMIT 24 OFFSET ${(page-1)*24}`,[`%${q}%`,`%${q}%`,`%${city}%`,`%${profession}%`,`%${language}%`]);res.json({people,page});
 });
 router.get('/api/talent/person/:id',async(req,res)=>{const p=(await rows(db,`SELECT ${publicFields} FROM talent_accounts WHERE id=? AND role='artist' AND status='approved' AND contact_checked=1 AND visible=1`,[req.params.id]))[0];fail(p,'Profile not found.',404);res.json({person:p});});
 router.get('/api/talent/workspace',member,async(req,res)=>{
  const saved=req.member.role==='hirer'?await rows(db,`SELECT a.${publicFields.replaceAll(',',',a.')} FROM talent_shortlists s JOIN talent_accounts a ON a.id=s.artist_id WHERE s.account_id=? AND a.status='approved' AND a.visible=1 AND a.contact_checked=1`,[req.member.id]):[];
  const enquiries=await rows(db,'SELECT e.id,e.project,e.message,e.status,e.created_at,a.name AS other_name FROM talent_enquiries e JOIN talent_accounts a ON a.id=IF(e.sender_id=?,e.artist_id,e.sender_id) WHERE e.sender_id=? OR e.artist_id=? ORDER BY e.id DESC',[req.member.id,req.member.id,req.member.id]);res.json({saved,enquiries});
 });
 router.post('/api/talent/shortlists/:id',member,hirer,async(req,res)=>{const p=await rows(db,"SELECT id FROM talent_accounts WHERE id=? AND role='artist' AND status='approved' AND contact_checked=1 AND visible=1",[req.params.id]);fail(p.length,'Profile not available.',404);if(req.body.remove)await rows(db,'DELETE FROM talent_shortlists WHERE account_id=? AND artist_id=?',[req.member.id,req.params.id]);else await rows(db,'INSERT IGNORE INTO talent_shortlists(account_id,artist_id) VALUES(?,?)',[req.member.id,req.params.id]);res.json({ok:true});});
 router.post('/api/talent/enquiries',member,hirer,async(req,res)=>{fail(!(await rateLimited(db,`talent-enquiry:${req.member.id}`,10,3600)),'Too many enquiries. Try later.',429);const artist=await rows(db,"SELECT id FROM talent_accounts WHERE id=? AND role='artist' AND status='approved' AND contact_checked=1 AND visible=1",[req.body.artistId]);fail(artist.length,'Profile not available.',404);const project=value(req.body.project,200),message=value(req.body.message,4000);fail(project&&message,'Add a project title and message.');await rows(db,'INSERT INTO talent_enquiries(sender_id,artist_id,project,message) VALUES(?,?,?,?)',[req.member.id,req.body.artistId,project,message]);res.status(201).json({ok:true});});
 router.post('/api/talent/enquiries/:id',member,async(req,res)=>{fail(['interested','declined'].includes(req.body.status),'Choose a valid response.');const result=await rows(db,'UPDATE talent_enquiries SET status=? WHERE id=? AND artist_id=?',[req.body.status,req.params.id,req.member.id]);fail(result.affectedRows,'Enquiry not found.',404);res.json({ok:true});});
 const administrator=(req,res,next)=>req.user?.role==='admin'?next():next(Object.assign(new Error('Administrator access required.'),{status:403}));
 router.get('/admin/talent',administrator,async(req,res)=>{
  const search=value(req.query.q,100),state=['pending','approved','suspended'].includes(req.query.status)?req.query.status:'',role=['artist','hirer'].includes(req.query.role)?req.query.role:'';
  const where="WHERE (?='' OR status=?) AND (?='' OR role=?) AND (name LIKE ? OR email LIKE ? OR city LIKE ?)",params=[state,state,role,role,...Array(3).fill(`%${search}%`)];
  const total=Number((await rows(db,`SELECT COUNT(*) AS total FROM talent_accounts ${where}`,params))[0].total);
  const table=tableView(req,total,{name:'name',email:'email',role:'role',city:'city',status:'status',registered:'id'},'registered',{q:search,status:state,role});
  const accounts=await rows(db,`SELECT ${fields},email,created_at FROM talent_accounts ${where} ORDER BY ${table.order} LIMIT ${table.limit} OFFSET ${table.offset}`,params);
  res.render('talent',{accounts,search,state,role,page:table.page,total,table});
 });
 router.get('/admin/talent/enquiries',administrator,async(req,res)=>{
  const enquiries=await rows(db,'SELECT e.*,s.name AS sender,a.name AS artist FROM talent_enquiries e JOIN talent_accounts s ON s.id=e.sender_id JOIN talent_accounts a ON a.id=e.artist_id ORDER BY e.id DESC LIMIT 200');
  res.render('member-workspace',{section:'enquiries',enquiries,projects:[]});
 });
 router.get('/admin/talent/projects',administrator,async(req,res)=>{
  const projects=await rows(db,'SELECT p.id,p.title,p.budget,p.currency,p.language,p.timeline,p.updated_at,a.name,a.id AS account_id FROM production_projects p JOIN talent_accounts a ON a.id=p.account_id ORDER BY p.id DESC LIMIT 200');
  res.render('member-workspace',{section:'projects',projects,enquiries:[]});
 });
 router.get('/admin/talent/:id',administrator,async(req,res)=>{
  const account=(await rows(db,`SELECT ${fields},email,created_at FROM talent_accounts WHERE id=?`,[req.params.id]))[0];fail(account,'Member not found.',404);res.render('talent-detail',{account});
 });
 router.post('/admin/talent/:id',administrator,async(req,res)=>{
  fail(['pending','approved','suspended'].includes(req.body.status),'Choose a valid status.');fail(req.body.status!=='approved'||req.body.contact_checked==='on','Check contact details before approval.');
  fail((await rows(db,'SELECT id FROM talent_accounts WHERE id=?',[req.params.id])).length,'Registration not found.',404);
  await rows(db,'UPDATE talent_accounts SET status=?,contact_checked=? WHERE id=?',[req.body.status,req.body.contact_checked==='on'?1:0,req.params.id]);
  if(req.body.status==='suspended')await rows(db,"DELETE FROM cms_sessions WHERE JSON_EXTRACT(data,'$.memberId')=?",[Number(req.params.id)]);
  await audit(db,req.user,'review','talent',req.params.id);res.redirect(`/admin/talent/${req.params.id}?saved=1`);
 });
 router.use('/api/production',member,(req,res,next)=>req.member.role==='hirer'?next():next(Object.assign(new Error('Production planning is available to casting directors and producers.'),{status:403})));
 router.get('/api/production/projects',member,async(req,res)=>res.json({projects:await rows(db,'SELECT id,title,budget,currency,language,timeline,updated_at FROM production_projects WHERE account_id=? ORDER BY id DESC',[req.member.id])}));
 router.get('/api/production/projects/:id',member,async(req,res)=>{const p=(await rows(db,'SELECT * FROM production_projects WHERE id=? AND account_id=?',[req.params.id,req.member.id]))[0];fail(p,'Project not found.',404);delete p.script_filename;res.json({project:{...p,plan:json(p.plan)},analysisAvailable:false});});
 router.post('/api/production/projects',member,async(req,res)=>{fail(!(await rateLimited(db,`production-create:${req.member.id}`,20,3600)),'Too many projects. Try later.',429);const b=req.body,title=value(b.title,200);fail(title,'Project title is required.');const budget=Number(b.budget||0);fail(Number.isFinite(budget)&&budget>=0&&budget<=999999999999,'Enter a valid budget.');const currency=value(b.currency,3)||'INR';fail(/^[A-Z]{3}$/.test(currency),'Choose a 3-letter currency.');const script=value(b.script_text,60000),plan=JSON.stringify({breakdown:'',timeline:'',cast:'',crew:'',budget:'',locations:'',notes:''});const r=await rows(db,'INSERT INTO production_projects(account_id,title,budget,currency,language,timeline,goals,script_text,plan) VALUES(?,?,?,?,?,?,?,?,?)',[req.member.id,title,budget,currency,value(b.language,100),value(b.timeline,500),value(b.goals,3000),script,plan]);res.status(201).json({id:r.insertId});});
 router.post('/api/production/projects/:id/plan',member,async(req,res)=>{const plan={};for(const key of ['breakdown','timeline','cast','crew','budget','locations','notes'])plan[key]=value(req.body[key],8000);const r=await rows(db,'UPDATE production_projects SET plan=? WHERE id=? AND account_id=?',[JSON.stringify(plan),req.params.id,req.member.id]);fail(r.affectedRows,'Project not found.',404);res.json({ok:true});});
 router.post('/api/production/projects/:id/script',member,async(req,res)=>{const project=(await rows(db,'SELECT script_filename FROM production_projects WHERE id=? AND account_id=?',[req.params.id,req.member.id]))[0];fail(project,'Project not found.',404);const file=req.files?.attachment?.[0];fail(file,'Choose a PDF, DOCX or text script.');const ext=path.extname(file.originalname).toLowerCase();fail((ext==='.pdf'&&file.buffer.subarray(0,5).toString()==='%PDF-')||(ext==='.docx'&&file.buffer.subarray(0,2).toString()==='PK')||(ext==='.txt'&&!file.buffer.includes(0)),'Choose a valid PDF, DOCX or text file.');const filename=`${randomUUID()}${ext}`;await mkdir(storage,{recursive:true});await writeFile(new URL(filename,storage),file.buffer,{mode:0o600});try{await rows(db,'UPDATE production_projects SET script_filename=?,script_name=?,script_text=? WHERE id=? AND account_id=?',[filename,path.basename(file.originalname).slice(0,255),ext==='.txt'?file.buffer.toString('utf8').slice(0,60000):null,req.params.id,req.member.id]);}catch(e){await unlink(new URL(filename,storage)).catch(()=>{});throw e;}if(project.script_filename)await unlink(new URL(project.script_filename,storage)).catch(()=>{});res.json({ok:true});});
 router.get('/api/production/projects/:id/script',member,async(req,res)=>{const p=(await rows(db,'SELECT script_filename,script_name FROM production_projects WHERE id=? AND account_id=?',[req.params.id,req.member.id]))[0];fail(p?.script_filename,'Script not found.',404);res.download(path.join(storage.pathname,p.script_filename),p.script_name);});
 return router;
}
