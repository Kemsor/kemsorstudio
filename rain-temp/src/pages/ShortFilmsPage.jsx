import {cmsText,cmsData} from '../siteContent';
import PageVisuals from '../VisualChapters';
import SiteIcon from '../SiteIcon';
import React, { useEffect, useRef, useState } from 'react';
import MotionHeading, { MotionCopy } from '../TextMotion';
import SectionSubmenu from '../SectionSubmenu';
import { CTA, TextLink } from '../PageUI';
import './short-films.css';

const enquiry = '/contact/?partner=filmmakers';
const jobs = cmsData(()=>([
  [cmsText("ShortFilmsPage","3c561e91f5b126ff","Calling card"), cmsText("ShortFilmsPage","c1248679ee25b3e5","To show who you are as a writer or director."), cmsText("ShortFilmsPage","2cfba3a905d01079","Plan for: a distinct voice, strong performances, a clean finish.")],
  [cmsText("ShortFilmsPage","42512a52e35313ff","Proof of concept"), cmsText("ShortFilmsPage","bca041db18cc5993","To show a world from a feature or series you want financed."), cmsText("ShortFilmsPage","5169f53ba044f480","Plan for: one key sequence that sells the bigger idea.")],
  [cmsText("ShortFilmsPage","02588689ea94949d","Festival run"), cmsText("ShortFilmsPage","5aa9b840b9f526ed","To premiere and travel the festival circuit."), cmsText("ShortFilmsPage","5648d30b05a4429f","Plan for: premiere strategy, running time limits, festival deliverables.")],
  [cmsText("ShortFilmsPage","d68e2e259d0c8c28","Platform release"), cmsText("ShortFilmsPage","026587dc110f2c26","To reach audiences on short-film and streaming platforms."), cmsText("ShortFilmsPage","a53a8ff355818fa2","Plan for: platform specs, rights and a release that finds viewers.")],
]));
const spend = cmsData(()=>([
  cmsText("ShortFilmsPage","710dd7a0030b8ead","Performances: the right cast"),
  cmsText("ShortFilmsPage","ae4c19b74983c4a6","Sound: audiences notice poor sound, even when they forgive the image"),
  cmsText("ShortFilmsPage","b5d901d29adf6f4b","One location that does a lot of work"),
  cmsText("ShortFilmsPage","fefaf25bed3490ef","A proper colour grade and mix"),
]));
const save = cmsData(()=>([
  cmsText("ShortFilmsPage","ce0d5454ab1afe84","Fewer locations and company moves"),
  cmsText("ShortFilmsPage","47824ef04cc2a790","A small, experienced crew"),
  cmsText("ShortFilmsPage","fc8ec41979bd2329","A tight, well-planned schedule"),
  cmsText("ShortFilmsPage","33100eaac92f5363","Kit sized to the story, not the wish list"),
]));
const kit = cmsData(()=>([
  cmsText("ShortFilmsPage","2d2f00931e721094","Script tightened until every scene earns its place"),
  cmsText("ShortFilmsPage","b75478f75e6f1751","A realistic budget, planned for the short’s purpose"),
  cmsText("ShortFilmsPage","9b11f3ee8e82885e","Cast and crew through the Kemsor Talent Network"),
  cmsText("ShortFilmsPage","33126e6de2ef72f2","Compact line production for short schedules"),
  cmsText("ShortFilmsPage","31f5082c9e2f7b7a","Post finished to a high standard"),
  cmsText("ShortFilmsPage","cc3a160fda842af5","A festival or release plan and deliverables"),
]));
const timeline = cmsData(()=>([ [cmsText("ShortFilmsPage","3aa34eae3d545586","Script"),cmsText("ShortFilmsPage","7e283b1f90a5c9b7","Weeks")], [cmsText("ShortFilmsPage","6ba8de18690572f3","Prep"),cmsText("ShortFilmsPage","fa609c741a76195b","Weeks")], [cmsText("ShortFilmsPage","354837a1363b2efe","Shoot"),cmsText("ShortFilmsPage","7128e166e1f061b2","Days")], [cmsText("ShortFilmsPage","6d474cd97815e95f","Post"),cmsText("ShortFilmsPage","8ff70b42b5864ad3","Weeks")], [cmsText("ShortFilmsPage","f0eba0eac607344b","Festivals & release"),cmsText("ShortFilmsPage","ac8c75b7f6731b3c","Months")] ]));
const questions = cmsData(()=>([
  [cmsText("ShortFilmsPage","6cb1f45c8c8827c8","How long should a short film be?"), cmsText("ShortFilmsPage","af2b3accf6a8a0fe","As long as the story needs, and no longer. Many festivals set their own maximum running times, so check before you shoot.")],
  [cmsText("ShortFilmsPage","ef013c15e380a11a","Can a short become a feature or series?"), cmsText("ShortFilmsPage","639f1c0cbe65308e","Yes. A proof of concept can help a project move into feature or series development, and we can support that next stage.")],
  [cmsText("ShortFilmsPage","59df449654e9874a","Can I find cast and crew through Kemsor?"), cmsText("ShortFilmsPage","edc23beaca92e2da","Yes, through the Kemsor Talent Network.")],
  [cmsText("ShortFilmsPage","f3b6de705d45e518","Do you fund short films?"), cmsText("ShortFilmsPage","885452e15567f570","We help plan and produce shorts. Talk to us about how yours is funded and we’ll help you build the plan.")],
]));

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
    <div className="short-width short-running-labels"><span>{cmsText("ShortFilmsPage","54a65cad60da4f2f","SHORT FILMS")}</span><span><span className="short-time-current">{time}</span><span className="short-time-separator" aria-hidden="true"> / </span>03:00</span></div><span className="short-time-track" aria-hidden="true"><span ref={fill}/></span>
  </div>;
}
function Label({ children, time }) {
  return <div className="short-label"><span>{children}</span>{time && <span className="short-timecode">{time}</span>}</div>;
}

