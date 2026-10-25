import MotionHeading, { MotionCopy } from '../TextMotion';
import React from 'react';
import FinanceLayout from '../FinanceLayout';
import { CTA, TextLink } from '../PageUI';
import './produce-page.css';
import './finance-page.css';
import './international-co-productions.css';

const contact = '/contact/?partner=international-productions';
const directions = [
  ['Into India', 'International producers and platforms looking for an Indian partner', 'A local production partner, with locations, crew, casting and line production on the ground'],
  ['Out to the world', 'Indian creators and producers seeking international partners', 'A project packaged with a clear budget and plan international partners can assess'],
];
const crossings = [
  ['The story', 'Creative expectations shaped by different cultures and languages', 'Creative goals agreed in writing, in a shared language, before production'],
  ['The money', 'Different currencies, budgeting styles and reporting needs', 'One budget presented clearly for every partner, with reporting they can follow'],
  ['The people', 'Crew and talent from several countries, working together', 'Crews coordinated across borders, with clear roles and one production lead'],
  ['The footage', 'Shoots and post split across countries', 'Clear delivery specifications and handovers between every stage'],
];
const reporting = [
  ['Agreed reporting rhythm', 'Regular updates on progress, spend and schedule'],
  ['One point of contact', 'A named Kemsor lead for each partner'],
  ['Decisions in writing', 'Clear records partners in any country can refer back to'],
];
const steps = [
  ['Find common ground', 'Partners agree the story, the audience, and why they are making it together.'],
  ['Build one plan', 'One budget, one schedule and one set of responsibilities for every country.'],
  ['Split the work', 'Shoot, post, and delivery divided clearly between partners.'],
  ['Deliver as one', 'A single production, delivered to every partner’s market.'],
];
const audiences = [
  'International producers and studios seeking an Indian partner',
  'Indian creators and producers seeking international partners',
  'Platforms commissioning cross-border projects',
  'Financiers backing projects across markets',
];
const questions = [
  ['Do you handle official treaty co-production applications?', 'We prepare the production-side documents. Eligibility and applications are handled with partners’ legal advisors and the relevant authorities.'],
  ['Can international crews film in India with your support?', 'Yes. Our India Production Services cover line production, locations and logistics, crew and equipment, and casting coordination.'],
  ['Which countries do you work with?', 'We welcome conversations with partners from any market.'],
  ['Can you help an Indian project find international partners?', 'Yes. We package the project with a clear budget and plan, and bring international partners into the conversation.'],
];
function Label({children}) { return <div className="produce-label"><span>{children}</span></div>; }
Label.displayName = 'EditorialLabel';

