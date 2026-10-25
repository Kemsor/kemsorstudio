import MotionHeading, { MotionCopy } from '../TextMotion';
import React from 'react';
import EditorialPage from '../EditorialPage';
import { CTA, TextLink } from '../PageUI';
import './produce-page.css';
import './finance-page.css';
import './budgeting-scheduling.css';

const tags = ['Cast','Extras','Locations','Day / Night','Interior / Exterior','Props','Costume & make-up','Vehicles','Stunts','VFX','Special equipment','Animals'];
const budget = [
  ['Above-the-line','Story rights, writers, director, producers and key cast'],
  ['Production (below-the-line)','Crew, equipment, locations, art, costume, transport and unit costs'],
  ['Post-production','Edit, sound, colour, VFX and deliverables'],
  ['Other costs','Insurance, legal and other production overheads'],
  ['Contingency','Protection for the changes every production meets'],
];
const optimises = ['Fewer company moves','Cast days used efficiently','Day and night work grouped','Weather and light planned for'];
const scenarios = [
  ['A','Full vision','The story as written, with everything it asks for.'],
  ['B','Efficient','Smart savings - fewer locations, tighter days - with the story intact.'],
  ['C','Essential','The leanest version that still tells the story well.'],
];
const deliverables = [
  'Scene-by-scene script breakdown',
  'Budget top sheet and detailed budget',
  'Shooting schedule and stripboard',
  'Scenario options with trade-offs explained',
  'An assumptions log - what every number depends on',
];
const questions = [
  ['How accurate is a development budget?','As accurate as the script and assumptions behind it. We log every assumption and update the budget as the project firms up.'],
  ['Can you budget from a treatment?','Yes - as an early estimate range. A detailed budget needs a script.'],
  ['Is the budget used once production starts?',<>Yes. It becomes the baseline that <a href="/produce/line-production/">Line Production</a> manages against.</>],
  ['Can you re-budget an existing budget?','Yes. We review it against the script and production realities, and show you where it holds and where it doesn’t.'],
];
function Label({children}) {return <div className="produce-label"><span>{children}</span></div>;}
Label.displayName = 'EditorialLabel';

