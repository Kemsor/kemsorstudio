import {cmsText,cmsData} from '../siteContent';
import StudioImage from '../StudioImage';
import SiteIcon from '../SiteIcon';
import MotionHeading, { MotionCopy } from '../TextMotion';
import FinanceLayout from '../FinanceLayout';
import React from 'react';
import { CTA, TextLink } from '../PageUI';
import './produce-page.css';
import './finance-page.css';

// Supplied copy: Kemsor_02_Finance_Main_Page_Content.docx.pdf.
const pack = cmsData(()=>([
  [cmsText("FinancePage","7a6eafea1e48ff10","Creative package"), cmsText("FinancePage","3ca47581f389cc0f","Script, treatment and creative vision")],
  [cmsText("FinancePage","201341902c7bc0eb","Budget"), cmsText("FinancePage","6290121b9a8380a6","Top sheet and detail, with contingency")],
  [cmsText("FinancePage","4547fe34cfb46e5a","Sources & gap summary"), cmsText("FinancePage","d67365270e4b81b0","What’s committed, and what’s still needed")],
  [cmsText("FinancePage","062fd9b9da3db4ce","Cash-flow schedule"), cmsText("FinancePage","bceddaf442826189","Money mapped to every production stage")],
  [cmsText("FinancePage","3e148e1425965649","Production plan"), cmsText("FinancePage","9ca5049eac96cf3d","Team, schedule, locations and approach")],
]));
const comparison = cmsData(()=>([
  [cmsText("FinancePage","7a7785eb5eade163","A story worth telling"), cmsText("FinancePage","8c4caf4259905a3c","“What will it cost to make?”"), cmsText("FinancePage","65794934fb43e37e","A budget grounded in production realities, line by line")],
  [cmsText("FinancePage","968bda21a19cf142","A creative vision"), cmsText("FinancePage","d67f6bae69a1c89c","“Can this team deliver it?”"), cmsText("FinancePage","0b1a5d0d4bab0e17","A production plan covering team, locations and approach")],
  [cmsText("FinancePage","49d7fa25f447db94","A sense of momentum"), cmsText("FinancePage","88f15bb6e646f1a0","“When will it be finished?”"), cmsText("FinancePage","eeef4dab0efd4086","A realistic schedule from development to delivery")],
  [cmsText("FinancePage","78eb6e4a3ab309ff","An audience in mind"), cmsText("FinancePage","7a9aecf130467f36","“How does it reach people?”"), cmsText("FinancePage","e2807060742fbd61","A release path through platforms and distributors")],
]));
const services = cmsData(()=>([
  { id: 'finance-structuring', title: cmsText("FinancePage","46dd4fa053ab2fd5","Finance Structuring"), headline: cmsText("FinancePage","5068347c078553f7","Build the money around the story."), description: cmsText("FinancePage","0ae8682734319cbc","How much, from whom, arriving when and paying for what, brought together in one finance plan."), highlights: [cmsText("FinancePage","a64dcda9898007e1","Budget with contingency"), cmsText("FinancePage","1d886a212e47d817","Sources & gap summary"), cmsText("FinancePage","928c7e2cfb7a62f5","Cash-flow schedule by stage")], action: cmsText("FinancePage","20503d71f30417cd","Explore Finance Structuring"), href: '/finance/finance-structuring/' },
  { id: 'co-production', title: cmsText("FinancePage","56109afa79fe9cdf","Co-Production"), headline: cmsText("FinancePage","b34fd0f0d471b00e","Two companies. One project. No confusion."), description: cmsText("FinancePage","9a74f09c66ec3166","Partners agree on contributions, decisions and responsibilities before cameras roll."), highlights: [cmsText("FinancePage","95dd38e9c37f1611","Six questions answered upfront"), cmsText("FinancePage","cb076aa5c50e74a0","Partner Alignment Brief"), cmsText("FinancePage","87e7ecc60290e36b","Kemsor as partner or producer")], action: cmsText("FinancePage","8a7d7e65378b3012","Explore Co-Production"), href: '/finance/co-production/' },
  { id: 'international-co-productions', title: cmsText("FinancePage","943635bfe8cd851e","International Co-Productions"), headline: cmsText("FinancePage","cde7e2331579aee5","One story. Many countries. One plan."), description: cmsText("FinancePage","6a925a391ab6b144","One plan for partners in India and abroad, with production support on the ground in India."), highlights: [cmsText("FinancePage","11c4ee67cf029d8e","Partners into India"), cmsText("FinancePage","559143a45ce4ffe4","Indian projects to the world"), cmsText("FinancePage","c148b2957e25fe54","Reporting across time zones")], action: cmsText("FinancePage","7003c2abb57784fe","Explore International Co-Productions"), href: '/finance/international-co-productions/' },
]));
const creatorBenefits = cmsData(()=>([
  cmsText("FinancePage","2bdc11ed0ae625cb","Shape the script and creative package into a project ready to pitch"),
  cmsText("FinancePage","b3f14b576a8a292e","Build a budget and schedule that stand up to scrutiny"),
  cmsText("FinancePage","eae17fc80875ddb5","Prepare the production plan financiers ask about first"),
  cmsText("FinancePage","66f8047d1377b6a5","Bring financiers and investors into the conversation"),
  cmsText("FinancePage","425053b1a03ea41f","Support you through discussions with clear answers"),
  cmsText("FinancePage","1ba108780c0eed2e","Carry the agreed plan straight into production"),
]));
const financierBenefits = cmsData(()=>([
  cmsText("FinancePage","446f577445137d9d","Projects presented with clear budgets, schedules and plans"),
  cmsText("FinancePage","ce547868838af7e4","Numbers grounded in production realities, not optimism"),
  cmsText("FinancePage","0c436245665da4b3","Risks and decisions shared early, in time to act on them"),
  cmsText("FinancePage","706c1ad7003a9cbc","A production partner that can also run the shoot"),
  cmsText("FinancePage","ddb3df9f79a3d87b","Regular production reporting once cameras roll"),
  cmsText("FinancePage","ad00e9b59cc93442","Features, series, documentaries and short films"),
]));
const steps = cmsData(()=>([
  [cmsText("FinancePage","036dc8f2330fd210","Assess"), cmsText("FinancePage","ddb3093079ad1c7c","We review the project and its creative goals, then assess where it stands and what it needs for financing.")],
  [cmsText("FinancePage","ba8a18bbf54694c3","Structure"), cmsText("FinancePage","6a9f77d7015599e0","Budget, sources, cash flow and production plan, built into one finance-ready pack.")],
  [cmsText("FinancePage","0bff4570e138ccb1","Connect"), cmsText("FinancePage","c9961eca269e336f","Financiers, investors and co-production partners in India or abroad, brought into the conversation with a clear plan.")],
  [cmsText("FinancePage","e129d31f568986bb","Carry through"), cmsText("FinancePage","3afc7c2ecb0e7b3b","The agreed plan carries into pre-production so the team can deliver what was promised.")],
]));
const principles = cmsData(()=>([
  [cmsText("FinancePage","270d172fd161ecc1","Numbers that hold up"), cmsText("FinancePage","3edc27a236561932","Budgets and schedules grounded in production realities, not optimism.")],
  [cmsText("FinancePage","04ac126e77ebcb46","No surprises"), cmsText("FinancePage","72e33d8ea815e38b","Financiers and partners hear about risks and decisions in time to act on them.")],
  [cmsText("FinancePage","571e86cca1e1e393","Story first"), cmsText("FinancePage","1f6e221145239cf2","Every budget line is measured against what the story needs.")],
]));
const questions = cmsData(()=>([
  [cmsText("FinancePage","264b93277d65df7a","Do you guarantee funding for my project?"), cmsText("FinancePage","f28065e015b6e41f","No. Financing depends on the project and the decisions of potential partners. We help prepare the materials and production plan for those discussions.")],
  [cmsText("FinancePage","a7e897fb8cf99969","What do I need before we talk?"), cmsText("FinancePage","9a52fe4ee627ddb1","A script or a strong treatment is enough to start. We help build the rest: the creative package, budget, schedule and production plan.")],
  [cmsText("FinancePage","6b6de1507f1d3484","Can investors approach Kemsor looking for projects?"), cmsText("FinancePage","27b05ef7d81a31e9","Yes. Financiers and investors are welcome to start a conversation about projects in development across features, series, documentaries and short films.")],
  [cmsText("FinancePage","f5be3b5f8a331eff","Which finance service do I need?"), cmsText("FinancePage","b8af956a662f9a5a","Need a plan for how the project is funded? Start with Finance Structuring. Making it with another company? Co-Production. Partners in other countries? International Co-Productions. Not sure? Start a conversation and we’ll point you to the right one.")],
  [cmsText("FinancePage","547bb02ffca77d94","Does Kemsor give investment advice?"), cmsText("FinancePage","e943068992106d7a","No. We coordinate financing and production planning. Investors and creators should take their own financial, legal and tax advice.")],
]));
function Label({ children, end }) {
  return <div className="produce-label"><span>{children}</span>{end && <span>{end}</span>}</div>;
}

