import SiteIcon from '../SiteIcon';
import React, { useLayoutEffect, useRef, useState } from 'react';
import MotionHeading, { MotionCopy } from '../TextMotion';
import SectionSubmenu from '../SectionSubmenu';
import { CTA, TextLink } from '../PageUI';
import { useReducedMotion } from '../useMotion';
import './series-ott.css';

const episodeTitles = ['The promise', 'The hook deepens', 'First twist', 'Midpoint', 'Everything changes', 'The cost', 'Into the dark', 'The payoff'];
const platformNeeds = [
  ['A clear idea of who it’s for', 'An audience-first logline and positioning'],
  ['A pilot that hooks', 'Pilot development with structural notes'],
  ['A season that holds', 'A season arc, episode by episode'],
  ['A world worth returning to', 'A series bible: world, characters, tone and future seasons'],
  ['People who can deliver it', 'A creator, director and lead-cast package'],
  ['Numbers that hold up', 'A season budget and block schedule'],
];
const problems = [
  ['It’s shot out of order', 'Scenes from many episodes are shot together, location by location. One script change can affect several episodes at once.', 'Scripts locked by block, with a change log across episodes.'],
  ['Cast is needed for months', 'Lead actors are committed across a long schedule, alongside other work.', 'Cast availability built into the schedule from day one.'],
  ['Many directors, one show', 'Episodes are often split between directors, but the audience must feel one voice.', 'A shared look book, tone guide and continuity system.'],
  ['Every episode is a delivery', 'Each episode needs its own masters, subtitles, artwork and QC.', 'An episodic post and delivery pipeline, tracked episode by episode.'],
];
const pipeline = [
  ['Develop', 'Pilot, season arc and series bible'],
  ['Package', 'Creator, director and lead cast'],
  ['Pitch', 'Package tailored to the platform'],
  ['Plan', 'Season budget and block schedule'],
  ['Shoot', 'Block by block, with daily reports'],
  ['Deliver', 'Episodic post, QC and platform deliverables'],
];
const formats = [
  ['Limited series', 'One story, told completely in one season.'],
  ['Returning series', 'A world built to come back season after season.'],
  ['Docuseries', 'Real stories with an episodic shape.'],
  ['Regional-language series', 'Stories in the language of their place, made for streaming audiences.'],
];
const questions = [
  ['Do I need the whole season written?', 'Usually not. A pilot script, a season arc and a series bible are often enough to start conversations.'],
  ['Do you take series to platforms?', 'We prepare and package the series with you, and coordinate conversations with platforms where it’s the right fit.'],
  ['Can you produce a series that’s already commissioned?', 'Yes. We can plan and run production for a commissioned season, or the parts you need.'],
  ['Do you make docuseries?', 'Yes. We plan research, access and an episodic story shape that can adapt as filming unfolds.'],
];
const locations = ['Family home', 'Police station', 'Market'];
// Illustrative scenes only; these are the same twelve scenes in both views.
const scenes = Array.from({ length:12 }, (_, index) => ({ id:index + 1, episode:Math.floor(index / 3) + 1, location:index % 3 }));

