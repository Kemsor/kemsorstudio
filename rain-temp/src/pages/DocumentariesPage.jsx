import SiteIcon from '../SiteIcon';
import React, { useRef, useState } from 'react';
import MotionHeading, { MotionCopy } from '../TextMotion';
import SectionSubmenu from '../SectionSubmenu';
import { CTA, TextLink } from '../PageUI';
import './documentaries.css';

const notes = [
  ['Access', 'Getting through the door and staying welcome once you’re in.'],
  ['Trust', 'People let you into their lives. That has to be earned and protected.'],
  ['Time', 'Real life doesn’t keep to a call sheet. Some moments only come once.'],
  ['Discovery', 'The story you set out to tell is rarely the one you finish with.'],
];
const changes = [
  ['plan', 'The plan', 'A year following [a subject] as they prepare for (an event). Three acts: preparation, the event, the aftermath.'],
  ['field', 'The field', 'Six months in, the event is cancelled. Filming continues, and a quieter, more personal story starts to surface.'],
  ['edit', 'The edit', 'In the edit, the film becomes about (what really mattered). The cancelled event is now the turning point, not the ending.'],
];
const commitments = [
  ['Informed consent', 'Contributors understand what the film is, where it will be seen, and what they’re agreeing to.'],
  ['Contributor welfare', 'Support for people sharing difficult experiences before, during, and after filming.'],
  ['Safety', 'Risk planning for sensitive subjects and difficult locations.'],
  ['Fair representation', 'People portrayed honestly, without shortcuts that distort who they are.'],
  ['Accuracy', 'Facts checked before the film is locked.'],
  ['Clearances', 'Archive, music, and rights cleared with your legal advisors before delivery.'],
];
const kinds = [
  ['Observational', 'Life as it happens, filmed over time.'],
  ['Investigative', 'Questions pursued with evidence and care.'],
  ['Archival & historical', 'The past retold through records, footage and memory.'],
  ['Personal', 'A filmmaker’s own story, or a family’s.'],
  ['Docuseries', 'Real stories with an episodic shape.'],
];
const stages = [
  ['Research & access', 'Who, where, and will they let us in?'],
  ['Treatment', 'The story as we understand it today.'],
  ['Funding plan', 'Often in stages, from more than one source.'],
  ['Filming in phases', 'Each phase shaped by what the last one found.'],
  ['The edit', 'Usually the longest stage, where the film is written.'],
  ['Clearances & delivery', 'Rights cleared, deliverables built to spec.'],
  ['Festivals & release', 'A premiere chosen for the film’s audience.'],
];
const questions = [
  ['I’ve already shot footage. Can you help?', 'Yes. We review what you have, find the story in it, and plan what’s still needed.'],
  ['How long does a documentary take?', 'Often longer than a fiction film of the same length, because the story is found as you film. We plan and budget in phases.'],
  ['Can you help with archive footage?', 'We coordinate sourcing and clearance of archive, working with your legal advisors.'],
  ['Do you make corporate or brand documentaries?', 'This page covers independent documentaries. Talk to us about other projects, and we’ll tell you honestly if we’re the right fit.'],
];

