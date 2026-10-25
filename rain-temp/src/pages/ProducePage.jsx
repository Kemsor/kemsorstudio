import MotionHeading, { MotionCopy } from '../TextMotion';
import ProduceLayout from '../ProduceLayout';
import React from 'react';
import { Arrow, CTA, TextLink } from '../PageUI';
import './produce-page.css';

// Copy follows Kemsor_Produce_00_Produce_Hub.docx.pdf.
// Each service links to its dedicated Produce page.
const services = [
  { title: 'Line Production & Production Management', description: 'The shoot, run day to day - on budget, on schedule, on story.', image: '/assets/stills/work-action-set-960.webp', href: '/produce/line-production/' },
  { title: 'Casting & Talent Coordination', description: 'The right faces for the story, and everything it takes to get them on set.', image: '/assets/stills/daylight-interior-production-960.webp', href: '/produce/casting/' },
  { title: 'Locations & Logistics', description: 'The right place, ready when the camera is.', image: '/assets/stills/daylight-valley-production-960.webp', href: '/produce/locations-logistics/' },
  { title: 'Crew & Equipment', description: 'The right team and the right kit, sized to the shoot.', image: '/assets/stills/daylight-park-production-960.webp', href: '/produce/crew-equipment/' },
  { title: 'Set & Production Design', description: 'The world of the story, built to be filmed.', image: '/assets/stills/courtyard-dance-production-960.webp', href: '/produce/set-production-design/' },
  { title: 'Shooting & On-Location Production', description: 'Cameras rolling. Everything else handled.', image: '/assets/stills/fort-action-production-960.webp', href: '/produce/shooting-on-location/' },
];
const steps = [
  ['Understand the story', 'What the story needs to be and who it is for - before any numbers are set.'],
  ['Build the plan', 'Budget, schedule, team and locations shaped by the creative goal.'],
  ['Deliver the work', 'Clear communication keeps every collaborator aligned, stage to stage.'],
];
const audiences = [
  ['Producers', 'Producers who need a production partner they can trust on the ground'],
  ['Studios & OTT platforms', 'Studios and OTT platforms that need dependable production management'],
  ['Directors', 'Directors who want the practical side handled so they can focus on the frame'],
  ['International productions', 'International productions filming in India'],
];
const related = [
  ['01', 'Develop', 'Development & Packaging', '/develop/'],
  ['02', 'Finance', 'Financing & Investment Coordination', '/finance/'],
  ['04', 'Post', 'Production Supervision', '/services/#capability-post'],
  ['INDIA', 'India', 'Production Services', '/services/#india-production-services'],
];
const questions = [
  ['Can we use just one of these services?', 'Yes. Scope is shaped to the project, never imposed as a fixed package. Bring us in for a single service, a single shoot, or the full production.'],
  ['Which formats do you produce?', 'Feature films, series and OTT content, documentaries and short films, including regional cinema and international co-productions.'],
  ['Can you join a project already in progress?', 'Yes. Bring us in at the start, or at the stage where you need us most.'],
];
function Label({ children, end }) {
  return <div className="produce-label"><span>{children}</span>{end && <span>{end}</span>}</div>;
}

Label.displayName = 'EditorialLabel';

