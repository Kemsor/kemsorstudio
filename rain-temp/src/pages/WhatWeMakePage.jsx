import MotionHeading, { MotionCopy } from '../TextMotion';
import SectionSubmenu from '../SectionSubmenu';
import React, { useEffect, useState } from 'react';
import { Arrow, CTA, TextLink } from '../PageUI';
import './produce-page.css';
import './what-we-make-page.css';

// Content: Kemsor_What_We_Make_Page_Content.docx.pdf.
const formats = [
  {
    id: 'feature-films', number: '01', title: 'Feature Films', accent: 'Built for the big screen.', context: 'INCLUDING REGIONAL CINEMA', image: 'coastal-motorcycle-chase',
    alt: 'Supplied illustration of two performers in a motorcycle chase beside the coast, with a helicopter overhead',
    hook: 'You’ve lived with this story for years. Now it needs a production that can carry it.',
    body: 'A feature asks for stamina - a packaged script, a financing plan that holds, and a shoot where every day counts. We keep the creative vision and the production plan moving together, from first pitch to final deliverable. That includes regional cinema: stories rooted in language and place, produced with local knowledge.',
    capabilities: [['Development & packaging', 'A script and creative package ready to pitch'], ['Financing coordination', 'Investors met with a clear budget and plan'], ['Pre-production', 'Casting, crew, locations and design, settled early'], ['Line production', 'The shoot run day to day, on set and on location'], ['Post supervision', 'Edit, sound, colour and VFX through to delivery'], ['Release support', 'Coordination with platforms and distributors']],
    audience: 'Writers, directors, producers and studios', action: 'Talk to us about your feature',
  },
  {
    id: 'series-ott', number: '02', title: 'Series & OTT', accent: 'Built to keep them watching.', context: 'EPISODIC · STREAMING · PLATFORM-READY', image: 'work-dance-set',
    alt: 'Illustrative episodic production with performers and a camera crew on set',
    hook: 'Episode one earns the click. Every episode after earns the audience.',
    body: 'Episodic storytelling runs on consistency - in tone, in performance, in schedule and in delivery. We plan series production around the story’s arc and the platform’s needs, so the final episode holds up as well as the first.',
    capabilities: [['Series packaging', 'A concept and creative package ready for platforms'], ['Multi-episode planning', 'Budgets and schedules built across the whole season'], ['Casting & crew continuity', 'The right people, kept together episode to episode'], ['Production management', 'Day-to-day control of a long, demanding shoot'], ['Post supervision', 'Edit, sound, colour and VFX to platform deliverables'], ['Platform coordination', 'Clear communication with the platform through release']],
    audience: 'Creators, producers, studios and OTT platforms', action: 'Talk to us about your series',
  },
  {
    id: 'documentaries', number: '03', title: 'Documentaries', accent: 'Real stories, told with care.', context: 'RESEARCHED · RESPECTFUL · REAL', image: 'work-forest-set',
    alt: 'Illustrative location shoot with a small production crew in a forest',
    hook: 'Real life doesn’t follow a call sheet. Your production should be ready for that.',
    body: 'Documentaries ask for trust - from the people on camera, the communities you film in, and the audience who believes what they see. We plan around access, research and the unexpected, while protecting the integrity of the story.',
    capabilities: [['Development', 'The idea shaped into a story worth funding'], ['Financing & co-production', 'Partners and investors aligned on the same goal'], ['Location & logistics', 'Real-world shoots planned with respect for place'], ['Crew & equipment', 'Sized to the shoot, ready to move when the story does'], ['Post supervision', 'Where documentaries are often truly written'], ['Release support', 'Deliverables prepared for platforms and distributors']],
    audience: 'Documentary filmmakers, producers, platforms and international partners', action: 'Talk to us about your documentary',
  },
  {
    id: 'short-films', number: '04', title: 'Short Films', accent: 'Every shot counts.', context: 'COMPACT FORMAT · FULL CRAFT', image: 'daylight-park-production',
    alt: 'Supplied illustration of a small camera crew filming children playing in a sunny park',
    hook: 'A short film is a calling card, a proof of concept, a voice announcing itself.',
    body: 'In a compact format, every shot - and every rupee - counts. We help first-time and established filmmakers get the most from a tight budget and a short schedule, without asking the work to settle for less.',
    capabilities: [['Script & packaging', 'A sharper script and a clear creative plan'], ['Realistic budgets', 'Grounded in production realities, not optimism'], ['Casting & talent', 'Cast and crew drawn from the Kemsor Talent Network'], ['Compact shoots', 'Line production built for short, focused schedules'], ['Post supervision', 'Edit, sound and colour finished to a high standard'], ['Deliverables for release', 'Ready for the platforms and screens you’re aiming at']],
    audience: 'Writers and directors - first film or fifth', action: 'Talk to us about your short',
  },
];
const ways = [
  ['An early idea', 'Shape it into a project that’s ready to pitch.', '/services/#development', 'Development'],
  ['A finished script', 'Build the budget, the plan and the team around it.', '/script-to-production/', 'Script to Production'],
  ['A greenlit project', 'Get it shot - on set, on location, on schedule.', '/produce/line-production/', 'Line production'],
  ['Footage in the can', 'Carry it through post and out to audiences.', '/services/#capability-post', 'Post & release'],
];
function Label({ children, end }) {
  return <div className="produce-label"><span>{children}</span>{end && <span>{end}</span>}</div>;
}
function FormatImage({ name, alt, preview = false }) {
  const base = `/assets/stills/${name}`;
  return <img src={`${base}-960.webp`} srcSet={[640, 960, 1600].map(width => `${base}-${width}.webp ${width}w`).join(', ')} sizes={preview ? "(max-width: 700px) 44vw, 23vw" : "(max-width: 700px) 90vw, 75vw"} alt={alt} width="960" height="540" loading={preview ? "eager" : "lazy"} decoding="async"/>;
}

