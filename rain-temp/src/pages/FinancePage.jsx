import SiteIcon from '../SiteIcon';
import MotionHeading, { MotionCopy } from '../TextMotion';
import FinanceLayout from '../FinanceLayout';
import React from 'react';
import { CTA, TextLink } from '../PageUI';
import './produce-page.css';
import './finance-page.css';

// Supplied copy: Kemsor_02_Finance_Main_Page_Content.docx.pdf.
const pack = [
  ['Creative package', 'Script, treatment and creative vision'],
  ['Budget', 'Top sheet and detail, with contingency'],
  ['Sources & gap summary', 'What’s committed, and what’s still needed'],
  ['Cash-flow schedule', 'Money mapped to every production stage'],
  ['Production plan', 'Team, schedule, locations and approach'],
];
const comparison = [
  ['A story worth telling', '“What will it cost to make?”', 'A budget grounded in production realities, line by line'],
  ['A creative vision', '“Can this team deliver it?”', 'A production plan covering team, locations and approach'],
  ['A sense of momentum', '“When will it be finished?”', 'A realistic schedule from development to delivery'],
  ['An audience in mind', '“How does it reach people?”', 'A release path through platforms and distributors'],
];
const services = [
  { id: 'finance-structuring', title: 'Finance Structuring', headline: 'Build the money around the story.', description: 'How much, from whom, arriving when and paying for what, brought together in one finance plan.', highlights: ['Budget with contingency', 'Sources & gap summary', 'Cash-flow schedule by stage'], action: 'Explore Finance Structuring', href: '/finance/finance-structuring/' },
  { id: 'co-production', title: 'Co-Production', headline: 'Two companies. One project. No confusion.', description: 'Partners agree on contributions, decisions and responsibilities before cameras roll.', highlights: ['Six questions answered upfront', 'Partner Alignment Brief', 'Kemsor as partner or producer'], action: 'Explore Co-Production', href: '/finance/co-production/' },
  { id: 'international-co-productions', title: 'International Co-Productions', headline: 'One story. Many countries. One plan.', description: 'One plan for partners in India and abroad, with production support on the ground in India.', highlights: ['Partners into India', 'Indian projects to the world', 'Reporting across time zones'], action: 'Explore International Co-Productions', href: '/finance/international-co-productions/' },
];
const creatorBenefits = [
  'Shape the script and creative package into a project ready to pitch',
  'Build a budget and schedule that stand up to scrutiny',
  'Prepare the production plan financiers ask about first',
  'Bring financiers and investors into the conversation',
  'Support you through discussions with clear answers',
  'Carry the agreed plan straight into production',
];
const financierBenefits = [
  'Projects presented with clear budgets, schedules and plans',
  'Numbers grounded in production realities, not optimism',
  'Risks and decisions shared early, in time to act on them',
  'A production partner that can also run the shoot',
  'Regular production reporting once cameras roll',
  'Features, series, documentaries and short films',
];
const steps = [
  ['Assess', 'We review the project and its creative goals, then assess where it stands and what it needs for financing.'],
  ['Structure', 'Budget, sources, cash flow and production plan, built into one finance-ready pack.'],
  ['Connect', 'Financiers, investors and co-production partners in India or abroad, brought into the conversation with a clear plan.'],
  ['Carry through', 'The agreed plan carries into pre-production so the team can deliver what was promised.'],
];
const principles = [
  ['Numbers that hold up', 'Budgets and schedules grounded in production realities, not optimism.'],
  ['No surprises', 'Financiers and partners hear about risks and decisions in time to act on them.'],
  ['Story first', 'Every budget line is measured against what the story needs.'],
];
const questions = [
  ['Do you guarantee funding for my project?', 'No. No one can honestly guarantee financing. We can help your project reach financiers with a clear, credible plan.'],
  ['What do I need before we talk?', 'A script or a strong treatment is enough to start. We help build the rest: the creative package, budget, schedule and production plan.'],
  ['Can investors approach Kemsor looking for projects?', 'Yes. Financiers and investors are welcome to start a conversation about projects in development across features, series, documentaries and short films.'],
  ['Which finance service do I need?', 'Need a plan for how the project is funded? Start with Finance Structuring. Making it with another company? Co-Production. Partners in other countries? International Co-Productions. Not sure? Start a conversation and we’ll point you to the right one.'],
  ['Does Kemsor give investment advice?', 'No. We coordinate financing and production planning. Investors and creators should take their own financial, legal and tax advice.'],
];
function Label({ children, end }) {
  return <div className="produce-label"><span>{children}</span>{end && <span>{end}</span>}</div>;
}

