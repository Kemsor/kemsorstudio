import {cmsText,cmsData} from '../siteContent';
import SlidingCards from '../SlidingCards';
import PageVisuals from '../VisualChapters';
import SiteIcon from '../SiteIcon';
import React from 'react';
import MotionHeading, { MotionCopy } from '../TextMotion';
import SectionSubmenu from '../SectionSubmenu';
import { CTA, TextLink } from '../PageUI';
import './how-we-work.css';

const callSheet = cmsData(()=>([
  [cmsText("HowWeWorkPage","fa4c74fd7dce6918","PRODUCTION"), cmsText("HowWeWorkPage","b7d9ef785dd8bd5e","Your project")],
  [cmsText("HowWeWorkPage","95d81eece653c62f","PARTNER"), cmsText("HowWeWorkPage","546bd4ea3a3450b6","Kemsor Studios")],
  [cmsText("HowWeWorkPage","a068bddc31adc18b","GENERAL CALL"), cmsText("HowWeWorkPage","86bed9906376e62c","The first conversation")],
  [cmsText("HowWeWorkPage","4903ba29592fa6e3","LOCATION"), cmsText("HowWeWorkPage","7cf91ac112ceb2a7","Wherever the story needs")],
  [cmsText("HowWeWorkPage","6b77e1c2ca21ac27","FORMAT"), cmsText("HowWeWorkPage","a0462107039962ff","Feature · Series · Documentary · Short")],
  [cmsText("HowWeWorkPage","97dd1c30a0e5ca44","WEATHER"), cmsText("HowWeWorkPage","f1c1ea2a1d3a2816","We plan for it")],
]));
const schedule = cmsData(()=>([
  [cmsText("HowWeWorkPage","ed0b038eef29adf2","First conversation"), cmsText("HowWeWorkPage","04ec83cc876ce8c2","We listen to the story, what you need, and where the project stands. No forms to fill first."), cmsText("HowWeWorkPage","f169d1e75eb9c077","You leave with a clear view of what Kemsor can do.")],
  [cmsText("HowWeWorkPage","458d99c495ee874b","Scope"), cmsText("HowWeWorkPage","a6f677395972e051","We propose the services your project needs: one service, several services or support through the full lifecycle."), cmsText("HowWeWorkPage","a43f0a8a8f9bc60e","A written scope, shaped to the project.")],
  [cmsText("HowWeWorkPage","c50b2815151b0b96","Agreement"), cmsText("HowWeWorkPage","39ec11b6138d0f0e","Scope, fees, timeline and responsibilities agreed in writing."), cmsText("HowWeWorkPage","2646dee9b2b70424","A signed agreement both sides understand.")],
  [cmsText("HowWeWorkPage","b2f6e5ed6b27c4a4","Kick-off"), cmsText("HowWeWorkPage","37db75edba21fd90","You meet your named Kemsor lead and agree how and how often you’ll hear from us."), cmsText("HowWeWorkPage","48c2e5b838817536","A reporting schedule and decisions log, set up from day one.")],
  [cmsText("HowWeWorkPage","c15165894fb22b36","The work"), cmsText("HowWeWorkPage","28aafd970123f544","Development, finance, production, post or release run to the agreed plan."), cmsText("HowWeWorkPage","dbbbd213948f592f","Regular reports; risks raised early, with options.")],
  [cmsText("HowWeWorkPage","d0cfd4703a088c77","Wrap & handover"), cmsText("HowWeWorkPage","5d78058148f04c94","Records, files and materials handed over cleanly."), cmsText("HowWeWorkPage","33d46b38b0cbf43c","Everything you need, in order, nothing held back.")],
]));
const engagements = cmsData(()=>([
  [cmsText("HowWeWorkPage","7f416366978e2d66","A"), cmsText("HowWeWorkPage","ddbd6310358301c5","Single service"), cmsText("HowWeWorkPage","a2739c7198888c0f","One job, done well: a script read, a budget, a line-produced shoot, a release plan."), cmsText("HowWeWorkPage","a088a39bedbb5209","Best when you have the rest covered.")],
  [cmsText("HowWeWorkPage","01355a662b29f8df","B"), cmsText("HowWeWorkPage","4923b382a279cb3e","Stage partner"), cmsText("HowWeWorkPage","4fe5cbb22be65954","Kemsor carries one full stage: Develop, Finance, Produce, Post, or Release."), cmsText("HowWeWorkPage","1a40efd961651a2f","Best when one stage is your gap.")],
  [cmsText("HowWeWorkPage","0bc7aa7a17c53d65","C"), cmsText("HowWeWorkPage","1f4b97d29838d01c","Lifecycle partner"), cmsText("HowWeWorkPage","9eeff36bd63b8654","From first idea to final screen, with one team throughout."), cmsText("HowWeWorkPage","22d57d5287316a30","Best when you want one partner accountable for it all.")],
]));
const contacts = cmsData(()=>([
  [cmsText("HowWeWorkPage","8854f7cca27380ca","Your Kemsor lead"), cmsText("HowWeWorkPage","ee90c2dae649eb88","One named person accountable for your project, day-to-day.")],
  [cmsText("HowWeWorkPage","7ea48771ed2dc063","Stage leads"), cmsText("HowWeWorkPage","88bc4941f023c7ed","The heads of each stage join when their stage begins.")],
  [cmsText("HowWeWorkPage","1bcb100e043a5a16","Legal & Finance"), cmsText("HowWeWorkPage","ac481b495f193914","Agreements, budgets, and partner terms.")],
  [cmsText("HowWeWorkPage","d542c847da93eefe","You"), cmsText("HowWeWorkPage","b6dc9ca5dc6bd52e","Decisions that are yours to make reach you in time to make them.")],
]));
const principles = cmsData(()=>([
  [cmsText("HowWeWorkPage","bc4cb2ef798e85de","The story comes first"), cmsText("HowWeWorkPage","560d6e190ce6312a","When a saving would hurt the story, we tell you and show you other options.")],
  [cmsText("HowWeWorkPage","984acd7794aabfe3","Plans that hold up"), cmsText("HowWeWorkPage","d3d0b76cb0a140bf","If a number is a guess, we label it a guess and log the assumption.")],
  [cmsText("HowWeWorkPage","5c4823e35d808b8c","Clear, early communication"), cmsText("HowWeWorkPage","c3d53b3c046b675c","Bad news travels fastest. You hear about a risk when we see it, not when it lands.")],
  [cmsText("HowWeWorkPage","8afd637739346831","Respect for people and places"), cmsText("HowWeWorkPage","6a85447ca06b3689","Fair hours, safe sets, and locations left as we found them.")],
]));
const needs = cmsData(()=>([
  cmsText("HowWeWorkPage","e82c828600f47398","A clear sense of what the story is, and who it’s for"),
  cmsText("HowWeWorkPage","4384b52a4ee5d958","One decision-maker on your side, or a clear way to reach one"),
  cmsText("HowWeWorkPage","315f0bdedc3af8c1","Honest constraints: budget, dates, and must-haves at the start"),
  cmsText("HowWeWorkPage","0a99cf1052ca1828","Timely approvals at the points we agree"),
]));

