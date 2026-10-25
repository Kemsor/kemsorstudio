import MotionHeading, { MotionCopy } from '../TextMotion';
import ProduceLayout from '../ProduceLayout';
import React from 'react';
import { Arrow, CTA, TextLink } from '../PageUI';
import './produce-page.css';
import './line-production-page.css';

// Copy: Kemsor_Produce_04_Crew_and_Equipment.docx.pdf.
// Planning/sourcing copy does not assert equipment ownership or rental arrangements.
const included = [
  ['Crew hiring', 'Crew recruited across departments to fit the format, scale and schedule.'],
  ['Heads of department', 'Key creative and technical leads matched to the director’s vision.'],
  ['Equipment planning', 'Camera, lighting, grip and sound needs planned against the shot list.'],
  ['Equipment sourcing', 'Kit sourced to fit the budget, with clear tracking from pick-up to return.'],
  ['Crew management', 'Calls, hours and welfare managed fairly through the shoot.'],
  ['Wrap & returns', 'Equipment returned, accounts closed and crew wrapped properly.'],
];
const steps = [
  ['Understand the shoot', 'Format, scale, style and schedule set what the crew and kit need to be.'],
  ['Assemble', 'Heads of department first, then the wider crew and the equipment plan.'],
  ['Manage', 'Crew and kit managed day to day, with issues raised early.'],
  ['Wrap', 'Equipment returned and the crew wrapped with records in order.'],
];
const audiences = [
  ['Producers', 'Producers building a crew for a film, series, documentary or short'],
  ['Productions', 'Productions that need equipment planned and managed within budget'],
  ['International productions', 'International productions filming in India'],
];
const related = [
  ['01', 'Line Production & Production Management', '/produce/line-production/'],
  ['02', 'Shooting & On-Location Production', '/produce/shooting-on-location/'],
  ['03', 'Casting & Talent Coordination', '/produce/casting/'],
  ['04', 'India Production Services', '/services/#india-production-services'],
];
const questions = [
  ['Can you crew just one department?', 'Yes. Scope is shaped to the project - a full crew or specific roles.'],
  ['Do you supply equipment directly?', 'We plan and source equipment to suit the shoot and budget, and manage it through to return.'],
  ['Can crew members join Kemsor’s network?', 'Yes. Crew can join the Kemsor Talent Network to be considered for future productions.'],
];
function Label({ children, end }) {
  return <div className="produce-label"><span>{children}</span>{end && <span>{end}</span>}</div>;
}

Label.displayName = 'EditorialLabel';

