import {cmsText,cmsData} from '../siteContent';
import StudioImage from '../StudioImage';
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
const included = cmsData(()=>([
  [cmsText("CastingPage","c08719558f7b6509","Casting calls & auditions"), cmsText("CastingPage","6c23b051b35a3932","Briefs written, calls published and auditions organised around the director’s vision.")],
  [cmsText("CastingPage","32d2b6d136a6cbbe","Shortlisting"), cmsText("CastingPage","2df67259ab9d2b62","Options presented clearly to the director and producers for decision.")],
  [cmsText("CastingPage","ee67f2955bc4a55b","Kemsor Talent Network"), cmsText("CastingPage","c6dfa3b182aa01bd","Access to performers and crew who have joined the Kemsor network.")],
  [cmsText("CastingPage","c4dfe6d283c801f5","Availability & scheduling"), cmsText("CastingPage","71e1b81b6f2ff658","Talent availability aligned with the shooting schedule and call times.")],
  [cmsText("CastingPage","6a537438cc68a796","On-set talent care"), cmsText("CastingPage","7544cbde8bb946aa","Talent supported on shoot days, so performances get the focus they deserve.")],
]));
const steps = cmsData(()=>([
  [cmsText("CastingPage","980d16e1f78588e4","Understand the characters"), cmsText("CastingPage","802437b75edb8a98","We start with the script, the characters and what the director is looking for.")],
  [cmsText("CastingPage","54687a0ac797fc9f","Search & audition"), cmsText("CastingPage","3f74d14540b34599","Casting calls, Talent Network searches and auditions.")],
  [cmsText("CastingPage","b119f7ebc5d60275","Shortlist & confirm"), cmsText("CastingPage","4b95a8c9e85b3129","Options presented, choices made and availability confirmed.")],
  [cmsText("CastingPage","89c74507a8907852","Coordinate to wrap"), cmsText("CastingPage","db20614d4a4cb1f7","Schedules, call times and on-set support through to the last shoot day.")],
]));
const audiences = cmsData(()=>([
  [cmsText("CastingPage","5020b0b906a01fa2","Directors & producers"), cmsText("CastingPage","7d290593e2e5f6fb","Directors and producers casting a film, series or short")],
  [cmsText("CastingPage","9c936afd88d04f52","Platforms & studios"), cmsText("CastingPage","f0a0b2f1353bf9f8","Platforms and studios that need casting coordinated alongside production")],
  [cmsText("CastingPage","550f6a8408963f7d","Actors & performers"), cmsText("CastingPage","ef6541d10c906cae","Actors and performers looking to join the Kemsor Talent Network")],
]));
const related = cmsData(()=>([
  ['01', cmsText("CastingPage","e4a6c48edb51b7f6","Line Production & Production Management"), '/produce/line-production/', cmsText("CastingPage","70e85f5fa1c1ea83","Explore service")],
  ['02', cmsText("CastingPage","ef190839fc77b9ff","Crew & Equipment"), '/produce/crew-equipment/', cmsText("CastingPage","ab3efc7e39b0dd35","Explore service")],
  ['03', cmsText("CastingPage","29e728740e1c0e31","Talent Network: Find Talent"), '/find-talent/', cmsText("CastingPage","b179c93d4ec09414","Find talent")],
  ['04', cmsText("CastingPage","da69d2347a969531","Talent Network: Join KEMSOR"), '/join/', cmsText("CastingPage","1791610155e5c6df","Join KEMSOR")],
]));
const questions = cmsData(()=>([
  [cmsText("CastingPage","081fe0a7f737e4b9","Can actors apply to work with Kemsor?"), cmsText("CastingPage","b3ab218915d7969e","Yes. Performers can join the Kemsor Talent Network.")],
  [cmsText("CastingPage","1fd656ed4ac9f102","Can you coordinate talent we have already cast?"), cmsText("CastingPage","52987e176b978f42","Yes. We can take on scheduling and on-set coordination for talent you have already confirmed.")],
]));
function Label({ children, end }) {
  return <div className="produce-label"><span>{children}</span>{end && <span>{end}</span>}</div>;
}

