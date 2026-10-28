import SiteIcon from '../SiteIcon';
import React from 'react';
import MotionHeading, { MotionCopy } from '../TextMotion';
import { CTA, TextLink } from '../PageUI';
import './india-production-services.css';

const enquiry = '/contact/?partner=international-productions';
const benefits = [
  ['Range of locations', 'Many looks from one production base, which can simplify travel and planning'],
  ['Experienced crews', 'Departments staffed by people who work on features, series and documentaries'],
  ['Depth of talent', 'Lead and supporting cast, specialist performers and background artists'],
  ['Craft and build', 'Set construction, costume, props and art teams with real depth'],
  ['Value', 'Strong production value for the budget, when the shoot is planned well'],
];
const services = [
  ['Line production', 'Day-to-day management of the shoot in India, covering budget, schedule, people and problem-solving'],
  ['Locations', 'Scouting, recces, location agreements and on-the-day location management'],
  ['Permissions', 'Coordinating the permissions a shoot needs with location owners and the relevant authorities'],
  ['Crew', 'Experienced local crew across departments, working alongside your heads of department'],
  ['Equipment', 'Camera, lighting, grip and sound packages sourced to your specification'],
  ['Casting & talent', 'Local cast, specialist performers and background artists, coordinated through the Kemsor Talent Network'],
  ['Logistics', 'Travel within India, accommodation, transport, catering and unit facilities'],
  ['Production design', 'Set builds, art department, props and location dressing'],
  ['Budgets & cost reports', 'Budgets and regular cost reports in the currency and format you agree with us'],
  ['Post & delivery', 'Post-production supervision and deliverables, if you want to finish here too'],
];
const steps = [
  ['Brief', 'Tell us about the story, the locations you have in mind, your dates, and your budget range. We come back with honest feedback on what is possible.'],
  ['Recce & plan', 'We scout options, share photos and practical notes, and recce with your director and heads of department when you’re ready.'],
  ['Budget & schedule', 'A detailed budget and shooting schedule built for India, with every assumption written down.'],
  ['Permissions & prep', 'Permissions, crew, equipment, cast, travel and accommodation confirmed and tracked against the schedule.'],
  ['The shoot', 'We run the production on the ground, with daily reports so you always know where things stand.'],
  ['Wrap & handover', 'Locations returned properly, accounts closed, and footage, records and paperwork handed over in order.'],
];
const international = [
  ['One point of contact', 'A named Kemsor lead who knows your production inside out.'],
  ['Your reporting format', 'Budgets and cost reports in the currency and structure your financiers expect.'],
  ['Time zones planned for', 'A reporting schedule agreed at the start so decisions reach you in time, wherever you are.'],
  ['Clear communication on set', 'Our team works in English and bridges local languages with crew, cast and communities.'],
];
const formats = [
  ['Feature films', 'Full shoots or specific blocks, from a single location to multi-city schedules'],
  ['Series & OTT', 'Episodic shoots with consistent crews and schedules across blocks'],
  ['Documentaries', 'Small, mobile units, access planning and sensitive work with communities'],
  ['Short films', 'Compact, efficient shoots that make every day count'],
  ['International co-productions', 'A local production partner for the India part of the project'],
];
const questions = [
  ['How far ahead should we start planning?', 'As early as you can. Permissions, locations, and key crew all take time to secure, and earlier planning gives you more choice. If your timeline is short, tell us anyway, and we’ll be honest about what is realistic.'],
  ['Can you handle just one part of our shoot?', 'Yes. Many productions use us for locations, crew, or line production only. We fit around your team.'],
  ['Will we work with one person or many?', 'You will have one named Kemsor lead, supported by department heads as the shoot needs them.'],
  ['How will costs be reported?', 'In the currency and format we agree on at the start, with regular cost reports during preparation and the shoot.'],
  ['Can Kemsor co-produce, not just service the shoot?', <>Yes, depending on the project. See <PartnershipLinks/>.</>],
  ['Do you help with incentives and visas?', 'We prepare the production documentation those processes need. Eligibility and individual visa routes are confirmed by your advisors and the relevant authorities.'],
];

