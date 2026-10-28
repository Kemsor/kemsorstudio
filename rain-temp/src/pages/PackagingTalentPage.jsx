import SiteIcon from '../SiteIcon';
import MotionHeading, { MotionCopy } from '../TextMotion';
import React from 'react';
import EditorialPage from '../EditorialPage';
import { CTA, TextLink } from '../PageUI';
import './produce-page.css';
import './finance-page.css';
import './packaging-talent.css';

const contact = '/contact/?partner=filmmakers';
const packageExample = [
  ['Logline & synopsis','Ready'], ['Director','Attached'], ['Lead cast','Approached'],
  ['Lookbook & tone','Ready'], ['Budget & schedule','In progress'], ['Supporting cast','Wishlist'],
];
const elements = [
  ['Logline & synopsis','The story, sharp enough to repeat.'],
  ['Director','Attached, or a clear approach to who directs.'],
  ['Key cast','Attached, or a clear casting approach for lead roles.'],
  ['Lookbook & tone','How the project will look and feel on screen.'],
  ['Producing partner','Kemsor as the partner who can deliver it.'],
  ['Budget & schedule','Honest numbers from Budgeting & Scheduling.'],
  ['Audience & release','Who it’s for, and how it reaches them.'],
];
const statuses = [
  ['Attached','Interest or agreement confirmed in writing'],
  ['Approached','In active conversation, not yet confirmed'],
  ['Wishlist','Ideal names on the wishlist; not yet contacted'],
];
const steps = [
  ['Define the role','What the story needs from the director or lead role.'],
  ['Find options','The Kemsor Talent Network and wider industry relationships.'],
  ['Approach with the package','Talent sees a serious project, not just a script.'],
  ['Confirm in writing','Interest confirmed, with agreements handled by your legal team.'],
];
const readers = [
  {label:'FOR FINANCIERS',title:'Can this be delivered?',body:'Attached elements, budget, schedule and the producing partner.',link:'Go to 02 Finance',href:'/finance/'},
  {label:'FOR PLATFORMS',title:'Will our audience watch?',body:'Audience fit, format, tone and, for series, the season arc.'},
  {label:'FOR CO-PRODUCERS',title:'What’s our role?',body:'Contributions, responsibilities and the shared creative goal.',link:'Go to Co-Production',href:'/finance/co-production/'},
];
const audiences = [
  'Writers and producers with a strong script and no package yet',
  'Directors building a project around their vision',
  'Producers preparing to approach financiers or platforms',
  <>Talent looking for serious projects through the <a href="/find-talent/">Kemsor Talent Network</a></>,
];
const questions = [
  ['Can you guarantee a star will attach?','No. No one honestly can. We approach the right people with a serious package and tell you exactly where each conversation stands.'],
  ['Do you only use the Kemsor Talent Network?','No. The Talent Network is one source; we also draw on wider industry relationships.'],
  ['How long does packaging take?','It depends on the project and on talent availability. We agree a plan and timeline at the start.'],
  ['Who handles talent agreements?','Your legal team handles agreements. We coordinate the conversations and the paperwork flow.'],
];
function Label({children}) {return <div className="produce-label"><span>{children}</span></div>;}
Label.displayName = 'EditorialLabel';

