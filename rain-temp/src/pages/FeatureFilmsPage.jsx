import {cmsText,cmsData} from '../siteContent';
import PageVisuals from '../VisualChapters';
import SiteIcon from '../SiteIcon';
import React, { useRef, useState } from 'react';
import MotionHeading, { MotionCopy } from '../TextMotion';
import SectionSubmenu from '../SectionSubmenu';
import { CTA, TextLink } from '../PageUI';
import './feature-films.css';

const stages = cmsData(()=>([
  { id:'idea', label:cmsText("FeatureFilmsPage","83d9e328a6bf7190","An idea"), heading:cmsText("FeatureFilmsPage","c1b09e5e5e3d2813","You have an idea, maybe a few pages."), next:cmsText("FeatureFilmsPage","ac09a723508eedc2","Turn it into a story with a clear spine, and a logline people repeat."), support:cmsText("FeatureFilmsPage","297f44f922deb63e","Story development, logline and synopsis, and an honest read on the idea’s potential as a feature."), button:cmsText("FeatureFilmsPage","368b2cd016328e6e","Start with Story & Script"), href:'/develop/story-script/' },
  { id:'script', label:cmsText("FeatureFilmsPage","d46814268b61c0f3","A script"), heading:cmsText("FeatureFilmsPage","8dff7d7e84e14d12","You have a draft or several."), next:cmsText("FeatureFilmsPage","20c396b90beae9da","Get it to a draft that reads well and can actually be made."), support:cmsText("FeatureFilmsPage","1169733e96531ff7","A creative read and a production read, then a clear rewrite plan. You lead the rewrite; we keep it moving."), button:cmsText("FeatureFilmsPage","61fa66d19673e1cb","Get a script read"), href:'/script-to-production/' },
  { id:'package', label:cmsText("FeatureFilmsPage","756a0c1358e78824","A package"), heading:cmsText("FeatureFilmsPage","cd7d4627d6c8ef63","Your script is ready; the people aren’t yet."), next:cmsText("FeatureFilmsPage","1a4d3072cac1e771","Attach a director and lead cast, and build the package financiers ask for."), support:cmsText("FeatureFilmsPage","ea4659223b669130","Packaging and talent attachment, with every name marked attached, approached or wishlist."), button:cmsText("FeatureFilmsPage","358e1ab267a5bc03","Package my feature"), href:'/develop/packaging-talent/' },
  { id:'money', label:cmsText("FeatureFilmsPage","71f24193c64c7be2","Part of the money"), heading:cmsText("FeatureFilmsPage","3848dcc46ad02fb7","Some finance is in place; there’s a gap."), next:cmsText("FeatureFilmsPage","1bf7b7fbc1887e02","Show exactly what’s committed, what’s needed and when."), support:cmsText("FeatureFilmsPage","cd70d6cbe77887f2","A budget that holds up, a sources and gap plan, and co-production partners where they fit."), button:cmsText("FeatureFilmsPage","847a2e27ee99a563","Close the finance gap"), href:'/finance/finance-structuring/' },
  { id:'start', label:cmsText("FeatureFilmsPage","44efac11a79b1f52","A start date"), heading:cmsText("FeatureFilmsPage","85a63999b672b9ab","You’re financed and heading to the shoot."), next:cmsText("FeatureFilmsPage","48961ca9d46263ef","Lock locations, cast, crew and schedule then shoot to plan."), support:cmsText("FeatureFilmsPage","a826c330a9923c75","Pre-production and line production on the ground, with daily reporting to every partner."), button:cmsText("FeatureFilmsPage","78ff7eab8c25444c","Plan the shoot"), href:'/produce/' },
  { id:'finished', label:cmsText("FeatureFilmsPage","8d045b6355e521b2","A finished film"), heading:cmsText("FeatureFilmsPage","0ba1d17f1ba42409","The film is shot or finished."), next:cmsText("FeatureFilmsPage","c1a454aea2b1c482","Lock the cut, finish it to spec, and choose where it premieres."), support:cmsText("FeatureFilmsPage","73cbf125fd5eb8be","Post-production supervision, deliverables, festival strategy and release coordination."), button:cmsText("FeatureFilmsPage","8385db96cf4b168f","Finish & release it"), href:'/release/' },
]));
const ledger = cmsData(()=>([
  [cmsText("FeatureFilmsPage","bf7b688725b8db1f","Develop"), cmsText("FeatureFilmsPage","4b496519fd7a94d3","Script notes · Logline & synopsis · Production read")],
  [cmsText("FeatureFilmsPage","091245ab7f2afab0","Package"), cmsText("FeatureFilmsPage","a5b4761f4c05e97a","Project package · Attachment status for every name")],
  [cmsText("FeatureFilmsPage","2415defca97ce2ef","Plan"), cmsText("FeatureFilmsPage","00ca61bbec2bd3d8","Budget top sheet · Shooting schedule · Assumptions log")],
  [cmsText("FeatureFilmsPage","bedff6913398c915","Finance"), cmsText("FeatureFilmsPage","a0fcbc116e3111ae","Finance plan · Sources & gap summary · Cash-flow schedule")],
  [cmsText("FeatureFilmsPage","43cae47ec2e552db","Shoot"), cmsText("FeatureFilmsPage","c3e43e42488a0b1b","Call sheets · Daily progress & cost reports")],
  [cmsText("FeatureFilmsPage","425491d9e87bdd57","Post"), cmsText("FeatureFilmsPage","899aa79a7f5c8fd2","Post schedule · Picture-lock record · QC report")],
  [cmsText("FeatureFilmsPage","c49513d52ca7b48c","Release"), cmsText("FeatureFilmsPage","046c8b94d33ba122","Deliverables to spec · Festival & release plan")],
]));
const firstFeatures = cmsData(()=>([
  cmsText("FeatureFilmsPage","53c96a4cebe85866","A producer at your side from the first draft"),
  cmsText("FeatureFilmsPage","a93172d1a8f7bb4b","Budgets planned honestly for a first feature"),
  cmsText("FeatureFilmsPage","2c4b47d70efa4714","A festival strategy built around a debut premiere"),
]));
const questions = cmsData(()=>([
  [cmsText("FeatureFilmsPage","a289455ce3a4148b","Do I have to use Kemsor for every stage?"), cmsText("FeatureFilmsPage","3a7daac50143053d","No. Pick the stage you need. Many features use us for one stage only.")],
  [cmsText("FeatureFilmsPage","82e4cf096a531e16","Do I need a star attached to get financed?"), cmsText("FeatureFilmsPage","63be4fcd718097c2","It can help, but it isn’t the only thing financiers look at. A strong script, an honest package and a budget that holds up often matter as much.")],
  [cmsText("FeatureFilmsPage","3a659fb872057340","Can a feature be made well on a modest budget?"), cmsText("FeatureFilmsPage","7ca1f750f4cc2afe","Yes, if it’s planned for that budget from the start. We show scenario budgets and what each one changes on screen.")],
  [cmsText("FeatureFilmsPage","e3dafe0aae020e01","Can you step in when a feature has stalled?"), cmsText("FeatureFilmsPage","6b7652a485f5eaae","Yes. We look at where it’s stuck, what’s already in place, and re-plan from there.")],
]));
const languages = [ ['hi','कहानी'], ['ta','கதை'], ['te','కథ'], ['bn','গল্প'], ['kn','ಕಥೆ'], ['ml','കഥ'] ];
const journey = cmsData(()=>([cmsText("FeatureFilmsPage","752056ea0099c6b3","Develop"), cmsText("FeatureFilmsPage","ba50d7ac68a014fd","Finance"), cmsText("FeatureFilmsPage","cc4e364c6ea31821","Shoot"), cmsText("FeatureFilmsPage","a0f39f04cce475f4","Finish"), cmsText("FeatureFilmsPage","b45dd0cfe5f37fdb","Release")]));

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
    <p className="feature-planner-question" id="feature-planner-question">{cmsText("FeatureFilmsPage","6c7ccc6d73b68662","WHERE IS YOUR FEATURE RIGHT NOW?")}</p>
    <span className="feature-have" id="feature-have">{cmsText("FeatureFilmsPage","d450dcc23715615f","I have…")}</span>
    <div className="feature-stage-tabs" role="tablist" aria-labelledby="feature-planner-question feature-have">
      {stages.map((stage,index) => <button ref={element => {tabs.current[index] = element;}} key={stage.id} type="button" role="tab" id={`feature-tab-${stage.id}`} aria-selected={selected === stage.id} tabIndex={selected === stage.id ? 0 : -1} aria-controls="feature-stage-panel" onClick={() => setSelected(stage.id)} onKeyDown={event => move(event,index)}>{stage.label}</button>)}
    </div>
    <div className="feature-stage-panel" id="feature-stage-panel" role="tabpanel" aria-labelledby={`feature-tab-${selected}`} tabIndex="0">
      <div className="feature-stage-content" key={selected}>
        <h2>{current.heading}</h2>
        <div className="feature-stage-columns"><div><h3>{cmsText("FeatureFilmsPage","d9dab5a7861b3b3b","What happens next")}</h3><p>{current.next}</p></div><div><h3>{cmsText("FeatureFilmsPage","f0f0cd1fb1371ad1","Where Kemsor comes in")}</h3><p>{current.support}</p></div></div>
        <CTA href={current.href}>{current.button}</CTA>
      </div>
    </div>
  </div>;
}

