import React, { useEffect, useRef, useState } from 'react';
import MotionStudio from './MotionStudio';
import ScrollStory from './ScrollStory';
import VideoShowcase from './VideoShowcase';

import { Arrow, CTA, FrameMark, IndexLabel } from './PageUI';

function Hero({ motionPaused, reduced }) {
  const video = useRef(null);
  const section = useRef(null);
  const [enabled, setEnabled] = useState(false);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (reduced || navigator.connection?.saveData || motionPaused) return;
    const timer = setTimeout(() => setEnabled(true), 1000);
    return () => clearTimeout(timer);
  }, [reduced, motionPaused]);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(section.current);
    const update = () => setTabVisible(!document.hidden);
    update(); document.addEventListener('visibilitychange', update);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', update); };
  }, []);
  useEffect(() => {
    const film = video.current;
    if (!film) return;
    let cancelled = false;
    if (enabled && !paused && !motionPaused && visible && tabVisible && !reduced && !navigator.connection?.saveData) film.play().catch(error => { if (!cancelled && error.name !== 'AbortError') { setPlaying(false); setPaused(true); } });
    else film.pause();
    return () => { cancelled = true; film.pause(); };
  }, [enabled, paused, motionPaused, visible, tabVisible, reduced]);
  return <section id="home" ref={section} className="creative-hero" aria-labelledby="hero-title" data-motion={visible && tabVisible && !motionPaused ? 'running' : 'paused'}>
    <div className="hero-docket"><span><i className="live-dot" /> INDEPENDENT THINKING. COLLECTIVE MAKING.</span><span>FILM + CONTENT PRODUCTION</span></div>
    <div className="hero-grid">
      <div className="hero-type">
        <p className="hero-small-note">KEMSOR STUDIOS <span aria-hidden="true">—</span> FROM IDEA TO SCREEN</p>
        <h1 id="hero-title" aria-label="Let’s make a scene."><span className="hero-word">LET’S</span><span className="hero-word">MAKE A</span><span className="hero-word scene-word">SCENE<span className="hero-period">.</span><svg className="scene-stroke" viewBox="0 0 500 35" aria-hidden="true"><path d="M4 18c100-24 330-11 490-8M20 29c120-17 298-9 451-8" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" /></svg></span></h1>
        <div className="hero-intro"><p>Good stories need people who can make them happen. That’s where we come in.</p><CTA /></div>
      </div>
      <div className="hero-film-wrap">
        <div className="hero-film" data-playing={playing}>
          <img src="/assets/film/poster.webp" width="1920" height="1080" alt="Dusk over a lakeside town in the hills." fetchPriority="high" decoding="async" />
          <video ref={video} src={enabled ? '/assets/film/studio-film-lite.mp4' : undefined} muted loop playsInline preload="none" aria-hidden="true" onPlaying={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => { setPlaying(false); setPaused(true); }} />
          <div className="film-top"><span><i /> A KEMSOR POINT OF VIEW</span><span>16:9</span></div>
          <div className="film-title" aria-hidden="true">EVERY<br />FRAME<br /><span>MATTERS.</span></div>
          <div className="film-bottom"><span>SEE THE WORLD.<br />MAKE SOMETHING OF IT.</span></div>
          <span className="film-corner film-corner-tl" aria-hidden="true" /><span className="film-corner film-corner-br" aria-hidden="true" />
        </div>
        <div className="hero-film-caption"><span>THE WORK BEGINS WITH A POINT OF VIEW.</span><span aria-hidden="true">01 / 01</span></div>
        <div className="hero-stamp" aria-hidden="true"><svg viewBox="0 0 120 120"><defs><path id="stamp-circle" d="M60 12a48 48 0 1 1-.01 0" /></defs><text><textPath href="#stamp-circle" textLength="294">STORIES IN MOTION · KEMSOR STUDIOS · </textPath></text></svg><FrameMark /></div>
      </div>
    </div>
    <div className="hero-footnote"><a href="#studio">SCROLL TO MEET THE STUDIO <span aria-hidden="true">↓</span></a><span>FILMS / SERIES / DOCUMENTARIES / SOMETHING NEW</span></div>
  </section>;
}

