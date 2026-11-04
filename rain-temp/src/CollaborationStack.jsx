import React,{useEffect,useRef} from 'react';
import StudioImage from './StudioImage';
import {cmsText} from './siteContent';
import './collaboration-stack.css';

export default function CollaborationStack({reduced=false,paused=false}){
 const stack=useRef(null);
 useEffect(()=>{
  const node=stack.current;if(!node)return;
  if(reduced||paused){node.style.setProperty('--stack-scroll','1');return;}
  let frame;
  const draw=()=>{frame=null;const top=node.getBoundingClientRect().top;const progress=Math.max(0,Math.min(1,(innerHeight*.85-top)/(innerHeight*.4)));node.style.setProperty('--stack-scroll',progress.toFixed(3));};
  const update=()=>{if(frame==null)frame=requestAnimationFrame(draw);};
  addEventListener('scroll',update,{passive:true});addEventListener('resize',update);draw();
  return()=>{removeEventListener('scroll',update);removeEventListener('resize',update);cancelAnimationFrame(frame);};
 },[reduced,paused]);
 return <figure ref={stack} className="collaboration-still collaboration-stack" data-static={reduced||paused}>
  <div className="collaboration-stack-stage">
   <div className="collaboration-folder-back" aria-hidden="true"/>
   <div className="collaboration-stack-photo collaboration-stack-photo-left"><StudioImage mediaSlot="HomePage-6" src="/assets/stills/work-period-camera-960.webp" alt="Camera setup on a period production" loading="lazy" decoding="async"/></div>
   <div className="collaboration-stack-photo collaboration-stack-photo-centre"><StudioImage mediaSlot="HomePage-3" src="/assets/stills/partner-studio-960.webp" srcSet="/assets/stills/partner-studio-640.webp 640w, /assets/stills/partner-studio-960.webp 960w, /assets/stills/partner-studio-1600.webp 1600w" sizes="240px" alt="Studio cameras and lighting equipment beside a red backdrop" loading="lazy" decoding="async"/></div>
   <div className="collaboration-stack-photo collaboration-stack-photo-right"><StudioImage mediaSlot="HomePage-7" src="/assets/stills/daylight-snow-production-960.webp" alt="Film crew working on a snowy mountain location" loading="lazy" decoding="async"/></div>
   <div className="collaboration-folder-front" aria-hidden="true"><span>K</span></div>
  </div>
  <figcaption><span>{cmsText('HomePage','a7c7cfcc1aa3e28d','KEMSOR STUDIOS')}</span><span>{cmsText('HomePage','c6dd32a70977ce9f','BEHIND THE FRAME')}</span></figcaption>
 </figure>;
}
