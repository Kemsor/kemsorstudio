import React from 'react';
import { PageHero, SectionHeading, PageCTA, TextLink, CTA } from '../PageUI';
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
 return <div className="inner-page page-about">
  <PageHero eyebrow="ABOUT KEMSOR" title="Creative ambition," accent="grounded in production." description="Kemsor works across the full journey of screen content, connecting ideas, collaborators, and execution so stories can move from development to audiences." image="/assets/services/filming.webp" alt="A cinematographer working with a cinema camera on a film set" caption="FROM FIRST IDEA TO FINAL SCREEN"/>
  <div className="about-banner-actions"><CTA href="/contact/">Start a conversation</CTA><TextLink href="/services/">Explore our capabilities</TextLink></div>
  <section className="about-mission" aria-label="Our mission"><span>OUR MISSION</span><p>To help stories travel from first idea to final screen, with the planning, people, and production discipline they need to get there.</p></section>
  <section className="page-section" aria-labelledby="about-who-title"><div className="page-grid"><div data-reveal><p className="page-eyebrow">01 / WHO WE ARE</p><h2 id="about-who-title">A production partner for stories of every scale.</h2></div><div className="page-copy" data-reveal><p className="page-lead">Kemsor is a film and production partner for creators, filmmakers, studios and platforms. We work across web series and OTT content, regional cinema, documentaries, short films and international co-productions.</p><p>No two projects share the same creative priorities or production realities, so we begin by understanding both. Then we bring together the planning, people, and coordination the work requires, whether that means focused line production on a single shoot or partnership across the full production lifecycle.</p></div></div></section>
  <section className="page-section" aria-label="What we do"><SectionHeading index="02" label="WHAT WE DO" title="From first conversation to final delivery." description="Kemsor supports projects at every stage of the production lifecycle. Bring us in at the start, or at the stage where you need us most."/><div className="about-lifecycle">{lifecycle.map(([title,copy],i)=><article className="page-card lifecycle-cinema-card" data-reveal key={title} style={{'--card-delay':`${i*-.9}s`}}><span className="lifecycle-card-light" aria-hidden="true"/><div className="lifecycle-card-copy"><h3>{title}</h3><p>{copy}</p></div><span className="lifecycle-card-frame" aria-hidden="true"/></article>)}</div><div className="about-ground"><h3>On the ground</h3><ul>{ground.map(item=><li key={item}>{item}</li>)}</ul></div><p className="about-scope">Scope is shaped to the project, never imposed as a fixed package.</p></section>
  <section className="page-section about-formats" aria-label="Formats we work across"><SectionHeading index="03" label="FORMATS WE WORK ACROSS" title="Stories, in every shape they take."/><div className="about-format-grid">{formats.map(([title,copy],i)=><article data-reveal key={title}><h3>{title}</h3><p>{copy}</p></article>)}</div></section>
  <section className="page-section" aria-label="Our approach"><SectionHeading index="04" label="OUR APPROACH" title="Understand the story. Build the plan. Deliver the work." description="Strong production starts with a shared understanding of the creative goal. Everything else is built around it."/><div className="page-principles">{approach.map(([title,copy],i)=><article className="page-card" data-reveal key={title}><h3>{title}</h3><p>{copy}</p></article>)}</div></section>
  <section className="page-section" aria-label="What we stand for"><SectionHeading index="05" label="WHAT WE STAND FOR" title="How we work, on every project."/><div className="about-values">{principles.map(([title,copy])=><article className="page-card" data-reveal key={title}><h3>{title}</h3><p>{copy}</p></article>)}</div></section>
  <section className="page-section about-collaboration" aria-labelledby="about-collaboration-title"><div className="page-grid"><div data-reveal><p className="page-eyebrow">06 / WHO WE WORK WITH</p><h2 id="about-collaboration-title">Built for collaboration.</h2></div><div className="page-copy" data-reveal><p className="page-lead">We welcome conversations with anyone seeking a production partner or specialist support, whether you are bringing a finished script or an early idea.</p><div className="about-audience-tags">{['Writers','Directors','Producers','Studios','OTT Platforms','Financiers & Investors','International Collaborators'].map(tag=><span key={tag}>{tag}</span>)}</div><TextLink href="/contact/#co-producers">Exploring a co-production or investment?</TextLink></div></div></section>
  {hasTeam&&<section className="page-section" id="leadership" aria-label="Leadership"><SectionHeading index="07" label="LEADERSHIP" title="The people behind Kemsor."/><CmsEntries type="team" compact/></section>}
  {!hasTeam&&<span id="leadership" className="about-leadership-anchor" aria-hidden="true"/>}
  <PageCTA title="Have a project in mind?" description="" href="/contact/">Start a conversation</PageCTA>
 </div>;
}
export default AboutPage;
