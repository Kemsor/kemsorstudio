import {cmsText,cmsData} from '../siteContent';
import PageVisuals from '../VisualChapters';
import SiteIcon from '../SiteIcon';
import React, { useRef, useState } from 'react';
import MotionHeading, { MotionCopy } from '../TextMotion';
import SectionSubmenu from '../SectionSubmenu';
import { CTA, TextLink } from '../PageUI';
import './documentaries.css';

const notes = cmsData(()=>([
  [cmsText("DocumentariesPage","840ef1f54729037c","Access"), cmsText("DocumentariesPage","37e1fc5434a8a7b7","Getting through the door and staying welcome once you’re in.")],
  [cmsText("DocumentariesPage","eb02a5390c869dfb","Trust"), cmsText("DocumentariesPage","c6571c64fddc6ebf","People let you into their lives. That has to be earned and protected.")],
  [cmsText("DocumentariesPage","407121d6700e7c46","Time"), cmsText("DocumentariesPage","9035fdae74045b27","Real life doesn’t keep to a call sheet. Some moments only come once.")],
  [cmsText("DocumentariesPage","be0bfac783b3493c","Discovery"), cmsText("DocumentariesPage","f94700c1b54d9d6d","The story you set out to tell is rarely the one you finish with.")],
]));
const changes = cmsData(()=>([
  ['plan', cmsText("DocumentariesPage","1fa11be548a47b9e","The plan"), cmsText("DocumentariesPage","7d2911b88173c458","A year following [a subject] as they prepare for (an event). Three acts: preparation, the event, the aftermath.")],
  ['field', cmsText("DocumentariesPage","a8e1c2a4b3c712b5","The field"), cmsText("DocumentariesPage","37417f7fed2cbbe3","Six months in, the event is cancelled. Filming continues, and a quieter, more personal story starts to surface.")],
  ['edit', cmsText("DocumentariesPage","e8c71cf59776a784","The edit"), cmsText("DocumentariesPage","a3f7ffd312be79c1","In the edit, the film becomes about (what really mattered). The cancelled event is now the turning point, not the ending.")],
]));
const commitments = cmsData(()=>([
  [cmsText("DocumentariesPage","78fc973fe6abcc4b","Informed consent"), cmsText("DocumentariesPage","6fbb4781c69826a7","Contributors understand what the film is, where it will be seen, and what they’re agreeing to.")],
  [cmsText("DocumentariesPage","7cf16afdca30b926","Contributor welfare"), cmsText("DocumentariesPage","36350c80cf74611c","Support for people sharing difficult experiences before, during, and after filming.")],
  [cmsText("DocumentariesPage","97d9ee42dd54038f","Safety"), cmsText("DocumentariesPage","8db590665677529c","Risk planning for sensitive subjects and difficult locations.")],
  [cmsText("DocumentariesPage","6831c4e873cba05a","Fair representation"), cmsText("DocumentariesPage","f811349bbc0c36ec","People portrayed honestly, without shortcuts that distort who they are.")],
  [cmsText("DocumentariesPage","d2101fe415f88ac8","Accuracy"), cmsText("DocumentariesPage","bc288a517f4e1d2e","Facts checked before the film is locked.")],
  [cmsText("DocumentariesPage","b248ffed7cf19a36","Clearances"), cmsText("DocumentariesPage","e88043958a40177c","Archive, music, and rights cleared with your legal advisors before delivery.")],
]));
const kinds = cmsData(()=>([
  [cmsText("DocumentariesPage","d902221e81040781","Observational"), cmsText("DocumentariesPage","e852cd7938a29735","Life as it happens, filmed over time.")],
  [cmsText("DocumentariesPage","7abaadeef145dd8c","Investigative"), cmsText("DocumentariesPage","4b2b1f37cc54b306","Questions pursued with evidence and care.")],
  [cmsText("DocumentariesPage","1c5fbaff974a4c24","Archival & historical"), cmsText("DocumentariesPage","01fc2bbe3215a951","The past retold through records, footage and memory.")],
  [cmsText("DocumentariesPage","90418b2cfffb52a0","Personal"), cmsText("DocumentariesPage","c76cad3ed1896c0d","A filmmaker’s own story, or a family’s.")],
  [cmsText("DocumentariesPage","8634a5310b105f96","Docuseries"), cmsText("DocumentariesPage","836b2e4ba0e2133f","Real stories with an episodic shape.")],
]));
const stages = cmsData(()=>([
  [cmsText("DocumentariesPage","c48f07a6d1b87bd6","Research & access"), cmsText("DocumentariesPage","a199748fdd4d0e9d","Who, where, and will they let us in?")],
  [cmsText("DocumentariesPage","a6e60b36645bd23e","Treatment"), cmsText("DocumentariesPage","18e1cee1a29c4dbf","The story as we understand it today.")],
  [cmsText("DocumentariesPage","1ac5074f9618bce1","Funding plan"), cmsText("DocumentariesPage","6ad80cadfebc4e12","Often in stages, from more than one source.")],
  [cmsText("DocumentariesPage","1dda226022abe254","Filming in phases"), cmsText("DocumentariesPage","cc66576e1286bf70","Each phase shaped by what the last one found.")],
  [cmsText("DocumentariesPage","f16f299426c6d0d9","The edit"), cmsText("DocumentariesPage","73f38676972dfbd6","Usually the longest stage, where the film is written.")],
  [cmsText("DocumentariesPage","4ef3e29fee56661e","Clearances & delivery"), cmsText("DocumentariesPage","bd47aae7ff95dead","Rights cleared, deliverables built to spec.")],
  [cmsText("DocumentariesPage","b018ed9275105bca","Festivals & release"), cmsText("DocumentariesPage","3b482ad5efeac4ba","A premiere chosen for the film’s audience.")],
]));
const questions = cmsData(()=>([
  [cmsText("DocumentariesPage","2011a68feeae673f","I’ve already shot footage. Can you help?"), cmsText("DocumentariesPage","4bbc7512fad2876d","Yes. We review what you have, find the story in it, and plan what’s still needed.")],
  [cmsText("DocumentariesPage","72a861acaf8fcffe","How long does a documentary take?"), cmsText("DocumentariesPage","ac423f46c8e5bce4","Often longer than a fiction film of the same length, because the story is found as you film. We plan and budget in phases.")],
  [cmsText("DocumentariesPage","6d858aefbe89d0ed","Can you help with archive footage?"), cmsText("DocumentariesPage","7670b31a62f5962c","We coordinate sourcing and clearance of archive, working with your legal advisors.")],
  [cmsText("DocumentariesPage","d0105414591eb3fa","Do you make corporate or brand documentaries?"), cmsText("DocumentariesPage","17fb12ea727024cf","This page covers independent documentaries. Talk to us about other projects, and we’ll tell you honestly if we’re the right fit.")],
]));

