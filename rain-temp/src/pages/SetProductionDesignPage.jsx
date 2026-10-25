import MotionHeading, { MotionCopy } from '../TextMotion';
import ProduceLayout from '../ProduceLayout';
import React from 'react';
import { Arrow, CTA, TextLink } from '../PageUI';
import './produce-page.css';
import './line-production-page.css';

// Copy: Kemsor_Produce_05_Set_and_Production_Design.docx.pdf.
// Local draft: confirm direct construction versus construction-partner coordination before publishing.
const included = [
  ['Design development', 'The look of the story developed with the director and production designer.'],
  ['Set design & construction', 'Sets designed and built to be filmed - practical for camera, light and crew.'],
  ['Art direction & props', 'Props sourced or made, and art department run through the shoot.'],
  ['Location dressing', 'Real locations dressed to become the story’s world.'],
  ['Period & world research', 'Research that keeps period and specialised worlds accurate.'],
  ['Build budgets & schedules', 'Design costs and build timelines planned alongside the production.'],
];
const steps = [
  ['Read the world', 'What the story’s world is, and how it should feel on screen.'],
  ['Design', 'Concepts, references and plans agreed with the director.'],
  ['Build & dress', 'Sets built, props sourced and locations dressed to schedule.'],
  ['Support the shoot', 'Art department on set, keeping continuity and the world intact.'],
];
const audiences = [
  ['Directors & producers', 'Directors and producers creating a distinct world on screen'],
  ['Period & specialised productions', 'Period pieces and productions with specialised settings'],
  ['Series', 'Series that need consistent sets across many episodes'],
];
const related = [
  ['01', 'Locations & Logistics', '/produce/locations-logistics/'],
  ['02', 'Shooting & On-Location Production', '/produce/shooting-on-location/'],
  ['03', 'Line Production & Production Management', '/produce/line-production/'],
  ['04', 'Post-Production Supervision', '/services/#capability-post'],
];
const questions = [
  ['Do you work with our own production designer?', 'Yes. We can support your designer with planning, builds and art department coordination.'],
  ['Can you design for both studio sets and real locations?', 'Yes. We build sets and dress real locations, depending on what the story needs.'],
  ['How do you keep design within budget?', 'Design costs and build timelines are planned alongside the production budget from the start.'],
];
function Label({ children, end }) {
  return <div className="produce-label"><span>{children}</span>{end && <span>{end}</span>}</div>;
}

Label.displayName = 'EditorialLabel';

