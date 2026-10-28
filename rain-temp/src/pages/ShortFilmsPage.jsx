import SiteIcon from '../SiteIcon';
import React, { useEffect, useRef, useState } from 'react';
import MotionHeading, { MotionCopy } from '../TextMotion';
import SectionSubmenu from '../SectionSubmenu';
import { CTA, TextLink } from '../PageUI';
import './short-films.css';

const enquiry = '/contact/?partner=filmmakers';
const jobs = [
  ['Calling card', 'To show who you are as a writer or director.', 'Plan for: a distinct voice, strong performances, a clean finish.'],
  ['Proof of concept', 'To show a world from a feature or series you want financed.', 'Plan for: one key sequence that sells the bigger idea.'],
  ['Festival run', 'To premiere and travel the festival circuit.', 'Plan for: premiere strategy, running time limits, festival deliverables.'],
  ['Platform release', 'To reach audiences on short-film and streaming platforms.', 'Plan for: platform specs, rights and a release that finds viewers.'],
];
const spend = [
  'Performances: the right cast',
  'Sound: audiences notice poor sound, even when they forgive the image',
  'One location that does a lot of work',
  'A proper colour grade and mix',
];
const save = [
  'Fewer locations and company moves',
  'A small, experienced crew',
  'A tight, well-planned schedule',
  'Kit sized to the story, not the wish list',
];
const kit = [
  'Script tightened until every scene earns its place',
  'A realistic budget, planned for the short’s purpose',
  'Cast and crew through the Kemsor Talent Network',
  'Compact line production for short schedules',
  'Post finished to a high standard',
  'A festival or release plan and deliverables',
];
const timeline = [ ['Script','Weeks'], ['Prep','Weeks'], ['Shoot','Days'], ['Post','Weeks'], ['Festivals & release','Months'] ];
const questions = [
  ['How long should a short film be?', 'As long as the story needs, and no longer. Many festivals set their own maximum running times, so check before you shoot.'],
  ['Can a short become a feature or series?', 'Yes. A proof of concept can help a project move into feature or series development, and we can support that next stage.'],
  ['Can I find cast and crew through Kemsor?', 'Yes, through the Kemsor Talent Network.'],
  ['Do you fund short films?', 'We help plan and produce shorts. Talk to us about how yours is funded and we’ll help you build the plan.'],
];

function RunningTime({ pageRef }) {
  const fill = useRef(null);
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const page = pageRef.current;
    if(!page)return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const bounds = page.getBoundingClientRect();
      const start = window.scrollY + bounds.top;
      const distance = Math.max(1, page.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, (window.scrollY - start) / distance));
      if(fill.current)fill.current.style.transform = `scaleX(${progress})`;
      const elapsed = Math.round(progress * 180);
      setSeconds(previous => previous === elapsed ? previous : elapsed);
    };
    const schedule = () => { if(!frame)frame = requestAnimationFrame(update); };
    const observer = new ResizeObserver(schedule);
    observer.observe(page);
    window.addEventListener('scroll', schedule, { passive:true });
    window.addEventListener('resize', schedule);
    schedule();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener('scroll',schedule); window.removeEventListener('resize',schedule); };
  },[pageRef]);
  const time = `${String(Math.floor(seconds / 60)).padStart(2,'0')}:${String(seconds % 60).padStart(2,'0')}`;
  return <div className="short-running-time" role="progressbar" aria-label="Page reading progress as a three-minute running time" aria-valuemin="0" aria-valuemax="180" aria-valuenow={seconds} aria-valuetext={`${time} of 03:00`}>
    <div className="short-width short-running-labels"><span>SHORT FILMS</span><span><span className="short-time-current">{time}</span><span className="short-time-separator" aria-hidden="true"> / </span>03:00</span></div><span className="short-time-track" aria-hidden="true"><span ref={fill}/></span>
  </div>;
}
function Label({ children, time }) {
  return <div className="short-label"><span>{children}</span>{time && <span className="short-timecode">{time}</span>}</div>;
}

