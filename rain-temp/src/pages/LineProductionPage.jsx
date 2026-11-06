import {cmsText,cmsData} from '../siteContent';
import StudioImage from '../StudioImage';
import SiteIcon from '../SiteIcon';
import MotionHeading, { MotionCopy } from '../TextMotion';
import ProduceLayout from '../ProduceLayout';
import React from 'react';
import { Arrow, CTA, TextLink } from '../PageUI';
import './produce-page.css';
import './line-production-page.css';

// Content: Kemsor_Produce_01_Line_Production_and_Production_Management.docx.pdf.
const included = cmsData(()=>([
  [cmsText("LineProductionPage","6fe6abcfcd6986dd","Production budgeting"), cmsText("LineProductionPage","76e02e998b34a080","Budgets built from the script and the creative plan, tracked against actuals through the shoot.")],
  [cmsText("LineProductionPage","fd49e386cbe5f73e","Scheduling"), cmsText("LineProductionPage","dbb451939d31e76c","Shooting schedules and daily call sheets built around story, cast, locations and light.")],
  [cmsText("LineProductionPage","6da6d675b87bedd0","Production management"), cmsText("LineProductionPage","3b3265c61dadc8c3","Day-to-day running of the production office and the set.")],
  [cmsText("LineProductionPage","33704bedbf561cb1","Department coordination"), cmsText("LineProductionPage","41c4f73cdc1b7bea","Every department working from the same plan and the same information.")],
  [cmsText("LineProductionPage","b4be39dda82f84d6","Risk & issue management"), cmsText("LineProductionPage","c84036007d9ede5f","Risks raised early, with options, so decisions are made in time to act on them.")],
  [cmsText("LineProductionPage","f5ee885d6b9052bc","Production reporting"), cmsText("LineProductionPage","19a46b3233f83b60","Clear, regular reports on progress, spend and schedule for producers and financiers.")],
]));
const steps = cmsData(()=>([
  [cmsText("LineProductionPage","13ad3f8964b696e5","Read the story"), cmsText("LineProductionPage","f5eaf9807f570278","We start with the script and the creative priorities before any numbers are set.")],
  [cmsText("LineProductionPage","efb50d28cade9ceb","Build the plan"), cmsText("LineProductionPage","b91dcc69b323db4f","Budget and schedule shaped by what the story needs and what the production can carry.")],
  [cmsText("LineProductionPage","ddbec4036cf56df4","Run the shoot"), cmsText("LineProductionPage","7f07f1ee3c60a273","Daily management of people, time and money on set and in the production office.")],
  [cmsText("LineProductionPage","bb756dee84b0ad53","Hand over to post"), cmsText("LineProductionPage","9582e8f47318ac33","Footage, reports and production records handed cleanly to post-production.")],
]));
const audiences = cmsData(()=>([
  [cmsText("LineProductionPage","4372ead34bdcc895","Producers"), cmsText("LineProductionPage","6d32beafa0b43264","Producers who need a line producer they can trust on the ground")],
  [cmsText("LineProductionPage","5aab4a2c9f4275a0","Studios & OTT platforms"), cmsText("LineProductionPage","c964ae57dd732df1","Studios and OTT platforms that need dependable production management")],
  [cmsText("LineProductionPage","4fd20e0373bfca0e","Financiers"), cmsText("LineProductionPage","a9007a4c14e97b0f","Financiers who want clear visibility of spend and progress")],
  [cmsText("LineProductionPage","9d4bd799385fa8cf","International productions"), cmsText("LineProductionPage","0eb0ea8ebb74e590","International productions filming in India")],
]));
const related = cmsData(()=>([
  ['01', cmsText("LineProductionPage","e0bea83ae68e79a6","Shooting & On-Location Production"), '/produce/shooting-on-location/'],
  ['02', cmsText("LineProductionPage","55f42f3b395a745f","Crew & Equipment"), '/produce/crew-equipment/'],
  ['03', cmsText("LineProductionPage","cd9221e7c026a4ae","Locations & Logistics"), '/produce/locations-logistics/'],
  ['04', cmsText("LineProductionPage","b2d53ec273cb829d","India Production Services"), '/india-production-services/'],
]));
const questions = cmsData(()=>([
  [cmsText("LineProductionPage","fcfde817f8176874","Can you come on board for just the shoot?"), cmsText("LineProductionPage","20538e5d63b1378e","Yes. We provide focused line production on a single shoot, or partnership across the full production lifecycle.")],
  [cmsText("LineProductionPage","ab8207cd4c933a49","Can you work alongside our existing producer?"), cmsText("LineProductionPage","f5b68780741efc8a","Yes. We work with the producers already on the project, taking on the day-to-day running of the production.")],
  [cmsText("LineProductionPage","c9d0b2c80c5ee81a","How do you handle budget pressure during a shoot?"), cmsText("LineProductionPage","4e3f67c2cecc2212","We flag risks and changes early and offer options, giving you time to decide before the money is spent.")],
]));
function Label({ children, end }) {
  return <div className="produce-label"><span>{children}</span>{end && <span>{end}</span>}</div>;
}

