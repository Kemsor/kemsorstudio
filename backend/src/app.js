import express from 'express';
import session from 'express-session';
import multer from 'multer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, writeFile, unlink, readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { rows, json, settings, audit } from './db.js';
import { token, hashPassword, verifyPassword, canEdit, canEnquire, csrfValid, MysqlSessionStore, rateLimited } from './security.js';
import { notifications, dashboard } from './dashboard.js';
import { talentRouter } from './talent.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const types = { news:'Newsroom', blog:'Blog', career:'Careers', team:'Leadership & team', home:'Homepage & promotions', page:'Page content', legal:'Legal centre' };
export const categories = { business:'Business', partnerships:'Partnerships / co-production / distribution / brands', press:'Press & media', careers:'Careers / work with us', production:'Production / service partners', copyright:'Copyright / anti-piracy', general:'General / other' };
export const statuses = ['new','in_review','contacted','closed','spam'];
const text = (value, max, label, required = false) => {
  const result = typeof value === 'string' ? value.trim() : '';
  if ((required && !result) || result.length > max) throw Object.assign(new Error(`${label} is required and must be at most ${max} characters.`), { status:422 });
  return result;
};
const ensure = (value, message, status=422) => { if (!value) throw Object.assign(new Error(message), { status }); };
const saveSession = req => new Promise((resolve,reject) => req.session.save(error => error ? reject(error) : resolve()));
const regenerate = req => new Promise((resolve,reject) => req.session.regenerate(error => error ? reject(error) : resolve()));
export function imageKind(file) {
  const b=file.buffer;
  if(b.length>8 && b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) && file.mimetype==='image/png')return ['png','image/png'];
  if(b.length>3 && b[0]===255 && b[1]===216 && b[2]===255 && file.mimetype==='image/jpeg')return ['jpg','image/jpeg'];
  if(b.length>12 && b.subarray(0,4).toString()==='RIFF' && b.subarray(8,12).toString()==='WEBP' && file.mimetype==='image/webp')return ['webp','image/webp'];
  return null;
}
async function fileSave(file, extension) {
  await mkdir(path.join(root,'storage/uploads'), { recursive:true });
  const filename=`${randomUUID()}.${extension}`;
  await writeFile(path.join(root,'storage/uploads',filename),file.buffer,{mode:0o600});
  return filename;
}
export function createApp(db, options={}) {
  const app=express();
  app.disable('x-powered-by');
  if(process.env.TRUST_PROXY==='true')app.set('trust proxy',1);
  app.set('view engine','ejs'); app.set('views',path.join(root,'views'));
  app.use((req,res,next)=>{
    res.set({'X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'same-origin','Permissions-Policy':'camera=(), microphone=(), geolocation=()','Content-Security-Policy':"default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'self'"});
    if(req.path.startsWith('/admin') || req.path.startsWith('/api/'))res.set('Cache-Control','no-store');
    next();
  });
  app.use(express.static(path.join(root,'public'),{maxAge:'1h'}));
  app.use(express.urlencoded({extended:false,limit:'100kb'}));app.use(express.json({limit:'100kb'}));
  ensure((process.env.SESSION_SECRET || '').length>=32,'Set a random SESSION_SECRET of at least 32 characters.',500);
  app.use(session({name:options.cookieName || 'kemsor.cms',secret:process.env.SESSION_SECRET,store:new MysqlSessionStore(db),resave:false,saveUninitialized:false,rolling:true,cookie:{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',maxAge:60*60*1000}}));
  app.use(async(req,res,next)=>{
    try {
      req.user=req.session.userId ? (await rows(db,'SELECT id,name,email,role,active FROM cms_users WHERE id=? AND active=1',[req.session.userId]))[0] : null;
      if(req.path.startsWith('/admin') || req.path==='/api/csrf')req.session.csrf ||= token();
      res.locals={...res.locals,user:req.user,csrf:req.session.csrf,types,categories,statuses,websiteUrl:process.env.WEBSITE_URL || 'http://127.0.0.1:3007',title:'Kemsor CMS',saved:req.query.saved==='1',currentPath:req.path,currentType:req.query.type || '',notifications:[],unreadCount:0};
      if(req.path.startsWith('/admin') && req.path!=='/admin/login' && !req.user)return res.redirect('/admin/login');
      if(req.user && req.path.startsWith('/admin') && req.method==='GET'){
        res.locals.notifications=await notifications(db,req.user);
        res.locals.unreadCount=res.locals.notifications.filter(n=>!n.read).length;
      }
      next();
    }catch(error){next(error);}
  });
  const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:5*1024*1024,files:1,fields:25,fieldSize:70000}}).fields([{name:'image',maxCount:1},{name:'attachment',maxCount:1}]);
  app.use((req,res,next)=>req.is('multipart/form-data') ? upload(req,res,next) : next());
  app.use((req,res,next)=>{
    if(!['POST','PUT','PATCH','DELETE'].includes(req.method))return next();
    if(req.headers.origin){
      const allowed=new Set([process.env.WEBSITE_URL || 'http://127.0.0.1:3007',`${req.protocol}://${req.get('host')}`]);
      if(!allowed.has(req.headers.origin))return next(Object.assign(new Error('Request origin is not allowed.'),{status:403}));
    }
    if(!csrfValid(req.session.csrf,req.get('X-CSRF-Token') || req.body?._csrf))return next(Object.assign(new Error('Your session expired. Reload the form and try again.'),{status:403}));
    next();
  });
  const admin=(req,res,next)=>req.user?.role==='admin' ? next() : next(Object.assign(new Error('Administrator access required.'),{status:403}));
  const editor=(req,res,next)=>canEdit(req.user) ? next() : next(Object.assign(new Error('Publishing access required.'),{status:403}));
  const manager=(req,res,next)=>canEnquire(req.user) ? next() : next(Object.assign(new Error('Enquiry access required.'),{status:403}));
  app.get('/health',async(req,res)=>{await rows(db,'SELECT 1');res.json({status:'ok',service:'Kemsor Phase 1 CMS'});});
  app.get('/',(req,res)=>res.redirect('/admin'));
  app.get('/admin/login',(req,res)=>req.user ? res.redirect('/admin') : res.render('login',{error:null}));
  app.post('/admin/login',async(req,res)=>{
    const email=text(req.body.email,254,'Email',true).toLowerCase();
    if(await rateLimited(db,`login:${req.ip}:${email}`,5,900) || await rateLimited(db,`login-ip:${req.ip}`,30,900))return res.status(429).render('login',{error:'Too many attempts. Try again in 15 minutes.'});
    const user=(await rows(db,'SELECT * FROM cms_users WHERE email=? AND active=1',[email]))[0];
    const valid=await verifyPassword(typeof req.body.password==='string' ? req.body.password : '', user?.password_hash || options.dummyHash);
    if(!user || !valid)return res.status(401).render('login',{error:'Email or password is incorrect.'});
    await regenerate(req);req.session.userId=user.id;req.session.csrf=token();await saveSession(req);
    await audit(db,user,'login','user',user.id);res.redirect('/admin');
  });
  app.post('/admin/logout',async(req,res)=>{await new Promise((resolve,reject)=>req.session.destroy(e=>e?reject(e):resolve()));res.clearCookie(options.cookieName || 'kemsor.cms');res.redirect('/admin/login');});
  app.get('/admin',async(req,res)=>{
    res.render('dashboard',await dashboard(db,req.user));
  });
  app.get('/admin/notifications.json',(req,res)=>res.json({items:res.locals.notifications,unread:res.locals.unreadCount}));
  app.get('/admin/notifications',(req,res)=>res.render('notifications'));
  app.post('/admin/notifications/read',async(req,res)=>{
    const items=await notifications(db,req.user);
    const selected=req.body.key==='all' ? items : items.filter(item=>item.key===req.body.key);
    ensure(selected.length || req.body.key==='all','Notification not found.',404);
    for(const item of selected)await rows(db,'INSERT IGNORE INTO cms_notification_reads(user_id,notification_key) VALUES(?,?)',[req.user.id,item.key]);
    res.redirect('/admin/notifications');
  });
  app.get('/admin/content',editor,async(req,res)=>{
    const type=req.query.type==='all' ? 'all' : Object.hasOwn(types,req.query.type) ? req.query.type : 'news';
    const state=['draft','published','archived'].includes(req.query.status) ? req.query.status : '';
    const search=text(req.query.q,100,'Search');
    const entries=await rows(db,'SELECT id,type,title,slug,status,updated_at FROM cms_entries WHERE (?="all" OR type=?) AND (?="" OR status=?) AND title LIKE ? ORDER BY updated_at DESC LIMIT 200',[type,type,state,state,`%${search}%`]);
    res.render('content',{entries,type,state,search});
  });
  app.get('/admin/content/new',editor,async(req,res)=>res.render('edit',{entry:{type:Object.hasOwn(types,req.query.type)?req.query.type:'news',status:'draft',metadata:{}},media:await rows(db,'SELECT * FROM cms_media ORDER BY id DESC LIMIT 200')}));
  app.get('/admin/content/:id',editor,async(req,res)=>{
    const entry=(await rows(db,'SELECT * FROM cms_entries WHERE id=?',[req.params.id]))[0];ensure(entry,'Content not found.',404);entry.metadata=json(entry.metadata);
    res.render('edit',{entry,media:await rows(db,'SELECT * FROM cms_media ORDER BY id DESC LIMIT 200')});
  });
  app.post('/admin/content/save',editor,async(req,res)=>{
    const b=req.body,type=b.type;ensure(Object.hasOwn(types,type),'Choose a valid content area.');
    const title=text(b.title,200,'Title',true),slug=text(b.slug,190,'Slug',true);ensure(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug),'Use lowercase letters, numbers and hyphens in the slug.');
    const summary=text(b.summary,2000,'Summary'),body=text(b.body,60000,'Body');ensure(['draft','published','archived'].includes(b.status),'Choose a valid publishing status.');
    const metadata={};for(const key of ['category','role','location','page','seo_title','seo_description'])metadata[key]=text(b[key],key==='seo_description'?300:200,key);
    if(['page','legal'].includes(type))ensure(['home','about','services','projects','news','blog','careers','contact','legal'].includes(metadata.page),'Choose a valid page.');
    const imageId=b.image_id ? Number(b.image_id) : null;
    if(imageId)ensure((await rows(db,'SELECT id FROM cms_media WHERE id=?',[imageId])).length,'Selected image does not exist.');
    const id=b.id ? Number(b.id) : null;
    if(id){const old=(await rows(db,'SELECT type FROM cms_entries WHERE id=?',[id]))[0];ensure(old,'Content not found.',404);ensure(old.type===type,'Content area cannot be changed.');}
    const values=[title,slug,summary,body,imageId,JSON.stringify(metadata),b.status,b.status==='published'?new Date():null,req.user.id];
    let result;
    if(id)result=await rows(db,'UPDATE cms_entries SET title=?,slug=?,summary=?,body=?,image_id=?,metadata=?,status=?,published_at=?,updated_by=? WHERE id=?',[...values,id]);
    else result=await rows(db,'INSERT INTO cms_entries(title,slug,summary,body,image_id,metadata,status,published_at,updated_by,type,created_by) VALUES(?,?,?,?,?,?,?,?,?,?,?)',[...values,type,req.user.id]);
    await audit(db,req.user,b.status==='published'?'publish':'save','content',id || result.insertId);
    res.redirect(`/admin/content?type=${type}&saved=1`);
  });
  app.post('/admin/content/:id/archive',editor,async(req,res)=>{
    await rows(db,'UPDATE cms_entries SET status="archived",updated_by=? WHERE id=?',[req.user.id,req.params.id]);await audit(db,req.user,'archive','content',req.params.id);res.redirect('/admin/content?saved=1');
  });
  app.get('/admin/media',editor,async(req,res)=>res.render('media',{media:await rows(db,'SELECT * FROM cms_media ORDER BY id DESC LIMIT 200')}));
  app.post('/admin/media',editor,async(req,res)=>{
    const file=req.files?.image?.[0];ensure(file,'Choose an image.');const kind=imageKind(file);ensure(kind,'Only valid PNG, JPEG and WebP images are allowed.');
    const alt=text(req.body.alt,300,'Alternative text',true),filename=await fileSave(file,kind[0]);
    try{const result=await rows(db,'INSERT INTO cms_media(filename,original_name,mime,size,alt,created_by) VALUES(?,?,?,?,?,?)',[filename,path.basename(file.originalname).slice(0,255),kind[1],file.size,alt,req.user.id]);await audit(db,req.user,'upload','media',result.insertId);}catch(error){await unlink(path.join(root,'storage/uploads',filename));throw error;}
    res.redirect('/admin/media?saved=1');
  });
  app.get('/media/:id',async(req,res)=>{
    const owner=(await rows(db,'SELECT id,status,visible,contact_checked FROM talent_accounts WHERE image_id=?',[req.params.id]))[0];
    if(owner && !(owner.status==='approved' && owner.visible && owner.contact_checked) && req.session.memberId!==owner.id && req.user?.role!=='admin')return res.status(404).end();
    const image=(await rows(db,'SELECT filename,mime FROM cms_media WHERE id=?',[req.params.id]))[0];ensure(image,'Image not found.',404);
    res.set({'Content-Type':image.mime,'Cache-Control':owner?'private, no-store':'public, max-age=86400'});res.sendFile(path.join(root,'storage/uploads',image.filename));
  });
  app.get('/admin/enquiries',manager,async(req,res)=>{
    const state=statuses.includes(req.query.status)?req.query.status:'',category=Object.hasOwn(categories,req.query.category)?req.query.category:'',search=text(req.query.q,100,'Search');
    const enquiries=await rows(db,'SELECT id,category,name,email,subject,status,created_at FROM cms_enquiries WHERE (?="" OR status=?) AND (?="" OR category=?) AND (name LIKE ? OR email LIKE ? OR subject LIKE ?) ORDER BY id DESC LIMIT 200',[state,state,category,category,...Array(3).fill(`%${search}%`)]);
    res.render('enquiries',{enquiries,state,category,search});
  });
  app.get('/admin/enquiries/:id',manager,async(req,res)=>{
    const enquiry=(await rows(db,'SELECT * FROM cms_enquiries WHERE id=?',[req.params.id]))[0];ensure(enquiry,'Enquiry not found.',404);
    const notes=await rows(db,'SELECT n.*,u.name FROM cms_enquiry_notes n LEFT JOIN cms_users u ON u.id=n.user_id WHERE enquiry_id=? ORDER BY n.id DESC',[enquiry.id]);
    const users=await rows(db,'SELECT id,name FROM cms_users WHERE active=1 AND role IN ("admin","enquiry_manager")');
    res.render('enquiry',{enquiry,notes,users});
  });
  app.post('/admin/enquiries/:id',manager,async(req,res)=>{
    ensure(statuses.includes(req.body.status),'Choose a valid status.');const assigned=req.body.assigned_to?Number(req.body.assigned_to):null;
    if(assigned)ensure((await rows(db,'SELECT id FROM cms_users WHERE id=? AND active=1 AND role IN ("admin","enquiry_manager")',[assigned])).length,'Choose an enquiry manager.');
    const exists=await rows(db,'SELECT id FROM cms_enquiries WHERE id=?',[req.params.id]);ensure(exists.length,'Enquiry not found.',404);
    const note=text(req.body.note,4000,'Follow-up note');
    await rows(db,'UPDATE cms_enquiries SET status=?,assigned_to=? WHERE id=?',[req.body.status,assigned,req.params.id]);
    if(note)await rows(db,'INSERT INTO cms_enquiry_notes(enquiry_id,user_id,note) VALUES(?,?,?)',[req.params.id,req.user.id,note]);
    await audit(db,req.user,'update','enquiry',req.params.id);res.redirect(`/admin/enquiries/${req.params.id}?saved=1`);
  });
  app.get('/admin/enquiries/:id/attachment',manager,async(req,res)=>{
    const e=(await rows(db,'SELECT attachment_filename,attachment_name FROM cms_enquiries WHERE id=?',[req.params.id]))[0];ensure(e?.attachment_filename,'Attachment not found.',404);
    await audit(db,req.user,'download_attachment','enquiry',req.params.id);res.download(path.join(root,'storage/uploads',e.attachment_filename),e.attachment_name);
  });
  app.post('/admin/enquiries/:id/delete',admin,async(req,res)=>{
    const e=(await rows(db,'SELECT attachment_filename FROM cms_enquiries WHERE id=?',[req.params.id]))[0];ensure(e,'Enquiry not found.',404);
    await rows(db,'DELETE FROM cms_enquiries WHERE id=?',[req.params.id]);if(e.attachment_filename)await unlink(path.join(root,'storage/uploads',e.attachment_filename)).catch(()=>{});
    await audit(db,req.user,'delete_personal_data','enquiry',req.params.id);res.redirect('/admin/enquiries?saved=1');
  });
  app.get('/admin/settings',admin,async(req,res)=>res.render('settings',{settings:await settings(db)}));
  app.post('/admin/settings',admin,async(req,res)=>{
    const b=req.body;const values={};
    for(const name of ['facebook','instagram','youtube']){
      values[name]=text(b[name],500,name);
      if(values[name]){let parsed;try{parsed=new URL(values[name]);}catch{}ensure(parsed?.protocol==='https:',`Use a complete HTTPS URL for ${name}.`);const domains={facebook:['facebook.com','www.facebook.com'],instagram:['instagram.com','www.instagram.com'],youtube:['youtube.com','www.youtube.com','youtu.be']}[name];ensure(domains.includes(parsed.hostname),`Choose an official ${name} profile URL.`);}
    }
    values.enquiries_enabled=b.enquiries_enabled==='on';values.attachments_enabled=b.attachments_enabled==='on';
    values.privacy_notice=text(b.privacy_notice,4000,'Privacy notice');values.consent_version=text(b.consent_version,100,'Consent version');
    if(values.enquiries_enabled)ensure(values.privacy_notice && values.consent_version,'Add the approved privacy notice and its version before enabling enquiries.');
    for(const [name,value] of Object.entries(values))await rows(db,'INSERT INTO cms_settings(name,value) VALUES(?,?) ON DUPLICATE KEY UPDATE value=VALUES(value)',[name,JSON.stringify(value)]);
    await audit(db,req.user,'update','settings','site');res.redirect('/admin/settings?saved=1');
  });
  app.get('/admin/users',admin,async(req,res)=>res.render('users',{users:await rows(db,'SELECT id,name,email,role,active FROM cms_users ORDER BY id')}));
  app.post('/admin/users',admin,async(req,res)=>{
    const b=req.body;const name=text(b.name,100,'Name',true),email=text(b.email,254,'Email',true).toLowerCase();ensure(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),'Enter a valid email.');ensure(['admin','editor','enquiry_manager'].includes(b.role),'Choose a valid role.');const password=text(b.password,200,'Password',true);ensure(password.length>=12,'Use a password of at least 12 characters.');
    const result=await rows(db,'INSERT INTO cms_users(name,email,role,password_hash) VALUES(?,?,?,?)',[name,email,b.role,await hashPassword(password)]);await audit(db,req.user,'create','user',result.insertId);res.redirect('/admin/users?saved=1');
  });
  app.post('/admin/users/:id/toggle',admin,async(req,res)=>{
    ensure(Number(req.params.id)!==req.user.id,'You cannot disable your own account.');await rows(db,'UPDATE cms_users SET active=NOT active WHERE id=?',[req.params.id]);await audit(db,req.user,'toggle_access','user',req.params.id);res.redirect('/admin/users?saved=1');
  });
  app.get('/admin/password',(req,res)=>res.render('password'));
  app.post('/admin/password',async(req,res)=>{
    const old=(await rows(db,'SELECT password_hash FROM cms_users WHERE id=?',[req.user.id]))[0];ensure(await verifyPassword(text(req.body.current,200,'Current password',true),old.password_hash),'Current password is incorrect.');const next=text(req.body.password,200,'New password',true);ensure(next.length>=12,'Use a password of at least 12 characters.');
    await rows(db,'UPDATE cms_users SET password_hash=? WHERE id=?',[await hashPassword(next),req.user.id]);
    const id=req.user.id;await rows(db,"DELETE FROM cms_sessions WHERE JSON_EXTRACT(data,'$.userId')=?",[id]);await regenerate(req);req.session.userId=id;req.session.csrf=token();await saveSession(req);await audit(db,req.user,'change_password','user',id);res.redirect('/admin/password?saved=1');
  });
  app.get('/admin/audit',admin,async(req,res)=>res.render('audit',{events:await rows(db,'SELECT a.*,u.name FROM cms_audit a LEFT JOIN cms_users u ON u.id=a.user_id ORDER BY a.id DESC LIMIT 200')}));
  app.get('/api/csrf',async(req,res)=>{await saveSession(req);res.json({token:req.session.csrf});});
  app.get('/api/site',async(req,res)=>{
    const config=await settings(db);const entries=await rows(db,'SELECT e.id,e.type,e.title,e.slug,e.summary,e.body,e.metadata,e.published_at,m.id AS media_id,m.alt AS image_alt FROM cms_entries e LEFT JOIN cms_media m ON m.id=e.image_id WHERE e.status="published" AND e.published_at<=UTC_TIMESTAMP() ORDER BY e.published_at DESC,e.id DESC LIMIT 300');
    res.json({entries:entries.map(e=>({...e,metadata:json(e.metadata),image_url:e.media_id?`/media/${e.media_id}`:null})),settings:Object.fromEntries(['facebook','instagram','youtube','enquiries_enabled','attachments_enabled','privacy_notice','consent_version'].map(key=>[key,config[key]??'']))});
  });
  app.post('/api/enquiries',async(req,res)=>{
    const config=await settings(db);ensure(config.enquiries_enabled,'Enquiries are not enabled yet.',503);
    ensure(!req.body.website,'Please leave the website field empty.');
    ensure(!(await rateLimited(db,`enquiry:${req.ip}`,5,600)),'Too many enquiries. Try again in ten minutes.',429);
    const b=req.body;ensure(Object.hasOwn(categories,b.category),'Choose a valid enquiry category.');
    const name=text(b.name,100,'Name',true),email=text(b.email,254,'Email',true);ensure(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),'Enter a valid email.');
    const organisation=text(b.organisation,150,'Organisation'),subject=text(b.subject,200,'Subject',true),message=text(b.message,8000,'Message',true);
    ensure(b.consent===true || b.consent==='true' || b.consent==='on','Accept the privacy notice to send your enquiry.');
    let filename=null,fileName=null,mime=null;const file=req.files?.attachment?.[0];
    if(file){ensure(config.attachments_enabled,'Attachments are not enabled.');let kind=imageKind(file);if(file.mimetype==='application/pdf' && file.buffer.subarray(0,5).toString()==='%PDF-')kind=['pdf','application/pdf'];ensure(kind,'Only PDF, PNG, JPEG or WebP attachments are allowed.');filename=await fileSave(file,kind[0]);fileName=path.basename(file.originalname).slice(0,255);mime=kind[1];}
    try{
      const result=await rows(db,'INSERT INTO cms_enquiries(category,name,email,organisation,subject,message,consent_at,consent_version,attachment_filename,attachment_name,attachment_mime) VALUES(?,?,?,?,?,?,UTC_TIMESTAMP(),?,?,?,?)',[b.category,name,email,organisation,subject,message,config.consent_version,filename,fileName,mime]);
      res.status(201).json({reference:`KEM-${String(result.insertId).padStart(6,'0')}`,message:'Your enquiry has been recorded for the studio.'});
    }catch(error){if(filename)await unlink(path.join(root,'storage/uploads',filename)).catch(()=>{});throw error;}
  });
  app.use(talentRouter(db,{imageKind}));
  app.use((req,res)=>res.status(404).render('error',{message:'Page not found.',status:404}));
  app.use((error,req,res,next)=>{
    if(res.headersSent)return next(error);
    const status=error.code==='ER_DUP_ENTRY'?422:error instanceof multer.MulterError?422:error.status || 500;
    const message=error.code==='ER_DUP_ENTRY'?'That email or content slug already exists.':error instanceof multer.MulterError?'Upload one file of at most 5 MB.':status===500?'The CMS could not complete this request. Please try again.':error.message;
    if(status===500)console.error('CMS request failed:',error.code || error.name);
    if(req.path.startsWith('/api/'))return res.status(status).json({error:message});
    res.status(status).render('error',{message,status});
  });
  return app;
}