Label.displayName = 'EditorialLabel';

export default function WhatWeMakePage() {
  const [activeFormat, setActiveFormat] = useState('feature-films');
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => a.boundingClientRect.top-b.boundingClientRect.top);
      if (visible.length) setActiveFormat(visible[0].target.id);
    }, { rootMargin: '-18% 0px -55% 0px' });
    formats.forEach(format => { const element = document.getElementById(format.id); if(element) observer.observe(element); });
    return () => observer.disconnect();
  }, []);
  return <div className="produce-hub what-we-make-page">
    <div className="make-top-strip"><a href="/">KEMSOR STUDIOS</a><span>STORY. CRAFT. CINEMA.</span></div>
    <section className="produce-hero make-hero" aria-labelledby="make-title"><div className="produce-hero-content"><p className="produce-kicker">WHAT WE MAKE</p><MotionHeading as="h1" id="make-title">Every story has a shape.<span>We build for it.</span></MotionHeading><MotionCopy>Feature films, series, documentaries and short films each ask something different of a production. We plan for what your format needs - so the story arrives on screen the way you imagined it.</MotionCopy><CTA href="/contact/?partner=filmmakers">Bring us your story</CTA></div><div className="make-contact-sheet" aria-label="Explore our formats">{formats.map(format => <a href={`#${format.id}`} key={format.id}><div className="make-sheet-photo"><FormatImage name={format.image} alt={format.alt} preview/><span aria-hidden="true">{format.number}</span></div><span className="make-sheet-caption">{format.title}<Arrow/></span></a>)}</div><div className="produce-hero-foot"><span>FEATURES · SERIES · DOCUMENTARIES · SHORTS</span><a href="#make-formats">Find your format <span aria-hidden="true">↓</span></a></div></section>

    <SectionSubmenu id="make-formats" page={activeFormat} menu={{label:'WHAT WE MAKE',name:'Choose a story format',href:'/what-we-make/',pages:formats.map(format=>[format.id,format.title])}}/>

    <section className="produce-section make-promise" aria-labelledby="make-promise-label"><Label>ONE QUESTION, EVERY FORMAT</Label><MotionHeading as="h2" id="make-promise-label">Whatever you’re making, we start in the same place: <em>what does this story need to reach its audience?</em></MotionHeading></section>

    {formats.map((format, index) => <section className={`produce-section make-format${index % 2 ? ' make-format-reversed' : ''}`} id={format.id} aria-labelledby={`${format.id}-title`} key={format.id}>
      <span className="make-chapter-number" aria-hidden="true">{format.number}</span><Label end={format.context}>{format.number} · {format.title.toUpperCase()}</Label>
      <div className="make-format-intro"><figure className="make-format-image"><FormatImage name={format.image} alt={format.alt}/><figcaption><span>{format.number} / 04</span><span>{format.title}</span></figcaption></figure><div className="make-format-copy"><MotionHeading as="h2" id={`${format.id}-title`}>{format.title}.<br/><em>{format.accent}</em></MotionHeading><p className="make-hook">{format.hook}</p><p>{format.body}</p></div></div>
      <div className="make-capability-head"><h3>What we bring</h3><span>What it means for you</span></div><dl className="make-capabilities">{format.capabilities.map(([title, description]) => <div key={title}><dt>{title}</dt><dd>{description}</dd></div>)}</dl>
      <div className="make-format-foot"><p><span>MADE FOR</span>{format.audience}</p><CTA href="/contact/?partner=filmmakers">{format.action}</CTA></div>
      {/* Related-work cards stay hidden until a cleared still, title, year,
          platform (for series) and confirmed Kemsor credit are supplied. */}
    </section>)}

    <section className="produce-section make-coproduction" aria-labelledby="make-coproduction-title"><Label>ACROSS BORDERS</Label><div><MotionHeading as="h2" id="make-coproduction-title">Making it with<br/><em>partners abroad?</em></MotionHeading><div><MotionCopy>Any of these formats can be built as an international co-production. We align partners across companies and borders on shared creative and production goals - and support productions filming in India on the ground.</MotionCopy><div className="produce-actions"><CTA href="/projects/#international-co-productions">Explore co-productions</CTA><TextLink href="/services/#india-production-services">India Production Services</TextLink></div></div></div></section>

    <section className="produce-section make-ways" aria-labelledby="make-ways-title"><Label>WHEREVER YOU ARE · THERE’S A WAY IN</Label><div className="make-ways-head"><MotionHeading as="h2" id="make-ways-title">Bring us the story<br/><em>at any stage.</em></MotionHeading><MotionCopy>You don’t need everything figured out. Bring us in at the start - or at the stage where you need us most.</MotionCopy></div><div className="make-ways-grid">{ways.map(([title, description, href, action], index) => <a href={href} key={title}><span className="produce-related-number">0{index + 1}</span><h3>{title}</h3><p>{description}</p><span className="make-way-link">{action}<Arrow /></span></a>)}</div></section>

    <section className="produce-section produce-closing" aria-labelledby="make-closing-title"><Label>YOUR NEXT PROJECT</Label><div><MotionHeading as="h2" id="make-closing-title">What are you<br/><em>making?</em></MotionHeading><div><MotionCopy>A feature, a series, a documentary or a short - tell us the story and where it stands. We’ll help find the next step.</MotionCopy><div className="produce-actions"><CTA href="/contact/?partner=filmmakers">Start a conversation</CTA><TextLink href="/projects/">Explore productions</TextLink></div></div></div></section>
  </div>;
}
