import {cmsText,cmsData} from '../siteContent';
import StudioImage from '../StudioImage';
import SiteIcon from '../SiteIcon';
import MotionHeading, { MotionCopy } from '../TextMotion';
import ProduceLayout from '../ProduceLayout';
import React from 'react';
import { Arrow, CTA, TextLink } from '../PageUI';
import './produce-page.css';
import './line-production-page.css';

// Copy: Kemsor_Produce_05_Set_and_Production_Design.docx.pdf.
// Local draft: confirm direct construction versus construction-partner coordination before publishing.
const included = cmsData(()=>([
  [cmsText("SetProductionDesignPage","32ceb969b523a3c8","Design development"), cmsText("SetProductionDesignPage","f8cc974f51b91d79","The look of the story developed with the director and production designer.")],
  [cmsText("SetProductionDesignPage","c6b2a828e8d6d0ee","Set design & construction"), cmsText("SetProductionDesignPage","4ea8787fb5c7a79b","Sets designed and built for camera, light and crew.")],
  [cmsText("SetProductionDesignPage","e75aa959b03ddad0","Art direction & props"), cmsText("SetProductionDesignPage","abea496369e7fa87","Props sourced or made, and art department run through the shoot.")],
  [cmsText("SetProductionDesignPage","f7455b965e5689de","Location dressing"), cmsText("SetProductionDesignPage","37448c14658e5c04","Real locations dressed to become the story’s world.")],
  [cmsText("SetProductionDesignPage","5305d46f1bb0de74","Period & world research"), cmsText("SetProductionDesignPage","744705c1f8bcb1e7","Research that keeps period and specialised worlds accurate.")],
  [cmsText("SetProductionDesignPage","c2d1ce9b9b42125e","Build budgets & schedules"), cmsText("SetProductionDesignPage","05321a4d5fd0eb5b","Design costs and build timelines planned alongside the production.")],
]));
const steps = cmsData(()=>([
  [cmsText("SetProductionDesignPage","4a85e0e135aca491","Read the world"), cmsText("SetProductionDesignPage","5f24323c2cae042d","What the story’s world is, and how it should feel on screen.")],
  [cmsText("SetProductionDesignPage","7acb81994619deeb","Design"), cmsText("SetProductionDesignPage","f92d17086d5fbecb","Concepts, references and plans agreed with the director.")],
  [cmsText("SetProductionDesignPage","2bb8c6f684d93105","Build & dress"), cmsText("SetProductionDesignPage","fb26f910e20ee7eb","Sets built, props sourced and locations dressed to schedule.")],
  [cmsText("SetProductionDesignPage","ad590d2dd5cc166c","Support the shoot"), cmsText("SetProductionDesignPage","7e1c9536d07279af","Art department on set, keeping continuity and the world intact.")],
]));
const audiences = cmsData(()=>([
  [cmsText("SetProductionDesignPage","d4fe7f3aedf4511e","Directors & producers"), cmsText("SetProductionDesignPage","2a0148d72208c911","Directors and producers creating a distinct world on screen")],
  [cmsText("SetProductionDesignPage","d19f8a5a2d09f89a","Period & specialised productions"), cmsText("SetProductionDesignPage","615f8d7475f8cc4b","Period pieces and productions with specialised settings")],
  [cmsText("SetProductionDesignPage","e68e3980690433b0","Series"), cmsText("SetProductionDesignPage","75e731bfae2bb26a","Series that need consistent sets across many episodes")],
]));
const related = cmsData(()=>([
  ['01', cmsText("SetProductionDesignPage","e9c63afe96ba24df","Locations & Logistics"), '/produce/locations-logistics/'],
  ['02', cmsText("SetProductionDesignPage","99db828495ba0c5b","Shooting & On-Location Production"), '/produce/shooting-on-location/'],
  ['03', cmsText("SetProductionDesignPage","e06b80fcc3a2c86f","Line Production & Production Management"), '/produce/line-production/'],
  ['04', cmsText("SetProductionDesignPage","98185305c7e21ae0","Post-Production Supervision"), '/services/#capability-post'],
]));
const questions = cmsData(()=>([
  [cmsText("SetProductionDesignPage","6a3632bec2624464","Do you work with our own production designer?"), cmsText("SetProductionDesignPage","57f85f04a3d5186f","Yes. We can support your designer with planning, builds and art department coordination.")],
  [cmsText("SetProductionDesignPage","edbf41899a9fc6c3","Can you design for both studio sets and real locations?"), cmsText("SetProductionDesignPage","9185edc3c25ac2a9","Yes. We build sets and dress real locations, depending on what the story needs.")],
  [cmsText("SetProductionDesignPage","8d38e1949349fc65","How do you keep design within budget?"), cmsText("SetProductionDesignPage","c7dcdc7acb09fafc","Design costs and build timelines are planned alongside the production budget from the start.")],
]));
function Label({ children, end }) {
  return <div className="produce-label"><span>{children}</span>{end && <span>{end}</span>}</div>;
}

