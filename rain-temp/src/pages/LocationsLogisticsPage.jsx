import {cmsText,cmsData} from '../siteContent';
import StudioImage from '../StudioImage';
import SiteIcon from '../SiteIcon';
import MotionHeading, { MotionCopy } from '../TextMotion';
import ProduceLayout from '../ProduceLayout';
import React from 'react';
import { Arrow, CTA, TextLink } from '../PageUI';
import './produce-page.css';
import './line-production-page.css';

// Copy: Kemsor_Produce_03_Locations_and_Logistics.docx (1).pdf.
// Local draft: confirm permissions coordination and unit-logistics scope before publishing.
const included = cmsData(()=>([
  [cmsText("LocationsLogisticsPage","6695ac5693a6125b","Location scouting"), cmsText("LocationsLogisticsPage","ed305d6ae29997d3","Options found and recced against the script, with photos and practical notes.")],
  [cmsText("LocationsLogisticsPage","9cd780fdee8f6fa7","Location management"), cmsText("LocationsLogisticsPage","b79fd80239bdd0d4","Agreements with location owners and coordination on every shoot day.")],
  [cmsText("LocationsLogisticsPage","efab620846e32ab7","Permissions coordination"), cmsText("LocationsLogisticsPage","572ec56968cfdea9","Working with owners and relevant authorities on the permissions a shoot needs.")],
  [cmsText("LocationsLogisticsPage","b22943f8493a5ba9","Unit logistics"), cmsText("LocationsLogisticsPage","16381f1266dd788b","Transport, base and unit facilities planned around the schedule.")],
  [cmsText("LocationsLogisticsPage","fccb30a46205e4a0","Company moves"), cmsText("LocationsLogisticsPage","72fb3bd590399b3a","Movement between locations planned so shoot time isn’t lost on the road.")],
  [cmsText("LocationsLogisticsPage","b0badbf0f9d15de9","Respect for place"), cmsText("LocationsLogisticsPage","6ef5b06b38ae6c79","Neighbours informed, sites protected and locations returned as we found them.")],
]));
const steps = cmsData(()=>([
  [cmsText("LocationsLogisticsPage","4d750bdac0c55cb3","Read the script for place"), cmsText("LocationsLogisticsPage","3fa11b46cd366874","What each location needs to say, and what each scene needs practically.")],
  [cmsText("LocationsLogisticsPage","15e3abb65226ff15","Scout & recce"), cmsText("LocationsLogisticsPage","6de95f86edf62e43","Options found, visited and assessed with the director and heads of department.")],
  [cmsText("LocationsLogisticsPage","c9c1fa7ab8457262","Secure & plan"), cmsText("LocationsLogisticsPage","365f3cb6dc961c29","Agreements, permissions and logistics locked into the schedule.")],
  [cmsText("LocationsLogisticsPage","dd696b52fc2f895e","Manage on the day"), cmsText("LocationsLogisticsPage","7445aa877603a492","Locations run on shoot days and handed back properly at wrap.")],
]));
const audiences = cmsData(()=>([
  [cmsText("LocationsLogisticsPage","0f98a24bb9375698","Productions"), cmsText("LocationsLogisticsPage","caed61c5eb78dd3e","Productions that need locations found and managed")],
  [cmsText("LocationsLogisticsPage","bcc367d2d65b9174","Directors"), cmsText("LocationsLogisticsPage","2434289038b1f3f0","Directors looking for places that serve the story")],
  [cmsText("LocationsLogisticsPage","915ebb0dc4279be9","International productions"), cmsText("LocationsLogisticsPage","4675d89263b6c09e","International productions filming in India")],
]));
const related = cmsData(()=>([
  ['01', cmsText("LocationsLogisticsPage","6a6d8f2a98804bb9","Shooting & On-Location Production"), '/produce/shooting-on-location/'],
  ['02', cmsText("LocationsLogisticsPage","473ea134a63e8d81","Line Production & Production Management"), '/produce/line-production/'],
  ['03', cmsText("LocationsLogisticsPage","9657efe42372005e","Set & Production Design"), '/produce/set-production-design/'],
  ['04', cmsText("LocationsLogisticsPage","6f87d6eac13b14b4","India Production Services"), '/india-production-services/'],
]));
const questions = cmsData(()=>([
  [cmsText("LocationsLogisticsPage","2d714eb498ea85f0","Can you scout before we finalise the budget?"), cmsText("LocationsLogisticsPage","54caf2ee96e4607d","Yes. Early scouting helps shape a budget and schedule grounded in production realities.")],
  [cmsText("LocationsLogisticsPage","204881734bd28604","Do you support international productions filming in India?"), cmsText("LocationsLogisticsPage","22fe08eaf5e8a593","Yes. Our India Production Services cover locations and logistics for visiting productions.")],
  [cmsText("LocationsLogisticsPage","c07146e9b891f826","Can you manage locations we have already found?"), cmsText("LocationsLogisticsPage","dd594c63c26bcd32","Yes. We can take on agreements, permissions coordination and shoot-day management for locations you’ve chosen.")],
]));
function Label({ children, end }) {
  return <div className="produce-label"><span>{children}</span>{end && <span>{end}</span>}</div>;
}