// Public copy from Kemsor_Develop_02_Packaging_and_Talent_Attachment_Content.docx.pdf.
export default function PackagingTalentPage() {
  return <EditorialPage page="packaging-talent"><div className="produce-hub packaging-page">
    <nav className="produce-breadcrumb" aria-label="Breadcrumb"><a href="/">Kemsor Studios</a><span aria-hidden="true">/</span><a href="/develop/">Develop</a><span aria-hidden="true">/</span><span aria-current="page">Packaging &amp; Talent</span></nav>
    <section className="produce-hero" aria-labelledby="packaging-title"><figure className="produce-hero-image" aria-hidden="true"><img src="/assets/stills/daylight-park-production-1600.webp" srcSet={[640,960,1600].map(w=>`/assets/stills/daylight-park-production-${w}.webp ${w}w`).join(', ')} sizes="100vw" alt="" fetchPriority="high" decoding="async"/></figure><div className="produce-hero-content"><p className="produce-kicker">01 · DEVELOP · PACKAGING &amp; TALENT</p><MotionHeading as="h1" id="packaging-title">Packaging &amp; Talent Attachment.<span>Give financiers a reason to say yes.</span></MotionHeading><MotionCopy>We bring together the director, key cast, visual approach and production plan to help turn a script into a project that partners can assess and back.</MotionCopy><div className="produce-actions"><CTA href={contact}>Package my project</CTA><TextLink href="#whats-in-a-package">What’s in a package</TextLink></div></div><div className="editorial-hero-graphic packaging-example" aria-label="Illustrative Project Package card"><p className="packaging-example-label">YOUR PROJECT · ILLUSTRATIVE PACKAGE</p><ul>{packageExample.map(([title,status])=><li key={title}><span>{title}</span><small data-status={status}>{status}</small></li>)}</ul></div></section>

    <nav className="finance-subnav" aria-label="Development services"><span>01 · DEVELOP</span><a href="/develop/">Overview</a><a href="/develop/story-script/">Story &amp; Script</a><a href="/develop/packaging-talent/" aria-current="page">Packaging &amp; Talent</a><a href="/develop/budgeting-scheduling/">Budgeting &amp; Scheduling</a></nav>

    <section className="produce-section" id="whats-in-a-package" aria-labelledby="elements-title"><Label>WHAT’S IN A PACKAGE · SEVEN ELEMENTS</Label><MotionHeading as="h2" id="elements-title">Seven elements<br/><em>that make a project real.</em></MotionHeading><MotionCopy className="packaging-intro">Financiers and platforms look beyond the script. They need to see how the project will be made and who will make it.</MotionCopy><ol className="packaging-elements">{elements.map(([title,body],i)=><li key={title}><span className="packaging-small">0{i+1}</span><h3>{title}</h3><p>{body}</p></li>)}</ol></section>

    <section className="produce-section" id="attachment-explained" aria-labelledby="attachment-title"><Label>ATTACHMENT, EXPLAINED · HONESTY BUILDS TRUST</Label><MotionHeading as="h2" id="attachment-title">Attached, approached, or wishlist.<br/><em>We never blur the line.</em></MotionHeading><MotionCopy className="packaging-intro">Overstating attachments is the fastest way to lose a financier’s trust. Every name in a Kemsor package carries an honest status.</MotionCopy><dl className="packaging-statuses">{statuses.map(([title,body],i)=><div key={title}><dt><span className="packaging-small">0{i+1}</span>{title}</dt><dd>{body}</dd></div>)}</dl></section>

    <section className="produce-section produce-process" id="talent-attachment" aria-labelledby="process-title"><Label>HOW TALENT ATTACHMENT WORKS · FOUR STEPS</Label><MotionHeading as="h2" id="process-title">How we attach<br/><em>the right people.</em></MotionHeading><ol className="produce-steps finance-steps">{steps.map(([title,body],i)=><li key={title}><span className="produce-step-number">0{i+1}</span><h3>{title}</h3><p>{body}</p></li>)}</ol></section>

    <section className="produce-section" id="three-audiences" aria-labelledby="readers-title"><Label>ONE PROJECT, THREE AUDIENCES · PACKAGES BUILT FOR WHO’S READING</Label><MotionHeading as="h2" id="readers-title">The same project,<br/><em>packaged for who’s reading.</em></MotionHeading><div className="packaging-readers">{readers.map(reader=><article key={reader.label}><p className="packaging-small">{reader.label}</p><h3>{reader.title}</h3><p>{reader.body}</p>{reader.href&&<TextLink href={reader.href}>{reader.link}</TextLink>}</article>)}</div></section>

    <section className="produce-section" id="who-its-for" aria-labelledby="audiences-title"><Label>WHO IT’S FOR · SCRIPT READY, PROJECT NOT YET</Label><MotionHeading as="h2" id="audiences-title">Who it’s for.<br/><em>When the script is ready.</em></MotionHeading><ul className="packaging-audiences">{audiences.map((line,i)=><li key={i}>{line}</li>)}</ul></section>

    {/* No approved project title, format, year or packaging credits supplied. */}
    <section className="produce-section produce-work" id="related-work" aria-labelledby="work-title"><Label>RELATED WORK</Label><div><MotionHeading as="h2" id="work-title">Related work.</MotionHeading><TextLink href="/projects/">Explore productions</TextLink></div></section>

    <section className="produce-section produce-questions" id="questions" aria-labelledby="questions-title"><div><Label>QUESTIONS · ABOUT PACKAGING</Label><MotionHeading as="h2" id="questions-title">Questions,<br/><em>answered honestly.</em></MotionHeading></div><div className="produce-faqs">{questions.map(([q,a])=><details key={q}><summary>{q}<span aria-hidden="true"><SiteIcon name="plus" size={16} /></span></summary><p>{a}</p></details>)}</div></section>

    <section className="produce-section produce-closing finance-closing" id="package-your-project" aria-labelledby="closing-title"><Label>01 · DEVELOP</Label><div><MotionHeading as="h2" id="closing-title">Turn your script<br/><em>into a project.</em></MotionHeading><div><MotionCopy>Bring us a script you believe in. We’ll help build the package that makes others believe too.</MotionCopy><div className="produce-actions"><CTA href={contact}>Package my project</CTA><TextLink href="/join/">Join the Talent Network</TextLink></div></div></div></section>
  </div></EditorialPage>;
}
