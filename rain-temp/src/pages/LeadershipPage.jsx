import PageBreadcrumbs from '../PageBreadcrumbs';
import React from 'react';
import {ArrowUpRight,Award,Quote} from 'lucide-react';
import StudioImage from '../StudioImage';
import {cmsDocument} from '../siteContent';
import defaults from '../../../shared/leadership-content.json';
import './leadership-page.css';
const content=cmsDocument('leadership',defaults);
export default function LeadershipPage(){
 const suppliedPortrait=content.portrait===defaults.portrait;
 return <div className="leadership-page">
  <div className="leadership-width">

   <header className="leadership-heading"><p className="leadership-kicker">{content.eyebrow}</p><h1>{content.pageTitle}</h1><span className="leadership-heading-mark" aria-hidden="true">K / STUDIO</span></header><PageBreadcrumbs page="leadership"><nav className="leadership-breadcrumb" aria-label="Breadcrumb"><a href="/">KEMSOR Studios</a><span aria-hidden="true">/</span><a href="/about/">Studio</a><span aria-hidden="true">/</span><span aria-current="page">{content.pageTitle}</span></nav></PageBreadcrumbs>
   <section className="leadership-profile" aria-labelledby="founder-name">
    <figure className="leadership-portrait"><StudioImage mediaSlot="LeadershipPortrait" src={content.portrait} srcSet={suppliedPortrait?[480,768,1023].map(width=>`/assets/leadership/dev-raturi-${width}.webp ${width}w`).join(', '):undefined} sizes="(max-width:760px) 90vw, 43vw" alt={content.portraitAlt} width="1023" height="1537" fetchPriority="high" decoding="async"/><figcaption><span>MR. {content.name.toUpperCase()}</span><span>{content.role}</span></figcaption></figure>
    <div className="leadership-biography"><p className="leadership-kicker leadership-role"><span/>{content.role}</p><h2 id="founder-name">{content.name}</h2><p className="leadership-tagline">{content.tagline}</p><div className="leadership-biography-copy">{content.paragraphs.map((paragraph,index)=><p key={index}>{paragraph}</p>)}</div><a className="leadership-text-link" href="#screen-work">Selected screen work <ArrowUpRight size={17} aria-hidden="true"/></a></div>
   </section>
  </div>
  <section className="leadership-quote" aria-label="Founder's vision"><div className="leadership-width"><Quote size={32} strokeWidth={1.2} aria-hidden="true"/><blockquote><p>“{content.quote}”</p><footer>{content.name}<span>{content.role}, KEMSOR Studios</span></footer></blockquote></div></section>
  <div className="leadership-width leadership-credentials"><section id="screen-work" aria-labelledby="screen-work-heading"><p className="leadership-kicker">ON SCREEN</p><h2 id="screen-work-heading">{content.workHeading}</h2><ol className="leadership-work-list">{content.screenWork.map((title,index)=><li key={index}><h3>{title}</h3><span className="leadership-work-rule" aria-hidden="true"/></li>)}</ol></section><section className="leadership-honours" aria-labelledby="honours-heading"><Award size={33} strokeWidth={1.2} aria-hidden="true"/><p className="leadership-kicker">RECOGNITION</p><h2 id="honours-heading">{content.honoursHeading}</h2><ul>{content.honours.map((honour,index)=><li key={index}>{honour}</li>)}</ul></section></div>
  <div className="leadership-width leadership-next"><a href="/about/">Explore the studio <ArrowUpRight size={18} aria-hidden="true"/></a><a href="/contact/">Connect with KEMSOR <ArrowUpRight size={18} aria-hidden="true"/></a></div>
 </div>;
}