Label.displayName = 'EditorialLabel';

export default function LineProductionPage() {
  return <ProduceLayout page="line-production"><div className="produce-hub line-production-page">
    <nav className="produce-breadcrumb" aria-label="Breadcrumb"><a href="/">{cmsText("LineProductionPage","dba2384b4dd33bbb","Kemsor Studios")}</a><span aria-hidden="true">/</span><a href="/produce/">{cmsText("LineProductionPage","deaff10cb8d8e93f","Produce")}</a><span aria-hidden="true">/</span><span aria-current="page">{cmsText("LineProductionPage","9d59432f2b8d696a","Line Production")}</span></nav>

    <section className="inner-hero produce-hero produce-hero-light line-production-hero" aria-labelledby="line-production-title">
      <figure className="produce-hero-image" aria-hidden="true"><StudioImage mediaSlot="LineProductionPage-1" src="/assets/stills/daylight-snow-production-1600.webp" srcSet={[640, 960, 1600].map(width => `/assets/stills/daylight-snow-production-${width}.webp ${width}w`).join(', ')} sizes="100vw" alt="" fetchPriority="high" decoding="async" /></figure>
      <div className="produce-hero-content"><p className="produce-kicker">{cmsText("LineProductionPage","c2aee38c82a127b1","PRODUCE · LINE PRODUCTION")}</p><MotionHeading as="h1" id="line-production-title">{cmsText("LineProductionPage","109c6c5d3180388a","Line Production &")}{' '}<br />{cmsText("LineProductionPage","db3e78fee08e5f72","Production Management.")}<span>{cmsText("LineProductionPage","407c1488b1e646c9","The shoot, run day to day.")}</span></MotionHeading><MotionCopy>{cmsText("LineProductionPage","8455438c2e759472","Kemsor manages budgets, schedules, people and day-to-day production problems so the director can focus on directing.")}</MotionCopy><div className="produce-actions"><CTA href="/contact/?partner=filmmakers">{cmsText("LineProductionPage","68890b776275759b","Talk to a line producer")}</CTA><TextLink href="#line-production-work">{cmsText("LineProductionPage","1d41537f26e00d0b","See related work")}</TextLink></div></div>
      <div className="produce-hero-foot"><a href="/produce/"><SiteIcon name="arrow-left" size={16} />{cmsText("LineProductionPage","fdff80fa003a94c7"," Back to Produce")}</a><a href="#line-production-included">{cmsText("LineProductionPage","45e6f5459a4aeb9e","What’s included ")}<span aria-hidden="true"><SiteIcon name="arrow-down" size={16} /></span></a></div>
    </section>

    <section className="produce-section produce-intro" aria-labelledby="line-production-why"><div><Label>{cmsText("LineProductionPage","dcf3d49a1e68f4f5","WHY IT MATTERS")}</Label><MotionHeading as="h2" id="line-production-why">{cmsText("LineProductionPage","f1281b199fd98d17","Why it matters.")}</MotionHeading></div><div className="produce-copy"><MotionCopy>{cmsText("LineProductionPage","c0e1f5cbd052a859","A production lives or dies on its daily decisions. A scene runs long, a location falls through, the light changes. Line production is the discipline of keeping the shoot moving without losing what the story needs.")}</MotionCopy><MotionCopy>{cmsText("LineProductionPage","3fac4b434cda6645","We build budgets and schedules around the practical needs of production, then track them daily so producers and financiers know where things stand.")}</MotionCopy></div></section>

    <section className="produce-section line-production-included" id="line-production-included" aria-labelledby="line-production-included-title"><Label>{cmsText("LineProductionPage","7ef30b656cbff168","WHAT’S INCLUDED")}</Label><MotionHeading as="h2" id="line-production-included-title">{cmsText("LineProductionPage","5a82f02310d4b171","What’s included.")}</MotionHeading><div className="line-production-scope"><dl className="line-production-deliverables studio-ledger studio-ledger-pairs">{included.map(([title, description], index) => <div key={title}><dt>{title}</dt><dd>{description}</dd></div>)}</dl><figure className="line-production-planning"><StudioImage mediaSlot="LineProductionPage-2" src="/assets/services/planning.webp" alt={"Production collaborators reviewing plans on a filming location"} width="1672" height="941" loading="lazy" decoding="async"/><figcaption><span>{cmsText("LineProductionPage","a81c6ae396123ca0","PRODUCTION MANAGEMENT")}</span><MotionCopy>{cmsText("LineProductionPage","0653e053b35a5845","Every department working from the same plan and the same information.")}</MotionCopy></figcaption></figure></div></section>

    <section className="produce-section produce-process" aria-labelledby="line-production-process-title"><Label>{cmsText("LineProductionPage","e8af8de0ae803f44","HOW WE WORK")}</Label><MotionHeading as="h2" id="line-production-process-title">{cmsText("LineProductionPage","2be776c3c05a435e","How we work.")}</MotionHeading><ol className="produce-steps line-production-steps">{steps.map(([title, description], index) => <li key={title}><h3>{title}</h3><p>{description}</p></li>)}</ol></section>

    <section className="produce-section produce-audiences" aria-labelledby="line-production-audiences-title"><div><Label>{cmsText("LineProductionPage","d54038a34fd342d9","WHO IT’S FOR")}</Label><MotionHeading as="h2" id="line-production-audiences-title">{cmsText("LineProductionPage","66cf895570ffdc90","Who it’s for.")}</MotionHeading><div className="produce-audience-mark" aria-hidden="true"><span>{cmsText("LineProductionPage","b63de16e15e32a3b","ON SET")}</span><i>+</i><span>{cmsText("LineProductionPage","1e322b21f3e2ebb6","IN THE OFFICE")}</span></div></div><ul>{audiences.map(([title, description], index) => <li key={title}><div><h3>{title}</h3><p>{description}</p></div></li>)}</ul></section>

    {/* No cleared project title, format, year or line-production credit supplied. */}
    <section className="produce-section produce-work" id="line-production-work" aria-labelledby="line-production-work-title"><Label>{cmsText("LineProductionPage","f1924c57a35eff60","RELATED WORK")}</Label><div><MotionHeading as="h2" id="line-production-work-title">{cmsText("LineProductionPage","d56ece982a2c7b7f","Related work.")}</MotionHeading><TextLink href="/productions/">{cmsText("LineProductionPage","084a13445376b39a","Explore productions")}</TextLink></div></section>

    <section className="produce-section produce-related line-production-related" aria-labelledby="line-production-related-title"><Label>{cmsText("LineProductionPage","89752a0dad1dada6","RELATED SERVICES")}</Label><MotionHeading as="h2" id="line-production-related-title">{cmsText("LineProductionPage","f714438f19867a89","Related services.")}</MotionHeading><div className="produce-related-grid">{related.map(([number, title, href]) => <a href={href} key={title}><h3>{title}</h3><span className="line-production-related-link">{cmsText("LineProductionPage","ee24ae979468c4f5","Explore service ")}<Arrow /></span></a>)}</div></section>

    <section className="produce-section produce-questions" aria-labelledby="line-production-questions-title"><div><Label>{cmsText("LineProductionPage","7253ebb20e0c0882","QUESTIONS")}</Label><MotionHeading as="h2" id="line-production-questions-title">{cmsText("LineProductionPage","c05e5d3825bb9393","Questions.")}</MotionHeading></div><div className="produce-faqs">{questions.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true"><SiteIcon name="plus" size={16} /></span></summary><p>{answer}</p></details>)}</div></section>
  </div></ProduceLayout>;
}
