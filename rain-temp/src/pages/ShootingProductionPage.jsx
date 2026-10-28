import SiteIcon from '../SiteIcon';
import MotionHeading, { MotionCopy } from '../TextMotion';
import ProduceLayout from '../ProduceLayout';
import React from 'react';
import { Arrow, CTA, TextLink } from '../PageUI';
import './produce-page.css';
import './line-production-page.css';

// Copy: Kemsor_Produce_06_Shooting_and_On-Location_Production.docx.pdf.
// Local draft: confirm safety responsibilities and data-handling/handover scope before publishing.
const included = [
  ['Shoot-day management', 'Call sheets, timings and the unit kept moving through every day.'],
  ['On-location operations', 'Base, access and unit facilities run on location.'],
  ['Multi-location & outdoor shoots', 'Moves, weather and changing conditions planned for, not just reacted to.'],
  ['Set safety & welfare', 'A safe, well-run set where cast and crew are looked after.'],
  ['Daily progress reports', 'Clear reports on scenes shot, time and spend after every day.'],
  ['Footage handover', 'Footage and records handed to post-production in order.'],
];
const steps = [
  ['Prepare', 'Shooting plan, call sheets, and locations ready before day one.'],
  ['Run the day', 'The unit is managed on set and on location, hour by hour.'],
  ['Report', 'Progress shared daily so producers can decide with real information.'],
  ['Wrap & hand over', 'Locations returned, footage handed to post, the shoot closed properly.'],
];
const audiences = [
  ['Productions', 'Productions that need a shoot run reliably, day after day'],
  ['Directors', 'Directors who want to focus on performance and the frame'],
  ['International productions', 'International productions filming on location in India'],
];
const related = [
  ['01', 'Line Production & Production Management', '/produce/line-production/'],
  ['02', 'Locations & Logistics', '/produce/locations-logistics/'],
  ['03', 'Crew & Equipment', '/produce/crew-equipment/'],
  ['04', 'Post-Production Supervision', '/services/#capability-post'],
];
const questions = [
  ['Can you run a single shoot day or a short shoot?', 'Yes. From a single day to a long series schedule, scope is shaped to the project.'],
  ['How do you handle changes on the day?', 'We flag issues early with options, so the director and producers can decide quickly and keep shooting.'],
  ['Do you hand footage directly to post-production?', 'Yes. Footage and production records are handed to post in order, ready for the edit.'],
];
function Label({ children, end }) {
  return <div className="produce-label"><span>{children}</span>{end && <span>{end}</span>}</div>;
}

Label.displayName = 'EditorialLabel';

