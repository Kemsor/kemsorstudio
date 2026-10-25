import MotionHeading, { MotionCopy } from '../TextMotion';
import ProduceLayout from '../ProduceLayout';
import React from 'react';
import { Arrow, CTA, TextLink } from '../PageUI';
import './produce-page.css';
import './line-production-page.css';

// Copy: Kemsor_Produce_03_Locations_and_Logistics.docx (1).pdf.
// Local draft: confirm permissions coordination and unit-logistics scope before publishing.
const included = [
  ['Location scouting', 'Options found and recced against the script, with photos and practical notes.'],
  ['Location management', 'Agreements with location owners and coordination on every shoot day.'],
  ['Permissions coordination', 'Working with owners and relevant authorities on the permissions a shoot needs.'],
  ['Unit logistics', 'Transport, base and unit facilities planned around the schedule.'],
  ['Company moves', 'Movement between locations planned so shoot time isn’t lost on the road.'],
  ['Respect for place', 'Neighbours informed, sites protected and locations returned as we found them.'],
];
const steps = [
  ['Read the script for place', 'What each location needs to say, and what each scene needs practically.'],
  ['Scout & recce', 'Options found, visited and assessed with the director and heads of department.'],
  ['Secure & plan', 'Agreements, permissions and logistics locked into the schedule.'],
  ['Manage on the day', 'Locations run on shoot days and handed back properly at wrap.'],
];
const audiences = [
  ['Productions', 'Productions that need locations found and managed'],
  ['Directors', 'Directors looking for places that serve the story'],
  ['International productions', 'International productions filming in India'],
];
const related = [
  ['01', 'Shooting & On-Location Production', '/produce/shooting-on-location/'],
  ['02', 'Line Production & Production Management', '/produce/line-production/'],
  ['03', 'Set & Production Design', '/produce/set-production-design/'],
  ['04', 'India Production Services', '/services/#india-production-services'],
];
const questions = [
  ['Can you scout before we finalise the budget?', 'Yes. Early scouting helps shape a budget and schedule grounded in production realities.'],
  ['Do you support international productions filming in India?', 'Yes. Our India Production Services cover locations and logistics for visiting productions.'],
  ['Can you manage locations we have already found?', 'Yes. We can take on agreements, permissions coordination and shoot-day management for locations you’ve chosen.'],
];
function Label({ children, end }) {
  return <div className="produce-label"><span>{children}</span>{end && <span>{end}</span>}</div>;
}

Label.displayName = 'EditorialLabel';

