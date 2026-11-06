import PageBreadcrumbs from '../PageBreadcrumbs';
import {cmsText,cmsData} from "../siteContent.js";
import React, {useMemo,useState} from 'react';
import {ArrowUpRight,ArrowRight,Search,Compass} from 'lucide-react';
import {useCms} from '../CmsContent';
import {legalHref} from '../LegalDocument';
import {sitemapGroups} from '../sitePages';
import './sitemap-page.css';

const descriptions=cmsData(()=>([
 cmsText("SitemapPage","02dd24af23b3f0c6","Meet the studio. Discover our approach and ways to work together."),
 cmsText("SitemapPage","298b5dc33e57145c","Explore the stories, formats and productions taking shape."),
 cmsText("SitemapPage","480bdbe18179c418","From the first idea to a story ready for the screen."),
 cmsText("SitemapPage","906a43e6ab1a1b1b","Build the partnerships and financial foundations behind a film."),
 cmsText("SitemapPage","9b1b176cbff0481c","The people, places and craft that bring a story to life."),
 cmsText("SitemapPage","faf4d810b55fa837","Shape the final frame and take it to audiences everywhere."),
 cmsText("SitemapPage","5e96a1cdda167d80","Find collaborators, share your story and access your workspace."),
 cmsText("SitemapPage","089450495666a245","Studio updates, press resources and the details that matter."),
]));
export default function SitemapPage(){
 const {legalDocuments}=useCms();
 const [query,setQuery]=useState('');
 const groups=useMemo(()=>sitemapGroups.map((group,index)=>({...group,id:`directory-${index+1}`,number:String(index+1).padStart(2,'0'),description:descriptions[index],pages:group.title===cmsText("SitemapPage","7d55f8815eb8e152","News & information")&&legalDocuments?.length?[...group.pages.filter(page=>page.key!=='privacy-policy'),...legalDocuments.map(document=>({key:document.slug,href:legalHref(document.slug),label:document.title}))].filter((page,index,pages)=>pages.findIndex(item=>item.href===page.href)===index):group.pages})),[legalDocuments]);
 const count=new Set(groups.flatMap(group=>group.pages.map(page=>page.href))).size;
 const search=query.trim().toLocaleLowerCase();
 const visible=groups.map(group=>({...group,pages:group.pages.filter(page=>`${page.label} ${group.title}`.toLocaleLowerCase().includes(search))})).filter(group=>group.pages.length);
 const matched=visible.reduce((sum,group)=>sum+group.pages.length,0);
 return <div className="sitemap-page">

  <header className="sitemap-header">
   <div className="sitemap-intro"><p className="sitemap-eyebrow"><span/>{cmsText("SitemapPage","4380934412b3f7c3","THE STUDIO DIRECTORY")}</p><h1>{cmsText("SitemapPage","18c381d77aee0894","Every story starts")}<br/>{cmsText("SitemapPage","c561d6b1dc802ca1","somewhere.")}</h1><p className="sitemap-summary">{cmsText("SitemapPage","143679fba8d1daa7","Browse KEMSOR’s studio pages, productions, services and contact information.")}</p><div className="sitemap-facts"><span><strong>{count}</strong>{cmsText("SitemapPage","0b7438d771a05ddc"," pages to explore")}</span><span><strong>{groups.length}</strong>{cmsText("SitemapPage","1ca034b6ef76c3ae"," sections, one studio")}</span></div></div>
   <aside className="sitemap-start"><Compass size={32} strokeWidth={1.2} aria-hidden="true"/><p className="sitemap-eyebrow">{cmsText("SitemapPage","0736f7eb6ba7af04","EXPLORE THE WEBSITE")}</p><h2>{cmsText("SitemapPage","8783b2bfbfab7f1d","Where would you")}<br/>{cmsText("SitemapPage","6d34f434d404a8cf","like to begin?")}</h2><div>{[[cmsText("SitemapPage","2d792856258857f0","Explore productions"),'/productions/'],[cmsText("SitemapPage","874514ca86297dbb","Discover our capabilities"),'/services/'],[cmsText("SitemapPage","caeceda905f3b683","Start a conversation"),'/contact/']].map(([label,href])=><a key={href} href={href}>{label}<ArrowUpRight size={18} aria-hidden="true"/></a>)}</div></aside>
  </header><PageBreadcrumbs page="sitemap"><nav className="sitemap-breadcrumb" aria-label="Breadcrumb"><a href="/">{cmsText("SitemapPage","81c8f5452458841b","KEMSOR Studios")}</a><span aria-hidden="true">/</span><span aria-current="page">{cmsText("SitemapPage","e25ab3f12f51d26b","Sitemap")}</span></nav></PageBreadcrumbs>
  <section className="sitemap-directory" aria-labelledby="sitemap-directory-title">
   <div className="sitemap-tools"><div><p className="sitemap-eyebrow">{cmsText("SitemapPage","cdab283e80ca97a5","THE COMPLETE PICTURE")}</p><h2 id="sitemap-directory-title">{cmsText("SitemapPage","830898ef792f0200","Explore the website")}</h2></div><div className="sitemap-search"><Search size={19} aria-hidden="true"/><label className="sitemap-sr-only" htmlFor="sitemap-search">{cmsText("SitemapPage","53a2954559648f7f","Search pages and sections")}</label><input id="sitemap-search" type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Find a page or section…" autoComplete="off"/>{query&&<button type="button" onClick={()=>setQuery('')}>{cmsText("SitemapPage","21156b2fde2d2432","Clear")}</button>}</div></div>
   <nav className="sitemap-jumps" aria-label="Sitemap sections">{visible.map(group=><a key={group.id} href={`#${group.id}`}>{group.title}<ArrowRight size={13} aria-hidden="true"/></a>)}</nav>
   <p className="sitemap-results" role="status">{search?`${matched} ${matched===1?'page':'pages'} found for “${query.trim()}”`:`Browse all ${count} pages below.`}</p>
   <div className="sitemap-groups">{visible.map(group=><section className="sitemap-card" id={group.id} key={group.id} aria-labelledby={`${group.id}-title`}><div className="sitemap-card-heading"><span className="sitemap-page-count">{group.pages.length} {group.pages.length===1?'page':'pages'}</span></div><h3 id={`${group.id}-title`}>{group.title}</h3><p>{group.description}</p><ul>{group.pages.map(page=><li key={page.href}><a href={page.href} aria-current={page.key==='sitemap'?'page':undefined}><span>{page.label}</span><ArrowUpRight size={17} strokeWidth={1.5} aria-hidden="true"/></a></li>)}</ul></section>)}</div>
   {!visible.length&&<div className="sitemap-empty"><Compass size={36} aria-hidden="true"/><h3>{cmsText("SitemapPage","22c45963b7538389","Let’s find another way.")}</h3><p>{cmsText("SitemapPage","5accf1742e91a23c","No pages match your search. Try “productions”, “careers” or “studio”.")}</p><button type="button" onClick={()=>setQuery('')}>{cmsText("SitemapPage","bf9e8655d20671aa","Show all pages ")}<ArrowRight size={16} aria-hidden="true"/></button></div>}
  </section>
  <div className="sitemap-bottom"><div><p className="sitemap-eyebrow">{cmsText("SitemapPage","3f8f420ea2af244a","CONTACT KEMSOR")}</p><h2>{cmsText("SitemapPage","6815e9a4f4a24725","Still looking for something?")}</h2></div><a href="/contact/">{cmsText("SitemapPage","dc9dc0e900fe7b24","Talk to the studio ")}<ArrowUpRight size={20} aria-hidden="true"/></a></div>
 </div>;
}