function Label({ children, number }) {
  return <div className="documentary-label"><span>{children}</span></div>;
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
    <div className="documentary-polaroids"><figure><JournalSketch kind="door"/><figcaption>{cmsText("DocumentariesPage","ea760bd028c9968f","day 1: the door")}</figcaption></figure><figure><JournalSketch kind="interview"/><figcaption>{cmsText("DocumentariesPage","43ea999f6da08ae5","the interview")}</figcaption></figure></div>
    <p className="documentary-journal-note">{cmsText("DocumentariesPage","474de693da48c9ce","access confirmed? · follow her for a year · the edit will tell us")}</p>
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
    <p className="documentary-example-caption">{cmsText("DocumentariesPage","1bc11b8a6500ee51","Illustrative example. Every documentary finds its own shape.")}</p>
  </div>;
}

export default function DocumentariesPage() {
  return <PageVisuals page="documentaries"><div className="documentaries-page">
    <section className="inner-hero documentary-hero documentary-width" aria-labelledby="documentary-title">
      <div className="documentary-hero-grid"><div><p className="documentary-kicker">{cmsText("DocumentariesPage","31ce2f00a454c876","PRODUCTIONS · DOCUMENTARIES")}</p><MotionHeading as="h1" id="documentary-title">{cmsText("DocumentariesPage","08a3bc8857cb5ad3","Documentaries.")}</MotionHeading><MotionHeading as="h2" className="documentary-hero-accent">{cmsText("DocumentariesPage","d46a372032af0f76","Start with the subject. ")}<em>{cmsText("DocumentariesPage","3ebf7ed689308cb1","We help you develop the film.")}</em></MotionHeading><MotionCopy>{cmsText("DocumentariesPage","716bcee44bedc110","Documentaries need research, access to contributors and time to follow the story. Kemsor supports that work through filming and editing, with care for the people involved and a release plan for cinema, platforms or festivals.")}</MotionCopy><div className="documentary-actions"><CTA href="/contact/?partner=filmmakers">{cmsText("DocumentariesPage","17571cbc2c80271a","Talk to us about your documentary")}</CTA><TextLink href="#documentary-changes">{cmsText("DocumentariesPage","19d375f516dbb0c5","How a documentary changes")}</TextLink></div></div><FieldJournal/></div>
    </section>
    <SectionSubmenu section="what-we-make" page="documentaries"/>

    <section className="documentary-section documentary-width" aria-labelledby="documentary-word-title">
      <div className="documentary-intro-grid documentary-word-note"><MotionHeading as="h2" id="documentary-word-title">{cmsText("DocumentariesPage","10f41029fe0cf11e","A note on the word “documentary”.")}</MotionHeading><MotionCopy>{cmsText("DocumentariesPage","584e9eb70b6a249e","Our documentary work includes observational, investigative, archival and personal films for audiences, festivals and platforms.")}</MotionCopy></div>
    </section>

    <section className="documentary-section documentary-width" aria-labelledby="documentary-asks-title">
      <Label number="01">{cmsText("DocumentariesPage","5f539393c2a1f567","WHAT ONLY DOCUMENTARIES ASK FOR")}</Label>
      <MotionHeading as="h2" id="documentary-asks-title">{cmsText("DocumentariesPage","42fb737e3f1b8c00","Four things you can’t schedule.")}</MotionHeading>
      <div className="documentary-note-cards">{notes.map(([title,copy],index) => <article key={title}><h3>{title}</h3><p>{copy}</p></article>)}</div>
    </section>

    <section className="documentary-section documentary-width" id="documentary-changes" aria-labelledby="documentary-changes-title">
      <Label number="02">{cmsText("DocumentariesPage","859319e7bd2d790d","HOW A DOCUMENTARY CHANGES")}</Label>
      <div className="documentary-intro-grid"><MotionHeading as="h2" id="documentary-changes-title">{cmsText("DocumentariesPage","4c1e98693915f5e3","The film you plan ")}<em>{cmsText("DocumentariesPage","a904e3c028036a23","is rarely the film you make.")}</em></MotionHeading><MotionCopy>{cmsText("DocumentariesPage","935d61d2ef09b457","We plan for that. Budgets and schedules are built in phases, so the film can follow the story when it changes course.")}</MotionCopy></div>
      <ChangingStory/>
    </section>

    <section className="documentary-section documentary-width" aria-labelledby="documentary-care-title">
      <Label number="03">{cmsText("DocumentariesPage","d40d33d8aef5ac8e","CARE IS PART OF THE CRAFT")}</Label>
      <MotionHeading as="h2" id="documentary-care-title">{cmsText("DocumentariesPage","63d97aaf99f06516","How we treat the people in front of the camera.")}</MotionHeading>
      <div className="documentary-care-head studio-ledger-head" aria-hidden="true"><span>{cmsText("DocumentariesPage","72760f43018a2a14","Commitment")}</span><span>{cmsText("DocumentariesPage","03eb4e91d606e02b","What it means")}</span></div><dl className="documentary-care-list studio-ledger studio-ledger-pairs">{commitments.map(([title,copy]) => <div key={title}><dt>{title}</dt><dd>{copy}</dd></div>)}</dl>
    </section>

    <section className="documentary-section documentary-width" aria-labelledby="documentary-kinds-title">
      <Label number="04">{cmsText("DocumentariesPage","16821c171a075009","THE DOCUMENTARIES WE MAKE")}</Label>
      <div className="documentary-intro-grid"><MotionHeading as="h2" id="documentary-kinds-title">{cmsText("DocumentariesPage","ea9836aca9d0ce06","The documentaries we make.")}</MotionHeading><dl className="documentary-kinds studio-ledger studio-ledger-pairs">{kinds.map(([title,copy]) => <div key={title}><dt>{title}</dt><dd>{copy}</dd></div>)}</dl></div>
    </section>

    <section className="documentary-section documentary-width" aria-labelledby="documentary-stages-title">
      <Label number="05">{cmsText("DocumentariesPage","1b4db85eb066c023","FROM FIRST LEAD TO FIRST SCREENING")}</Label>
      <div className="documentary-intro-grid"><MotionHeading as="h2" id="documentary-stages-title">{cmsText("DocumentariesPage","1caf13c5cee24a9e","From first lead to first screening.")}</MotionHeading><ol className="documentary-stages studio-ledger studio-ledger-numbered">{stages.map(([title,copy],index) => <li key={title}><div><h3>{title}</h3><p>{copy}</p>{title === 'The edit' && <span className="documentary-margin-note">{cmsText("DocumentariesPage","b53bc16c525ba34a","- the longest bit")}</span>}</div></li>)}</ol></div>
    </section>

    <section className="documentary-section documentary-width" aria-labelledby="documentary-funding-title">
      <div className="documentary-intro-grid documentary-funding"><MotionHeading as="h2" id="documentary-funding-title">{cmsText("DocumentariesPage","2ae380ed793d4434","How documentaries are usually funded")}</MotionHeading><div><MotionCopy>{cmsText("DocumentariesPage","9c33107fd0698875","Documentaries are often funded in stages through development support, co-production partners, platforms or broadcasters. We plan funding around the research, filming and editing each project needs.")}</MotionCopy><TextLink href="/finance/finance-structuring/">{cmsText("DocumentariesPage","d95abf693a86b0c1","See Finance Structuring")}</TextLink></div></div>
    </section>

    <section className="documentary-section documentary-width" aria-labelledby="documentary-questions-title">
      <Label number="06">{cmsText("DocumentariesPage","55c45d89f2bb8355","QUESTIONS")}</Label>
      <div className="documentary-intro-grid"><MotionHeading as="h2" id="documentary-questions-title">{cmsText("DocumentariesPage","ba2c5e90597a79b2","Questions.")}</MotionHeading><div className="documentary-faq">{questions.map(([question,answer]) => <details key={question}><summary>{question}<span aria-hidden="true"><SiteIcon name="plus" size={16} /></span></summary><p>{answer}</p></details>)}</div></div>
    </section>

    <section className="documentary-section documentary-width documentary-closing inner-closing" aria-labelledby="documentary-closing-title">
      <div className="documentary-intro-grid"><div><p className="documentary-field-kicker">{cmsText("DocumentariesPage","a17bf12840e79c55","field notes, page one")}</p><MotionHeading as="h2" id="documentary-closing-title">{cmsText("DocumentariesPage","e2edb077a64f69f7","Tell us what you’ve found.")}</MotionHeading></div><div><MotionCopy>{cmsText("DocumentariesPage","56ffc90397abb91c","Tell us about the subject, the people involved and any access or footage you already have. We’ll discuss how to develop the documentary.")}</MotionCopy><div className="documentary-actions"><CTA href="/contact/?partner=filmmakers">{cmsText("DocumentariesPage","8f864fbcda74c7aa","Start a conversation")}</CTA><TextLink href="/finance/finance-structuring/">{cmsText("DocumentariesPage","9fdf35eafe54664f","Finance Structuring")}</TextLink></div></div></div>
    </section>
  </div></PageVisuals>;
}