function Label({ children, number }) {
  return <div className="series-label"><span>{children}</span><span aria-hidden="true">{number}</span></div>;
}
function WritersBoard() {
  return <div className="series-writers-board" aria-labelledby="series-board-title">
    <p className="series-board-label" id="series-board-title">SEASON 1 · YOUR SERIES</p>
    <ol className="series-board-episodes">{episodeTitles.map((title,index) => <li key={title}><span>EP {String(index + 1).padStart(2,'0')}</span><p>{title}</p><i aria-hidden="true"/></li>)}</ol>
    <ul className="series-story-threads" aria-label="Story threads">{['Main story','Character arc','Mystery thread'].map((thread,index) => <li key={thread}><span className={`series-thread series-thread-${index}`} aria-hidden="true"/>{thread}</li>)}</ul>
  </div>;
}
function SeasonPlan() {
  const [view, setView] = useState('audience');
  const reduced = useReducedMotion();
  const tiles = useRef(new Map());
  const before = useRef(null);
  const audience = view === 'audience';
  const orderedScenes = audience ? scenes : [...scenes].sort((a,b) => a.location - b.location || a.episode - b.episode);
  const changeView = next => {
    if(next === view)return;
    before.current = reduced ? null : new Map([...tiles.current].map(([id, node]) => [id, node.getBoundingClientRect()]));
    setView(next);
  };
  useLayoutEffect(() => {
    const previous = before.current;
    before.current = null;
    if(!previous || reduced)return;
    const animations = [];
    for(const [id, node] of tiles.current){
      const old = previous.get(id), current = node.getBoundingClientRect();
      if(old && typeof node.animate === 'function')animations.push(node.animate([
        { transform:`translate(${old.left - current.left}px, ${old.top - current.top}px)`, opacity:.65 },
        { transform:'translate(0, 0)', opacity:1 },
      ],{ duration:650, easing:'cubic-bezier(.22,.61,.36,1)' }));
    }
    return () => animations.forEach(animation => animation.cancel());
  },[view,reduced]);
  return <div className="series-season-plan">
    <div className="series-view-toggle" role="group" aria-label="Season shooting plan view"><button type="button" aria-pressed={audience} aria-controls="series-scenes-panel" onClick={() => changeView('audience')}>How the audience watches</button><button type="button" aria-pressed={!audience} aria-controls="series-scenes-panel" onClick={() => changeView('crew')}>How the crew shoots</button></div>
    <div className="series-scene-legend" aria-label="Episode colours">{[1,2,3,4].map(episode => <span key={episode} className={`series-episode-${episode}`}><i aria-hidden="true"/>Episode {episode}</span>)}</div>
    <div className="series-scenes-scroll" role="region" aria-label={audience ? 'Scenes grouped by episode' : 'Scenes grouped by location'} tabIndex="0" id="series-scenes-panel">
      <div className={`series-scenes-layout ${audience ? 'series-audience-view' : 'series-crew-view'}`}>
        <div className="series-scene-headings" aria-live="polite">{audience ? [1,2,3,4].map(episode => <h3 key={episode}>Episode {episode}</h3>) : locations.map((location,index) => <h3 key={location}><span>Block {index + 1} · Location {String.fromCharCode(65 + index)}</span>{location}</h3>)}</div>
        <ol className="series-scene-grid" aria-label={audience ? 'Episode order' : 'Location blocks'}>{orderedScenes.map(scene => <li key={scene.id} ref={node => {if(node)tiles.current.set(scene.id,node);else tiles.current.delete(scene.id);}} className={`series-scene series-episode-${scene.episode}`} data-scene={scene.id} data-episode={scene.episode} data-location={scene.location} style={{ gridColumn:audience ? scene.episode : scene.location + 1, gridRow:audience ? scene.location + 1 : scene.episode }}><span>EP {String(scene.episode).padStart(2,'0')} · SC {String(scene.id).padStart(2,'0')}</span><p>{locations[scene.location]}</p></li>)}</ol>
      </div>
    </div>
    <p className="series-plan-caption">Illustrative: 4 episodes, 12 scenes, 3 locations. Colour = episode.</p>
  </div>;
}

