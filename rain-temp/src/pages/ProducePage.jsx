import FaqPanel from '../FaqPanel';
import {cmsText,cmsData} from '../siteContent';
import StudioImage from '../StudioImage';
import SiteIcon from '../SiteIcon';
import MotionHeading, { MotionCopy } from '../TextMotion';
import ProduceLayout from '../ProduceLayout';
import React from 'react';
import { Arrow, CTA, TextLink } from '../PageUI';
import './produce-page.css';

// Copy follows Kemsor_Produce_00_Produce_Hub.docx.pdf.
// Each service links to its dedicated Produce page.
const services = cmsData(()=>([
  { title: cmsText("ProducePage","c51d1bda6834b3a3","Line Production & Production Management"), description: cmsText("ProducePage","46118c2808431878","Day-to-day shoot management, with the budget, schedule and story in view."), image: '/assets/stills/work-action-set-960.webp', href: '/produce/line-production/' },
  { title: cmsText("ProducePage","63142f76a05dc3d8","Casting & Talent Coordination"), description: cmsText("ProducePage","ad80e6a63da60658","The right faces for the story, and everything it takes to get them on set."), image: '/assets/stills/daylight-interior-production-960.webp', href: '/produce/casting/' },
  { title: cmsText("ProducePage","600b3bd552e790e3","Locations & Logistics"), description: cmsText("ProducePage","5ba1416add8de6b4","The right place, ready when the camera is."), image: '/assets/stills/daylight-valley-production-960.webp', href: '/produce/locations-logistics/' },
  { title: cmsText("ProducePage","4bdf60248c3b07f0","Crew & Equipment"), description: cmsText("ProducePage","045b06d892dcf1e9","The right team and the right kit, sized to the shoot."), image: '/assets/stills/daylight-park-production-960.webp', href: '/produce/crew-equipment/' },
  { title: cmsText("ProducePage","f54066b458bfcdbb","Set & Production Design"), description: cmsText("ProducePage","a4b502dd8edf3d26","The world of the story, built to be filmed."), image: '/assets/stills/courtyard-dance-production-960.webp', href: '/produce/set-production-design/' },
  { title: cmsText("ProducePage","e3567fce3303962c","Shooting & On-Location Production"), description: cmsText("ProducePage","d90520d2a3725f19","Cameras rolling. Everything else handled."), image: '/assets/stills/fort-action-production-960.webp', href: '/produce/shooting-on-location/' },
]));
const steps = cmsData(()=>([
  [cmsText("ProducePage","b9398f849d4f9cbc","Understand the story"), cmsText("ProducePage","5bcfee3b99969405","Understand what the story needs to be and who it is for before setting the budget.")],
  [cmsText("ProducePage","1b2e12e8afb2aa52","Build the plan"), cmsText("ProducePage","39acbec2e9879a83","Budget, schedule, team and locations shaped by the creative goal.")],
  [cmsText("ProducePage","26b472aa9b251940","Deliver the work"), cmsText("ProducePage","bf623de91bd743bf","Clear communication keeps every collaborator aligned, stage to stage.")],
]));
const audiences = cmsData(()=>([
  [cmsText("ProducePage","a9195d158b4d5fa7","Producers"), cmsText("ProducePage","687f4efb41cc688d","Producers who need a production partner they can trust on the ground")],
  [cmsText("ProducePage","fd59eb942176d171","Studios & OTT platforms"), cmsText("ProducePage","474c6714a23a636f","Studios and OTT platforms that need dependable production management")],
  [cmsText("ProducePage","4adf82bb48171fe2","Directors"), cmsText("ProducePage","7e980ae6e061f09a","Directors who want the practical side handled so they can focus on the frame")],
  [cmsText("ProducePage","a885b60406c06a49","International productions"), cmsText("ProducePage","8fcddfbee9be56d9","International productions filming in India")],
]));
const related = cmsData(()=>([
  ['01', cmsText("ProducePage","8da7220f53d82b00","Develop"), cmsText("ProducePage","acae1d6c4d10301c","Development & Packaging"), '/develop/'],
  ['02', cmsText("ProducePage","ddd634cf96227a1e","Finance"), cmsText("ProducePage","07b63afc5d105a0f","Financing & Investment Coordination"), '/finance/'],
  ['04', cmsText("ProducePage","ea3af587752df832","Post"), cmsText("ProducePage","b3389d80b3340742","Production Supervision"), '/services/#capability-post'],
  [cmsText("ProducePage","8d6c260c33a26204","INDIA"), cmsText("ProducePage","e024d0c3c348eaae","India"), cmsText("ProducePage","4e2fa0d8505eb60f","Production Services"), '/india-production-services/'],
]));
const questions = cmsData(()=>([
  [cmsText("ProducePage","cfa3a3f5ab5c217c","Can we use just one of these services?"), cmsText("ProducePage","759863e24015826e","Yes. Scope is shaped to the project, never imposed as a fixed package. Bring us in for a single service, a single shoot, or the full production.")],
  [cmsText("ProducePage","4d4bbe90c8f203fb","Which formats do you produce?"), cmsText("ProducePage","caf7232ff4d4b51d","Feature films, series and OTT content, documentaries and short films, including regional cinema and international co-productions.")],
  [cmsText("ProducePage","ef6b6c2df33bd05a","Can you join a project already in progress?"), cmsText("ProducePage","165fb8a0200b6c0d","Yes. Bring us in at the start, or at the stage where you need us most.")],
]));
function Label({ children, end }) {
  return <div className="produce-label"><span>{children}</span>{end && <span>{end}</span>}</div>;
}

