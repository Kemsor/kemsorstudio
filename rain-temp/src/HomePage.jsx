import MotionHeading, { MotionCopy } from './TextMotion';
import React, { useEffect, useRef, useState } from 'react';
import HeroSequence from './HeroSequence';
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

const formats=['WEB SERIES & OTT','REGIONAL CINEMA','DOCUMENTARIES','SHORT FILMS','INTERNATIONAL CO-PRODUCTIONS'];
const services=[
 ['01','DEVELOP','Before cameras roll','Development & Packaging','Shaping the idea, the script and the creative package that makes a project ready to pitch.','Script development · Creative package · Pitch-ready project','/develop/','development-packaging.png'],
 ['02','FUND & PARTNER','Before cameras roll','Financing & Co-Production','Bringing financiers, investors and production partners into the conversation around a clear plan.','Investment coordination · Budget & production plan · Co-production partners','/finance/','financing-co-production.png'],
 ['03','PREPARE','Before cameras roll','Pre-Production, Casting & Talent','Budgets, schedules, casting, crew, locations and design — settled before cameras roll.','Casting & talent · Crew & locations · Set & production design','/services/#capability-casting','daylight-park-production'],
 ['04','SHOOT','On set','Production & Line Production','Running the shoot day to day, on set and on location, with every moving part aligned.','Production management · Locations & logistics · Crew & equipment','/services/#capability-filming','action-scene'],
 ['05','FINISH & RELEASE','After the wrap','Post-Production & Release','Overseeing edit, sound, colour and VFX through final delivery and release coordination.','Post supervision · Final deliverables · Platform coordination','/services/#capability-post','post-production-release.png'],
 ['06','INDIA','For visiting productions','India Production Services','On-the-ground support for productions filming in India, from locations to casting and crew.','Line production · Locations & logistics · Crew, equipment & casting','/services/#india-production-services','daylight-valley-production'],
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
 {src:'/assets/motion-films/theatre-facade.mp4',poster:'/assets/motion-films/theatre-facade-960.webp',label:'The big screen'},
];
function StudioClipRail({paused,reduced}){
 const [active,setActive]=useState(0);
 const rail=useRef(null),viewer=useRef(null);
 const [expanded,setExpanded]=useState(false);
 const [near,setNear]=useState(false),[visible,setVisible]=useState(false),[tabVisible,setTabVisible]=useState(!document.hidden);
 const saveData=Boolean(navigator.connection?.saveData);
 useEffect(()=>{
  const preload=new IntersectionObserver(([entry])=>setNear(entry.isIntersecting),{rootMargin:'300px'});
  const playback=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting));
  preload.observe(rail.current);playback.observe(rail.current);
  const update=()=>setTabVisible(!document.hidden);document.addEventListener('visibilitychange',update);
  return()=>{preload.disconnect();playback.disconnect();document.removeEventListener('visibilitychange',update);};
 },[]);
 const [hovered,setHovered]=useState(false),[focused,setFocused]=useState(false);
 const videos=useRef([]);
 useEffect(()=>{
  videos.current.forEach((video,index)=>{if(!video)return;if(index===active&&near&&visible&&tabVisible&&!paused&&!reduced&&!saveData&&!expanded)video.play().catch(()=>{});else video.pause();});
 },[active,paused,reduced,near,visible,tabVisible,saveData,expanded]);
 useEffect(()=>{
  if(paused||reduced||saveData||!visible||!tabVisible||hovered||focused||expanded)return;
  const timer=window.setInterval(()=>setActive(index=>(index+1)%studioClips.length),4200);
  return()=>window.clearInterval(timer);
 },[paused,reduced,saveData,visible,tabVisible,hovered,focused,expanded]);
 return <><figure ref={rail} className="final-cinema-rail" data-reveal onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} onFocusCapture={()=>setFocused(true)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget))setFocused(false);}}>
  <div className="final-cinema-stage">{studioClips.map((clip,index)=><video key={clip.src} ref={node=>{videos.current[index]=node}} className={index===active?'is-active':''} src={near&&!reduced&&!saveData&&index===active?clip.src:undefined} poster={near?clip.poster:undefined} muted loop playsInline preload="none" aria-hidden="true"/>)}</div>
  <button className="final-cinema-expand" type="button" aria-label={`Watch ${studioClips[active].label} fullscreen`} onClick={()=>viewer.current.open(studioClips[active],videos.current[active]?.currentTime||0)}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M9 3H3v6m12-6h6v6M3 15v6h6m6 0h6v-6"/></svg><span>Fullscreen</span></button>
  <div className="final-cinema-wash" aria-hidden="true"/>
  <figcaption><span>ONE IDEA.</span><strong>EVERY MOVING PART.</strong><span>ONE FINISHED FRAME.</span></figcaption>
  <div className="final-cinema-controls" aria-label="Choose a film clip">{studioClips.map((clip,index)=><button key={clip.src} type="button" aria-label={`Show ${clip.label}`} aria-pressed={active===index} onMouseEnter={()=>setActive(index)} onFocus={()=>setActive(index)} onClick={()=>setActive(index)}><i/><span>{clip.label}</span></button>)}</div>
 </figure><StudioClipViewer ref={viewer} onOpenChange={setExpanded}/></>;
}
function HomeImage({name,alt,sizes}){const base=`/assets/stills/${name}`;return <img src={`${base}-960.webp`} srcSet={`${base}-640.webp 640w, ${base}-960.webp 960w, ${base}-1600.webp 1600w`} sizes={sizes} alt={alt} loading="lazy" decoding="async"/>}
function Formats(){return <div className="final-formats" aria-label={`Formats: ${formats.join(', ')}`}><div className="final-formats-track" aria-hidden="true">{[0,1,2,3].map(copy=><div className="final-formats-set" key={copy}>{formats.map(x=><React.Fragment key={x}><span>{x}</span><i>✦</i></React.Fragment>)}</div>)}</div></div>}
function About({paused,reduced}){return <section className="final-about section-space" id="studio"><IndexLabel right="THE DISTANCE BETWEEN IDEA AND AUDIENCE">ABOUT KEMSOR</IndexLabel><div className="final-about-grid" data-reveal><div><MotionHeading as="h2">First, a page.<br/>Then, a <em>possibility.</em></MotionHeading><MotionCopy className="final-lead">A line on a page becomes a place. A performance. A moment that stays with you.</MotionCopy></div><div><MotionCopy>Kemsor is a film and production partner for creators, filmmakers, studios, and platforms. We bring the creative vision and the practical pieces together — the planning, people, and production discipline a story needs to reach its audience.</MotionCopy><a className="line-link" href="/about/">About Kemsor <Arrow/></a></div></div><div className="proof-strip" data-reveal>{[['7','lifecycle stages, from development to release'],['5','formats, from short films to co-productions'],['1','partner, at any stage you need us']].map(x=><div key={x[0]}><strong>{x[0]}</strong><span>{x[1]}</span></div>)}</div><StudioClipRail paused={paused} reduced={reduced}/></section>}
function Services({paused,reduced}){
 const flow=useRef(null);
 const [active,setActive]=useState(0);
 useEffect(()=>{
  const host=flow.current;
  const articles=[...host.querySelectorAll('.service-flow-chapter')];
  const backdrops=[...host.querySelectorAll('.service-flow-tint')];
  let frame;
  const update=()=>{
   frame=null;
   const bounds=host.getBoundingClientRect();
   if(bounds.bottom<0||bounds.top>innerHeight)return;
   let current=0;
   let blendPosition=0;
   // Read geometry together before writing transforms or opacity.
   const geometry=articles.map(article=>({rect:article.getBoundingClientRect(),visual:article.querySelector('.service-flow-image')}));
   const shifts=[];
   geometry.forEach(({rect,visual},index)=>{
    if(rect.top<innerHeight*.55)current=index;
    if(rect.top<=innerHeight*.72)blendPosition=Math.max(blendPosition,index+Math.max(0,Math.min(1,(innerHeight*.72-rect.top)/Math.max(rect.height,1)))-.55);
    if(!reduced&&!paused&&rect.bottom>0&&rect.top<innerHeight){
     const imageRect=visual.getBoundingClientRect();
     const range=innerWidth<=600?45:150;
     const shift=Math.max(-range,Math.min(range,(innerHeight/2-imageRect.top-imageRect.height/2)*.202));
     const distance=Math.min(1,Math.abs((imageRect.top+imageRect.height/2-innerHeight/2)/(innerHeight*.85)));
     const edge=distance*distance*(3-2*distance);
     shifts.push([visual,shift,edge]);
    }
   });
   shifts.forEach(([visual,shift,edge])=>{
    visual.style.setProperty('--service-image-shift',`${shift}px`);
    visual.style.setProperty('--service-frame-x',`${edge*(innerWidth<=600?5:22)}px`);
    visual.style.setProperty('--service-frame-y',`${edge*(innerWidth<=600?4:14)}px`);
    visual.style.setProperty('--service-edge-opacity',String(edge*.85));
   });
   backdrops.forEach((backdrop,index)=>{
    const lower=Math.floor(blendPosition);
    const opacity=reduced||paused?(index===current?1:0):(index===lower?1:index===lower+1?blendPosition-lower:0);
    backdrop.style.opacity=String(opacity);
   });
   setActive(previous=>previous===current?previous:current);
  };
  const queue=()=>{if(!frame)frame=requestAnimationFrame(update);};
  const sync=()=>{cancelAnimationFrame(frame);update();};
  addEventListener('kemsor:smooth-scroll',sync);
  addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue);update();
  return()=>{removeEventListener('kemsor:smooth-scroll',sync);removeEventListener('scroll',queue);removeEventListener('resize',queue);cancelAnimationFrame(frame);};
 },[paused,reduced]);
 return <section className="final-services section-space" id="services"><IndexLabel right="SERVICES, WITH THE WORK BESIDE THEM">WHAT WE OFFER</IndexLabel><div className="final-section-head"><MotionHeading as="h2">Everything a story needs<br/>to reach the screen.</MotionHeading><MotionCopy>Bring us in at the start, or at the stage where you need us most. Each service sits beside the work, so you can see the craft, not just read about it.</MotionCopy></div>
  <div ref={flow} className="service-flow" data-current={active+1} data-motion={paused||reduced?'paused':'playing'}>
   <div className="service-flow-atmosphere" aria-hidden="true">{services.map((service,index)=><div className="service-flow-tint" data-active={active===index} key={service[0]}><img src={`/assets/stills/${service[7].replace(/\.[^.]+$/,'')}-640.webp`} alt="" loading="lazy" decoding="async" width="640" height="360"/></div>)}<div className="service-flow-veil"/></div>
   <div className="service-flow-list">{services.map(([no,tag,stage,title,text,includes,href,image],index)=><article className="service-flow-chapter" key={no} data-active={active===index} aria-labelledby={`home-service-${no}`}>
    <div className="service-flow-meta"><span>{no} / 06</span><span>{stage}</span><span>{tag}</span></div>
    <a className="service-flow-image" href={href} aria-label={`Explore ${title}`}><span className="service-flow-aperture" aria-hidden="true"><span className="service-flow-photo"><HomeImage name={image.replace(/\.[^.]+$/,'')} alt="" sizes="(max-width: 600px) 100vw, 100vw"/></span><span className="service-flow-edge service-flow-edge-top"/><span className="service-flow-edge service-flow-edge-bottom"/></span><span className="service-flow-image-action" aria-hidden="true">EXPLORE <Arrow/></span></a>
    <div className="service-flow-details"><div className="service-flow-marker"><span>{no}</span><p className="service-flow-label">{tag}</p></div><div className="service-flow-story"><h3 id={`home-service-${no}`}>{title}</h3><p>{text}</p></div><div className="service-flow-delivery"><ul aria-label={`${title} includes`}>{includes.split(' · ').map(item=><li key={item}>{item}</li>)}</ul><a className="line-link" href={href}>Explore service <Arrow/></a></div></div>
   </article>)}</div>
  </div>
  <div className="services-close"><MotionCopy>Scope is shaped to the project — never imposed as a fixed package.</MotionCopy><a href="/services/">All services <Arrow/></a></div>
 </section>;
}
function WorkMotionGraphic(){
 return <span className="work-motion-graphic" aria-hidden="true"><svg className="work-motion-frame" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none"><path pathLength="1" d="M5 18V5H18 M82 5H95V18 M95 82V95H82 M18 95H5V82" vectorEffect="non-scaling-stroke"/></svg><span className="work-motion-target"><svg viewBox="0 0 60 60" fill="none"><path d="M18 5H5V18 M42 5H55V18 M55 42V55H42 M18 55H5V42 M22 30H38 M30 22V38"/><circle cx="30" cy="30" r="2"/></svg></span><span className="work-motion-line"/><span className="work-motion-note">IN FRAME</span></span>;
}
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
  const sync=()=>{cancelAnimationFrame(raf);update();};
  window.addEventListener('kemsor:smooth-scroll',sync);
  window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',measure);
  const focus=event=>{const card=event.target.closest('a');if(!card)return;const top=parseFloat(getComputedStyle(frame).top)||0;const current=Math.min(distance,Math.max(0,top-host.getBoundingClientRect().top));const offset=Math.min(distance,Math.max(0,card.offsetLeft<current?card.offsetLeft:card.offsetLeft+card.offsetWidth>current+windowEl.clientWidth?card.offsetLeft+card.offsetWidth-windowEl.clientWidth:current));window.scrollTo({top:window.scrollY+host.getBoundingClientRect().top-top+offset,behavior:'instant'});};
  rail.addEventListener('focusin',focus);measure();
  return()=>{observer.disconnect();window.removeEventListener('kemsor:smooth-scroll',sync);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',measure);rail.removeEventListener('focusin',focus);cancelAnimationFrame(raf);host.style.height='';rail.style.transform='';};
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
 return <section className="final-work section-space" id="productions" aria-labelledby="work-title">
  <div ref={runway} className={`work-scroll-runway${reduced?' is-reduced':''}`}>
   <div ref={stage} className="work-scroll-stage">
    <div className="work-sidebar">
     <span className="work-kicker">STORIES, SEEN IN MOTION</span>
     <MotionHeading as="h2" id="work-title">The work.<br/><em>In frame.</em></MotionHeading>
     <MotionCopy>A selection of productions Kemsor has helped bring to the screen — each credited with the stage we supported.</MotionCopy>
     <a className="line-link" href="/projects/">View all productions <Arrow/></a>
     <div className="work-scroll-caption"><span>SELECTED PRODUCTIONS</span><span>{reduced?'Explore the collection':'Scroll or drag to explore'}</span></div>
     <p className="work-credit-note">Credits list the stages Kemsor supported on each production.</p>
    </div>
    <div ref={viewport} className="work-scroll-viewport" role="region" aria-label="Selected productions, scroll or drag to explore">
     <div ref={track} className="work-scroll-track">{work.map(([file,format,title,role],i)=><a href="/projects/" key={file}><div className="work-image"><HomeImage name={file.replace(/\.[^.]+$/,'')} alt={title} sizes="(max-width: 760px) 45vw, 32vw"/><WorkMotionGraphic/><b>{String(i+1).padStart(2,'0')}</b><i>VIEW ↗</i></div><span className="work-category">{format}</span><h3>{title}</h3><p>Kemsor role: {role}</p></a>)}</div>
    </div>
   </div>
  </div>
 </section>;
}
function Process(){const steps=[['Understand the story','What the story needs to be and who it is for — before any numbers are set.'],['Build the plan','Budget, schedule, team and locations shaped by the creative goal.'],['Deliver the work','Clear communication keeps every collaborator aligned, stage to stage.']];return <section className="final-process section-space"><IndexLabel right="FROM FIRST DRAFT TO FINAL CUT">HOW THE WORK BEGINS</IndexLabel><MotionHeading as="h2">Understand the story.<br/>Build the plan. <em>Deliver the work.</em></MotionHeading><ol>{steps.map((x,i)=><li key={x[0]}><b>0{i+1}</b><MotionHeading as="h3">{x[0]}</MotionHeading><p>{x[1]}</p></li>)}</ol><article className="script-card"><ScriptCardIllustration/><div><span>SCRIPT TO PRODUCTION</span><MotionHeading as="h3">Have a script — or just an idea?<br/>Start here.</MotionHeading></div><div><MotionCopy>Share where your project is today. We’ll look at what the story needs and the stage you need us most — then shape the next step together.</MotionCopy><ul><li>Finished scripts and early ideas welcome</li><li>Terms accepted before any submission is reviewed</li><li>Track your submission from your profile</li></ul><CTA href="/script-to-production/">Submit your story</CTA></div></article></section>}
function Partners(){
 const panels=[
  {label:'WORK WITH KEMSOR',title:'Partner with us.',description:'For writers, directors, producers, studios, OTT platforms, financiers and international collaborators — find the right starting point for your production.',links:[['Filmmakers & creators','/contact/?partner=filmmakers'],['Studios & platforms','/contact/?partner=studios'],['Co-producers & financiers','/contact/?partner=co-producers'],['International productions','/contact/?partner=international-productions']]},
  {label:'TALENT NETWORK',title:'The people behind the frame.',description:'Find cast and crew for your production, or join the network Kemsor draws on for casting and crew coordination.',links:[['Find talent','/find-talent/'],['Join KEMSOR','/join/'],['Casting calls','/find-talent/#casting-calls'],['Newsroom','/news/']]},
 ];
 const intro=(panel,index)=><article className={`collaboration-intro collaboration-intro-${index}`} aria-labelledby={`partner-panel-${index}`}><span className="collaboration-eyebrow">{panel.label}</span><MotionHeading as="h2" id={`partner-panel-${index}`}>{panel.title}</MotionHeading><p>{panel.description}</p><span className="collaboration-corner" aria-hidden="true">↗</span></article>;
 const links=(panel,index)=><nav className={`collaboration-links collaboration-links-${index}`} aria-labelledby={`partner-panel-${index}`}>{panel.links.map(([label,href],i)=><a href={href} key={href}><span className="partners-link-index" aria-hidden="true">0{i+1}</span><span className="partners-link-text">{label}</span><span className="partners-link-arrow" aria-hidden="true"><Arrow/></span></a>)}</nav>;
 return <section id="work-with-kemsor" className="final-partners partners-redesign section-space"><IndexLabel right="BUILT FOR COLLABORATION">WHO WE WORK WITH</IndexLabel><div className="partners-panels">
  {intro(panels[0],0)}
  <figure className="collaboration-photo"><HomeImage name="daylight-valley-production" alt="Illustrative production crew filming performers beside a mountain stream" sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 34vw"/><figcaption><span>KEMSOR STUDIOS</span><span aria-hidden="true">01 / 02</span></figcaption></figure>
  {intro(panels[1],1)}
  {links(panels[0],0)}
  <div className="collaboration-art" aria-hidden="true"><span>STORY. CRAFT. CINEMA.</span><svg className="collaboration-reel" viewBox="0 0 320 320" fill="none"><defs><radialGradient id="partner-reel-metal" cx=".35" cy=".25" r=".8"><stop stopColor="#fff2e3"/><stop offset=".5" stopColor="#e4b458"/><stop offset="1" stopColor="#95612d"/></radialGradient></defs><circle cx="160" cy="160" r="131" stroke="#f4d17c" strokeWidth="1"/><circle cx="160" cy="160" r="116" fill="url(#partner-reel-metal)"/><circle cx="160" cy="160" r="105" stroke="#3b241b" strokeOpacity=".35"/>{[0,72,144,216,288].map(angle=><g key={angle} transform={`rotate(${angle} 160 160)`}><circle cx="160" cy="91" r="28" fill="#3b241b"/><circle cx="160" cy="91" r="23" stroke="#e8bb6e" strokeOpacity=".35"/></g>)}<circle cx="160" cy="160" r="24" fill="#3b241b"/><circle cx="160" cy="160" r="9" fill="#f4d17c"/><path d="M160 29C272 29 311 151 270 224" stroke="#fff2e3" strokeOpacity=".5" strokeWidth="2"/></svg><span className="collaboration-art-signature">KEMSOR<span>STUDIOS</span></span></div>
  {links(panels[1],1)}
 </div></section>;
}
export default function HomePage({paused,reduced}){return <><HeroSequence reduced={reduced} motionPaused={paused}/><Formats/><About paused={paused} reduced={reduced}/><Services paused={paused} reduced={reduced}/><Work reduced={reduced}/><Process/><Partners/></>}
