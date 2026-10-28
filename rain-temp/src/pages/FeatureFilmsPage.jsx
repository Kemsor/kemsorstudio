import SiteIcon from '../SiteIcon';
import React, { useRef, useState } from 'react';
import MotionHeading, { MotionCopy } from '../TextMotion';
import SectionSubmenu from '../SectionSubmenu';
import { CTA, TextLink } from '../PageUI';
import './feature-films.css';

const stages = [
  { id:'idea', label:'An idea', heading:'You have an idea, maybe a few pages.', next:'Turn it into a story with a clear spine, and a logline people repeat.', support:'Story development, logline and synopsis, and an honest read on the idea’s potential as a feature.', button:'Start with Story & Script', href:'/develop/story-script/' },
  { id:'script', label:'A script', heading:'You have a draft or several.', next:'Get it to a draft that reads well and can actually be made.', support:'A creative read and a production read, then a clear rewrite plan. You lead the rewrite; we keep it moving.', button:'Get a script read', href:'/script-to-production/' },
  { id:'package', label:'A package', heading:'Your script is ready; the people aren’t yet.', next:'Attach a director and lead cast, and build the package financiers ask for.', support:'Packaging and talent attachment, with every name marked attached, approached or wishlist.', button:'Package my feature', href:'/develop/packaging-talent/' },
  { id:'money', label:'Part of the money', heading:'Some finance is in place; there’s a gap.', next:'Show exactly what’s committed, what’s needed and when.', support:'A budget that holds up, a sources and gap plan, and co-production partners where they fit.', button:'Close the finance gap', href:'/finance/finance-structuring/' },
  { id:'start', label:'A start date', heading:'You’re financed and heading to the shoot.', next:'Lock locations, cast, crew and schedule then shoot to plan.', support:'Pre-production and line production on the ground, with daily reporting to every partner.', button:'Plan the shoot', href:'/produce/' },
  { id:'finished', label:'A finished film', heading:'The film is shot or finished.', next:'Lock the cut, finish it to spec, and choose where it premieres.', support:'Post-production supervision, deliverables, festival strategy and release coordination.', button:'Finish & release it', href:'/release/' },
];
const ledger = [
  ['Develop', 'Script notes · Logline & synopsis · Production read'],
  ['Package', 'Project package · Attachment status for every name'],
  ['Plan', 'Budget top sheet · Shooting schedule · Assumptions log'],
  ['Finance', 'Finance plan · Sources & gap summary · Cash-flow schedule'],
  ['Shoot', 'Call sheets · Daily progress & cost reports'],
  ['Post', 'Post schedule · Picture-lock record · QC report'],
  ['Release', 'Deliverables to spec · Festival & release plan'],
];
const firstFeatures = [
  'A producer at your side from the first draft',
  'Budgets planned honestly for a first feature',
  'A festival strategy built around a debut premiere',
];
const questions = [
  ['Do I have to use Kemsor for every stage?', 'No. Pick the stage you need. Many features use us for one stage only.'],
  ['Do I need a star attached to get financed?', 'It can help, but it isn’t the only thing financiers look at. A strong script, an honest package and a budget that holds up often matter as much.'],
  ['Can a feature be made well on a modest budget?', 'Yes, if it’s planned for that budget from the start. We show scenario budgets and what each one changes on screen.'],
  ['Can you step in when a feature has stalled?', 'Yes. We look at where it’s stuck, what’s already in place, and re-plan from there.'],
];
const languages = [ ['hi','कहानी'], ['ta','கதை'], ['te','కథ'], ['bn','গল্প'], ['kn','ಕಥೆ'], ['ml','കഥ'] ];
const journey = ['Develop', 'Finance', 'Shoot', 'Finish', 'Release'];

function Label({ children, number }) {
  return <div className="feature-label"><span>{children}</span><span aria-hidden="true">{number}</span></div>;
}

function FeaturePlanner() {
  const [selected, setSelected] = useState('script');
  const tabs = useRef([]);
  const current = stages.find(stage => stage.id === selected);
  const move = (event, index) => {
    let next;
    if(event.key === 'ArrowRight') next = (index + 1) % stages.length;
    else if(event.key === 'ArrowLeft') next = (index + stages.length - 1) % stages.length;
    else if(event.key === 'Home') next = 0;
    else if(event.key === 'End') next = stages.length - 1;
    else return;
    event.preventDefault();setSelected(stages[next].id);tabs.current[next]?.focus();
  };
  return <div className="feature-planner">
    <p className="feature-planner-question" id="feature-planner-question">WHERE IS YOUR FEATURE RIGHT NOW?</p>
    <span className="feature-have" id="feature-have">I have…</span>
    <div className="feature-stage-tabs" role="tablist" aria-labelledby="feature-planner-question feature-have">
      {stages.map((stage,index) => <button ref={element => {tabs.current[index] = element;}} key={stage.id} type="button" role="tab" id={`feature-tab-${stage.id}`} aria-selected={selected === stage.id} tabIndex={selected === stage.id ? 0 : -1} aria-controls="feature-stage-panel" onClick={() => setSelected(stage.id)} onKeyDown={event => move(event,index)}>{stage.label}</button>)}
    </div>
    <div className="feature-stage-panel" id="feature-stage-panel" role="tabpanel" aria-labelledby={`feature-tab-${selected}`} tabIndex="0">
      <div className="feature-stage-content" key={selected}>
        <h2>{current.heading}</h2>
        <div className="feature-stage-columns"><div><h3>What happens next</h3><p>{current.next}</p></div><div><h3>Where Kemsor comes in</h3><p>{current.support}</p></div></div>
        <CTA href={current.href}>{current.button}</CTA>
      </div>
    </div>
  </div>;
}