function SheetLabel({ children, index }) {
  return <div className="call-sheet-label"><span>{children}</span></div>;
}

export default function HowWeWorkPage() {
  return <PageVisuals page="how-we-work"><div className="call-sheet-page">
    <section className="inner-hero call-sheet-hero call-sheet-width" aria-labelledby="call-sheet-title">
      <div className="call-sheet-masthead"><a href="/about/">{cmsText("HowWeWorkPage","8534f1fc8abb25c1","KEMSOR STUDIOS · STUDIO PAGE")}</a><span>{cmsText("HowWeWorkPage","80df44c046679e7d","CALL SHEET")}</span></div>
      <div className="call-sheet-hero-grid">
        <div>
          <MotionHeading as="h1" id="call-sheet-title">{cmsText("HowWeWorkPage","3603083dbfb95fdf","How We Work.")}</MotionHeading>
          <MotionHeading as="h2" className="call-sheet-highlight">{cmsText("HowWeWorkPage","44bca194b8fab2a7","What it’s actually like to make something with us.")}</MotionHeading>
          <MotionCopy>{cmsText("HowWeWorkPage","37d7596385bfe6e5","Our About page tells you what we believe. This page tells you what happens, who you’ll hear from, what you’ll receive, how decisions get made, and what we’ll ask of you.")}</MotionCopy>
        </div>
        <dl className="call-sheet-fields">{callSheet.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      </div>
    </section>

    <SectionSubmenu section="studio" page="how-we-work"/>

    <section className="call-sheet-section call-sheet-width" aria-labelledby="call-sheet-schedule-title">
      <SheetLabel index="01 / 06">{cmsText("HowWeWorkPage","aa458424df7fc15d","SCHEDULE")}</SheetLabel>
      <MotionHeading as="h2" id="call-sheet-schedule-title">{cmsText("HowWeWorkPage","603c047b0ad13edd","From first call to wrap. ")}<em>{cmsText("HowWeWorkPage","37f86fd8be558393","Six steps, every project.")}</em></MotionHeading>
      <div className="call-sheet-schedule-head" aria-hidden="true"><span>{cmsText("HowWeWorkPage","f754e1a9a4187b38","Scene")}</span><span>{cmsText("HowWeWorkPage","1d22965e75344668","Action")}</span><span>{cmsText("HowWeWorkPage","1d7878c3d7a73f59","You receive")}</span></div>
      <ol className="call-sheet-schedule">{schedule.map(([scene, action, receive], index) => <li key={scene}>

        <h3>{scene}</h3>
        <p><span className="call-sheet-mobile-label">{cmsText("HowWeWorkPage","37d9d649cd7f76e2","Action")}</span>{action}</p>
        <p><span className="call-sheet-mobile-label">{cmsText("HowWeWorkPage","303fb36ffe7ae97d","You receive")}</span>{receive}</p>
      </li>)}</ol>
    </section>

    <section className="call-sheet-section call-sheet-width" aria-labelledby="call-sheet-engagement-title">
      <SheetLabel index="02 / 06">{cmsText("HowWeWorkPage","305bf2ecdb207d64","ENGAGEMENT TYPES")}</SheetLabel>
      <MotionHeading as="h2" id="call-sheet-engagement-title">{cmsText("HowWeWorkPage","e32743a645123d60","Three ways to work with us.")}</MotionHeading>
      <p>{cmsText("HowWeWorkPage","256180e2539278c4","Pick the one that fits.")}</p>
      <div className="call-sheet-engagements engagement-ground-cards">{engagements.map(([unit, type, copy, best]) => <article key={unit} tabIndex={0}><div className="engagement-ground-content">
        <span className="call-sheet-unit" aria-label={`Unit ${unit}`}>{unit}</span>
        <h3>{type}</h3><div className="engagement-ground-detail"><div><p>{copy}</p><p className="call-sheet-best">{best}</p></div></div></div>
      </article>)}</div>
    </section>

    <section className="call-sheet-section call-sheet-width call-sheet-split" aria-labelledby="call-sheet-contacts-title">
      <div><SheetLabel index="03 / 06">{cmsText("HowWeWorkPage","a7bd88c0bd77204f","CONTACTS")}</SheetLabel><MotionHeading as="h2" id="call-sheet-contacts-title">{cmsText("HowWeWorkPage","79f91b7980fc48af","Who you’ll hear from.")}</MotionHeading><MotionCopy>{cmsText("HowWeWorkPage","f87b0fd929163ae0","Always a name, never a queue.")}</MotionCopy></div>
      <dl className="call-sheet-contacts">{contacts.map(([who, role]) => <div key={who}><dt>{who}</dt><dd>{role}</dd></div>)}</dl>
    </section>

    <section className="call-sheet-section call-sheet-width" aria-labelledby="call-sheet-principles-title">
      <SheetLabel index="04 / 06">{cmsText("HowWeWorkPage","e40476ddb8786fd5","NOTES FROM PRODUCTION")}</SheetLabel>
      <MotionHeading as="h2" id="call-sheet-principles-title">{cmsText("HowWeWorkPage","1e9d850a603a9c33","Our principles, ")}<em>{cmsText("HowWeWorkPage","67423ab1d34bba6f","on an ordinary Tuesday.")}</em></MotionHeading>
      <SlidingCards as="ol" className="call-sheet-principles">{principles.map(([title, copy], index) => <li key={title}><div><h3>{title}</h3><p>{copy}</p></div></li>)}</SlidingCards>
    </section>

    <section className="call-sheet-section call-sheet-width call-sheet-split" aria-labelledby="call-sheet-needs-title">
      <div><SheetLabel index="05 / 06">{cmsText("HowWeWorkPage","a32d416ef338dd53","WHAT WE NEED FROM YOU")}</SheetLabel><MotionHeading as="h2" id="call-sheet-needs-title">{cmsText("HowWeWorkPage","fbd8c076898901b2","Good productions are ")}<em>{cmsText("HowWeWorkPage","11cbdcb442b1472b","two-way.")}</em></MotionHeading></div>
      <ul className="call-sheet-needs">{needs.map(need => <li key={need}><span aria-hidden="true"><SiteIcon name="arrow-up-right" size={16} /></span>{need}</li>)}</ul>
    </section>

    <section className="call-sheet-section call-sheet-closing call-sheet-width inner-closing" aria-labelledby="call-sheet-closing-title">
      <SheetLabel index="06 / 06">{cmsText("HowWeWorkPage","8a3f3b11141cdf6e","END OF CALL SHEET")}</SheetLabel>
      <div className="call-sheet-closing-grid"><MotionHeading as="h2" id="call-sheet-closing-title">{cmsText("HowWeWorkPage","4e6f3488124b6e93","That’s the call sheet. ")}<em>{cmsText("HowWeWorkPage","0c984b50bf044745","Ready for day one?")}</em></MotionHeading><div><MotionCopy>{cmsText("HowWeWorkPage","9aa140d5e97b2a1d","Start with a conversation. We’ll show you how your project would run.")}</MotionCopy><div className="call-sheet-actions"><CTA href="/contact/">{cmsText("HowWeWorkPage","d89a8ff94c8a31dd","Start a conversation")}</CTA><TextLink href="/about/#leadership">{cmsText("HowWeWorkPage","3bb08d9a429e88a3","Meet the leadership")}</TextLink></div></div></div>
      <dl className="call-sheet-signoff"><div><dt>{cmsText("HowWeWorkPage","095bd5cf2be387d0","PREPARED BY")}</dt><dd>{cmsText("HowWeWorkPage","2099c49944cce344","Kemsor Studios")}</dd></div><div><dt>{cmsText("HowWeWorkPage","f3c6bba4d0ec9aaa","APPROVED BY")}</dt><dd>{cmsText("HowWeWorkPage","24132530ecc8dfd2","You")}</dd></div><div><dt>{cmsText("HowWeWorkPage","eee579d54dc22cc0","DATE")}</dt><dd>{cmsText("HowWeWorkPage","f0b8d5f0e1eec482","Day one")}</dd></div></dl>
      <p className="call-sheet-end">{cmsText("HowWeWorkPage","494d35093c37d10c","CLEAR PLAN. NO SURPRISES.")}</p>
    </section>
  </div></PageVisuals>;
}
