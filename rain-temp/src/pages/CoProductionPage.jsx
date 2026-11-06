import {cmsText,cmsData} from '../siteContent';
import StudioImage from '../StudioImage';
import SiteIcon from '../SiteIcon';
import MotionHeading, { MotionCopy } from '../TextMotion';
import React from 'react';
import FinanceLayout from '../FinanceLayout';
import { CTA, TextLink } from '../PageUI';
import './produce-page.css';
import './finance-page.css';
import './co-production.css';

const contact = '/contact/?partner=co-producers';
const benefits = cmsData(()=>([
  [cmsText("CoProductionPage","35f9beac3a23a045","Shared cost"), cmsText("CoProductionPage","e3ede02c39e5508e","No single partner carries the full budget.")],
  [cmsText("CoProductionPage","aecbeb64e5985bee","Shared risk"), cmsText("CoProductionPage","b16cba50cffb6b64","Exposure is spread across partners who all want the project to succeed.")],
  [cmsText("CoProductionPage","2eb9866252642ad5","Combined strengths"), cmsText("CoProductionPage","be7b93d5c8881e8e","One partner’s creative vision, another’s production capacity, another’s route to audiences.")],
  [cmsText("CoProductionPage","e184fa980f8a6d5b","Wider reach"), cmsText("CoProductionPage","f132db7a80e0c74b","Each partner brings its own talent, locations, networks and audiences.")],
]));
const alignment = cmsData(()=>([
  [cmsText("CoProductionPage","eb240643f47e137d","Who has the final creative say?"), cmsText("CoProductionPage","30e5fe4e695b6c8a","How creative decisions are made, and who makes the final call.")],
  [cmsText("CoProductionPage","cdc673f08b50f8c1","Who contributes what?"), cmsText("CoProductionPage","8b464318a1d0c05e","Cash, crew, locations, equipment, post or services, with each contribution itemised.")],
  [cmsText("CoProductionPage","42933c1c2f355307","Who runs the production day-to-day?"), cmsText("CoProductionPage","787e98c9ed544f6f","One clear production lead, so the set never has two bosses.")],
  [cmsText("CoProductionPage","fe091740511264a2","How are decisions escalated?"), cmsText("CoProductionPage","cce923bd7cb952d7","A simple path for disagreements, agreed while everyone is still friends.")],
  [cmsText("CoProductionPage","b8b7d3d457450cfc","How are credits presented?"), cmsText("CoProductionPage","061324c40642c59a","Credits agreed early, so they never become a dispute later.")],
  [cmsText("CoProductionPage","de439c4204ce3a51","Who handles delivery and release?"), cmsText("CoProductionPage","7020603aca75e883","Responsibility for deliverables, platforms and distributors made clear.")],
]));
const brief = cmsData(()=>([
  [cmsText("CoProductionPage","a11d6856b650fe43","Shared creative vision"), cmsText("CoProductionPage","a9baaf4aa1632ff4","What the project is, and who it is for")],
  [cmsText("CoProductionPage","57e3348ecb8727a9","Contributions matrix"), cmsText("CoProductionPage","ad176269a6d8240d","Who brings cash, crew, locations and services")],
  [cmsText("CoProductionPage","4729223181a141b0","Responsibilities"), cmsText("CoProductionPage","d0b73bbddc55f10e","Who leads production, post and delivery")],
  [cmsText("CoProductionPage","1fa8c172b8c353f3","Decision path"), cmsText("CoProductionPage","ac526256f31e0c88","How choices are made and escalated")],
  [cmsText("CoProductionPage","c0239eae96cc103b","Budget & schedule"), cmsText("CoProductionPage","9edd11252d527460","One budget and one timeline for all partners")],
  [cmsText("CoProductionPage","642af8a00775e89d","Release plan"), cmsText("CoProductionPage","a538facc43161129","How the project reaches its audience")],
]));
const roles = cmsData(()=>([
  [cmsText("CoProductionPage","422796733207ee3e","Co-producing partner"), cmsText("CoProductionPage","ecb7a506f363c7c0","Kemsor joins as a partner, sharing in the making of the project.")],
  [cmsText("CoProductionPage","0de24f83de0fa865","Production partner"), cmsText("CoProductionPage","09d565ce90b397c4","Kemsor runs production for the partnership, including line production, crew, locations and the shoot.")],
  [cmsText("CoProductionPage","d089a0893ed8d8c6","Alignment partner"), cmsText("CoProductionPage","8237c135df6e5b7f","Kemsor brings partners together and keeps creative and production goals aligned.")],
]));
const steps = cmsData(()=>([
  [cmsText("CoProductionPage","c581dbe4dd7a48aa","Match"), cmsText("CoProductionPage","cb53c85336b34ba5","Find partners whose strengths complete the project.")],
  [cmsText("CoProductionPage","9b6955978ea26fb2","Align"), cmsText("CoProductionPage","4e4010ef1df6cff2","Answer the six questions together.")],
  [cmsText("CoProductionPage","ba150d9a312a9d09","Document"), cmsText("CoProductionPage","720f1f5dd1c54fbd","Prepare the Partner Alignment Brief for each partner’s lawyers.")],
  [cmsText("CoProductionPage","5a36c3aca6faa058","Produce"), cmsText("CoProductionPage","0a61d54243508994","Carry the agreed plan into 03 Produce, with clear reporting to every partner.")],
]));
const audiences = cmsData(()=>([
  cmsText("CoProductionPage","28639eaa815ccb04","Producers looking for a partner to share a project"),
  cmsText("CoProductionPage","ba696f961c657737","Studios and production companies combining strengths"),
  cmsText("CoProductionPage","8c36ef50ef2251e6","Platforms developing projects with production partners"),
  cmsText("CoProductionPage","dd8ad6950a4e5520","Financiers who want clarity on who is responsible for what"),
]));
const questions = cmsData(()=>([
  [cmsText("CoProductionPage","36e9402ec86643cb","We already have a partner. Can you still help?"), cmsText("CoProductionPage","18f29bb751e235c9","Yes. We can align an existing partnership, prepare the Partner Alignment Brief, or run the production for it.")],
  [cmsText("CoProductionPage","d8fb360887e18fee","Do you draft co-production agreements?"), cmsText("CoProductionPage","a6fbe6e2872f11ca","No. Your lawyers draft the agreement. We prepare the production-side terms they work from: budget, schedule, contributions and responsibilities.")],
  [cmsText("CoProductionPage","bfd3ba8d3db2a5a0","Can Kemsor be our co-production partner?"), cmsText("CoProductionPage","ee324f6290cc37c9","Yes, depending on the project. Tell us about it, and we’ll discuss the role that fits.")],
  [cmsText("CoProductionPage","39fc253c0fd14e2b","Is this for international partners too?"), <>{cmsText("CoProductionPage","3fd19e060948355c","For partners in different countries, see ")}<a href="/finance/international-co-productions/">{cmsText("CoProductionPage","5962faed14457af3","International Co-Productions")}</a>.</>],
]));
function Label({children}) {return <div className="produce-label"><span>{children}</span></div>;}
Label.displayName = 'EditorialLabel';