function Studio() {
  return <section id="studio" className="studio-section section-space">
    <IndexLabel index="01" right="A STUDIO WITH A PRACTICAL SIDE">THE PEOPLE BEHIND THE FRAME</IndexLabel>
    <div className="studio-layout" data-reveal>
      <h2>The script is<br />just the <span className="hand-circle">beginning.<svg viewBox="0 0 410 115" aria-hidden="true"><path d="M404 54C389-8 21-1 7 51S369 132 398 65" /></svg></span></h2>
      <div className="studio-description"><FrameMark className="studio-frame-mark" /><p>Kemsor works with filmmakers, studios and production partners on films, series and documentaries.</p><p>Some projects need a team from the first draft. Others need people on the ground, a hand through post, or a plan for release. We shape our role around the work.</p><a className="line-link" href="/services/">Explore the production services <Arrow /></a></div>
    </div>
    <div className="format-rail" aria-label="Story formats"><span>FEATURE FILMS</span><FrameMark /><span>SERIES & OTT</span><FrameMark /><span>DOCUMENTARIES</span><FrameMark /><span>SHORT FILMS</span></div>
  </section>;
}

const collection = [
  { file:'detective-scene', title:'Period & character', category:'ON SCREEN / STILL', width:1280, height:719, alt:'An actor in a period uniform and red beret in a detective drama.', className:'frame-wide' },
  { file:'costume-portrait', title:'Costume & detail', category:'BEHIND THE FRAME / PORTRAIT', width:959, height:1280, alt:'An actor wearing an ornate period costume under rich red light.', className:'frame-portrait' },
  { file:'action-scene', title:'Action & atmosphere', category:'ON SET / STILL', width:1511, height:815, alt:'An actor in tactical costume posing with a prop rifle on a film set.', className:'frame-action' },
  { file:'white-olive-tree-poster', title:'The White Olive Tree', category:'ON SCREEN / POSTER', width:949, height:1292, alt:'The White Olive Tree poster, with characters against fire and smoke.', className:'frame-poster' },
];
function Productions() {
  const dialog = useRef(null);
  const opener = useRef(null);
  const [selected, setSelected] = useState(0);
  const show = (index, event) => { opener.current = event.currentTarget; setSelected(index); dialog.current.showModal(); };
  const close = () => dialog.current.close();
  const frame = collection[selected];
  return <section id="productions" className="productions-section section-space">
    <IndexLabel index="02" right="A CLOSER LOOK">IN FRAME</IndexLabel>
    <div className="section-heading" data-reveal><h2>A few frames.<br />A whole world.</h2><p>Characters, costumes, atmosphere.<br />A story begins long before<br />the camera starts rolling.</p></div>
    <div className="frames-grid">{collection.map((item,index) => <figure className={`collection-frame ${item.className}`} key={item.file} data-reveal>
      <button className="frame-image" onClick={event => show(index,event)} aria-label={`View full image: ${item.title}`}><img src={`/assets/stills/${item.file}.webp`} alt={item.alt} width={item.width} height={item.height} loading="lazy" decoding="async" /><span className="frame-index">0{index+1}</span><span className="frame-view">Take a closer look <span aria-hidden="true">+</span></span></button>
      <figcaption><h3>{item.title}</h3><span>{item.category}</span></figcaption>
    </figure>)}</div>
    <div className="collection-footer"><p className="collection-note">Film stills and posters from the supplied collection. Production credits are not stated.</p><a className="line-link" href="/projects/">Explore productions <Arrow/></a></div>
    <dialog ref={dialog} className="frame-dialog" aria-labelledby="frame-dialog-title" onClose={() => opener.current?.focus()} onClick={event => { if(event.target===event.currentTarget) close(); }}><div className="dialog-heading"><h2 id="frame-dialog-title">{frame.title}</h2><button onClick={close} aria-label="Close image">×</button></div><img src={`/assets/stills/${frame.file}.webp`} alt={frame.alt} width={frame.width} height={frame.height} /><div className="frame-dialog-controls"><button onClick={() => setSelected(index => (index+collection.length-1)%collection.length)}>← Previous</button><span>0{selected+1} / 0{collection.length}</span><button onClick={() => setSelected(index => (index+1)%collection.length)}>Next →</button></div></dialog>
  </section>;
}

