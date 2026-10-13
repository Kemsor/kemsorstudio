import React, { useEffect, useRef, useState } from 'react';
import ScrollStory from './ScrollStory';
import VideoShowcase from './VideoShowcase';
import './cinema-hero.css';
import './home-colours.css';
import HeroSequence from './HeroSequence';
import { useCms, CmsText, CmsEntries } from './CmsContent';

import { Arrow, CTA, FrameMark, IndexLabel } from './PageUI';

const studioClips = [
  { src:'/assets/motion-films/city-conversation-preview.mp4', poster:'/assets/motion-films/city-conversation.webp', label:'City stories' },
  { src:'/assets/motion-films/period-intrigue-preview.mp4', poster:'/assets/motion-films/period-intrigue.webp', label:'Period worlds' },
  { src:'/assets/motion-films/field-encounter-preview.mp4', poster:'/assets/motion-films/field-encounter.webp', label:'Stories in motion' },
  { src:'/assets/motion-films/theatre-facade.mp4', poster:'/assets/motion-films/theatre-facade.jpg', label:'The big screen' },
];

function StudioClipRail({ paused, reduced }) {
  const [active, setActive] = useState(0);
  const videos = useRef([]);
  useEffect(() => {
    videos.current.forEach((video,index) => {
      if (!video) return;
      if (index === active && !paused && !reduced && !document.hidden) video.play().catch(() => {});
      else video.pause();
    });
  }, [active,paused,reduced]);
  useEffect(() => {
    if (paused || reduced) return undefined;
    const advance = () => setActive(index => (index + 1) % studioClips.length);
    const timer = window.setInterval(advance, 4800);
    const visibility = () => videos.current[active]?.[document.hidden ? 'pause' : 'play']()?.catch?.(() => {});
    document.addEventListener('visibilitychange', visibility);
    return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', visibility); };
  }, [active,paused,reduced]);
  return <figure className="studio-cinema-strip" data-reveal>
    <div className="studio-clip-stage">{studioClips.map((clip,index) => <video
      key={clip.src}
      ref={node => { videos.current[index] = node; }}
      className={index === active ? 'is-active' : ''}
      src={reduced && index !== 0 ? undefined : clip.src}
      poster={clip.poster}
      muted loop playsInline preload={index < 2 ? 'metadata' : 'none'}
      aria-hidden="true"
    />)}</div>
    <div className="studio-clip-label" aria-live="polite">{studioClips[active].label}</div>
    <figcaption><span>ONE IDEA.</span><strong>EVERY MOVING PART.</strong><span>ONE FINISHED FRAME.</span></figcaption>
    <div className="studio-clip-controls" aria-label="Choose a film clip">{studioClips.map((clip,index) => <button key={clip.src} type="button" aria-label={`Show ${clip.label}`} aria-pressed={active === index} onClick={() => setActive(index)}><span /></button>)}</div>
  </figure>;
}