export default function SeriesOttPage() {
  return <div className="series-ott-page">
    <section className="series-hero series-width" aria-labelledby="series-title">
      <div className="series-hero-grid"><div><p className="series-kicker">PRODUCTIONS · SERIES &amp; OTT</p><MotionHeading as="h1" id="series-title">Series &amp; OTT.</MotionHeading><MotionHeading as="h2" className="series-hero-accent">Eight episodes. <em>One promise.</em></MotionHeading><MotionCopy>A series makes a promise in episode one and has to keep it until the last frame of the season. Kemsor plans series as seasons, not as long films so the story, the cast, the look and the delivery stay consistent from the first episode to the last.</MotionCopy><div className="series-actions"><CTA href="/contact/?partner=filmmakers">Talk to us about your series</CTA><TextLink href="#season-shooting">See how a season is shot</TextLink></div></div><WritersBoard/></div>
    </section>
    <SectionSubmenu section="what-we-make" page="series-ott"/>

    <section className="series-section series-width" aria-labelledby="series-commission-title">
      <Label number="01">BEFORE A SERIES IS COMMISSIONED</Label>
      <MotionHeading as="h2" id="series-commission-title">What platforms usually look for <em>and what we build with you.</em></MotionHeading>
      <div className="series-commission-head" aria-hidden="true"><span>Platforms usually look for</span><span>We build with you</span></div><dl className="series-commission-list">{platformNeeds.map(([need, support]) => <div key={need}><dt>{need}</dt><dd>{support}</dd></div>)}</dl>
      <MotionCopy className="series-platform-note">Every platform has its own priorities. We tailor the package to the one you’re approaching.</MotionCopy>
    </section>

    <section className="series-section series-width" aria-labelledby="series-problem-title">
      <Label number="02">THE SEASON PROBLEM</Label>
      <MotionHeading as="h2" id="series-problem-title">Why a series isn’t just a long film.</MotionHeading>
      <div className="series-problem-head" aria-hidden="true"><span>Problem</span><span>Why it happens</span><span>How we plan</span></div><div className="series-problems">{problems.map(([problem, why, plan]) => <article key={problem}><h3>{problem}</h3><p><span className="series-mobile-label">Why it happens</span>{why}</p><p><span className="series-mobile-label">How we plan</span>{plan}</p></article>)}</div>
    </section>

    <section className="series-section series-width" id="season-shooting" aria-labelledby="series-shooting-title">
      <Label number="03">HOW A SEASON IS SHOT</Label>
      <div className="series-intro-grid"><MotionHeading as="h2" id="series-shooting-title">The audience watches in order. <em>The crew shoots by location.</em></MotionHeading><MotionCopy>Toggle the views to see how scenes from four episodes are regrouped into shoot blocks and why planning a series is a different craft.</MotionCopy></div>
      <SeasonPlan/>
    </section>

    <section className="series-section series-width" aria-labelledby="series-pipeline-title">
      <Label number="04">FROM PITCH TO PLATFORM</Label>
      <MotionHeading as="h2" id="series-pipeline-title">From pitch to platform.</MotionHeading>
      <ol className="series-pipeline">{pipeline.map(([title, copy],index) => <li key={title}><span aria-hidden="true">{String(index + 1).padStart(2,'0')}</span><h3>{title}</h3><p>{copy}</p></li>)}</ol>
    </section>

    <section className="series-section series-width" aria-labelledby="series-formats-title">
      <Label number="05">SERIES WE MAKE</Label>
      <div className="series-intro-grid"><MotionHeading as="h2" id="series-formats-title">Series we make.</MotionHeading><dl className="series-format-list">{formats.map(([type, copy]) => <div key={type}><dt>{type}</dt><dd>{copy}</dd></div>)}</dl></div>
    </section>

    <section className="series-section series-width" aria-labelledby="series-slate-title">
      <Label number="06">ON OUR SLATE</Label>
      <div className="series-intro-grid"><MotionHeading as="h2" id="series-slate-title">Series.</MotionHeading><div><TextLink href="/projects/#series-ott">See all series</TextLink></div></div>
      {/* Stills, titles, seasons, episode counts, language, platform, year and roles require confirmed production records. */}
    </section>

    <section className="series-section series-width" aria-labelledby="series-questions-title">
      <Label number="07">BEFORE YOU PITCH</Label>
      <div className="series-intro-grid"><MotionHeading as="h2" id="series-questions-title">Before you pitch.</MotionHeading><div className="series-faq">{questions.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true"><SiteIcon name="plus" size={16} /></span></summary><p>{answer}</p></details>)}</div></div>
    </section>

    <section className="series-section series-width series-closing" aria-labelledby="series-closing-title">
      <div className="series-intro-grid"><div><MotionHeading as="h2" id="series-closing-title">Pitch us episode one.</MotionHeading><MotionCopy>Send us the pilot, the bible, or just the idea. We’ll tell you honestly what it needs to become a season.</MotionCopy><div className="series-actions"><CTA href="/script-to-production/">Send us your pilot</CTA><TextLink href="/contact/">Talk to the studio</TextLink></div></div><figure className="series-next-episode"><span>Next episode</span><div className="series-next-number" aria-hidden="true">01</div><figcaption><strong>E01 · Your series</strong><span>Starting when you are</span></figcaption></figure></div>
    </section>
  </div>;
}
