import {cmsText,cmsData} from '../siteContent';
import StudioImage from '../StudioImage';
import SiteIcon from '../SiteIcon';
import MotionHeading, { MotionCopy } from '../TextMotion';
import ProduceLayout from '../ProduceLayout';
import React from 'react';
import { Arrow, CTA, TextLink } from '../PageUI';
import './produce-page.css';
import './line-production-page.css';

// Copy: Kemsor_Produce_04_Crew_and_Equipment.docx.pdf.
// Planning/sourcing copy does not assert equipment ownership or rental arrangements.
const included = cmsData(()=>([
  [cmsText("CrewEquipmentPage","89071026cad0a5b7","Crew hiring"), cmsText("CrewEquipmentPage","80fa3c0e2adabed1","Crew recruited across departments to fit the format, scale and schedule.")],
  [cmsText("CrewEquipmentPage","75bdd24d1e36f558","Heads of department"), cmsText("CrewEquipmentPage","a7df8e4668d8f13c","Key creative and technical leads matched to the director’s vision.")],
  [cmsText("CrewEquipmentPage","cb7ea9395ebc0e10","Equipment planning"), cmsText("CrewEquipmentPage","4b004838bf790ae4","Camera, lighting, grip and sound needs planned against the shot list.")],
  [cmsText("CrewEquipmentPage","2147cb10a2f57b02","Equipment sourcing"), cmsText("CrewEquipmentPage","815c4f548ac678b2","Kit sourced to fit the budget, with clear tracking from pick-up to return.")],
  [cmsText("CrewEquipmentPage","444ff875f8b89e29","Crew management"), cmsText("CrewEquipmentPage","bb89b23dae88bd75","Calls, hours and welfare managed fairly through the shoot.")],
  [cmsText("CrewEquipmentPage","473be0737b8883b9","Wrap & returns"), cmsText("CrewEquipmentPage","fbf54fe4cb9d1bf1","Equipment returned, accounts closed and crew wrapped properly.")],
]));
const steps = cmsData(()=>([
  [cmsText("CrewEquipmentPage","3e8a3845d5d7364e","Understand the shoot"), cmsText("CrewEquipmentPage","06f97cbd8bf791b0","Format, scale, style and schedule set what the crew and kit need to be.")],
  [cmsText("CrewEquipmentPage","a1d278ba960f9872","Assemble"), cmsText("CrewEquipmentPage","1d7e2e7924ac8426","Heads of department first, then the wider crew and the equipment plan.")],
  [cmsText("CrewEquipmentPage","c0dee68f6a9b9cfd","Manage"), cmsText("CrewEquipmentPage","4a47ad9caa7cad31","Crew and kit managed day to day, with issues raised early.")],
  [cmsText("CrewEquipmentPage","7ac0e7f2c5684ac9","Wrap"), cmsText("CrewEquipmentPage","5ed32c095ae2f387","Equipment returned and the crew wrapped with records in order.")],
]));
const audiences = cmsData(()=>([
  [cmsText("CrewEquipmentPage","d3979040ad3a8a0f","Producers"), cmsText("CrewEquipmentPage","c784bd88f37f5ad4","Producers building a crew for a film, series, documentary or short")],
  [cmsText("CrewEquipmentPage","b16cc664b1cfb50e","Productions"), cmsText("CrewEquipmentPage","9633be8754902025","Productions that need equipment planned and managed within budget")],
  [cmsText("CrewEquipmentPage","19f6f85ddde98be2","International productions"), cmsText("CrewEquipmentPage","d17249971d5d8557","International productions filming in India")],
]));
const related = cmsData(()=>([
  ['01', cmsText("CrewEquipmentPage","38e1fff40257eb91","Line Production & Production Management"), '/produce/line-production/'],
  ['02', cmsText("CrewEquipmentPage","6a50ee0eee4bdebc","Shooting & On-Location Production"), '/produce/shooting-on-location/'],
  ['03', cmsText("CrewEquipmentPage","4362ac2eef9f07b6","Casting & Talent Coordination"), '/produce/casting/'],
  ['04', cmsText("CrewEquipmentPage","28fd260a08a522dd","India Production Services"), '/india-production-services/'],
]));
const questions = cmsData(()=>([
  [cmsText("CrewEquipmentPage","f39acc8c95799e98","Can you crew just one department?"), cmsText("CrewEquipmentPage","c880debf03564c56","Yes. We can provide a full crew or specific roles to suit the project.")],
  [cmsText("CrewEquipmentPage","a630d90dd1ce78ae","Do you supply equipment directly?"), cmsText("CrewEquipmentPage","74aed47c20ec2248","We plan and source equipment to suit the shoot and budget, and manage it through to return.")],
  [cmsText("CrewEquipmentPage","e17960902660a5e9","Can crew members join Kemsor’s network?"), cmsText("CrewEquipmentPage","3d01b6ee2c8e8768","Yes. Crew can join the Kemsor Talent Network to be considered for future productions.")],
]));
function Label({ children, end }) {
  return <div className="produce-label"><span>{children}</span>{end && <span>{end}</span>}</div>;
}

