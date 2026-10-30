import PrincipleSteps from '../PrincipleSteps';
import SiteIcon from '../SiteIcon';
import MotionHeading, { MotionCopy } from '../TextMotion';
import React, { useRef, useState } from 'react';
import { TextLink, CTA } from '../PageUI';
import { CmsEntries, useCms } from '../CmsContent';
import './about-page.css';

const lifecycle = [
 ['Development & Packaging','Shaping the idea, the script and the creative package that makes a project ready to pitch.'],
 ['Financing & Investment Coordination','Bringing financiers and investors into the conversation with a clear budget and production plan.'],
 ['Co-Production','Aligning partners across companies and borders on shared creative and production goals.'],
 ['Pre-Production','Budgets, schedules, casting, crew, locations and design, settled before cameras roll.'],
 ['Production & Line Production','Running the shoot day to day, on set and on location.'],
 ['Post-Production Supervision','Overseeing edit, sound, colour and VFX workflows through to final deliverables.'],
 ['Distribution & Release Support','Preparing deliverables and coordinating with platforms and distributors for release.'],
];
const lifecycleVisuals=['detective-scene','white-olive-tree-poster','ensemble-poster','costume-portrait','action-scene','office-scene','riders-scene'];
const ground=['Production management','Location and logistics management','Casting and talent coordination','Crew and equipment management','Set design and production design','Shooting and on-location production'];
const formats=[
 ['Web Series & OTT','Episodic storytelling built for streaming audiences and platform delivery.'],
 ['Regional Cinema','Stories rooted in language and place, produced with local knowledge.'],
 ['Documentaries','Real stories, researched with care and produced with integrity.'],
 ['Short Films','Compact formats where every shot and every rupee counts.'],
 ['International Co-Productions','Projects shared across borders, partners and markets.'],
];
const approach=[
 ['Understand the story.','We begin with what the story needs to be and who it is for, before any numbers are set.'],
 ['Build the plan.','That creative goal shapes the budget, schedule, team and locations, so practical decisions serve the work.'],
 ['Deliver the work.','Clear communication across every collaborator keeps the project coherent as it moves from one stage to the next.'],
];
const principles=[
 ['The story comes first','Every budget line and schedule decision is measured against what the story needs.'],
 ['Plans that hold up','We build budgets and schedules grounded in production realities, not optimism.'],
 ['Clear, early communication','Collaborators hear about risks and decisions in time to act on them.'],
 ['Respect for people and places','We treat crews, talent and the communities we film in as partners in the work.'],
];
export function AboutPage(){
 const {entries}=useCms();
 const hasTeam=entries.some(entry=>entry.type==='team');
 const [stage,setStage]=useState(0);
 const tabs=useRef([]);
 function selectWithKey(event,index){
  let next;
  if(event.key==='ArrowRight'||event.key==='ArrowDown')next=(index+1)%lifecycle.length;
  else if(event.key==='ArrowLeft'||event.key==='ArrowUp')next=(index+lifecycle.length-1)%lifecycle.length;
  else if(event.key==='Home')next=0;
  else if(event.key==='End')next=lifecycle.length-1;
  else return;
  event.preventDefault();setStage(next);tabs.current[next]?.focus();
 }
 return <div className="studio-about">
  <section className="studio-opening" aria-labelledby="about-title">
   <div className="studio-width"><div className="studio-docket"><a href="/">KEMSOR STUDIOS</a><span>ABOUT KEMSOR</span></div>
    <div className="studio-opening-copy"><div><p className="studio-label">THE STUDIO</p><MotionHeading as="h1" id="about-title">Creative ambition,<br/><span>grounded in production.</span></MotionHeading></div><div><MotionCopy>Kemsor works with filmmakers, studios and platforms on development, financing, production, post and release.</MotionCopy><div className="studio-actions"><CTA href="/contact/">Start a conversation</CTA><TextLink href="/services/">Explore our capabilities</TextLink></div></div></div>
    <div className="studio-contact-sheet"><figure className="studio-frame-main"><img src="/assets/services/filming-1600.webp" srcSet={[640,960,1600].map(w=>`/assets/services/filming-${w}.webp ${w}w`).join(', ')} sizes="(max-width:650px) 90vw, 57vw" width="1600" height="900" alt="A cinematographer working with a cinema camera on a film set" fetchPriority="high" decoding="async"/><figcaption><span>STORY. CRAFT. CINEMA.</span><span aria-hidden="true">01 / THE FRAME</span></figcaption></figure><figure className="studio-frame-location"><img src="/assets/stills/daylight-valley-production-960.webp" srcSet={[640,960,1600].map(w=>`/assets/stills/daylight-valley-production-${w}.webp ${w}w`).join(', ')} sizes="(max-width:650px) 60vw, 33vw" width="960" height="407" alt="Supplied illustration of a production crew filming in a mountain valley" decoding="async"/><figcaption>FROM FIRST IDEA<br/><strong>TO FINAL SCREEN</strong><span>ILLUSTRATIVE ARTWORK</span></figcaption></figure><span className="studio-sheet-line" aria-hidden="true"/></div>
   </div>
  </section>

  <section className="studio-mission" id="about-chapter-1" aria-label="Our mission"><div className="studio-width"><span className="studio-label">OUR MISSION</span><MotionCopy>To help stories travel from first idea to final screen, with the planning, people, and production discipline they need to get there.</MotionCopy><SiteIcon name="video" size={100} /></div></section>

  <section className="studio-section studio-width studio-introduction" id="about-chapter-2" aria-labelledby="about-who-title"><div data-reveal><p className="studio-label">01 / WHO WE ARE</p><MotionHeading as="h2" id="about-who-title">A production partner for stories of every scale.</MotionHeading></div><div className="studio-copy" data-reveal><MotionCopy>Kemsor is a film and production partner for creators, filmmakers, studios and platforms. We work across web series and OTT content, regional cinema, documentaries, short films and international co-productions.</MotionCopy><MotionCopy>No two projects share the same creative priorities or production realities, so we begin by understanding both. Then we bring together the planning, people, and coordination the work requires, whether that means focused line production on a single shoot or partnership across the full production lifecycle.</MotionCopy></div></section>

  <section className="studio-journey" id="about-chapter-3" aria-labelledby="about-journey-title"><div className="studio-width"><div className="studio-section-head"><div><p className="studio-label">02 / WHAT WE DO</p><MotionHeading as="h2" id="about-journey-title">From first conversation{' '}<br/>to final delivery.</MotionHeading></div><MotionCopy>Kemsor supports projects at every stage of the production lifecycle. Bring us in at the start, or at the stage where you need us most.</MotionCopy></div>
   <div className="studio-stage-tabs" role="tablist" aria-label="Production lifecycle">{lifecycle.map(([title],i)=><button key={title} ref={el=>{tabs.current[i]=el;}} type="button" role="tab" id={`studio-stage-${i}`} aria-selected={stage===i} aria-controls={`studio-stage-panel-${i}`} tabIndex={stage===i?0:-1} onClick={()=>setStage(i)} onKeyDown={event=>selectWithKey(event,i)}><span>{String(i+1).padStart(2,'0')}</span><span>{title}</span></button>)}</div>
   <div className="studio-stage-panels">{lifecycle.map(([title,copy],i)=><div className="studio-stage-panel" role="tabpanel" tabIndex="0" id={`studio-stage-panel-${i}`} aria-labelledby={`studio-stage-${i}`} hidden={stage!==i} key={title}><figure><img src={`/assets/stills/${lifecycleVisuals[i]}.webp`} alt={`Supplied screen artwork accompanying ${title.toLowerCase()}`} loading="lazy" decoding="async"/><figcaption>VISUAL STUDY / SUPPLIED ARTWORK</figcaption></figure><div className="studio-stage-copy"><span className="studio-stage-index" aria-hidden="true">{String(i+1).padStart(2,'0')} <i>/ 07</i></span><h3>{title}</h3><p>{copy}</p><span className="studio-stage-link" aria-hidden="true">THE PRODUCTION JOURNEY <span><SiteIcon name="arrow-up-right" size={16} /></span></span></div></div>)}</div>
   <div className="studio-ground"><h3>On the ground</h3><ul>{ground.map((item,i)=>{
    const details=[
     ['film','Planning and coordination to keep your production moving.','/produce/line-production/'],
     ['location','Locations, permissions and unit logistics shaped around the shoot.','/produce/locations-logistics/'],
     ['people','Connecting the production with the cast and talent it needs.','/produce/casting/'],
     ['video','Crew and equipment coordination for each stage of the shoot.','/produce/crew-equipment/'],
     ['scan','Visual worlds planned around the story and production.','/produce/set-production-design/'],
     ['target','On-location coordination from preparation through the shoot.','/produce/shooting-on-location/'],
    ][i];
    return <li key={item}><a className="ground-card" href={details[2]}><div className="ground-card-content"><SiteIcon name={details[0]} size={38}/><h3>{item}</h3><div className="ground-card-detail"><p>{details[1]}</p><span>Explore service</span></div></div></a></li>;
   })}</ul></div><MotionCopy className="studio-scope">Scope is shaped to the project, never imposed as a fixed package.</MotionCopy>
  </div></section>

  <section className="studio-section studio-width studio-formats" id="about-chapter-4" aria-labelledby="about-formats-title"><div className="studio-section-head"><div><p className="studio-label">03 / FORMATS WE WORK ACROSS</p><MotionHeading as="h2" id="about-formats-title">Stories, in every shape they take.</MotionHeading></div><TextLink href="/what-we-make/">Explore the formats</TextLink></div><div className="studio-format-list">{formats.map(([title,copy],i)=><article key={title} data-reveal><span>{String(i+1).padStart(2,'0')}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></section>

  <section className="studio-method" id="about-chapter-5" aria-labelledby="about-method-title"><div className="studio-width"><div className="studio-section-head"><div><p className="studio-label">04 / OUR APPROACH</p><MotionHeading as="h2" id="about-method-title">Understand the story.{' '}<br/>Build the plan.{' '}<br/><span>Deliver the work.</span></MotionHeading></div><MotionCopy>Strong production starts with a shared understanding of the creative goal. Everything else is built around it.</MotionCopy></div><ol className="studio-method-steps">{approach.map(([title,copy],i)=><li key={title} data-reveal><span>{String(i+1).padStart(2,'0')}</span><h3>{title}</h3><p>{copy}</p></li>)}</ol></div></section>

  <section className="studio-section studio-width studio-values" id="about-chapter-6" aria-labelledby="about-values-title"><div><p className="studio-label">05 / WHAT WE STAND FOR</p><MotionHeading as="h2" id="about-values-title">How we work,{' '}<br/>on every project.</MotionHeading></div><PrincipleSteps items={principles}/></section>

  <section className="studio-collaboration" id="about-chapter-7" aria-labelledby="about-collaboration-title"><div className="studio-width"><div className="studio-section-head"><div><p className="studio-label">06 / WHO WE WORK WITH</p><MotionHeading as="h2" id="about-collaboration-title">Built for{' '}<br/>collaboration.</MotionHeading></div><div className="studio-copy"><MotionCopy>We welcome conversations with anyone seeking a production partner or specialist support, whether you are bringing a finished script or an early idea.</MotionCopy><TextLink href="/contact/#co-producers">Exploring a co-production or investment?</TextLink></div></div><div className="studio-collaborators">{['Writers','Directors','Producers','Studios','OTT Platforms','Financiers & Investors','International Collaborators'].map(tag=><span key={tag}>{tag}</span>)}</div></div></section>

  {hasTeam?<section className="studio-section studio-width studio-team" id="leadership" aria-labelledby="about-team-title"><p className="studio-label">07 / LEADERSHIP</p><MotionHeading as="h2" id="about-team-title">The people behind Kemsor.</MotionHeading><CmsEntries type="team" compact/></section>:<span id="leadership" className="studio-leadership-anchor" aria-hidden="true"/>}
  <section className="studio-end studio-width" id="about-chapter-9"><div><p className="studio-label">YOUR NEXT CHAPTER</p><MotionHeading as="h2">Have a project in mind?</MotionHeading></div><CTA href="/contact/">Start a conversation</CTA></section>
 </div>;
}
export default AboutPage;