export default function FeatureFilmsPage() {
  return <div className="feature-films-page">
    <section className="feature-hero feature-width" aria-labelledby="feature-title">
      <div className="feature-hero-grid"><div className="feature-hero-copy"><p className="feature-kicker">PRODUCTIONS · FEATURE FILMS</p><MotionHeading as="h1" id="feature-title">Feature Films.</MotionHeading><MotionHeading as="h2" className="feature-intro-accent">Tell us where yours is. <em>We’ll tell you what’s next.</em></MotionHeading><MotionCopy>Every feature is at a different point on a long road. Instead of a list of services, start with yours pick the stage your film is at and see exactly how Kemsor would take it forward.</MotionCopy></div><FeaturePlanner/></div>
    </section>
    <SectionSubmenu section="what-we-make" page="feature-films"/>

    <section className="feature-section feature-width" aria-labelledby="feature-team-title">
      <Label number="01">WHY ONE TEAM MATTERS</Label>
      <div className="feature-intro-grid"><div><MotionHeading as="h2" id="feature-team-title">Most features change hands four times.</MotionHeading><MotionCopy className="feature-team-accent">Every hand-off loses something.</MotionCopy></div><div><MotionCopy>A feature is often developed by one company, financed through another, shot by a hired service team and finished somewhere else. Every hand-off costs weeks, and the knowledge of why a decision was made rarely travels with the files.</MotionCopy><MotionCopy>Kemsor can carry a feature from first page to first screening as one team. Or, if you already have partners, we fit into your plan without asking you to start again.</MotionCopy></div></div>
      <div className="feature-comparison"><article><h3>The usual way</h3><ol className="feature-usual">{journey.map(stage => <li key={stage}>{stage}</li>)}</ol><p>Five stages, often several companies, with a handover at each stage.</p></article><article><h3>With Kemsor</h3><ol className="feature-connected">{journey.map(stage => <li key={stage}>{stage}</li>)}</ol><p>One team and one plan, or support at the stage you need.</p></article></div>
    </section>

    <section className="feature-section feature-width" aria-labelledby="feature-ledger-title">
      <Label number="02">THE FEATURE LEDGER</Label>
      <div className="feature-intro-grid"><MotionHeading as="h2" id="feature-ledger-title">What you hold at the end of each stage.</MotionHeading><MotionCopy>Every stage ends with something you can put in front of a financier, a partner or a platform.</MotionCopy></div>
      <div className="feature-ledger-head" aria-hidden="true"><span>#</span><span>Stage</span><span>What you hold</span></div>
      <ol className="feature-ledger">{ledger.map(([stage, copy],index) => <li key={stage}><span className="feature-ledger-number" aria-hidden="true">{String(index + 1).padStart(2,'0')}</span><h3>{stage}</h3><p>{copy}</p></li>)}</ol>
    </section>

    <section className="feature-section feature-width" aria-labelledby="feature-debut-title">
      <Label number="03">FIRST FEATURES</Label>
      <div className="feature-intro-grid"><MotionHeading as="h2" id="feature-debut-title">Making your first feature?</MotionHeading><div><MotionCopy>Debut features carry the most risk and the most hope. We give first-time directors and producers what they most often lack: an experienced producing partner who explains every decision, protects the creative vision, and makes sure the plan is realistic before anyone commits money.</MotionCopy><ul className="feature-debut-list">{firstFeatures.map(point => <li key={point}>{point}</li>)}</ul></div></div>
    </section>

    <section className="feature-section feature-width" aria-labelledby="feature-regional-title">
      <Label number="04">IN ANY LANGUAGE</Label>
      <div className="feature-intro-grid"><MotionHeading as="h2" id="feature-regional-title">Rooted in language and place.</MotionHeading><MotionCopy>A feature told in the language of its place can travel further than one that isn’t. We produce regional cinema with local knowledge and plan its route to audiences at home and beyond.</MotionCopy></div>
      <div className="feature-languages" aria-hidden="true">{languages.map(([language, word]) => <span lang={language} key={language}>{word}</span>)}</div>
    </section>

    <section className="feature-section feature-width feature-slate" aria-labelledby="feature-slate-title">
      <Label number="05">ON OUR SLATE</Label>
      <div className="feature-intro-grid"><MotionHeading as="h2" id="feature-slate-title">Feature films.</MotionHeading><div><MotionCopy>Each title shows the stages Kemsor delivered.</MotionCopy><TextLink href="/projects/#feature-films">See all feature films</TextLink></div></div>
      {/* Poster, title, year, language, status and role rows require supplied titles and confirmed Kemsor credits. */}
    </section>

    <section className="feature-section feature-width" aria-labelledby="feature-questions-title">
      <Label number="06">STRAIGHT ANSWERS</Label>
      <div className="feature-intro-grid"><MotionHeading as="h2" id="feature-questions-title">Straight answers.</MotionHeading><div className="feature-faq">{questions.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true"><SiteIcon name="plus" size={16} /></span></summary><p>{answer}</p></details>)}</div></div>
    </section>

    <section className="feature-section feature-width feature-closing" aria-labelledby="feature-closing-title">
      <div className="feature-intro-grid"><div className="feature-script" aria-label="Screenplay page one"><span className="feature-script-page">1.</span><p>FADE IN:</p><p>INT. WHERE YOUR STORY BEGINS / DAY</p><p>Your first page goes here.</p></div><div><MotionHeading as="h2" id="feature-closing-title">Send us page one.</MotionHeading><MotionCopy>A script, a treatment, or a single page. Tell us where your feature is, and we’ll come back with an honest next step.</MotionCopy><div className="feature-actions"><CTA href="/script-to-production/">Send us your script</CTA><TextLink href="/contact/">Talk to the studio</TextLink></div></div></div>
    </section>
  </div>;
}
