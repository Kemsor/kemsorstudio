import {getSiteVideo} from './siteVideo';
import {useCookieConsent} from './CookieConsent';
import {cmsText,cmsData} from './siteContent';
import {CmsEntries,useCms} from './CmsContent';
import JourneyLinks from './JourneyLinks';
import StudioImage from './StudioImage';
import {ProductionAnnouncements,HomeNews} from './StudioPublishing';
import SiteIcon from './SiteIcon';
import MotionHeading, { MotionCopy } from './TextMotion';
import React, { useEffect, useRef, useState } from 'react';
import HeroSequence from './HeroSequence';
import HomeColourChapters from './HomeColourChapters';
import DesignerServices from './DesignerServices';
import DesignerProductions from './DesignerProductions';
import StudioClipViewer from './StudioClipViewer';
import CollaborationStack from './CollaborationStack';
import ProcessIllustration from './ProcessIllustration';
import { Arrow, CTA, IndexLabel } from './PageUI';
import './cinema-hero.css';
import './homepage-final.css';
import './partners-panels.css';
import './showreel-gallery.css';
import './home-compact.css';
import './homepage-heading-system.css';
import './home-colour-chapters.css';

const formats=cmsData(()=>([cmsText("HomePage","e4ede886581bdc0e","WEB SERIES & OTT"),cmsText("HomePage","fb089af784b1541b","REGIONAL CINEMA"),cmsText("HomePage","bc94b1694380ef15","DOCUMENTARIES"),cmsText("HomePage","6748ab414f611500","SHORT FILMS"),cmsText("HomePage","c88ab69d440af429","INTERNATIONAL CO-PRODUCTIONS")]));
const studioClips=cmsData(()=>([
 {src:'/assets/motion-films/city-conversation-preview.mp4',poster:'/assets/motion-films/city-conversation.webp',label:cmsText("HomePage","4f5be475a0ed158b","City stories")},
 {src:'/assets/motion-films/period-intrigue-preview.mp4',poster:'/assets/motion-films/period-intrigue.webp',label:cmsText("HomePage","67334dd611e2dd19","Period worlds")},
 {src:'/assets/motion-films/field-encounter-preview.mp4',poster:'/assets/motion-films/field-encounter.webp',label:cmsText("HomePage","2a344bc623514623","Stories in motion")},
 {src:'/assets/motion-films/theatre-facade.mp4',poster:'/assets/motion-films/theatre-facade-960.webp',label:cmsText("HomePage","d032375ab0938ab1","The big screen")},
]));
function StudioClipRail({paused,reduced}){
 const {preferences,openPreferences}=useCookieConsent();
 const clips=studioClips.map((fallback,index)=>getSiteVideo(`showreel-${index+1}`,fallback)).filter(clip=>clip.enabled).sort((a,b)=>a.position-b.position);
 const clipSignature=clips.map(clip=>clip.id+clip.src).join('|'),loop=clips.length>1;
 const panels=loop?[...clips,...clips,...clips]:clips;
 const external=clip=>new URL(clip.src,location.origin).origin!==location.origin;
 const stage=useRef(null),viewport=useRef(null),track=useRef(null),viewer=useRef(null),videos=useRef([]);
 const position=useRef({width:0,index:0}),interactionUntil=useRef(0);
 const [railState,setRailState]=useState({progress:1,index:0});
 const [expanded,setExpanded]=useState(false),[near,setNear]=useState(false),[visible,setVisible]=useState([]);
 const autoPaused=false;
 const [hovered,setHovered]=useState(false),[focusPaused,setFocusPaused]=useState(false);
 const [tabVisible,setTabVisible]=useState(()=>typeof document==='undefined'||!document.hidden);
 const saveData=Boolean(navigator.connection?.saveData);
 const noteInteraction=()=>{interactionUntil.current=Date.now()+8000;};
 useEffect(()=>{
  setVisible([]);
  const preload=new IntersectionObserver(([entry])=>setNear(entry.isIntersecting),{rootMargin:'300px'});
  preload.observe(stage.current);
  const playback=new IntersectionObserver(entries=>setVisible(previous=>{
   const next=[...previous];entries.forEach(entry=>{next[Number(entry.target.dataset.panel)]=entry.isIntersecting&&entry.intersectionRatio>.08;});return next;
  }),{threshold:[0,.08,.5]});
  track.current.querySelectorAll('[data-panel]').forEach(card=>playback.observe(card));
  const update=()=>setTabVisible(!document.hidden);document.addEventListener('visibilitychange',update);
  return()=>{preload.disconnect();playback.disconnect();document.removeEventListener('visibilitychange',update);};
 },[clipSignature]);
 useEffect(()=>{
  videos.current.forEach((video,index)=>{
   if(!video)return;const clip=panels[index];
   if(clip&&(!external(clip)||preferences?.externalMedia)&&visible[index]&&near&&tabVisible&&!paused&&!reduced&&!saveData&&!expanded&&!autoPaused)video.play().catch(()=>{});
   else video.pause();
  });
 },[visible,near,tabVisible,paused,reduced,saveData,expanded,autoPaused,preferences?.externalMedia,clipSignature]);
 useEffect(()=>{
  const rail=viewport.current,strip=track.current;if(!rail||!strip)return;
  let frame,settle;
  position.current={width:0,index:0};
  const update=()=>{
   const width=strip.firstElementChild?.getBoundingClientRect().width||0;if(!width||!clips.length)return;
   const physical=Math.round(rail.scrollLeft/width),index=((physical%clips.length)+clips.length)%clips.length;
   position.current={width,index};setRailState({index,progress:(index+1)/clips.length});
  };
  const normalize=()=>{
   const width=position.current.width;if(!loop||!width)return;
   const physical=Math.round(rail.scrollLeft/width);
   if(physical<clips.length||physical>=clips.length*2){rail.scrollTo({left:(clips.length+position.current.index)*width,behavior:'instant'});}
  };
  const onScroll=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(update);clearTimeout(settle);settle=setTimeout(normalize,180);};
  const measure=()=>{
   const width=strip.firstElementChild?.getBoundingClientRect().width||0;
   if(width&&Math.abs(width-position.current.width)>.5){
    const index=position.current.index;position.current.width=width;
    rail.scrollTo({left:((loop?clips.length:0)+index)*width,behavior:'instant'});
   }
   update();
  };
  const observer=new ResizeObserver(measure);observer.observe(rail);observer.observe(strip);
  rail.addEventListener('scroll',onScroll,{passive:true});measure();
  return()=>{observer.disconnect();rail.removeEventListener('scroll',onScroll);cancelAnimationFrame(frame);clearTimeout(settle);};
 },[clipSignature]);
 const go=direction=>{
  const width=position.current.width;if(!viewport.current||!width||!loop)return;
  viewport.current.scrollBy({left:direction*width,behavior:reduced||paused?'instant':'smooth'});
 };
 const move=direction=>{noteInteraction();go(direction);};
 const inView=visible.some(Boolean);
 useEffect(()=>{
  if(!loop||autoPaused||hovered||focusPaused||expanded||paused||reduced||saveData||!tabVisible||!near||!inView)return;
  const timer=setInterval(()=>{if(Date.now()>=interactionUntil.current)go(1);},5000);
  return()=>clearInterval(timer);
 },[clipSignature,autoPaused,hovered,focusPaused,expanded,paused,reduced,saveData,tabVisible,near,inView]);
 const jump=index=>{noteInteraction();viewport.current?.scrollTo({left:((loop?clips.length:0)+index)*position.current.width,behavior:reduced?'instant':'smooth'});};
 return <><div id="showreel" role="region" aria-labelledby="showreel-title" data-active-reel={railState.index} className="showreel-runway showreel-edge" style={{'--showreel-count':Math.max(1,clips.length)}}>
  <div className="showreel-gallery" ref={stage}
   onPointerEnter={event=>{if(event.pointerType==='mouse')setHovered(true);}} onPointerLeave={()=>setHovered(false)}
   onPointerDown={noteInteraction} onWheel={noteInteraction}
   onFocusCapture={event=>{if(event.target.matches(':focus-visible'))setFocusPaused(true);}}
   onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget))setFocusPaused(false);}}>
   <div className="showreel-gallery-head"><div><span>{cmsText("HomePage","36d6762f01807930","SHOWREEL")}</span><MotionHeading as="h2" id="showreel-title">{cmsText("HomePage","6223a66561407607","Kemsor ")}<span className="heading-accent">{cmsText("HomePage","da44fb72cab10d28","showreel")}</span></MotionHeading></div></div>
   <div className="showreel-carousel-toolbar"><div className="showreel-progress" role="progressbar" aria-label="Showreel browsing progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(railState.progress*100)}><span style={{width:`${railState.progress*100}%`}}/></div><div className="compact-rail-controls" role="group" aria-label="Navigate showreel">

    <button type="button" onClick={()=>move(-1)} disabled={!loop} aria-label="Previous showreel films"><SiteIcon name="arrow-left" size={22}/></button><button type="button" onClick={()=>move(1)} disabled={!loop} aria-label="Next showreel films"><SiteIcon name="arrow" size={22}/></button>
   </div></div>
   <div className="showreel-viewport" ref={viewport} role="region" aria-roledescription="carousel" tabIndex="0" onKeyDown={event=>{
    if(event.target!==event.currentTarget)return;
    if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();move(event.key==='ArrowRight'?1:-1);}
    if(event.key==='Home'||event.key==='End'){event.preventDefault();jump(event.key==='Home'?0:clips.length-1);}
   }} aria-label="Kemsor showreel films. Use arrows or swipe to explore.">
    <div className="showreel-track" ref={track}>{panels.map((clip,index)=><figure className="showreel-card" key={`${Math.floor(index/Math.max(1,clips.length))}-${clip.id}`} data-panel={index} data-clip={index%clips.length} aria-hidden={!visible[index]} inert={!visible[index]}>
     <div className="showreel-card-screen"><video ref={node=>{videos.current[index]=node;}} src={near&&visible[index]&&!reduced&&!saveData&&(!external(clip)||preferences?.externalMedia)?clip.src:undefined} poster={clip.poster} autoPlay muted loop playsInline preload="none" aria-hidden="true"/>
      <figcaption><strong>{clip.label}</strong>{clip.description&&<p>{clip.description}</p>}</figcaption>
      <button type="button" className="showreel-card-expand" aria-label={`Watch ${clip.label} fullscreen`} onClick={()=>{if(external(clip)&&!preferences?.externalMedia){openPreferences();return;}viewer.current.open(clip,videos.current[index]?.currentTime||0);}}><SiteIcon name="expand" size={18}/><span>{cmsText("HomePage","9ead23951c783ed5","Fullscreen")}</span></button>
     </div>
    </figure>)}</div>
   </div>
  </div>
 </div><StudioClipViewer ref={viewer} onOpenChange={setExpanded}/></>;
}
function HomeImage({name,alt,sizes,format='webp'}){const base=`/assets/stills/${name}`;return <StudioImage mediaSlot="HomePage-1" src={`${base}-960.${format}`} srcSet={`${base}-640.${format} 640w, ${base}-960.${format} 960w, ${base}-1600.${format} 1600w`} sizes={sizes} alt={alt} loading="lazy" decoding="async"/>}
function Formats(){return <div className="final-formats" aria-label={`Formats: ${formats.join(', ')}`}><div className="final-formats-track" aria-hidden="true">{[0,1].map(copy=><div className="final-formats-set" key={copy}>{formats.map(x=><React.Fragment key={x}><span>{x}</span><i>✦</i></React.Fragment>)}</div>)}</div></div>}
function About({paused,reduced}){return <section className="final-about section-space" id="studio"><IndexLabel right="PEOPLE, PLANNING AND PRODUCTION">{cmsText("HomePage","4f985fc22a3e0b9a","ABOUT KEMSOR")}</IndexLabel><div className="final-about-grid" data-reveal><div><MotionHeading as="h2">{cmsText("HomePage","b8e20750e0c46ab3","The studio.")}<br/><span className="heading-accent">{cmsText("HomePage","bede5b2027c8bec6","Behind the work.")}</span></MotionHeading><MotionCopy className="final-lead">{cmsText("HomePage","94d34f1e6e3cfa79","We bring the creative and production teams into the same conversation.")}</MotionCopy></div><div><MotionCopy>{cmsText("HomePage","a90d362855168ff0","Kemsor works with creators, filmmakers, studios and platforms on films, series and documentaries. We bring together the people and production expertise each project calls for.")}</MotionCopy><a className="line-link" href="/about/">{cmsText("HomePage","1e5c771f8695ded8","About Kemsor ")}<Arrow/></a><a className="line-link home-leadership-link" href="/leadership/">Meet our leadership<Arrow/></a></div></div><div className="proof-strip" data-reveal>{[['7',cmsText("HomePage","304635c9ded4ffd5","lifecycle stages, from development to release")],['5',cmsText("HomePage","4fb78d71d6c022c9","formats, from short films to co-productions")],['1',cmsText("HomePage","858340eb74a54c0e","studio connecting the people and the plan")]].map(x=><div key={x[0]}><strong>{x[0]}</strong><span>{x[1]}</span>{x[0]==='5'&&<StudioImage mediaSlot="HomePage-2" className="proof-clapperboard" src="/assets/stats-clapperboard.png" alt="" width="133" height="167" loading="lazy" decoding="async"/>}</div>)}</div><StudioClipRail paused={paused} reduced={reduced}/></section>}
function Process(){const steps=[[cmsText("HomePage","594bc39636abbd49","Understand the story"),cmsText("HomePage","e7cac3f6193ce66b","What the story needs to be and who it is for, before any numbers are set.")],[cmsText("HomePage","c5bd2210b7428e92","Build the plan"),cmsText("HomePage","53b3eb7b724e6ca6","Budget, schedule, team and locations shaped by the creative goal.")],[cmsText("HomePage","8f7dcdc0f2d0565a","Deliver the work"),cmsText("HomePage","b0aafd68dd7887cd","Clear communication keeps every collaborator aligned, stage to stage.")]];return <section className="final-process section-space"><IndexLabel right="FROM FIRST DRAFT TO FINAL CUT">{cmsText("HomePage","4dff00e8095f7129","HOW THE WORK BEGINS")}</IndexLabel><MotionHeading as="h2">{cmsText("HomePage","4e84230fe70699b4","A clear way")}<br/><span className="heading-accent">{cmsText("HomePage","5706b00ee0f9778b","to work together.")}</span></MotionHeading><a className="line-link home-process-link" href="/how-we-work/">Explore how we work<Arrow/></a><ol>{steps.map((x,i)=><li key={x[0]}>{i!==1&&<ProcessIllustration step={i}/>}{i===1&&<StudioImage mediaSlot="HomePage-5" className="process-card-image" src="/assets/stills/development-packaging-960.webp" alt="" loading="lazy" decoding="async"/>}<b>0{i+1}</b><MotionHeading as="h3">{x[0]}</MotionHeading><p>{x[1]}</p></li>)}</ol><article className="script-card"><StudioImage mediaSlot="HomePage-4" className="script-card-background" src="/assets/stills/script-to-production-background.avif" alt="" loading="lazy" decoding="async"/><div><span>{cmsText("HomePage","16b99918f5cadce9","SCRIPT TO PRODUCTION")}</span><MotionHeading as="h3">{cmsText("HomePage","3dccfcc2e2bdad7e","Have a script or just an idea?")}<br/><span className="heading-accent">{cmsText("HomePage","2d187c9cbb0ef25f","Start here.")}</span></MotionHeading></div><div><MotionCopy>{cmsText("HomePage","859fe3aad1bcb737","Share your script or idea, along with the format and any production plans already in place.")}</MotionCopy><ul><li>{cmsText("HomePage","eabdf33b3adc28c4","Finished scripts and early ideas welcome")}</li><li>{cmsText("HomePage","0ab5089e029052c9","Terms accepted before any submission is reviewed")}</li><li>{cmsText("HomePage","89cf5f681b439999","Track your submission from your profile")}</li></ul><CTA href="/script-to-production/">{cmsText("HomePage","f7a8d842d5a143b0","Submit your story")}</CTA></div></article></section>}
function Partners({reduced,paused}){
 const panels=[
  {label:cmsText("HomePage","3593d51956c10851","WORK WITH KEMSOR"),title:<>{cmsText("HomePage","c58be57ad10cade9","Partner ")}<span className="heading-accent">{cmsText("HomePage","ecfbc63a3599ff35","with us.")}</span></>,description:cmsText("HomePage","f27978c1ebf75125","We work with writers, directors, producers, studios, OTT platforms, financiers and international collaborators."),links:[[cmsText("HomePage","9a566d1c00e830a1","Filmmakers & creators"),'/partner-with-us/?route=filmmakers'],[cmsText("HomePage","54cf85f84de91a9f","Studios & platforms"),'/partner-with-us/?route=studios'],[cmsText("HomePage","25ed16db33dce8a4","Co-producers & financiers"),'/partner-with-us/?route=co-producers'],[cmsText("HomePage","cdea8f702887827d","International productions"),'/partner-with-us/?route=international-productions']]},
  {label:cmsText("HomePage","e165a8876e5eae6d","TALENT NETWORK"),title:<>{cmsText("HomePage","202b1ad863bad159","The people ")}<span className="heading-accent">{cmsText("HomePage","364f7cc60e46d667","behind the frame.")}</span></>,description:cmsText("HomePage","0de42145b4cf9ed8","Find cast and crew for your production, or join the network Kemsor draws on for casting and crew coordination."),links:[[cmsText("HomePage","ae47e46e8e95461c","Find talent"),'/find-talent/'],[cmsText("HomePage","5418199cdcbc644c","Join KEMSOR"),'/join/'],[cmsText("HomePage","243f48f752bae8d7","Casting calls"),'/find-talent/#casting-calls'],[cmsText("HomePage","2817a7c300b43277","Press & media"),'/press-media/']]},
 ];
 return <section id="work-with-kemsor" className="final-partners collaboration-editorial section-space">
  <IndexLabel right="BUILT FOR COLLABORATION">{cmsText("HomePage","b711b07c912445b6","WHO WE WORK WITH")}</IndexLabel>
  <div className="collaboration-layout">
   <CollaborationStack reduced={reduced} paused={paused}/>
   {panels.map((panel,index)=><article className="collaboration-path" key={panel.label} aria-labelledby={`partner-panel-${index}`}>
    <div className="collaboration-path-label"><span>{panel.label}</span></div>
    <MotionHeading as="h2" id={`partner-panel-${index}`}>{panel.title}</MotionHeading>
    <MotionCopy>{panel.description}</MotionCopy>
    <nav aria-labelledby={`partner-panel-${index}`}>
     {panel.links.map(([label,href],linkIndex)=><a key={href} href={href}><span>{label}</span><span className="collaboration-path-arrow" aria-hidden="true"><SiteIcon name={(index===0?['script','film','partnership','location']:['people','plus','video','contact'])[linkIndex]} size={18}/></span></a>)}
    </nav>
   </article>)}
  </div>
 </section>;
}

export default function HomePage({paused,reduced}){const {entries}=useCms();const sections=entries.filter(entry=>entry.type==='home'&&entry.metadata?.home_slot!=='hero'&&entry.slug!=='home-hero');return <><HomeColourChapters reduced={reduced}/><HeroSequence reduced={reduced} motionPaused={paused}/><Formats/><About paused={paused} reduced={reduced}/><DesignerServices reduced={reduced}/><DesignerProductions reduced={reduced}/><ProductionAnnouncements compact/><HomeNews/><Process/><Partners reduced={reduced} paused={paused}/><JourneyLinks/><CmsEntries entries={sections}/></>}