Label.displayName = 'EditorialLabel';

export default function FinancePage() {
  return <FinanceLayout page="finance"><div className="produce-hub finance-page">
    <nav className="produce-breadcrumb" aria-label="Breadcrumb"><a href="/">Kemsor Studios</a><span aria-hidden="true">/</span><a href="/services/">Capabilities</a><span aria-hidden="true">/</span><span aria-current="page">Finance</span></nav>

    <section className="produce-hero finance-hero" aria-labelledby="finance-title">
      <figure className="produce-hero-image" aria-hidden="true"><img src="/assets/stills/financing-co-production-1600.webp" srcSet={[640, 960, 1600].map(width => `/assets/stills/financing-co-production-${width}.webp ${width}w`).join(', ')} sizes="100vw" alt="" fetchPriority="high" decoding="async"/></figure>
      <div className="finance-hero-grid"><div className="produce-hero-content"><p className="produce-kicker">02 · FINANCE</p><MotionHeading as="h1" id="finance-title">Finance.<span>Make the story<br/>fundable.</span></MotionHeading><MotionCopy>Financiers need a plan they can assess. Kemsor structures the finance, aligns co-production partners in India and abroad, and brings financiers and investors into the conversation with a clear production plan.</MotionCopy><div className="produce-actions"><CTA href="#for-creators">I’m raising finance</CTA><TextLink href="#for-financiers">I’m looking to invest</TextLink></div></div>
        <aside className="finance-pack" aria-labelledby="finance-pack-title"><p className="finance-pack-label">FINANCE-READY PACK</p><span>Built through Finance Structuring</span><MotionHeading as="h2" id="finance-pack-title">Your project title</MotionHeading><p className="finance-pack-example">Illustrative pack contents</p><ol>{pack.map(([title, line], index) => <li key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{line}</p></div></li>)}</ol></aside>
      </div>
    </section>

    <nav className="finance-subnav" aria-label="Finance services"><span>02 · FINANCE</span><a href="/finance/" aria-current="page">Overview</a>{services.map(service => <a href={`#${service.id}`} key={service.id}>{service.title}</a>)}</nav>

    <section className="produce-section finance-gap" aria-labelledby="finance-gap-title"><Label end="WHAT STANDS BETWEEN A SCRIPT AND A GREENLIGHT">THE FINANCE GAP</Label><div className="finance-section-heading"><MotionHeading as="h2" id="finance-gap-title">Most projects don’t stall for lack of story.<br/><em>They stall for lack of a plan.</em></MotionHeading><MotionCopy>A financier needs to know what the film will cost, how long it will take, who will make it and how it will reach an audience. Clear answers help the conversation move forward.</MotionCopy></div><div className="finance-comparison" role="region" aria-label="What a financier asks and how Kemsor prepares your project" tabIndex="0"><table><thead><tr><th scope="col">You bring</th><th scope="col">A financier asks</th><th scope="col">Kemsor answers with</th></tr></thead><tbody>{comparison.map(([bring, ask, answer]) => <tr key={bring}><th scope="row">{bring}</th><td>{ask}</td><td>{answer}</td></tr>)}</tbody></table></div></section>

    <section className="produce-section finance-services" aria-labelledby="finance-services-title"><Label end="THREE WAYS IN">OUR FINANCE SERVICES</Label><div className="finance-section-heading"><MotionHeading as="h2" id="finance-services-title">Three ways we finance<br/><em>stories.</em></MotionHeading><MotionCopy>Structure the money. Share the making. Cross borders. Start with the service that fits where your project is today.</MotionCopy></div><div className="finance-service-grid">{services.map((service, index) => <article className="finance-service-card" id={service.id} key={service.id}><span className="finance-card-index">0{index + 1} / 03</span><p className="finance-service-name">{service.title}</p><h3>{service.headline}</h3><p>{service.description}</p><ul>{service.highlights.map(highlight => <li key={highlight}>{highlight}</li>)}</ul><TextLink href={service.href}>{service.action}</TextLink></article>)}</div></section>

    <section className="produce-section finance-audiences" aria-labelledby="finance-audiences-title"><Label end="CREATORS · FINANCIERS">TWO SIDES OF THE TABLE</Label><MotionHeading as="h2" id="finance-audiences-title">Two sides of the table.<br/><em>One clear plan between them.</em></MotionHeading><div className="finance-audience-grid"><article id="for-creators" className="finance-audience-card"><p className="finance-audience-label">FOR CREATORS &amp; PRODUCERS · RAISING FINANCE</p><h3>You have the story.<br/>We help you make the case.</h3><ul>{creatorBenefits.map(line => <li key={line}>{line}</li>)}</ul><CTA href="/contact/?partner=filmmakers">Start with your project</CTA></article><article id="for-financiers" className="finance-audience-card finance-audience-investors"><p className="finance-audience-label">FOR FINANCIERS &amp; INVESTORS · LOOKING FOR PROJECTS</p><h3>You have the capital.<br/><span>We bring projects with a plan.</span></h3><ul>{financierBenefits.map(line => <li key={line}>{line}</li>)}</ul><CTA href="/contact/?partner=co-producers">Talk to us about investing</CTA></article></div></section>

    <section className="produce-section produce-process finance-process" aria-labelledby="finance-process-title"><Label end="FROM FIRST CONVERSATION TO FIRST SHOOT DAY">HOW IT WORKS</Label><MotionHeading as="h2" id="finance-process-title">From first conversation<br/><em>to first shoot day.</em></MotionHeading><MotionCopy className="finance-process-intro">Because Kemsor also produces, the plan that wins the finance is the plan we deliver. No hand-off to strangers, no promises the shoot can’t keep.</MotionCopy><ol className="produce-steps finance-steps">{steps.map(([title, line], index) => <li key={title}><span className="produce-step-number">0{index + 1}</span><h3>{title}</h3><p>{line}</p></li>)}</ol></section>

    <section className="produce-section finance-principles" aria-label="Our finance principles">{principles.map(([title, line]) => <article key={title}><h3>{title}</h3><p>{line}</p></article>)}</section>

    {/* No cleared project title, format, year, countries or finance credits supplied. */}
    <section className="produce-section produce-work" aria-labelledby="finance-work-title"><Label>RELATED WORK · PROJECTS WE’VE HELPED FINANCE</Label><div><MotionHeading as="h2" id="finance-work-title">Related work.</MotionHeading><TextLink href="/projects/">Explore productions</TextLink></div></section>

    <section className="produce-section produce-questions finance-questions" aria-labelledby="finance-questions-title"><div><Label>QUESTIONS · STRAIGHT ANSWERS ABOUT MONEY</Label><MotionHeading as="h2" id="finance-questions-title">Straight answers<br/><em>about money.</em></MotionHeading></div><div className="produce-faqs">{questions.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true"><SiteIcon name="plus" size={16} /></span></summary><p>{answer}</p></details>)}</div></section>

    <section className="produce-section produce-closing finance-closing" aria-labelledby="finance-closing-title"><Label>02 · FINANCE</Label><div><MotionHeading as="h2" id="finance-closing-title">Make the story<br/><em>fundable.</em></MotionHeading><div><MotionCopy>Raising finance or looking for projects, it starts with a conversation. We’ll show you what a clear plan looks like.</MotionCopy><div className="produce-actions"><CTA href="#for-creators">I’m raising finance</CTA><TextLink href="#for-financiers">I’m looking to invest</TextLink></div></div></div><MotionCopy className="finance-disclaimer">Kemsor coordinates financing and co-production planning. It does not provide investment, legal or tax advice, and does not guarantee financing or returns.</MotionCopy></section>
  </div></FinanceLayout>;
}
