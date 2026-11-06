import FaqPanel from '../FaqPanel';
import {cmsText,cmsData} from '../siteContent';
import StudioImage from '../StudioImage';
import SiteIcon from '../SiteIcon';
import MotionHeading, { MotionCopy } from '../TextMotion';
import ProduceLayout from '../ProduceLayout';
import React from 'react';
import { Arrow, CTA, TextLink } from '../PageUI';
import './produce-page.css';
import './line-production-page.css';

// Copy: Kemsor_Produce_06_Shooting_and_On-Location_Production.docx.pdf.
// Local draft: confirm safety responsibilities and data-handling/handover scope before publishing.
const included = cmsData(()=>([
  [cmsText("ShootingProductionPage","016fd8bca8934982","Shoot-day management"), cmsText("ShootingProductionPage","732b47b93ff43ef3","Call sheets, timings and the unit kept moving through every day.")],
  [cmsText("ShootingProductionPage","dd7f04957909bada","On-location operations"), cmsText("ShootingProductionPage","abbd8387c145e03f","Base, access and unit facilities run on location.")],
  [cmsText("ShootingProductionPage","401763eb9ec407fd","Multi-location & outdoor shoots"), cmsText("ShootingProductionPage","8adb56161cac7dea","Moves, weather and changing conditions planned for, not just reacted to.")],
  [cmsText("ShootingProductionPage","acff3794d5651124","Set safety & welfare"), cmsText("ShootingProductionPage","4f8dce487fafc888","A safe, well-run set where cast and crew are looked after.")],
  [cmsText("ShootingProductionPage","4fcbe463e0b4eef6","Daily progress reports"), cmsText("ShootingProductionPage","f88265e168eaecfe","Clear reports on scenes shot, time and spend after every day.")],
  [cmsText("ShootingProductionPage","24d0e1b392e79966","Footage handover"), cmsText("ShootingProductionPage","349155e41869dafb","Footage and records handed to post-production in order.")],
]));
const steps = cmsData(()=>([
  [cmsText("ShootingProductionPage","f95c72d5906e0a4e","Prepare"), cmsText("ShootingProductionPage","1e07bd33e7246e1e","Shooting plan, call sheets, and locations ready before day one.")],
  [cmsText("ShootingProductionPage","ac1b2df005079fdf","Run the day"), cmsText("ShootingProductionPage","5f5016aa2784c122","The unit is managed on set and on location, hour by hour.")],
  [cmsText("ShootingProductionPage","e7bcaba71fc0e06f","Report"), cmsText("ShootingProductionPage","8fedb90d20776b60","Progress shared daily so producers can decide with real information.")],
  [cmsText("ShootingProductionPage","caf2990f4edf66fa","Wrap & hand over"), cmsText("ShootingProductionPage","a5fb47ec576c8605","Locations returned, footage handed to post, the shoot closed properly.")],
]));
const audiences = cmsData(()=>([
  [cmsText("ShootingProductionPage","f77a92a03604e5f9","Productions"), cmsText("ShootingProductionPage","6f47e00247c2828a","Productions that need a shoot run reliably, day after day")],
  [cmsText("ShootingProductionPage","899b77a57db935f2","Directors"), cmsText("ShootingProductionPage","3130030965197ee9","Directors who want to focus on performance and the frame")],
  [cmsText("ShootingProductionPage","50742c717d79be16","International productions"), cmsText("ShootingProductionPage","c576f57fedee3d2d","International productions filming on location in India")],
]));
const related = cmsData(()=>([
  ['01', cmsText("ShootingProductionPage","482243b6a3ff5275","Line Production & Production Management"), '/produce/line-production/'],
  ['02', cmsText("ShootingProductionPage","2ec4d797494d3a16","Locations & Logistics"), '/produce/locations-logistics/'],
  ['03', cmsText("ShootingProductionPage","56fa6af663fc86a6","Crew & Equipment"), '/produce/crew-equipment/'],
  ['04', cmsText("ShootingProductionPage","c44bb9615e98684c","Post-Production Supervision"), '/services/#capability-post'],
]));
const questions = cmsData(()=>([
  [cmsText("ShootingProductionPage","3119d575dade4f02","Can you run a single shoot day or a short shoot?"), cmsText("ShootingProductionPage","9985628fcb06599f","Yes. From a single day to a long series schedule, scope is shaped to the project.")],
  [cmsText("ShootingProductionPage","f5676832acc2a55e","How do you handle changes on the day?"), cmsText("ShootingProductionPage","ec88c2b0938ed814","We flag issues early with options, so the director and producers can decide quickly and keep shooting.")],
  [cmsText("ShootingProductionPage","cff7ade2bc82d5ca","Do you hand footage directly to post-production?"), cmsText("ShootingProductionPage","38945be25760e734","Yes. Footage and production records are handed to post in order, ready for the edit.")],
]));
function Label({ children, end }) {
  return <div className="produce-label"><span>{children}</span>{end && <span>{end}</span>}</div>;
}

