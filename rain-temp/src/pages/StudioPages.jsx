import PageBreadcrumbs from '../PageBreadcrumbs';
import {cmsText,cmsData} from '../siteContent';
import StudioImage from '../StudioImage';
import PrincipleSteps from '../PrincipleSteps';
import SiteIcon from '../SiteIcon';
import MotionHeading, { MotionCopy } from '../TextMotion';
import React from 'react';
import { TextLink, CTA } from '../PageUI';
import { CmsEntries, useCms } from '../CmsContent';
import './about-page.css';
import './about-lifecycle.css';

const lifecycle = cmsData(()=>([
 [cmsText("StudioPages","8d5e3ed1ce621357","Development & Packaging"),cmsText("StudioPages","fe523450564628c1","Shaping the idea, the script and the creative package that makes a project ready to pitch.")],
 [cmsText("StudioPages","e61ac5d915c954c1","Financing & Investment Coordination"),cmsText("StudioPages","9100fb728b102c19","Bringing financiers and investors into the conversation with a clear budget and production plan.")],
 [cmsText("StudioPages","c0928a7177a2e0e0","Co-Production"),cmsText("StudioPages","088d0f03b08ac7b1","Aligning partners across companies and borders on shared creative and production goals.")],
 [cmsText("StudioPages","fbb1f7ddf603c2b4","Pre-Production"),cmsText("StudioPages","eeeeab3b826b5c31","Budgets, schedules, casting, crew, locations and design, settled before cameras roll.")],
 [cmsText("StudioPages","45eba100ac5c6b70","Production & Line Production"),cmsText("StudioPages","334002d2a88960df","Running the shoot day to day, on set and on location.")],
 [cmsText("StudioPages","f839a13dadd2aa77","Post-Production Supervision"),cmsText("StudioPages","967e17d5a42ac30e","Overseeing edit, sound, colour and VFX workflows through to final deliverables.")],
 [cmsText("StudioPages","d422dab804ef0bd8","Distribution & Release Support"),cmsText("StudioPages","438105667892b65f","Preparing deliverables and coordinating with platforms and distributors for release.")],
]));
const lifecycleCards=[
 {href:'/develop/',icon:'script',image:'detective-scene',style:'feature'},
 {href:'/finance/finance-structuring/',icon:'briefcase',style:'gold'},
 {href:'/finance/co-production/',icon:'partnership',style:'cream'},
 {href:'/produce/casting/',icon:'people',image:'costume-portrait',style:'photo'},
 {href:'/produce/line-production/',icon:'film',image:'action-scene',style:'photo'},
 {href:'/post-production/',icon:'video',style:'cream'},
 {href:'/release/distribution-release-support/',icon:'guide',style:'gold'},
];
const ground=cmsData(()=>([cmsText("StudioPages","c0541090c6db27ca","Production management"),cmsText("StudioPages","8568bcec7ec11680","Location and logistics management"),cmsText("StudioPages","fd6536dc318926e7","Casting and talent coordination"),cmsText("StudioPages","02f9c4ce1bbe0f04","Crew and equipment management"),cmsText("StudioPages","29bdb39680b41e43","Set design and production design"),cmsText("StudioPages","562ccbfc46b6d849","Shooting and on-location production")]));
const formats=cmsData(()=>([
 [cmsText("StudioPages","9e826e89bc4eaa0a","Web Series & OTT"),cmsText("StudioPages","8cc1c0f8e90bb8b4","Episodic storytelling built for streaming audiences and platform delivery.")],
 [cmsText("StudioPages","5c74eb8f12d91bef","Regional Cinema"),cmsText("StudioPages","68f6258aac5a149d","Stories rooted in language and place, produced with local knowledge.")],
 [cmsText("StudioPages","66c78cce4ff81f28","Documentaries"),cmsText("StudioPages","47c6ee5879a722dc","Real stories, researched with care and produced with integrity.")],
 [cmsText("StudioPages","621f03d881117a30","Short Films"),cmsText("StudioPages","e176b5b8f35b8fbd","Compact formats where every shot and every rupee counts.")],
 [cmsText("StudioPages","38dae72783fe34e1","International Co-Productions"),cmsText("StudioPages","0f8c6cec3f68784f","Projects shared across borders, partners and markets.")],
]));
const approach=cmsData(()=>([
 [cmsText("StudioPages","c48fc490d70e9507","Understand the story."),cmsText("StudioPages","87c265cc6e295b9d","We begin with what the story needs to be and who it is for, before any numbers are set.")],
 [cmsText("StudioPages","946459eea53ed6bb","Build the plan."),cmsText("StudioPages","7bf8a4d01e63bf65","That creative goal shapes the budget, schedule, team and locations, so practical decisions serve the work.")],
 [cmsText("StudioPages","d626d9d9d3c29bc2","Deliver the work."),cmsText("StudioPages","b7286f37b7147a1f","Clear communication across every collaborator keeps the project coherent as it moves from one stage to the next.")],
]));
const principles=cmsData(()=>([
 [cmsText("StudioPages","334b98e6722ce79b","The story comes first"),cmsText("StudioPages","628af3dca33cc561","Every budget line and schedule decision is measured against what the story needs.")],
 [cmsText("StudioPages","aa79fcd44dc282b5","Plans that hold up"),cmsText("StudioPages","76d55fae0b6700dd","We build budgets and schedules grounded in production realities, not optimism.")],
 [cmsText("StudioPages","f0e8739a4ca14321","Clear, early communication"),cmsText("StudioPages","c1359f47503a8032","Collaborators hear about risks and decisions in time to act on them.")],
 [cmsText("StudioPages","537c34ec20e06a0f","Respect for people and places"),cmsText("StudioPages","4b4216484b3aff01","We treat crews, talent and the communities we film in as partners in the work.")],
]));
export function AboutPage(){
 const {entries}=useCms();
 const hasTeam=entries.some(entry=>entry.type==='team');
 return <div className="studio-about">
  <section className="inner-hero studio-opening" aria-labelledby="about-title">
   <div className="studio-width"><div className="studio-docket"><a href="/">{cmsText("StudioPages","a58878213c8330b9","KEMSOR STUDIOS")}</a><span>{cmsText("StudioPages","b01d557b09a68d63","ABOUT KEMSOR")}</span></div>
    <div className="studio-opening-copy"><div><p className="studio-label">{cmsText("StudioPages","341c6fc3016654bf","THE STUDIO")}</p><MotionHeading as="h1" id="about-title">{cmsText("StudioPages","419c616730812615","Creative ambition,")}<br/><span>{cmsText("StudioPages","d7f39b82d70a4ed1","grounded in production.")}</span></MotionHeading></div><div><MotionCopy>{cmsText("StudioPages","2f411a35080d684b","Kemsor works with filmmakers, studios and platforms on development, financing, production, post and release.")}</MotionCopy><div className="studio-actions"><CTA href="/contact/">{cmsText("StudioPages","04182f2aa6dbe330","Start a conversation")}</CTA><TextLink href="/services/">{cmsText("StudioPages","d42df2e1b33feb00","Explore our capabilities")}</TextLink></div></div></div>
    <div className="studio-contact-sheet"><figure className="studio-frame-main"><StudioImage mediaSlot="StudioPages-1" src="/assets/services/filming-1600.webp" srcSet={[640,960,1600].map(w=>`/assets/services/filming-${w}.webp ${w}w`).join(', ')} sizes="(max-width:650px) 90vw, 57vw" width="1600" height="900" alt={"A cinematographer working with a cinema camera on a film set"} fetchPriority="high" decoding="async"/><figcaption><span>{cmsText("StudioPages","22126e09b5465afb","STORY. CRAFT. CINEMA.")}</span><span aria-hidden="true">{cmsText("StudioPages","0e1971b68e757205","01 / THE FRAME")}</span></figcaption></figure><figure className="studio-frame-location"><StudioImage mediaSlot="StudioPages-2" src="/assets/stills/daylight-valley-production-960.webp" srcSet={[640,960,1600].map(w=>`/assets/stills/daylight-valley-production-${w}.webp ${w}w`).join(', ')} sizes="(max-width:650px) 60vw, 33vw" width="960" height="407" alt={"Supplied illustration of a production crew filming in a mountain valley"} decoding="async"/><figcaption>{cmsText("StudioPages","e1bfc8f23bad04d0","FROM FIRST IDEA")}<br/><strong>{cmsText("StudioPages","f766406ec1e1fbd7","TO FINAL SCREEN")}</strong><span>{cmsText("StudioPages","a7de166495c47077","ILLUSTRATIVE ARTWORK")}</span></figcaption></figure><span className="studio-sheet-line" aria-hidden="true"/></div>
   </div>
  </section><PageBreadcrumbs page="about"/>

  <section className="studio-mission" id="about-chapter-1" aria-label="Our mission"><div className="studio-width"><span className="studio-label">{cmsText("StudioPages","cacb4b7b6582734f","OUR MISSION")}</span><MotionCopy>{cmsText("StudioPages","fd38aa8a95165495","To help stories travel from first idea to final screen, with the planning, people, and production discipline they need to get there.")}</MotionCopy><SiteIcon name="video" size={100} /></div></section>

  <section className="studio-section studio-width studio-introduction" id="about-chapter-2" aria-labelledby="about-who-title"><div data-reveal><p className="studio-label">{cmsText("StudioPages","66ca26c659762666","01 / WHO WE ARE")}</p><MotionHeading as="h2" id="about-who-title">{cmsText("StudioPages","e02468ec32067e65","A production partner for stories of every scale.")}</MotionHeading></div><div className="studio-copy" data-reveal><MotionCopy>{cmsText("StudioPages","4a706ff9c9ca1380","Kemsor is a film and production partner for creators, filmmakers, studios and platforms. We work across web series and OTT content, regional cinema, documentaries, short films and international co-productions.")}</MotionCopy><MotionCopy>{cmsText("StudioPages","9c636d642007525f","No two projects share the same creative priorities or production realities, so we begin by understanding both. Then we bring together the planning, people, and coordination the work requires, whether that means focused line production on a single shoot or partnership across the full production lifecycle.")}</MotionCopy></div></section>

  <section className="studio-journey" id="about-chapter-3" aria-labelledby="about-journey-title"><div className="studio-width"><div className="studio-section-head"><div><p className="studio-label">{cmsText("StudioPages","a4a9caaf3821e2a4","02 / WHAT WE DO")}</p><MotionHeading as="h2" id="about-journey-title">{cmsText("StudioPages","fb9a5be8b2a209c4","From first conversation")}{' '}<br/>{cmsText("StudioPages","a0a537775ac77d8e","to final delivery.")}</MotionHeading></div><MotionCopy>{cmsText("StudioPages","580e0fe65b75a610","Kemsor supports projects at every stage of the production lifecycle. Bring us in at the start, or at the stage where you need us most.")}</MotionCopy></div>
   <div className="studio-lifecycle-grid">{lifecycle.map(([title,copy],i)=>{const card=lifecycleCards[i];return <a className={`studio-lifecycle-card studio-lifecycle-${card.style}`} href={card.href} key={title}>
    {card.image&&<StudioImage mediaSlot="StudioPages-3" src={`/assets/stills/${card.image}.webp`} alt="" loading="lazy" decoding="async" className="studio-lifecycle-image"/>}
    <span className="studio-lifecycle-icon"><SiteIcon name={card.icon} size={25}/></span>
    <div className="studio-lifecycle-copy"><h3>{title}</h3><p>{copy}</p></div>
    <span className="studio-lifecycle-arrow"><SiteIcon name="arrow-up-right" size={21}/></span>
   </a>})}</div>
   <div className="studio-ground"><h3>{cmsText("StudioPages","db1ea2a956df1862","On the ground")}</h3><ul>{ground.map((item,i)=>{
    const details=[
     ['film',cmsText("StudioPages","096ab6bdf11ba314","Planning and coordination to keep your production moving."),'/produce/line-production/'],
     ['location',cmsText("StudioPages","8ba19f9c2db102c3","Locations, permissions and unit logistics shaped around the shoot."),'/produce/locations-logistics/'],
     ['people',cmsText("StudioPages","6e10d2004463e5f1","Connecting the production with the cast and talent it needs."),'/produce/casting/'],
     ['video',cmsText("StudioPages","cf7be8f91efa944b","Crew and equipment coordination for each stage of the shoot."),'/produce/crew-equipment/'],
     ['scan',cmsText("StudioPages","3fd435898867f5c8","Visual worlds planned around the story and production."),'/produce/set-production-design/'],
     ['target',cmsText("StudioPages","e0b9764bb8dd05f5","On-location coordination from preparation through the shoot."),'/produce/shooting-on-location/'],
    ][i];
    return <li key={item}><a className="ground-card" href={details[2]}><div className="ground-card-content"><SiteIcon name={details[0]} size={38}/><h3>{item}</h3><div className="ground-card-detail"><p>{details[1]}</p><span>{cmsText("StudioPages","14fb1d95db40f83e","Explore service")}</span></div></div></a></li>;
   })}</ul></div><MotionCopy className="studio-scope">{cmsText("StudioPages","5249065bb8bca040","Scope is shaped to the project, never imposed as a fixed package.")}</MotionCopy>
  </div></section>

  <section className="studio-section studio-width studio-formats" id="about-chapter-4" aria-labelledby="about-formats-title"><div className="studio-section-head"><div><p className="studio-label">{cmsText("StudioPages","74ebfd7127518ff5","03 / FORMATS WE WORK ACROSS")}</p><MotionHeading as="h2" id="about-formats-title">{cmsText("StudioPages","4253747d55e9c3cd","Stories, in every shape they take.")}</MotionHeading></div><TextLink href="/what-we-make/">{cmsText("StudioPages","8b24bdd4e75c31f6","Explore the formats")}</TextLink></div><div className="studio-format-list">{formats.map(([title,copy],i)=><article key={title} data-reveal><h3>{title}</h3><p>{copy}</p></article>)}</div></section>

  <section className="studio-method" id="about-chapter-5" aria-labelledby="about-method-title"><div className="studio-width"><div className="studio-section-head"><div><p className="studio-label">{cmsText("StudioPages","4322dfa4afe47c36","04 / OUR APPROACH")}</p><MotionHeading as="h2" id="about-method-title">{cmsText("StudioPages","fbeef783d4a6f94e","Understand the story.")}{' '}<br/>{cmsText("StudioPages","f164497e2af22d3d","Build the plan.")}{' '}<br/><span>{cmsText("StudioPages","c412fdef9ce0cdeb","Deliver the work.")}</span></MotionHeading></div><MotionCopy>{cmsText("StudioPages","f4d0952f47e2e304","Strong production starts with a shared understanding of the creative goal. Everything else is built around it.")}</MotionCopy></div><ol className="studio-method-steps">{approach.map(([title,copy],i)=><li key={title} data-reveal><h3>{title}</h3><p>{copy}</p></li>)}</ol></div></section>

  <section className="studio-section studio-width studio-values" id="about-chapter-6" aria-labelledby="about-values-title"><div><p className="studio-label">{cmsText("StudioPages","6cc3b5f98fa5b0a9","05 / WHAT WE STAND FOR")}</p><MotionHeading as="h2" id="about-values-title">{cmsText("StudioPages","6b641bb4c1b0ef29","How we work,")}{' '}<br/>{cmsText("StudioPages","e81a610f351010c7","on every project.")}</MotionHeading></div><PrincipleSteps items={principles}/></section>

  <section className="studio-collaboration" id="about-chapter-7" aria-labelledby="about-collaboration-title"><div className="studio-width"><div className="studio-section-head"><div><p className="studio-label">{cmsText("StudioPages","ff675e686da0f235","06 / WHO WE WORK WITH")}</p><MotionHeading as="h2" id="about-collaboration-title">{cmsText("StudioPages","abbeebc8268f9729","Built for")}{' '}<br/>{cmsText("StudioPages","5fdb0ef42eea0806","collaboration.")}</MotionHeading></div><div className="studio-copy"><MotionCopy>{cmsText("StudioPages","93ddcf3e7443028c","We welcome conversations with anyone seeking a production partner or specialist support, whether you are bringing a finished script or an early idea.")}</MotionCopy><TextLink href="/contact/#co-producers">{cmsText("StudioPages","6880902f897f9f97","Exploring a co-production or investment?")}</TextLink></div></div><div className="studio-collaborators">{[cmsText("StudioPages","a1d1f8e8d854562e","Writers"),cmsText("StudioPages","9b59a818831f2615","Directors"),cmsText("StudioPages","5153f031d38d42cf","Producers"),cmsText("StudioPages","63dde91d0c92e838","Studios"),cmsText("StudioPages","d3b9b8432b7481ac","OTT Platforms"),cmsText("StudioPages","6abb79149c2e4e6d","Financiers & Investors"),cmsText("StudioPages","d6f94e3c283a1b3d","International Collaborators")].map(tag=><span key={tag}>{tag}</span>)}</div></div></section>

  {hasTeam?<section className="studio-section studio-width studio-team" id="leadership" aria-labelledby="about-team-title"><p className="studio-label">{cmsText("StudioPages","a2ad8fc7ff9fe770","07 / LEADERSHIP")}</p><MotionHeading as="h2" id="about-team-title">{cmsText("StudioPages","d201f92e8c654998","The people behind Kemsor.")}</MotionHeading><CmsEntries type="team" compact/></section>:<span id="leadership" className="studio-leadership-anchor" aria-hidden="true"/>}
  <section className="studio-end studio-width inner-closing" id="about-chapter-9"><div><p className="studio-label">{cmsText("StudioPages","5ecfb2ca6ee6b818","YOUR NEXT CHAPTER")}</p><MotionHeading as="h2">{cmsText("StudioPages","b2785272f075b0df","Have a project in mind?")}</MotionHeading></div><CTA href="/contact/">{cmsText("StudioPages","e714d904842a48ec","Start a conversation")}</CTA></section>
 </div>;
}
export default AboutPage;
