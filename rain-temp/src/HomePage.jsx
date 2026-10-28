import SiteIcon from './SiteIcon';
import MotionHeading, { MotionCopy } from './TextMotion';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import HeroSequence from './HeroSequence';
import JourneyRouter from './JourneyRouter';
import StudioClipViewer from './StudioClipViewer';
import ScriptCardIllustration from './ScriptCardIllustration';
import { Arrow, CTA, IndexLabel } from './PageUI';
import './cinema-hero.css';
import './homepage-final.css';
import './partners-panels.css';
import './work-hover.css';
import './work-split.css';
import './services-bright.css';
import './service-flow.css';
import './showreel-gallery.css';
import useCompactRail from './useCompactRail';
import './home-compact.css';

const formats=['WEB SERIES & OTT','REGIONAL CINEMA','DOCUMENTARIES','SHORT FILMS','INTERNATIONAL CO-PRODUCTIONS'];
const services=[
 ['01','DEVELOP','Before cameras roll','Development & Packaging','Shaping the idea, the script and the creative package that makes a project ready to pitch.','Script development · Creative package · Pitch-ready project','/develop/','development-packaging.png','Development & planning'],
 ['02','FUND & PARTNER','Before cameras roll','Financing & Co-Production','Bringing financiers and investors into the conversation with a clear budget and production plan, and aligning partners across companies and borders on shared goals.','Investment coordination · Budget & production plan · Co-production partners','/finance/','financing-co-production.png','Film financing'],
 ['03','PREPARE','Before cameras roll','Pre-Production, Casting & Talent','Budgets, schedules, casting, crew, locations and design, settled before cameras roll, with talent drawn from the Kemsor Talent Network.','Casting & talent coordination · Crew & locations · Set & production design','/services/#capability-casting','daylight-park-production','Casting & talent'],
 ['04','SHOOT','On set','Production & Line Production','Running the shoot day to day, on set and on location: production management, logistics, crew and equipment.','Production management · Location & logistics · Crew & equipment','/services/#capability-filming','action-scene','Filming & production'],
 ['05','FINISH & RELEASE','After the wrap','Post-Production & Release','Overseeing edit, sound, colour and VFX through to final deliverables, then coordinating with platforms and distributors for release.','Post supervision · Final deliverables · Platform & distributor coordination','/services/#capability-post','post-production-release.png','Design & post-production'],
 ['06','INDIA','For visiting productions','India Production Services','On-the-ground support for productions filming in India: line production, locations and logistics, crew and equipment, and casting coordination.','Line production · Locations & logistics · Crew, equipment & casting','/india-production-services/','daylight-valley-production','India production services'],
];
const workFilters=['All','Web Series & OTT','Regional Cinema','Documentaries','Short Films','Co-Productions'];
// Supplied visual references. Confirmed project names, years and credits are pending.
const work=[
 ['work-camera-crew.webp','Short Films','Action on set'],
 ['work-period-camera.webp','Regional Cinema','Period worlds'],
 ['work-dance-set.png','Web Series & OTT','Performance in motion'],
 ['work-celebration-set.png','Co-Productions','Celebration in frame'],
 ['work-motorcycle-set.png','Short Films','On the road'],
 ['work-location-lighting.webp','Regional Cinema','On location'],
];
const studioClips=[
 {src:'/assets/motion-films/city-conversation-preview.mp4',poster:'/assets/motion-films/city-conversation.webp',label:'City stories'},
 {src:'/assets/motion-films/period-intrigue-preview.mp4',poster:'/assets/motion-films/period-intrigue.webp',label:'Period worlds'},
 {src:'/assets/motion-films/field-encounter-preview.mp4',poster:'/assets/motion-films/field-encounter.webp',label:'Stories in motion'},
 {src:'/assets/motion-films/theatre-facade.mp4',poster:'/assets/motion-films/theatre-facade-960.webp',label:'The big screen'},
];
function StudioClipRail({paused,reduced}){
 const runway=useRef(null),stage=useRef(null),viewport=useRef(null),track=useRef(null),viewer=useRef(null),videos=useRef([]);
 const [expanded,setExpanded]=useState(false),[near,setNear]=useState(false),[visible,setVisible]=useState([]),[tabVisible,setTabVisible]=useState(!document.hidden);
 const saveData=Boolean(navigator.connection?.saveData);
 useEffect(()=>{
  const preload=new IntersectionObserver(([entry])=>setNear(entry.isIntersecting),{rootMargin:'300px'});
  preload.observe(stage.current);
  const playback=new IntersectionObserver(entries=>setVisible(previous=>{
   const next=[...previous];entries.forEach(entry=>{next[Number(entry.target.dataset.clip)]=entry.isIntersecting&&entry.intersectionRatio>.12;});return next;
  }),{threshold:[0,.12,.5]});
  track.current.querySelectorAll('[data-clip]').forEach(card=>playback.observe(card));
  const update=()=>setTabVisible(!document.hidden);document.addEventListener('visibilitychange',update);
  return()=>{preload.disconnect();playback.disconnect();document.removeEventListener('visibilitychange',update);};
 },[]);
 useEffect(()=>{
  videos.current.forEach((video,index)=>{if(!video)return;if(visible[index]&&near&&tabVisible&&!paused&&!reduced&&!saveData&&!expanded)video.play().catch(()=>{});else video.pause();});
 },[visible,near,tabVisible,paused,reduced,saveData,expanded]);
 const move=useCompactRail({runway,stage,viewport,track,disabled:paused||reduced});
 return <><div id="showreel" className="showreel-runway" ref={runway}>
  <div className="showreel-gallery" ref={stage}>
   <div className="showreel-gallery-head"><div><span>SHOWREEL</span><MotionHeading as="h3">Kemsor <span className="heading-accent">showreel</span></MotionHeading></div><div className="compact-rail-controls" role="group" aria-label="Navigate showreel"><button type="button" onClick={()=>move(-1)} aria-label="Previous showreel films"><SiteIcon name="arrow-left" size={18}/></button><button type="button" onClick={()=>move(1)} aria-label="Next showreel films"><SiteIcon name="arrow" size={18}/></button></div></div>
   <div className="showreel-viewport" ref={viewport} tabIndex="0" aria-label="Kemsor showreel films. Scroll or swipe to explore.">
    <div className="showreel-track" ref={track}>{studioClips.map((clip,index)=><figure className={`showreel-card ${index%2===0?'showreel-card-large':'showreel-card-small'}`} key={clip.src} data-clip={index}>
     <div className="showreel-card-screen"><video ref={node=>{videos.current[index]=node}} src={near&&!reduced&&!saveData?clip.src:undefined} poster={clip.poster} muted loop playsInline preload="none" aria-hidden="true"/>
      <button type="button" className="showreel-card-expand" aria-label={`Watch ${clip.label} fullscreen`} onClick={()=>viewer.current.open(clip,videos.current[index]?.currentTime||0)}><SiteIcon name="expand" size={18}/><span>Fullscreen</span></button>
     </div><figcaption><strong>{clip.label}</strong><span aria-hidden="true">0{index+1} / 04</span></figcaption>
    </figure>)}</div>
   </div>
  </div>
 </div><StudioClipViewer ref={viewer} onOpenChange={setExpanded}/></>;
}
function HomeImage({name,alt,sizes,format='webp'}){const base=`/assets/stills/${name}`;return <img src={`${base}-960.${format}`} srcSet={`${base}-640.${format} 640w, ${base}-960.${format} 960w, ${base}-1600.${format} 1600w`} sizes={sizes} alt={alt} loading="lazy" decoding="async"/>}
function Formats(){return <div className="final-formats" aria-label={`Formats: ${formats.join(', ')}`}><div className="final-formats-track" aria-hidden="true">{[0,1,2,3].map(copy=><div className="final-formats-set" key={copy}>{formats.map(x=><React.Fragment key={x}><span>{x}</span><i>✦</i></React.Fragment>)}</div>)}</div></div>}
function About({paused,reduced}){return <section className="final-about section-space" id="studio"><IndexLabel right="PEOPLE, PLANNING AND PRODUCTION">ABOUT KEMSOR</IndexLabel><div className="final-about-grid" data-reveal><div><MotionHeading as="h2">The studio.<br/><span className="heading-accent">Behind the work.</span></MotionHeading><MotionCopy className="final-lead">We bring the creative and production teams into the same conversation.</MotionCopy></div><div><MotionCopy>Kemsor works with creators, filmmakers, studios and platforms on films, series and documentaries. We bring together the people and production expertise each project calls for.</MotionCopy><a className="line-link" href="/about/">About Kemsor <Arrow/></a></div></div><div className="proof-strip" data-reveal>{[['7','lifecycle stages, from development to release'],['5','formats, from short films to co-productions'],['1','studio connecting the people and the plan']].map(x=><div key={x[0]}><strong>{x[0]}</strong><span>{x[1]}</span></div>)}</div><StudioClipRail paused={paused} reduced={reduced}/></section>}
function Services({paused,reduced}){
 const deck=useRef(null);
 useLayoutEffect(()=>{
  const panels=[...deck.current.querySelectorAll('.service-panel')];
  const measure=()=>panels.forEach(panel=>{
   const inset=innerWidth<=700?78:innerWidth<=1000?84:100;
   panel.dataset.fits=String(panel.offsetHeight<=innerHeight-inset-12);
  });
  const observer=new ResizeObserver(measure);panels.forEach(panel=>observer.observe(panel));
  addEventListener('resize',measure);measure();
  return()=>{observer.disconnect();removeEventListener('resize',measure);};
 },[]);
 return <section className="final-services section-space" id="services">
  <IndexLabel right="SERVICES, WITH THE WORK BESIDE THEM">WHAT WE OFFER</IndexLabel>
  <div className="final-section-head"><MotionHeading as="h2">Production support.<br/><span className="heading-accent">Built around your project.</span></MotionHeading><MotionCopy>Bring us in at the start, or at the stage where you need us most. Each service sits beside work it has shaped, so you can see the craft, not just read about it.</MotionCopy></div>
  <div ref={deck} className="service-deck" data-motion={paused||reduced?'paused':'playing'}>
   {services.map(([no,tag,stage,title,text,includes,href,image,linkLabel],index)=><article className="service-panel" key={no} style={{'--panel-order':index+1}} aria-labelledby={`home-service-${no}`}>
    <div className="service-panel-top"><span>{no} / 06 <span className="service-panel-tag">{tag}</span></span><a href={href}>{linkLabel}<SiteIcon name="arrow-up-right" size={18}/></a></div>
    <h3 id={`home-service-${no}`}>{title}</h3>
    <div className="service-panel-body">
     <a className="service-panel-image" href={href} aria-label={`Explore ${title}`}><HomeImage name={image.replace(/\.[^.]+$/,'')} alt="" sizes="(max-width: 700px) 90vw, 42vw"/><span aria-hidden="true"><SiteIcon name="arrow-up-right" size={22}/></span></a>
     <div className="service-panel-copy"><span className="service-panel-stage">{stage}</span><p>{text}</p><ul aria-label={`${title} includes`}>{includes.split(' · ').map(item=><li key={item}><SiteIcon name="check" size={15}/><span>{item}</span></li>)}</ul></div>
    </div>
   </article>)}
  </div>
  <div className="services-close"><MotionCopy>Scope is shaped to the project, never imposed as a fixed package.</MotionCopy><a href="/services/">All services <Arrow/></a></div>
 </section>;
}
function WorkMotionGraphic(){
 return <span className="work-motion-graphic" aria-hidden="true"><svg className="work-motion-frame" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none"><path pathLength="1" d="M5 18V5H18 M82 5H95V18 M95 82V95H82 M18 95H5V82" vectorEffect="non-scaling-stroke"/></svg><span className="work-motion-target"><SiteIcon name="target" size={60} /></span><span className="work-motion-line"/><span className="work-motion-note">IN FRAME</span></span>;
}
function Work({reduced}){
 const [filter,setFilter]=useState('All');
 const visibleWork=filter==='All'?work:work.filter(item=>item[1]===filter);
 const runway=useRef(null),stage=useRef(null),viewport=useRef(null),track=useRef(null);
 const move=useCompactRail({runway,stage,viewport,track,disabled:reduced,resetKey:filter,snapToCards:true});
 return <section className="final-work section-space" id="productions" aria-labelledby="work-title">
  <div ref={runway} className={`work-scroll-runway${reduced?' is-reduced':''}`}>
   <div ref={stage} className="work-scroll-stage">
    <div className="work-sidebar">
     <span className="work-kicker">IN FRAME</span>
     <MotionHeading as="h2" id="work-title">The work,<br/><em>in frame.</em></MotionHeading>
     <MotionCopy>Explore films, series and co-productions.</MotionCopy>
     <a className="line-link" href="/projects/">Explore productions <Arrow/></a>
     <div className="work-filters" role="group" aria-label="Filter selected productions">{workFilters.map(format=><button type="button" key={format} aria-pressed={filter===format} aria-controls="selected-work-list" onClick={()=>setFilter(format)}>{format}</button>)}</div>
     <p className="work-credit-note">Credits list the stages Kemsor supported on each production.</p>
    </div>
    <div className="work-gallery">
    <div ref={viewport} className="work-scroll-viewport" role="region" aria-label="Selected productions, scroll or drag to explore">
     <div ref={track} id="selected-work-list" className="work-scroll-track">{visibleWork.map(([file,format,title])=><a href="/projects/" key={file}><div className="work-image"><HomeImage name={file.replace(/\.[^.]+$/,'')} alt={`Visual reference: ${title}`} sizes="(max-width: 760px) 45vw, 32vw"/><WorkMotionGraphic/><b className={file===work[0][0]?'work-featured-badge':undefined}>{file===work[0][0]?'FEATURED':String(work.findIndex(item=>item[0]===file)+1).padStart(2,'0')}</b><i>VIEW <SiteIcon name="arrow-up-right" size={16} /></i></div><span className="work-category">{format}</span><h3>{title}</h3><p>Visual reference</p></a>)}</div>
     <p className="sr-only" role="status">{visibleWork.length?`${visibleWork.length} visuals in ${filter==='All'?'all formats':filter}.`:`${filter} productions will appear here once confirmed.`}</p>
     {!visibleWork.length&&<div className="work-empty"><h3>Documentaries</h3><p>Productions will appear here once confirmed.</p><a className="line-link" href="/what-we-make/documentaries/">Explore documentaries <Arrow/></a></div>}
    </div>
    {visibleWork.length>0&&<div className="compact-rail-controls work-gallery-controls" role="group" aria-label="Navigate selected productions"><button type="button" onClick={()=>move(-1)} aria-label="Previous productions"><SiteIcon name="arrow-left" size={18}/></button><button type="button" onClick={()=>move(1)} aria-label="Next productions"><SiteIcon name="arrow" size={18}/></button></div>}
    </div>
   </div>
  </div>
 </section>;
}
function Process(){const steps=[['Understand the story','What the story needs to be and who it is for, before any numbers are set.'],['Build the plan','Budget, schedule, team and locations shaped by the creative goal.'],['Deliver the work','Clear communication keeps every collaborator aligned, stage to stage.']];return <section className="final-process section-space"><IndexLabel right="FROM FIRST DRAFT TO FINAL CUT">HOW THE WORK BEGINS</IndexLabel><MotionHeading as="h2">A clear way<br/><span className="heading-accent">to work together.</span></MotionHeading><ol>{steps.map((x,i)=><li key={x[0]}><b>0{i+1}</b><MotionHeading as="h3">{x[0]}</MotionHeading><p>{x[1]}</p></li>)}</ol><article className="script-card"><ScriptCardIllustration/><div><span>SCRIPT TO PRODUCTION</span><MotionHeading as="h3">Have a script or just an idea?<br/><span className="heading-accent">Start here.</span></MotionHeading></div><div><MotionCopy>Share your script or idea, along with the format and any production plans already in place.</MotionCopy><ul><li>Finished scripts and early ideas welcome</li><li>Terms accepted before any submission is reviewed</li><li>Track your submission from your profile</li></ul><CTA href="/script-to-production/">Submit your story</CTA></div></article></section>}
function Partners(){
 const panels=[
  {label:'WORK WITH KEMSOR',title:<>Partner <span className="heading-accent">with us.</span></>,description:'We work with writers, directors, producers, studios, OTT platforms, financiers and international collaborators.',links:[['Filmmakers & creators','/contact/?partner=filmmakers'],['Studios & platforms','/contact/?partner=studios'],['Co-producers & financiers','/contact/?partner=co-producers'],['International productions','/contact/?partner=international-productions']]},
  {label:'TALENT NETWORK',title:<>The people <span className="heading-accent">behind the frame.</span></>,description:'Find cast and crew for your production, or join the network Kemsor draws on for casting and crew coordination.',links:[['Find talent','/find-talent/'],['Join KEMSOR','/join/'],['Casting calls','/find-talent/#casting-calls'],['Press & media','/press-media/']]},
 ];
 return <section id="work-with-kemsor" className="final-partners collaboration-editorial section-space">
  <IndexLabel right="BUILT FOR COLLABORATION">WHO WE WORK WITH</IndexLabel>
  <div className="collaboration-layout">
   <figure className="collaboration-still">
    <img src="/assets/stills/partner-studio-960.webp" srcSet="/assets/stills/partner-studio-640.webp 640w, /assets/stills/partner-studio-960.webp 960w, /assets/stills/partner-studio-1600.webp 1600w" sizes="(max-width: 700px) 100vw, (max-width: 1100px) 90vw, 30vw" width="1600" height="1200" alt="Studio cameras and lighting equipment beside a red backdrop" loading="lazy" decoding="async"/>
    <figcaption><span>KEMSOR STUDIOS</span><span>BEHIND THE FRAME</span></figcaption>
   </figure>
   {panels.map((panel,index)=><article className="collaboration-path" key={panel.label} aria-labelledby={`partner-panel-${index}`}>
    <div className="collaboration-path-label"><span>{panel.label}</span><span aria-hidden="true">0{index+1}</span></div>
    <MotionHeading as="h2" id={`partner-panel-${index}`}>{panel.title}</MotionHeading>
    <MotionCopy>{panel.description}</MotionCopy>
    <nav aria-labelledby={`partner-panel-${index}`}>
     {panel.links.map(([label,href])=><a key={href} href={href}><span>{label}</span><span className="collaboration-path-arrow" aria-hidden="true"><SiteIcon name="arrow-up-right" size={18}/></span></a>)}
    </nav>
   </article>)}
  </div>
 </section>;
}

export default function HomePage({paused,reduced}){return <><HeroSequence reduced={reduced} motionPaused={paused}/><Formats/><JourneyRouter/><About paused={paused} reduced={reduced}/><Services paused={paused} reduced={reduced}/><Work reduced={reduced}/><Process/><Partners/></>}