export default function SetProductionDesignPage() {
  return <ProduceLayout page="set-production-design"><div className="produce-hub set-production-design-page">
    <nav className="produce-breadcrumb" aria-label="Breadcrumb"><a href="/">Kemsor Studios</a><span aria-hidden="true">/</span><a href="/produce/">Produce</a><span aria-hidden="true">/</span><span aria-current="page">Set &amp; Production Design</span></nav>

    <section className="produce-hero produce-hero-light line-production-hero" aria-labelledby="set-production-design-title"><figure className="produce-hero-image" aria-hidden="true"><img src="/assets/stills/courtyard-dance-production-1600.webp" srcSet={[640, 960, 1600].map(width => `/assets/stills/courtyard-dance-production-${width}.webp ${width}w`).join(', ')} sizes="100vw" alt="Supplied illustration of a colourful courtyard dance set with performers, lighting and camera equipment" width="1600" height="640" fetchPriority="high" decoding="async"/></figure><div className="produce-hero-content"><p className="produce-kicker">PRODUCE · PRE-PRODUCTION</p><MotionHeading as="h1" id="set-production-design-title">Set &amp; Production Design.<span>The world of the story, built to be filmed.</span></MotionHeading><MotionCopy>Kemsor delivers production design - sets, art direction, props and dressing - so the world on screen feels true, and the build fits the budget and the schedule.</MotionCopy><div className="produce-actions"><CTA href="/contact/?partner=filmmakers">Talk to us about design</CTA><TextLink href="#set-production-design-work">See related work</TextLink></div></div><div className="produce-hero-foot"><a href="/produce/">← Back to Produce</a><a href="#set-production-design-included">What’s included <span aria-hidden="true">↓</span></a></div></section>

    <section className="produce-section produce-intro" aria-labelledby="set-production-design-why"><div><Label>WHY IT MATTERS</Label><MotionHeading as="h2" id="set-production-design-why">Make the world<br/><em>believable.</em></MotionHeading></div><div className="produce-copy"><MotionCopy>Audiences believe a story when they believe its world. Every wall, prop and surface either supports that belief or breaks it.</MotionCopy><MotionCopy>We work from the director’s vision and the script’s demands, then plan builds and dressing that look right on camera and arrive on time and on budget.</MotionCopy></div></section>

    <section className="produce-section line-production-included" id="set-production-design-included" aria-labelledby="set-production-design-included-title"><Label end="FROM SCRIPT TO SCREEN">WHAT’S INCLUDED</Label><MotionHeading as="h2" id="set-production-design-included-title">What’s included.</MotionHeading><div className="line-production-scope"><dl className="line-production-deliverables">{included.map(([title, description], index) => <div key={title}><dt><span aria-hidden="true">0{index + 1}</span>{title}</dt><dd>{description}</dd></div>)}</dl><figure className="line-production-planning"><img src="/assets/stills/work-period-set-960.webp" alt="Illustrative period film set with performers, crew and production design" width="1672" height="941" loading="lazy" decoding="async"/><figcaption><span>THE WORLD ON SCREEN</span><MotionCopy>Every wall, prop and surface either supports that belief or breaks it.</MotionCopy></figcaption></figure></div></section>

    <section className="produce-section produce-process" aria-labelledby="set-production-design-process-title"><Label end="DESIGN → BUILD → SHOOT">HOW WE WORK</Label><MotionHeading as="h2" id="set-production-design-process-title">How we work.</MotionHeading><ol className="produce-steps line-production-steps">{steps.map(([title, description], index) => <li key={title}><span className="produce-step-number">0{index + 1}</span><h3>{title}</h3><p>{description}</p></li>)}</ol></section>

    <section className="produce-section produce-audiences" aria-labelledby="set-production-design-audiences-title"><div><Label>WHO IT’S FOR</Label><MotionHeading as="h2" id="set-production-design-audiences-title">Who it’s for.</MotionHeading><div className="produce-audience-mark" aria-hidden="true"><span>THE VISION</span><i>+</i><span>THE WORLD</span><i>+</i><span>THE BUILD</span></div></div><ul>{audiences.map(([title, description], index) => <li key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{description}</p></div></li>)}</ul></section>

    {/* No confirmed project title, format, year or set/production-design credit supplied. */}
    <section className="produce-section produce-work" id="set-production-design-work" aria-labelledby="set-production-design-work-title"><Label>RELATED WORK</Label><div><MotionHeading as="h2" id="set-production-design-work-title">Related work.</MotionHeading><TextLink href="/projects/">Explore productions</TextLink></div></section>

    <section className="produce-section produce-related line-production-related" aria-labelledby="set-production-design-related-title"><Label>CONNECTED PRODUCTION SUPPORT</Label><MotionHeading as="h2" id="set-production-design-related-title">Related services.</MotionHeading><div className="produce-related-grid">{related.map(([number, title, href]) => <a href={href} key={title}><span className="produce-related-number">{number}</span><h3>{title}</h3><span className="line-production-related-link">Explore service <Arrow/></span></a>)}</div></section>

    <section className="produce-section produce-questions" aria-labelledby="set-production-design-questions-title"><div><Label>A FEW THINGS TO KNOW</Label><MotionHeading as="h2" id="set-production-design-questions-title">Questions.</MotionHeading></div><div className="produce-faqs">{questions.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></section>

    <section className="produce-section produce-closing" aria-labelledby="set-production-design-closing-title"><Label>YOUR NEXT PRODUCTION</Label><div><MotionHeading as="h2" id="set-production-design-closing-title">Building<br/><em>a world?</em></MotionHeading><div><MotionCopy>Tell us about the story and its setting. We’ll help bring it to the screen.</MotionCopy><CTA href="/contact/?partner=filmmakers">Start a conversation</CTA></div></div></section>
  </div></ProduceLayout>;
}
