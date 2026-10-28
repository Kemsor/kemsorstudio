import SiteIcon from '../SiteIcon';
import MotionHeading, { MotionCopy } from '../TextMotion';
import React from 'react';
import FinanceLayout from '../FinanceLayout';
import { CTA, TextLink } from '../PageUI';
import './produce-page.css';
import './finance-page.css';
import './finance-structuring.css';

const contact = '/contact/?partner=filmmakers';
const questionsPlan = [
  ['How much?', 'The true cost of the story, not a hopeful one', 'A budget grounded in production realities, with contingency built in'],
  ['From whom?', 'Which partners fund which part of the project', 'A sources plan covering investors, co-production partners, platforms and in-kind contributions'],
  ['When?', 'Money must arrive before the spend it covers', 'A cash-flow schedule mapped to each production stage'],
  ['For what?', 'Every rupee traceable to the work on screen', 'A reporting framework that shows spend against plan'],
];
const stages = [
  ['Development', 'Script, packaging, early creative work', 'Who funds the work before the project is greenlit'],
  ['Pre-production', 'Casting, crew, locations, design, deposits', 'Commitments in place before deposits fall due'],
  ['Production', 'The shoot, usually the largest single spend', 'Cash ready for every shoot week, with contingency'],
  ['Post-production', 'Edit, sound, colour, VFX, deliverables', 'Funds held back so the film can actually be finished'],
  ['Release', 'Delivery to platforms and distributors', 'Delivery costs planned, not discovered at the end'],
];
const formats = [
  ['Feature Films', 'Larger budgets often draw several sources. The plan has to show each partner exactly where their money goes and when.'],
  ['Series & OTT', 'Series are often developed with a platform in mind, so structure usually starts with the platform conversation and a season-level budget.'],
  ['Documentaries', 'Timelines can stretch as access and research unfold. Funding is often staged, with each phase earning the next.'],
  ['Short Films', 'Compact budgets and fewer sources. The plan focuses on making every rupee visible on screen.'],
];
const deliverables = [
  ['Budget top sheet & detailed budget', 'The true cost, department by department'],
  ['Sources & gap summary', 'What’s committed, what’s in discussion, and what’s still needed'],
  ['Cash-flow schedule', 'When money is needed, stage by stage'],
  ['Production plan & schedule', 'How and when the project will be made'],
  ['Contingency plan', 'What protects the project when things change'],
  ['Reporting framework', 'How spend will be shown to partners once production starts'],
];
const mistakes = [
  ['Budgeting backwards', 'Shrinking the budget to match money raised, instead of planning what the story needs.'],
  ['Cash after the spend', 'Money committed but arriving after the bills it was meant to cover.'],
  ['Mismatched expectations', 'Partners funding the same project with different ideas of what they are paying for.'],
  ['No room for change', 'No contingency, so one lost day becomes a crisis.'],
];
const steps = [
  ['Read the story', 'We start with the script and creative goals before any numbers are set.'],
  ['Cost it honestly', 'A budget grounded in production realities, with contingency.'],
  ['Map the sources', 'Who could fund which part, and what is already committed.'],
  ['Time the money', 'Cash flow mapped to every stage of production.'],
  ['Hand to production', 'The same team carries the plan into 03 Produce and delivers it.'],
];
const questions = [
  ['Is finance structuring the same as investment advice?', 'No. We build the production-side finance plan, covering budget, sources, timing and reporting. Investors and producers agree terms with their own financial, legal and tax advisors.'],
  ['Can you structure a project that is already part-funded?', 'Yes. We map what is committed, then plan how to close the gap without changing what the story needs.'],
  ['Do you work with our lawyers and accountants?', 'Yes. They handle agreements and tax; we give them clear production numbers and plans to work from.'],
  ['Do I need a finished script?', 'A script or strong treatment is enough to start. A first budget can be built early and refined as the project develops.'],
];
function Label({children}) {return <div className="produce-label"><span>{children}</span></div>;}
Label.displayName = 'EditorialLabel';
function PlanRows({rows,labels}) {
  return <div className="structuring-rows">{rows.map(([title,meaning,plan],i)=><article key={title}><div><span className="structuring-small">0{i+1}</span><h3>{title}</h3></div><div><p className="structuring-small">{labels[0]}</p><p>{meaning}</p></div><div><p className="structuring-small">{labels[1]}</p><p>{plan}</p></div></article>)}</div>;
}
// Public copy from Kemsor_Finance_01_Finance_Structuring.docx.pdf.
export default function FinanceStructuringPage() {
  return <FinanceLayout page="finance-structuring"><div className="produce-hub structuring-page">
    <nav className="produce-breadcrumb" aria-label="Breadcrumb"><a href="/">Kemsor Studios</a><span aria-hidden="true">/</span><a href="/finance/">Finance</a><span aria-hidden="true">/</span><span aria-current="page">Finance Structuring</span></nav>
    <section className="produce-hero" aria-labelledby="structuring-title"><figure className="produce-hero-image" aria-hidden="true"><img src="/assets/services/planning-1600.webp" srcSet={[640,960,1600].map(w=>`/assets/services/planning-${w}.webp ${w}w`).join(', ')} sizes="100vw" alt="" fetchPriority="high" decoding="async"/></figure><div className="produce-hero-content"><p className="produce-kicker">02 · FINANCE · FINANCE STRUCTURING</p><MotionHeading as="h1" id="structuring-title">Finance Structuring.<span>Build the money around the story.</span></MotionHeading><MotionCopy>A finance plan needs to show how much money is required, who will provide it, when it will arrive and what it will pay for. Kemsor brings those details together so partners can assess the funding and delivery plan.</MotionCopy><div className="produce-actions"><CTA href={contact}>Structure my project</CTA><TextLink href="#finance-plan">See what a finance plan includes</TextLink></div></div></section>

    <section className="produce-section" id="four-questions" aria-labelledby="four-title"><Label>THE FOUR QUESTIONS · EVERY FINANCE PLAN MUST ANSWER</Label><MotionHeading as="h2" id="four-title">It’s not just how much.<br/><em>It’s from whom, when, and for what.</em></MotionHeading><MotionCopy className="structuring-intro">Two projects with the same budget can have completely different chances of being made. The difference is structure.</MotionCopy><PlanRows rows={questionsPlan} labels={['WHAT IT MEANS','WHAT KEMSOR BUILDS']}/></section>

    <section className="produce-section" id="cash-flow" aria-labelledby="cash-title"><Label>CASH FLOW · STAGE BY STAGE</Label><MotionHeading as="h2" id="cash-title">Money arrives in stages.<br/><em>So does the spend.</em></MotionHeading><MotionCopy className="structuring-intro">Finance problems often come down to timing. We map the cost of each stage and when the money needs to be available.</MotionCopy><PlanRows rows={stages} labels={['WHERE THE MONEY GOES','WHAT THE PLAN MUST SHOW']}/></section>

    <section className="produce-section" id="structure-by-format" aria-labelledby="formats-title"><Label>NO TWO FORMATS ARE FUNDED THE SAME WAY</Label><MotionHeading as="h2" id="formats-title">Every format has<br/><em>its own money logic.</em></MotionHeading><div className="structuring-formats">{formats.map(([title,body],i)=><article key={title}><span className="structuring-small">0{i+1} / 04</span><h3>{title}</h3><p>{body}</p></article>)}</div></section>

    <section className="produce-section" id="finance-plan" aria-labelledby="plan-title"><Label>THE FINANCE PLAN · WHAT’S INSIDE</Label><MotionHeading as="h2" id="plan-title">One plan.<br/><em>Every answer a financier will ask for.</em></MotionHeading><dl className="line-production-deliverables">{deliverables.map(([title,body])=><div key={title}><dt>{title}</dt><dd>{body}</dd></div>)}</dl></section>

    <section className="produce-section" id="mistakes-to-avoid" aria-labelledby="mistakes-title"><Label>WHERE PROJECTS GO WRONG</Label><MotionHeading as="h2" id="mistakes-title">Four mistakes<br/><em>that sink fundable projects.</em></MotionHeading><ol className="structuring-mistakes">{mistakes.map(([title,body],i)=><li key={title}><span className="structuring-small">0{i+1}</span><div><h3>{title}</h3><p>{body}</p></div></li>)}</ol></section>

    <section className="produce-section produce-process" id="how-it-works" aria-labelledby="process-title"><Label>HOW IT WORKS</Label><MotionHeading as="h2" id="process-title">From budget to<br/><em>a plan people can fund.</em></MotionHeading><ol className="produce-steps finance-steps">{steps.map(([title,body],i)=><li key={title}><span className="produce-step-number">0{i+1}</span><h3>{title}</h3><p>{body}</p></li>)}</ol><div className="structuring-production-link"><TextLink href="/produce/">Explore 03 Produce</TextLink></div></section>

    {/* No approved project title, format, year or finance structuring credit supplied. */}
    <section className="produce-section produce-work" id="related-work" aria-labelledby="work-title"><Label>RELATED WORK</Label><div><MotionHeading as="h2" id="work-title">Related work.</MotionHeading><TextLink href="/projects/">Explore productions</TextLink></div></section>

    <section className="produce-section produce-questions" id="questions" aria-labelledby="questions-title"><div><Label>QUESTIONS</Label><MotionHeading as="h2" id="questions-title">Questions.</MotionHeading></div><div className="produce-faqs">{questions.map(([q,a])=><details key={q}><summary>{q}<span aria-hidden="true"><SiteIcon name="plus" size={16} /></span></summary><p>{a}</p></details>)}</div></section>

    <section className="produce-section produce-closing finance-closing" id="structure-your-project" aria-labelledby="closing-title"><Label>FINANCE STRUCTURING</Label><div><MotionHeading as="h2" id="closing-title">Fundable on paper.<br/><em>Finishable in practice.</em></MotionHeading><div><MotionCopy>Tell us about the project and what’s already in place. We’ll show you how it could be structured.</MotionCopy><CTA href={contact}>Structure my project</CTA></div></div><MotionCopy className="finance-disclaimer">Kemsor coordinates finance planning and production budgeting. It does not provide investment, legal or tax advice, and does not guarantee financing or returns.</MotionCopy></section>
  </div></FinanceLayout>;
}
