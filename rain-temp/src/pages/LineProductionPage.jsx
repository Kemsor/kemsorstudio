import MotionHeading, { MotionCopy } from '../TextMotion';
import ProduceLayout from '../ProduceLayout';
import React from 'react';
import { Arrow, CTA, TextLink } from '../PageUI';
import './produce-page.css';
import './line-production-page.css';

// Content: Kemsor_Produce_01_Line_Production_and_Production_Management.docx.pdf.
const included = [
  ['Production budgeting', 'Budgets built from the script and the creative plan, tracked against actuals through the shoot.'],
  ['Scheduling', 'Shooting schedules and daily call sheets built around story, cast, locations and light.'],
  ['Production management', 'Day-to-day running of the production office and the set.'],
  ['Department coordination', 'Every department working from the same plan and the same information.'],
  ['Risk & issue management', 'Risks raised early, with options, so decisions are made in time to act on them.'],
  ['Production reporting', 'Clear, regular reports on progress, spend and schedule for producers and financiers.'],
];
const steps = [
  ['Read the story', 'We start with the script and the creative priorities before any numbers are set.'],
  ['Build the plan', 'Budget and schedule shaped by what the story needs and what the production can carry.'],
  ['Run the shoot', 'Daily management of people, time and money - on set and in the office.'],
  ['Hand over to post', 'Footage, reports and production records handed cleanly to post-production.'],
];
const audiences = [
  ['Producers', 'Producers who need a line producer they can trust on the ground'],
  ['Studios & OTT platforms', 'Studios and OTT platforms that need dependable production management'],
  ['Financiers', 'Financiers who want clear visibility of spend and progress'],
  ['International productions', 'International productions filming in India'],
];
const related = [
  ['01', 'Shooting & On-Location Production', '/produce/shooting-on-location/'],
  ['02', 'Crew & Equipment', '/produce/crew-equipment/'],
  ['03', 'Locations & Logistics', '/produce/locations-logistics/'],
  ['04', 'India Production Services', '/services/#india-production-services'],
];
const questions = [
  ['Can you come on board for just the shoot?', 'Yes. We provide focused line production on a single shoot, or partnership across the full production lifecycle.'],
  ['Can you work alongside our existing producer?', 'Yes. We work with the producers already on the project, taking on the day-to-day running of the production.'],
  ['How do you handle budget pressure during a shoot?', 'We flag risks and changes early, with options, so decisions are made with time to act - not after the money is spent.'],
];
function Label({ children, end }) {
  return <div className="produce-label"><span>{children}</span>{end && <span>{end}</span>}</div>;
}

Label.displayName = 'EditorialLabel';

export default function LineProductionPage() {
  return <ProduceLayout page="line-production"><div className="produce-hub line-production-page">
    <nav className="produce-breadcrumb" aria-label="Breadcrumb"><a href="/">Kemsor Studios</a><span aria-hidden="true">/</span><a href="/produce/">Produce</a><span aria-hidden="true">/</span><span aria-current="page">Line Production</span></nav>

    <section className="produce-hero produce-hero-light line-production-hero" aria-labelledby="line-production-title">
      <figure className="produce-hero-image" aria-hidden="true"><img src="/assets/stills/daylight-snow-production-1600.webp" srcSet={[640, 960, 1600].map(width => `/assets/stills/daylight-snow-production-${width}.webp ${width}w`).join(', ')} sizes="100vw" alt="" fetchPriority="high" decoding="async" /></figure>
      <div className="produce-hero-content"><p className="produce-kicker">PRODUCE · LINE PRODUCTION</p><MotionHeading as="h1" id="line-production-title">Line Production &amp;{' '}<br />Production Management.<span>The shoot, run day to day.</span></MotionHeading><MotionCopy>Kemsor runs the practical engine of your production - budgets, schedules, people and problems - managed so the director can direct.</MotionCopy><div className="produce-actions"><CTA href="/contact/?partner=filmmakers">Talk to a line producer</CTA><TextLink href="#line-production-work">See related work</TextLink></div></div>
      <div className="produce-hero-foot"><a href="/produce/">← Back to Produce</a><a href="#line-production-included">What’s included <span aria-hidden="true">↓</span></a></div>
    </section>

    <section className="produce-section produce-intro" aria-labelledby="line-production-why"><div><Label>WHY IT MATTERS</Label><MotionHeading as="h2" id="line-production-why">Why it matters.</MotionHeading></div><div className="produce-copy"><MotionCopy>A production lives or dies on its daily decisions. A scene runs long, a location falls through, the light changes. Line production is the discipline of keeping the shoot moving without losing what the story needs.</MotionCopy><MotionCopy>We build budgets and schedules grounded in production realities, not optimism - then manage them every day, so producers and financiers always know where things stand.</MotionCopy></div></section>

    <section className="produce-section line-production-included" id="line-production-included" aria-labelledby="line-production-included-title"><Label>WHAT’S INCLUDED</Label><MotionHeading as="h2" id="line-production-included-title">What’s included.</MotionHeading><div className="line-production-scope"><dl className="line-production-deliverables">{included.map(([title, description], index) => <div key={title}><dt><span aria-hidden="true">0{index + 1}</span>{title}</dt><dd>{description}</dd></div>)}</dl><figure className="line-production-planning"><img src="/assets/services/planning.webp" alt="Production collaborators reviewing plans on a filming location" width="1672" height="941" loading="lazy" decoding="async"/><figcaption><span>PRODUCTION MANAGEMENT</span><MotionCopy>Every department working from the same plan and the same information.</MotionCopy></figcaption></figure></div></section>

    <section className="produce-section produce-process" aria-labelledby="line-production-process-title"><Label>HOW WE WORK</Label><MotionHeading as="h2" id="line-production-process-title">How we work.</MotionHeading><ol className="produce-steps line-production-steps">{steps.map(([title, description], index) => <li key={title}><span className="produce-step-number">0{index + 1}</span><h3>{title}</h3><p>{description}</p></li>)}</ol></section>

    <section className="produce-section produce-audiences" aria-labelledby="line-production-audiences-title"><div><Label>WHO IT’S FOR</Label><MotionHeading as="h2" id="line-production-audiences-title">Who it’s for.</MotionHeading><div className="produce-audience-mark" aria-hidden="true"><span>ON SET</span><i>+</i><span>IN THE OFFICE</span></div></div><ul>{audiences.map(([title, description], index) => <li key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{description}</p></div></li>)}</ul></section>

    {/* No cleared project title, format, year or line-production credit supplied. */}
    <section className="produce-section produce-work" id="line-production-work" aria-labelledby="line-production-work-title"><Label>RELATED WORK</Label><div><MotionHeading as="h2" id="line-production-work-title">Related work.</MotionHeading><TextLink href="/projects/">Explore productions</TextLink></div></section>

    <section className="produce-section produce-related line-production-related" aria-labelledby="line-production-related-title"><Label>RELATED SERVICES</Label><MotionHeading as="h2" id="line-production-related-title">Related services.</MotionHeading><div className="produce-related-grid">{related.map(([number, title, href]) => <a href={href} key={title}><span className="produce-related-number">{number}</span><h3>{title}</h3><span className="line-production-related-link">Explore service <Arrow /></span></a>)}</div></section>

    <section className="produce-section produce-questions" aria-labelledby="line-production-questions-title"><div><Label>QUESTIONS</Label><MotionHeading as="h2" id="line-production-questions-title">Questions.</MotionHeading></div><div className="produce-faqs">{questions.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></section>
  </div></ProduceLayout>;
}