export default function CrewEquipmentPage() {
  return <ProduceLayout page="crew-equipment"><div className="produce-hub crew-equipment-page">
    <nav className="produce-breadcrumb" aria-label="Breadcrumb"><a href="/">Kemsor Studios</a><span aria-hidden="true">/</span><a href="/produce/">Produce</a><span aria-hidden="true">/</span><span aria-current="page">Crew &amp; Equipment</span></nav>

    <section className="produce-hero produce-hero-light line-production-hero" aria-labelledby="crew-equipment-title"><figure className="produce-hero-image" aria-hidden="true"><img src="/assets/stills/daylight-park-production-1600.webp" srcSet={[640, 960, 1600].map(width => `/assets/stills/daylight-park-production-${width}.webp ${width}w`).join(', ')} sizes="100vw" alt="" fetchPriority="high" decoding="async"/></figure><div className="produce-hero-content"><p className="produce-kicker">PRODUCE · PRE-PRODUCTION</p><MotionHeading as="h1" id="crew-equipment-title">Crew &amp; Equipment.<span>Sized to the shoot.</span></MotionHeading><MotionCopy>Kemsor assembles crews and plans equipment matched to your story, schedule and budget - then manages both through the shoot.</MotionCopy><div className="produce-actions"><CTA href="/contact/?partner=filmmakers">Talk to us about crew</CTA><TextLink href="#crew-equipment-work">See related work</TextLink></div></div><div className="produce-hero-foot"><a href="/produce/">← Back to Produce</a><a href="#crew-equipment-included">What’s included <span aria-hidden="true">↓</span></a></div></section>

    <section className="produce-section produce-intro" aria-labelledby="crew-equipment-why"><div><Label>WHY IT MATTERS</Label><MotionHeading as="h2" id="crew-equipment-why">The right people.<br/><em>The right kit.</em></MotionHeading></div><div className="produce-copy"><MotionCopy>The right crew turns a plan into pictures. The wrong kit - too much or too little - costs time, money and shots.</MotionCopy><MotionCopy>We match people and equipment to the story and the scale of the shoot, from a compact short to a long-running series, and keep both working well until wrap.</MotionCopy></div></section>

    <section className="produce-section line-production-included" id="crew-equipment-included" aria-labelledby="crew-equipment-included-title"><Label end="FROM FIRST CALL TO FINAL RETURN">WHAT’S INCLUDED</Label><MotionHeading as="h2" id="crew-equipment-included-title">What’s included.</MotionHeading><div className="line-production-scope"><dl className="line-production-deliverables">{included.map(([title, description], index) => <div key={title}><dt><span aria-hidden="true">0{index + 1}</span>{title}</dt><dd>{description}</dd></div>)}</dl><figure className="line-production-planning"><img src="/assets/services/camera-detail.webp" alt="Illustrative close-up of professional cinema camera equipment" width="1672" height="941" loading="lazy" decoding="async"/><figcaption><span>MATCHED TO THE SHOT LIST</span><MotionCopy>Camera, lighting, grip and sound needs planned against the shot list.</MotionCopy></figcaption></figure></div></section>

    <section className="produce-section produce-process" aria-labelledby="crew-equipment-process-title"><Label end="ASSEMBLE → MANAGE → WRAP">HOW WE WORK</Label><MotionHeading as="h2" id="crew-equipment-process-title">How we work.</MotionHeading><ol className="produce-steps line-production-steps">{steps.map(([title, description], index) => <li key={title}><span className="produce-step-number">0{index + 1}</span><h3>{title}</h3><p>{description}</p></li>)}</ol></section>

    <section className="produce-section produce-audiences" aria-labelledby="crew-equipment-audiences-title"><div><Label>WHO IT’S FOR</Label><MotionHeading as="h2" id="crew-equipment-audiences-title">Who it’s for.</MotionHeading><div className="produce-audience-mark" aria-hidden="true"><span>THE FORMAT</span><i>+</i><span>THE SCALE</span><i>+</i><span>THE SCHEDULE</span></div></div><ul>{audiences.map(([title, description], index) => <li key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{description}</p></div></li>)}</ul></section>

    {/* No confirmed project title, format, year or crew/equipment credit supplied. */}
    <section className="produce-section produce-work" id="crew-equipment-work" aria-labelledby="crew-equipment-work-title"><Label>RELATED WORK</Label><div><MotionHeading as="h2" id="crew-equipment-work-title">Related work.</MotionHeading><TextLink href="/projects/">Explore productions</TextLink></div></section>

    <section className="produce-section produce-related line-production-related" aria-labelledby="crew-equipment-related-title"><Label>CONNECTED PRODUCTION SUPPORT</Label><MotionHeading as="h2" id="crew-equipment-related-title">Related services.</MotionHeading><div className="produce-related-grid">{related.map(([number, title, href]) => <a href={href} key={title}><span className="produce-related-number">{number}</span><h3>{title}</h3><span className="line-production-related-link">Explore service <Arrow/></span></a>)}</div></section>

    <section className="produce-section produce-questions" aria-labelledby="crew-equipment-questions-title"><div><Label>A FEW THINGS TO KNOW</Label><MotionHeading as="h2" id="crew-equipment-questions-title">Questions.</MotionHeading></div><div className="produce-faqs">{questions.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p>{question === 'Can crew members join Kemsor’s network?' && <p><TextLink href="/join/">Join the Kemsor Talent Network</TextLink></p>}</details>)}</div></section>
  </div></ProduceLayout>;
}
