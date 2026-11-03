import {cmsText} from "../siteContent.js";
import LegalDocument,{legalHref,legalSlug} from '../LegalDocument';
import MotionHeading, { MotionCopy } from '../TextMotion';
import EditorialPage from '../EditorialPage';
import React from 'react';
import { PageHero } from '../PageUI';
import { CmsEntries, useCms } from '../CmsContent';
export default function LegalPage() {
  const { entries,legalDocuments,connected } = useCms();
  const slug=legalSlug(location.pathname);
  if(slug){const document=legalDocuments?.find(item=>item.slug===slug);return document?<LegalDocument document={document}/>:<section className="page-section page-copy"><h1>{connected?'Document unavailable':'Opening document…'}</h1><a href="/legal/">{cmsText("LegalPage","7ef4d55cef415105","Visit the Legal Centre")}</a></section>;}
  return <EditorialPage page="legal"><><PageHero eyebrow={cmsText("LegalPage","ce2a4e11a90f35f9","LEGAL CENTRE / STUDIO NOTICES")} title={cmsText("LegalPage","7f8f4d79d0385ab2","Clear information.")} accent={cmsText("LegalPage","afc956c8d23ec2aa","A shared understanding.")} description={cmsText("LegalPage","d83652e21ebf47eb","Studio notices and website policies published by Kemsor.")} />
    {(legalDocuments||[{slug:'privacy-policy',title:cmsText("LegalPage","a04b12daf20a3cb0","Privacy Policy"),description:cmsText("LegalPage","4fe6a01e1f38db3c","How KEMSOR Studios Private Limited collects, uses and protects personal information.")}]).map(document=><section className="page-section page-copy" key={document.slug}><MotionHeading as="h2">{document.title}</MotionHeading><p>{document.description}</p><a className="line-link" href={legalHref(document.slug)}>{cmsText("LegalPage","91c695d0bfbc3334","Read ")}{document.title}</a></section>)}
    {!Array.isArray(legalDocuments)&&entries.some(entry => entry.type === 'legal') ? <CmsEntries type="legal" /> : <section className="page-section page-copy"><MotionHeading as="h2">{cmsText("LegalPage","14078f4ae1bec943","Legal enquiries")}</MotionHeading><MotionCopy>{cmsText("LegalPage","0b21871dc192047b","For questions about our published policies, contact the studio.")}</MotionCopy></section>}
  </></EditorialPage>;
}
