import MotionHeading, { MotionCopy } from '../TextMotion';
import React from 'react';
import EditorialPage from '../EditorialPage';
import { CTA, TextLink } from '../PageUI';
import './produce-page.css';
import './finance-page.css';
import './develop-page.css';

const services = [
  {id:'story-script', title:'Story & Script Development', headline:'Every draft closer to the screen.', body:'Structure, character and stakes - read by people who also know what it costs to shoot.', highlights:['Creative read and production read','Logline, synopsis and treatment','Notes that help the writer lead'], action:'Explore Story & Script', href:'/develop/story-script/'},
  {id:'packaging-talent', title:'Packaging & Talent Attachment', headline:'Give financiers a reason to say yes.', body:'Director, cast approach, look and plan - assembled into a package people want to back.', highlights:['The full project package','Honest attachment status','Packages for financiers and platforms'], action:'Explore Packaging & Talent', href:'/develop/packaging-talent/'},
  {id:'budgeting-scheduling', title:'Budgeting & Scheduling', headline:'The truth about what it takes.', body:'Two honest numbers - cost and time - built from the script up.', highlights:['Script breakdown','Budget and shooting schedule','Scenario options and assumptions'], action:'Explore Budgeting & Scheduling', href:'/develop/budgeting-scheduling/'},
];
const costs = [
  ['In development','A conversation and a rewrite'],
  ['In pre-production','Re-planning budgets, schedules and bookings'],
  ['During the shoot','Lost days, overtime and pressure on everyone'],
  ['In post-production','Reshoots - or living with the compromise'],
];
const checklist = [
  ['A clear logline and synopsis','The story in one line, and in one page'],
  ['A script ready to share','A draft that reads well and can be made'],
  ['A project package','Director, cast approach, look and plan'],
  ['An honest budget','Grounded in production realities, with contingency'],
  ['A realistic schedule','Built around story, cast and locations'],
  ['A clear next step','Into 02 Finance or straight into 03 Produce'],
];
const steps = [
  ['Listen','We start with what the story needs to be and who it is for.'],
  ['Shape','Story and script developed with the writer in the lead.'],
  ['Package','The right people and the right look attached to the project.'],
  ['Plan','Budget and schedule built from the script up.'],
  ['Hand on','Into Finance or Production - with the same team.'],
];
const audiences = [
  'Writers with a script or an idea worth developing',
  'Directors building a project around their vision',
  'Producers getting a project ready to pitch',
  'Platforms and studios developing projects with a production partner',
];
const questions = [
  ['Do I need a finished script?','No. An idea, a treatment or an early draft is enough to start a conversation.'],
  ['Which service do I start with?',<>Still shaping the story? <a href="/develop/story-script/">Story &amp; Script Development</a>. Script ready, need people and a pitch? <a href="/develop/packaging-talent/">Packaging &amp; Talent Attachment</a>. Need to know what it costs? <a href="/develop/budgeting-scheduling/">Budgeting &amp; Scheduling</a>.</>],
  ['How do I share my work safely?',<>Send it through <a href="/script-to-production/">Script to Production</a>, where terms are accepted before any submission is reviewed.</>],
  ['What happens after development?',<>Projects move into <a href="/finance/">02 Finance</a> to secure funding, or straight into <a href="/produce/">03 Produce</a> - with the same Kemsor team.</>],
];
function Label({children}) {return <div className="produce-label"><span>{children}</span></div>;}
Label.displayName = 'EditorialLabel';