function Label({ children, number }) {
  return <div className="documentary-label"><span>{children}</span><span aria-hidden="true">{number}</span></div>;
}
function JournalSketch({ kind }) {
  return <svg viewBox="0 0 240 190" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {kind === 'door' ? <>
      <path d="M26 167H214M67 167V29H174V167M76 167V38H165V167M84 167V46L148 35V167M148 35L161 43M110 167L148 149"/>
      <path d="M135 101V109M51 33H38V84M191 47H203V109M31 177H83M171 178H209"/>
      <path d="M90 58L139 49M91 64L139 56M93 145L128 138" strokeWidth=".7"/>
    </> : <>
      <circle cx="70" cy="62" r="17"/><circle cx="169" cy="62" r="17"/>
      <path d="M46 124V110C46 80 93 80 93 110V126M146 124V110C146 80 193 80 193 110V126M51 104L100 118M185 104L139 118M44 131H98M141 131H196M53 132L49 167M88 132L94 167M151 132L146 167M187 132L194 167M24 172H216"/>
      <path d="M120 158V110M111 164L120 154L129 164M114 102H126V115H114ZM67 62H72M165 62H170M102 80L111 85M136 80L129 85"/>
    </>}
  </svg>;
}
function FieldJournal() {
  return <div className="documentary-journal" aria-label="Illustrative field journal with doorway and interview sketches">
    <div className="documentary-polaroids"><figure><JournalSketch kind="door"/><figcaption>day 1: the door</figcaption></figure><figure><JournalSketch kind="interview"/><figcaption>the interview</figcaption></figure></div>
    <p className="documentary-journal-note">access confirmed? · follow her for a year · the edit will tell us</p>
  </div>;
}
function ChangingStory() {
  const [selected, setSelected] = useState('plan');
  const tabs = useRef([]);
  const current = changes.find(([key]) => key === selected);
  const move = (event,index) => {
    let next;
    if(event.key === 'ArrowRight')next = (index + 1) % changes.length;
    else if(event.key === 'ArrowLeft')next = (index + changes.length - 1) % changes.length;
    else if(event.key === 'Home')next = 0;
    else if(event.key === 'End')next = changes.length - 1;
    else return;
    event.preventDefault();setSelected(changes[next][0]);tabs.current[next]?.focus();
  };
  return <div className="documentary-changing-story">
    <div className="documentary-story-tabs" role="tablist" aria-label="How a documentary changes">{changes.map(([key,label],index) => <button ref={element => {tabs.current[index] = element;}} type="button" role="tab" key={key} id={`documentary-tab-${key}`} aria-controls="documentary-story-panel" aria-selected={selected === key} tabIndex={selected === key ? 0 : -1} onClick={() => setSelected(key)} onKeyDown={event => move(event,index)}>{label}</button>)}</div>
    <div className="documentary-story-panel" id="documentary-story-panel" role="tabpanel" aria-labelledby={`documentary-tab-${selected}`} tabIndex="0"><p key={selected}>{current[2]}</p></div>
    <p className="documentary-example-caption">Illustrative example. Every documentary finds its own shape.</p>
  </div>;
}

