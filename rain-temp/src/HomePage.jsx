import React, { useEffect, useRef, useState } from 'react';
import MotionStudio from './MotionStudio';
import ScrollStory from './ScrollStory';
import VideoShowcase from './VideoShowcase';
import './cinema-hero.css';
import './home-colours.css';
import HeroSequence from './HeroSequence';
import { useCms, CmsText, CmsEntries } from './CmsContent';

import { Arrow, CTA, FrameMark, IndexLabel } from './PageUI';

function Studio() {
  const { entries } = useCms();
  const intro = entries.find(entry => entry.type === 'home' && entry.slug === 'home-intro');
  return <section id="studio" className="studio-section section-space">
    <IndexLabel index="01" right="A STUDIO WITH A PRACTICAL SIDE">THE PEOPLE BEHIND THE FRAME</IndexLabel>
    <div className="studio-layout" data-reveal>
      <h2>{intro && intro.title !== 'The script is just the beginning.' ? intro.title : <>The script is<br />just the <span className="hand-circle">beginning.<svg viewBox="0 0 410 115" aria-hidden="true"><path d="M404 54C389-8 21-1 7 51S369 132 398 65" /></svg></span></>}</h2>
      <div className="studio-description"><FrameMark className="studio-frame-mark" />{intro ? <><p>{intro.summary}</p><CmsText text={intro.body}/></> : <><p>Kemsor works with filmmakers, studios and production partners on films, series and documentaries.</p><p>Some projects need a team from the first draft. Others need people on the ground, a hand through post, or a plan for release. We shape our role around the work.</p></>}<a className="line-link" href="/services/">Explore the production services <Arrow /></a></div>
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
      <button className="frame-image" onClick={event => show(index,event)} aria-label={`View full image: ${item.title}`}><img src={`/assets/stills/${item.file}.webp`} alt={item.alt} width={item.width} height={item.height} loading="lazy" decoding="async" /><span className="frame-view">Take a closer look <span aria-hidden="true">+</span></span></button>
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
      <h3><button className="capability-trigger" id={`stage-trigger-${index}`} aria-expanded={active===index} aria-controls={`stage-panel-${index}`} onClick={() => setActive(active===index?null:index)}><span className="stage-name">{chapter.name}</span><span className="stage-tagline">{chapter.tagline}</span><span className="stage-toggle" aria-hidden="true">{active===index?'−':'+'}</span></button></h3>
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
  return <section id="process" className="process-section section-space"><IndexLabel index="06">HOW THE WORK BEGINS</IndexLabel><div className="process-layout" data-reveal><h2>One story.<br />A shared plan.</h2><ol>{[['Show us the starting point.','A script, a concept, a brief, or a production already in progress.'],['Work out the way forward.','The stage, scope, collaborators and support the project needs.'],['Bring the pieces together.','A practical plan for the people, decisions and details ahead.']].map(([title,text],index) => <li key={title}><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol></div></section>;
}

function StudioNotes() {
  return <section id="studio-notes" className="notes-section section-space"><IndexLabel index="07" right="FROM THE STUDIO">KEEP THE CONVERSATION GOING</IndexLabel><div className="notes-grid"><div id="collaborate" className="collaborate-note" data-reveal><FrameMark /><h2>Different crafts.<br />One film crew.</h2><p>Filmmaker, creator, studio or production partner? Share where the work stands and what the next chapter needs.</p><a className="line-link" href="/contact/#project-brief">Find a way to work together <Arrow /></a></div><div className="studio-note" data-reveal><p className="note-eyebrow">NEWSROOM / NEXT CHAPTER</p><h3>There’s more<br />to come.</h3><p>Studio announcements and production updates will appear here as they are published.</p><a href="/news/" className="line-link">Read the studio notes <Arrow /></a></div></div></section>;
}

function ProjectBrief() {
 return <section id="project-brief" className="project-section section-space"><IndexLabel index="08" right="YOUR NEXT FRAME STARTS HERE">START A PROJECT</IndexLabel><div className="project-layout" data-reveal><div className="project-copy"><p>Got a story in mind?</p><h2>LET’S<br/><span>MAKE IT.</span><FrameMark/></h2><p>Start with what you have.<br/>We’ll work from there.</p><CTA href="/contact/#project-brief">Prepare a project brief</CTA></div><div className="project-side"><p className="project-note">A first draft.<br/>A bold idea.<br/>A question that<br/><em>won’t let go.</em></p><div className="project-foot"><span>KEMSOR STUDIOS</span><span>IDEA → AUDIENCE</span></div></div></div></section>;
}
export default function HomePage({paused,reduced}) {
 const { entries } = useCms();
 const promotions = entries.filter(entry => entry.type === 'home' && !['home-hero','home-intro'].includes(entry.slug));
 return <><HeroSequence reduced={reduced} motionPaused={paused}/><Studio/><CmsEntries entries={promotions}/><Productions/><VideoShowcase paused={paused} reduced={reduced}/><MotionStudio paused={paused}/><Capabilities/><ScrollStory paused={paused}/><India/><Process/><StudioNotes/><ProjectBrief/></>;
}
