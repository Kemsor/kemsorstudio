import {Router} from 'express';
import {randomBytes,createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {rows,json,audit} from './db.js';
import {canEdit} from './security.js';
import {epkMode} from './epk-fields.js';
import {publicProductionMetadata} from './production-records.js';
const ensure=(ok,message,status=422)=>{if(!ok)throw Object.assign(new Error(message),{status});};
const digest=token=>createHash('sha256').update(token).digest('hex');
const storage=fileURLToPath(new URL('../storage/uploads/',import.meta.url));
async function epkData(db,entry){
 const metadata=json(entry.metadata),ids=(metadata.epk_people||[]).map(item=>item.person_id);
 const people=ids.length?await rows(db,`SELECT id,name,profession,biography FROM production_people WHERE status='published' AND published_at<=UTC_TIMESTAMP() AND id IN (${ids.map(()=>'?').join(',')})`,ids):[];
 // Use public production facts even for private-link kits. Internal contracts never enter a kit.
 const facts=publicProductionMetadata({...metadata,epk_mode:'public'});
 return {entry,metadata:facts,people:ids.map(id=>people.find(person=>person.id===id)).filter(Boolean)};
}
function headers(res){res.set({'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; img-src 'self' data:; form-action 'self'; base-uri 'none'; frame-ancestors 'none'"});}
async function prepare(db,entry,format){
 const metadata=json(entry.metadata);
 if(format==='pdf'){
  if(epkMode(metadata)==='public'){const restricted=await rows(db,`SELECT id FROM cms_entries WHERE type='production' AND id<>? AND JSON_UNQUOTE(JSON_EXTRACT(metadata,'$.epk_url'))=? AND COALESCE(JSON_UNQUOTE(JSON_EXTRACT(metadata,'$.epk_mode')),'public')<>'public' LIMIT 1`,[entry.id,metadata.epk_url||'']);ensure(!restricted.length,'Press kit not found.',404);}
  const match=metadata.epk_url?.match(/^\/media\/(\d+)\/document\.pdf$/);ensure(match,'Press kit not found.',404);const file=(await rows(db,'SELECT filename FROM cms_media WHERE id=? AND mime="application/pdf"',[match[1]]))[0];ensure(file,'Press kit not found.',404);try{return {pdf:await readFile(path.join(storage,path.basename(file.filename)))};}catch(error){if(error.code==='ENOENT')throw Object.assign(new Error('Press kit not found.'),{status:404});throw error;}}
 ensure(metadata.epk_structured,'Structured press kit not found.',404);return epkData(db,entry);
}
async function send(res,entry,format,data,base){headers(res);if(format==='pdf')return res.type('application/pdf').attachment(`${entry.slug}-press-kit.pdf`).send(data.pdf);
 if(format==='html')res.attachment(`${entry.slug}-press-kit.html`);
 return res.render('press-kit',{...data,base,download:format==='html'});
}
const live="SELECT id,title,slug,summary,body,metadata FROM cms_entries WHERE type='production' AND status='published' AND published_at<=UTC_TIMESTAMP()";
export function publicEpkRouter(db){
 const router=Router();
 const publicRoute=async(req,res,format)=>{
  const entry=(await rows(db,live+' AND slug=?',[req.params.slug]))[0];ensure(entry&&epkMode(json(entry.metadata))==='public','Press kit not found.',404);
  const data=await prepare(db,entry,format);return send(res,entry,format,data,`/productions/${entry.slug}/`);
 };
 router.get('/productions/:slug/press-kit.pdf',(req,res)=>publicRoute(req,res,'pdf'));
 router.get('/productions/:slug/press-kit.html',(req,res)=>publicRoute(req,res,'html'));
 router.get('/productions/:slug/press-kit/',(req,res)=>publicRoute(req,res,'view'));
 const privateRoute=async(req,res,format)=>{
  headers(res);ensure(/^[A-Za-z0-9_-]{43}$/.test(req.params.token),'Press kit not found.',404);
  const connection=await db.getConnection();let entry,data;
  try{await connection.beginTransaction();const grant=(await rows(connection,'SELECT * FROM production_epk_grants WHERE token_hash=? AND revoked_at IS NULL AND expires_at>UTC_TIMESTAMP() AND downloads<max_downloads FOR UPDATE',[digest(req.params.token)]))[0];ensure(grant,'This press-kit link is invalid, expired or exhausted.',404);
   entry=(await rows(connection,live+' AND id=? FOR UPDATE',[grant.production_id]))[0];ensure(entry&&epkMode(json(entry.metadata))==='link_only','Press kit not found.',404);data=await prepare(connection,entry,format);
   if(format!=='view'&&req.method!=='HEAD')await rows(connection,'UPDATE production_epk_grants SET downloads=downloads+1 WHERE id=?',[grant.id]);await connection.commit();
  }catch(error){await connection.rollback();throw error;}finally{connection.release();}
  return send(res,entry,format,data,`/press-access/${req.params.token}/`);
 };
 router.get('/press-access/:token/press-kit.pdf',(req,res)=>privateRoute(req,res,'pdf'));
 router.get('/press-access/:token/press-kit.html',(req,res)=>privateRoute(req,res,'html'));
 router.get('/press-access/:token/',(req,res)=>privateRoute(req,res,'view'));
 router.use((error,req,res,next)=>{if(error.status!==404)return next(error);headers(res);res.status(404).type('html').send('<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Press kit unavailable | Kemsor Studios</title><style>body{font:18px/1.7 Arial,sans-serif;background:#f2e8d7;color:#251c12;max-width:680px;margin:10vh auto;padding:24px}h1{font-family:Georgia,serif}a{color:inherit}</style></head><body><h1>Press kit unavailable</h1><p>This kit is unavailable, or the share link has expired, been revoked or reached its download limit. Please request a new link from the studio.</p><a href="/contact/">Contact the studio</a></body></html>');});return router;
}
export function epkAdminRouter(db){
 const router=Router();router.use('/admin/production-epks',(req,res,next)=>canEdit(req.user)?next():next(Object.assign(new Error('Publishing access required.'),{status:403})));
 const record=async id=>{const entry=(await rows(db,"SELECT id,title,slug,summary,body,metadata,status FROM cms_entries WHERE type='production' AND id=?",[id]))[0];ensure(entry,'Production not found.',404);return entry;};
 async function render(req,res,newLink=null){const entry=await record(req.params.id);res.set('Cache-Control','no-store');res.render('epk-access',{entry,mode:epkMode(json(entry.metadata)),grants:await rows(db,'SELECT id,label,expires_at,max_downloads,downloads,revoked_at FROM production_epk_grants WHERE production_id=? ORDER BY id DESC LIMIT 100',[entry.id]),newLink});}
 router.get('/admin/production-epks/:id',(req,res)=>render(req,res));
 router.get('/admin/production-epks/:id/preview',async(req,res)=>{const entry=await record(req.params.id);const data=await epkData(db,entry);headers(res);res.render('press-kit',{...data,base:null,download:false});});
 router.post('/admin/production-epks/:id/grants',async(req,res)=>{
  const entry=await record(req.params.id);ensure(epkMode(json(entry.metadata))==='link_only','Set EPK access to private link before creating a share link.');
  const days=Number(req.body.days),max=Number(req.body.max_downloads),label=typeof req.body.label==='string'?req.body.label.trim():'';ensure(label&&label.length<=200&&Number.isInteger(days)&&days>=1&&days<=30&&Number.isInteger(max)&&max>=1&&max<=100,'Add a label, 1–30 expiry days and 1–100 downloads.');
  const token=randomBytes(32).toString('base64url');await rows(db,'INSERT INTO production_epk_grants(production_id,token_hash,label,expires_at,max_downloads,created_by) VALUES(?,?,?,DATE_ADD(UTC_TIMESTAMP(),INTERVAL ? DAY),?,?)',[entry.id,digest(token),label,days,max,req.user.id]);await audit(db,req.user,'grant_created','production_epk',entry.id);return render(req,res,new URL(`/press-access/${token}/`,`${req.protocol}://${req.get('host')}`).href);
 });
 router.post('/admin/production-epks/:id/grants/:grantId/revoke',async(req,res)=>{const result=await rows(db,'UPDATE production_epk_grants SET revoked_at=UTC_TIMESTAMP() WHERE id=? AND production_id=? AND revoked_at IS NULL',[req.params.grantId,req.params.id]);ensure(result.affectedRows,'Active link not found.',404);await audit(db,req.user,'grant_revoked','production_epk',req.params.id);res.redirect(303,`/admin/production-epks/${req.params.id}`);});return router;
}