Label.displayName = 'EditorialLabel';

export default function CrewEquipmentPage() {
  return <ProduceLayout page="crew-equipment"><div className="produce-hub crew-equipment-page">
    <nav className="produce-breadcrumb" aria-label="Breadcrumb"><a href="/">{cmsText("CrewEquipmentPage","68bb95ced15ae7a4","Kemsor Studios")}</a><span aria-hidden="true">/</span><a href="/produce/">{cmsText("CrewEquipmentPage","ec896a76decd9e0c","Produce")}</a><span aria-hidden="true">/</span><span aria-current="page">{cmsText("CrewEquipmentPage","75fbf561cdad6010","Crew & Equipment")}</span></nav>

    <section className="inner-hero produce-hero produce-hero-light line-production-hero" aria-labelledby="crew-equipment-title"><figure className="produce-hero-image" aria-hidden="true"><StudioImage mediaSlot="CrewEquipmentPage-1" src="/assets/stills/daylight-park-production-1600.webp" srcSet={[640, 960, 1600].map(width => `/assets/stills/daylight-park-production-${width}.webp ${width}w`).join(', ')} sizes="100vw" alt="" fetchPriority="high" decoding="async"/></figure><div className="produce-hero-content"><p className="produce-kicker">{cmsText("CrewEquipmentPage","7b2e1b41cda67c20","PRODUCE · PRE-PRODUCTION")}</p><MotionHeading as="h1" id="crew-equipment-title">{cmsText("CrewEquipmentPage","e5228a33c95f88c0","Crew & Equipment.")}<span>{cmsText("CrewEquipmentPage","858980e33236ccb7","Sized to the shoot.")}</span></MotionHeading><MotionCopy>{cmsText("CrewEquipmentPage","2350a1d8deea06dc","Kemsor assembles crews, plans equipment to suit your story, schedule and budget, and manages both through the shoot.")}</MotionCopy><div className="produce-actions"><CTA href="/contact/?partner=filmmakers">{cmsText("CrewEquipmentPage","bd9b332fdd2fd6a0","Talk to us about crew")}</CTA><TextLink href="#crew-equipment-work">{cmsText("CrewEquipmentPage","efd4cc13438d8bde","See related work")}</TextLink></div></div><div className="produce-hero-foot"><a href="/produce/"><SiteIcon name="arrow-left" size={16} />{cmsText("CrewEquipmentPage","415516744523efe3"," Back to Produce")}</a><a href="#crew-equipment-included">{cmsText("CrewEquipmentPage","64b34552c34daa99","What’s included ")}<span aria-hidden="true"><SiteIcon name="arrow-down" size={16} /></span></a></div></section>

    <section className="produce-section produce-intro" aria-labelledby="crew-equipment-why"><div><Label>{cmsText("CrewEquipmentPage","2c13107107399c32","WHY IT MATTERS")}</Label><MotionHeading as="h2" id="crew-equipment-why">{cmsText("CrewEquipmentPage","30a5a90da8e1fb05","The right people.")}<br/><em>{cmsText("CrewEquipmentPage","2268a06c32360e5e","The right kit.")}</em></MotionHeading></div><div className="produce-copy"><MotionCopy>{cmsText("CrewEquipmentPage","98e15713421a9d28","The crew and equipment need to suit the shoot. Too much or too little kit can cost time, money and shots.")}</MotionCopy><MotionCopy>{cmsText("CrewEquipmentPage","3bb11bec2db57cd2","We match people and equipment to the story and the scale of the shoot, from a compact short to a long-running series, and keep both working well until wrap.")}</MotionCopy></div></section>

    <section className="produce-section line-production-included" id="crew-equipment-included" aria-labelledby="crew-equipment-included-title"><Label end="FROM FIRST CALL TO FINAL RETURN">{cmsText("CrewEquipmentPage","a745b97b82632f37","WHAT’S INCLUDED")}</Label><MotionHeading as="h2" id="crew-equipment-included-title">{cmsText("CrewEquipmentPage","a8ee98f31b47e62f","What’s included.")}</MotionHeading><div className="line-production-scope"><dl className="line-production-deliverables studio-ledger studio-ledger-pairs">{included.map(([title, description], index) => <div key={title}><dt>{title}</dt><dd>{description}</dd></div>)}</dl><figure className="line-production-planning"><StudioImage mediaSlot="CrewEquipmentPage-2" src="/assets/services/camera-detail.webp" alt={"Illustrative close-up of professional cinema camera equipment"} width="1672" height="941" loading="lazy" decoding="async"/><figcaption><span>{cmsText("CrewEquipmentPage","8e5f1bb4cbca0942","MATCHED TO THE SHOT LIST")}</span><MotionCopy>{cmsText("CrewEquipmentPage","7a3e67ebb6589d1d","Camera, lighting, grip and sound needs planned against the shot list.")}</MotionCopy></figcaption></figure></div></section>

    <section className="produce-section produce-process" aria-labelledby="crew-equipment-process-title"><Label end="ASSEMBLE → MANAGE → WRAP">{cmsText("CrewEquipmentPage","c1b7d1d5c9dc388d","HOW WE WORK")}</Label><MotionHeading as="h2" id="crew-equipment-process-title">{cmsText("CrewEquipmentPage","961b570a374ba235","How we work.")}</MotionHeading><ol className="produce-steps line-production-steps">{steps.map(([title, description], index) => <li key={title}><h3>{title}</h3><p>{description}</p></li>)}</ol></section>

    <section className="produce-section produce-audiences" aria-labelledby="crew-equipment-audiences-title"><div><Label>{cmsText("CrewEquipmentPage","7c816bcfcd0456e8","WHO IT’S FOR")}</Label><MotionHeading as="h2" id="crew-equipment-audiences-title">{cmsText("CrewEquipmentPage","578955b29d3b034b","Who it’s for.")}</MotionHeading><div className="produce-audience-mark" aria-hidden="true"><span>{cmsText("CrewEquipmentPage","7008290ba0ef817c","THE FORMAT")}</span><i>+</i><span>{cmsText("CrewEquipmentPage","1403b80d095ae3b8","THE SCALE")}</span><i>+</i><span>{cmsText("CrewEquipmentPage","5eedec6786429384","THE SCHEDULE")}</span></div></div><ul>{audiences.map(([title, description], index) => <li key={title}><div><h3>{title}</h3><p>{description}</p></div></li>)}</ul></section>

    {/* No confirmed project title, format, year or crew/equipment credit supplied. */}
    <section className="produce-section produce-work" id="crew-equipment-work" aria-labelledby="crew-equipment-work-title"><Label>{cmsText("CrewEquipmentPage","d5b8ac5425328a86","RELATED WORK")}</Label><div><MotionHeading as="h2" id="crew-equipment-work-title">{cmsText("CrewEquipmentPage","c99b9bc275a0c686","Related work.")}</MotionHeading><TextLink href="/productions/">{cmsText("CrewEquipmentPage","05bfa2fb2559ae77","Explore productions")}</TextLink></div></section>

    <section className="produce-section produce-related line-production-related" aria-labelledby="crew-equipment-related-title"><Label>{cmsText("CrewEquipmentPage","9c2cfc8db9088a3a","CONNECTED PRODUCTION SUPPORT")}</Label><MotionHeading as="h2" id="crew-equipment-related-title">{cmsText("CrewEquipmentPage","1131b10a9992ec3f","Related services.")}</MotionHeading><div className="produce-related-grid">{related.map(([number, title, href]) => <a href={href} key={title}><h3>{title}</h3><span className="line-production-related-link">{cmsText("CrewEquipmentPage","badb17c68eac1489","Explore service ")}<Arrow/></span></a>)}</div></section>

    <section className="produce-section produce-questions" aria-labelledby="crew-equipment-questions-title"><div><Label>{cmsText("CrewEquipmentPage","22039be56a0dcbce","A FEW THINGS TO KNOW")}</Label><MotionHeading as="h2" id="crew-equipment-questions-title">{cmsText("CrewEquipmentPage","4e3490fa56881e7a","Questions.")}</MotionHeading></div><div className="produce-faqs">{questions.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true"><SiteIcon name="plus" size={16} /></span></summary><p>{answer}</p>{question === 'Can crew members join Kemsor’s network?' && <p><TextLink href="/join/">{cmsText("CrewEquipmentPage","cd2c6174f1785c8b","Join the Kemsor Talent Network")}</TextLink></p>}</details>)}</div></section>
  </div></ProduceLayout>;
}