function Studio({ paused, reduced }) {
  const { entries } = useCms();
  const intro = entries.find(entry => entry.type === 'home' && entry.slug === 'home-intro');
  return <section id="studio" className="studio-section section-space">
    <IndexLabel index="01" right="A STUDIO WITH A PRACTICAL SIDE">ABOUT KEMSOR</IndexLabel>
    <div className="studio-layout" data-reveal>
      <h2>{intro && intro.title !== 'The script is just the beginning.' ? intro.title : <>The script is<br />just the <span className="hand-circle">beginning.<svg viewBox="0 0 410 115" aria-hidden="true"><path d="M404 54C389-8 21-1 7 51S369 132 398 65" /></svg></span></>}</h2>
      <div className="studio-description"><FrameMark className="studio-frame-mark" />{intro ? <><p>{intro.summary}</p><CmsText text={intro.body}/></> : <><p>Kemsor is a production studio built around stories, collaboration and the practical work of bringing an idea to the screen.</p><p>We work with filmmakers, studios and production partners across films, series and documentaries, shaping our role around what each production needs.</p></>}<a className="line-link" href="/about/">Discover Kemsor <Arrow /></a></div>
    </div>
    <StudioClipRail paused={paused} reduced={reduced}/>
    <div className="format-rail" aria-label="Story formats"><div className="format-track">
      {[0,1].map(copy => <div className="format-group" aria-hidden={copy === 1 ? 'true' : undefined} key={copy}><span>FEATURE FILMS</span><FrameMark /><span>SERIES & OTT</span><FrameMark /><span>DOCUMENTARIES</span><FrameMark /><span>SHORT FILMS</span><FrameMark /></div>)}
    </div></div>
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
    <div className="section-heading" data-reveal><h2>The world<br />inside a frame.</h2><p>A performance. A place. A point of view.<br />A selection from the studio’s visual collection.</p></div>
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
    <div className="capabilities-editorial">
      <div className="capabilities-intro" data-reveal><p className="capabilities-kicker">THE PRODUCTION PATH</p><h2>Big picture.<br /><span>Every little detail.</span></h2><p>A production is a thousand moving parts. We help them move together, from the first conversation to the finished frame.</p><div className="capabilities-path" aria-hidden="true">{chapters.map((chapter,index) => <span className={active===index?'is-current':''} key={chapter.name}/>)}</div></div>
      <div className="capability-directory" data-reveal>{chapters.map((chapter,index) => <article id={`stage-${chapter.name.toLowerCase()}`} className={`capability-row ${active===index?'is-active':''}`} key={chapter.name}>
      <h3><button className="capability-trigger" id={`stage-trigger-${index}`} aria-expanded={active===index} aria-controls={`stage-panel-${index}`} onClick={() => setActive(active===index?null:index)}><span className="stage-name">{chapter.name}</span><span className="stage-tagline">{chapter.tagline}</span><span className="stage-toggle" aria-hidden="true">{active===index?'−':'+'}</span></button></h3>
      <div id={`stage-panel-${index}`} className="capability-panel" role="region" aria-labelledby={`stage-trigger-${index}`} hidden={active!==index}><p>{chapter.text}</p><div className="stage-tags">{chapter.tags.map(tag => <span key={tag}>{tag}</span>)}</div><a className="line-link" href="/contact/#project-brief">Talk about this stage <Arrow /></a></div>
      </article>)}</div>
    </div>
  </section>;
}

function Process() {
  return <section id="process" className="process-section section-space"><IndexLabel index="06">HOW THE WORK BEGINS</IndexLabel><div className="process-layout"><h2 data-reveal>One story.<br />A shared plan.</h2><ol>{[['Show us the starting point.','A script, a concept, a brief, or a production already in progress.'],['Work out the way forward.','The stage, scope, collaborators and support the project needs.'],['Bring the pieces together.','A practical plan for the people, decisions and details ahead.']].map(([title,text],index) => <li key={title} data-reveal style={{'--process-delay':`${index * 110}ms`}}><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol></div></section>;
}

function ProjectBrief() {
 return <section id="project-brief" className="project-section section-space"><IndexLabel index="08" right="YOUR NEXT FRAME STARTS HERE">START A PROJECT</IndexLabel><div className="project-layout" data-reveal><div className="project-copy"><p>Got a story in mind?</p><h2>LET’S<br/><span>MAKE IT.</span><FrameMark/></h2><p>Start with what you have.<br/>We’ll work from there.</p><CTA href="/contact/#project-brief">Prepare a project brief</CTA></div><div className="project-side"><p className="project-note">A first draft.<br/>A bold idea.<br/>A question that<br/><em>won’t let go.</em></p><div className="project-foot"><span>KEMSOR STUDIOS</span><span>IDEA → AUDIENCE</span></div></div></div></section>;
}
export default function HomePage({paused,reduced}) {
 const { entries } = useCms();
 const promotions = entries.filter(entry => entry.type === 'home' && !['home-hero','home-intro'].includes(entry.slug));
 return <><HeroSequence reduced={reduced} motionPaused={paused}/><Studio paused={paused} reduced={reduced}/><CmsEntries entries={promotions}/><ScrollStory paused={paused} reduced={reduced}/><VideoShowcase paused={paused} reduced={reduced}/><Productions/><Capabilities/><div className="work-project-block"><Process/><ProjectBrief/></div></>;
}
