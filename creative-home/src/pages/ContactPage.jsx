import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { PageHero, SectionHeading, TextLink, FrameMark } from '../PageUI.jsx';
import ProjectBriefForm from '../ProjectBriefForm.jsx';
import { TaskLoader } from '../Loading.jsx';

const EmberWordmark = lazy(() => import('../EmberWordmark.jsx'));

function DeferredWordmark({ paused }) {
  const host = useRef(null);
  const [nearby, setNearby] = useState(false);
  useEffect(() => {
    if (!('IntersectionObserver' in window)) { setNearby(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setNearby(true);
      observer.disconnect();
    }, { rootMargin: '180px 0px' });
    observer.observe(host.current);
    return () => observer.disconnect();
  }, []);
  const fallback = <div className="contact-wordmark-fallback" aria-label="Kemsor Studios"><span>KEMSOR</span><p>BRING THE IDEA.<br />LET’S FIND A STARTING POINT.</p></div>;
  return <div ref={host} className="contact-wordmark-slot">{nearby ? <Suspense fallback={<TaskLoader label="Preparing Kemsor in motion" />}><EmberWordmark paused={paused} /></Suspense> : fallback}</div>;
}

const partners = [
  { id: 'filmmakers', number: '01', title: 'Filmmakers & creators', copy: 'Bring your script, treatment or concept. Start with the story, the format, the language and the stage the project has reached.', detail: 'Useful details: available material, attached collaborators and the creative or production support you need.' },
  { id: 'studios', number: '02', title: 'Studios & platforms', copy: 'Share the production brief and the intended scope. Connect the creative requirements to the schedule, locations and delivery needs.', detail: 'Useful details: the format, production scale, proposed dates and responsibilities that need coordination.' },
  { id: 'co-producers', number: '03', title: 'Co-producers & financiers', copy: 'Outline the project package, attached partners and funding stage. Make the proposed collaboration and its next milestone clear.', detail: 'Useful details: development materials, current partners, production locations and the scope of the partnership.' },
  { id: 'international-productions', number: '04', title: 'International productions', copy: 'Planning to shoot in India? Begin with the intended locations, proposed shooting dates and the support the production needs on the ground.', detail: 'Useful details: cast and crew needs, equipment, travel, logistics and the local production responsibilities.' },
];

export function ContactPage({ paused = false }) {
  return <>
    <PageHero eyebrow="LET’S TALK / YOUR NEXT FRAME" title="Start with" accent="what you have." description="A script, a brief or a production already in progress. Put the project, its stage and the support you need into a clear starting point." image="/assets/stills/period-costume.webp" alt="A performer in a gold period costume on location." caption="SUPPLIED PHOTOGRAPHY / PLACE. PEOPLE. POSSIBILITY." />
    <section className="page-section page-split" id="project-brief">
      <div className="page-copy" data-reveal><p className="page-eyebrow">THE FIRST FEW DETAILS</p><h2>The idea.<br />The starting point.<br />The next step.</h2><p className="page-lead">Prepare a brief to keep for your next production conversation. The form creates a downloadable copy on your device.</p><p>This form does not send an enquiry. Direct studio contact details will be added when they are available.</p><DeferredWordmark paused={paused} /></div>
      <div data-reveal><ProjectBriefForm /></div>
    </section>
    <section className="page-section" id="partners">
      <SectionHeading index="01" label="PARTNER WITH US" title={<>Different starting points.<br />A practical conversation.</>} description="A few details that help shape the right next step for your project." />
      <div className="partner-grid">{partners.map(partner => <article className="page-card" id={partner.id} key={partner.id} data-reveal><span className="page-number">{partner.number}</span><h3>{partner.title}</h3><p>{partner.copy}</p><p>{partner.detail}</p><TextLink href="#project-brief">Prepare your brief</TextLink></article>)}</div>
    </section>
    <section className="page-section page-grid" aria-labelledby="contact-details-title" data-reveal>
      <div className="page-copy"><p className="page-eyebrow">CONTACT DETAILS</p><h2 id="contact-details-title">Keep the conversation<br />ready to begin.</h2><p className="page-lead">Direct contact details will be published here soon.</p><p>In the meantime, download your brief and keep it with the material you want to discuss. No email, telephone number or submission service is available on this site yet.</p></div>
      <div className="page-card"><FrameMark /><p className="page-eyebrow">FIND YOUR STARTING POINT</p><h3>The work ahead.</h3><TextLink href="/services/">Explore production support</TextLink><TextLink href="/projects/">Films, series & story formats</TextLink><TextLink href="/careers/#openings">Careers & opportunities</TextLink><TextLink href="/news/#press-media">Press & media information</TextLink></div>
    </section>
  </>;
}

export default ContactPage;