// Public copy from Kemsor_Finance_03_International_Co-Productions.docx.pdf.
export default function InternationalCoProductionsPage() {
  return <FinanceLayout page="international-co-productions"><div className="produce-hub international-page">
    <nav className="produce-breadcrumb" aria-label="Breadcrumb"><a href="/">Kemsor Studios</a><span aria-hidden="true">/</span><a href="/finance/">Finance</a><span aria-hidden="true">/</span><span aria-current="page">International Co-Productions</span></nav>
    <section className="produce-hero" aria-labelledby="international-title">
      <figure className="produce-hero-image" aria-hidden="true"><img src="/assets/stills/daylight-valley-production-1600.webp" srcSet={[640,960,1600].map(w=>`/assets/stills/daylight-valley-production-${w}.webp ${w}w`).join(', ')} sizes="100vw" alt="" fetchPriority="high" decoding="async"/></figure>
      <div className="produce-hero-content"><p className="produce-kicker">02 · FINANCE · INTERNATIONAL CO-PRODUCTIONS</p><MotionHeading as="h1" id="international-title">International Co-Productions.<span>One story. Many countries. One plan.</span></MotionHeading><MotionCopy>Cross-border productions bring new money, new talent and new audiences - along with different currencies, practices, languages and time zones. Kemsor builds one plan every partner can read, and the production on the ground in India to deliver it.</MotionCopy><div className="produce-actions"><CTA href={contact}>Start an international conversation</CTA><TextLink href="/services/#india-production-services">Filming in India? See India Production Services</TextLink></div></div>
    </section>

    <section className="produce-section" id="two-directions" aria-labelledby="directions-title"><Label>TWO DIRECTIONS · ONE PARTNER</Label><MotionHeading as="h2" id="directions-title">Coming to India.<br/><em>Or taking India to the world.</em></MotionHeading><div className="international-directions">{directions.map(([title,who,brings],i)=><article key={title}><div className="international-direction-label"><span>0{i+1}</span><span aria-hidden="true">{i===0?'→':'←'}</span></div><h3>{title}</h3><p className="international-small-label">FOR</p><p>{who}</p><p className="international-small-label">WHAT KEMSOR BRINGS</p><p>{brings}</p></article>)}</div></section>

    <section className="produce-section" id="what-crosses-the-border" aria-labelledby="crossings-title"><Label>WHAT CROSSES THE BORDER</Label><MotionHeading as="h2" id="crossings-title">Four things move between countries.<br/><em>Each needs a plan.</em></MotionHeading><div className="international-crossings">{crossings.map(([title,challenge,handling],i)=><article key={title}><div><span className="international-small-label">0{i+1} / 04</span><h3>{title}</h3></div><div><p className="international-small-label">THE CHALLENGE</p><p>{challenge}</p></div><div><p className="international-small-label">HOW KEMSOR HANDLES IT</p><p>{handling}</p></div></article>)}</div></section>

    <section className="produce-section" id="communication" aria-labelledby="communication-title"><Label>COMMUNICATION · ACROSS TIME ZONES</Label><MotionHeading as="h2" id="communication-title">When partners are hours apart,<br/><em>communication can’t be an afterthought.</em></MotionHeading><MotionCopy className="international-intro">We agree a reporting rhythm with every partner at the start - what they hear, how often and from whom - so risks and decisions reach them in time to act, whatever their time zone.</MotionCopy><div className="international-reporting">{reporting.map(([title,body])=><article key={title}><h3>{title}</h3><p>{body}</p></article>)}</div></section>

    <section className="produce-section international-frameworks" id="treaties-incentives" aria-labelledby="treaties-title"><Label>TREATIES &amp; INCENTIVES</Label><MotionHeading as="h2" id="treaties-title">Where official frameworks apply,<br/><em>we prepare the production side.</em></MotionHeading><MotionCopy className="international-intro">Some international co-productions may qualify for official co-production treaties or production incentives. Eligibility and applications are confirmed by partners with their legal advisors and the relevant authorities. Kemsor prepares the production-side information those processes need: budgets, schedules, crew and location plans.</MotionCopy></section>

    <section className="produce-section produce-process" id="how-it-works" aria-labelledby="process-title"><Label>HOW IT WORKS</Label><MotionHeading as="h2" id="process-title">How it works.</MotionHeading><ol className="produce-steps finance-steps">{steps.map(([title,body],i)=><li key={title}><span className="produce-step-number">0{i+1}</span><h3>{title}</h3><p>{body}</p></li>)}</ol></section>

    <section className="produce-section" id="who-its-for" aria-labelledby="audiences-title"><Label>WHO IT’S FOR</Label><MotionHeading as="h2" id="audiences-title">Who it’s for.</MotionHeading><ul className="international-audiences">{audiences.map(line=><li key={line}>{line}</li>)}</ul></section>

    {/* The source provides a card format, but no approved project or country credits. */}
    <section className="produce-section produce-work" id="related-work" aria-labelledby="work-title"><Label>RELATED WORK</Label><div><MotionHeading as="h2" id="work-title">Related work.</MotionHeading><TextLink href="/projects/">Explore productions</TextLink></div></section>

    <section className="produce-section produce-questions" id="questions" aria-labelledby="questions-title"><div><Label>QUESTIONS</Label><MotionHeading as="h2" id="questions-title">Questions.</MotionHeading></div><div className="produce-faqs">{questions.map(([q,a])=><details key={q}><summary>{q}<span aria-hidden="true">+</span></summary><p>{a}</p></details>)}</div></section>

    <section className="produce-section produce-closing finance-closing" id="international-conversation" aria-labelledby="conversation-title"><Label>INTERNATIONAL CO-PRODUCTIONS</Label><div><MotionHeading as="h2" id="conversation-title">Different countries.<br/><em>Same story.</em></MotionHeading><div><MotionCopy>Wherever your partners are, start with a conversation. We’ll show you how the project could come together across borders.</MotionCopy><CTA href={contact}>Start an international conversation</CTA></div></div><MotionCopy className="finance-disclaimer">Kemsor coordinates co-production and production planning. It does not provide legal, tax or investment advice, or confirm eligibility for treaties or incentives.</MotionCopy></section>
  </div></FinanceLayout>;
}
