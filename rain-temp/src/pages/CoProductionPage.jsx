import SiteIcon from '../SiteIcon';
import MotionHeading, { MotionCopy } from '../TextMotion';
import React from 'react';
import FinanceLayout from '../FinanceLayout';
import { CTA, TextLink } from '../PageUI';
import './produce-page.css';
import './finance-page.css';
import './co-production.css';

const contact = '/contact/?partner=co-producers';
const benefits = [
  ['Shared cost', 'No single partner carries the full budget.'],
  ['Shared risk', 'Exposure is spread across partners who all want the project to succeed.'],
  ['Combined strengths', 'One partner’s creative vision, another’s production capacity, another’s route to audiences.'],
  ['Wider reach', 'Each partner brings its own talent, locations, networks and audiences.'],
];
const alignment = [
  ['Who has the final creative say?', 'How creative decisions are made, and who makes the final call.'],
  ['Who contributes what?', 'Cash, crew, locations, equipment, post or services, with each contribution itemised.'],
  ['Who runs the production day-to-day?', 'One clear production lead, so the set never has two bosses.'],
  ['How are decisions escalated?', 'A simple path for disagreements, agreed while everyone is still friends.'],
  ['How are credits presented?', 'Credits agreed early, so they never become a dispute later.'],
  ['Who handles delivery and release?', 'Responsibility for deliverables, platforms and distributors made clear.'],
];
const brief = [
  ['Shared creative vision', 'What the project is, and who it is for'],
  ['Contributions matrix', 'Who brings cash, crew, locations and services'],
  ['Responsibilities', 'Who leads production, post and delivery'],
  ['Decision path', 'How choices are made and escalated'],
  ['Budget & schedule', 'One budget and one timeline for all partners'],
  ['Release plan', 'How the project reaches its audience'],
];
const roles = [
  ['Co-producing partner', 'Kemsor joins as a partner, sharing in the making of the project.'],
  ['Production partner', 'Kemsor runs production for the partnership, including line production, crew, locations and the shoot.'],
  ['Alignment partner', 'Kemsor brings partners together and keeps creative and production goals aligned.'],
];
const steps = [
  ['Match', 'Find partners whose strengths complete the project.'],
  ['Align', 'Answer the six questions together.'],
  ['Document', 'Prepare the Partner Alignment Brief for each partner’s lawyers.'],
  ['Produce', 'Carry the agreed plan into 03 Produce, with clear reporting to every partner.'],
];
const audiences = [
  'Producers looking for a partner to share a project',
  'Studios and production companies combining strengths',
  'Platforms developing projects with production partners',
  'Financiers who want clarity on who is responsible for what',
];
const questions = [
  ['We already have a partner. Can you still help?', 'Yes. We can align an existing partnership, prepare the Partner Alignment Brief, or run the production for it.'],
  ['Do you draft co-production agreements?', 'No. Your lawyers draft the agreement. We prepare the production-side terms they work from: budget, schedule, contributions and responsibilities.'],
  ['Can Kemsor be our co-production partner?', 'Yes, depending on the project. Tell us about it, and we’ll discuss the role that fits.'],
  ['Is this for international partners too?', <>For partners in different countries, see <a href="/finance/international-co-productions/">International Co-Productions</a>.</>],
];
function Label({children}) {return <div className="produce-label"><span>{children}</span></div>;}
Label.displayName = 'EditorialLabel';

