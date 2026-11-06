import PageBreadcrumbs from './PageBreadcrumbs';
import RichText from './RichText';
import React from 'react';
import './pages/privacy-policy.css';

export const legalHref = slug => slug==='privacy-policy'?'/privacy-policy/':`/legal/${slug}/`;
export function legalSlug(pathname) {return pathname.match(/\/legal\/([a-z0-9-]+)\/?$/)?.[1]||null;}
const formatDate=value=>{if(!value)return '';return new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(`${value}T00:00:00Z`));};
export default function LegalDocument({ document:policy }) {
 return <article className="privacy-policy-page" aria-labelledby="privacy-policy-title"><header className="privacy-policy-header">

  <p className="privacy-policy-eyebrow">KEMSOR STUDIOS PRIVATE LIMITED</p><h1 id="privacy-policy-title">{policy.title}</h1>
  <div className="privacy-policy-dates">{policy.effectiveDate&&<p>Effective Date: <time dateTime={policy.effectiveDate}>{formatDate(policy.effectiveDate)}</time></p>}{policy.revisedDate&&<p>Last Revised: <time dateTime={policy.revisedDate}>{formatDate(policy.revisedDate)}</time></p>}</div>
  {policy.website&&<p>Website: <a href={policy.website}>{policy.website.replace(/^https?:\/\//,'')}</a></p>}
 </header><PageBreadcrumbs><nav className="site-breadcrumb" aria-label="Breadcrumb"><a href="/">Kemsor Studios</a><span aria-hidden="true">/</span><a href="/legal/">Legal</a><span aria-hidden="true">/</span><span aria-current="page">{policy.title}</span></nav></PageBreadcrumbs><div className="privacy-policy-layout"><nav className="privacy-policy-contents" aria-label="Policy contents"><p>IN THIS POLICY</p><ol>{policy.sections.map((section,index)=>section.title&&<li key={index}><a href={`#privacy-section-${section.number||index+1}`}>{section.title.toLowerCase()}</a></li>)}</ol></nav><div className="privacy-policy-copy">{policy.richText?<RichText document={policy.richText} legalAnchors/>:policy.sections.map((section,index)=><section id={`privacy-section-${section.number||index+1}`} key={index}>{section.title&&<h2>{section.number&&`${section.number}. `}{section.title}</h2>}{section.paragraphs.map((paragraph,position)=><p key={position}>{paragraph}</p>)}</section>)}<div className="privacy-policy-signoff">{(policy.closing||[]).map((paragraph,index)=><p key={index}>{paragraph}</p>)}{policy.email&&<a href={`mailto:${policy.email}`}>Contact privacy & grievances</a>}</div></div></div></article>;
}