export default function ShortFilmsPage() {
  const page = useRef(null);
  return <PageVisuals page="short-films"><div className="short-films-page" ref={page}>
    <section className="inner-hero short-hero short-width" aria-labelledby="short-title">
      <div className="short-hero-meta"><a href="/what-we-make/">{cmsText("ShortFilmsPage","4e1bd5615cb64412","WHAT WE MAKE")}</a><span>{cmsText("ShortFilmsPage","e40c4899ed06f4fe","RUNNING TIME · 03:00")}</span></div>
      <div className="short-intro-grid"><div><MotionHeading as="h1" id="short-title">{cmsText("ShortFilmsPage","bc332278feb1b185","SHORT FILMS.")}</MotionHeading><MotionHeading as="h2" className="short-hero-accent">{cmsText("ShortFilmsPage","81174a01005948e3","SMALL FILM. ")}<em>{cmsText("ShortFilmsPage","70238ac2ce10e67b","BIG STEP.")}</em></MotionHeading></div><div><MotionCopy>{cmsText("ShortFilmsPage","17bcfd5a72d31ca8","A short film may be a complete story, a proof of concept or an introduction to a filmmaker’s work. Kemsor helps plan and produce it around its intended audience, budget and release.")}</MotionCopy><div className="short-actions"><CTA href={enquiry}>{cmsText("ShortFilmsPage","b3955b2fa8847650","Talk to us about your short")}</CTA><TextLink href="#short-purpose">{cmsText("ShortFilmsPage","d09e96a24f878ad9","What’s your short for?")}</TextLink></div></div></div>
    </section>
    <RunningTime pageRef={page}/>
    <SectionSubmenu section="what-we-make" page="short-films"/>

    <section className="short-section short-width" id="short-purpose" aria-labelledby="short-purpose-title">
      <Label time="00:30">{cmsText("ShortFilmsPage","1b9e56d9575453e5","WHAT IS YOUR SHORT FOR?")}</Label>
      <MotionHeading as="h2" id="short-purpose-title">{cmsText("ShortFilmsPage","aa2613a7d17d0053","Decide the job before you shoot.")}</MotionHeading>
      <div className="short-job-grid">{jobs.map(([title, purpose, plan], index) => <article className="short-job-card" tabIndex="0" aria-labelledby={`short-job-${index}`} key={title}><div className="short-job-faces"><div className="short-job-front"><span className="short-job-number" aria-hidden="true">0{index + 1}</span><h3 id={`short-job-${index}`}>{title}</h3><p>{purpose}</p></div><div className="short-job-back"><span className="short-job-back-title" aria-hidden="true">{title}</span><p>{plan}</p></div></div></article>)}</div>
    </section>

    <section className="short-section short-width" aria-labelledby="short-money-title">
      <Label time="01:00">{cmsText("ShortFilmsPage","0756152536823f13","WHERE THE MONEY GOES")}</Label>
      <MotionHeading as="h2" id="short-money-title">{cmsText("ShortFilmsPage","97f31a79b9496126","Spend where it shows. ")}<em>{cmsText("ShortFilmsPage","1779cfc97818a29e","Save where it doesn’t.")}</em></MotionHeading>
      <div className="short-budget"><section aria-labelledby="short-spend-title"><h3 id="short-spend-title">{cmsText("ShortFilmsPage","2e8c22cc98919273","SPEND")}</h3><ul>{spend.map(item => <li key={item}>{item}</li>)}</ul></section><section aria-labelledby="short-save-title"><h3 id="short-save-title">{cmsText("ShortFilmsPage","9257bb66bcc3f514","SAVE")}</h3><ul>{save.map(item => <li key={item}>{item}</li>)}</ul></section></div>
    </section>

    <section className="short-section short-width" aria-labelledby="short-honest-title">
      <Label time="01:30">{cmsText("ShortFilmsPage","f9693ad57e53c104","THE HONEST PART")}</Label>
      <div className="short-intro-grid"><MotionHeading as="h2" id="short-honest-title">{cmsText("ShortFilmsPage","8bf2d55daa19e0de","The honest part.")}</MotionHeading><MotionCopy>{cmsText("ShortFilmsPage","050f2199e2ddbaab","We discuss what you want the short to achieve, such as festival screenings, a digital release or development into a feature or series. That goal informs the production and release plan.")}</MotionCopy></div>
    </section>

    <section className="short-section short-width" aria-labelledby="short-kit-title">
      <Label time="02:00">{cmsText("ShortFilmsPage","368088826ba05846","OUR SHORT-FILM KIT")}</Label>
      <MotionHeading as="h2" id="short-kit-title">{cmsText("ShortFilmsPage","15560ddd1fd5c2cc","Our short-film kit.")}</MotionHeading>
      <ol className="short-kit">{kit.map((item,index) => <li key={item}><span aria-hidden="true">{String(index + 1).padStart(2,'0')}</span><p>{item}</p></li>)}</ol>
    </section>

    <section className="short-section short-width" aria-labelledby="short-tail-title">
      <Label time="02:30">{cmsText("ShortFilmsPage","ba0c4be80815f7cd","SHORT SHOOT, LONG TAIL")}</Label>
      <div className="short-intro-grid"><div><MotionHeading as="h2" id="short-tail-title">{cmsText("ShortFilmsPage","982a66a993e9df6c","Short shoot, long tail.")}</MotionHeading><MotionCopy>{cmsText("ShortFilmsPage","fbc2861002e42e9e","Short shoot, long tail: plan for the festival months before you roll.")}</MotionCopy></div><div><div className="short-timeline-head" aria-hidden="true"><span>{cmsText("ShortFilmsPage","c87dacefdd72d87f","Stage")}</span><span>{cmsText("ShortFilmsPage","b1df90316e139cb1","Typical length")}</span></div><dl className="short-timeline">{timeline.map(([stage, length]) => <div key={stage}><dt>{stage}</dt><dd>{length}</dd></div>)}</dl></div></div>
    </section>

    <section className="short-section short-width" aria-labelledby="short-questions-title">
      <Label>{cmsText("ShortFilmsPage","192522d3c8ea5338","QUICK ANSWERS")}</Label>
      <div className="short-intro-grid"><MotionHeading as="h2" id="short-questions-title">{cmsText("ShortFilmsPage","8ebbbcab2712bd00","Quick answers.")}</MotionHeading><div className="short-faq">{questions.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true"><SiteIcon name="plus" size={16} /></span></summary><p>{answer}</p></details>)}</div></div>
    </section>

    <section className="short-section short-width short-closing" aria-labelledby="short-closing-title">
      <Label time="03:00">{cmsText("ShortFilmsPage","9bda077d7baeb361","03:00 · THE END")}</Label>
      <div className="short-intro-grid"><MotionHeading as="h2" id="short-closing-title">{cmsText("ShortFilmsPage","b234b31bcb5ab786","MAKE IT COUNT.")}</MotionHeading><div><MotionCopy>{cmsText("ShortFilmsPage","25e776f316fed548","Tell us about your short film, its intended audience and your plans for it. We’ll help you work out the production requirements.")}</MotionCopy><div className="short-actions"><CTA href={enquiry}>{cmsText("ShortFilmsPage","a86523a5e1c1ac82","Talk to us about your short")}</CTA><TextLink href="/join/">{cmsText("ShortFilmsPage","735c6f4983fa3733","Join the Talent Network")}</TextLink></div></div></div>
    </section>
  </div></PageVisuals>;
}
