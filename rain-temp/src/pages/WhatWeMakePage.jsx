import React from 'react';
import { Arrow, CTA, TextLink } from '../PageUI';
import './produce-page.css';
import './what-we-make-page.css';

// Content: Kemsor_What_We_Make_Page_Content.docx.pdf.
const formats = [
  {
    id: 'feature-films', number: '01', title: 'Feature Films', accent: 'Built for the big screen.', context: 'INCLUDING REGIONAL CINEMA', image: 'work-period-set',
    alt: 'Illustrative period film set with performers, crew and lighting equipment',
    hook: 'You’ve lived with this story for years. Now it needs a production that can carry it.',
    body: 'A feature asks for stamina — a packaged script, a financing plan that holds, and a shoot where every day counts. We keep the creative vision and the production plan moving together, from first pitch to final deliverable. That includes regional cinema: stories rooted in language and place, produced with local knowledge.',
    capabilities: [['Development & packaging', 'A script and creative package ready to pitch'], ['Financing coordination', 'Investors met with a clear budget and plan'], ['Pre-production', 'Casting, crew, locations and design, settled early'], ['Line production', 'The shoot run day to day, on set and on location'], ['Post supervision', 'Edit, sound, colour and VFX through to delivery'], ['Release support', 'Coordination with platforms and distributors']],
    audience: 'Writers, directors, producers and studios', action: 'Talk to us about your feature',
  },
  {
    id: 'series-ott', number: '02', title: 'Series & OTT', accent: 'Built to keep them watching.', context: 'EPISODIC · STREAMING · PLATFORM-READY', image: 'work-dance-set',
    alt: 'Illustrative episodic production with performers and a camera crew on set',
    hook: 'Episode one earns the click. Every episode after earns the audience.',
    body: 'Episodic storytelling runs on consistency — in tone, in performance, in schedule and in delivery. We plan series production around the story’s arc and the platform’s needs, so the final episode holds up as well as the first.',
    capabilities: [['Series packaging', 'A concept and creative package ready for platforms'], ['Multi-episode planning', 'Budgets and schedules built across the whole season'], ['Casting & crew continuity', 'The right people, kept together episode to episode'], ['Production management', 'Day-to-day control of a long, demanding shoot'], ['Post supervision', 'Edit, sound, colour and VFX to platform deliverables'], ['Platform coordination', 'Clear communication with the platform through release']],
    audience: 'Creators, producers, studios and OTT platforms', action: 'Talk to us about your series',
  },
  {
    id: 'documentaries', number: '03', title: 'Documentaries', accent: 'Real stories, told with care.', context: 'RESEARCHED · RESPECTFUL · REAL', image: 'work-forest-set',
    alt: 'Illustrative location shoot with a small production crew in a forest',
    hook: 'Real life doesn’t follow a call sheet. Your production should be ready for that.',
    body: 'Documentaries ask for trust — from the people on camera, the communities you film in, and the audience who believes what they see. We plan around access, research and the unexpected, while protecting the integrity of the story.',
    capabilities: [['Development', 'The idea shaped into a story worth funding'], ['Financing & co-production', 'Partners and investors aligned on the same goal'], ['Location & logistics', 'Real-world shoots planned with respect for place'], ['Crew & equipment', 'Sized to the shoot, ready to move when the story does'], ['Post supervision', 'Where documentaries are often truly written'], ['Release support', 'Deliverables prepared for platforms and distributors']],
    audience: 'Documentary filmmakers, producers, platforms and international partners', action: 'Talk to us about your documentary',
  },
  {
    id: 'short-films', number: '04', title: 'Short Films', accent: 'Every shot counts.', context: 'COMPACT FORMAT · FULL CRAFT', image: 'work-motorcycle-set',
    alt: 'Illustrative compact film shoot with a motorcycle and production crew on location',
    hook: 'A short film is a calling card, a proof of concept, a voice announcing itself.',
    body: 'In a compact format, every shot — and every rupee — counts. We help first-time and established filmmakers get the most from a tight budget and a short schedule, without asking the work to settle for less.',
    capabilities: [['Script & packaging', 'A sharper script and a clear creative plan'], ['Realistic budgets', 'Grounded in production realities, not optimism'], ['Casting & talent', 'Cast and crew drawn from the Kemsor Talent Network'], ['Compact shoots', 'Line production built for short, focused schedules'], ['Post supervision', 'Edit, sound and colour finished to a high standard'], ['Deliverables for release', 'Ready for the platforms and screens you’re aiming at']],
    audience: 'Writers and directors — first film or fifth', action: 'Talk to us about your short',
  },
];
const ways = [
  ['An early idea', 'Shape it into a project that’s ready to pitch.', '/services/#development', 'Development'],
  ['A finished script', 'Build the budget, the plan and the team around it.', '/script-to-production/', 'Script to Production'],
  ['A greenlit project', 'Get it shot — on set, on location, on schedule.', '/produce/line-production/', 'Line production'],
  ['Footage in the can', 'Carry it through post and out to audiences.', '/services/#capability-post', 'Post & release'],
];
function Label({ children, end }) {
  return <div className="produce-label"><span>{children}</span>{end && <span>{end}</span>}</div>;
}
function FormatImage({ name, alt }) {
  const base = `/assets/stills/${name}`;
  return <img src={`${base}-960.webp`} srcSet={[640, 960, 1600].map(width => `${base}-${width}.webp ${width}w`).join(', ')} sizes="(max-width: 850px) 90vw, 42vw" alt={alt} width="960" height="540" loading="lazy" decoding="async"/>;
}