Label.displayName = 'EditorialLabel';

export default function SetProductionDesignPage() {
  return <ProduceLayout page="set-production-design"><div className="produce-hub set-production-design-page">
    <nav className="produce-breadcrumb" aria-label="Breadcrumb"><a href="/">{cmsText("SetProductionDesignPage","469bcbb12b669614","Kemsor Studios")}</a><span aria-hidden="true">/</span><a href="/produce/">{cmsText("SetProductionDesignPage","343b71b308a91ce1","Produce")}</a><span aria-hidden="true">/</span><span aria-current="page">{cmsText("SetProductionDesignPage","42a66d8085d60d8b","Set & Production Design")}</span></nav>

    <section className="inner-hero produce-hero produce-hero-light line-production-hero" aria-labelledby="set-production-design-title"><figure className="produce-hero-image" aria-hidden="true"><StudioImage mediaSlot="SetProductionDesignPage-1" src="/assets/stills/courtyard-dance-production-1600.webp" srcSet={[640, 960, 1600].map(width => `/assets/stills/courtyard-dance-production-${width}.webp ${width}w`).join(', ')} sizes="100vw" alt={"Supplied illustration of a colourful courtyard dance set with performers, lighting and camera equipment"} width="1600" height="640" fetchPriority="high" decoding="async"/></figure><div className="produce-hero-content"><p className="produce-kicker">{cmsText("SetProductionDesignPage","271387f1793f7bb2","PRODUCE · PRE-PRODUCTION")}</p><MotionHeading as="h1" id="set-production-design-title">{cmsText("SetProductionDesignPage","03791fe5cd8d6316","Set & Production Design.")}<span>{cmsText("SetProductionDesignPage","7d33a969567dc543","The world of the story, built to be filmed.")}</span></MotionHeading><MotionCopy>{cmsText("SetProductionDesignPage","46600a7e29537510","Kemsor delivers production design, including sets, art direction, props and dressing, so the world on screen feels true and the build fits the budget and schedule.")}</MotionCopy><div className="produce-actions"><CTA href="/contact/?partner=filmmakers">{cmsText("SetProductionDesignPage","3c30f93ac86ff2d1","Talk to us about design")}</CTA><TextLink href="#set-production-design-work">{cmsText("SetProductionDesignPage","886550d846ab6ea7","See related work")}</TextLink></div></div><div className="produce-hero-foot"><a href="/produce/"><SiteIcon name="arrow-left" size={16} />{cmsText("SetProductionDesignPage","15b70f79fd75c710"," Back to Produce")}</a><a href="#set-production-design-included">{cmsText("SetProductionDesignPage","7de8f8840136db4e","What’s included ")}<span aria-hidden="true"><SiteIcon name="arrow-down" size={16} /></span></a></div></section>

    <section className="produce-section produce-intro" aria-labelledby="set-production-design-why"><div><Label>{cmsText("SetProductionDesignPage","b6c0cfe00c72ca20","WHY IT MATTERS")}</Label><MotionHeading as="h2" id="set-production-design-why">{cmsText("SetProductionDesignPage","5799b52270f78d6f","Make the world")}<br/><em>{cmsText("SetProductionDesignPage","6b6a6d8b7299facc","believable.")}</em></MotionHeading></div><div className="produce-copy"><MotionCopy>{cmsText("SetProductionDesignPage","2a2d3b22f535b4d4","Audiences believe a story when they believe its world. Every wall, prop and surface either supports that belief or breaks it.")}</MotionCopy><MotionCopy>{cmsText("SetProductionDesignPage","5a1575da4e0bcbab","We work from the director’s vision and the script’s demands, then plan builds and dressing that look right on camera and arrive on time and on budget.")}</MotionCopy></div></section>

    <section className="produce-section line-production-included" id="set-production-design-included" aria-labelledby="set-production-design-included-title"><Label end="FROM SCRIPT TO SCREEN">{cmsText("SetProductionDesignPage","b3cea96b1a69c95e","WHAT’S INCLUDED")}</Label><MotionHeading as="h2" id="set-production-design-included-title">{cmsText("SetProductionDesignPage","33070fac30440f31","What’s included.")}</MotionHeading><div className="line-production-scope"><dl className="line-production-deliverables studio-ledger studio-ledger-pairs">{included.map(([title, description], index) => <div key={title}><dt><span aria-hidden="true">0{index + 1}</span>{title}</dt><dd>{description}</dd></div>)}</dl><figure className="line-production-planning"><StudioImage mediaSlot="SetProductionDesignPage-2" src="/assets/stills/work-period-set-960.webp" alt={"Illustrative period film set with performers, crew and production design"} width="1672" height="941" loading="lazy" decoding="async"/><figcaption><span>{cmsText("SetProductionDesignPage","7d405bad42a0812f","THE WORLD ON SCREEN")}</span><MotionCopy>{cmsText("SetProductionDesignPage","fe8292b7b4b9b8ea","Every wall, prop and surface either supports that belief or breaks it.")}</MotionCopy></figcaption></figure></div></section>

    <section className="produce-section produce-process" aria-labelledby="set-production-design-process-title"><Label end="DESIGN → BUILD → SHOOT">{cmsText("SetProductionDesignPage","185f8c6d6f7a9fe3","HOW WE WORK")}</Label><MotionHeading as="h2" id="set-production-design-process-title">{cmsText("SetProductionDesignPage","c1f29ba3a9729fa4","How we work.")}</MotionHeading><ol className="produce-steps line-production-steps">{steps.map(([title, description], index) => <li key={title}><span className="produce-step-number">0{index + 1}</span><h3>{title}</h3><p>{description}</p></li>)}</ol></section>

    <section className="produce-section produce-audiences" aria-labelledby="set-production-design-audiences-title"><div><Label>{cmsText("SetProductionDesignPage","d9bfcbec3aa8fa07","WHO IT’S FOR")}</Label><MotionHeading as="h2" id="set-production-design-audiences-title">{cmsText("SetProductionDesignPage","14c0a75dfd2fafbd","Who it’s for.")}</MotionHeading><div className="produce-audience-mark" aria-hidden="true"><span>{cmsText("SetProductionDesignPage","f5fed81481184c6b","THE VISION")}</span><i>+</i><span>{cmsText("SetProductionDesignPage","c49c2e732306b14b","THE WORLD")}</span><i>+</i><span>{cmsText("SetProductionDesignPage","2ba30f9ef5467dd4","THE BUILD")}</span></div></div><ul>{audiences.map(([title, description], index) => <li key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{description}</p></div></li>)}</ul></section>

    {/* No confirmed project title, format, year or set/production-design credit supplied. */}
    <section className="produce-section produce-work" id="set-production-design-work" aria-labelledby="set-production-design-work-title"><Label>{cmsText("SetProductionDesignPage","042d6a93ec602465","RELATED WORK")}</Label><div><MotionHeading as="h2" id="set-production-design-work-title">{cmsText("SetProductionDesignPage","8f258f56bd0b26cd","Related work.")}</MotionHeading><TextLink href="/productions/">{cmsText("SetProductionDesignPage","0b3d0346edbea52a","Explore productions")}</TextLink></div></section>

    <section className="produce-section produce-related line-production-related" aria-labelledby="set-production-design-related-title"><Label>{cmsText("SetProductionDesignPage","25d213562dcf4ee5","CONNECTED PRODUCTION SUPPORT")}</Label><MotionHeading as="h2" id="set-production-design-related-title">{cmsText("SetProductionDesignPage","e7ba183db793543a","Related services.")}</MotionHeading><div className="produce-related-grid">{related.map(([number, title, href]) => <a href={href} key={title}><span className="produce-related-number">{number}</span><h3>{title}</h3><span className="line-production-related-link">{cmsText("SetProductionDesignPage","bad37cd6a639ca60","Explore service ")}<Arrow/></span></a>)}</div></section>

    <section className="produce-section produce-questions" aria-labelledby="set-production-design-questions-title"><div><Label>{cmsText("SetProductionDesignPage","d4a2ee65a8fc5955","A FEW THINGS TO KNOW")}</Label><MotionHeading as="h2" id="set-production-design-questions-title">{cmsText("SetProductionDesignPage","fc229f26c2d0a00a","Questions.")}</MotionHeading></div><div className="produce-faqs">{questions.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true"><SiteIcon name="plus" size={16} /></span></summary><p>{answer}</p></details>)}</div></section>

    <section className="produce-section produce-closing" aria-labelledby="set-production-design-closing-title"><Label>{cmsText("SetProductionDesignPage","5f573be5f2ca65fb","YOUR NEXT PRODUCTION")}</Label><div><MotionHeading as="h2" id="set-production-design-closing-title">{cmsText("SetProductionDesignPage","174fe079cc017f89","Building")}<br/><em>{cmsText("SetProductionDesignPage","c556647e0120edfd","a world?")}</em></MotionHeading><div><MotionCopy>{cmsText("SetProductionDesignPage","70b419c445b96c8f","Tell us about the story and its setting. We’ll help bring it to the screen.")}</MotionCopy><CTA href="/contact/?partner=filmmakers">{cmsText("SetProductionDesignPage","364904d00c8092bd","Start a conversation")}</CTA></div></div></section>
  </div></ProduceLayout>;
}
