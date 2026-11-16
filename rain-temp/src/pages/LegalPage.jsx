import {cmsText} from "../siteContent.js";
import LegalDocument,{legalHref,legalSlug} from '../LegalDocument';
import MotionHeading, { MotionCopy } from '../TextMotion';
import { EditorialHero } from '../EditorialPage';
import SiteIcon from '../SiteIcon';
import './legal-page.css';
import React from 'react';
import { CTA, TextLink } from '../PageUI';
import { CmsEntries, useCms } from '../CmsContent';
export default function LegalPage() {
  const { entries,legalDocuments,connected } = useCms();
  const slug=legalSlug(location.pathname);
  if(slug){const document=legalDocuments?.find(item=>item.slug===slug);return document?<LegalDocument document={document}/>:<section className="page-section page-copy"><h1>{connected?'Document unavailable':'Opening document…'}</h1><a href="/legal/">{cmsText("LegalPage","7ef4d55cef415105","Visit the Legal Centre")}</a></section>;}
  const documents=legalDocuments||[{slug:'privacy-policy',title:cmsText("LegalPage","a04b12daf20a3cb0","Privacy Policy"),description:cmsText("LegalPage","4fe6a01e1f38db3c","How KEMSOR Studios Private Limited collects, uses and protects personal information.")}];
  return <div className="legal-centre-page">
    <EditorialHero compact page="legal" eyebrow="LEGAL CENTRE" title="Clear information." accent="A shared understanding." description={cmsText("LegalPage","d83652e21ebf47eb","Studio notices and website policies published by Kemsor.")} caption="POLICIES AND STUDIO NOTICES" actions={<><CTA href="#legal-policies">Browse policies</CTA><TextLink href="#legal-enquiries">Legal enquiries</TextLink></>}/>
    <section className="legal-centre-section" id="legal-policies" aria-labelledby="legal-policies-title">
      <div className="legal-centre-heading"><div><p className="page-eyebrow">PUBLISHED DOCUMENTS</p><MotionHeading as="h2" id="legal-policies-title">Policies and notices</MotionHeading></div><p>Read the policies that apply to our website and your information.</p></div>
      <div className="legal-policy-grid">{documents.map(document=><article className="legal-policy-card" key={document.slug}>
        <span className="legal-policy-icon" aria-hidden="true"><SiteIcon name="script" size={28}/></span>
        <MotionHeading as="h3"><a href={legalHref(document.slug)}>{document.title}</a></MotionHeading>
        {document.description&&<p>{document.description}</p>}
        <TextLink href={legalHref(document.slug)}>{cmsText("LegalPage","91c695d0bfbc3334","Read ")}{document.title}</TextLink>
      </article>)}</div>
      {!documents.length&&<p role="status">Published policies will appear here.</p>}
      {!Array.isArray(legalDocuments)&&entries.some(entry=>entry.type==='legal')&&<CmsEntries type="legal"/>}
    </section>
    <section className="legal-centre-section legal-enquiries" id="legal-enquiries" aria-labelledby="legal-enquiries-title"><div><p className="page-eyebrow">GET IN TOUCH</p><MotionHeading as="h2" id="legal-enquiries-title">{cmsText("LegalPage","14078f4ae1bec943","Legal enquiries")}</MotionHeading><MotionCopy>{cmsText("LegalPage","0b21871dc192047b","For questions about our published policies, contact the studio.")}</MotionCopy></div><CTA href="/contact/">Contact the studio</CTA></section>
  </div>;
}
