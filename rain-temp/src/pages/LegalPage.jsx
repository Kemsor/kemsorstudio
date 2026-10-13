import React from 'react';
import { PageHero } from '../PageUI';
import { CmsEntries, useCms } from '../CmsContent';
export default function LegalPage() {
  const { entries } = useCms();
  return <><PageHero eyebrow="LEGAL CENTRE / STUDIO NOTICES" title="Clear information." accent="A shared understanding." description="Studio notices and website policies published by Kemsor." />
    {entries.some(entry => entry.type === 'legal') ? <CmsEntries type="legal" /> : <section className="page-section page-copy"><h2>Notices forthcoming.</h2><p>Approved studio notices and website policies will be published here.</p></section>}
  </>;
}