Label.displayName = 'EditorialLabel';

export default function ProducePage() {
  return <ProduceLayout page="produce"><div className="produce-hub">
    <nav className="produce-breadcrumb" aria-label="Breadcrumb"><a href="/">{cmsText("ProducePage","0509b16d0934fb41","Kemsor Studios")}</a><span aria-hidden="true">/</span><a href="/services/">{cmsText("ProducePage","552058acb0f694eb","Capabilities")}</a><span aria-hidden="true">/</span><span aria-current="page">{cmsText("ProducePage","47910c2f1eb5eb81","Produce")}</span></nav>

    <section className="inner-hero produce-hero produce-hero-light" aria-labelledby="produce-title">
      <figure className="produce-hero-image" aria-hidden="true">
        <StudioImage mediaSlot="ProducePage-1" src="/assets/stills/work-period-set-1600.webp" srcSet={[640, 960, 1600].map(width => `/assets/stills/work-period-set-${width}.webp ${width}w`).join(', ')} sizes="100vw" alt="" fetchPriority="high" decoding="async" />
      </figure>
      <div className="produce-hero-content">
        <p className="produce-kicker">{cmsText("ProducePage","4667cb321372293c","03 / PRODUCE")}</p>
        <MotionHeading as="h1" id="produce-title">{cmsText("ProducePage","6593e9e6b25f79af","Produce.")}<span>{cmsText("ProducePage","3516a113e781be28","Everything it takes")}{' '}<br />{cmsText("ProducePage","9474b6fa2f438f95","to get the story shot.")}</span></MotionHeading>
        <MotionCopy>{cmsText("ProducePage","bb74401f191b24ea","Kemsor manages casting, locations, crew, design and the shoot, giving the creative team the support they need to do their work.")}</MotionCopy>
        <div className="produce-actions"><CTA href="/contact/?partner=filmmakers">{cmsText("ProducePage","01c4079ae6a9e8df","Start a conversation")}</CTA><TextLink href="/services/">{cmsText("ProducePage","f2e170937dc34266","Explore all services")}</TextLink></div>
      </div>
      <div className="produce-hero-foot"><span>{cmsText("ProducePage","d3ce66bdea2d5fd2","KEMSOR STUDIOS · STORY. CRAFT. CINEMA.")}</span><a href="#produce-services">{cmsText("ProducePage","d17f400dbb4cbe0a","Explore production support ")}<span aria-hidden="true"><SiteIcon name="arrow-down" size={16} /></span></a></div>
    </section>

    <section className="produce-section produce-intro" aria-labelledby="produce-intro-title">
      <div><Label>{cmsText("ProducePage","729d564f9b90bcd4","WHERE THE PLAN MEETS THE REAL WORLD")}</Label><MotionHeading as="h2" id="produce-intro-title">{cmsText("ProducePage","10c99d94644a7669","Where the plan meets")}<br /><em>{cmsText("ProducePage","e091a13b56a792e2","the real world.")}</em></MotionHeading></div>
      <div className="produce-copy"><MotionCopy>{cmsText("ProducePage","2f24f0d829f2d7ab","Production is where every earlier decision is tested. Schedules meet weather, budgets meet reality, and a hundred people need to be in the right place at the right time.")}</MotionCopy><MotionCopy>{cmsText("ProducePage","62f833a6a774e9bf","Kemsor brings the planning, people and production experience to carry that weight. We assess budget and schedule decisions against the story’s needs and flag risks while there is still time to respond.")}</MotionCopy></div>
    </section>

    <section className="produce-section produce-services" id="produce-services" aria-labelledby="produce-services-title">
      <Label>{cmsText("ProducePage","37a2d4eb804f6bf6","PRODUCTION SERVICES")}</Label>
      <div className="produce-section-head"><MotionHeading as="h2" id="produce-services-title">{cmsText("ProducePage","8101df4fecc6ed2e","Six services,")}<br /><em>{cmsText("ProducePage","e4695fed31525d15","one production partner.")}</em></MotionHeading></div>
      <div className="produce-service-grid">{services.map((service, index) => <a className="produce-service" href={service.href} key={service.title}>
        <div className="produce-service-image"><StudioImage mediaSlot="ProducePage-2" src={service.image} srcSet={service.image.endsWith('-960.webp')?[640,960,1600].map(width=>`${service.image.replace('-960.webp',`-${width}.webp`)} ${width}w`).join(', '):undefined} sizes="(max-width: 480px) 90vw, (max-width: 1050px) 44vw, 30vw" alt="" loading="lazy" decoding="async" width="960" height="540"/></div>
        <div className="produce-service-body"><h3>{service.title}</h3><p>{service.description}</p><span className="produce-card-link">{cmsText("ProducePage","790112deede67562","Explore service ")}<Arrow /></span></div>
      </a>)}</div>
    </section>

    <section className="produce-section produce-process" id="produce-process" aria-labelledby="produce-process-title">
      <Label>{cmsText("ProducePage","59c5015334c26484","HOW WE WORK")}</Label>
      <MotionHeading as="h2" id="produce-process-title">{cmsText("ProducePage","3cb85b423a4cd273","How we work.")}</MotionHeading>
      <ol className="produce-steps">{steps.map(([title, description], index) => <li key={title}><h3>{title}</h3><p>{description}</p></li>)}</ol>
    </section>

    <section className="produce-section produce-audiences" aria-labelledby="produce-audiences-title">
      <div><Label>{cmsText("ProducePage","47804cf4de4a66ea","WHO IT’S FOR")}</Label><MotionHeading as="h2" id="produce-audiences-title">{cmsText("ProducePage","05e2d55bbb495b0d","Who it’s for.")}</MotionHeading><div className="produce-audience-mark" aria-hidden="true"><span>{cmsText("ProducePage","4f59d82bc66dc86d","THE STORY")}</span><i>+</i><span>{cmsText("ProducePage","1eda40071be2326d","THE PEOPLE")}</span><i>+</i><span>{cmsText("ProducePage","c9d03c95ed15ca43","THE PLAN")}</span></div></div>
      <ul>{audiences.map(([title, description], index) => <li key={title}><div><h3>{title}</h3><p>{description}</p></div></li>)}</ul>
    </section>

    {/* No project title, year or production credit was supplied. Keep unverified
        project cards out of the page; the productions archive remains accessible. */}
    <section className="produce-section produce-work" aria-labelledby="produce-work-title"><Label>{cmsText("ProducePage","4ea2710d72e958a6","RELATED WORK")}</Label><div><MotionHeading as="h2" id="produce-work-title">{cmsText("ProducePage","187e4f4d58007084","Related work.")}</MotionHeading><TextLink href="/productions/">{cmsText("ProducePage","7ebf781895b1f8ce","Explore productions")}</TextLink></div></section>

    <section className="produce-section produce-related" aria-labelledby="produce-related-title"><Label>{cmsText("ProducePage","b29fbe5967528721","RELATED SERVICES")}</Label><MotionHeading as="h2" id="produce-related-title">{cmsText("ProducePage","018bcd75038dcdf7","Related services.")}</MotionHeading><div className="produce-related-grid">{related.map(([number, title, description, href]) => <a href={href} key={title}><h3>{title}</h3><p>{description}</p><Arrow /></a>)}</div></section>

    <section className="produce-section produce-questions" aria-labelledby="produce-questions-title"><FaqPanel heading={<> <div><Label>{cmsText("ProducePage","b8a88556bf67af8f","QUESTIONS")}</Label><MotionHeading as="h2" id="produce-questions-title">{cmsText("ProducePage","f0fe56481faa7faf","Questions.")}</MotionHeading></div> </>}> <div className="standard-faq-list">{questions.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true"><SiteIcon name="plus" size={16} /></span></summary><p>{answer}</p></details>)}</div> </FaqPanel></section>
  </div></ProduceLayout>;
}