export default function DocumentariesPage() {
  return <div className="documentaries-page">
    <section className="documentary-hero documentary-width" aria-labelledby="documentary-title">
      <div className="documentary-hero-grid"><div><p className="documentary-kicker">PRODUCTIONS · DOCUMENTARIES</p><MotionHeading as="h1" id="documentary-title">Documentaries.</MotionHeading><MotionHeading as="h2" className="documentary-hero-accent">The story is out there. <em>We help you earn it.</em></MotionHeading><MotionCopy>A documentary can’t be written and then shot. It’s found through research, access, trust and long months in the edit. Kemsor produces documentaries for cinema, platforms and festivals with the patience the form needs and the care its subjects deserve.</MotionCopy><div className="documentary-actions"><CTA href="/contact/?partner=filmmakers">Talk to us about your documentary</CTA><TextLink href="#documentary-changes">How a documentary changes</TextLink></div></div><FieldJournal/></div>
    </section>
    <SectionSubmenu section="what-we-make" page="documentaries"/>

    <section className="documentary-section documentary-width" aria-labelledby="documentary-word-title">
      <div className="documentary-intro-grid documentary-word-note"><MotionHeading as="h2" id="documentary-word-title">A note on the word “documentary”.</MotionHeading><MotionCopy>Search for documentary production in India, and you’ll mostly find corporate and brand films. That’s valuable work, but it isn’t what this page is about. Here we mean authored documentaries: observational, investigative, archival and personal films made for audiences, festivals and platforms.</MotionCopy></div>
    </section>

    <section className="documentary-section documentary-width" aria-labelledby="documentary-asks-title">
      <Label number="01">WHAT ONLY DOCUMENTARIES ASK FOR</Label>
      <MotionHeading as="h2" id="documentary-asks-title">Four things you can’t schedule.</MotionHeading>
      <div className="documentary-note-cards">{notes.map(([title,copy],index) => <article key={title}><span aria-hidden="true">0{index + 1}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
    </section>

    <section className="documentary-section documentary-width" id="documentary-changes" aria-labelledby="documentary-changes-title">
      <Label number="02">HOW A DOCUMENTARY CHANGES</Label>
      <div className="documentary-intro-grid"><MotionHeading as="h2" id="documentary-changes-title">The film you plan <em>is rarely the film you make.</em></MotionHeading><MotionCopy>We plan for that. Budgets and schedules are built in phases, so the film can follow the story when it changes course.</MotionCopy></div>
      <ChangingStory/>
    </section>

    <section className="documentary-section documentary-width" aria-labelledby="documentary-care-title">
      <Label number="03">CARE IS PART OF THE CRAFT</Label>
      <MotionHeading as="h2" id="documentary-care-title">How we treat the people in front of the camera.</MotionHeading>
      <div className="documentary-care-head" aria-hidden="true"><span>Commitment</span><span>What it means</span></div><dl className="documentary-care-list">{commitments.map(([title,copy]) => <div key={title}><dt>{title}</dt><dd>{copy}</dd></div>)}</dl>
    </section>

    <section className="documentary-section documentary-width" aria-labelledby="documentary-kinds-title">
      <Label number="04">THE DOCUMENTARIES WE MAKE</Label>
      <div className="documentary-intro-grid"><MotionHeading as="h2" id="documentary-kinds-title">The documentaries we make.</MotionHeading><dl className="documentary-kinds">{kinds.map(([title,copy]) => <div key={title}><dt>{title}</dt><dd>{copy}</dd></div>)}</dl></div>
    </section>

    <section className="documentary-section documentary-width" aria-labelledby="documentary-stages-title">
      <Label number="05">FROM FIRST LEAD TO FIRST SCREENING</Label>
      <div className="documentary-intro-grid"><MotionHeading as="h2" id="documentary-stages-title">From first lead to first screening.</MotionHeading><ol className="documentary-stages">{stages.map(([title,copy],index) => <li key={title}><span className="documentary-stage-number" aria-hidden="true">{String(index + 1).padStart(2,'0')}</span><div><h3>{title}</h3><p>{copy}</p>{title === 'The edit' && <span className="documentary-margin-note">- the longest bit</span>}</div></li>)}</ol></div>
    </section>

    <section className="documentary-section documentary-width" aria-labelledby="documentary-funding-title">
      <div className="documentary-intro-grid documentary-funding"><MotionHeading as="h2" id="documentary-funding-title">How documentaries are usually funded</MotionHeading><div><MotionCopy>Documentaries are often funded in stages and from several sources development support, co-production partners, platforms or broadcasters. We build a plan that fits the way your film will actually be made.</MotionCopy><TextLink href="/finance/finance-structuring/">See Finance Structuring</TextLink></div></div>
    </section>

    <section className="documentary-section documentary-width" aria-labelledby="documentary-questions-title">
      <Label number="06">QUESTIONS</Label>
      <div className="documentary-intro-grid"><MotionHeading as="h2" id="documentary-questions-title">Questions.</MotionHeading><div className="documentary-faq">{questions.map(([question,answer]) => <details key={question}><summary>{question}<span aria-hidden="true"><SiteIcon name="plus" size={16} /></span></summary><p>{answer}</p></details>)}</div></div>
    </section>

    <section className="documentary-section documentary-width documentary-closing" aria-labelledby="documentary-closing-title">
      <div className="documentary-intro-grid"><div><p className="documentary-field-kicker">field notes, page one</p><MotionHeading as="h2" id="documentary-closing-title">Tell us what you’ve found.</MotionHeading></div><div><MotionCopy>A subject, a person, a question you can’t let go of. Start there; we’ll help you find the film.</MotionCopy><div className="documentary-actions"><CTA href="/contact/?partner=filmmakers">Start a conversation</CTA><TextLink href="/finance/finance-structuring/">Finance Structuring</TextLink></div></div></div>
    </section>
  </div>;
}
