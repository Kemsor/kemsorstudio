import {parseRichText,richTextPlain} from '../public/rich-text-core.js';
import {Router} from 'express';
import {readFile} from 'node:fs/promises';
import {rows,json,audit} from './db.js';
import defaultSlides from '../../shared/hero-slides.json' with {type:'json'};

const fail=(ok,message,status=422)=>{if(!ok)throw Object.assign(new Error(message),{status});};
const text=(value,max=200,required=false)=>{fail(value===undefined||typeof value==='string','Invalid field.');const result=(value||'').trim();fail(result.length<=max&&(!required||result),'Complete required fields within their size limits.');return result;};
export function managedUrl(value,{video=false,required=false}={}) {
 const result=text(value,1500,required);if(!result)return '';
 fail(!result.startsWith('//')&&!/[\r\n]/.test(result),'Use a local path or HTTPS URL.');
 let url;try{url=new URL(result,'https://local.invalid');}catch{fail(false,'Enter a valid URL.');}
 fail((result.startsWith('/')||result.startsWith('#')||result.startsWith('https://'))&&!url.username&&!url.password,'Use a local path or HTTPS URL.');
 if(video)fail(url.pathname.toLowerCase().endsWith('.mp4'),'Use a direct MP4 video URL.');
 return result;
}
const date=value=>{const result=text(value,10);fail(!result||/^\d{4}-\d{2}-\d{2}$/.test(result)&&Number.isFinite(Date.parse(result))&&new Date(result).toISOString().slice(0,10)===result,'Use a valid date.');return result;};
export function legalSections(content) {
 const sections=[];
 for(const paragraph of content.split(/\n\s*\n/).map(item=>item.trim()).filter(Boolean)) {
  const heading=paragraph.match(/^(\d+)\.\s+([^\n]+)(?:\n([\s\S]*))?$/);
  if(heading)sections.push({number:heading[1],title:heading[2],paragraphs:heading[3]?[heading[3]]:[]});
  else {if(!sections.length)sections.push({number:'',title:'',paragraphs:[]});sections.at(-1).paragraphs.push(paragraph);}
 }
 return sections;
}
export function managedFields(kind,body) {
 if(kind==='legal') {
  let richText;try{richText=parseRichText(body.rich_text);}catch(error){throw Object.assign(new Error(error.message),{status:422});}
  const title=text(body.title,200,true),content=text(richText?richTextPlain(richText):body.content,60000,true);
  const email=text(body.email,254);fail(!email||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),'Enter a valid email address.');
  return {title,description:text(body.description,2000),content,...(richText?{richText}:{}),sections:legalSections(content),closing:text(body.closing,8000).split(/\n\s*\n/).filter(Boolean),effectiveDate:date(body.effectiveDate),revisedDate:date(body.revisedDate),version:text(body.version,100,true),website:managedUrl(body.website),email,footer:body.footer==='on',footerLabel:text(body.footerLabel,60)||title,position:position(body.position)};
 }
 fail(kind==='hero','Unknown content area.');
 const duration=Number(body.duration),startAt=Number(body.startAt||0);fail(Number.isFinite(duration)&&duration>=3&&duration<=30,'Slide duration must be between 3 and 30 seconds.');fail(Number.isFinite(startAt)&&startAt>=0&&startAt<=3600,'Use a valid start time.');
 const buttonLabel=text(body.buttonLabel,80),buttonHref=managedUrl(body.buttonHref);fail(Boolean(buttonLabel)===Boolean(buttonHref),'Provide both button text and its destination.');
 return {label:text(body.label,100,true),src:managedUrl(body.src,{video:true,required:true}),poster:managedUrl(body.poster,{required:true}),posterSrcSet:'',duration,startAt,position:position(body.position),title:text(body.title,200),description:text(body.description,2000),eyebrow:text(body.eyebrow,100),buttonLabel,buttonHref};
}
function position(value) {const result=Number(value||1);fail(Number.isInteger(result)&&result>=1&&result<=1000,'Order must be between 1 and 1000.');return result;}
export async function seedManagedContent(db) {
 const policy=JSON.parse(await readFile(new URL('../../rain-temp/src/pages/privacy-policy-content.json',import.meta.url),'utf8'));
 const privacy={title:'Privacy Policy',description:'How KEMSOR Studios Private Limited collects, uses and protects personal information.',content:policy.sections.map(section=>`${section.number}. ${section.title}\n\n${section.paragraphs.join('\n\n')}`).join('\n\n'),sections:policy.sections,closing:policy.closing,effectiveDate:'2026-11-01',revisedDate:'2026-11-01',version:'01-11-2026',website:'https://www.kemsorstudio.com',email:'info@kemsorstudio.com',footer:true,footerLabel:'Privacy Policy',position:1};
 const connection=await db.getConnection();
 try {
  await connection.beginTransaction();
  const legacy=await rows(connection,"SELECT *, (status='published' AND published_at<=UTC_TIMESTAMP()) AS live FROM cms_entries WHERE type='legal'");
  const imported=legacy.map((entry,index)=>['legal',entry.slug,{title:entry.title,description:entry.summary,content:entry.body||entry.summary||entry.title,sections:legalSections(entry.body||entry.summary||entry.title),closing:[],version:'preserved-original',effectiveDate:'',revisedDate:'',website:'',email:'',footer:false,footerLabel:entry.title,position:index+10},Boolean(entry.live)]);
  for(const [kind,slug,data,live=true] of [['legal','privacy-policy',privacy],...defaultSlides.map((slide,index)=>['hero',`studio-film-${index+1}`,slide]),...imported]) {
   const inserted=await rows(connection,'INSERT IGNORE INTO cms_managed_content(kind,slug,draft,published) VALUES(?,?,?,?)',[kind,slug,JSON.stringify(data),live?JSON.stringify(data):null]);
   if(inserted.affectedRows)await rows(connection,'INSERT INTO cms_managed_revisions(content_id,revision,action,snapshot) VALUES(?,1,"preserved-original",?)',[inserted.insertId,JSON.stringify({draft:data,published:live?data:null})]);
  }
  await connection.commit();
 }catch(error){await connection.rollback();throw error;}finally{connection.release();}
}
export async function publicManagedContent(db) {
 const records=await rows(db,'SELECT id,kind,slug,published FROM cms_managed_content WHERE published IS NOT NULL');
 const ordered=kind=>records.filter(row=>row.kind===kind).map(row=>({id:row.id,slug:row.slug,...json(row.published)})).sort((a,b)=>a.position-b.position||a.id-b.id);
 return {legalDocuments:ordered('legal'),heroSlides:ordered('hero')};
}
const view=row=>({...row,draft:json(row.draft),published:row.published?json(row.published):null});
export function managedContentRouter(db) {
 const router=Router();
 router.use('/admin/manage',(req,res,next)=>req.user?.role==='admin'?next():next(Object.assign(new Error('Administrator access required.'),{status:403})));
 router.get('/admin/manage/:kind',async(req,res)=>{fail(['legal','hero'].includes(req.params.kind),'Unknown content area.',404);const records=(await rows(db,'SELECT * FROM cms_managed_content WHERE kind=? ORDER BY id',[req.params.kind])).map(view);res.render('managed-list',{kind:req.params.kind,records});});
 router.get('/admin/manage/:kind/new',async(req,res)=>{fail(['legal','hero'].includes(req.params.kind),'Unknown content area.',404);res.render('managed-edit',{record:{kind:req.params.kind,draft:{duration:5,position:1},revision:0},revisions:[],media:await rows(db,'SELECT id,alt FROM cms_media WHERE mime LIKE "image/%" AND NOT EXISTS(SELECT 1 FROM talent_accounts t WHERE t.image_id=cms_media.id) ORDER BY id DESC LIMIT 200')});});
 router.get('/admin/manage/:kind/:id',async(req,res)=>{
  const row=(await rows(db,'SELECT * FROM cms_managed_content WHERE id=? AND kind=?',[req.params.id,req.params.kind]))[0];fail(row,'Content not found.',404);
  res.render('managed-edit',{record:view(row),revisions:await rows(db,'SELECT id,revision,action,created_at FROM cms_managed_revisions WHERE content_id=? ORDER BY revision DESC LIMIT 30',[row.id]),media:await rows(db,'SELECT id,alt FROM cms_media WHERE mime LIKE "image/%" AND NOT EXISTS(SELECT 1 FROM talent_accounts t WHERE t.image_id=cms_media.id) ORDER BY id DESC LIMIT 200')});
 });
 router.get('/admin/manage/:kind/:id/preview',async(req,res)=>{
  const row=(await rows(db,'SELECT * FROM cms_managed_content WHERE id=? AND kind=?',[req.params.id,req.params.kind]))[0];fail(row,'Content not found.',404);
  res.set('Content-Security-Policy',"default-src 'self'; img-src 'self' https:; media-src 'self' https:; style-src 'self'; script-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'self'");res.render('managed-preview',{record:view(row)});
 });
 router.post('/admin/manage/:kind/save',async(req,res)=>{
  const kind=req.params.kind,b=req.body;fail(['legal','hero'].includes(kind),'Unknown content area.');
  const action=b.action||'draft';fail(['draft','publish','unpublish'].includes(action),'Choose a valid action.');
  const draft=managedFields(kind,b),id=Number(b.id||0);
  const slug=text(b.slug,190,true);fail(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug),'Use lowercase letters, numbers and hyphens in the URL.');
  const connection=await db.getConnection();let contentId;
  try {
   await connection.beginTransaction();
   const previous=id?(await rows(connection,'SELECT * FROM cms_managed_content WHERE id=? AND kind=? FOR UPDATE',[id,kind]))[0]:null;
   fail(!id||previous,'Content not found.',404);fail(!previous||Number(b.revision)===previous.revision,'This content changed in another window. Reload before saving.',409);
   fail(!previous||previous.slug===slug,'Published URL keys cannot be changed.');
   if(kind==='hero'&&previous&&json(previous.draft).poster===draft.poster)draft.posterSrcSet=json(previous.draft).posterSrcSet||'';
   const published=action==='publish'?draft:action==='unpublish'?null:previous?.published?json(previous.published):null;
   const revision=(previous?.revision||0)+1;
   if(previous){contentId=id;await rows(connection,'UPDATE cms_managed_content SET draft=?,published=?,revision=?,updated_by=? WHERE id=?',[JSON.stringify(draft),published?JSON.stringify(published):null,revision,req.user.id,id]);}
   else {const insert=await rows(connection,'INSERT INTO cms_managed_content(kind,slug,draft,published,updated_by) VALUES(?,?,?,?,?)',[kind,slug,JSON.stringify(draft),published?JSON.stringify(published):null,req.user.id]);contentId=insert.insertId;}
   await rows(connection,'INSERT INTO cms_managed_revisions(content_id,revision,action,snapshot,created_by) VALUES(?,?,?,?,?)',[contentId,revision,action,JSON.stringify({draft,published}),req.user.id]);
   await audit(connection,req.user,`managed_${action}`,kind,contentId);await connection.commit();
  }catch(error){await connection.rollback();if(error.code==='ER_DUP_ENTRY')throw Object.assign(new Error('That URL key is already in use.'),{status:422});throw error;}finally{connection.release();}
  res.redirect(`/admin/manage/${kind}/${contentId}?saved=1`);
 });
 router.post('/admin/manage/:kind/:id/restore',async(req,res)=>{
  const connection=await db.getConnection();
  try {
   await connection.beginTransaction();const current=(await rows(connection,'SELECT * FROM cms_managed_content WHERE id=? AND kind=? FOR UPDATE',[req.params.id,req.params.kind]))[0];fail(current,'Content not found.',404);fail(Number(req.body.revision)===current.revision,'Reload before restoring an earlier version.',409);
   const old=(await rows(connection,'SELECT snapshot FROM cms_managed_revisions WHERE id=? AND content_id=?',[req.body.snapshot_id,current.id]))[0];fail(old,'Revision not found.',404);
   const snapshot=json(old.snapshot),revision=current.revision+1;
   await rows(connection,'UPDATE cms_managed_content SET draft=?,revision=?,updated_by=? WHERE id=?',[JSON.stringify(snapshot.draft),revision,req.user.id,current.id]);
   await rows(connection,'INSERT INTO cms_managed_revisions(content_id,revision,action,snapshot,created_by) VALUES(?,?,"restore-draft",?,?)',[current.id,revision,JSON.stringify({draft:snapshot.draft,published:current.published?json(current.published):null}),req.user.id]);
   await audit(connection,req.user,'managed_restore_draft',current.kind,current.id);await connection.commit();
  }catch(error){await connection.rollback();throw error;}finally{connection.release();}
  res.redirect(`/admin/manage/${req.params.kind}/${req.params.id}?saved=1`);
 });
 return router;
}