// Public copy from Kemsor_Finance_02_Co-Production.docx.pdf.
export default function CoProductionPage() {
  return <FinanceLayout page="co-production"><div className="produce-hub co-production-page">
    <nav className="produce-breadcrumb" aria-label="Breadcrumb"><a href="/">Kemsor Studios</a><span aria-hidden="true">/</span><a href="/finance/">Finance</a><span aria-hidden="true">/</span><span aria-current="page">Co-Production</span></nav>
    <section className="produce-hero" aria-labelledby="co-production-title"><figure className="produce-hero-image" aria-hidden="true"><img src="/assets/stills/daylight-snow-production-1600.webp" srcSet={[640,960,1600].map(w=>`/assets/stills/daylight-snow-production-${w}.webp ${w}w`).join(', ')} sizes="100vw" alt="" fetchPriority="high" decoding="async"/></figure><div className="produce-hero-content"><p className="produce-kicker">02 · FINANCE · CO-PRODUCTION</p><MotionHeading as="h1" id="co-production-title">Co-Production.<span>Two companies. One project. No confusion.</span></MotionHeading><MotionCopy>Co-producing shares the cost, the risk, and the strengths of each partner. It works when everyone agrees before cameras roll on who brings what, who decides what, and who does what. Kemsor makes that agreement clear.</MotionCopy><div className="produce-actions"><CTA href={contact}>Explore a co-production</CTA><TextLink href="#partner-alignment">I already have a partner</TextLink></div></div></section>

    <section className="produce-section" id="why-co-produce" aria-labelledby="benefits-title"><Label>WHY CO-PRODUCE · SHARED STRENGTHS</Label><MotionHeading as="h2" id="benefits-title">Share the load.<br/><em>Multiply the strengths.</em></MotionHeading><div className="coproduction-benefits">{benefits.map(([title,body],i)=><article key={title}><span className="coproduction-small">0{i+1} / 04</span><h3>{title}</h3><p>{body}</p></article>)}</div></section>

    <section className="produce-section" id="partner-alignment" aria-labelledby="alignment-title"><Label>THE ALIGNMENT · WHERE CO-PRODUCTIONS SUCCEED OR FAIL</Label><MotionHeading as="h2" id="alignment-title">Most co-production problems<br/><em>start as unanswered questions.</em></MotionHeading><MotionCopy className="coproduction-intro">We help partners answer these six questions clearly and in writing, before the first rupee is spent.</MotionCopy><dl className="line-production-deliverables">{alignment.map(([title,body])=><div key={title}><dt>{title}</dt><dd>{body}</dd></div>)}</dl></section>

    <section className="produce-section" id="partner-alignment-brief" aria-labelledby="brief-title"><Label>WHAT WE PREPARE</Label><MotionHeading as="h2" id="brief-title">One document<br/><em>every partner signs off on.</em></MotionHeading><MotionCopy className="coproduction-intro">Kemsor prepares a Partner Alignment Brief that your lawyers can use as the production-side basis for the co-production agreement.</MotionCopy><div className="coproduction-brief"><div className="coproduction-document-heading"><span>PARTNER ALIGNMENT BRIEF</span><span>01 - 06</span></div><ol>{brief.map(([title,body],i)=><li key={title}><span className="coproduction-small" aria-hidden="true">0{i+1}</span><div><h3>{title}</h3><p>{body}</p></div></li>)}</ol></div></section>

    <section className="produce-section" id="our-role" aria-labelledby="roles-title"><Label>OUR ROLE · SHAPED TO THE PROJECT</Label><MotionHeading as="h2" id="roles-title">Partner, producer<br/><em>or the one who aligns everyone.</em></MotionHeading><div className="coproduction-roles">{roles.map(([title,body],i)=><article key={title}><span className="coproduction-small">0{i+1}</span><h3>{title}</h3><p>{body}</p></article>)}</div></section>

    <section className="produce-section produce-process" id="how-it-works" aria-labelledby="process-title"><Label>HOW IT WORKS</Label><MotionHeading as="h2" id="process-title">How it works.</MotionHeading><ol className="produce-steps finance-steps">{steps.map(([title,body],i)=><li key={title}><span className="produce-step-number">0{i+1}</span><h3>{title}</h3><p>{body}</p></li>)}</ol><div className="coproduction-production-link"><TextLink href="/produce/">Explore 03 Produce</TextLink></div></section>

    <section className="produce-section" id="who-its-for" aria-labelledby="audiences-title"><Label>WHO IT’S FOR</Label><MotionHeading as="h2" id="audiences-title">Who it’s for.</MotionHeading><ul className="coproduction-audiences">{audiences.map(line=><li key={line}>{line}</li>)}</ul></section>

    {/* No approved project title, format, partners or co-production credits supplied. */}
    <section className="produce-section produce-work" id="related-work" aria-labelledby="work-title"><Label>RELATED WORK</Label><div><MotionHeading as="h2" id="work-title">Related work.</MotionHeading><TextLink href="/projects/">Explore productions</TextLink></div></section>

    <section className="produce-section produce-questions" id="questions" aria-labelledby="questions-title"><div><Label>QUESTIONS</Label><MotionHeading as="h2" id="questions-title">Questions.</MotionHeading></div><div className="produce-faqs">{questions.map(([q,a])=><details key={q}><summary>{q}<span aria-hidden="true"><SiteIcon name="plus" size={16} /></span></summary><p>{a}</p></details>)}</div></section>

    <section className="produce-section produce-closing finance-closing" id="explore-co-production" aria-labelledby="closing-title"><Label>CO-PRODUCTION</Label><div><MotionHeading as="h2" id="closing-title">Better together<br/><em>if it’s clear.</em></MotionHeading><div><MotionCopy>Tell us about the project and the partners involved. We’ll help make the partnership work.</MotionCopy><CTA href={contact}>Explore a co-production</CTA></div></div></section>
  </div></FinanceLayout>;
}