function PartnershipLinks() {
  return <><a href="/finance/co-production/">Co-Production</a> and <a href="/finance/international-co-productions/">International Co-Productions</a></>;
}
function Label({ children, number }) {
  return <div className="india-label"><span>{children}</span><span aria-hidden="true">{number}</span></div>;
}
function RowList({ rows, headings }) {
  return <><div className="india-row-head" aria-hidden="true"><span>{headings[0]}</span><span>{headings[1]}</span></div><dl className="india-row-list">{rows.map(([title, copy]) => <div key={title}><dt>{title}</dt><dd>{copy}</dd></div>)}</dl></>;
}

export default function IndiaProductionServicesPage() {
  return <div className="india-services-page">
    <section className="india-hero india-width" aria-labelledby="india-title">
      <div className="india-hero-top"><a href="/">KEMSOR STUDIOS</a><span>INDIA PRODUCTION SERVICES</span></div>
      <div className="india-hero-grid">
        <div><p className="india-kicker">INDIA PRODUCTION SERVICES</p><MotionHeading as="h1" id="india-title">Filming in India? <em>Work with people who know the ground.</em></MotionHeading></div>
        <div className="india-hero-copy"><MotionCopy>India offers deserts and snowlines, coastlines and megacities, palaces and village lanes. Kemsor plans, staffs and runs your shoot here so you can focus on the work.</MotionCopy><div className="india-actions"><CTA href={enquiry}>Plan a shoot in India</CTA><TextLink href="#what-we-handle">See what we handle</TextLink></div></div>
      </div>
      <figure className="india-hero-visual"><img src="/assets/stills/daylight-valley-production-1600.webp" srcSet="/assets/stills/daylight-valley-production-640.webp 640w, /assets/stills/daylight-valley-production-960.webp 960w, /assets/stills/daylight-valley-production-1600.webp 1600w" sizes="(max-width: 1440px) 90vw, 1280px" width="1600" height="679" alt="Supplied illustrative artwork of a film crew working beside a river in a mountain valley" fetchPriority="high" decoding="async"/><figcaption>VISUAL STUDY / SUPPLIED ARTWORK</figcaption></figure>
    </section>

    <section className="india-section india-width" aria-labelledby="india-backdrops-title">
      <Label number="01">WHY INDIA</Label>
      <div className="india-intro-grid"><MotionHeading as="h2" id="india-backdrops-title">One country. <em>Almost every backdrop.</em></MotionHeading><div><MotionCopy>India offers high mountains and open desert, tropical coast and dense forest, historic architecture and busy cities. We help you find locations that suit the story and plan the travel between them.</MotionCopy><MotionCopy>India also has one of the world’s most active film industries, working across many languages and regions. That means experienced crews, skilled craftspeople and a deep pool of acting talent, in more places than most visiting productions expect.</MotionCopy></div></div>
      <RowList rows={benefits} headings={['What India offers', 'What it means for your production']}/>
    </section>

    <section className="india-section india-width" aria-labelledby="india-preparation-title">
      <Label number="02">THE HONEST PART</Label>
      <div className="india-intro-grid"><MotionHeading as="h2" id="india-preparation-title">India <em>rewards preparation.</em></MotionHeading><div><MotionCopy>Filming here is very rewarding, but it is not something to improvise. Distances are large, permissions involve more than one authority, languages change from region to region, and the way a set runs can differ from what an international team is used to.</MotionCopy><MotionCopy>A good local partner closes that gap. We understand what international productions expect: clear budgets, reliable schedules, safe sets, and regular reporting, and we understand how things work on the ground here. Our job is to make those two worlds fit together.</MotionCopy></div></div>
    </section>

    <section className="india-section india-width" id="what-we-handle" aria-labelledby="india-services-title">
      <Label number="03">WHAT WE HANDLE</Label>
      <div className="india-intro-grid"><MotionHeading as="h2" id="india-services-title">Everything between your plan and <em>your first shot.</em></MotionHeading><MotionCopy>Use us for the whole shoot or only the parts you need. Scope is shaped to the project, never imposed as a fixed package.</MotionCopy></div>
      <RowList rows={services} headings={['Service', 'What it covers']}/>
      <p className="india-partnership-note">Need a partner on the project itself? See <PartnershipLinks/>.</p>
    </section>

    <section className="india-section india-width" aria-labelledby="india-process-title">
      <Label number="04">HOW IT WORKS</Label>
      <MotionHeading as="h2" id="india-process-title">From first email <em>to final wrap.</em></MotionHeading>
      <ol className="india-process">{steps.map(([title, copy], index) => <li key={title}><span className="india-step-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><h3>{title}</h3><p>{copy}</p></li>)}</ol>
    </section>

    <section className="india-section india-width" aria-labelledby="india-international-title">
      <Label number="05">WORKING ACROSS BORDERS</Label>
      <div className="india-intro-grid"><MotionHeading as="h2" id="india-international-title">Far from home, but <em>never out of the loop.</em></MotionHeading><ul className="india-international-list">{international.map(([title, copy]) => <li key={title}><h3>{title}</h3><p>{copy}</p></li>)}<li><p>International standards: safe sets, fair working hours and clear documentation throughout.</p></li></ul></div>
    </section>

    <section className="india-section india-width" aria-labelledby="india-formats-title">
      <Label number="06">FORMATS</Label>
      <MotionHeading as="h2" id="india-formats-title">Built for the way you’re making it.</MotionHeading>
      <RowList rows={formats} headings={['Format', 'How we support it']}/>
    </section>

    <section className="india-section india-width india-respect" aria-labelledby="india-respect-title">
      <Label number="07">HOW WE FILM</Label>
      <div className="india-intro-grid"><MotionHeading as="h2" id="india-respect-title">We film <em>as guests.</em></MotionHeading><MotionCopy>Every location belongs to a family, a community or a city. We speak to people before the cameras arrive, keep our promises and leave places as we found them.</MotionCopy></div>
    </section>

    <section className="india-section india-width" aria-labelledby="india-paperwork-title">
      <Label number="08">INCENTIVES &amp; PAPERWORK</Label>
      <div className="india-intro-grid"><MotionHeading as="h2" id="india-paperwork-title">The fine print, handled carefully.</MotionHeading><div><MotionCopy>India offers national and state-level support for some productions filming here. Whether a project qualifies depends on its details and the rules in force at the time. We prepare the production information that applications need, and work alongside your legal and financial advisors, who confirm eligibility with the relevant authorities.</MotionCopy><MotionCopy>The same applies to visas and other formal requirements for visiting cast and crew: we provide the production documentation, and your advisors confirm the right route for each person.</MotionCopy></div></div>
    </section>

    <section className="india-section india-width" aria-labelledby="india-questions-title">
      <Label number="09">QUESTIONS</Label>
      <div className="india-intro-grid"><MotionHeading as="h2" id="india-questions-title">Before you book the flights.</MotionHeading><div className="india-faq">{questions.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true"><SiteIcon name="plus" size={16} /></span></summary><p>{answer}</p></details>)}</div></div>
    </section>

    <section className="india-section india-width india-closing" aria-labelledby="india-closing-title">
      <div className="india-intro-grid"><MotionHeading as="h2" id="india-closing-title">Tell us where the story <em>needs to go.</em></MotionHeading><div><MotionCopy>Share the script, the locations you’re imagining and your dates. We’ll come back with a clear, honest view of how to make it happen in India.</MotionCopy><div className="india-actions"><CTA href={enquiry}>Plan a shoot in India</CTA><TextLink href="/contact/">Talk to the studio</TextLink></div></div></div>
    </section>
  </div>;
}