const chapters = [
  { name:'Develop', tagline:'Give the idea a shape.', text:'Story and script development, packaging, talent attachment, budgeting and scheduling.', tags:['STORY & SCRIPT','TALENT','PRODUCTION PLANNING'] },
  { name:'Finance', tagline:'Put the right plan behind it.', text:'Finance structuring, investment coordination and co-production conversations, including international partnerships.', tags:['FINANCE STRUCTURING','CO-PRODUCTION','PARTNERSHIPS'] },
  { name:'Produce', tagline:'Make the shoot happen.', text:'Locations, casting, crew, equipment, art direction and line production. Coordinate the details that keep the work moving.', tags:['LINE PRODUCTION','CASTING & CREW','LOCATIONS & LOGISTICS'] },
  { name:'Post', tagline:'Find the finished frame.', text:'Post-production supervision and coordination, from the captured footage through to the finished film or series.', tags:['EDITING COORDINATION','FINISHING','POST SUPERVISION'] },
  { name:'Release', tagline:'Bring the story to its audience.', text:'Distribution and release support, festival preparation and the materials needed for the project’s next chapter.', tags:['RELEASE SUPPORT','FESTIVALS','AWARDS STRATEGY'] },
];
function Capabilities() {
  const [active,setActive]=useState(2);
  useEffect(() => {
    const openStage = hash => {
      const index = chapters.findIndex(chapter => `#stage-${chapter.name.toLowerCase()}` === hash);
      if (index !== -1) setActive(index);
    };
    const onHash = () => openStage(window.location.hash);
    const onLink = event => { const link = event.target.closest?.('a[href^="#stage-"]'); if (link) openStage(link.getAttribute('href')); };
    onHash();
    window.addEventListener('hashchange',onHash);
    document.addEventListener('click',onLink);
    return () => { window.removeEventListener('hashchange',onHash); document.removeEventListener('click',onLink); };
  }, []);
  return <section id="capabilities" className="capabilities-section section-space">
    <IndexLabel index="04" right="JOIN AT ANY STAGE">FROM FIRST DRAFT TO FINAL CUT</IndexLabel>
    <div className="capabilities-heading" data-reveal><h2>Big picture.<br /><span>Every little detail.</span></h2><p>A production is a thousand moving parts.<br />We help them move together.</p></div>
    <div className="capability-directory" data-reveal>{chapters.map((chapter,index) => <article id={`stage-${chapter.name.toLowerCase()}`} className={`capability-row ${active===index?'is-active':''}`} key={chapter.name}>
      <h3><button className="capability-trigger" id={`stage-trigger-${index}`} aria-expanded={active===index} aria-controls={`stage-panel-${index}`} onClick={() => setActive(active===index?null:index)}><span className="stage-index">0{index+1}</span><span className="stage-name">{chapter.name}</span><span className="stage-tagline">{chapter.tagline}</span><span className="stage-toggle" aria-hidden="true">{active===index?'−':'+'}</span></button></h3>
      <div id={`stage-panel-${index}`} className="capability-panel" role="region" aria-labelledby={`stage-trigger-${index}`} hidden={active!==index}><p>{chapter.text}</p><div className="stage-tags">{chapter.tags.map(tag => <span key={tag}>{tag}</span>)}</div><a className="line-link" href="/contact/#project-brief">Talk about this stage <Arrow /></a></div>
    </article>)}</div>
  </section>;
}

