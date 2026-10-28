import SiteIcon from '../SiteIcon';
import React from 'react';
import MotionHeading, { MotionCopy } from '../TextMotion';
import SectionSubmenu from '../SectionSubmenu';
import { CTA, TextLink } from '../PageUI';
import './how-we-work.css';

const callSheet = [
  ['PRODUCTION', 'Your project'],
  ['PARTNER', 'Kemsor Studios'],
  ['GENERAL CALL', 'The first conversation'],
  ['LOCATION', 'Wherever the story needs'],
  ['FORMAT', 'Feature · Series · Documentary · Short'],
  ['WEATHER', 'We plan for it'],
];
const schedule = [
  ['First conversation', 'We listen to the story, what you need, and where the project stands. No forms to fill first.', 'You leave with a clear view of what Kemsor can do.'],
  ['Scope', 'We propose the services your project needs: one service, several services or support through the full lifecycle.', 'A written scope, shaped to the project.'],
  ['Agreement', 'Scope, fees, timeline and responsibilities agreed in writing.', 'A signed agreement both sides understand.'],
  ['Kick-off', 'You meet your named Kemsor lead and agree how and how often you’ll hear from us.', 'A reporting schedule and decisions log, set up from day one.'],
  ['The work', 'Development, finance, production, post or release run to the agreed plan.', 'Regular reports; risks raised early, with options.'],
  ['Wrap & handover', 'Records, files and materials handed over cleanly.', 'Everything you need, in order, nothing held back.'],
];
const engagements = [
  ['A', 'Single service', 'One job, done well: a script read, a budget, a line-produced shoot, a release plan.', 'Best when you have the rest covered.'],
  ['B', 'Stage partner', 'Kemsor carries one full stage: Develop, Finance, Produce, Post, or Release.', 'Best when one stage is your gap.'],
  ['C', 'Lifecycle partner', 'From first idea to final screen, with one team throughout.', 'Best when you want one partner accountable for it all.'],
];
const contacts = [
  ['Your Kemsor lead', 'One named person accountable for your project, day-to-day.'],
  ['Stage leads', 'The heads of each stage join when their stage begins.'],
  ['Legal & Finance', 'Agreements, budgets, and partner terms.'],
  ['You', 'Decisions that are yours to make reach you in time to make them.'],
];
const principles = [
  ['The story comes first', 'When a saving would hurt the story, we tell you and show you other options.'],
  ['Plans that hold up', 'If a number is a guess, we label it a guess and log the assumption.'],
  ['Clear, early communication', 'Bad news travels fastest. You hear about a risk when we see it, not when it lands.'],
  ['Respect for people and places', 'Fair hours, safe sets, and locations left as we found them.'],
];
const needs = [
  'A clear sense of what the story is, and who it’s for',
  'One decision-maker on your side, or a clear way to reach one',
  'Honest constraints: budget, dates, and must-haves at the start',
  'Timely approvals at the points we agree',
];

function SheetLabel({ children, index }) {
  return <div className="call-sheet-label"><span>{children}</span><span aria-hidden="true">{index}</span></div>;
}