Label.displayName = 'EditorialLabel';

export default function LocationsLogisticsPage() {
  return <ProduceLayout page="locations-logistics"><div className="produce-hub locations-logistics-page">
    <nav className="produce-breadcrumb" aria-label="Breadcrumb"><a href="/">{cmsText("LocationsLogisticsPage","f78ab3249d1c4281","Kemsor Studios")}</a><span aria-hidden="true">/</span><a href="/produce/">{cmsText("LocationsLogisticsPage","b8b0c1c91ab35687","Produce")}</a><span aria-hidden="true">/</span><span aria-current="page">{cmsText("LocationsLogisticsPage","ec6cbd980da5e96f","Locations & Logistics")}</span></nav>

    <section className="inner-hero produce-hero produce-hero-light line-production-hero" aria-labelledby="locations-logistics-title"><figure className="produce-hero-image" aria-hidden="true"><StudioImage mediaSlot="LocationsLogisticsPage-1" src="/assets/stills/daylight-valley-production-1600.webp" srcSet={[640, 960, 1600].map(width => `/assets/stills/daylight-valley-production-${width}.webp ${width}w`).join(', ')} sizes="100vw" alt="" fetchPriority="high" decoding="async"/></figure><div className="produce-hero-content"><p className="produce-kicker">{cmsText("LocationsLogisticsPage","e6b99c59b5e54a8e","PRODUCE · PRE-PRODUCTION")}</p><MotionHeading as="h1" id="locations-logistics-title">{cmsText("LocationsLogisticsPage","986b107a81e3cddd","Locations & Logistics.")}<span>{cmsText("LocationsLogisticsPage","daaf9149d80cbefa","The right place, ready when the camera is.")}</span></MotionHeading><MotionCopy>{cmsText("LocationsLogisticsPage","aefbd522fa915654","Kemsor scouts, secures and manages locations, and coordinates the movement of people and equipment so each shoot day starts ready.")}</MotionCopy><div className="produce-actions"><CTA href="/contact/?partner=filmmakers">{cmsText("LocationsLogisticsPage","ef5bebb9a5cb4026","Talk to us about locations")}</CTA><TextLink href="#locations-logistics-work">{cmsText("LocationsLogisticsPage","3d2535db9138114a","See related work")}</TextLink></div></div><div className="produce-hero-foot"><a href="/produce/"><SiteIcon name="arrow-left" size={16} />{cmsText("LocationsLogisticsPage","6dcdb7a5a1534cc3"," Back to Produce")}</a><a href="#locations-logistics-included">{cmsText("LocationsLogisticsPage","ca9a14e6b7968e96","What’s included ")}<span aria-hidden="true"><SiteIcon name="arrow-down" size={16} /></span></a></div></section>

    <section className="produce-section produce-intro" aria-labelledby="locations-logistics-why"><div><Label>{cmsText("LocationsLogisticsPage","048f1a307aa2af4a","WHY IT MATTERS")}</Label><MotionHeading as="h2" id="locations-logistics-why">{cmsText("LocationsLogisticsPage","77b357dff30e8a85","The place.")}<br/><em>{cmsText("LocationsLogisticsPage","73729852b498a8ca","Everything it takes to film there.")}</em></MotionHeading></div><div className="produce-copy"><MotionCopy>{cmsText("LocationsLogisticsPage","ab1a898b5b18b1bf","A location is a character in the story. Logistics decide whether you can actually film there.")}</MotionCopy><MotionCopy>{cmsText("LocationsLogisticsPage","1b27bc75e29e4e71","We find places that serve the story and plan access, movement and timing with the people who live and work nearby. We treat those communities as partners and leave places as we found them.")}</MotionCopy></div></section>

    <section className="produce-section line-production-included" id="locations-logistics-included" aria-labelledby="locations-logistics-included-title"><Label end="FROM SCRIPT TO LOCATION">{cmsText("LocationsLogisticsPage","46c60f54dba3762a","WHAT’S INCLUDED")}</Label><MotionHeading as="h2" id="locations-logistics-included-title">{cmsText("LocationsLogisticsPage","2c509d9d93ae6e99","What’s included.")}</MotionHeading><div className="line-production-scope"><dl className="line-production-deliverables studio-ledger studio-ledger-pairs">{included.map(([title, description], index) => <div key={title}><dt><span aria-hidden="true">0{index + 1}</span>{title}</dt><dd>{description}</dd></div>)}</dl><figure className="line-production-planning"><StudioImage mediaSlot="LocationsLogisticsPage-2" src="/assets/stills/work-forest-set-960.webp" alt={"Illustrative production crew filming on a forest location"} width="1672" height="941" loading="lazy" decoding="async"/><figcaption><span>{cmsText("LocationsLogisticsPage","a975920ef61b6241","RESPECT FOR PLACE")}</span><MotionCopy>{cmsText("LocationsLogisticsPage","b8a85088de6be83d","We treat the communities we film in as partners, and leave places as we found them.")}</MotionCopy></figcaption></figure></div></section>

    <section className="produce-section produce-process" aria-labelledby="locations-logistics-process-title"><Label end="SCOUT → SECURE → MANAGE">{cmsText("LocationsLogisticsPage","87df925e13169134","HOW WE WORK")}</Label><MotionHeading as="h2" id="locations-logistics-process-title">{cmsText("LocationsLogisticsPage","49a819770d03609c","How we work.")}</MotionHeading><ol className="produce-steps line-production-steps">{steps.map(([title, description], index) => <li key={title}><span className="produce-step-number">0{index + 1}</span><h3>{title}</h3><p>{description}</p></li>)}</ol></section>

    <section className="produce-section produce-audiences" aria-labelledby="locations-logistics-audiences-title"><div><Label>{cmsText("LocationsLogisticsPage","16a913e31dc9f62a","WHO IT’S FOR")}</Label><MotionHeading as="h2" id="locations-logistics-audiences-title">{cmsText("LocationsLogisticsPage","774d2b2a7b1d68be","Who it’s for.")}</MotionHeading><div className="produce-audience-mark" aria-hidden="true"><span>{cmsText("LocationsLogisticsPage","c7c86f4b957f4ad1","THE STORY")}</span><i>+</i><span>{cmsText("LocationsLogisticsPage","406f7f38f350bf31","THE PLACE")}</span><i>+</i><span>{cmsText("LocationsLogisticsPage","2145a0c09e5402fc","THE SCHEDULE")}</span></div></div><ul>{audiences.map(([title, description], index) => <li key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{description}</p></div></li>)}</ul></section>

    {/* No confirmed project title, format, location or locations/logistics credit supplied. */}
    <section className="produce-section produce-work" id="locations-logistics-work" aria-labelledby="locations-logistics-work-title"><Label>{cmsText("LocationsLogisticsPage","7371969d32d68cdf","RELATED WORK")}</Label><div><MotionHeading as="h2" id="locations-logistics-work-title">{cmsText("LocationsLogisticsPage","d21d2930383329aa","Related work.")}</MotionHeading><TextLink href="/productions/">{cmsText("LocationsLogisticsPage","66e7ac1be7c57bed","Explore productions")}</TextLink></div></section>

    <section className="produce-section produce-related line-production-related" aria-labelledby="locations-logistics-related-title"><Label>{cmsText("LocationsLogisticsPage","e5d35820208d62b3","CONNECTED PRODUCTION SUPPORT")}</Label><MotionHeading as="h2" id="locations-logistics-related-title">{cmsText("LocationsLogisticsPage","c6619ed754f693a1","Related services.")}</MotionHeading><div className="produce-related-grid">{related.map(([number, title, href]) => <a href={href} key={title}><span className="produce-related-number">{number}</span><h3>{title}</h3><span className="line-production-related-link">{cmsText("LocationsLogisticsPage","60a4a17ec07b8eb9","Explore service ")}<Arrow/></span></a>)}</div></section>

    <section className="produce-section produce-questions" aria-labelledby="locations-logistics-questions-title"><div><Label>{cmsText("LocationsLogisticsPage","0e7035f742369b35","A FEW THINGS TO KNOW")}</Label><MotionHeading as="h2" id="locations-logistics-questions-title">{cmsText("LocationsLogisticsPage","9bf3ea73a2ecdd95","Questions.")}</MotionHeading></div><div className="produce-faqs">{questions.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true"><SiteIcon name="plus" size={16} /></span></summary><p>{answer}</p></details>)}</div></section>
  </div></ProduceLayout>;
}