function India() {
  return <section id="india-production-services" className="india-section section-space">
    <IndexLabel index="05" right="LOCAL KNOWLEDGE. SHARED VISION.">INDIA PRODUCTION SERVICES</IndexLabel>
    <div className="india-layout" data-reveal><div className="india-copy"><span className="india-pin" aria-hidden="true">⌖</span><h2>Your story.<br />Our ground.</h2><p>Bringing a production to India? Start with the locations, people and practical support the project needs.</p><p>We coordinate location planning, casting, crew, equipment, travel and on-ground production management.</p><CTA href="/contact/#project-brief">Plan a shoot in India</CTA></div><figure className="india-image"><img src="/assets/stills/period-costume.webp" alt="A performer in a gold period costume standing in a traditional colonnade." width="1079" height="1541" loading="lazy" decoding="async" /><figcaption><span>PLACE. PEOPLE. POSSIBILITY.</span><span aria-hidden="true">⌖</span></figcaption><div className="india-image-label" aria-hidden="true">ON<br />LOCATION.</div></figure></div>
  </section>;
}

function Process() {
  return <section id="process" className="process-section section-space"><IndexLabel index="06">HOW THE WORK BEGINS</IndexLabel><div className="process-layout" data-reveal><h2>One story.<br />A shared plan.</h2><ol>{[['Show us the starting point.','A script, a concept, a brief, or a production already in progress.'],['Work out the way forward.','The stage, scope, collaborators and support the project needs.'],['Bring the pieces together.','A practical plan for the people, decisions and details ahead.']].map(([title,text],index) => <li key={title}><span>0{index+1}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol></div></section>;
}

function StudioNotes() {
  return <section id="studio-notes" className="notes-section section-space"><IndexLabel index="07" right="FROM THE STUDIO">KEEP THE CONVERSATION GOING</IndexLabel><div className="notes-grid"><div id="collaborate" className="collaborate-note" data-reveal><FrameMark /><h2>Different crafts.<br />One film crew.</h2><p>Filmmaker, creator, studio or production partner? Share where the work stands and what the next chapter needs.</p><a className="line-link" href="/contact/#project-brief">Find a way to work together <Arrow /></a></div><div className="studio-note" data-reveal><p className="note-eyebrow">NEWSROOM / NEXT CHAPTER</p><h3>There’s more<br />to come.</h3><p>Studio announcements and production updates will appear here as they are published.</p><a href="/news/" className="line-link">Read the studio notes <Arrow /></a></div></div></section>;
}

function ProjectBrief() {
 return <section id="project-brief" className="project-section section-space"><IndexLabel index="08" right="YOUR NEXT FRAME STARTS HERE">START A PROJECT</IndexLabel><div className="project-layout" data-reveal><div className="project-copy"><p>Got a story in mind?</p><h2>LET’S<br/><span>MAKE IT.</span><FrameMark/></h2><p>Start with what you have.<br/>We’ll work from there.</p><CTA href="/contact/#project-brief">Prepare a project brief</CTA></div><div className="project-side"><p className="project-note">A first draft.<br/>A bold idea.<br/>A question that<br/><em>won’t let go.</em></p><div className="project-foot"><span>KEMSOR STUDIOS</span><span>IDEA → AUDIENCE</span></div></div></div></section>;
}
export default function HomePage({paused,reduced}) {
 return <><Hero reduced={reduced} motionPaused={paused}/><Studio/><Productions/><VideoShowcase paused={paused} reduced={reduced}/><MotionStudio paused={paused}/><Capabilities/><ScrollStory paused={paused}/><India/><Process/><StudioNotes/><ProjectBrief/></>;
}