export default function FeatureFilmsPage() {
  return <PageVisuals page="feature-films"><div className="feature-films-page">
    <section className="inner-hero feature-hero feature-width" aria-labelledby="feature-title">
      <div className="feature-hero-grid"><div className="feature-hero-copy"><p className="feature-kicker">{cmsText("FeatureFilmsPage","c86c0290cf5335fe","PRODUCTIONS · FEATURE FILMS")}</p><MotionHeading as="h1" id="feature-title">{cmsText("FeatureFilmsPage","8210f0deceec76a5","Feature Films.")}</MotionHeading><MotionHeading as="h2" className="feature-intro-accent">{cmsText("FeatureFilmsPage","52ef20cc061a4fb2","Tell us where yours is. ")}<em>{cmsText("FeatureFilmsPage","cb82e887b5c157f1","We’ll tell you what’s next.")}</em></MotionHeading><MotionCopy>{cmsText("FeatureFilmsPage","ffdd81ba42db5961","Every feature is at a different point on a long road. Instead of a list of services, start with yours pick the stage your film is at and see exactly how Kemsor would take it forward.")}</MotionCopy></div><FeaturePlanner/></div>
    </section>
    <SectionSubmenu section="what-we-make" page="feature-films"/>

    <section className="feature-section feature-width" aria-labelledby="feature-team-title">
      <Label number="01">{cmsText("FeatureFilmsPage","2bafcf20a289881c","WHY ONE TEAM MATTERS")}</Label>
      <div className="feature-intro-grid"><div><MotionHeading as="h2" id="feature-team-title">{cmsText("FeatureFilmsPage","893dd1a189ec9072","Most features change hands four times.")}</MotionHeading><MotionCopy className="feature-team-accent">{cmsText("FeatureFilmsPage","445409f1ab1ec8ce","Every hand-off loses something.")}</MotionCopy></div><div><MotionCopy>{cmsText("FeatureFilmsPage","757969d2707847eb","A feature is often developed by one company, financed through another, shot by a hired service team and finished somewhere else. Every hand-off costs weeks, and the knowledge of why a decision was made rarely travels with the files.")}</MotionCopy><MotionCopy>{cmsText("FeatureFilmsPage","12bac01fb6fece81","Kemsor can carry a feature from first page to first screening as one team. Or, if you already have partners, we fit into your plan without asking you to start again.")}</MotionCopy></div></div>
      <div className="feature-comparison"><article><h3>{cmsText("FeatureFilmsPage","2d64077ef67f43b2","The usual way")}</h3><ol className="feature-usual">{journey.map(stage => <li key={stage}>{stage}</li>)}</ol><p>{cmsText("FeatureFilmsPage","dc7c85177c7a7f73","Five stages, often several companies, with a handover at each stage.")}</p></article><article><h3>{cmsText("FeatureFilmsPage","f40d906944977065","With Kemsor")}</h3><ol className="feature-connected">{journey.map(stage => <li key={stage}>{stage}</li>)}</ol><p>{cmsText("FeatureFilmsPage","34eb37ab638d7fcd","One team and one plan, or support at the stage you need.")}</p></article></div>
    </section>

    <section className="feature-section feature-width" aria-labelledby="feature-ledger-title">
      <Label number="02">{cmsText("FeatureFilmsPage","8f886c3b56511764","THE FEATURE LEDGER")}</Label>
      <div className="feature-intro-grid"><MotionHeading as="h2" id="feature-ledger-title">{cmsText("FeatureFilmsPage","1a71dc445c4c5475","What you hold at the end of each stage.")}</MotionHeading><MotionCopy>{cmsText("FeatureFilmsPage","78baf45b0d613bcd","Every stage ends with something you can put in front of a financier, a partner or a platform.")}</MotionCopy></div>
      <div className="feature-ledger-head" aria-hidden="true"><span>#</span><span>{cmsText("FeatureFilmsPage","957ee23e8a4846e0","Stage")}</span><span>{cmsText("FeatureFilmsPage","4f4621579af1ea33","What you hold")}</span></div>
      <ol className="feature-ledger studio-ledger studio-ledger-numbered">{ledger.map(([stage, copy],index) => <li key={stage}><span className="feature-ledger-number" aria-hidden="true">{String(index + 1).padStart(2,'0')}</span><h3>{stage}</h3><p>{copy}</p></li>)}</ol>
    </section>

    <section className="feature-section feature-width" aria-labelledby="feature-debut-title">
      <Label number="03">{cmsText("FeatureFilmsPage","df813f9e952a982b","FIRST FEATURES")}</Label>
      <div className="feature-intro-grid"><MotionHeading as="h2" id="feature-debut-title">{cmsText("FeatureFilmsPage","62e9247f6a54f80a","Making your first feature?")}</MotionHeading><div><MotionCopy>{cmsText("FeatureFilmsPage","0be9a8e35d313a0c","Debut features carry the most risk and the most hope. We give first-time directors and producers what they most often lack: an experienced producing partner who explains every decision, protects the creative vision, and makes sure the plan is realistic before anyone commits money.")}</MotionCopy><ul className="feature-debut-list">{firstFeatures.map(point => <li key={point}>{point}</li>)}</ul></div></div>
    </section>

    <section className="feature-section feature-width" aria-labelledby="feature-regional-title">
      <Label number="04">{cmsText("FeatureFilmsPage","b8bdf17bb5079d70","IN ANY LANGUAGE")}</Label>
      <div className="feature-intro-grid"><MotionHeading as="h2" id="feature-regional-title">{cmsText("FeatureFilmsPage","5435403bb69541a5","Rooted in language and place.")}</MotionHeading><MotionCopy>{cmsText("FeatureFilmsPage","08ba9825cc5ebac8","A feature told in the language of its place can travel further than one that isn’t. We produce regional cinema with local knowledge and plan its route to audiences at home and beyond.")}</MotionCopy></div>
      <div className="feature-languages" aria-hidden="true">{languages.map(([language, word]) => <span lang={language} key={language}>{word}</span>)}</div>
    </section>

    <section className="feature-section feature-width feature-slate" aria-labelledby="feature-slate-title">
      <Label number="05">{cmsText("FeatureFilmsPage","5cbe5b60b6d5a531","ON OUR SLATE")}</Label>
      <div className="feature-intro-grid"><MotionHeading as="h2" id="feature-slate-title">{cmsText("FeatureFilmsPage","253a852b300c24cf","Feature films.")}</MotionHeading><div><MotionCopy>{cmsText("FeatureFilmsPage","82f45ffa2ec2b026","Each title shows the stages Kemsor delivered.")}</MotionCopy><TextLink href="/productions/#feature-films">{cmsText("FeatureFilmsPage","43d38d4d74f21428","See all feature films")}</TextLink></div></div>
      {/* Poster, title, year, language, status and role rows require supplied titles and confirmed Kemsor credits. */}
    </section>

    <section className="feature-section feature-width" aria-labelledby="feature-questions-title">
      <Label number="06">{cmsText("FeatureFilmsPage","839d9a6e10f8df64","STRAIGHT ANSWERS")}</Label>
      <div className="feature-intro-grid"><MotionHeading as="h2" id="feature-questions-title">{cmsText("FeatureFilmsPage","1417f6c205a5fe75","Straight answers.")}</MotionHeading><div className="feature-faq">{questions.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true"><SiteIcon name="plus" size={16} /></span></summary><p>{answer}</p></details>)}</div></div>
    </section>

    <section className="feature-section feature-width feature-closing" aria-labelledby="feature-closing-title">
      <div className="feature-intro-grid"><div className="feature-script" aria-label="Screenplay page one"><span className="feature-script-page">1.</span><p>{cmsText("FeatureFilmsPage","4532de907dd76474","FADE IN:")}</p><p>{cmsText("FeatureFilmsPage","93dd211b594fd16f","INT. WHERE YOUR STORY BEGINS / DAY")}</p><p>{cmsText("FeatureFilmsPage","5afdfeeae5435641","Your first page goes here.")}</p></div><div><MotionHeading as="h2" id="feature-closing-title">{cmsText("FeatureFilmsPage","6b2dccea3b46b278","Send us page one.")}</MotionHeading><MotionCopy>{cmsText("FeatureFilmsPage","6b70c3e71e628b7d","A script, a treatment, or a single page. Tell us where your feature is, and we’ll come back with an honest next step.")}</MotionCopy><div className="feature-actions"><CTA href="/script-to-production/">{cmsText("FeatureFilmsPage","16aa2597325974d5","Send us your script")}</CTA><TextLink href="/contact/">{cmsText("FeatureFilmsPage","eca38a433323be4c","Talk to the studio")}</TextLink></div></div></div>
    </section>
  </div></PageVisuals>;
}
