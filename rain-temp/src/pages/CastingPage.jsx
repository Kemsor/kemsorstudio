import SiteIcon from '../SiteIcon';
import MotionHeading, { MotionCopy } from '../TextMotion';
import ProduceLayout from '../ProduceLayout';
import React from 'react';
import { Arrow, CTA, TextLink } from '../PageUI';
import './produce-page.css';
import './line-production-page.css';
import './casting-page.css';

// Kemsor_Produce_02_Casting_and_Talent_Coordination.docx.pdf.
// Its unconfirmed agreement-coordination and applicant-privacy claims are omitted.
// No online casting-call workflow is advertised; existing talent pages remain linked.
const included = [
  ['Casting calls & auditions', 'Briefs written, calls published and auditions organised around the director’s vision.'],
  ['Shortlisting', 'Options presented clearly to the director and producers for decision.'],
  ['Kemsor Talent Network', 'Access to performers and crew who have joined the Kemsor network.'],
  ['Availability & scheduling', 'Talent availability aligned with the shooting schedule and call times.'],
  ['On-set talent care', 'Talent supported on shoot days, so performances get the focus they deserve.'],
];
const steps = [
  ['Understand the characters', 'We start with the script, the characters and what the director is looking for.'],
  ['Search & audition', 'Casting calls, Talent Network searches and auditions.'],
  ['Shortlist & confirm', 'Options presented, choices made and availability confirmed.'],
  ['Coordinate to wrap', 'Schedules, call times and on-set support through to the last shoot day.'],
];
const audiences = [
  ['Directors & producers', 'Directors and producers casting a film, series or short'],
  ['Platforms & studios', 'Platforms and studios that need casting coordinated alongside production'],
  ['Actors & performers', 'Actors and performers looking to join the Kemsor Talent Network'],
];
const related = [
  ['01', 'Line Production & Production Management', '/produce/line-production/', 'Explore service'],
  ['02', 'Crew & Equipment', '/produce/crew-equipment/', 'Explore service'],
  ['03', 'Talent Network: Find Talent', '/find-talent/', 'Find talent'],
  ['04', 'Talent Network: Join KEMSOR', '/join/', 'Join KEMSOR'],
];
const questions = [
  ['Can actors apply to work with Kemsor?', 'Yes. Performers can join the Kemsor Talent Network.'],
  ['Can you coordinate talent we have already cast?', 'Yes. We can take on scheduling and on-set coordination for talent you have already confirmed.'],
];
function Label({ children, end }) {
  return <div className="produce-label"><span>{children}</span>{end && <span>{end}</span>}</div>;
}

Label.displayName = 'EditorialLabel';