export default function WhatWeMakePage() {
  return <div className="produce-hub what-we-make-page">
    <div className="make-top-strip"><a href="/">KEMSOR STUDIOS</a><span>STORY. CRAFT. CINEMA.</span></div>
    <section className="produce-hero make-hero" aria-labelledby="make-title"><figure className="produce-hero-image" aria-hidden="true"><img src="/assets/stills/work-dance-set-1600.webp" srcSet={[640, 960, 1600].map(width => `/assets/stills/work-dance-set-${width}.webp ${width}w`).join(', ')} sizes="100vw" alt="" fetchPriority="high" decoding="async"/></figure><div className="produce-hero-content"><p className="produce-kicker">WHAT WE MAKE</p><h1 id="make-title">Every story has a shape.<span>We build for it.</span></h1><p>Feature films, series, documentaries and short films each ask something different of a production. We plan for what your format needs — so the story arrives on screen the way you imagined it.</p><CTA href="/contact/?partner=filmmakers">Bring us your story</CTA></div><div className="produce-hero-foot"><span>FEATURES · SERIES · DOCUMENTARIES · SHORTS</span><a href="#make-formats">Find your format <span aria-hidden="true">↓</span></a></div></section>

    <nav className="make-format-nav" id="make-formats" aria-label="Choose a story format">{formats.map(format => <a href={`#${format.id}`} key={format.id}><span>{format.number}</span><strong>{format.title}</strong><small>{format.accent.replace(/\.$/, '')}</small><Arrow /></a>)}</nav>

    <section className="produce-section make-promise" aria-labelledby="make-promise-label"><Label>ONE QUESTION, EVERY FORMAT</Label><h2 id="make-promise-label">Whatever you’re making, we start in the same place: <em>what does this story need to reach its audience?</em></h2></section>

    {formats.map((format, index) => <section className={`produce-section make-format${index % 2 ? ' make-format-reversed' : ''}`} id={format.id} aria-labelledby={`${format.id}-title`} key={format.id}>
      <Label end={format.context}>{format.number} · {format.title.toUpperCase()}</Label>
      <div className="make-format-intro"><figure className="make-format-image"><FormatImage name={format.image} alt={format.alt}/><figcaption><span>{format.number} / 04</span><span>{format.title}</span></figcaption></figure><div className="make-format-copy"><h2 id={`${format.id}-title`}>{format.title}.<br/><em>{format.accent}</em></h2><p className="make-hook">{format.hook}</p><p>{format.body}</p></div></div>
      <div className="make-capability-head"><h3>What we bring</h3><span>What it means for you</span></div><dl className="make-capabilities">{format.capabilities.map(([title, description]) => <div key={title}><dt>{title}</dt><dd>{description}</dd></div>)}</dl>
      <div className="make-format-foot"><p><span>MADE FOR</span>{format.audience}</p><CTA href="/contact/?partner=filmmakers">{format.action}</CTA></div>
      {/* Related-work cards stay hidden until a cleared still, title, year,
          platform (for series) and confirmed Kemsor credit are supplied. */}
    </section>)}

    <section className="produce-section make-coproduction" aria-labelledby="make-coproduction-title"><Label>ACROSS BORDERS</Label><div><h2 id="make-coproduction-title">Making it with<br/><em>partners abroad?</em></h2><div><p>Any of these formats can be built as an international co-production. We align partners across companies and borders on shared creative and production goals — and support productions filming in India on the ground.</p><div className="produce-actions"><CTA href="/projects/#international-co-productions">Explore co-productions</CTA><TextLink href="/services/#india-production-services">India Production Services</TextLink></div></div></div></section>

    <section className="produce-section make-ways" aria-labelledby="make-ways-title"><Label>WHEREVER YOU ARE · THERE’S A WAY IN</Label><div className="make-ways-head"><h2 id="make-ways-title">Bring us the story<br/><em>at any stage.</em></h2><p>You don’t need everything figured out. Bring us in at the start — or at the stage where you need us most.</p></div><div className="make-ways-grid">{ways.map(([title, description, href, action], index) => <a href={href} key={title}><span className="produce-related-number">0{index + 1}</span><h3>{title}</h3><p>{description}</p><span className="make-way-link">{action}<Arrow /></span></a>)}</div></section>

    <section className="produce-section produce-closing" aria-labelledby="make-closing-title"><Label>YOUR NEXT PROJECT</Label><div><h2 id="make-closing-title">What are you<br/><em>making?</em></h2><div><p>A feature, a series, a documentary or a short — tell us the story and where it stands. We’ll help find the next step.</p><div className="produce-actions"><CTA href="/contact/?partner=filmmakers">Start a conversation</CTA><TextLink href="/projects/">Explore productions</TextLink></div></div></div></section>
  </div>;
}