export default function ShortFilmsPage() {
  const page = useRef(null);
  return <div className="short-films-page" ref={page}>
    <section className="short-hero short-width" aria-labelledby="short-title">
      <div className="short-hero-meta"><a href="/what-we-make/">WHAT WE MAKE</a><span>RUNNING TIME · 03:00</span></div>
      <div className="short-intro-grid"><div><MotionHeading as="h1" id="short-title">SHORT FILMS.</MotionHeading><MotionHeading as="h2" className="short-hero-accent">SMALL FILM. <em>BIG STEP.</em></MotionHeading></div><div><MotionCopy>Most short films aren’t the destination. They’re the calling card, the proof of concept, the first festival selection. Kemsor helps you make a short that does the job you need it to and looks like it cost more than it did.</MotionCopy><div className="short-actions"><CTA href={enquiry}>Talk to us about your short</CTA><TextLink href="#short-purpose">What’s your short for?</TextLink></div></div></div>
    </section>
    <RunningTime pageRef={page}/>
    <SectionSubmenu section="what-we-make" page="short-films"/>

    <section className="short-section short-width" id="short-purpose" aria-labelledby="short-purpose-title">
      <Label time="00:30">WHAT IS YOUR SHORT FOR?</Label>
      <MotionHeading as="h2" id="short-purpose-title">Decide the job before you shoot.</MotionHeading>
      <div className="short-job-grid">{jobs.map(([title, purpose, plan], index) => <article className="short-job-card" tabIndex="0" aria-labelledby={`short-job-${index}`} key={title}><div className="short-job-faces"><div className="short-job-front"><span className="short-job-number" aria-hidden="true">0{index + 1}</span><h3 id={`short-job-${index}`}>{title}</h3><p>{purpose}</p></div><div className="short-job-back"><span className="short-job-back-title" aria-hidden="true">{title}</span><p>{plan}</p></div></div></article>)}</div>
    </section>

    <section className="short-section short-width" aria-labelledby="short-money-title">
      <Label time="01:00">WHERE THE MONEY GOES</Label>
      <MotionHeading as="h2" id="short-money-title">Spend where it shows. <em>Save where it doesn’t.</em></MotionHeading>
      <div className="short-budget"><section aria-labelledby="short-spend-title"><h3 id="short-spend-title">SPEND</h3><ul>{spend.map(item => <li key={item}>{item}</li>)}</ul></section><section aria-labelledby="short-save-title"><h3 id="short-save-title">SAVE</h3><ul>{save.map(item => <li key={item}>{item}</li>)}</ul></section></div>
    </section>

    <section className="short-section short-width" aria-labelledby="short-honest-title">
      <Label time="01:30">THE HONEST PART</Label>
      <div className="short-intro-grid"><MotionHeading as="h2" id="short-honest-title">The honest part.</MotionHeading><MotionCopy>Short films rarely earn their money back directly. Their value is in what they open: festivals, platforms, a feature, a series, a career. We plan every short around the door you want it to open.</MotionCopy></div>
    </section>

    <section className="short-section short-width" aria-labelledby="short-kit-title">
      <Label time="02:00">OUR SHORT-FILM KIT</Label>
      <MotionHeading as="h2" id="short-kit-title">Our short-film kit.</MotionHeading>
      <ol className="short-kit">{kit.map((item,index) => <li key={item}><span aria-hidden="true">{String(index + 1).padStart(2,'0')}</span><p>{item}</p></li>)}</ol>
    </section>

    <section className="short-section short-width" aria-labelledby="short-tail-title">
      <Label time="02:30">SHORT SHOOT, LONG TAIL</Label>
      <div className="short-intro-grid"><div><MotionHeading as="h2" id="short-tail-title">Short shoot, long tail.</MotionHeading><MotionCopy>Short shoot, long tail: plan for the festival months before you roll.</MotionCopy></div><div><div className="short-timeline-head" aria-hidden="true"><span>Stage</span><span>Typical length</span></div><dl className="short-timeline">{timeline.map(([stage, length]) => <div key={stage}><dt>{stage}</dt><dd>{length}</dd></div>)}</dl></div></div>
    </section>

    <section className="short-section short-width" aria-labelledby="short-questions-title">
      <Label>QUICK ANSWERS</Label>
      <div className="short-intro-grid"><MotionHeading as="h2" id="short-questions-title">Quick answers.</MotionHeading><div className="short-faq">{questions.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true"><SiteIcon name="plus" size={16} /></span></summary><p>{answer}</p></details>)}</div></div>
    </section>

    <section className="short-section short-width short-closing" aria-labelledby="short-closing-title">
      <Label time="03:00">03:00 · THE END</Label>
      <div className="short-intro-grid"><MotionHeading as="h2" id="short-closing-title">MAKE IT COUNT.</MotionHeading><div><MotionCopy>Tell us about your short and what you need it to open. We’ll help you plan it around that.</MotionCopy><div className="short-actions"><CTA href={enquiry}>Talk to us about your short</CTA><TextLink href="/join/">Join the Talent Network</TextLink></div></div></div>
    </section>
  </div>;
}
