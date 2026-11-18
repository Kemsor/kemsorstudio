import {Router} from 'express';
import {rows,audit,json} from './db.js';
import {canEdit} from './security.js';
import {productionText,productionUrl} from './production-extensions.js';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {websiteDirectory} from './website.js';
import {personSeo} from '../../rain-temp/src/personSeo.js';
import {seoMetaTags,schemaJson,defaultSiteUrl} from '../../rain-temp/src/seo.js';
const ensure=(ok,message,status=422)=>{if(!ok)throw Object.assign(new Error(message),{status});};
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export async function resolveProductionPeople(db,metadata){
 const ids=[...new Set(['cast_credits','crew_credits','contributor_credits'].flatMap(key=>(metadata[key]||[]).map(credit=>credit.person_id).filter(Boolean)))];
 const people=ids.length?await rows(db,`SELECT id,slug,name FROM production_people WHERE id IN (${ids.map(()=>'?').join(',')}) AND status='published' AND published_at<=UTC_TIMESTAMP()`,ids):[];
 return {...metadata,...Object.fromEntries(['cast_credits','crew_credits','contributor_credits'].map(key=>[key,(metadata[key]||[]).map(credit=>({...credit,...(people.find(person=>person.id===credit.person_id)?{profile:people.find(person=>person.id===credit.person_id)}:{})}))]))};
}
export function publicPeopleRouter(db,directory=websiteDirectory){
 const router=Router();router.get('/people/:slug',async(req,res)=>{
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(req.params.slug))return res.status(404).send('Profile not found.');
  const person=(await rows(db,"SELECT p.id,p.slug,p.name,p.profession,p.biography,p.website,p.image_id,m.alt AS image_alt FROM production_people p LEFT JOIN cms_media m ON m.id=p.image_id WHERE p.slug=? AND p.status='published' AND p.published_at<=UTC_TIMESTAMP()",[req.params.slug]))[0];if(!person)return res.status(404).set('X-Robots-Tag','noindex').send('Profile not found.');
  if(!req.path.endsWith('/'))return res.redirect(301,`/people/${person.slug}/`);
  person.image_url=person.image_id?`/media/${person.image_id}`:null;
  const creditMatch=['cast_credits','crew_credits','contributor_credits'].map(key=>`JSON_CONTAINS(COALESCE(JSON_EXTRACT(metadata,'$.${key}'),JSON_ARRAY()),JSON_OBJECT('person_id',?))`).join(' OR ');
  person.productions=await rows(db,`SELECT title,slug FROM cms_entries WHERE type='production' AND status='published' AND published_at<=UTC_TIMESTAMP() AND (${creditMatch}) ORDER BY published_at DESC,id DESC`,[person.id,person.id,person.id]);
  let html;try{html=await readFile(path.join(directory,'productions/index.html'),'utf8');}catch(error){if(error.code==='ENOENT')return res.status(503).send('Website build unavailable.');throw error;}
  const seo=personSeo(person,{origin:process.env.SITE_URL||process.env.VITE_SITE_URL||defaultSiteUrl});
  html=html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi,'').replace(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/gi,'').replace(/<meta\b(?=[^>]*(?:name|property)=["'](?:description|robots|og:[^"']+|twitter:[^"']+)["'])[^>]*>/gi,'').replace(/<script\b[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/gi,'');
  const tags=[`<title>${escape(seo.title)}</title>`,`<link rel="canonical" href="${escape(seo.canonical)}">`,...seoMetaTags(seo).map(attrs=>`<meta ${Object.entries(attrs).map(([key,value])=>`${key}="${escape(value)}"`).join(' ')}>`),`<script type="application/ld+json" id="site-structured-data">${schemaJson(seo.schema)}</script>`];
  const content=`<main class="production-detail"><h1>${escape(person.name)}</h1><p>${escape(person.profession)}</p>${person.image_url?`<img src="${person.image_url}" alt="${escape(person.image_alt||person.name)}">`:''}<h2>Biography</h2><p>${escape(person.biography)}</p>${person.website?`<a href="${escape(person.website)}" rel="noopener noreferrer">Official website</a>`:''}<h2>Productions</h2><ul>${person.productions.map(production=>`<li><a href="/productions/${production.slug}/">${escape(production.title)}</a></li>`).join('')}</ul></main>`;
  res.set({'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}).type('html').send(html.replace('data-page="productions"','data-page="person-detail"').replace(/<div id="root"><\/div>/,()=>`<div id="root">${content}</div><script type="application/json" id="person-record">${schemaJson(person)}</script>`).replace('</head>',()=>tags.join('\n')+'</head>'));
 });return router;
}
export function productionPeopleRouter(db){
 const router=Router();router.use('/admin/people',(req,res,next)=>canEdit(req.user)?next():next(Object.assign(new Error('Publishing access required.'),{status:403})));
 const media=()=>rows(db,"SELECT m.id,m.original_name,m.alt FROM cms_media m WHERE m.mime LIKE 'image/%' AND NOT EXISTS(SELECT 1 FROM talent_accounts t WHERE t.image_id=m.id) ORDER BY m.id DESC");
 router.get('/admin/people',async(req,res)=>{const page=Math.max(1,Math.min(10000,Number.parseInt(req.query.page,10)||1));const people=await rows(db,'SELECT id,name,profession,status,slug FROM production_people ORDER BY id DESC LIMIT 31 OFFSET ?',[(page-1)*30]);res.render('production-people',{people:people.slice(0,30),page,hasMore:people.length>30});});
 router.get('/admin/people/new',async(req,res)=>res.render('production-person-edit',{person:{status:'draft'},media:await media()}));
 router.get('/admin/people/:id',async(req,res)=>{const person=(await rows(db,'SELECT * FROM production_people WHERE id=?',[req.params.id]))[0];ensure(person,'Person not found.',404);res.render('production-person-edit',{person,media:await media()});});
 router.post('/admin/people/save',async(req,res)=>{
  const b=req.body,name=productionText(b.name,160,'Name',true),profession=productionText(b.profession,200,'Profession'),biography=productionText(b.biography,15000,'Biography',true),website=productionUrl(b.website,'Official website');ensure(['draft','published','archived'].includes(b.status),'Choose a valid status.');
  const imageId=b.image_id?Number(b.image_id):null;if(imageId!==null)ensure(Number.isSafeInteger(imageId)&&imageId>0,'Choose a valid portrait.');if(imageId)ensure((await rows(db,"SELECT m.id FROM cms_media m WHERE m.id=? AND m.mime LIKE 'image/%' AND NOT EXISTS(SELECT 1 FROM talent_accounts t WHERE t.image_id=m.id)",[imageId])).length,'Choose an existing studio portrait.');
  const id=b.id?Number(b.id):null;let saved=id;if(id!==null)ensure(Number.isSafeInteger(id)&&id>0,'Choose a valid profile.');
  if(id){ensure(Number.isSafeInteger(id)&&id>0,'Choose a valid profile.');ensure((await rows(db,'SELECT id FROM production_people WHERE id=?',[id])).length,'Person not found.',404);await rows(db,"UPDATE production_people SET name=?,profession=?,biography=?,website=?,image_id=?,status=?,published_at=IF(?='published',COALESCE(published_at,UTC_TIMESTAMP()),published_at),updated_by=? WHERE id=?",[name,profession,biography,website,imageId,b.status,b.status,req.user.id,id]);}
  else{const base=name.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,140)||'person';let slug=base;for(let i=2;(await rows(db,'SELECT id FROM production_people WHERE slug=?',[slug])).length;i++)slug=`${base}-${i}`;try{saved=(await rows(db,"INSERT INTO production_people(slug,name,profession,biography,website,image_id,status,published_at,created_by,updated_by) VALUES(?,?,?,?,?,?,?,IF(?='published',UTC_TIMESTAMP(),NULL),?,?)",[slug,name,profession,biography,website,imageId,b.status,b.status,req.user.id,req.user.id])).insertId;}catch(error){if(error.code==='ER_DUP_ENTRY')throw Object.assign(new Error('A matching profile was just created. Please retry.'),{status:409});throw error;}}
  await audit(db,req.user,id?'update':'create','production_person',saved);res.redirect(303,`/admin/people/${saved}?saved=1`);
 });return router;
}
