import React, { useEffect, useRef, useState } from 'react';
import HeroSequence from './HeroSequence';
import { Arrow, CTA, IndexLabel } from './PageUI';
import './cinema-hero.css';
import './homepage-final.css';

const formats=['WEB SERIES & OTT','REGIONAL CINEMA','DOCUMENTARIES','SHORT FILMS','INTERNATIONAL CO-PRODUCTIONS'];
const services=[
 ['01','DEVELOP','Before cameras roll','Development & Packaging','Shaping the idea, the script and the creative package that makes a project ready to pitch.','Script development · Creative package · Pitch-ready project','/services/#development','development-packaging.png'],
 ['02','FUND & PARTNER','Before cameras roll','Financing & Co-Production','Bringing financiers, investors and production partners into the conversation around a clear plan.','Investment coordination · Budget & production plan · Co-production partners','/services/#capability-financing','financing-co-production.png'],
 ['03','PREPARE','Before cameras roll','Pre-Production, Casting & Talent','Budgets, schedules, casting, crew, locations and design — settled before cameras roll.','Casting & talent · Crew & locations · Set & production design','/services/#capability-casting','pre-production-casting.png'],
 ['04','SHOOT','On set','Production & Line Production','Running the shoot day to day, on set and on location, with every moving part aligned.','Production management · Locations & logistics · Crew & equipment','/services/#capability-filming','action-scene'],
 ['05','FINISH & RELEASE','After the wrap','Post-Production & Release','Overseeing edit, sound, colour and VFX through final delivery and release coordination.','Post supervision · Final deliverables · Platform coordination','/services/#capability-post','post-production-release.png'],
 ['06','INDIA','For visiting productions','India Production Services','On-the-ground support for productions filming in India, from locations to casting and crew.','Line production · Locations & logistics · Crew, equipment & casting','/services/#india-production-services','india-production-services.png'],
];
const work=[
 ['work-action-set.png','Short Films','Action on set','Line production'],
 ['work-period-set.png','Regional Cinema','Period worlds','Pre-production & casting'],
 ['work-dance-set.png','Web Series & OTT','Performance in motion','Production support'],
 ['work-celebration-set.png','Co-Productions','Celebration in frame','Production support'],
 ['work-motorcycle-set.png','Short Films','On the road','Line production'],
 ['work-forest-set.png','Regional Cinema','On location','Production support'],
];
const studioClips=[
 {src:'/assets/motion-films/city-conversation-preview.mp4',poster:'/assets/motion-films/city-conversation.webp',label:'City stories'},
 {src:'/assets/motion-films/period-intrigue-preview.mp4',poster:'/assets/motion-films/period-intrigue.webp',label:'Period worlds'},
 {src:'/assets/motion-films/field-encounter-preview.mp4',poster:'/assets/motion-films/field-encounter.webp',label:'Stories in motion'},
 {src:'/assets/motion-films/theatre-facade.mp4',poster:'/assets/motion-films/theatre-facade.jpg',label:'The big screen'},
];
function StudioClipRail({paused,reduced}){
 const [active,setActive]=useState(0);
 const [hovered,setHovered]=useState(false),[focused,setFocused]=useState(false);
 const videos=useRef([]);
 useEffect(()=>{
  videos.current.forEach((video,index)=>{if(!video)return;if(index===active&&!paused&&!reduced&&!document.hidden)video.play().catch(()=>{});else video.pause();});
 },[active,paused,reduced]);
 useEffect(()=>{
  if(paused||reduced||hovered||focused)return;
  const timer=window.setInterval(()=>setActive(index=>(index+1)%studioClips.length),4200);
  return()=>window.clearInterval(timer);
 },[paused,reduced,hovered,focused]);
 return <figure className="final-cinema-rail" data-reveal onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} onFocusCapture={()=>setFocused(true)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget))setFocused(false);}}>
  <div className="final-cinema-stage">{studioClips.map((clip,index)=><video key={clip.src} ref={node=>{videos.current[index]=node}} className={index===active?'is-active':''} src={reduced&&index!==0?undefined:clip.src} poster={clip.poster} muted loop playsInline preload={index<2?'metadata':'none'} aria-hidden="true"/>)}</div>
  <div className="final-cinema-wash" aria-hidden="true"/>
  <figcaption><span>ONE IDEA.</span><strong>EVERY MOVING PART.</strong><span>ONE FINISHED FRAME.</span></figcaption>
  <div className="final-cinema-controls" aria-label="Choose a film clip">{studioClips.map((clip,index)=><button key={clip.src} type="button" aria-label={`Show ${clip.label}`} aria-pressed={active===index} onMouseEnter={()=>setActive(index)} onFocus={()=>setActive(index)} onClick={()=>setActive(index)}><i/><span>{clip.label}</span></button>)}</div>
 </figure>;
}
function Formats(){return <div className="final-formats" aria-label={`Formats: ${formats.join(', ')}`}><div className="final-formats-track" aria-hidden="true">{[0,1,2,3].map(copy=><div className="final-formats-set" key={copy}>{formats.map(x=><React.Fragment key={x}><span>{x}</span><i>✦</i></React.Fragment>)}</div>)}</div></div>}
function About({paused,reduced}){return <section className="final-about section-space" id="studio"><IndexLabel right="THE DISTANCE BETWEEN IDEA AND AUDIENCE">ABOUT KEMSOR</IndexLabel><div className="final-about-grid" data-reveal><div><h2>First, a page.<br/>Then, a <em>possibility.</em></h2><p className="final-lead">A line on a page becomes a place. A performance. A moment that stays with you.</p></div><div><p>Kemsor is a film and production partner for creators, filmmakers, studios, and platforms. We bring the creative vision and the practical pieces together — the planning, people, and production discipline a story needs to reach its audience.</p><a className="line-link" href="/about/">About Kemsor <Arrow/></a></div></div><div className="proof-strip" data-reveal>{[['7','lifecycle stages, from development to release'],['5','formats, from short films to co-productions'],['1','partner, at any stage you need us']].map(x=><div key={x[0]}><strong>{x[0]}</strong><span>{x[1]}</span></div>)}</div><StudioClipRail paused={paused} reduced={reduced}/></section>}
function Services(){return <section className="final-services section-space" id="services"><IndexLabel right="SERVICES, WITH THE WORK BESIDE THEM">WHAT WE OFFER</IndexLabel><div className="final-section-head"><h2>Everything a story needs<br/>to reach the screen.</h2><p>Bring us in at the start, or at the stage where you need us most. Each service sits beside the work, so you can see the craft, not just read about it.</p></div><div className="service-stack">{services.map(([no,tag,stage,title,text,includes,href,image],index)=><article key={no} style={{'--service-index':index}}><img src={`/assets/stills/${image.includes('.')?image:`${image}.webp`}`} alt="" loading="lazy"/><div className="service-shade" aria-hidden="true"/><div className="service-copy"><div className="service-meta"><span>{no} / 06 · {tag}</span><i>{stage}</i></div><div className="service-body"><h3>{title}</h3><p>{text}</p><small>{includes}</small><a href={href}>Explore service <Arrow/></a></div></div></article>)}</div><div className="services-close"><p>Scope is shaped to the project — never imposed as a fixed package.</p><a href="/services/">All services <Arrow/></a></div></section>}
function Work({reduced}){
 const runway=useRef(null),stage=useRef(null),viewport=useRef(null),track=useRef(null);
 useEffect(()=>{
  if(reduced)return;
  const host=runway.current,frame=stage.current,windowEl=viewport.current,rail=track.current;
  if(!host||!frame||!windowEl||!rail)return;
  let distance=0,raf=0;
  const update=()=>{
   raf=0;
   const top=parseFloat(getComputedStyle(frame).top)||0;
   const travelled=Math.min(distance,Math.max(0,top-host.getBoundingClientRect().top));
   rail.style.transform=`translate3d(${-travelled}px,0,0)`;
  };
  const schedule=()=>{if(!raf)raf=requestAnimationFrame(update);};
  const measure=()=>{distance=Math.max(0,rail.scrollWidth-windowEl.clientWidth);host.style.height=`${frame.offsetHeight+distance}px`;schedule();};
  const observer=new ResizeObserver(measure);observer.observe(frame);observer.observe(windowEl);observer.observe(rail);
  window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',measure);
  const focus=event=>{const card=event.target.closest('a');if(!card)return;const top=parseFloat(getComputedStyle(frame).top)||0;const offset=Math.min(distance,Math.max(0,card.offsetLeft));window.scrollTo({top:window.scrollY+host.getBoundingClientRect().top-top+offset,behavior:'instant'});};
  rail.addEventListener('focusin',focus);measure();
  return()=>{observer.disconnect();window.removeEventListener('scroll',schedule);window.removeEventListener('resize',measure);rail.removeEventListener('focusin',focus);cancelAnimationFrame(raf);host.style.height='';rail.style.transform='';};
 },[reduced]);
 useEffect(()=>{
  const host=runway.current,frame=stage.current,windowEl=viewport.current,rail=track.current;
  if(!host||!frame||!windowEl||!rail)return;
  let drag=null,suppressUntil=0;
  const down=event=>{
   if(event.pointerType!=='mouse'||event.button!==0)return;
   event.preventDefault();
   const top=parseFloat(getComputedStyle(frame).top)||0;
   const start=window.scrollY+host.getBoundingClientRect().top-top;
   const distance=Math.max(0,rail.scrollWidth-windowEl.clientWidth);
   drag={id:event.pointerId,x:event.clientX,start,distance,offset:reduced?windowEl.scrollLeft:Math.min(distance,Math.max(0,window.scrollY-start)),moved:false};
  };
  const move=event=>{
   if(!drag||event.pointerId!==drag.id)return;
   const delta=drag.x-event.clientX;
   if(!drag.moved&&Math.abs(delta)<5)return;
   drag.moved=true;event.preventDefault();
   windowEl.classList.add('is-dragging');
   if(!windowEl.hasPointerCapture(drag.id))windowEl.setPointerCapture(drag.id);
   const offset=Math.min(drag.distance,Math.max(0,drag.offset+delta));
   if(reduced)windowEl.scrollLeft=offset;
   else window.scrollTo({top:drag.start+offset,behavior:'instant'});
  };
  const end=event=>{
   if(!drag||event.pointerId!==drag.id)return;
   const id=drag.id;
   if(drag.moved)suppressUntil=performance.now()+350;
   drag=null;windowEl.classList.remove('is-dragging');
   if(windowEl.hasPointerCapture(id))windowEl.releasePointerCapture(id);
  };
  const click=event=>{if(performance.now()<suppressUntil){event.preventDefault();event.stopPropagation();}};
  const nativeDrag=event=>event.preventDefault();
  windowEl.addEventListener('pointerdown',down);
  window.addEventListener('pointermove',move,{passive:false});
  window.addEventListener('pointerup',end);window.addEventListener('pointercancel',end);
  windowEl.addEventListener('lostpointercapture',end);
  windowEl.addEventListener('click',click,true);windowEl.addEventListener('dragstart',nativeDrag);
  return()=>{if(drag&&windowEl.hasPointerCapture(drag.id))windowEl.releasePointerCapture(drag.id);drag=null;windowEl.classList.remove('is-dragging');windowEl.removeEventListener('pointerdown',down);window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',end);window.removeEventListener('pointercancel',end);windowEl.removeEventListener('lostpointercapture',end);windowEl.removeEventListener('click',click,true);windowEl.removeEventListener('dragstart',nativeDrag);};
 },[reduced]);
 return <section className="final-work section-space" id="productions">
  <IndexLabel right="SELECTED PRODUCTIONS">IN FRAME</IndexLabel>
  <div className="work-intro" data-reveal>
   <div><span className="work-kicker">STORIES, SEEN IN MOTION</span><h2>The work.<br/><em>In frame.</em></h2></div>
   <div className="work-intro-copy"><p>A selection of productions Kemsor has helped bring to the screen — each credited with the stage we supported.</p><a className="line-link" href="/projects/">View all productions <Arrow/></a></div>
  </div>
  <div ref={runway} className={`work-scroll-runway${reduced?' is-reduced':''}`}>
   <div ref={stage} className="work-scroll-stage">
    <div className="work-scroll-caption"><span>SELECTED PRODUCTIONS</span><span>{reduced?'Explore the collection':'Scroll or drag to explore'}</span></div>
    <div ref={viewport} className="work-scroll-viewport">
     <div ref={track} className="work-scroll-track">{work.map(([file,format,title,role],i)=><a href="/projects/" key={file}><div className="work-image"><img src={`/assets/stills/${file}`} alt={title} loading="lazy"/><b>{String(i+1).padStart(2,'0')}</b><i>VIEW ↗</i></div><span className="work-category">{format}</span><h3>{title}</h3><p>Kemsor role: {role}</p></a>)}</div>
    </div>
   </div>
  </div>
  <div className="work-footer"><p>Credits list the stages Kemsor supported on each production.</p><a className="line-link" href="/projects/">Explore productions <Arrow/></a></div>
 </section>;
}
function Process(){const steps=[['Understand the story','What the story needs to be and who it is for — before any numbers are set.'],['Build the plan','Budget, schedule, team and locations shaped by the creative goal.'],['Deliver the work','Clear communication keeps every collaborator aligned, stage to stage.']];return <section className="final-process section-space"><IndexLabel right="FROM FIRST DRAFT TO FINAL CUT">HOW THE WORK BEGINS</IndexLabel><h2>Understand the story.<br/>Build the plan. <em>Deliver the work.</em></h2><ol>{steps.map((x,i)=><li key={x[0]}><b>0{i+1}</b><h3>{x[0]}</h3><p>{x[1]}</p></li>)}</ol><article className="script-card"><div><span>SCRIPT TO PRODUCTION</span><h3>Have a script — or just an idea?<br/>Start here.</h3></div><div><p>Share where your project is today. We’ll look at what the story needs and the stage you need us most — then shape the next step together.</p><ul><li>Finished scripts and early ideas welcome</li><li>Terms accepted before any submission is reviewed</li><li>Track your submission from your profile</li></ul><CTA href="/script-to-production/">Submit your story</CTA></div></article></section>}
function Partners(){return <section className="final-partners section-space"><IndexLabel right="BUILT FOR COLLABORATION">WHO WE WORK WITH</IndexLabel><div><article><span>WORK WITH KEMSOR</span><h2>Partner with us.</h2><p>For writers, directors, producers, studios, OTT platforms, financiers and international collaborators — find the right starting point for your production.</p><nav>{[['Filmmakers & creators','filmmakers'],['Studios & platforms','studios'],['Co-producers & financiers','co-producers'],['International productions','international-productions']].map(x=><a href={`/contact/?partner=${x[1]}`} key={x[0]}>{x[0]} ↗</a>)}</nav></article><article><span>TALENT NETWORK</span><h2>The people behind the frame.</h2><p>Find cast and crew for your production, or join the network Kemsor draws on for casting and crew coordination.</p><nav><a href="/find-talent/">Find talent ↗</a><a href="/join/">Join KEMSOR ↗</a><a href="/find-talent/#casting-calls">Casting calls ↗</a><a href="/news/">Newsroom ↗</a></nav></article></div></section>}
export default function HomePage({paused,reduced}){return <><HeroSequence reduced={reduced} motionPaused={paused}/><Formats/><About paused={paused} reduced={reduced}/><Services/><Work reduced={reduced}/><Process/><Partners/></>}
