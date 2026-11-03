import {Router} from 'express';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {publicManagedContent} from './managed-content.js';
import {websiteDirectory} from './website.js';
import {pageSeo,seoMetaTags,schemaJson,defaultSiteUrl,siteOrigin} from '../../rain-temp/src/seo.js';
import {sitePages} from '../../rain-temp/src/sitePages.js';
const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const href=slug=>slug==='privacy-policy'?'/privacy-policy/':`/legal/${slug}/`;
export function publicLegalRouter(db,directory=websiteDirectory) {
 const router=Router();
 const origin=()=>siteOrigin(process.env.SITE_URL||process.env.VITE_SITE_URL||defaultSiteUrl);
 router.get('/legal/:slug',async(req,res)=>{
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(req.params.slug))return res.status(404).send('Document not found.');
  const document=(await publicManagedContent(db)).legalDocuments.find(item=>item.slug===req.params.slug);
  if(!document)return res.status(404).send('Document not found.');
  if(document.slug==='privacy-policy')return res.redirect(301,'/privacy-policy/');
  let html;try{html=await readFile(path.join(directory,'legal/index.html'),'utf8');}catch(error){if(error.code==='ENOENT')return res.status(503).send('Website build is not available.');throw error;}
  const seo=pageSeo('legal',{origin:origin(),href:href(document.slug),label:document.title,title:`${document.title} | Kemsor Studios`,description:document.description});
  html=html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi,'').replace(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/gi,'').replace(/<meta\b(?=[^>]*(?:name|property)=["'](?:description|robots|og:[^"']+|twitter:[^"']+)["'])[^>]*>/gi,'').replace(/<script\b[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/gi,'');
  const tags=[`<title>${escape(seo.title)}</title>`,`<link rel="canonical" href="${escape(seo.canonical)}">`,...seoMetaTags(seo).map(attrs=>`<meta ${Object.entries(attrs).map(([key,value])=>`${key}="${escape(value)}"`).join(' ')}>`),`<script type="application/ld+json" id="site-structured-data">${schemaJson(seo.schema)}</script>`];
  res.set({'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'}).type('html').send(html.replace('</head>',tags.join('\n')+'\n</head>'));
 });
 router.get('/sitemap.xml',async(req,res)=>{
  const documents=(await publicManagedContent(db)).legalDocuments;
  const urls=new Set([...sitePages.filter(page=>page.indexable&&(page.key!=='privacy-policy'||documents.some(item=>item.slug==='privacy-policy'))).map(page=>page.href),...documents.map(document=>href(document.slug))]);
  res.set('Cache-Control','no-cache').type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...urls].map(url=>`<url><loc>${escape(new URL(url,origin()).href)}</loc></url>`).join('\n')}\n</urlset>`);
 });
 return router;
}