export default function ProducePage() {
  return <ProduceLayout page="produce"><div className="produce-hub">
    <nav className="produce-breadcrumb" aria-label="Breadcrumb"><a href="/">Kemsor Studios</a><span aria-hidden="true">/</span><a href="/services/">Capabilities</a><span aria-hidden="true">/</span><span aria-current="page">Produce</span></nav>

    <section className="produce-hero produce-hero-light" aria-labelledby="produce-title">
      <figure className="produce-hero-image" aria-hidden="true">
        <img src="/assets/stills/work-period-set-1600.webp" srcSet={[640, 960, 1600].map(width => `/assets/stills/work-period-set-${width}.webp ${width}w`).join(', ')} sizes="100vw" alt="" fetchPriority="high" decoding="async" />
      </figure>
      <div className="produce-hero-content">
        <p className="produce-kicker">03 / PRODUCE</p>
        <MotionHeading as="h1" id="produce-title">Produce.<span>Everything it takes{' '}<br />to get the story shot.</span></MotionHeading>
        <MotionCopy>From casting and locations to crew, design and the shoot itself, Kemsor runs the practical side of production - so the creative work has room to happen.</MotionCopy>
        <div className="produce-actions"><CTA href="/contact/?partner=filmmakers">Start a conversation</CTA><TextLink href="/services/">Explore all services</TextLink></div>
      </div>
      <div className="produce-hero-foot"><span>KEMSOR STUDIOS · STORY. CRAFT. CINEMA.</span><a href="#produce-services">Explore production support <span aria-hidden="true">↓</span></a></div>
    </section>

    <section className="produce-section produce-intro" aria-labelledby="produce-intro-title">
      <div><Label>WHERE THE PLAN MEETS THE REAL WORLD</Label><MotionHeading as="h2" id="produce-intro-title">Where the plan meets<br /><em>the real world.</em></MotionHeading></div>
      <div className="produce-copy"><MotionCopy>Production is where every earlier decision is tested. Schedules meet weather, budgets meet reality, and a hundred people need to be in the right place at the right time.</MotionCopy><MotionCopy>Kemsor brings the planning, people, and production discipline to carry that weight. Every budget line and schedule decision is measured against what the story needs - and collaborators hear about risks in time to act on them.</MotionCopy></div>
    </section>

    <section className="produce-section produce-services" id="produce-services" aria-labelledby="produce-services-title">
      <Label>PRODUCTION SERVICES</Label>
      <div className="produce-section-head"><MotionHeading as="h2" id="produce-services-title">Six services,<br /><em>one production partner.</em></MotionHeading><span className="produce-count" aria-hidden="true">01 - 06</span></div>
      <div className="produce-service-grid">{services.map((service, index) => <a className="produce-service" href={service.href} key={service.title}>
        <div className="produce-service-image"><img src={service.image} srcSet={service.image.endsWith('-960.webp')?[640,960,1600].map(width=>`${service.image.replace('-960.webp',`-${width}.webp`)} ${width}w`).join(', '):undefined} sizes="(max-width: 480px) 90vw, (max-width: 1050px) 44vw, 30vw" alt="" loading="lazy" decoding="async" width="960" height="540"/><span>{String(index + 1).padStart(2, '0')} / 06</span></div>
        <div className="produce-service-body"><h3>{service.title}</h3><p>{service.description}</p><span className="produce-card-link">Explore service <Arrow /></span></div>
      </a>)}</div>
    </section>

    <section className="produce-section produce-process" id="produce-process" aria-labelledby="produce-process-title">
      <Label>HOW WE WORK</Label>
      <MotionHeading as="h2" id="produce-process-title">How we work.</MotionHeading>
      <ol className="produce-steps">{steps.map(([title, description], index) => <li key={title}><span className="produce-step-number">0{index + 1}</span><h3>{title}</h3><p>{description}</p></li>)}</ol>
    </section>

    <section className="produce-section produce-audiences" aria-labelledby="produce-audiences-title">
      <div><Label>WHO IT’S FOR</Label><MotionHeading as="h2" id="produce-audiences-title">Who it’s for.</MotionHeading><div className="produce-audience-mark" aria-hidden="true"><span>THE STORY</span><i>+</i><span>THE PEOPLE</span><i>+</i><span>THE PLAN</span></div></div>
      <ul>{audiences.map(([title, description], index) => <li key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{description}</p></div></li>)}</ul>
    </section>

    {/* No project title, year or production credit was supplied. Keep unverified
        project cards out of the page; the productions archive remains accessible. */}
    <section className="produce-section produce-work" aria-labelledby="produce-work-title"><Label>RELATED WORK</Label><div><MotionHeading as="h2" id="produce-work-title">Related work.</MotionHeading><TextLink href="/projects/">Explore productions</TextLink></div></section>

    <section className="produce-section produce-related" aria-labelledby="produce-related-title"><Label>RELATED SERVICES</Label><MotionHeading as="h2" id="produce-related-title">Related services.</MotionHeading><div className="produce-related-grid">{related.map(([number, title, description, href]) => <a href={href} key={title}><span className="produce-related-number">{number}</span><h3>{title}</h3><p>{description}</p><Arrow /></a>)}</div></section>

    <section className="produce-section produce-questions" aria-labelledby="produce-questions-title"><div><Label>QUESTIONS</Label><MotionHeading as="h2" id="produce-questions-title">Questions.</MotionHeading></div><div className="produce-faqs">{questions.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></section>
  </div></ProduceLayout>;
}