export default function LocationsLogisticsPage() {
  return <ProduceLayout page="locations-logistics"><div className="produce-hub locations-logistics-page">
    <nav className="produce-breadcrumb" aria-label="Breadcrumb"><a href="/">Kemsor Studios</a><span aria-hidden="true">/</span><a href="/produce/">Produce</a><span aria-hidden="true">/</span><span aria-current="page">Locations &amp; Logistics</span></nav>

    <section className="produce-hero produce-hero-light line-production-hero" aria-labelledby="locations-logistics-title"><figure className="produce-hero-image" aria-hidden="true"><img src="/assets/stills/daylight-valley-production-1600.webp" srcSet={[640, 960, 1600].map(width => `/assets/stills/daylight-valley-production-${width}.webp ${width}w`).join(', ')} sizes="100vw" alt="" fetchPriority="high" decoding="async"/></figure><div className="produce-hero-content"><p className="produce-kicker">PRODUCE · PRE-PRODUCTION</p><MotionHeading as="h1" id="locations-logistics-title">Locations &amp; Logistics.<span>The right place, ready when the camera is.</span></MotionHeading><MotionCopy>Kemsor scouts, secures and manages locations - and moves people and equipment between them - so every shoot day starts ready.</MotionCopy><div className="produce-actions"><CTA href="/contact/?partner=filmmakers">Talk to us about locations</CTA><TextLink href="#locations-logistics-work">See related work</TextLink></div></div><div className="produce-hero-foot"><a href="/produce/">← Back to Produce</a><a href="#locations-logistics-included">What’s included <span aria-hidden="true">↓</span></a></div></section>

    <section className="produce-section produce-intro" aria-labelledby="locations-logistics-why"><div><Label>WHY IT MATTERS</Label><MotionHeading as="h2" id="locations-logistics-why">The place.<br/><em>Everything it takes to film there.</em></MotionHeading></div><div className="produce-copy"><MotionCopy>A location is a character in the story. Logistics decide whether you can actually film there.</MotionCopy><MotionCopy>We find places that serve the story, then plan everything it takes to work in them - access, movement, timing and the people who live and work nearby. We treat the communities we film in as partners, and leave places as we found them.</MotionCopy></div></section>

    <section className="produce-section line-production-included" id="locations-logistics-included" aria-labelledby="locations-logistics-included-title"><Label end="FROM SCRIPT TO LOCATION">WHAT’S INCLUDED</Label><MotionHeading as="h2" id="locations-logistics-included-title">What’s included.</MotionHeading><div className="line-production-scope"><dl className="line-production-deliverables">{included.map(([title, description], index) => <div key={title}><dt><span aria-hidden="true">0{index + 1}</span>{title}</dt><dd>{description}</dd></div>)}</dl><figure className="line-production-planning"><img src="/assets/stills/work-forest-set-960.webp" alt="Illustrative production crew filming on a forest location" width="1672" height="941" loading="lazy" decoding="async"/><figcaption><span>RESPECT FOR PLACE</span><MotionCopy>We treat the communities we film in as partners, and leave places as we found them.</MotionCopy></figcaption></figure></div></section>

    <section className="produce-section produce-process" aria-labelledby="locations-logistics-process-title"><Label end="SCOUT → SECURE → MANAGE">HOW WE WORK</Label><MotionHeading as="h2" id="locations-logistics-process-title">How we work.</MotionHeading><ol className="produce-steps line-production-steps">{steps.map(([title, description], index) => <li key={title}><span className="produce-step-number">0{index + 1}</span><h3>{title}</h3><p>{description}</p></li>)}</ol></section>

    <section className="produce-section produce-audiences" aria-labelledby="locations-logistics-audiences-title"><div><Label>WHO IT’S FOR</Label><MotionHeading as="h2" id="locations-logistics-audiences-title">Who it’s for.</MotionHeading><div className="produce-audience-mark" aria-hidden="true"><span>THE STORY</span><i>+</i><span>THE PLACE</span><i>+</i><span>THE SCHEDULE</span></div></div><ul>{audiences.map(([title, description], index) => <li key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{description}</p></div></li>)}</ul></section>

    {/* No confirmed project title, format, location or locations/logistics credit supplied. */}
    <section className="produce-section produce-work" id="locations-logistics-work" aria-labelledby="locations-logistics-work-title"><Label>RELATED WORK</Label><div><MotionHeading as="h2" id="locations-logistics-work-title">Related work.</MotionHeading><TextLink href="/projects/">Explore productions</TextLink></div></section>

    <section className="produce-section produce-related line-production-related" aria-labelledby="locations-logistics-related-title"><Label>CONNECTED PRODUCTION SUPPORT</Label><MotionHeading as="h2" id="locations-logistics-related-title">Related services.</MotionHeading><div className="produce-related-grid">{related.map(([number, title, href]) => <a href={href} key={title}><span className="produce-related-number">{number}</span><h3>{title}</h3><span className="line-production-related-link">Explore service <Arrow/></span></a>)}</div></section>

    <section className="produce-section produce-questions" aria-labelledby="locations-logistics-questions-title"><div><Label>A FEW THINGS TO KNOW</Label><MotionHeading as="h2" id="locations-logistics-questions-title">Questions.</MotionHeading></div><div className="produce-faqs">{questions.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></section>
  </div></ProduceLayout>;
}