// Public copy from Kemsor_Develop_03_Budgeting_and_Scheduling_Content.docx.pdf.
export default function BudgetingSchedulingPage() {
  return <EditorialPage page="budgeting-scheduling"><div className="produce-hub budgeting-page">
    <nav className="produce-breadcrumb" aria-label="Breadcrumb"><a href="/">Kemsor Studios</a><span aria-hidden="true">/</span><a href="/develop/">Develop</a><span aria-hidden="true">/</span><span aria-current="page">Budgeting &amp; Scheduling</span></nav>
    <section className="produce-hero" aria-labelledby="budgeting-title"><figure className="produce-hero-image" aria-hidden="true"><img src="/assets/services/planning-1600.webp" srcSet={[640,960,1600].map(w=>`/assets/services/planning-${w}.webp ${w}w`).join(', ')} sizes="100vw" alt="" fetchPriority="high" decoding="async"/></figure><div className="produce-hero-content"><p className="produce-kicker">01 · DEVELOP · BUDGETING &amp; SCHEDULING</p><MotionHeading as="h1" id="budgeting-title">Budgeting &amp; Scheduling.<span>The truth about what it takes.</span></MotionHeading><MotionCopy>Before anyone commits money, you need two honest numbers: what the project costs and how long it takes to make. We build both from the script up - grounded in production realities, not optimism.</MotionCopy><div className="produce-actions"><CTA href="/script-to-production/">Budget my project</CTA><TextLink href="#deliverables">See the deliverables</TextLink></div></div>
      <div className="editorial-hero-graphic budgeting-example" aria-label="Illustrative stripboard and budget top sheet; bars do not represent project costs"><p className="budgeting-example-label">STRIPBOARD · ILLUSTRATIVE</p><div className="budgeting-stripboard"><span>DAY 1</span>{[['01','INT.','DAY'],['02','EXT.','DAY'],['03','EXT.','NIGHT']].map(([scene,place,time])=><div key={scene} data-time={time}><span>SC. {scene}</span><span>{place}</span><span>{time}</span></div>)}</div><p className="budgeting-example-label budgeting-chart-title">BUDGET TOP SHEET · ILLUSTRATIVE</p><ul className="budgeting-bars">{['Above-the-line','Production','Post-production','Contingency'].map((title,i)=><li key={title}><span>{title}</span><i style={{'--bar-size':`${[64,90,48,22][i]}%`}} aria-hidden="true"/></li>)}</ul></div>
    </section>

    <nav className="finance-subnav" aria-label="Development services"><span>01 · DEVELOP</span><a href="/develop/">Overview</a><a href="/develop/story-script/">Story &amp; Script</a><a href="/develop/packaging-talent/">Packaging &amp; Talent</a><a href="/develop/budgeting-scheduling/" aria-current="page">Budgeting &amp; Scheduling</a></nav>

    <section className="produce-section" id="script-breakdown" aria-labelledby="breakdown-title"><Label>IT STARTS WITH A BREAKDOWN · EVERY SCENE, EVERY NEED</Label><MotionHeading as="h2" id="breakdown-title">Every number starts<br/><em>with a scene.</em></MotionHeading><MotionCopy className="budgeting-intro">We break the script down scene by scene and tag everything each one needs. Nothing gets budgeted that isn’t on the page - and nothing on the page gets missed.</MotionCopy><div className="budgeting-breakdown"><p className="budgeting-small">EXAMPLE SCENE</p><h3>SC. # - EXT. LOCATION - NIGHT</h3><ul>{tags.map(tag=><li key={tag}>{tag}</li>)}</ul><MotionCopy>Every tag becomes a line in the budget and a constraint in the schedule.</MotionCopy></div></section>

    <section className="produce-section" id="the-budget" aria-labelledby="budget-title"><Label>THE BUDGET · TOP TO BOTTOM</Label><MotionHeading as="h2" id="budget-title">A budget you can read<br/><em>from top to bottom.</em></MotionHeading><MotionCopy className="budgeting-intro">Presented the way financiers and producers expect to see it - with a top sheet for the big picture and detail behind every line.</MotionCopy><div className="budgeting-costs">{budget.map(([title,body],i)=><article key={title}><span className="budgeting-small">0{i+1}</span><h3>{title}</h3><p>{body}</p></article>)}</div></section>

    <section className="produce-section" id="the-schedule" aria-labelledby="schedule-title"><Label>THE SCHEDULE · BUILT FOR THE SHOOT</Label><MotionHeading as="h2" id="schedule-title">A good schedule saves money.<br/><em>A bad one spends it.</em></MotionHeading><MotionCopy className="budgeting-intro">We build the shooting schedule from the breakdown - grouping scenes by location, cast availability, day and night - so the unit moves as little as possible and every shoot day counts.</MotionCopy><MotionCopy className="budgeting-intro">The schedule and the budget are built together. Change one, and you see the effect on the other.</MotionCopy><div className="budgeting-schedule"><p className="budgeting-small">WHAT THE SCHEDULE OPTIMISES</p><ul>{optimises.map(line=><li key={line}>{line}</li>)}</ul></div></section>

    <section className="produce-section" id="scenario-budgets" aria-labelledby="scenarios-title"><Label>OPTIONS, NOT ULTIMATUMS · SCENARIO BUDGETS</Label><MotionHeading as="h2" id="scenarios-title">Options,<br/><em>not ultimatums.</em></MotionHeading><MotionCopy className="budgeting-intro">When money is tight, the answer isn’t a single number. We show you scenarios and exactly what each one changes on screen, so producers make the call with eyes open.</MotionCopy><div className="budgeting-scenarios">{scenarios.map(([letter,title,body])=><article key={letter}><p className="budgeting-small">SCENARIO {letter}</p><h3>{title}</h3><p>{body}</p></article>)}</div></section>

    <section className="produce-section" id="deliverables" aria-labelledby="deliverables-title"><Label>WHAT YOU RECEIVE · DELIVERABLES</Label><MotionHeading as="h2" id="deliverables-title">What you receive.<br/><em>Ready for financiers.</em></MotionHeading><ul className="budgeting-deliverables">{deliverables.map(line=><li key={line}>{line}</li>)}</ul><MotionCopy className="budgeting-intro">Feeds directly into <a href="/finance/finance-structuring/">Finance Structuring</a> and <a href="/produce/line-production/">Line Production</a>.</MotionCopy></section>

    {/* No approved project title, format, year or budgeting credits supplied. */}
    <section className="produce-section produce-work" id="related-work" aria-labelledby="work-title"><Label>RELATED WORK</Label><div><MotionHeading as="h2" id="work-title">Related work.</MotionHeading><TextLink href="/projects/">Explore productions</TextLink></div></section>

    <section className="produce-section produce-questions" id="questions" aria-labelledby="questions-title"><div><Label>QUESTIONS · ABOUT THE NUMBERS</Label><MotionHeading as="h2" id="questions-title">Questions<br/><em>about the numbers.</em></MotionHeading></div><div className="produce-faqs">{questions.map(([q,a])=><details key={q}><summary>{q}<span aria-hidden="true">+</span></summary><p>{a}</p></details>)}</div></section>

    <section className="produce-section produce-closing finance-closing" id="budget-your-project" aria-labelledby="closing-title"><Label>01 · DEVELOP</Label><div><MotionHeading as="h2" id="closing-title">Know what it takes -<br/><em>before you commit.</em></MotionHeading><div><MotionCopy>Send us the script. We’ll show you what it costs, how long it takes, and what your options are.</MotionCopy><div className="produce-actions"><CTA href="/script-to-production/">Budget my project</CTA><TextLink href="/finance/finance-structuring/">Explore Finance Structuring</TextLink></div></div></div></section>
  </div></EditorialPage>;
}
