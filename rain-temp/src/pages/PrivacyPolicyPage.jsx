import React from 'react';
import policy from './privacy-policy-content.json';
import './privacy-policy.css';

// Supplied policy text: KSPL-Website Privacy Policy-Legal-01-11-2026.docx.
export default function PrivacyPolicyPage() {
 return <article className="privacy-policy-page" aria-labelledby="privacy-policy-title">
  <header className="privacy-policy-header">
   <nav className="site-breadcrumb" aria-label="Breadcrumb"><a href="/">Kemsor Studios</a><span aria-hidden="true">/</span><a href="/legal/">Legal</a><span aria-hidden="true">/</span><span aria-current="page">Privacy Policy</span></nav>
   <p className="privacy-policy-eyebrow">KEMSOR STUDIOS PRIVATE LIMITED</p>
   <h1 id="privacy-policy-title">Privacy Policy</h1>
   <div className="privacy-policy-dates"><p>Effective Date: <time dateTime="2026-11-01">01 November 2026</time></p><p>Last Revised: <time dateTime="2026-11-01">01 November 2026</time></p></div>
   <p>Website: <a href="https://www.kemsorstudio.com">www.kemsorstudio.com</a></p>
  </header>
  <div className="privacy-policy-layout">
   <nav className="privacy-policy-contents" aria-label="Policy contents"><p>IN THIS POLICY</p><ol>{policy.sections.map(section=><li key={section.number}><a href={`#privacy-section-${section.number}`}>{section.title.toLowerCase()}</a></li>)}</ol></nav>
   <div className="privacy-policy-copy">{policy.sections.map(section=><section id={`privacy-section-${section.number}`} key={section.number} aria-labelledby={`privacy-heading-${section.number}`}><h2 id={`privacy-heading-${section.number}`}>{section.number}. {section.title}</h2>{section.paragraphs.map((paragraph,index)=><p key={index}>{paragraph}</p>)}</section>)}<div className="privacy-policy-signoff">{policy.closing.map((paragraph,index)=><p key={index}>{paragraph}</p>)}<a href="mailto:info@kemsorstudio.com">Contact privacy & grievances</a></div></div>
  </div>
 </article>;
}
