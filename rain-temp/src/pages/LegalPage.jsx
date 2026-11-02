import MotionHeading, { MotionCopy } from '../TextMotion';
import EditorialPage from '../EditorialPage';
import React from 'react';
import { PageHero } from '../PageUI';
import { CmsEntries, useCms } from '../CmsContent';
export default function LegalPage() {
  const { entries } = useCms();
  return <EditorialPage page="legal"><><PageHero eyebrow="LEGAL CENTRE / STUDIO NOTICES" title="Clear information." accent="A shared understanding." description="Studio notices and website policies published by Kemsor." />
    <section className="page-section page-copy"><MotionHeading as="h2">Privacy Policy</MotionHeading><p>How KEMSOR Studios Private Limited collects, uses and protects personal information.</p><a className="line-link" href="/privacy-policy/">Read the Privacy Policy</a></section>
    {entries.some(entry => entry.type === 'legal') ? <CmsEntries type="legal" /> : <section className="page-section page-copy"><MotionHeading as="h2">Additional notices</MotionHeading><MotionCopy>Further approved studio notices and website policies will be published here.</MotionCopy></section>}
  </></EditorialPage>;
}