Label.displayName = 'EditorialLabel';

export default function ShootingProductionPage() {
  return <ProduceLayout page="shooting-on-location"><div className="produce-hub shooting-on-location-page">
    <nav className="produce-breadcrumb" aria-label="Breadcrumb"><a href="/">{cmsText("ShootingProductionPage","1ce44f1b09a28e46","Kemsor Studios")}</a><span aria-hidden="true">/</span><a href="/produce/">{cmsText("ShootingProductionPage","f807e84c5dfae6b5","Produce")}</a><span aria-hidden="true">/</span><span aria-current="page">{cmsText("ShootingProductionPage","9e6fd0d7ede968a3","Shooting & On-Location Production")}</span></nav>

    <section className="inner-hero produce-hero produce-hero-light line-production-hero" aria-labelledby="shooting-on-location-title"><figure className="produce-hero-image" aria-hidden="true"><StudioImage mediaSlot="ShootingProductionPage-1" src="/assets/stills/fort-action-production-1600.webp" srcSet={[640, 960, 1600].map(width => `/assets/stills/fort-action-production-${width}.webp ${width}w`).join(', ')} sizes="100vw" alt={"Supplied illustration of an action scene being filmed at a fort, with a camera crew, performers and vehicles"} width="1600" height="640" fetchPriority="high" decoding="async"/></figure><div className="produce-hero-content"><p className="produce-kicker">{cmsText("ShootingProductionPage","7c7069a901fd553d","PRODUCE · ON SET")}</p><MotionHeading as="h1" id="shooting-on-location-title">{cmsText("ShootingProductionPage","a8ee3772aadb8140","Shooting & On-Location Production.")}<span>{cmsText("ShootingProductionPage","6a7f397541f8b902","Cameras rolling. Everything else handled.")}</span></MotionHeading><MotionCopy>{cmsText("ShootingProductionPage","a1bfe9c3323ae8bf","Kemsor manages the shoot day on set and on location so the director, cast and crew can focus on filming.")}</MotionCopy><div className="produce-actions"><CTA href="/contact/?partner=filmmakers">{cmsText("ShootingProductionPage","ce532dd2fc4914b8","Plan your shoot")}</CTA><TextLink href="#shooting-on-location-work">{cmsText("ShootingProductionPage","4bfd028ba1d387f1","See related work")}</TextLink></div></div><div className="produce-hero-foot"><a href="/produce/"><SiteIcon name="arrow-left" size={16} />{cmsText("ShootingProductionPage","a49337b5f4632d48"," Back to Produce")}</a><a href="#shooting-on-location-included">{cmsText("ShootingProductionPage","fa4efca5b663ec44","What’s included ")}<span aria-hidden="true"><SiteIcon name="arrow-down" size={16} /></span></a></div></section>

    <section className="produce-section produce-intro" aria-labelledby="shooting-on-location-why"><div><Label>{cmsText("ShootingProductionPage","84ead48f98ef379f","WHY IT MATTERS")}</Label><MotionHeading as="h2" id="shooting-on-location-why">{cmsText("ShootingProductionPage","f6cfc6bfe92f5c0a","Keep the unit moving.")}<br/><em>{cmsText("ShootingProductionPage","78da1288c7448b6e","Keep the story at the centre.")}</em></MotionHeading></div><div className="produce-copy"><MotionCopy>{cmsText("ShootingProductionPage","436ef0ebd1e86984","Every plan meets reality on the shoot day. Light moves, weather turns, a scene needs one more take.")}</MotionCopy><MotionCopy>{cmsText("ShootingProductionPage","3f24ab59f544d28d","We keep the unit moving, adjust the schedule when needed and help the team respond to problems before they cost a day’s work.")}</MotionCopy></div></section>

    <section className="produce-section line-production-included" id="shooting-on-location-included" aria-labelledby="shooting-on-location-included-title"><Label end="FROM DAY ONE TO THE FINAL WRAP">{cmsText("ShootingProductionPage","66ca3aeeb0acda01","WHAT’S INCLUDED")}</Label><MotionHeading as="h2" id="shooting-on-location-included-title">{cmsText("ShootingProductionPage","10cd66ca3ccd24a2","What’s included.")}</MotionHeading><div className="line-production-scope"><dl className="line-production-deliverables studio-ledger studio-ledger-pairs">{included.map(([title, description], index) => <div key={title}><dt>{title}</dt><dd>{description}</dd></div>)}</dl><figure className="line-production-planning"><StudioImage mediaSlot="ShootingProductionPage-2" src="/assets/stills/daylight-snow-production-960.webp" alt={"Supplied illustration of a film crew coordinating a scene on a snowy mountain location"} width="1672" height="941" loading="lazy" decoding="async"/><figcaption><span>{cmsText("ShootingProductionPage","5bbb7783b8f41f6e","FOCUS ON THE FRAME")}</span><p>{cmsText("ShootingProductionPage","e1f297129b5820d0","On set and on location, Kemsor runs the shoot day.")}</p></figcaption></figure></div></section>

    <section className="produce-section produce-process" aria-labelledby="shooting-on-location-process-title"><Label end="PREPARE → SHOOT → HAND OVER">{cmsText("ShootingProductionPage","e35e4877af17d0ab","HOW WE WORK")}</Label><MotionHeading as="h2" id="shooting-on-location-process-title">{cmsText("ShootingProductionPage","042eb5ee9a696993","How we work.")}</MotionHeading><ol className="produce-steps line-production-steps">{steps.map(([title, description], index) => <li key={title}><h3>{title}</h3><p>{description}</p></li>)}</ol></section>

    <section className="produce-section produce-audiences" aria-labelledby="shooting-on-location-audiences-title"><div><Label>{cmsText("ShootingProductionPage","6a8c2b565a8ed27c","WHO IT’S FOR")}</Label><MotionHeading as="h2" id="shooting-on-location-audiences-title">{cmsText("ShootingProductionPage","2a53a2b39d745844","Who it’s for.")}</MotionHeading><div className="produce-audience-mark" aria-hidden="true"><span>{cmsText("ShootingProductionPage","7343ea7c47fce1a6","THE UNIT")}</span><i>+</i><span>{cmsText("ShootingProductionPage","e17d49c62d1b9479","THE SCHEDULE")}</span><i>+</i><span>{cmsText("ShootingProductionPage","7a16961e99ff293b","THE STORY")}</span></div></div><ul>{audiences.map(([title, description], index) => <li key={title}><div><h3>{title}</h3><p>{description}</p></div></li>)}</ul></section>

    {/* No confirmed project title, format, location or shooting/on-location credit supplied. */}
    <section className="produce-section produce-work" id="shooting-on-location-work" aria-labelledby="shooting-on-location-work-title"><Label>{cmsText("ShootingProductionPage","81636b176ac3129b","RELATED WORK")}</Label><div><MotionHeading as="h2" id="shooting-on-location-work-title">{cmsText("ShootingProductionPage","c87aac7f9dc66929","Related work.")}</MotionHeading><TextLink href="/productions/">{cmsText("ShootingProductionPage","284ccbbe932ec5bb","Explore productions")}</TextLink></div></section>

    <section className="produce-section produce-related line-production-related" aria-labelledby="shooting-on-location-related-title"><Label>{cmsText("ShootingProductionPage","c8eb03a12e7585b1","CONNECTED PRODUCTION SUPPORT")}</Label><MotionHeading as="h2" id="shooting-on-location-related-title">{cmsText("ShootingProductionPage","46ca18ea0a55dd58","Related services.")}</MotionHeading><div className="produce-related-grid">{related.map(([number, title, href]) => <a href={href} key={title}><h3>{title}</h3><span className="line-production-related-link">{cmsText("ShootingProductionPage","98039b417cf97707","Explore service ")}<Arrow/></span></a>)}</div></section>

    <section className="produce-section produce-questions" aria-labelledby="shooting-on-location-questions-title"><FaqPanel heading={<> <div><Label>{cmsText("ShootingProductionPage","0170105e974aaa5f","A FEW THINGS TO KNOW")}</Label><MotionHeading as="h2" id="shooting-on-location-questions-title">{cmsText("ShootingProductionPage","1d8df5d87ee810e8","Questions.")}</MotionHeading></div> </>}> <div className="standard-faq-list">{questions.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true"><SiteIcon name="plus" size={16} /></span></summary><p>{answer}</p></details>)}</div> </FaqPanel></section>
  </div></ProduceLayout>;
}