Label.displayName = 'EditorialLabel';

export default function FinancePage() {
  return <FinanceLayout page="finance"><div className="produce-hub finance-page">
    <nav className="produce-breadcrumb" aria-label="Breadcrumb"><a href="/">{cmsText("FinancePage","8cc26e523fd76560","Kemsor Studios")}</a><span aria-hidden="true">/</span><a href="/services/">{cmsText("FinancePage","c9e2773f6cffc58b","Capabilities")}</a><span aria-hidden="true">/</span><span aria-current="page">{cmsText("FinancePage","c3671a312e88b6b4","Finance")}</span></nav>

    <section className="inner-hero produce-hero finance-hero" aria-labelledby="finance-title">
      <figure className="produce-hero-image" aria-hidden="true"><StudioImage mediaSlot="FinancePage-1" src="/assets/stills/financing-co-production-1600.webp" srcSet={[640, 960, 1600].map(width => `/assets/stills/financing-co-production-${width}.webp ${width}w`).join(', ')} sizes="100vw" alt="" fetchPriority="high" decoding="async"/></figure>
      <div className="finance-hero-grid"><div className="produce-hero-content"><p className="produce-kicker">{cmsText("FinancePage","fd269c1fe101f34a","02 · FINANCE")}</p><MotionHeading as="h1" id="finance-title">{cmsText("FinancePage","bc44e74fcc086c0f","Finance.")}<span>{cmsText("FinancePage","6f633b7fb5beee02","Make the story")}<br/>{cmsText("FinancePage","7f70c29124fc604e","fundable.")}</span></MotionHeading><MotionCopy>{cmsText("FinancePage","bd0e8575a889c4c1","Financiers need a plan they can assess. Kemsor structures the finance, aligns co-production partners in India and abroad, and brings financiers and investors into the conversation with a clear production plan.")}</MotionCopy><div className="produce-actions"><CTA href="#for-creators">{cmsText("FinancePage","0fe86c3cc97b5707","I’m raising finance")}</CTA><TextLink href="#for-financiers">{cmsText("FinancePage","56dd2d1079accdad","I’m looking to invest")}</TextLink></div></div>
        <aside className="finance-pack" aria-labelledby="finance-pack-title"><p className="finance-pack-label">{cmsText("FinancePage","780d1bf1111a4ff1","FINANCE-READY PACK")}</p><span>{cmsText("FinancePage","d66f084ca69cfc57","Built through Finance Structuring")}</span><MotionHeading as="h2" id="finance-pack-title">{cmsText("FinancePage","93d8c5dd537a0775","Your project title")}</MotionHeading><p className="finance-pack-example">{cmsText("FinancePage","6f1488376ce5f114","Illustrative pack contents")}</p><ol>{pack.map(([title, line], index) => <li key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{line}</p></div></li>)}</ol></aside>
      </div>
    </section>

    <nav className="finance-subnav" aria-label="Finance services"><span>{cmsText("FinancePage","dc1af006facad9f2","02 · FINANCE")}</span><a href="/finance/" aria-current="page">{cmsText("FinancePage","7a7999b6ada033ad","Overview")}</a>{services.map(service => <a href={`#${service.id}`} key={service.id}>{service.title}</a>)}</nav>

    <section className="produce-section finance-gap" aria-labelledby="finance-gap-title"><Label end="WHAT STANDS BETWEEN A SCRIPT AND A GREENLIGHT">{cmsText("FinancePage","30c6d791cdd04ef1","THE FINANCE GAP")}</Label><div className="finance-section-heading"><MotionHeading as="h2" id="finance-gap-title">{cmsText("FinancePage","7db2cfc8ccb9dbf0","A story also needs a production plan.")}<br/><em>{cmsText("FinancePage","c8824f41b13e1f13","We help prepare that plan.")}</em></MotionHeading><MotionCopy>{cmsText("FinancePage","8b04e625c0f6b325","A financier needs to know what the film will cost, how long it will take, who will make it and how it will reach an audience. Clear answers help the conversation move forward.")}</MotionCopy></div><div className="finance-comparison" role="region" aria-label="What a financier asks and how Kemsor prepares your project" tabIndex="0"><table><thead><tr><th scope="col">{cmsText("FinancePage","87ceaa28aea7f3df","You bring")}</th><th scope="col">{cmsText("FinancePage","3c84d7236a344020","A financier asks")}</th><th scope="col">{cmsText("FinancePage","64355b4407f5089b","Kemsor answers with")}</th></tr></thead><tbody>{comparison.map(([bring, ask, answer]) => <tr key={bring}><th scope="row">{bring}</th><td>{ask}</td><td>{answer}</td></tr>)}</tbody></table></div></section>

    <section className="produce-section finance-services" aria-labelledby="finance-services-title"><Label end="THREE WAYS IN">{cmsText("FinancePage","c74e9aa1f51636f3","OUR FINANCE SERVICES")}</Label><div className="finance-section-heading"><MotionHeading as="h2" id="finance-services-title">{cmsText("FinancePage","6f55e1510cb5d97c","Three ways we finance")}<br/><em>{cmsText("FinancePage","6cf1e34381e59a97","stories.")}</em></MotionHeading><MotionCopy>{cmsText("FinancePage","c470505f4aa824e1","Explore finance planning, co-production and international partnerships. Choose the service that fits your project’s current needs.")}</MotionCopy></div><div className="finance-service-grid">{services.map((service, index) => <article className="finance-service-card" id={service.id} key={service.id}><span className="finance-card-index">0{index + 1} / 03</span><p className="finance-service-name">{service.title}</p><h3>{service.headline}</h3><p>{service.description}</p><ul>{service.highlights.map(highlight => <li key={highlight}>{highlight}</li>)}</ul><TextLink href={service.href}>{service.action}</TextLink></article>)}</div></section>

    <section className="produce-section finance-audiences" aria-labelledby="finance-audiences-title"><Label end="CREATORS · FINANCIERS">{cmsText("FinancePage","a6846855088516d7","TWO SIDES OF THE TABLE")}</Label><MotionHeading as="h2" id="finance-audiences-title">{cmsText("FinancePage","3712866ca1fc7f71","Two sides of the table.")}<br/><em>{cmsText("FinancePage","3f9f564e33a0e5d3","One clear plan between them.")}</em></MotionHeading><div className="finance-audience-grid"><article id="for-creators" className="finance-audience-card"><p className="finance-audience-label">{cmsText("FinancePage","89ca5202bd516d1a","FOR CREATORS & PRODUCERS · RAISING FINANCE")}</p><h3>{cmsText("FinancePage","7bc73eee807825cf","You have the story.")}<br/>{cmsText("FinancePage","0479c1b3ca6b7664","We help you make the case.")}</h3><ul>{creatorBenefits.map(line => <li key={line}>{line}</li>)}</ul><CTA href="/contact/?partner=filmmakers">{cmsText("FinancePage","c6f4cb7e68b8533a","Start with your project")}</CTA></article><article id="for-financiers" className="finance-audience-card finance-audience-investors"><p className="finance-audience-label">{cmsText("FinancePage","65191246f0301f6c","FOR FINANCIERS & INVESTORS · LOOKING FOR PROJECTS")}</p><h3>{cmsText("FinancePage","39b70e5bb9299095","You have the capital.")}<br/><span>{cmsText("FinancePage","5d2e893f921d5f27","We bring projects with a plan.")}</span></h3><ul>{financierBenefits.map(line => <li key={line}>{line}</li>)}</ul><CTA href="/contact/?partner=co-producers">{cmsText("FinancePage","67bebc1cd1670a3e","Talk to us about investing")}</CTA></article></div></section>

    <section className="produce-section produce-process finance-process" aria-labelledby="finance-process-title"><Label end="FROM FIRST CONVERSATION TO FIRST SHOOT DAY">{cmsText("FinancePage","81720a5667dd43da","HOW IT WORKS")}</Label><MotionHeading as="h2" id="finance-process-title">{cmsText("FinancePage","bd19e28779bb0600","From first conversation")}<br/><em>{cmsText("FinancePage","b71b6e4dab4b1428","to first shoot day.")}</em></MotionHeading><MotionCopy className="finance-process-intro">{cmsText("FinancePage","6f7d51bb76b55613","Our production team carries the agreed finance plan into preparation and filming, tracking the budget, schedule and commitments made to partners.")}</MotionCopy><ol className="produce-steps finance-steps">{steps.map(([title, line], index) => <li key={title}><span className="produce-step-number">0{index + 1}</span><h3>{title}</h3><p>{line}</p></li>)}</ol></section>

    <section className="produce-section finance-principles" aria-label="Our finance principles">{principles.map(([title, line]) => <article key={title}><h3>{title}</h3><p>{line}</p></article>)}</section>

    {/* No cleared project title, format, year, countries or finance credits supplied. */}
    <section className="produce-section produce-work" aria-labelledby="finance-work-title"><Label>{cmsText("FinancePage","c97360cea2addc53","RELATED WORK · PROJECTS WE’VE HELPED FINANCE")}</Label><div><MotionHeading as="h2" id="finance-work-title">{cmsText("FinancePage","6a6614cc9b1751e8","Related work.")}</MotionHeading><TextLink href="/productions/">{cmsText("FinancePage","3a97545e05b0ad86","Explore productions")}</TextLink></div></section>

    <section className="produce-section produce-questions finance-questions" aria-labelledby="finance-questions-title"><div><Label>{cmsText("FinancePage","68c175702a78f980","QUESTIONS · STRAIGHT ANSWERS ABOUT MONEY")}</Label><MotionHeading as="h2" id="finance-questions-title">{cmsText("FinancePage","c305b5fa42687dcc","Straight answers")}<br/><em>{cmsText("FinancePage","29b6564db179b503","about money.")}</em></MotionHeading></div><div className="produce-faqs">{questions.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true"><SiteIcon name="plus" size={16} /></span></summary><p>{answer}</p></details>)}</div></section>

    <section className="produce-section produce-closing finance-closing" aria-labelledby="finance-closing-title"><Label>{cmsText("FinancePage","21c8c43c9123a901","02 · FINANCE")}</Label><div><MotionHeading as="h2" id="finance-closing-title">{cmsText("FinancePage","e0ee9a67b3a9e8d1","Make the story")}<br/><em>{cmsText("FinancePage","d42f451f48db2695","fundable.")}</em></MotionHeading><div><MotionCopy>{cmsText("FinancePage","903d20f1aec9c6ab","Raising finance or looking for projects, it starts with a conversation. We’ll show you what a clear plan looks like.")}</MotionCopy><div className="produce-actions"><CTA href="#for-creators">{cmsText("FinancePage","2fa383e1f7267977","I’m raising finance")}</CTA><TextLink href="#for-financiers">{cmsText("FinancePage","fd747ce2bef65c06","I’m looking to invest")}</TextLink></div></div></div><MotionCopy className="finance-disclaimer">{cmsText("FinancePage","0472d6b4c0271280","Kemsor coordinates financing and co-production planning. It does not provide investment, legal or tax advice, and does not guarantee financing or returns.")}</MotionCopy></section>
  </div></FinanceLayout>;
}