// Public copy from Kemsor_Develop_00_Develop_Overview_Content.docx.pdf.
export default function DevelopPage() {
  return <EditorialPage page="develop"><div className="produce-hub develop-page">
    <nav className="produce-breadcrumb" aria-label="Breadcrumb"><a href="/">Kemsor Studios</a><span aria-hidden="true">/</span><a href="/services/">Capabilities</a><span aria-hidden="true">/</span><span aria-current="page">Develop</span></nav>
    <section className="produce-hero" aria-labelledby="develop-title"><figure className="produce-hero-image" aria-hidden="true"><img src="/assets/stills/development-packaging-1600.webp" srcSet={[640,960,1600].map(w=>`/assets/stills/development-packaging-${w}.webp ${w}w`).join(', ')} sizes="100vw" alt="" fetchPriority="high" decoding="async"/></figure><div className="produce-hero-content"><p className="produce-kicker">01 · DEVELOP</p><MotionHeading as="h1" id="develop-title">Develop.<span>Make it ready before it’s made.</span></MotionHeading><MotionCopy>Most productions are won or lost before anyone says “action”. Kemsor helps shape the story, attach the right people, and cost and schedule the project - so it’s ready to pitch, finance and make.</MotionCopy><div className="produce-actions"><CTA href="/script-to-production/">Bring us your story</CTA><TextLink href="#ready-checklist">See what “ready” looks like</TextLink></div></div><div className="editorial-hero-graphic develop-journey" aria-label="Development Journey example"><p className="develop-journey-label">YOUR PROJECT · ILLUSTRATIVE JOURNEY</p><ol>{[['Idea','Done'],['Story','Done'],['Script','In progress'],['Package','Next'],['Plan','Next']].map(([title,status],i)=><li key={title} data-status={status}><span>0{i+1}</span><strong>{title}</strong><small>{status}</small></li>)}</ol></div></section>

    <nav className="finance-subnav" aria-label="Development services"><span>01 · DEVELOP</span><a href="/develop/" aria-current="page">Overview</a><a href="/develop/story-script/">Story &amp; Script</a><a href="/develop/packaging-talent/">Packaging &amp; Talent</a><a href="/develop/budgeting-scheduling/">Budgeting &amp; Scheduling</a></nav>

    <section className="produce-section" id="cost-of-change" aria-labelledby="cost-title"><Label>WHY DEVELOPMENT DECIDES EVERYTHING · THE COST OF CHANGE</Label><MotionHeading as="h2" id="cost-title">A change on the page costs a conversation.<br/><em>The same change on set costs a day.</em></MotionHeading><MotionCopy className="develop-intro">Every problem a project will ever have is cheapest to fix in development. That’s why we spend real effort here - before money and people are committed.</MotionCopy><div className="develop-costs"><div className="develop-cost-head" aria-hidden="true"><span>WHEN THE PROBLEM IS FOUND</span><span>WHAT FIXING IT COSTS</span></div>{costs.map(([when,cost],i)=><article key={when}><h3><span aria-hidden="true">0{i+1}</span>{when}</h3><p><span className="develop-mobile-label">WHAT FIXING IT COSTS</span>{cost}</p></article>)}</div></section>

    <section className="produce-section" id="development-services" aria-labelledby="services-title"><Label>OUR DEVELOPMENT SERVICES · THREE STEPS TO READY</Label><MotionHeading as="h2" id="services-title">Three services.<br/><em>One project, ready to move.</em></MotionHeading><MotionCopy className="develop-intro">Use one, or all three. Scope is shaped to the project, never imposed as a fixed package.</MotionCopy><div className="finance-service-grid develop-service-grid">{services.map((service,i)=><article className="finance-service-card" id={service.id} key={service.id}><span className="finance-card-index">0{i+1} / 03</span><p className="finance-service-name">{service.title}</p><h3>{service.headline}</h3><p>{service.body}</p><ul>{service.highlights.map(line=><li key={line}>{line}</li>)}</ul><TextLink href={service.href || "/contact/?partner=filmmakers"}>{service.action}</TextLink></article>)}</div></section>

    <section className="produce-section" id="ready-checklist" aria-labelledby="ready-title"><Label>WHAT “READY” LOOKS LIKE · THE DEVELOP EXIT CHECKLIST</Label><MotionHeading as="h2" id="ready-title">When development is done,<br/><em>you’ll have all of this.</em></MotionHeading><MotionCopy className="develop-intro">Ready isn’t a feeling. It’s a set of things you can put in front of a financier, a platform or a partner.</MotionCopy><dl className="line-production-deliverables">{checklist.map(([title,body])=><div key={title}><dt>{title}</dt><dd>{body}</dd></div>)}</dl><div className="develop-next"><CTA href="/finance/">Next: 02 Finance</CTA></div></section>

    <section className="produce-section produce-process" id="how-it-works" aria-labelledby="process-title"><Label>HOW IT WORKS · FROM IDEA TO READY</Label><MotionHeading as="h2" id="process-title">From idea<br/><em>to ready.</em></MotionHeading><ol className="produce-steps finance-steps">{steps.map(([title,body],i)=><li key={title}><span className="produce-step-number">0{i+1}</span><h3>{title}</h3><p>{body}</p></li>)}</ol></section>

    <section className="produce-section" id="who-its-for" aria-labelledby="audiences-title"><Label>WHO IT’S FOR · FINISHED SCRIPT OR EARLY IDEA</Label><MotionHeading as="h2" id="audiences-title">Who it’s for.<br/><em>Any stage, any format.</em></MotionHeading><ul className="develop-audiences">{audiences.map(line=><li key={line}>{line}</li>)}</ul></section>

    {/* No approved project title, format, year or development credits supplied. */}
    <section className="produce-section produce-work" id="related-work" aria-labelledby="work-title"><Label>RELATED WORK</Label><div><MotionHeading as="h2" id="work-title">Related work.</MotionHeading><TextLink href="/projects/">Explore productions</TextLink></div></section>

    <section className="produce-section produce-questions" id="questions" aria-labelledby="questions-title"><div><Label>QUESTIONS · BEFORE YOU SEND YOUR STORY</Label><MotionHeading as="h2" id="questions-title">Questions,<br/><em>answered.</em></MotionHeading></div><div className="produce-faqs">{questions.map(([q,a])=><details key={q}><summary>{q}<span aria-hidden="true">+</span></summary><p>{a}</p></details>)}</div></section>

    <section className="produce-section produce-closing finance-closing" id="bring-your-story" aria-labelledby="closing-title"><Label>01 · DEVELOP</Label><div><MotionHeading as="h2" id="closing-title">Bring us the story<br/><em>at its earliest.</em></MotionHeading><div><MotionCopy>The earlier we start, the cheaper every good decision is. Share the idea, the treatment or the draft.</MotionCopy><div className="produce-actions"><CTA href="/contact/?partner=filmmakers">Bring us your story</CTA><TextLink href="/script-to-production/">Script to Production</TextLink></div></div></div></section>
  </div></EditorialPage>;
}