export default function ShootingProductionPage() {
  return <ProduceLayout page="shooting-on-location"><div className="produce-hub shooting-on-location-page">
    <nav className="produce-breadcrumb" aria-label="Breadcrumb"><a href="/">Kemsor Studios</a><span aria-hidden="true">/</span><a href="/produce/">Produce</a><span aria-hidden="true">/</span><span aria-current="page">Shooting &amp; On-Location Production</span></nav>

    <section className="produce-hero produce-hero-light line-production-hero" aria-labelledby="shooting-on-location-title"><figure className="produce-hero-image" aria-hidden="true"><img src="/assets/stills/fort-action-production-1600.webp" srcSet={[640, 960, 1600].map(width => `/assets/stills/fort-action-production-${width}.webp ${width}w`).join(', ')} sizes="100vw" alt="Supplied illustration of an action scene being filmed at a fort, with a camera crew, performers and vehicles" width="1600" height="640" fetchPriority="high" decoding="async"/></figure><div className="produce-hero-content"><p className="produce-kicker">PRODUCE · ON SET</p><MotionHeading as="h1" id="shooting-on-location-title">Shooting &amp; On-Location Production.<span>Cameras rolling. Everything else handled.</span></MotionHeading><MotionCopy>Kemsor manages the shoot day on set and on location so the director, cast and crew can focus on filming.</MotionCopy><div className="produce-actions"><CTA href="/contact/?partner=filmmakers">Plan your shoot</CTA><TextLink href="#shooting-on-location-work">See related work</TextLink></div></div><div className="produce-hero-foot"><a href="/produce/"><SiteIcon name="arrow-left" size={16} /> Back to Produce</a><a href="#shooting-on-location-included">What’s included <span aria-hidden="true"><SiteIcon name="arrow-down" size={16} /></span></a></div></section>

    <section className="produce-section produce-intro" aria-labelledby="shooting-on-location-why"><div><Label>WHY IT MATTERS</Label><MotionHeading as="h2" id="shooting-on-location-why">Keep the unit moving.<br/><em>Keep the story at the centre.</em></MotionHeading></div><div className="produce-copy"><MotionCopy>Every plan meets reality on the shoot day. Light moves, weather turns, a scene needs one more take.</MotionCopy><MotionCopy>We keep the unit moving, adjust the schedule when needed and help the team respond to problems before they cost a day’s work.</MotionCopy></div></section>

    <section className="produce-section line-production-included" id="shooting-on-location-included" aria-labelledby="shooting-on-location-included-title"><Label end="FROM DAY ONE TO THE FINAL WRAP">WHAT’S INCLUDED</Label><MotionHeading as="h2" id="shooting-on-location-included-title">What’s included.</MotionHeading><div className="line-production-scope"><dl className="line-production-deliverables">{included.map(([title, description], index) => <div key={title}><dt><span aria-hidden="true">0{index + 1}</span>{title}</dt><dd>{description}</dd></div>)}</dl><figure className="line-production-planning"><img src="/assets/stills/daylight-snow-production-960.webp" alt="Supplied illustration of a film crew coordinating a scene on a snowy mountain location" width="1672" height="941" loading="lazy" decoding="async"/><figcaption><span>FOCUS ON THE FRAME</span><p>On set and on location, Kemsor runs the shoot day.</p></figcaption></figure></div></section>

    <section className="produce-section produce-process" aria-labelledby="shooting-on-location-process-title"><Label end="PREPARE → SHOOT → HAND OVER">HOW WE WORK</Label><MotionHeading as="h2" id="shooting-on-location-process-title">How we work.</MotionHeading><ol className="produce-steps line-production-steps">{steps.map(([title, description], index) => <li key={title}><span className="produce-step-number">0{index + 1}</span><h3>{title}</h3><p>{description}</p></li>)}</ol></section>

    <section className="produce-section produce-audiences" aria-labelledby="shooting-on-location-audiences-title"><div><Label>WHO IT’S FOR</Label><MotionHeading as="h2" id="shooting-on-location-audiences-title">Who it’s for.</MotionHeading><div className="produce-audience-mark" aria-hidden="true"><span>THE UNIT</span><i>+</i><span>THE SCHEDULE</span><i>+</i><span>THE STORY</span></div></div><ul>{audiences.map(([title, description], index) => <li key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{description}</p></div></li>)}</ul></section>

    {/* No confirmed project title, format, location or shooting/on-location credit supplied. */}
    <section className="produce-section produce-work" id="shooting-on-location-work" aria-labelledby="shooting-on-location-work-title"><Label>RELATED WORK</Label><div><MotionHeading as="h2" id="shooting-on-location-work-title">Related work.</MotionHeading><TextLink href="/projects/">Explore productions</TextLink></div></section>

    <section className="produce-section produce-related line-production-related" aria-labelledby="shooting-on-location-related-title"><Label>CONNECTED PRODUCTION SUPPORT</Label><MotionHeading as="h2" id="shooting-on-location-related-title">Related services.</MotionHeading><div className="produce-related-grid">{related.map(([number, title, href]) => <a href={href} key={title}><span className="produce-related-number">{number}</span><h3>{title}</h3><span className="line-production-related-link">Explore service <Arrow/></span></a>)}</div></section>

    <section className="produce-section produce-questions" aria-labelledby="shooting-on-location-questions-title"><div><Label>A FEW THINGS TO KNOW</Label><MotionHeading as="h2" id="shooting-on-location-questions-title">Questions.</MotionHeading></div><div className="produce-faqs">{questions.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true"><SiteIcon name="plus" size={16} /></span></summary><p>{answer}</p></details>)}</div></section>
  </div></ProduceLayout>;
}