export default function CastingPage() {
  return <ProduceLayout page="casting"><div className="produce-hub casting-page">
    <nav className="produce-breadcrumb" aria-label="Breadcrumb"><a href="/">Kemsor Studios</a><span aria-hidden="true">/</span><a href="/produce/">Produce</a><span aria-hidden="true">/</span><span aria-current="page">Casting &amp; Talent</span></nav>

    <section className="produce-hero produce-hero-light line-production-hero casting-hero" aria-labelledby="casting-title"><figure className="produce-hero-image" aria-hidden="true"><img src="/assets/stills/family-drama-scene-1600.webp" srcSet={[640, 960, 1600].map(width => `/assets/stills/family-drama-scene-${width}.webp ${width}w`).join(', ')} sizes="100vw" alt="Supplied illustration of an ensemble cast performing a family confrontation in an Indian home" width="1600" height="640" fetchPriority="high" decoding="async"/></figure><div className="produce-hero-content"><p className="produce-kicker">PRODUCE · PRE-PRODUCTION</p><MotionHeading as="h1" id="casting-title">Casting &amp;{' '}<br />Talent Coordination.<span>The right faces for the story.</span></MotionHeading><MotionCopy>From casting call to call time, Kemsor finds and coordinates the talent your story needs through the Kemsor Talent Network.</MotionCopy><div className="produce-actions"><CTA href="/contact/?partner=filmmakers">Talk to us about casting</CTA><TextLink href="/join/">Join the Talent Network</TextLink></div></div><div className="produce-hero-foot"><a href="/produce/"><SiteIcon name="arrow-left" size={16} /> Back to Produce</a><a href="#casting-included">What’s included <span aria-hidden="true"><SiteIcon name="arrow-down" size={16} /></span></a></div></section>

    <section className="produce-section produce-intro" aria-labelledby="casting-why-title"><div><Label>WHY IT MATTERS</Label><MotionHeading as="h2" id="casting-why-title">Why it matters.</MotionHeading></div><div className="produce-copy"><MotionCopy>Casting shapes how an audience meets your story. Coordination decides whether that talent arrives prepared, on time, and looked after.</MotionCopy><MotionCopy>We find performers who fit the director’s vision, then manage availability, schedules and on-set care so they can do their best work. We treat talent as partners in the production.</MotionCopy></div></section>

    <section className="produce-section line-production-included" id="casting-included" aria-labelledby="casting-included-title"><Label>WHAT’S INCLUDED</Label><MotionHeading as="h2" id="casting-included-title">What’s included.</MotionHeading><div className="line-production-scope"><dl className="line-production-deliverables">{included.map(([title, description], index) => <div key={title}><dt><span aria-hidden="true">0{index + 1}</span>{title}</dt><dd>{description}</dd></div>)}</dl><figure className="line-production-planning casting-preparation"><img src="/assets/stills/pre-production-casting-960.webp" alt="Illustrative production scene showing collaborators preparing for a shoot" width="960" height="540" loading="lazy" decoding="async"/><figcaption><span>TALENT AS PARTNERS IN THE WORK</span><MotionCopy>The availability, schedules, and on-set care that let them do their best work.</MotionCopy></figcaption></figure></div></section>

    <section className="produce-section produce-process" aria-labelledby="casting-process-title"><Label>HOW WE WORK</Label><MotionHeading as="h2" id="casting-process-title">How we work.</MotionHeading><ol className="produce-steps line-production-steps">{steps.map(([title, description], index) => <li key={title}><span className="produce-step-number">0{index + 1}</span><h3>{title}</h3><p>{description}</p></li>)}</ol></section>

    <section className="produce-section produce-audiences" aria-labelledby="casting-audiences-title"><div><Label>WHO IT’S FOR</Label><MotionHeading as="h2" id="casting-audiences-title">Who it’s for.</MotionHeading><div className="casting-network"><span>KEMSOR TALENT NETWORK</span><div><TextLink href="/find-talent/">Find talent</TextLink><TextLink href="/join/">Join KEMSOR</TextLink></div></div></div><ul>{audiences.map(([title, description], index) => <li key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{description}</p></div></li>)}</ul></section>

    {/* No cleared project title, format, year or casting credit was supplied. */}
    <section className="produce-section produce-work" id="casting-work" aria-labelledby="casting-work-title"><Label>RELATED WORK</Label><div><MotionHeading as="h2" id="casting-work-title">Related work.</MotionHeading><TextLink href="/projects/">Explore productions</TextLink></div></section>

    <section className="produce-section produce-related line-production-related" aria-labelledby="casting-related-title"><Label>RELATED SERVICES</Label><MotionHeading as="h2" id="casting-related-title">Related services.</MotionHeading><div className="produce-related-grid">{related.map(([number, title, href, action]) => <a href={href} key={title}><span className="produce-related-number">{number}</span><h3>{title}</h3><span className="line-production-related-link">{action}<Arrow /></span></a>)}</div></section>

    <section className="produce-section produce-questions" aria-labelledby="casting-questions-title"><div><Label>QUESTIONS</Label><MotionHeading as="h2" id="casting-questions-title">Questions.</MotionHeading></div><div className="produce-faqs">{questions.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true"><SiteIcon name="plus" size={16} /></span></summary><p>{answer}</p></details>)}</div></section>
  </div></ProduceLayout>;
}
