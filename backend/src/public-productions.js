import {resolveProductionPeople} from './production-people.js';
import {productionExtraHtml} from './production-extra-html.js';
import {fileURLToPath} from 'node:url';
import {Router} from 'express';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {rows,json} from './db.js';
import {publicProductionMetadata} from './production-records.js';
import {websiteDirectory} from './website.js';
import {richTextHtml} from '../public/rich-text-core.js';
import {productionSeo,productionHref} from '../../rain-temp/src/productionSeo.js';
import {seoMetaTags,schemaJson,defaultSiteUrl} from '../../rain-temp/src/seo.js';
const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export const publishedProductionsSql='SELECT e.id,e.title,e.slug,e.summary,e.body,e.metadata,e.image_id,m.alt AS image_alt FROM cms_entries e LEFT JOIN cms_media m ON m.id=e.image_id WHERE e.type="production" AND e.status="published" AND e.published_at<=UTC_TIMESTAMP()';
export function publicProductionsRouter(db,directory=websiteDirectory){
 const router=Router();
 router.get('/productions/:slug',async(req,res)=>{
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(req.params.slug))return res.status(404).send('Production not found.');
  const entry=(await rows(db,`${publishedProductionsSql} AND e.slug=? LIMIT 1`,[req.params.slug]))[0];
  if(!entry)return res.status(404).set('X-Robots-Tag','noindex').send('Production not found.');
  if(!req.path.endsWith('/'))return res.redirect(301,productionHref(entry.slug));
  const record={id:entry.id,title:entry.title,slug:entry.slug,summary:entry.summary,body:entry.body,metadata:await resolveProductionPeople(db,publicProductionMetadata(json(entry.metadata)||{})),image_url:entry.image_id?`/media/${entry.image_id}`:null,image_alt:entry.image_alt};
  let html;try{html=await readFile(path.join(directory,'productions/index.html'),'utf8');}catch(error){if(error.code==='ENOENT')return res.status(503).send('Website build is not available.');throw error;}
  const seo=productionSeo(record,{origin:process.env.SITE_URL||process.env.VITE_SITE_URL||defaultSiteUrl});
  html=html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi,'').replace(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/gi,'').replace(/<meta\b(?=[^>]*(?:name|property)=["'](?:description|robots|og:[^"']+|twitter:[^"']+)["'])[^>]*>/gi,'').replace(/<script\b[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/gi,'');
  const tags=[`<title>${escape(seo.title)}</title>`,`<link rel="canonical" href="${escape(seo.canonical)}">`,...seoMetaTags(seo).map(attrs=>`<meta ${Object.entries(attrs).map(([key,value])=>`${key}="${escape(value)}"`).join(' ')}>`),`<script type="application/ld+json" id="site-structured-data">${schemaJson(seo.schema)}</script>`];
  const meta=record.metadata;
  const facts=[['Status',String(meta.production_stage||'').replaceAll('_',' ')],['Format',meta.format],['Genres',meta.genres?.join(', ')],['Languages',meta.language],['Year',meta.year],['Release date',meta.release_date]].filter(([,value])=>value);
  const creditsHtml=[['Cast',meta.cast_credits],['Crew',meta.crew_credits],['Contributors',meta.contributor_credits]].filter(([,credits])=>credits?.length).map(([label,credits])=>`<section class="production-credits"><h2>${label}</h2><ul>${credits.map(credit=>`<li><strong>${credit.profile?`<a href="/people/${credit.profile.slug}/">${escape(credit.name)}</a>`:escape(credit.name)}</strong>${credit.role?`<span>${escape(credit.role)}</span>`:''}</li>`).join('')}</ul></section>`).join('');
  const galleryHtml=meta.gallery?.length?`<section class="production-gallery"><h2>Gallery</h2>${meta.gallery.map(item=>`<figure><a href="/media/${item.media_id}"><img src="/media/${item.media_id}" alt="${escape(item.alt)}" loading="lazy"></a><figcaption>${item.kind==='behind_the_scenes'?'Behind the scenes':'Production still'}${item.caption?` — ${escape(item.caption)}`:''}</figcaption></figure>`).join('')}</section>`:'';
  const epkHtml=(meta.epk_url||meta.epk_structured)?`<section class="production-press-kit"><h2>Press kit</h2><p>Download the approved electronic press kit for this production.</p>${meta.epk_structured?`<a href="${productionHref(entry.slug)}press-kit/">View structured press kit</a>`:''}${meta.epk_url?`<a href="${productionHref(entry.slug)}press-kit.pdf" download>Download press kit (PDF)</a>`:''}</section>`:'';
  const content=`<main class="production-detail"><nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/productions/">Productions</a> / ${escape(record.title)}</nav><h1>${escape(record.title)}</h1><p>${escape(record.summary)}</p>${record.image_url?`<img src="${record.image_url}" alt="${escape(record.image_alt||record.title)}">`:''}<dl>${facts.map(([label,value])=>`<dt>${label}</dt><dd>${escape(value)}</dd>`).join('')}</dl><h2>Synopsis</h2>${meta.rich_text?richTextHtml(meta.rich_text):`<p>${escape(record.body)}</p>`}${creditsHtml}${productionExtraHtml(meta)}${epkHtml}${galleryHtml}</main>`;
  html=html.replace(/data-page=["']productions["']/,'data-page="production-detail"').replace(/<div id="root"><\/div>/,()=>`<div id="root">${content}</div><script id="production-record" type="application/json">${schemaJson(record)}</script>`).replace('</head>',()=>tags.join('\n')+'\n</head>');
  res.set({'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}).type('html').send(html);
 });
 return router;
}
