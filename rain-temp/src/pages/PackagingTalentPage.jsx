import {cmsText,cmsData} from '../siteContent';
import StudioImage from '../StudioImage';
import SiteIcon from '../SiteIcon';
import MotionHeading, { MotionCopy } from '../TextMotion';
import React from 'react';
import EditorialPage from '../EditorialPage';
import { CTA, TextLink } from '../PageUI';
import './produce-page.css';
import './finance-page.css';
import './packaging-talent.css';

const contact = '/contact/?partner=filmmakers';
const packageExample = cmsData(()=>([
  [cmsText("PackagingTalentPage","80ce8674a4b89cb3","Logline & synopsis"),cmsText("PackagingTalentPage","5dc35b796fe22cf9","Ready")], [cmsText("PackagingTalentPage","a7acaaaa1e190fbf","Director"),cmsText("PackagingTalentPage","ed7f74ab2affc6fc","Attached")], [cmsText("PackagingTalentPage","1613aed06a855a9c","Lead cast"),cmsText("PackagingTalentPage","a7b15cd2d066a406","Approached")],
  [cmsText("PackagingTalentPage","274d0f4b89d5af3f","Lookbook & tone"),cmsText("PackagingTalentPage","a20b481d47628156","Ready")], [cmsText("PackagingTalentPage","33707bd33a552c0d","Budget & schedule"),cmsText("PackagingTalentPage","71a699d0473d5ac5","In progress")], [cmsText("PackagingTalentPage","33dd786cdb73ca2f","Supporting cast"),cmsText("PackagingTalentPage","913e1dc80ec26c61","Wishlist")],
]));
const elements = cmsData(()=>([
  [cmsText("PackagingTalentPage","e4eb0a36c3a9282c","Logline & synopsis"),cmsText("PackagingTalentPage","2d86c91a5a18d053","The story, sharp enough to repeat.")],
  [cmsText("PackagingTalentPage","3409ffa866676102","Director"),cmsText("PackagingTalentPage","c95209f1228129e7","Attached, or a clear approach to who directs.")],
  [cmsText("PackagingTalentPage","f1c1974f5cea1ea5","Key cast"),cmsText("PackagingTalentPage","01577e4a726ec6f7","Attached, or a clear casting approach for lead roles.")],
  [cmsText("PackagingTalentPage","aadaa0fe78f2f534","Lookbook & tone"),cmsText("PackagingTalentPage","a8b7c9ec965bd739","How the project will look and feel on screen.")],
  [cmsText("PackagingTalentPage","d9ec00152d4e045e","Producing partner"),cmsText("PackagingTalentPage","7ed39b673e2bb88d","Kemsor as the partner who can deliver it.")],
  [cmsText("PackagingTalentPage","2615ca6c0f869526","Budget & schedule"),cmsText("PackagingTalentPage","aabf75be9e7aa0d5","Honest numbers from Budgeting & Scheduling.")],
  [cmsText("PackagingTalentPage","9027d14f80cbc0ff","Audience & release"),cmsText("PackagingTalentPage","5ec298bbf3ce1465","Who it’s for, and how it reaches them.")],
]));
const statuses = [
  ['Attached','Interest or agreement confirmed in writing'],
  ['Approached','In active conversation, not yet confirmed'],
  ['Wishlist','Ideal names on the wishlist; not yet contacted'],
];
const steps = cmsData(()=>([
  [cmsText("PackagingTalentPage","ed265b3a00095913","Define the role"),cmsText("PackagingTalentPage","291ef4370d397bb7","What the story needs from the director or lead role.")],
  [cmsText("PackagingTalentPage","fa15829bfcd8df9e","Find options"),cmsText("PackagingTalentPage","33f0f3b555eb4726","The Kemsor Talent Network and wider industry relationships.")],
  [cmsText("PackagingTalentPage","26fab80870da7c3d","Approach with the package"),cmsText("PackagingTalentPage","1a812a3d837c9907","Talent sees a serious project, not just a script.")],
  [cmsText("PackagingTalentPage","195b36f237f01b53","Confirm in writing"),cmsText("PackagingTalentPage","53ce86515fb6221f","Interest confirmed, with agreements handled by your legal team.")],
]));
const readers = cmsData(()=>([
  {label:cmsText("PackagingTalentPage","993b39bb1bb62874","FOR FINANCIERS"),title:cmsText("PackagingTalentPage","b9e3a87f228d5a60","Can this be delivered?"),body:cmsText("PackagingTalentPage","cd939844efd0caea","Attached elements, budget, schedule and the producing partner."),link:cmsText("PackagingTalentPage","64f39d1587d95e91","Go to 02 Finance"),href:'/finance/'},
  {label:cmsText("PackagingTalentPage","11c65efbe540990f","FOR PLATFORMS"),title:cmsText("PackagingTalentPage","b4230e1262aafd56","Will our audience watch?"),body:cmsText("PackagingTalentPage","c8865f77505d3678","Audience fit, format, tone and, for series, the season arc.")},
  {label:cmsText("PackagingTalentPage","c49cd8a9688c5529","FOR CO-PRODUCERS"),title:cmsText("PackagingTalentPage","ce89dbe0b9fe2e0a","What’s our role?"),body:cmsText("PackagingTalentPage","6ddad31b72e3f2a0","Contributions, responsibilities and the shared creative goal."),link:cmsText("PackagingTalentPage","d43cefcfa170022d","Go to Co-Production"),href:'/finance/co-production/'},
]));
const audiences = cmsData(()=>([
  cmsText("PackagingTalentPage","a9a17c5e57b43d15","Writers and producers with a strong script and no package yet"),
  cmsText("PackagingTalentPage","91d43490a7d9bcae","Directors building a project around their vision"),
  cmsText("PackagingTalentPage","33c3f43c5e20d4b2","Producers preparing to approach financiers or platforms"),
  <>{cmsText("PackagingTalentPage","381f78fd482b9057","Talent looking for serious projects through the ")}<a href="/find-talent/">{cmsText("PackagingTalentPage","849e73a718b36634","Kemsor Talent Network")}</a></>,
]));
const questions = cmsData(()=>([
  [cmsText("PackagingTalentPage","8565eed3f1df71cb","Can you guarantee a star will attach?"),cmsText("PackagingTalentPage","484bf4a8e4866847","No. No one honestly can. We approach the right people with a serious package and tell you exactly where each conversation stands.")],
  [cmsText("PackagingTalentPage","eeed1140c8be1606","Do you only use the Kemsor Talent Network?"),cmsText("PackagingTalentPage","b1e6e86adee91f77","No. The Talent Network is one source; we also draw on wider industry relationships.")],
  [cmsText("PackagingTalentPage","45871eb883e365a3","How long does packaging take?"),cmsText("PackagingTalentPage","94f3711ede88022d","It depends on the project and on talent availability. We agree a plan and timeline at the start.")],
  [cmsText("PackagingTalentPage","50cb54f34a27f967","Who handles talent agreements?"),cmsText("PackagingTalentPage","f75e936d557b3017","Your legal team handles agreements. We coordinate the conversations and the paperwork flow.")],
]));
function Label({children}) {return <div className="produce-label"><span>{children}</span></div>;}
Label.displayName = 'EditorialLabel';

