import {newsCampaignsRouter} from './news-campaigns.js';
import {siteModulesRouter,publishedSiteModules} from './site-modules.js';
import contentPages from '../../shared/content-pages.json' with {type:'json'};
const contentPageKeys=contentPages.map(page=>page.key);
import {newsAlertsRouter} from './news-alerts.js';
import {parseRichText,richTextPlain,richTextHtml} from '../public/rich-text-core.js';
import {publicLegalRouter} from './public-legal.js';
import {managedContentRouter,publicManagedContent} from './managed-content.js';
import {operationsRouter} from './operations-admin.js';
import {deletePersonalRecord} from './retention.js';
import {reportsRouter} from './reports.js';
import {kpiRouter} from './kpi-admin.js';
import {optimizeImage} from './image-optimizer.js';
import {categories,statuses,workflowFields} from './enquiry-options.js';
import { saveWithReceipt, mailConfiguration, verifyMailConnection } from './mail.js';
import { website } from './website.js';
import express from 'express';
import session from 'express-session';
import multer from 'multer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, writeFile, unlink, readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { rows, json, settings, audit } from './db.js';
import { token, hashPassword, verifyPassword, canEdit, canEnquire, csrfValid, MysqlSessionStore, rateLimited } from './security.js';
import { notifications, dashboard, notificationPreferences, notificationCategories } from './dashboard.js';
import { talentRouter } from './talent.js';
import { careersRouter } from './careers.js';
import {tableView,bulkRouter} from './admin-tables.js';
import { adminIcon } from './icons.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const types = { news:'Newsroom', media_partner:'Media partners', blog:'Blog', career:'Careers', team:'Leadership & team', home:'Homepage & promotions', page:'Page content', legal:'Legal centre', production:'Production announcements', press_asset:'Press resources' };
export {categories,statuses} from './enquiry-options.js';
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
  app.locals.adminIcon = adminIcon;
  app.locals.richTextHtml=richTextHtml;
  app.disable('x-powered-by');
  app.use(publicLegalRouter(db,options.frontendDirectory));
  app.use(website(options.frontendDirectory));
  if(process.env.TRUST_PROXY==='true')app.set('trust proxy',1);
  app.set('view engine','ejs'); app.set('views',path.join(root,'views'));
  app.use((req,res,next)=>{
    res.set({'X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'same-origin','Permissions-Policy':'camera=(), microphone=(), geolocation=()','Content-Security-Policy':"default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'self'"});
    if(req.path.startsWith('/admin') || req.path.startsWith('/api/'))res.set('Cache-Control','no-store');
    next();
  });
  app.use(express.static(path.join(root,'public'),{maxAge:'1h'}));
  app.use(express.urlencoded({extended:false,limit:'500kb'}));app.use(express.json({limit:'500kb'}));
  ensure((process.env.SESSION_SECRET || '').length>=32,'Set a random SESSION_SECRET of at least 32 characters.',500);
  app.use(session({name:options.cookieName || 'kemsor.cms',secret:process.env.SESSION_SECRET,store:new MysqlSessionStore(db),resave:false,saveUninitialized:false,rolling:true,cookie:{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',maxAge:60*60*1000}}));
  app.use(async(req,res,next)=>{
    try {
      req.user=req.session.userId ? (await rows(db,'SELECT id,name,email,role,active FROM cms_users WHERE id=? AND active=1',[req.session.userId]))[0] : null;
      if(req.path.startsWith('/admin') || req.path==='/api/csrf')req.session.csrf ||= token();
      res.locals={...res.locals,user:req.user,csrf:req.session.csrf,types,categories,statuses,contentPages,websiteUrl:process.env.WEBSITE_URL || 'http://127.0.0.1:3007',title:'Kemsor CMS',saved:req.query.saved==='1',currentPath:req.path,currentType:req.query.type || '',notifications:[],unreadCount:0};
      if(req.path.startsWith('/admin') && !['/admin/login','/admin/mfa'].includes(req.path) && !req.user)return res.redirect('/admin/login');
      if(req.user && req.path.startsWith('/admin') && req.method==='GET'){
        res.locals.notifications=await notifications(db,req.user);
        res.locals.unreadCount=res.locals.notifications.filter(n=>!n.read).length;
      }
      next();
    }catch(error){next(error);}
  });
  const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:50*1024*1024,files:1,fields:25,fieldSize:70000}}).fields([{name:'image',maxCount:1},{name:'attachment',maxCount:1}]);
  const siteUpload=multer({storage:multer.memoryStorage(),limits:{fileSize:50*1024*1024,files:1,fields:2000,fieldSize:70000}}).fields([{name:'image',maxCount:1},{name:'attachment',maxCount:1}]);
  const kpiUpload=multer({limits:{files:0,fields:100,fieldSize:70000}}).none();
  app.use((req,res,next)=>req.is('multipart/form-data') ? (req.path==='/admin/site-content/save'?siteUpload:req.path.startsWith('/admin/kpi/')||req.path==='/admin/settings'?kpiUpload:upload)(req,res,next) : next());
  app.use((req,res,next)=>{const files=Object.values(req.files||{}).flat();const large=files.some(file=>file.size>5*1024*1024&&!(file.fieldname==='image'&&req.path.startsWith('/admin/')));return large?next(Object.assign(new Error('Attachments must be at most 5 MB.'),{status:422})):next()});
  app.use(async(req,res,next)=>{
    if(!['POST','PUT','PATCH','DELETE'].includes(req.method))return next();
    if(req.headers.origin){
      const allowed=new Set([process.env.WEBSITE_URL || 'http://127.0.0.1:3007',`${req.protocol}://${req.get('host')}`]);
      if(!allowed.has(req.headers.origin))return next(Object.assign(new Error('Request origin is not allowed.'),{status:403}));
    }
    if(!csrfValid(req.session.csrf,req.get('X-CSRF-Token') || req.body?._csrf)){
      if(req.path==='/admin/login'){
        req.session.csrf=token();
        await saveSession(req);
        return res.redirect(303,'/admin/login?expired=1');
      }
      return next(Object.assign(new Error('Your session expired. Reload the form and try again.'),{status:403}));
    }
    next();
  });
  const admin=(req,res,next)=>req.user?.role==='admin' ? next() : next(Object.assign(new Error('Administrator access required.'),{status:403}));
  const editor=(req,res,next)=>canEdit(req.user) ? next() : next(Object.assign(new Error('Publishing access required.'),{status:403}));
  const manager=(req,res,next)=>canEnquire(req.user) ? next() : next(Object.assign(new Error('Enquiry access required.'),{status:403}));
  app.get('/health',async(req,res)=>{await rows(db,'SELECT 1');res.json({status:'ok',service:'Kemsor Phase 1 CMS'});});
  app.get('/',(req,res)=>res.status(200).json({status:'ok',service:'Kemsor Phase 1 CMS',admin:'/admin'}));
  app.get('/admin/login',(req,res)=>req.user ? res.redirect('/admin') : res.render('login',{error:req.query.expired==='1'?'Your sign-in session was refreshed. Please submit the form again.':null}));
  app.post('/admin/login',async(req,res)=>{
    const email=text(req.body.email,254,'Email',true).toLowerCase();
    if(await rateLimited(db,`login:${req.ip}:${email}`,5,900) || await rateLimited(db,`login-ip:${req.ip}`,30,900))return res.status(429).render('login',{error:'Too many attempts. Try again in 15 minutes.'});
    const user=(await rows(db,'SELECT * FROM cms_users WHERE email=? AND active=1',[email]))[0];
    const valid=await verifyPassword(typeof req.body.password==='string' ? req.body.password : '', user?.password_hash || options.dummyHash);
    if(!user || !valid)return res.status(401).render('login',{error:'Email or password is incorrect.'});
    await regenerate(req);req.session.userId=user.id;req.session.csrf=token();await saveSession(req);
    await audit(db,user,'login','user',user.id);
    res.redirect('/admin');
  });
  // Old bookmarks return to password sign-in; pending MFA sessions are not authenticated.
  app.get('/admin/mfa',(req,res)=>res.redirect(req.user?'/admin':'/admin/login'));
  app.post('/admin/logout',async(req,res)=>{await new Promise((resolve,reject)=>req.session.destroy(e=>e?reject(e):resolve()));res.clearCookie(options.cookieName || 'kemsor.cms');res.redirect('/admin/login');});
  app.get('/admin',async(req,res)=>{
    res.render('dashboard',await dashboard(db,req.user));
  });
  app.get('/admin/notifications.json',(req,res)=>res.json({items:res.locals.notifications,unread:res.locals.unreadCount}));
  app.get('/admin/notifications',async(req,res)=>{
    const view=['all','unread','read','history'].includes(req.query.view)?req.query.view:'all';
    const feedUnread=res.locals.unreadCount;
    if(view==='history')res.locals.notifications=await notifications(db,req.user,{includeMuted:true});
    res.render('notifications',{view,kind:['all','enquiry','application','draft','talent','setup'].includes(req.query.kind)?req.query.kind:'all',preferences:await notificationPreferences(db,req.user),feedUnread});
  });
  app.post('/admin/notifications/preferences',async(req,res)=>{
    const conn=await db.getConnection();try{await conn.beginTransaction();for(const category of Object.keys(notificationCategories(req.user)))await rows(conn,'INSERT INTO cms_notification_preferences(user_id,category,enabled) VALUES(?,?,?) ON DUPLICATE KEY UPDATE enabled=VALUES(enabled)',[req.user.id,category,req.body[`pref_${category}`]==='on'?1:0]);await conn.commit();}catch(error){await conn.rollback();throw error;}finally{conn.release();}
    res.redirect('/admin/notifications?saved=1');
  });
  app.post('/admin/notifications/read',async(req,res)=>{
    const items=await notifications(db,req.user,{includeMuted:true});
    const selected=req.body.key==='all' ? items : items.filter(item=>item.key===req.body.key);
    ensure(selected.length || req.body.key==='all','Notification not found.',404);
    for(const item of selected)await rows(db,'INSERT IGNORE INTO cms_notification_reads(user_id,notification_key) VALUES(?,?)',[req.user.id,item.key]);
    if(req.get('Accept')?.includes('application/json'))return res.json({ok:true,redirect:'/admin/notifications'});
    res.redirect('/admin/notifications');
  });
  app.get('/admin/pages',editor,async(req,res)=>{
    const counts=await rows(db,'SELECT type,COUNT(*) AS total FROM cms_entries GROUP BY type');
    res.render('pages',{counts});
  });
  app.get('/admin/content',editor,async(req,res)=>{
    if(req.query.type==='legal'){ensure(req.user.role==='admin','Use the administrator-managed legal editor.',403);return res.redirect('/admin/manage/legal');}
    const type=req.query.type==='all' ? 'all' : Object.hasOwn(types,req.query.type) ? req.query.type : 'news';
    const state=['draft','published','archived'].includes(req.query.status) ? req.query.status : '';
    const search=text(req.query.q,100,'Search');
    const pageFilter=type==='page' && contentPageKeys.includes(req.query.page)?req.query.page:'';
    const where='WHERE type<>"legal" AND (?="all" OR type=?) AND (?="" OR status=?) AND title LIKE ? AND (?="" OR JSON_UNQUOTE(JSON_EXTRACT(metadata,"$.page"))=?)';
    const params=[type,type,state,state,`%${search}%`,pageFilter,pageFilter];
    const total=Number((await rows(db,`SELECT COUNT(*) AS total FROM cms_entries ${where}`,params))[0].total);
    const table=tableView(req,total,{title:'title',status:'status',updated:'updated_at'},'updated',{type,status:state,q:search,page:pageFilter});
    const entries=await rows(db,`SELECT id,type,title,slug,status,updated_at FROM cms_entries ${where} ORDER BY ${table.order} LIMIT ${table.limit} OFFSET ${table.offset}`,params);
    res.render('content',{entries,type,state,search,pageFilter,table});
  });
  app.get('/admin/content/new',editor,(req,res,next)=>{if(req.query.type==='legal'){ensure(req.user.role==='admin','Use the administrator-managed legal editor.',403);return res.redirect('/admin/manage/legal');}next();},async(req,res)=>res.render(req.query.type==='blog'?'blog-edit':req.query.type==='news'?'news-edit':req.query.type==='career'?'career-edit':'edit',{entry:{type:Object.hasOwn(types,req.query.type)?req.query.type:'news',status:'draft',metadata:{page:req.query.type==='page'&&contentPageKeys.includes(req.query.page)?req.query.page:''}},media:await rows(db,'SELECT m.* FROM cms_media m WHERE m.mime LIKE "image/%" AND NOT EXISTS(SELECT 1 FROM talent_accounts t WHERE t.image_id=m.id) ORDER BY m.id DESC')}));
  app.get('/admin/content/:id/preview',editor,async(req,res)=>{
    const entry=(await rows(db,'SELECT * FROM cms_entries WHERE id=?',[req.params.id]))[0];ensure(entry,'Content not found.',404);entry.metadata=json(entry.metadata);
    if(entry.type==='legal'){ensure(req.user.role==='admin','Use the administrator-managed legal editor.',403);const managed=(await rows(db,"SELECT id FROM cms_managed_content WHERE kind='legal' AND slug=?",[entry.slug]))[0];return res.redirect(managed?`/admin/manage/legal/${managed.id}${req.path.endsWith('/preview')?'/preview':''}`:'/admin/manage/legal');}
    const image=entry.image_id?(await rows(db,'SELECT alt FROM cms_media WHERE id=?',[entry.image_id]))[0]:null;
    res.set('Content-Security-Policy',"default-src 'self'; img-src 'self' data:; media-src 'self' https:; style-src 'self'; script-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'self'");
    res.render('content-preview',{entry,image});
  });
  app.get('/admin/content/:id',editor,async(req,res)=>{
    const entry=(await rows(db,'SELECT * FROM cms_entries WHERE id=?',[req.params.id]))[0];ensure(entry,'Content not found.',404);entry.metadata=json(entry.metadata);
    if(entry.type==='legal'){ensure(req.user.role==='admin','Use the administrator-managed legal editor.',403);const managed=(await rows(db,"SELECT id FROM cms_managed_content WHERE kind='legal' AND slug=?",[entry.slug]))[0];return res.redirect(managed?`/admin/manage/legal/${managed.id}${req.path.endsWith('/preview')?'/preview':''}`:'/admin/manage/legal');}
    res.render(entry.type==='blog'?'blog-edit':entry.type==='news'?'news-edit':entry.type==='career'?'career-edit':'edit',{entry,media:await rows(db,'SELECT m.* FROM cms_media m WHERE m.mime LIKE "image/%" AND NOT EXISTS(SELECT 1 FROM talent_accounts t WHERE t.image_id=m.id) ORDER BY m.id DESC')});
  });
  app.post(['/admin/content/save','/admin/blog/save','/admin/career/save','/admin/news/save'],editor,async(req,res)=>{
    const b=req.body,type=b.type;
    if(['draft','published'].includes(b.publish_action))b.status=b.publish_action;
    if(req.path==='/admin/career/save')ensure(type==='career','This form only publishes career opportunities.');
    if(req.path==='/admin/news/save')ensure(type==='news','This form only publishes news posts.');
    if(req.path==='/admin/blog/save')ensure(type==='blog','This form only publishes blog posts.');
    ensure(Object.hasOwn(types,type),'Choose a valid content area.');
    ensure(type!=='legal','Use the managed legal editor to publish legal documents.');
    const title=text(b.title,200,'Title',true);
    const automatic=!b.slug;
    const base=title.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,180).replace(/-$/,'') || 'content';
    let slug=automatic?base:text(b.slug,190,'Slug',true);ensure(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug),'Use lowercase letters, numbers and hyphens in the slug.');
    let richText=null;
    try{richText=parseRichText(b.rich_text);}catch(error){throw Object.assign(new Error(error.message),{status:422});}
    const summary=text(b.summary,2000,'Summary'),body=text(richText?richTextPlain(richText):b.body,60000,'Body');ensure(['draft','published','archived'].includes(b.status),'Choose a valid publishing status.');
    const metadata={};for(const key of (['blog','news'].includes(type)?['seo_title','seo_description']:type==='career'?['category','role','location']:['category','role','location','page','seo_title','seo_description']))metadata[key]=text(b[key],key==='seo_description'?300:200,key);
    if(richText)metadata.rich_text=richText;
    if(type==='blog')metadata.category=text(b.category,100,'Blog category')||'Studio notes';
    if(type==='home'){ensure(!b.home_slot||['hero','section'].includes(b.home_slot),'Choose a homepage placement.');metadata.home_slot=b.home_slot||'section';}
    if(type==='news'){
      metadata.category=text(b.category,100,'News category')||'General';
      ensure(['General','Productions','Slate','Partnerships','Festivals and Awards','People','Press Releases'].includes(metadata.category),'Choose a valid news category.');
      metadata.featured=b.featured==='on';
      metadata.pdf_url=text(b.pdf_url,1500,'Press release PDF');
      if(metadata.pdf_url){let url;try{url=new URL(metadata.pdf_url)}catch{}ensure((/^\/media\/\d+\/document\.pdf$/.test(metadata.pdf_url))||(url?.protocol==='https:'&&!url.username&&!url.password&&url.pathname.toLowerCase().endsWith('.pdf')),'Use a direct HTTPS PDF URL.');}
      if(metadata.category==='Press Releases'&&b.status==='published')ensure(metadata.pdf_url,'Add the approved PDF before publishing a press release.');
    }
    if(type==='production'){
      ensure(['upcoming','in_development','in_pre_production','in_production','in_post_production','coming_soon','released'].includes(b.production_stage),'Choose a production stage.');
      metadata.year=text(b.year,4,'Year');metadata.production_stage=b.production_stage;metadata.format=text(b.format,100,'Format');metadata.language=text(b.language,100,'Language');
    }
    if(type==='press_asset'){
      const assetUrl=text(b.asset_url,1000,'Asset URL',true);
      let resource;try{resource=new URL(assetUrl,'http://local')}catch{}ensure((/^\/media\/\d+$/.test(assetUrl))||(resource?.protocol==='https:'||/^\/media\/\d+\/document\.pdf$/.test(assetUrl)),'Use an approved HTTPS resource URL or media-library URL.');
      metadata.asset_url=assetUrl;metadata.usage=text(b.usage,300,'Asset usage',true);
    }
    if(type==='page'){if(metadata.page==='news')metadata.page='press-media';ensure(contentPageKeys.includes(metadata.page),'Choose a valid page.');}
    if(type==='legal')ensure(metadata.page==='legal'||contentPageKeys.includes(metadata.page),'Choose a valid page.');
    const videoPages=['feature-films','series-ott','documentaries','productions'];
    if(type==='production'||type==='page'){
      metadata.video_url=text(b.video_url,1500,'Video URL');
      metadata.video_caption=text(b.video_caption,300,'Video caption');
      metadata.video_captions_url=text(b.video_captions_url,1500,'Subtitle URL');metadata.video_language=text(b.video_language,20,'Subtitle language')||'en';
      ensure(/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})?$/.test(metadata.video_language),'Use a subtitle language code such as en or hi.');
      if(metadata.video_captions_url){const match=metadata.video_captions_url.match(/^\/media\/(\d+)\/captions\.vtt$/);ensure(match&&(await rows(db,'SELECT id FROM cms_media WHERE id=? AND mime="text/vtt"',[match[1]])).length,'Upload a valid WebVTT subtitle file.');}
      if(metadata.video_url){
        ensure(type==='production'||videoPages.includes(metadata.page),'Video sections are available for Feature Films, Series & OTT, Documentaries and Productions.');
        const local=metadata.video_url.match(/^\/media\/(\d+)\/video\.mp4$/);
        if(local)ensure((await rows(db,'SELECT id FROM cms_media WHERE id=? AND mime="video/mp4"',[local[1]])).length,'Selected video does not exist.');
        else{let url;try{url=new URL(metadata.video_url)}catch{}ensure(url?.protocol==='https:'&&!url.username&&!url.password&&url.pathname.toLowerCase().endsWith('.mp4'),'Use an uploaded video or a direct HTTPS MP4 URL.');}
        ensure(b.image_id,'Choose a poster image before saving a video.');
        ensure(metadata.video_caption,'Add a short video caption before saving.');
      }
    }
    let imageId=b.image_id ? Number(b.image_id) : null;
    if(imageId)ensure((await rows(db,'SELECT m.id FROM cms_media m WHERE m.id=? AND m.mime LIKE "image/%" AND NOT EXISTS(SELECT 1 FROM talent_accounts t WHERE t.image_id=m.id)',[imageId])).length,'Selected image does not exist.');
    const id=b.id ? Number(b.id) : null;
    if(id){const old=(await rows(db,'SELECT type,slug FROM cms_entries WHERE id=?',[id]))[0];ensure(old,'Content not found.',404);ensure(old.type===type,'Content area cannot be changed.');slug=old.slug;}
    let banner=req.files?.image?.[0];
    let uploaded=null,contentSaved=false;
    if(banner){
      ensure(['blog','news'].includes(type),'Upload content images from the image library.');
      banner=await optimizeImage(banner);const kind=['webp','image/webp'];
      const alt=text(b.banner_alt,300,'Banner description',true);
      const filename=await fileSave(banner,kind[0]);
      try{const media=await rows(db,'INSERT INTO cms_media(filename,original_name,mime,size,alt,created_by) VALUES(?,?,?,?,?,?)',[filename,path.basename(banner.originalname).slice(0,255),kind[1],banner.size,alt,req.user.id]);imageId=media.insertId;uploaded={id:imageId,filename};}
      catch(error){await unlink(path.join(root,'storage/uploads',filename)).catch(()=>{});throw error;}
    }
    try {
    const values=[title,slug,summary,body,imageId,JSON.stringify(metadata),b.status,b.status==='published'?new Date():null,req.user.id];
    let result;
    if(id)result=await rows(db,'UPDATE cms_entries SET title=?,slug=?,summary=?,body=?,image_id=?,metadata=?,status=?,published_at=?,updated_by=? WHERE id=?',[...values,id]);
    else {
      let suffix=1;
      while(true){
        if(automatic){slug=suffix===1?base:`${base}-${suffix}`;values[1]=slug;}
        try{result=await rows(db,'INSERT INTO cms_entries(title,slug,summary,body,image_id,metadata,status,published_at,updated_by,type,created_by) VALUES(?,?,?,?,?,?,?,?,?,?,?)',[...values,type,req.user.id]);break;}
        catch(error){if(!automatic || error.code!=='ER_DUP_ENTRY')throw error;suffix++;}
      }
    }
    contentSaved=true;
    await audit(db,req.user,b.status==='published'?'publish':'save','content',id || result.insertId);
    res.redirect(`/admin/content?type=${type}&saved=1`);
    }catch(error){
      if(uploaded&&!contentSaved){await rows(db,'DELETE FROM cms_media WHERE id=?',[uploaded.id]).catch(()=>{});await unlink(path.join(root,'storage/uploads',uploaded.filename)).catch(()=>{});}
      throw error;
    }

  });
  app.post('/admin/content/:id/delete',editor,async(req,res)=>{
    const entry=(await rows(db,'SELECT id,type FROM cms_entries WHERE id=?',[req.params.id]))[0];
    ensure(entry,'Content not found.',404);ensure(entry.type==='blog','Only blog posts can be deleted here.');
    await rows(db,'DELETE FROM cms_notification_history WHERE category="draft" AND source_id=?',[entry.id]);
    await rows(db,'DELETE FROM cms_entries WHERE id=? AND type="blog"',[entry.id]);
    await audit(db,req.user,'delete','content',entry.id);
    res.redirect('/admin/content?type=blog&saved=1');
  });
  app.post('/admin/content/:id/archive',editor,async(req,res)=>{
    const record=(await rows(db,'SELECT type FROM cms_entries WHERE id=?',[req.params.id]))[0];ensure(record?.type!=='legal','Use the managed legal editor to unpublish a legal document.');
    await rows(db,'UPDATE cms_entries SET status="archived",updated_by=? WHERE id=?',[req.user.id,req.params.id]);await audit(db,req.user,'archive','content',req.params.id);res.redirect('/admin/content?saved=1');
  });
  app.get('/admin/media',editor,async(req,res)=>{
    const search=text(req.query.q,100,'Search'),format=['image/png','image/jpeg','image/webp','video/mp4','application/pdf','text/vtt'].includes(req.query.format)?req.query.format:'',usage=['used','unused'].includes(req.query.usage)?req.query.usage:'';
    const url=`CASE m.mime WHEN 'video/mp4' THEN CONCAT('/media/',m.id,'/video.mp4') WHEN 'application/pdf' THEN CONCAT('/media/',m.id,'/document.pdf') WHEN 'text/vtt' THEN CONCAT('/media/',m.id,'/captions.vtt') ELSE CONCAT('/media/',m.id) END`;
    const references=[`CONCAT('/media/',m.id)`,url];
    const linked=(column)=>references.map(ref=>`JSON_SEARCH(${column},'one',${ref}) IS NOT NULL`).join(' OR ');
    const uses=`(SELECT COUNT(*) FROM cms_entries e WHERE e.image_id=m.id OR ${linked('e.metadata')})+(EXISTS(SELECT 1 FROM cms_site_modules s WHERE ${linked('s.draft')} OR ${linked('s.published')}))+(EXISTS(SELECT 1 FROM cms_site_module_revisions r WHERE ${linked('r.snapshot')}))+(EXISTS(SELECT 1 FROM cms_managed_content d WHERE ${linked('d.draft')} OR ${linked('d.published')}))+(EXISTS(SELECT 1 FROM cms_managed_revisions h WHERE ${linked('h.snapshot')}))`;
    const media=await rows(db,`SELECT m.*,${url} AS url,(${uses}) AS uses FROM cms_media m WHERE NOT EXISTS(SELECT 1 FROM talent_accounts t WHERE t.image_id=m.id) AND (m.original_name LIKE ? OR m.alt LIKE ?) AND (?='' OR m.mime=?) HAVING (?='' OR (?='used' AND uses>0) OR (?='unused' AND uses=0)) ORDER BY m.id DESC`,[`%${search}%`,`%${search}%`,format,format,usage,usage,usage]);
    res.render('media',{media,search,format,usage});
  });
  app.post('/admin/media/:id/delete',editor,async(req,res)=>{
    const connection=await db.getConnection();let image;
    try{await connection.beginTransaction();image=(await rows(connection,'SELECT * FROM cms_media WHERE id=? FOR UPDATE',[req.params.id]))[0];ensure(image,'Image not found.',404);
      const references=[`/media/${image.id}`,`/media/${image.id}/video.mp4`,`/media/${image.id}/captions.vtt`,`/media/${image.id}/document.pdf`];
      for(const [table,columns]of [['cms_site_modules',['draft','published']],['cms_site_module_revisions',['snapshot']],['cms_managed_content',['draft','published']],['cms_managed_revisions',['snapshot']]]){
        const clauses=columns.flatMap(column=>references.map(()=>`JSON_SEARCH(${column},'one',?) IS NOT NULL`));
        const used=await rows(connection,`SELECT 1 FROM ${table} WHERE ${clauses.join(' OR ')} LIMIT 1`,columns.flatMap(()=>references));ensure(!used.length,'This media is used by website content or a saved revision. Keep it to preserve that content.',409);
      }
      const used=await rows(connection,`SELECT id FROM cms_entries WHERE image_id=? OR ${references.map(()=>"JSON_SEARCH(metadata,'one',?) IS NOT NULL").join(' OR ')} UNION ALL SELECT id FROM talent_accounts WHERE image_id=?`,[image.id,...references,image.id]);ensure(!used.length,'This image is in use. Remove it from its content before deleting it.',409);
      await rows(connection,'DELETE FROM cms_media WHERE id=?',[image.id]);await connection.commit();
    }catch(error){await connection.rollback();throw error;}finally{connection.release();}
    await unlink(path.join(root,'storage/uploads',image.filename)).catch(()=>{});await audit(db,req.user,'delete','media',image.id);res.redirect('/admin/media?saved=1');
  });
  // Upload independently of the content form; completion means the asset is persisted.
  app.post('/admin/media/upload',editor,async(req,res)=>{
    const original=req.files?.image?.[0];ensure(original,'Choose an image or MP4 video.');
    const video=req.body.kind==='video',document=req.body.kind==='document',captions=req.body.kind==='captions';
    ensure(['image','video','document','captions'].includes(req.body.kind||'image'),'Choose a supported media type.');

    let file,extension,mime;
    if(video){
      const b=original.buffer;let offset=0,ftyp=false,moov=false,mdat=false;
      while(offset+8<=b.length){
        let size=b.readUInt32BE(offset);const type=b.toString('ascii',offset+4,offset+8);let header=8;
        if(size===1){ensure(offset+16<=b.length,'Invalid MP4 video.');const large=b.readBigUInt64BE(offset+8);ensure(large<=BigInt(b.length),'Invalid MP4 video.');size=Number(large);header=16;}
        if(size===0)size=b.length-offset;
        ensure(size>=header&&offset+size<=b.length,'Invalid MP4 video.');
        if(type==='ftyp')ftyp=size>=16;if(type==='moov')moov=size>header;if(type==='mdat')mdat=size>header;
        offset+=size;
      }
      ensure(original.mimetype==='video/mp4'&&ftyp&&moov&&mdat&&offset===b.length,'Choose a valid MP4 video (up to 50 MB).');
      file=original;extension='mp4';mime='video/mp4';
    }else if(document){
      const b=original.buffer;ensure(original.mimetype==='application/pdf'&&b.length<=10*1024*1024&&b.subarray(0,5).toString()==='%PDF-'&&b.subarray(-1024).includes(Buffer.from('%%EOF')),'Choose a valid PDF up to 10 MB.');file=original;extension='pdf';mime='application/pdf';
    }else if(captions){
      let value;try{value=new TextDecoder('utf-8',{fatal:true}).decode(original.buffer)}catch{}ensure(original.size<=1024*1024&&typeof value==='string'&&/^WEBVTT(?:[ \t][^\r\n]*)?\r?\n/.test(value)&&!value.includes('\0')&&/\d{2}:\d{2}\.\d{3} --> (?:\d{2}:)?\d{2}:\d{2}\.\d{3}/.test(value),'Choose a valid UTF-8 WebVTT subtitle file up to 1 MB.');file=original;extension='vtt';mime='text/vtt';
    }else{file=await optimizeImage(original);extension='webp';mime='image/webp';}
    const alt=text(req.body.alt,300,video?'Video description':'Alternative text',true),filename=await fileSave(file,extension);
    let id;
    try{const result=await rows(db,'INSERT INTO cms_media(filename,original_name,mime,size,alt,created_by) VALUES(?,?,?,?,?,?)',[filename,path.basename(original.originalname).slice(0,255),mime,file.size,alt,req.user.id]);id=result.insertId;}
    catch(error){await unlink(path.join(root,'storage/uploads',filename)).catch(()=>{});throw error;}
    await audit(db,req.user,'upload','media',id);
    res.status(201).json({id,url:video?`/media/${id}/video.mp4`:document?`/media/${id}/document.pdf`:captions?`/media/${id}/captions.vtt`:`/media/${id}`,mime,name:path.basename(original.originalname),alt,size:file.size});
  });
  app.post('/admin/media',editor,async(req,res)=>{
    const original=req.files?.image?.[0];ensure(original,'Choose an image.');const file=await optimizeImage(original),kind=['webp','image/webp'];
    const alt=text(req.body.alt,300,'Alternative text',true),filename=await fileSave(file,kind[0]);
    try{const result=await rows(db,'INSERT INTO cms_media(filename,original_name,mime,size,alt,created_by) VALUES(?,?,?,?,?,?)',[filename,path.basename(file.originalname).slice(0,255),kind[1],file.size,alt,req.user.id]);await audit(db,req.user,'upload','media',result.insertId);}catch(error){await unlink(path.join(root,'storage/uploads',filename));throw error;}
    res.redirect('/admin/media?saved=1');
  });
  app.get(['/media/:id','/media/:id/video.mp4','/media/:id/document.pdf','/media/:id/captions.vtt'],async(req,res)=>{
    const owner=(await rows(db,'SELECT id,status,visible,contact_checked FROM talent_accounts WHERE image_id=?',[req.params.id]))[0];
    if(owner && !(owner.status==='approved' && owner.visible && owner.contact_checked) && req.session.memberId!==owner.id && req.user?.role!=='admin')return res.status(404).end();
    const image=(await rows(db,'SELECT filename,mime FROM cms_media WHERE id=?',[req.params.id]))[0];ensure(image,'Image not found.',404);
    const suffix=req.path.split('/').at(-1);const expected={'video.mp4':'video/mp4','document.pdf':'application/pdf','captions.vtt':'text/vtt'}[suffix];ensure(!expected||image.mime===expected,'Media not found.',404);
    if(image.mime==='application/pdf')res.set('Content-Disposition','attachment; filename="kemsor-resource.pdf"');
    res.set({'Content-Type':image.mime,'Cache-Control':owner?'private, no-store':'public, max-age=86400'});res.sendFile(path.join(root,'storage/uploads',image.filename));
  });
  app.get('/admin/enquiries',manager,async(req,res)=>{
    const state=statuses.includes(req.query.status)?req.query.status:'',category=Object.hasOwn(categories,req.query.category)?req.query.category:'',search=text(req.query.q,100,'Search');
    const where='WHERE (?="" OR status=?) AND (?="" OR category=?) AND (name LIKE ? OR email LIKE ? OR subject LIKE ? OR tags LIKE ? OR source LIKE ?)';const params=[state,state,category,category,...Array(5).fill(`%${search}%`)];
    const total=Number((await rows(db,`SELECT COUNT(*) AS total FROM cms_enquiries ${where}`,params))[0].total);
    const table=tableView(req,total,{name:'name',subject:'subject',category:'category',status:'status',received:'created_at'},'received',{status:state,category,q:search});
    const enquiries=await rows(db,`SELECT id,category,name,email,subject,status,created_at FROM cms_enquiries ${where} ORDER BY ${table.order} LIMIT ${table.limit} OFFSET ${table.offset}`,params);
    res.render('enquiries',{enquiries,state,category,search,table});
  });
  app.get('/admin/enquiries/export.csv',manager,async(req,res)=>{
    const state=statuses.includes(req.query.status)?req.query.status:'',category=Object.hasOwn(categories,req.query.category)?req.query.category:'';
    const search=text(req.query.q,100,'Search');
    const entries=await rows(db,'SELECT id,category,name,email,organisation,subject,status,assigned_to,priority,tags,source,follow_up_at,created_at FROM cms_enquiries WHERE (?="" OR status=?) AND (?="" OR category=?) AND (name LIKE ? OR email LIKE ? OR subject LIKE ? OR tags LIKE ? OR source LIKE ?) ORDER BY id DESC LIMIT 10000',[state,state,category,category,...Array(5).fill(`%${search}%`)]);
    const columns=['id','category','name','email','organisation','subject','status','assigned_to','priority','tags','source','follow_up_at','created_at'];
    const cell=value=>'"'+String(value??'').replace(/^[=+@-]/,"'$&").replaceAll('"','""')+'"';
    await audit(db,req.user,'export','enquiries',String(entries.length));
    res.set({'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="studio-enquiries.csv"'}).send([columns.join(','),...entries.map(entry=>columns.map(key=>cell(entry[key])).join(','))].join('\r\n'));
  });
  app.get('/admin/enquiries/:id',manager,async(req,res)=>{
    const enquiry=(await rows(db,'SELECT * FROM cms_enquiries WHERE id=?',[req.params.id]))[0];ensure(enquiry,'Enquiry not found.',404);
    const notes=await rows(db,'SELECT n.*,u.name FROM cms_enquiry_notes n LEFT JOIN cms_users u ON u.id=n.user_id WHERE enquiry_id=? ORDER BY n.id DESC',[enquiry.id]);
    const users=await rows(db,'SELECT id,name FROM cms_users WHERE active=1 AND role IN ("admin","enquiry_manager")');
    const history=await rows(db,'SELECT h.*,u.name FROM cms_enquiry_history h LEFT JOIN cms_users u ON u.id=h.user_id WHERE enquiry_id=? ORDER BY h.id DESC',[enquiry.id]);
    res.render('enquiry',{enquiry,notes,users,history});
  });
  app.post('/admin/enquiries/:id',manager,async(req,res)=>{
    ensure(statuses.includes(req.body.status),'Choose a valid status.');const assigned=req.body.assigned_to?Number(req.body.assigned_to):null;
    if(assigned)ensure((await rows(db,'SELECT id FROM cms_users WHERE id=? AND active=1 AND role IN ("admin","enquiry_manager")',[assigned])).length,'Choose an enquiry manager.');
    const fields=workflowFields(req.body),note=text(req.body.note,4000,'Follow-up note');
    const connection=await db.getConnection();
    try{
      await connection.beginTransaction();
      const old=(await rows(connection,'SELECT status,assigned_to FROM cms_enquiries WHERE id=? FOR UPDATE',[req.params.id]))[0];ensure(old,'Enquiry not found.',404);
      ensure(req.body.status!=='assigned'||assigned,'Assign an internal user before selecting Assigned.');
      await rows(connection,'UPDATE cms_enquiries SET status=?,assigned_to=?,priority=?,tags=?,source=?,follow_up_at=? WHERE id=?',[req.body.status,assigned,fields.priority,fields.tags,fields.source,fields.followUp,req.params.id]);
      if(old.status!==req.body.status||old.assigned_to!==assigned)await rows(connection,'INSERT INTO cms_enquiry_history(enquiry_id,user_id,from_status,to_status,assigned_to) VALUES(?,?,?,?,?)',[req.params.id,req.user.id,old.status,req.body.status,assigned]);
      if(note)await rows(connection,'UPDATE cms_enquiries SET updated_at=UTC_TIMESTAMP() WHERE id=?',[req.params.id]);
      if(note)await rows(connection,'INSERT INTO cms_enquiry_notes(enquiry_id,user_id,note) VALUES(?,?,?)',[req.params.id,req.user.id,note]);
      await audit(connection,req.user,'update','enquiry',req.params.id);await connection.commit();
    }catch(error){await connection.rollback();throw error}finally{connection.release()}
    res.redirect(`/admin/enquiries/${req.params.id}?saved=1`);
  });
  app.get('/admin/enquiries/:id/attachment',manager,async(req,res)=>{
    const e=(await rows(db,'SELECT attachment_filename,attachment_name FROM cms_enquiries WHERE id=?',[req.params.id]))[0];ensure(e?.attachment_filename,'Attachment not found.',404);
    await audit(db,req.user,'download_attachment','enquiry',req.params.id);res.download(path.join(root,'storage/uploads',e.attachment_filename),e.attachment_name);
  });
  app.post('/admin/enquiries/:id/delete',admin,async(req,res)=>{
    await deletePersonalRecord(db,'enquiry',req.params.id,{user:req.user});
    res.redirect('/admin/enquiries?saved=1');
  });
  app.get('/admin/settings',admin,async(req,res)=>res.render('settings',{settings:await settings(db)}));
  app.get('/admin/email',admin,async(req,res)=>res.render('email',{
    configuration:mailConfiguration(options.smtpEnvironment || process.env),check:req.session.mailCheck || null,
    deliveries:await rows(db,'SELECT id,receipt_key,recipient,status,attempts,available_at,sent_at,last_error,provider_message_id FROM cms_email_outbox ORDER BY id DESC LIMIT 50')
  }));
  const checkEmailConnection=supportRelay=>async(req,res)=>{
    ensure(!await rateLimited(db,`smtp-check:${req.user.id}`,5,60),'Wait a minute before checking the SMTP connection again.',429);
    const current=options.smtpEnvironment || process.env;
    const result=await verifyMailConnection(supportRelay?{...current,EMAIL_TRANSPORT:'relay'}:current,options.mailTransport);
    req.session.mailCheck={...result,label:supportRelay?'Support relay test':'Configured email service',at:new Date().toISOString()};await saveSession(req);
    await audit(db,req.user,'verify_connection',supportRelay?'support_relay':'email',result.ok?'ok':'failed');
    if(req.get('Accept')?.includes('application/json'))return res.json({redirect:'/admin/email'});
    res.redirect(303,'/admin/email');
  };
  app.post('/admin/email/verify',admin,checkEmailConnection(false));
  app.post('/admin/email/verify-relay',admin,checkEmailConnection(true));
  app.post('/admin/email/:id/retry',admin,async(req,res)=>{
    ensure(mailConfiguration(options.smtpEnvironment || process.env).enabled,'Enable email delivery before retrying confirmation emails.');
    const result=await rows(db,"UPDATE cms_email_outbox SET status='pending',attempts=0,available_at=UTC_TIMESTAMP(),last_error=NULL,claim_token=NULL WHERE id=? AND status='failed'",[req.params.id]);
    ensure(result.affectedRows,'Only failed confirmations can be retried. Sent or in-progress emails were not changed.');
    await audit(db,req.user,'retry','email_receipt',req.params.id);
    if(req.get('Accept')?.includes('application/json'))return res.json({redirect:'/admin/email'});
    res.redirect(303,'/admin/email');
  });
  app.post('/admin/settings',admin,async(req,res)=>{
    const b=req.body;const values={};
    for(const name of ['facebook','instagram','youtube','linkedin']){
      values[name]=text(b[name],500,name);
      if(values[name]){let parsed;try{parsed=new URL(values[name]);}catch{}ensure(parsed?.protocol==='https:',`Use a complete HTTPS URL for ${name}.`);const domains={facebook:['facebook.com','www.facebook.com'],instagram:['instagram.com','www.instagram.com'],youtube:['youtube.com','www.youtube.com','youtu.be'],linkedin:['linkedin.com','www.linkedin.com']}[name];ensure(domains.includes(parsed.hostname),`Choose an official ${name} profile URL.`);}
    }
    const publicTextFields={contact_email:254,contact_phone:40,contact_landline:40,contact_whatsapp:40,contact_website:500,contact_address:1000,contact_note:300,map_location:300,map_caption:300,footer_kicker:100,footer_title:100,footer_accent:100,footer_description:1000,footer_cta_label:60,footer_copyright:150,footer_social_label:60};
    for(const [name,max]of Object.entries(publicTextFields))if(Object.hasOwn(b,name))values[name]=text(b[name],max,name);
    if(values.contact_email)ensure(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.contact_email),'Enter a valid contact email address.');
    if(values.contact_phone)ensure(/^[+\d\s().-]+$/.test(values.contact_phone),'Use numbers and standard phone punctuation for the contact phone.');
    for(const name of ['contact_landline','contact_whatsapp'])if(values[name])ensure(/^\+?[\d\s().-]+$/.test(values[name])&&values[name].replace(/\D/g,'').length>=7&&values[name].replace(/\D/g,'').length<=15,`Enter a valid ${name==='contact_landline'?'landline':'WhatsApp'} number.`);
    if(values.contact_website){let url;try{url=new URL(values.contact_website);}catch{}ensure(url?.protocol==='https:'&&!url.username&&!url.password&&!/[\r\n]/.test(values.contact_website),'Enter a complete HTTPS website address without login details.');}
    values.script_submissions_enabled=b.script_submissions_enabled==='on';values.script_terms=text(b.script_terms,12000,'Submission terms');values.script_terms_version=text(b.script_terms_version,100,'Submission terms version');if(values.script_submissions_enabled)ensure(values.script_terms&&values.script_terms_version,'Publish approved submission terms and their version before enabling scripts.');
    values.enquiries_enabled=b.enquiries_enabled==='on';values.attachments_enabled=b.attachments_enabled==='on';
    values.privacy_notice=text(b.privacy_notice,4000,'Privacy notice');values.consent_version=text(b.consent_version,100,'Consent version');
    if(values.enquiries_enabled)ensure(values.privacy_notice && values.consent_version,'Add the approved privacy notice and its version before enabling enquiries.');
    const conn=await db.getConnection();try{await conn.beginTransaction();
      for(const [name,value] of Object.entries(values))await rows(conn,'INSERT INTO cms_settings(name,value) VALUES(?,?) ON DUPLICATE KEY UPDATE value=VALUES(value)',[name,JSON.stringify(value)]);
      await audit(conn,req.user,'update','settings','site');await conn.commit();
    }catch(error){await conn.rollback();throw error;}finally{conn.release();}
    res.redirect('/admin/settings?saved=1');
  });
  app.get('/admin/users',admin,async(req,res)=>res.render('users',{users:await rows(db,'SELECT id,name,email,role,active FROM cms_users ORDER BY id')}));
  app.post('/admin/users',admin,async(req,res)=>{
    const b=req.body;const name=text(b.name,100,'Name',true),email=text(b.email,254,'Email',true).toLowerCase();ensure(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),'Enter a valid email.');ensure(['admin','editor','enquiry_manager'].includes(b.role),'Choose a valid role.');const password=text(b.password,200,'Password',true);ensure(password.length>=12,'Use a password of at least 12 characters.');
    const result=await rows(db,'INSERT INTO cms_users(name,email,role,password_hash) VALUES(?,?,?,?)',[name,email,b.role,await hashPassword(password)]);await audit(db,req.user,'create','user',result.insertId);res.redirect('/admin/users?saved=1');
  });
  app.post('/admin/users/:id/toggle',admin,async(req,res)=>{
    ensure(Number(req.params.id)!==req.user.id,'You cannot disable your own account.');await rows(db,'UPDATE cms_users SET active=NOT active WHERE id=?',[req.params.id]);await audit(db,req.user,'toggle_access','user',req.params.id);res.redirect('/admin/users?saved=1');
  });
  app.get('/admin/profile',async(req,res)=>{
    const profile=(await rows(db,'SELECT name,email,role,active,created_at FROM cms_users WHERE id=?',[req.user.id]))[0];
    res.render('profile',{profile,title:'My profile | Kemsor CMS'});
  });
  app.get('/admin/password',(req,res)=>res.render('password'));
  app.post('/admin/password',async(req,res)=>{
    const old=(await rows(db,'SELECT password_hash FROM cms_users WHERE id=?',[req.user.id]))[0];ensure(await verifyPassword(text(req.body.current,200,'Current password',true),old.password_hash),'Current password is incorrect.');const next=text(req.body.password,200,'New password',true);ensure(next.length>=12,'Use a password of at least 12 characters.');
    ensure(next===req.body.confirm,'Passwords do not match.');
    await rows(db,'UPDATE cms_users SET password_hash=? WHERE id=?',[await hashPassword(next),req.user.id]);
    const id=req.user.id;await rows(db,"DELETE FROM cms_sessions WHERE JSON_EXTRACT(data,'$.userId')=?",[id]);await regenerate(req);req.session.userId=id;req.session.csrf=token();await saveSession(req);await audit(db,req.user,'change_password','user',id);res.redirect('/admin/profile?saved=1#password');
  });
  app.get('/admin/audit',admin,async(req,res)=>res.render('audit',{events:await rows(db,'SELECT a.*,u.name FROM cms_audit a LEFT JOIN cms_users u ON u.id=a.user_id ORDER BY a.id DESC LIMIT 200')}));
  app.get('/api/csrf',async(req,res)=>{await saveSession(req);res.json({token:req.session.csrf});});
  app.get('/api/site',async(req,res)=>{
    const config=await settings(db);
    let cursor=null;if(req.query.cursor){try{ensure(typeof req.query.cursor==='string'&&req.query.cursor.length<700,'Invalid content cursor.');cursor=JSON.parse(Buffer.from(req.query.cursor,'base64url').toString());}catch{ensure(false,'Invalid content cursor.');}ensure(cursor&&Number.isSafeInteger(cursor.id)&&cursor.id>0&&Number.isSafeInteger(cursor.max)&&cursor.max>=cursor.id&&/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(cursor.time)&&/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(cursor.before),'Invalid content cursor.');}
    const snapshot=cursor?{max_id:cursor.max,publication_bound:cursor.before}:(await rows(db,'SELECT COALESCE(MAX(id),0) AS max_id,UTC_TIMESTAMP() AS publication_bound FROM cms_entries'))[0];
    const params=[snapshot.max_id,snapshot.publication_bound];if(cursor)params.push(cursor.time,cursor.time,cursor.id);
    const records=await rows(db,`SELECT e.id,e.type,e.title,e.slug,e.summary,e.body,e.metadata,e.published_at,e.updated_at,m.id AS media_id,m.alt AS image_alt FROM cms_entries e LEFT JOIN cms_media m ON m.id=e.image_id WHERE e.type<>"legal" AND e.status="published" AND e.published_at<=UTC_TIMESTAMP() AND e.id<=? AND e.published_at<=? ${cursor?'AND (e.published_at<? OR (e.published_at=? AND e.id<?))':''} ORDER BY e.published_at DESC,e.id DESC LIMIT 301`,params);
    const hasMore=records.length>300,entries=records.slice(0,300),last=entries.at(-1);
    const nextCursor=hasMore?Buffer.from(JSON.stringify({id:last.id,time:last.published_at,max:Number(snapshot.max_id),before:snapshot.publication_bound})).toString('base64url'):null;
    res.json({nextCursor,...await publicManagedContent(db),siteModules:await publishedSiteModules(db),entries:entries.map(e=>({...e,metadata:json(e.metadata),image_url:e.media_id?`/media/${e.media_id}`:null})),settings:Object.fromEntries(['facebook','instagram','youtube','linkedin','contact_email','contact_phone','contact_landline','contact_whatsapp','contact_website','contact_address','contact_note','map_location','map_caption','footer_kicker','footer_title','footer_accent','footer_description','footer_cta_label','footer_copyright','footer_social_label','enquiries_enabled','attachments_enabled','privacy_notice','consent_version','script_submissions_enabled','script_terms','script_terms_version'].map(key=>[key,config[key]??null]))});
  });
  app.post('/api/enquiries',async(req,res)=>{
    const config=await settings(db);ensure(config.enquiries_enabled,'Enquiries are not enabled yet.',503);
    ensure(!req.body.website,'Please leave the website field empty.');
    ensure(!(await rateLimited(db,`enquiry:${req.ip}`,5,600)),'Too many enquiries. Try again in ten minutes.',429);
    const b=req.body;ensure(Object.hasOwn(categories,b.category),'Choose a valid enquiry category.');
    const name=text(b.name,100,'Name',true),email=text(b.email,254,'Email',true);ensure(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),'Enter a valid email.');
    const organisation=text(b.organisation,150,'Organisation'),subject=text(b.subject,200,'Subject',true);let message=text(b.message,8000,'Message',true);const source=text(b.source,200,'Source')||'website';if(b.category==='copyright'){const evidence=text(b.evidence_url,1000,'Evidence URL',true);let parsed;try{parsed=new URL(evidence)}catch{}ensure(['http:','https:'].includes(parsed?.protocol),'Enter a valid evidence URL.');message+=`\n\nEvidence URL: ${evidence}`;}
    ensure(b.consent===true || b.consent==='true' || b.consent==='on','Accept the privacy notice to send your enquiry.');
    let filename=null,fileName=null,mime=null;const file=req.files?.attachment?.[0];
    if(file){ensure(config.attachments_enabled,'Attachments are not enabled.');let kind=imageKind(file);if(file.mimetype==='application/pdf' && file.buffer.subarray(0,5).toString()==='%PDF-')kind=['pdf','application/pdf'];ensure(kind,'Only PDF, PNG, JPEG or WebP attachments are allowed.');filename=await fileSave(file,kind[0]);fileName=path.basename(file.originalname).slice(0,255);mime=kind[1];}
    try{
      const reference=await saveWithReceipt(db,'enquiry',name,email,connection=>rows(connection,'INSERT INTO cms_enquiries(category,name,email,organisation,subject,message,consent_at,consent_version,attachment_filename,attachment_name,attachment_mime,source) VALUES(?,?,?,?,?,?,UTC_TIMESTAMP(),?,?,?,?,?)',[b.category,name,email,organisation,subject,message,config.consent_version,filename,fileName,mime,source]),{category:b.category,subject});
      res.status(201).json({reference,message:'Your enquiry has been recorded for the studio.'});
    }catch(error){if(filename)await unlink(path.join(root,'storage/uploads',filename)).catch(()=>{});throw error;}
  });
  app.use(siteModulesRouter(db));
  app.use(managedContentRouter(db));
  app.use(operationsRouter(db));
  app.use(newsAlertsRouter(db));
  app.use(newsCampaignsRouter(db));
  app.use(kpiRouter(db));
  app.use(reportsRouter(db));
  app.use(bulkRouter(db));
  app.use(careersRouter(db));
  app.use(talentRouter(db,{imageKind}));
  app.use((req,res)=>res.status(404).render('error',{message:'Page not found.',status:404}));
  app.use((error,req,res,next)=>{
    if(res.headersSent)return next(error);
    const status=error.code==='ER_DUP_ENTRY'?422:error instanceof multer.MulterError?422:error.status || 500;
    const message=error.code==='ER_DUP_ENTRY'?'That email or content slug already exists.':error instanceof multer.MulterError?'The upload could not be accepted. Try again; photos are optimized automatically.':status===500?'The CMS could not complete this request. Please try again.':error.message;
    if(status===500)console.error('CMS request failed:',error);
    if(req.path.startsWith('/api/') || (req.path.startsWith('/admin/') && req.get('Accept')?.includes('application/json'))){
      const fields={};
      const mappings=[[/This image could not/,'image'],[/contact email/i,'contact_email'],[/contact phone/i,'contact_phone'],[/^Title|^Title is/,'title'],[/^Name /,'name'],[/^Email |email address|valid email/i,'email'],[/^Summary/,'summary'],[/^Body/,'body'],[/slug|lowercase letters/i,'slug'],[/publishing status/i,'status'],[/valid page/i,'page'],[/selected image/i,'image_id'],[/banner description/i,'banner_alt'],[/banners|banner|content images/i,'image'],[/privacy notice.*version|approved privacy/i,'privacy_notice'],[/current password/i,'current'],[/password/i,'password']];
      const match=mappings.find(([pattern])=>pattern.test(message));if(match)fields[match[1]]=message;
      if(error instanceof multer.MulterError)fields[error.field || (['/admin/blog/save','/admin/news/save'].includes(req.path)?'image':'attachment')]=message;
      return res.status(status).json({error:message,fields});
    }
    res.status(status).render('error',{message,status,title:`Error ${status} — Kemsor CMS`,user:null,unreadCount:0,csrf:'',saved:false,currentPath:req.path,currentType:'',notifications:[],websiteUrl:process.env.WEBSITE_URL || '/',types});
  });
  return app;
}
