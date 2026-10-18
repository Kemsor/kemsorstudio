import React from 'react';
import { Arrow, CTA, TextLink } from '../PageUI';
import './produce-page.css';

// Copy follows Kemsor_Produce_00_Produce_Hub.docx.pdf.
// Service links point to existing capabilities until the individual pages are ready.
const services = [
  { title: 'Line Production & Production Management', description: 'The shoot, run day to day — on budget, on schedule, on story.', image: '/assets/stills/work-action-set-960.webp', href: '/produce/line-production/' },
  { title: 'Casting & Talent Coordination', description: 'The right faces for the story, and everything it takes to get them on set.', image: '/assets/services/casting.webp', href: '/produce/casting/' },
  { title: 'Locations & Logistics', description: 'The right place, ready when the camera is.', image: '/assets/services/planning.webp', href: '/services/#capability-planning' },
  { title: 'Crew & Equipment', description: 'The right team and the right kit, sized to the shoot.', image: '/assets/services/filming.webp', href: '/services/#capability-filming' },
  { title: 'Set & Production Design', description: 'The world of the story, built to be filmed.', image: '/assets/services/design.webp', href: '/services/#capability-design' },
  { title: 'Shooting & On-Location Production', description: 'Cameras rolling. Everything else handled.', image: '/assets/stills/action-scene-960.webp', href: '/services/#capability-filming' },
];
const steps = [
  ['Understand the story', 'What the story needs to be and who it is for — before any numbers are set.'],
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
  ['01', 'Develop', 'Development & Packaging', '/services/#development'],
  ['02', 'Finance', 'Financing & Investment Coordination', '/services/#capability-financing'],
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

export default function ProducePage() {
  return <div className="produce-hub">
    <nav className="produce-breadcrumb" aria-label="Breadcrumb"><a href="/">Kemsor Studios</a><span aria-hidden="true">/</span><a href="/services/">Capabilities</a><span aria-hidden="true">/</span><span aria-current="page">Produce</span></nav>

    <section className="produce-hero" aria-labelledby="produce-title">
      <figure className="produce-hero-image" aria-hidden="true">
        <img src="/assets/stills/work-period-set-1600.webp" srcSet={[640, 960, 1600].map(width => `/assets/stills/work-period-set-${width}.webp ${width}w`).join(', ')} sizes="100vw" alt="" fetchPriority="high" decoding="async" />
      </figure>
      <div className="produce-hero-content">
        <p className="produce-kicker">03 / PRODUCE</p>
        <h1 id="produce-title">Produce.<span>Everything it takes{' '}<br />to get the story shot.</span></h1>
        <p>From casting and locations to crew, design and the shoot itself, Kemsor runs the practical side of production — so the creative work has room to happen.</p>
        <div className="produce-actions"><CTA href="/contact/?partner=filmmakers">Start a conversation</CTA><TextLink href="/services/">Explore all services</TextLink></div>
      </div>
      <div className="produce-hero-foot"><span>KEMSOR STUDIOS · STORY. CRAFT. CINEMA.</span><a href="#produce-services">Explore production support <span aria-hidden="true">↓</span></a></div>
    </section>

    <section className="produce-section produce-intro" aria-labelledby="produce-intro-title">
      <div><Label>WHERE THE PLAN MEETS THE REAL WORLD</Label><h2 id="produce-intro-title">Where the plan meets<br /><em>the real world.</em></h2></div>
      <div className="produce-copy"><p>Production is where every earlier decision is tested. Schedules meet weather, budgets meet reality, and a hundred people need to be in the right place at the right time.</p><p>Kemsor brings the planning, people, and production discipline to carry that weight. Every budget line and schedule decision is measured against what the story needs — and collaborators hear about risks in time to act on them.</p></div>
    </section>

    <section className="produce-section produce-services" id="produce-services" aria-labelledby="produce-services-title">
      <Label end="SHAPED AROUND YOUR PROJECT">THE PRODUCTION TOOLKIT</Label>
      <div className="produce-section-head"><h2 id="produce-services-title">Six services,<br /><em>one production partner.</em></h2><span className="produce-count" aria-hidden="true">01 — 06</span></div>
      <div className="produce-service-grid">{services.map((service, index) => <a className="produce-service" href={service.href} key={service.title}>
        <div className="produce-service-image"><img src={service.image} alt="" loading="lazy" decoding="async" width="960" height="540"/><span>{String(index + 1).padStart(2, '0')} / 06</span></div>
        <div className="produce-service-body"><h3>{service.title}</h3><p>{service.description}</p><span className="produce-card-link">Explore service <Arrow /></span></div>
      </a>)}</div>
    </section>

    <section className="produce-section produce-process" id="produce-process" aria-labelledby="produce-process-title">
      <Label end="STORY → PLAN → PRODUCTION">HOW WE WORK</Label>
      <h2 id="produce-process-title">How we work.</h2>
      <ol className="produce-steps">{steps.map(([title, description], index) => <li key={title}><span className="produce-step-number">0{index + 1}</span><h3>{title}</h3><p>{description}</p></li>)}</ol>
    </section>

    <section className="produce-section produce-audiences" aria-labelledby="produce-audiences-title">
      <div><Label>WHO IT’S FOR</Label><h2 id="produce-audiences-title">Who it’s for.</h2><div className="produce-audience-mark" aria-hidden="true"><span>THE STORY</span><i>+</i><span>THE PEOPLE</span><i>+</i><span>THE PLAN</span></div></div>
      <ul>{audiences.map(([title, description], index) => <li key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{description}</p></div></li>)}</ul>
    </section>

    {/* No project title, year or production credit was supplied. Keep unverified
        project cards out of the page; the productions archive remains accessible. */}
    <section className="produce-section produce-work" aria-labelledby="produce-work-title"><Label>RELATED WORK</Label><div><h2 id="produce-work-title">Related work.</h2><TextLink href="/projects/">Explore productions</TextLink></div></section>

    <section className="produce-section produce-related" aria-labelledby="produce-related-title"><Label>BEFORE THE SHOOT. AFTER THE WRAP.</Label><h2 id="produce-related-title">Related services.</h2><div className="produce-related-grid">{related.map(([number, title, description, href]) => <a href={href} key={title}><span className="produce-related-number">{number}</span><h3>{title}</h3><p>{description}</p><Arrow /></a>)}</div></section>

    <section className="produce-section produce-questions" aria-labelledby="produce-questions-title"><div><Label>A FEW THINGS TO KNOW</Label><h2 id="produce-questions-title">Questions.</h2></div><div className="produce-faqs">{questions.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></section>

    <section className="produce-section produce-closing" aria-labelledby="produce-closing-title"><Label>YOUR NEXT PRODUCTION</Label><div><h2 id="produce-closing-title">Ready to<br /><em>get it shot?</em></h2><div><p>Tell us about the project and where it stands. We’ll shape the production support it needs.</p><CTA href="/contact/?partner=filmmakers">Start a conversation</CTA></div></div></section>
  </div>;
}