// Public copy from Kemsor_Develop_02_Packaging_and_Talent_Attachment_Content.docx.pdf.
export default function PackagingTalentPage() {
  return <EditorialPage page="packaging-talent"><div className="produce-hub packaging-page">
    <nav className="produce-breadcrumb" aria-label="Breadcrumb"><a href="/">{cmsText("PackagingTalentPage","15b1d5a53eb9fe0a","Kemsor Studios")}</a><span aria-hidden="true">/</span><a href="/develop/">{cmsText("PackagingTalentPage","94ca97c63c334778","Develop")}</a><span aria-hidden="true">/</span><span aria-current="page">{cmsText("PackagingTalentPage","7329d98c457a3786","Packaging & Talent")}</span></nav>
    <section className="inner-hero produce-hero" aria-labelledby="packaging-title"><figure className="produce-hero-image" aria-hidden="true"><StudioImage mediaSlot="PackagingTalentPage-1" src="/assets/stills/daylight-park-production-1600.webp" srcSet={[640,960,1600].map(w=>`/assets/stills/daylight-park-production-${w}.webp ${w}w`).join(', ')} sizes="100vw" alt="" fetchPriority="high" decoding="async"/></figure><div className="produce-hero-content"><p className="produce-kicker">{cmsText("PackagingTalentPage","252ef7712253578a","01 · DEVELOP · PACKAGING & TALENT")}</p><MotionHeading as="h1" id="packaging-title">{cmsText("PackagingTalentPage","1a724f134feb6331","Packaging & Talent Attachment.")}<span>{cmsText("PackagingTalentPage","69c2c973ac7c310b","Give financiers a reason to say yes.")}</span></MotionHeading><MotionCopy>{cmsText("PackagingTalentPage","47411113a00cbd41","We bring together the director, key cast, visual approach and production plan to help turn a script into a project that partners can assess and back.")}</MotionCopy><div className="produce-actions"><CTA href={contact}>{cmsText("PackagingTalentPage","a0b0bd4814ca469a","Package my project")}</CTA><TextLink href="#whats-in-a-package">{cmsText("PackagingTalentPage","85ac5d57bd4ac4d3","What’s in a package")}</TextLink></div></div><div className="editorial-hero-graphic packaging-example" aria-label="Illustrative Project Package card"><p className="packaging-example-label">{cmsText("PackagingTalentPage","a7f496437bb19f3e","YOUR PROJECT · ILLUSTRATIVE PACKAGE")}</p><ul>{packageExample.map(([title,status])=><li key={title}><span>{title}</span><small data-status={status}>{status}</small></li>)}</ul></div></section>

    <nav className="finance-subnav" aria-label="Development services"><span>{cmsText("PackagingTalentPage","bc69d1afb2b2e4db","01 · DEVELOP")}</span><a href="/develop/">{cmsText("PackagingTalentPage","b38376719ef38b47","Overview")}</a><a href="/develop/story-script/">{cmsText("PackagingTalentPage","6d6037a0bdc1999f","Story & Script")}</a><a href="/develop/packaging-talent/" aria-current="page">{cmsText("PackagingTalentPage","de56f40786a0ade5","Packaging & Talent")}</a><a href="/develop/budgeting-scheduling/">{cmsText("PackagingTalentPage","976d0ad7d0732da6","Budgeting & Scheduling")}</a></nav>

    <section className="produce-section" id="whats-in-a-package" aria-labelledby="elements-title"><Label>{cmsText("PackagingTalentPage","467487e0b2f9adcb","WHAT’S IN A PACKAGE · SEVEN ELEMENTS")}</Label><MotionHeading as="h2" id="elements-title">{cmsText("PackagingTalentPage","bc263f373c394a06","Seven elements")}<br/><em>{cmsText("PackagingTalentPage","06a3da8867a45972","that make a project real.")}</em></MotionHeading><MotionCopy className="packaging-intro">{cmsText("PackagingTalentPage","7ef60b1f53e64539","Financiers and platforms look beyond the script. They need to see how the project will be made and who will make it.")}</MotionCopy><ol className="packaging-elements studio-ledger studio-ledger-numbered">{elements.map(([title,body],i)=><li key={title}><span className="packaging-small">0{i+1}</span><h3>{title}</h3><p>{body}</p></li>)}</ol></section>

    <section className="produce-section" id="attachment-explained" aria-labelledby="attachment-title"><Label>{cmsText("PackagingTalentPage","9305a6729a3b0913","ATTACHMENT, EXPLAINED · HONESTY BUILDS TRUST")}</Label><MotionHeading as="h2" id="attachment-title">{cmsText("PackagingTalentPage","9ff3dd411dbb3be9","Attached, approached, or wishlist.")}<br/><em>{cmsText("PackagingTalentPage","d06f4b051dfbef30","We never blur the line.")}</em></MotionHeading><MotionCopy className="packaging-intro">{cmsText("PackagingTalentPage","48a64bdba8630165","Overstating attachments is the fastest way to lose a financier’s trust. Every name in a Kemsor package carries an honest status.")}</MotionCopy><dl className="packaging-statuses studio-ledger studio-ledger-pairs">{statuses.map(([title,body],i)=><div key={title}><dt><span className="packaging-small">0{i+1}</span>{title}</dt><dd>{body}</dd></div>)}</dl></section>

    <section className="produce-section produce-process" id="talent-attachment" aria-labelledby="process-title"><Label>{cmsText("PackagingTalentPage","61dccecc62af6718","HOW TALENT ATTACHMENT WORKS · FOUR STEPS")}</Label><MotionHeading as="h2" id="process-title">{cmsText("PackagingTalentPage","1e2cfac3385eec53","How we attach")}<br/><em>{cmsText("PackagingTalentPage","e8a34ed1d919a1de","the right people.")}</em></MotionHeading><ol className="produce-steps finance-steps">{steps.map(([title,body],i)=><li key={title}><span className="produce-step-number">0{i+1}</span><h3>{title}</h3><p>{body}</p></li>)}</ol></section>

    <section className="produce-section" id="three-audiences" aria-labelledby="readers-title"><Label>{cmsText("PackagingTalentPage","3a0f3befabb27b1e","ONE PROJECT, THREE AUDIENCES · PACKAGES BUILT FOR WHO’S READING")}</Label><MotionHeading as="h2" id="readers-title">{cmsText("PackagingTalentPage","ecc312beff0e5ea6","The same project,")}<br/><em>{cmsText("PackagingTalentPage","923dfdcef7e09b15","packaged for who’s reading.")}</em></MotionHeading><div className="packaging-readers">{readers.map(reader=><article key={reader.label}><p className="packaging-small">{reader.label}</p><h3>{reader.title}</h3><p>{reader.body}</p>{reader.href&&<TextLink href={reader.href}>{reader.link}</TextLink>}</article>)}</div></section>

    <section className="produce-section" id="who-its-for" aria-labelledby="audiences-title"><Label>{cmsText("PackagingTalentPage","6d4a7e618d2fc284","WHO IT’S FOR · SCRIPT READY, PROJECT NOT YET")}</Label><MotionHeading as="h2" id="audiences-title">{cmsText("PackagingTalentPage","6e2a26b869a94df3","Who it’s for.")}<br/><em>{cmsText("PackagingTalentPage","203624ae956e57a0","When the script is ready.")}</em></MotionHeading><ul className="packaging-audiences">{audiences.map((line,i)=><li key={i}>{line}</li>)}</ul></section>

    {/* No approved project title, format, year or packaging credits supplied. */}
    <section className="produce-section produce-work" id="related-work" aria-labelledby="work-title"><Label>{cmsText("PackagingTalentPage","af07041f04a1cd7f","RELATED WORK")}</Label><div><MotionHeading as="h2" id="work-title">{cmsText("PackagingTalentPage","9fcf822db06304c6","Related work.")}</MotionHeading><TextLink href="/productions/">{cmsText("PackagingTalentPage","c7219fdb29da767a","Explore productions")}</TextLink></div></section>

    <section className="produce-section produce-questions" id="questions" aria-labelledby="questions-title"><div><Label>{cmsText("PackagingTalentPage","043694e2af8f7eba","QUESTIONS · ABOUT PACKAGING")}</Label><MotionHeading as="h2" id="questions-title">{cmsText("PackagingTalentPage","50d113a7f420d8d5","Questions,")}<br/><em>{cmsText("PackagingTalentPage","297f69303e4d5c29","answered honestly.")}</em></MotionHeading></div><div className="produce-faqs">{questions.map(([q,a])=><details key={q}><summary>{q}<span aria-hidden="true"><SiteIcon name="plus" size={16} /></span></summary><p>{a}</p></details>)}</div></section>

    <section className="produce-section produce-closing finance-closing" id="package-your-project" aria-labelledby="closing-title"><Label>{cmsText("PackagingTalentPage","99c8e89d771966d0","01 · DEVELOP")}</Label><div><MotionHeading as="h2" id="closing-title">{cmsText("PackagingTalentPage","3cbc2bfd7c43a9d3","Turn your script")}<br/><em>{cmsText("PackagingTalentPage","12c09d58fd0dc011","into a project.")}</em></MotionHeading><div><MotionCopy>{cmsText("PackagingTalentPage","ca5613b46b2d2767","Bring us a script you believe in. We’ll help build the package that makes others believe too.")}</MotionCopy><div className="produce-actions"><CTA href={contact}>{cmsText("PackagingTalentPage","f0050c3e40d980cb","Package my project")}</CTA><TextLink href="/join/">{cmsText("PackagingTalentPage","e6f9dc4bb3636b29","Join the Talent Network")}</TextLink></div></div></div></section>
  </div></EditorialPage>;
}