export default function HowWeWorkPage() {
  return <div className="call-sheet-page">
    <section className="call-sheet-hero call-sheet-width" aria-labelledby="call-sheet-title">
      <div className="call-sheet-masthead"><a href="/about/">KEMSOR STUDIOS · STUDIO PAGE</a><span>CALL SHEET</span></div>
      <div className="call-sheet-hero-grid">
        <div>
          <MotionHeading as="h1" id="call-sheet-title">How We Work.</MotionHeading>
          <MotionHeading as="h2" className="call-sheet-highlight">What it’s actually like to make something with us.</MotionHeading>
          <MotionCopy>Our About page tells you what we believe. This page tells you what happens, who you’ll hear from, what you’ll receive, how decisions get made, and what we’ll ask of you.</MotionCopy>
        </div>
        <dl className="call-sheet-fields">{callSheet.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      </div>
    </section>

    <SectionSubmenu section="studio" page="how-we-work"/>

    <section className="call-sheet-section call-sheet-width" aria-labelledby="call-sheet-schedule-title">
      <SheetLabel index="01 / 06">SCHEDULE</SheetLabel>
      <MotionHeading as="h2" id="call-sheet-schedule-title">From first call to wrap. <em>Six steps, every project.</em></MotionHeading>
      <div className="call-sheet-schedule-head" aria-hidden="true"><span>Step</span><span>Scene</span><span>Action</span><span>You receive</span></div>
      <ol className="call-sheet-schedule">{schedule.map(([scene, action, receive], index) => <li key={scene}>
        <span className="call-sheet-step" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
        <h3>{scene}</h3>
        <p><span className="call-sheet-mobile-label">Action</span>{action}</p>
        <p><span className="call-sheet-mobile-label">You receive</span>{receive}</p>
      </li>)}</ol>
    </section>

    <section className="call-sheet-section call-sheet-width" aria-labelledby="call-sheet-engagement-title">
      <SheetLabel index="02 / 06">ENGAGEMENT TYPES</SheetLabel>
      <MotionHeading as="h2" id="call-sheet-engagement-title">Three ways to work with us.</MotionHeading>
      <p>Pick the one that fits.</p>
      <div className="call-sheet-engagements">{engagements.map(([unit, type, copy, best]) => <article key={unit}>
        <span className="call-sheet-unit" aria-label={`Unit ${unit}`}>{unit}</span>
        <h3>{type}</h3><p>{copy}</p><p className="call-sheet-best">{best}</p>
      </article>)}</div>
    </section>

    <section className="call-sheet-section call-sheet-width call-sheet-split" aria-labelledby="call-sheet-contacts-title">
      <div><SheetLabel index="03 / 06">CONTACTS</SheetLabel><MotionHeading as="h2" id="call-sheet-contacts-title">Who you’ll hear from.</MotionHeading><MotionCopy>Always a name, never a queue.</MotionCopy></div>
      <dl className="call-sheet-contacts">{contacts.map(([who, role]) => <div key={who}><dt>{who}</dt><dd>{role}</dd></div>)}</dl>
    </section>

    <section className="call-sheet-section call-sheet-width" aria-labelledby="call-sheet-principles-title">
      <SheetLabel index="04 / 06">NOTES FROM PRODUCTION</SheetLabel>
      <MotionHeading as="h2" id="call-sheet-principles-title">Our principles, <em>on an ordinary Tuesday.</em></MotionHeading>
      <ol className="call-sheet-principles">{principles.map(([title, copy], index) => <li key={title}><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><div><h3>{title}</h3><p>{copy}</p></div></li>)}</ol>
    </section>

    <section className="call-sheet-section call-sheet-width call-sheet-split" aria-labelledby="call-sheet-needs-title">
      <div><SheetLabel index="05 / 06">WHAT WE NEED FROM YOU</SheetLabel><MotionHeading as="h2" id="call-sheet-needs-title">Good productions are <em>two-way.</em></MotionHeading></div>
      <ul className="call-sheet-needs">{needs.map(need => <li key={need}><span aria-hidden="true"><SiteIcon name="arrow-up-right" size={16} /></span>{need}</li>)}</ul>
    </section>

    <section className="call-sheet-section call-sheet-closing call-sheet-width" aria-labelledby="call-sheet-closing-title">
      <SheetLabel index="06 / 06">END OF CALL SHEET</SheetLabel>
      <div className="call-sheet-closing-grid"><MotionHeading as="h2" id="call-sheet-closing-title">That’s the call sheet. <em>Ready for day one?</em></MotionHeading><div><MotionCopy>Start with a conversation. We’ll show you how your project would run.</MotionCopy><div className="call-sheet-actions"><CTA href="/contact/">Start a conversation</CTA><TextLink href="/about/#leadership">Meet the leadership</TextLink></div></div></div>
      <dl className="call-sheet-signoff"><div><dt>PREPARED BY</dt><dd>Kemsor Studios</dd></div><div><dt>APPROVED BY</dt><dd>You</dd></div><div><dt>DATE</dt><dd>Day one</dd></div></dl>
      <p className="call-sheet-end">CLEAR PLAN. NO SURPRISES.</p>
    </section>
  </div>;
}