Label.displayName = 'EditorialLabel';

export default function CastingPage() {
  return <ProduceLayout page="casting"><div className="produce-hub casting-page">
    <nav className="produce-breadcrumb" aria-label="Breadcrumb"><a href="/">{cmsText("CastingPage","64c9ffc6af3ac89d","Kemsor Studios")}</a><span aria-hidden="true">/</span><a href="/produce/">{cmsText("CastingPage","b39f455135fccf97","Produce")}</a><span aria-hidden="true">/</span><span aria-current="page">{cmsText("CastingPage","6f371fefc4bdf866","Casting & Talent")}</span></nav>

    <section className="inner-hero produce-hero produce-hero-light line-production-hero casting-hero" aria-labelledby="casting-title"><figure className="produce-hero-image" aria-hidden="true"><StudioImage mediaSlot="CastingPage-1" src="/assets/stills/family-drama-scene-1600.webp" srcSet={[640, 960, 1600].map(width => `/assets/stills/family-drama-scene-${width}.webp ${width}w`).join(', ')} sizes="100vw" alt={"Supplied illustration of an ensemble cast performing a family confrontation in an Indian home"} width="1600" height="640" fetchPriority="high" decoding="async"/></figure><div className="produce-hero-content"><p className="produce-kicker">{cmsText("CastingPage","5903d7c59f860e99","PRODUCE · PRE-PRODUCTION")}</p><MotionHeading as="h1" id="casting-title">{cmsText("CastingPage","cd78cdb6bfb19a50","Casting &")}{' '}<br />{cmsText("CastingPage","a3a950763edb053e","Talent Coordination.")}<span>{cmsText("CastingPage","0236c27efc160d4a","The right faces for the story.")}</span></MotionHeading><MotionCopy>{cmsText("CastingPage","98a740a832caa2e3","From casting call to call time, Kemsor finds and coordinates the talent your story needs through the Kemsor Talent Network.")}</MotionCopy><div className="produce-actions"><CTA href="/contact/?partner=filmmakers">{cmsText("CastingPage","27e97dec0ef18dad","Talk to us about casting")}</CTA><TextLink href="/join/">{cmsText("CastingPage","ba65a387e853d87a","Join the Talent Network")}</TextLink></div></div><div className="produce-hero-foot"><a href="/produce/"><SiteIcon name="arrow-left" size={16} />{cmsText("CastingPage","98b9c875227e9f44"," Back to Produce")}</a><a href="#casting-included">{cmsText("CastingPage","477fe2aa7c2541d5","What’s included ")}<span aria-hidden="true"><SiteIcon name="arrow-down" size={16} /></span></a></div></section>

    <section className="produce-section produce-intro" aria-labelledby="casting-why-title"><div><Label>{cmsText("CastingPage","88d7032673489bb2","WHY IT MATTERS")}</Label><MotionHeading as="h2" id="casting-why-title">{cmsText("CastingPage","1694a6c23e9317aa","Why it matters.")}</MotionHeading></div><div className="produce-copy"><MotionCopy>{cmsText("CastingPage","e11ec7061a3b9d3c","Casting shapes how an audience meets your story. Coordination decides whether that talent arrives prepared, on time, and looked after.")}</MotionCopy><MotionCopy>{cmsText("CastingPage","a93b39054f4e245a","We find performers who fit the director’s vision, then manage availability, schedules and on-set care so they can do their best work. We treat talent as partners in the production.")}</MotionCopy></div></section>

    <section className="produce-section line-production-included" id="casting-included" aria-labelledby="casting-included-title"><Label>{cmsText("CastingPage","8f3978ad34f92879","WHAT’S INCLUDED")}</Label><MotionHeading as="h2" id="casting-included-title">{cmsText("CastingPage","7d3cb874bda62dd8","What’s included.")}</MotionHeading><div className="line-production-scope"><dl className="line-production-deliverables studio-ledger studio-ledger-pairs">{included.map(([title, description], index) => <div key={title}><dt>{title}</dt><dd>{description}</dd></div>)}</dl><figure className="line-production-planning casting-preparation"><StudioImage mediaSlot="CastingPage-2" src="/assets/stills/pre-production-casting-960.webp" alt={"Illustrative production scene showing collaborators preparing for a shoot"} width="960" height="540" loading="lazy" decoding="async"/><figcaption><span>{cmsText("CastingPage","05d3f9e65b63ea4c","TALENT AS PARTNERS IN THE WORK")}</span><MotionCopy>{cmsText("CastingPage","6dec4567ecb91e1d","The availability, schedules, and on-set care that let them do their best work.")}</MotionCopy></figcaption></figure></div></section>

    <section className="produce-section produce-process" aria-labelledby="casting-process-title"><Label>{cmsText("CastingPage","47264b5e99a400d5","HOW WE WORK")}</Label><MotionHeading as="h2" id="casting-process-title">{cmsText("CastingPage","d2fee24c1e37aeca","How we work.")}</MotionHeading><ol className="produce-steps line-production-steps">{steps.map(([title, description], index) => <li key={title}><h3>{title}</h3><p>{description}</p></li>)}</ol></section>

    <section className="produce-section produce-audiences" aria-labelledby="casting-audiences-title"><div><Label>{cmsText("CastingPage","4cfbd2dfac695c39","WHO IT’S FOR")}</Label><MotionHeading as="h2" id="casting-audiences-title">{cmsText("CastingPage","e2e842f52dda6984","Who it’s for.")}</MotionHeading><div className="casting-network"><span>{cmsText("CastingPage","82bff7c566a84d8c","KEMSOR TALENT NETWORK")}</span><div><TextLink href="/find-talent/">{cmsText("CastingPage","4264c1ef25a49993","Find talent")}</TextLink><TextLink href="/join/">{cmsText("CastingPage","1529d913457b6a2d","Join KEMSOR")}</TextLink></div></div></div><ul>{audiences.map(([title, description], index) => <li key={title}><div><h3>{title}</h3><p>{description}</p></div></li>)}</ul></section>

    {/* No cleared project title, format, year or casting credit was supplied. */}
    <section className="produce-section produce-work" id="casting-work" aria-labelledby="casting-work-title"><Label>{cmsText("CastingPage","a18d5e8568660bf0","RELATED WORK")}</Label><div><MotionHeading as="h2" id="casting-work-title">{cmsText("CastingPage","6c3320916722e2da","Related work.")}</MotionHeading><TextLink href="/productions/">{cmsText("CastingPage","9fc1e7805c220253","Explore productions")}</TextLink></div></section>

    <section className="produce-section produce-related line-production-related" aria-labelledby="casting-related-title"><Label>{cmsText("CastingPage","c1b01cc471d9be58","RELATED SERVICES")}</Label><MotionHeading as="h2" id="casting-related-title">{cmsText("CastingPage","424ac1b7d32bfaab","Related services.")}</MotionHeading><div className="produce-related-grid">{related.map(([number, title, href, action]) => <a href={href} key={title}><h3>{title}</h3><span className="line-production-related-link">{action}<Arrow /></span></a>)}</div></section>

    <section className="produce-section produce-questions" aria-labelledby="casting-questions-title"><div><Label>{cmsText("CastingPage","1c1abd5a613422ab","QUESTIONS")}</Label><MotionHeading as="h2" id="casting-questions-title">{cmsText("CastingPage","cf7f18fae9943e5e","Questions.")}</MotionHeading></div><div className="produce-faqs">{questions.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true"><SiteIcon name="plus" size={16} /></span></summary><p>{answer}</p></details>)}</div></section>
  </div></ProduceLayout>;
}
