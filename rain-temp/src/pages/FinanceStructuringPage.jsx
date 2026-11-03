import {cmsText,cmsData} from '../siteContent';
import StudioImage from '../StudioImage';
import SiteIcon from '../SiteIcon';
import MotionHeading, { MotionCopy } from '../TextMotion';
import React from 'react';
import FinanceLayout from '../FinanceLayout';
import { CTA, TextLink } from '../PageUI';
import './produce-page.css';
import './finance-page.css';
import './finance-structuring.css';

const contact = '/contact/?partner=filmmakers';
const questionsPlan = cmsData(()=>([
  [cmsText("FinanceStructuringPage","4fc1a3d86156f977","How much?"), cmsText("FinanceStructuringPage","e2ee3aeff76075df","The true cost of the story, not a hopeful one"), cmsText("FinanceStructuringPage","ecf217b22c4cca77","A budget grounded in production realities, with contingency built in")],
  [cmsText("FinanceStructuringPage","29cd37252c96ca96","From whom?"), cmsText("FinanceStructuringPage","82658555070e336c","Which partners fund which part of the project"), cmsText("FinanceStructuringPage","e591fb25c383bccc","A sources plan covering investors, co-production partners, platforms and in-kind contributions")],
  [cmsText("FinanceStructuringPage","455b51f201123faa","When?"), cmsText("FinanceStructuringPage","9e47cd49c70df970","Money must arrive before the spend it covers"), cmsText("FinanceStructuringPage","63ed06aaf2c9200b","A cash-flow schedule mapped to each production stage")],
  [cmsText("FinanceStructuringPage","17396e689ba60809","For what?"), cmsText("FinanceStructuringPage","8b65c083e59f69bd","Every rupee traceable to the work on screen"), cmsText("FinanceStructuringPage","1b356447dc468b83","A reporting framework that shows spend against plan")],
]));
const stages = cmsData(()=>([
  [cmsText("FinanceStructuringPage","63525e5cb082e010","Development"), cmsText("FinanceStructuringPage","8ee980fa0fa49bd6","Script, packaging, early creative work"), cmsText("FinanceStructuringPage","f40f621148983c16","Who funds the work before the project is greenlit")],
  [cmsText("FinanceStructuringPage","f013f5ff91fda574","Pre-production"), cmsText("FinanceStructuringPage","6925c66f3e2673cd","Casting, crew, locations, design, deposits"), cmsText("FinanceStructuringPage","d1d073c4897ed6b1","Commitments in place before deposits fall due")],
  [cmsText("FinanceStructuringPage","6897942479ffa337","Production"), cmsText("FinanceStructuringPage","86a75d4e42aaf806","The shoot, usually the largest single spend"), cmsText("FinanceStructuringPage","9298a9dbb7aa7383","Cash ready for every shoot week, with contingency")],
  [cmsText("FinanceStructuringPage","0443187c27e38a54","Post-production"), cmsText("FinanceStructuringPage","14a5d211b2832e54","Edit, sound, colour, VFX, deliverables"), cmsText("FinanceStructuringPage","93a3c687817b3085","Funds held back so the film can actually be finished")],
  [cmsText("FinanceStructuringPage","7a27c4d29826abe5","Release"), cmsText("FinanceStructuringPage","ed538cea127fb5a2","Delivery to platforms and distributors"), cmsText("FinanceStructuringPage","9d70f3125d8f9016","Delivery costs planned, not discovered at the end")],
]));
const formats = cmsData(()=>([
  [cmsText("FinanceStructuringPage","89371ca9d5f71760","Feature Films"), cmsText("FinanceStructuringPage","2257ed154ca112a9","Larger budgets often draw several sources. The plan has to show each partner exactly where their money goes and when.")],
  [cmsText("FinanceStructuringPage","a7c95e2c7d0725b6","Series & OTT"), cmsText("FinanceStructuringPage","241b5d6d477d0b91","Series are often developed with a platform in mind, so structure usually starts with the platform conversation and a season-level budget.")],
  [cmsText("FinanceStructuringPage","ec5e4dff74d15df2","Documentaries"), cmsText("FinanceStructuringPage","7a973e6395e650fb","Timelines can stretch as access and research unfold. Funding is often staged, with each phase earning the next.")],
  [cmsText("FinanceStructuringPage","3a4a74f0a2bf833b","Short Films"), cmsText("FinanceStructuringPage","fed2bf2ffbfd18d0","Compact budgets and fewer sources. The plan focuses on making every rupee visible on screen.")],
]));
const deliverables = cmsData(()=>([
  [cmsText("FinanceStructuringPage","2e5f364dd1f3b9be","Budget top sheet & detailed budget"), cmsText("FinanceStructuringPage","6f428305ea518313","The true cost, department by department")],
  [cmsText("FinanceStructuringPage","2c641ff20325b8c5","Sources & gap summary"), cmsText("FinanceStructuringPage","272b06b67e7418de","What’s committed, what’s in discussion, and what’s still needed")],
  [cmsText("FinanceStructuringPage","05d53ba480b95ed6","Cash-flow schedule"), cmsText("FinanceStructuringPage","ede482b17c84dc1f","When money is needed, stage by stage")],
  [cmsText("FinanceStructuringPage","93bc3a63e4fadfaf","Production plan & schedule"), cmsText("FinanceStructuringPage","16488c5de674a244","How and when the project will be made")],
  [cmsText("FinanceStructuringPage","c1013443a8898002","Contingency plan"), cmsText("FinanceStructuringPage","efe746d6e4d3c6ae","What protects the project when things change")],
  [cmsText("FinanceStructuringPage","3a0cf5bebeda982b","Reporting framework"), cmsText("FinanceStructuringPage","596b53c03e08a3c3","How spend will be shown to partners once production starts")],
]));
const mistakes = cmsData(()=>([
  [cmsText("FinanceStructuringPage","3545b6fab37cd66a","Budgeting backwards"), cmsText("FinanceStructuringPage","56b0c4d3a86de94a","Shrinking the budget to match money raised, instead of planning what the story needs.")],
  [cmsText("FinanceStructuringPage","0b5450ec252d91e3","Cash after the spend"), cmsText("FinanceStructuringPage","cfb67275d6a1bfda","Money committed but arriving after the bills it was meant to cover.")],
  [cmsText("FinanceStructuringPage","0550def758b89949","Mismatched expectations"), cmsText("FinanceStructuringPage","48312b9a8bfc4d91","Partners funding the same project with different ideas of what they are paying for.")],
  [cmsText("FinanceStructuringPage","33bb078d5b6db44e","No room for change"), cmsText("FinanceStructuringPage","87f3f5c180e2cabf","No contingency, so one lost day becomes a crisis.")],
]));
const steps = cmsData(()=>([
  [cmsText("FinanceStructuringPage","360ea22c392ded89","Read the story"), cmsText("FinanceStructuringPage","98dd77e9573c4e72","We start with the script and creative goals before any numbers are set.")],
  [cmsText("FinanceStructuringPage","f0bace21b03d4c47","Cost it honestly"), cmsText("FinanceStructuringPage","23d204afe359ee4e","A budget grounded in production realities, with contingency.")],
  [cmsText("FinanceStructuringPage","e52e938625025a27","Map the sources"), cmsText("FinanceStructuringPage","1d72bda24650ad20","Who could fund which part, and what is already committed.")],
  [cmsText("FinanceStructuringPage","4ac7557d86d8397d","Time the money"), cmsText("FinanceStructuringPage","51dd056a44be9222","Cash flow mapped to every stage of production.")],
  [cmsText("FinanceStructuringPage","9575f2f8194b2c50","Hand to production"), cmsText("FinanceStructuringPage","ec476d08e8c0fb10","The same team carries the plan into 03 Produce and delivers it.")],
]));
const questions = cmsData(()=>([
  [cmsText("FinanceStructuringPage","3d1f498c4f9600ad","Is finance structuring the same as investment advice?"), cmsText("FinanceStructuringPage","50c7bc69cbfa41ec","No. We build the production-side finance plan, covering budget, sources, timing and reporting. Investors and producers agree terms with their own financial, legal and tax advisors.")],
  [cmsText("FinanceStructuringPage","77b34c21bc5b16da","Can you structure a project that is already part-funded?"), cmsText("FinanceStructuringPage","a060686f5e543b19","Yes. We map what is committed, then plan how to close the gap without changing what the story needs.")],
  [cmsText("FinanceStructuringPage","8fee182f004c4ba2","Do you work with our lawyers and accountants?"), cmsText("FinanceStructuringPage","1308c13657a3c1f1","Yes. They handle agreements and tax; we give them clear production numbers and plans to work from.")],
  [cmsText("FinanceStructuringPage","77170363b4b7e6af","Do I need a finished script?"), cmsText("FinanceStructuringPage","14ccc4bbfd7d7884","A script or strong treatment is enough to start. A first budget can be built early and refined as the project develops.")],
]));
function Label({children}) {return <div className="produce-label"><span>{children}</span></div>;}
Label.displayName = 'EditorialLabel';
function PlanRows({rows,labels}) {
  return <div className="structuring-rows">{rows.map(([title,meaning,plan],i)=><article key={title}><div><span className="structuring-small">0{i+1}</span><h3>{title}</h3></div><div><p className="structuring-small">{labels[0]}</p><p>{meaning}</p></div><div><p className="structuring-small">{labels[1]}</p><p>{plan}</p></div></article>)}</div>;
}
// Public copy from Kemsor_Finance_01_Finance_Structuring.docx.pdf.
export default function FinanceStructuringPage() {
  return <FinanceLayout page="finance-structuring"><div className="produce-hub structuring-page">
    <nav className="produce-breadcrumb" aria-label="Breadcrumb"><a href="/">{cmsText("FinanceStructuringPage","d6968a7e6e2a30f8","Kemsor Studios")}</a><span aria-hidden="true">/</span><a href="/finance/">{cmsText("FinanceStructuringPage","55b2aaad57af68fa","Finance")}</a><span aria-hidden="true">/</span><span aria-current="page">{cmsText("FinanceStructuringPage","e7c7ac7ffe847790","Finance Structuring")}</span></nav>
    <section className="inner-hero produce-hero" aria-labelledby="structuring-title"><figure className="produce-hero-image" aria-hidden="true"><StudioImage mediaSlot="FinanceStructuringPage-1" src="/assets/services/planning-1600.webp" srcSet={[640,960,1600].map(w=>`/assets/services/planning-${w}.webp ${w}w`).join(', ')} sizes="100vw" alt="" fetchPriority="high" decoding="async"/></figure><div className="produce-hero-content"><p className="produce-kicker">{cmsText("FinanceStructuringPage","6b2111bbe85cb991","02 · FINANCE · FINANCE STRUCTURING")}</p><MotionHeading as="h1" id="structuring-title">{cmsText("FinanceStructuringPage","c03a4909f5066a10","Finance Structuring.")}<span>{cmsText("FinanceStructuringPage","4f41681730307e22","Build the money around the story.")}</span></MotionHeading><MotionCopy>{cmsText("FinanceStructuringPage","4c592587563fa476","A finance plan needs to show how much money is required, who will provide it, when it will arrive and what it will pay for. Kemsor brings those details together so partners can assess the funding and delivery plan.")}</MotionCopy><div className="produce-actions"><CTA href={contact}>{cmsText("FinanceStructuringPage","d247a6e8b77292e2","Structure my project")}</CTA><TextLink href="#finance-plan">{cmsText("FinanceStructuringPage","643ba9d323258c18","See what a finance plan includes")}</TextLink></div></div></section>

    <section className="produce-section" id="four-questions" aria-labelledby="four-title"><Label>{cmsText("FinanceStructuringPage","8269f5759017d56b","THE FOUR QUESTIONS · EVERY FINANCE PLAN MUST ANSWER")}</Label><MotionHeading as="h2" id="four-title">{cmsText("FinanceStructuringPage","5acca2d052a0167c","It’s not just how much.")}<br/><em>{cmsText("FinanceStructuringPage","2090e5b1af5e33c0","It’s from whom, when, and for what.")}</em></MotionHeading><MotionCopy className="structuring-intro">{cmsText("FinanceStructuringPage","beca525ad0a16945","Two projects with the same budget can have completely different chances of being made. The difference is structure.")}</MotionCopy><PlanRows rows={questionsPlan} labels={['WHAT IT MEANS','WHAT KEMSOR BUILDS']}/></section>

    <section className="produce-section" id="cash-flow" aria-labelledby="cash-title"><Label>{cmsText("FinanceStructuringPage","c4f3cd382b7e5ed3","CASH FLOW · STAGE BY STAGE")}</Label><MotionHeading as="h2" id="cash-title">{cmsText("FinanceStructuringPage","142b515cf2951305","Money arrives in stages.")}<br/><em>{cmsText("FinanceStructuringPage","4b74bd3486e5f50c","So does the spend.")}</em></MotionHeading><MotionCopy className="structuring-intro">{cmsText("FinanceStructuringPage","4f7d1e58af3b72e2","Finance problems often come down to timing. We map the cost of each stage and when the money needs to be available.")}</MotionCopy><PlanRows rows={stages} labels={['WHERE THE MONEY GOES','WHAT THE PLAN MUST SHOW']}/></section>

    <section className="produce-section" id="structure-by-format" aria-labelledby="formats-title"><Label>{cmsText("FinanceStructuringPage","4db74d5ed1cb4d16","NO TWO FORMATS ARE FUNDED THE SAME WAY")}</Label><MotionHeading as="h2" id="formats-title">{cmsText("FinanceStructuringPage","7e09119ea1a564eb","Every format has")}<br/><em>{cmsText("FinanceStructuringPage","e0ae15a755c7ad7a","its own money logic.")}</em></MotionHeading><div className="structuring-formats">{formats.map(([title,body],i)=><article key={title}><span className="structuring-small">0{i+1} / 04</span><h3>{title}</h3><p>{body}</p></article>)}</div></section>

    <section className="produce-section" id="finance-plan" aria-labelledby="plan-title"><Label>{cmsText("FinanceStructuringPage","d039a4b9aecf3f66","THE FINANCE PLAN · WHAT’S INSIDE")}</Label><MotionHeading as="h2" id="plan-title">{cmsText("FinanceStructuringPage","4aa1a4308d78829b","One plan.")}<br/><em>{cmsText("FinanceStructuringPage","ac31a7d2e53b6b2e","Every answer a financier will ask for.")}</em></MotionHeading><dl className="line-production-deliverables studio-ledger studio-ledger-pairs">{deliverables.map(([title,body])=><div key={title}><dt>{title}</dt><dd>{body}</dd></div>)}</dl></section>

    <section className="produce-section" id="mistakes-to-avoid" aria-labelledby="mistakes-title"><Label>{cmsText("FinanceStructuringPage","4efd5b2a6dd978f3","WHERE PROJECTS GO WRONG")}</Label><MotionHeading as="h2" id="mistakes-title">{cmsText("FinanceStructuringPage","fa020911af0e3030","Four mistakes")}<br/><em>{cmsText("FinanceStructuringPage","29c1f473ffe9776a","that sink fundable projects.")}</em></MotionHeading><ol className="structuring-mistakes">{mistakes.map(([title,body],i)=><li key={title}><span className="structuring-small">0{i+1}</span><div><h3>{title}</h3><p>{body}</p></div></li>)}</ol></section>

    <section className="produce-section produce-process" id="how-it-works" aria-labelledby="process-title"><Label>{cmsText("FinanceStructuringPage","27872daba751819a","HOW IT WORKS")}</Label><MotionHeading as="h2" id="process-title">{cmsText("FinanceStructuringPage","23955214f794637d","From budget to")}<br/><em>{cmsText("FinanceStructuringPage","52727e1149e915fa","a plan people can fund.")}</em></MotionHeading><ol className="produce-steps finance-steps">{steps.map(([title,body],i)=><li key={title}><span className="produce-step-number">0{i+1}</span><h3>{title}</h3><p>{body}</p></li>)}</ol><div className="structuring-production-link"><TextLink href="/produce/">{cmsText("FinanceStructuringPage","8ecf8b890f72d76b","Explore 03 Produce")}</TextLink></div></section>

    {/* No approved project title, format, year or finance structuring credit supplied. */}
    <section className="produce-section produce-work" id="related-work" aria-labelledby="work-title"><Label>{cmsText("FinanceStructuringPage","d6c098ef7524355f","RELATED WORK")}</Label><div><MotionHeading as="h2" id="work-title">{cmsText("FinanceStructuringPage","bbe830d6145ca3d7","Related work.")}</MotionHeading><TextLink href="/productions/">{cmsText("FinanceStructuringPage","3917683e806d6246","Explore productions")}</TextLink></div></section>

    <section className="produce-section produce-questions" id="questions" aria-labelledby="questions-title"><div><Label>{cmsText("FinanceStructuringPage","31220af31ef903e8","QUESTIONS")}</Label><MotionHeading as="h2" id="questions-title">{cmsText("FinanceStructuringPage","1eebd7d4b88e1d1d","Questions.")}</MotionHeading></div><div className="produce-faqs">{questions.map(([q,a])=><details key={q}><summary>{q}<span aria-hidden="true"><SiteIcon name="plus" size={16} /></span></summary><p>{a}</p></details>)}</div></section>

    <section className="produce-section produce-closing finance-closing" id="structure-your-project" aria-labelledby="closing-title"><Label>{cmsText("FinanceStructuringPage","b124aae27581b6ba","FINANCE STRUCTURING")}</Label><div><MotionHeading as="h2" id="closing-title">{cmsText("FinanceStructuringPage","cd6a03fd10df2700","Fundable on paper.")}<br/><em>{cmsText("FinanceStructuringPage","581bd3c406d62652","Finishable in practice.")}</em></MotionHeading><div><MotionCopy>{cmsText("FinanceStructuringPage","28e8ce9efaad265c","Tell us about the project and what’s already in place. We’ll show you how it could be structured.")}</MotionCopy><CTA href={contact}>{cmsText("FinanceStructuringPage","bb94345184d9534f","Structure my project")}</CTA></div></div><MotionCopy className="finance-disclaimer">{cmsText("FinanceStructuringPage","852f32f4e5186d17","Kemsor coordinates finance planning and production budgeting. It does not provide investment, legal or tax advice, and does not guarantee financing or returns.")}</MotionCopy></section>
  </div></FinanceLayout>;
}