// Public copy from Kemsor_Finance_02_Co-Production.docx.pdf.
export default function CoProductionPage() {
  return <FinanceLayout page="co-production"><div className="produce-hub co-production-page">
    <nav className="produce-breadcrumb" aria-label="Breadcrumb"><a href="/">{cmsText("CoProductionPage","4e21a9b16e17add3","Kemsor Studios")}</a><span aria-hidden="true">/</span><a href="/finance/">{cmsText("CoProductionPage","70452370347ef986","Finance")}</a><span aria-hidden="true">/</span><span aria-current="page">{cmsText("CoProductionPage","a13c484b8a45ab1b","Co-Production")}</span></nav>
    <section className="inner-hero produce-hero" aria-labelledby="co-production-title"><figure className="produce-hero-image" aria-hidden="true"><StudioImage mediaSlot="CoProductionPage-1" src="/assets/stills/daylight-snow-production-1600.webp" srcSet={[640,960,1600].map(w=>`/assets/stills/daylight-snow-production-${w}.webp ${w}w`).join(', ')} sizes="100vw" alt="" fetchPriority="high" decoding="async"/></figure><div className="produce-hero-content"><p className="produce-kicker">{cmsText("CoProductionPage","204f8daa55ee0f9f","02 · FINANCE · CO-PRODUCTION")}</p><MotionHeading as="h1" id="co-production-title">{cmsText("CoProductionPage","cf145001dc3938e4","Co-Production.")}<span>{cmsText("CoProductionPage","9caef0949af44fdc","Two companies. One project. No confusion.")}</span></MotionHeading><MotionCopy>{cmsText("CoProductionPage","a0ff157af7252666","Co-producing shares the cost, the risk, and the strengths of each partner. It works when everyone agrees before cameras roll on who brings what, who decides what, and who does what. Kemsor makes that agreement clear.")}</MotionCopy><div className="produce-actions"><CTA href={contact}>{cmsText("CoProductionPage","c9bcf8c0223736e9","Explore a co-production")}</CTA><TextLink href="#partner-alignment">{cmsText("CoProductionPage","023b7e0de633e606","I already have a partner")}</TextLink></div></div></section>

    <section className="produce-section" id="why-co-produce" aria-labelledby="benefits-title"><Label>{cmsText("CoProductionPage","170cee37f9709fa5","WHY CO-PRODUCE · SHARED STRENGTHS")}</Label><MotionHeading as="h2" id="benefits-title">{cmsText("CoProductionPage","c6bdca071ddef524","Share the load.")}<br/><em>{cmsText("CoProductionPage","b8b2e263ca5caae6","Multiply the strengths.")}</em></MotionHeading><div className="coproduction-benefits">{benefits.map(([title,body],i)=><article key={title}><h3>{title}</h3><p>{body}</p></article>)}</div></section>

    <section className="produce-section" id="partner-alignment" aria-labelledby="alignment-title"><Label>{cmsText("CoProductionPage","d343ce4897bd6173","THE ALIGNMENT · WHERE CO-PRODUCTIONS SUCCEED OR FAIL")}</Label><MotionHeading as="h2" id="alignment-title">{cmsText("CoProductionPage","52c368a4335bcd3e","Most co-production problems")}<br/><em>{cmsText("CoProductionPage","823ec2b64d7acd6c","start as unanswered questions.")}</em></MotionHeading><MotionCopy className="coproduction-intro">{cmsText("CoProductionPage","f2b1375fd9f24f36","We help partners answer these six questions clearly and in writing, before the first rupee is spent.")}</MotionCopy><dl className="line-production-deliverables studio-ledger studio-ledger-pairs">{alignment.map(([title,body])=><div key={title}><dt>{title}</dt><dd>{body}</dd></div>)}</dl></section>

    <section className="produce-section" id="partner-alignment-brief" aria-labelledby="brief-title"><Label>{cmsText("CoProductionPage","8001dd82672588ec","WHAT WE PREPARE")}</Label><MotionHeading as="h2" id="brief-title">{cmsText("CoProductionPage","eae3fb5c8fa181ed","One document")}<br/><em>{cmsText("CoProductionPage","e8433fa9a193e63f","every partner signs off on.")}</em></MotionHeading><MotionCopy className="coproduction-intro">{cmsText("CoProductionPage","c56117d2c5800d3e","Kemsor prepares a Partner Alignment Brief that your lawyers can use as the production-side basis for the co-production agreement.")}</MotionCopy><div className="coproduction-brief"><div className="coproduction-document-heading"><span>{cmsText("CoProductionPage","9678a479a103ec98","PARTNER ALIGNMENT BRIEF")}</span></div><ol>{brief.map(([title,body],i)=><li key={title}><div><h3>{title}</h3><p>{body}</p></div></li>)}</ol></div></section>

    <section className="produce-section" id="our-role" aria-labelledby="roles-title"><Label>{cmsText("CoProductionPage","34ecafde5d9779e1","OUR ROLE · SHAPED TO THE PROJECT")}</Label><MotionHeading as="h2" id="roles-title">{cmsText("CoProductionPage","40d9673f4466c7d2","Partner, producer")}<br/><em>{cmsText("CoProductionPage","d3022dea69c8a008","or the one who aligns everyone.")}</em></MotionHeading><div className="coproduction-roles">{roles.map(([title,body],i)=><article key={title}><h3>{title}</h3><p>{body}</p></article>)}</div></section>

    <section className="produce-section produce-process" id="how-it-works" aria-labelledby="process-title"><Label>{cmsText("CoProductionPage","3e54fecaaa6d11f6","HOW IT WORKS")}</Label><MotionHeading as="h2" id="process-title">{cmsText("CoProductionPage","05fed3f4177d2b3c","How it works.")}</MotionHeading><ol className="produce-steps finance-steps">{steps.map(([title,body],i)=><li key={title}><h3>{title}</h3><p>{body}</p></li>)}</ol><div className="coproduction-production-link"><TextLink href="/produce/">{cmsText("CoProductionPage","a196928dc50543e6","Explore 03 Produce")}</TextLink></div></section>

    <section className="produce-section" id="who-its-for" aria-labelledby="audiences-title"><Label>{cmsText("CoProductionPage","47b0dba7ee1b022d","WHO IT’S FOR")}</Label><MotionHeading as="h2" id="audiences-title">{cmsText("CoProductionPage","7703b7b6aee10704","Who it’s for.")}</MotionHeading><ul className="coproduction-audiences">{audiences.map(line=><li key={line}>{line}</li>)}</ul></section>

    {/* No approved project title, format, partners or co-production credits supplied. */}
    <section className="produce-section produce-work" id="related-work" aria-labelledby="work-title"><Label>{cmsText("CoProductionPage","97bc9dda899e9dd6","RELATED WORK")}</Label><div><MotionHeading as="h2" id="work-title">{cmsText("CoProductionPage","4cae29bf421366b1","Related work.")}</MotionHeading><TextLink href="/productions/">{cmsText("CoProductionPage","61481b7d48571f3a","Explore productions")}</TextLink></div></section>

    <section className="produce-section produce-questions" id="questions" aria-labelledby="questions-title"><div><Label>{cmsText("CoProductionPage","01d7974ba44b69ac","QUESTIONS")}</Label><MotionHeading as="h2" id="questions-title">{cmsText("CoProductionPage","63c0abe8b60de551","Questions.")}</MotionHeading></div><div className="produce-faqs">{questions.map(([q,a])=><details key={q}><summary>{q}<span aria-hidden="true"><SiteIcon name="plus" size={16} /></span></summary><p>{a}</p></details>)}</div></section>

    <section className="produce-section produce-closing finance-closing inner-closing" id="explore-co-production" aria-labelledby="closing-title"><Label>{cmsText("CoProductionPage","f74d4a70aa50fb00","CO-PRODUCTION")}</Label><div><MotionHeading as="h2" id="closing-title">{cmsText("CoProductionPage","da3dec9e7abec727","Better together")}<br/><em>{cmsText("CoProductionPage","359a444d87c4c5df","if it’s clear.")}</em></MotionHeading><div><MotionCopy>{cmsText("CoProductionPage","123b5c2f5c11c769","Tell us about the project and the partners involved. We’ll help make the partnership work.")}</MotionCopy><CTA href={contact}>{cmsText("CoProductionPage","3174f7b7beed4863","Explore a co-production")}</CTA></div></div></section>
  </div></FinanceLayout>;
}
