import React, {useEffect,useRef} from 'react';
import {createPortal} from 'react-dom';
import './cursor-dot.css';

export default function CursorDot(){
 const ref=useRef(null);
 useEffect(()=>{
  const media=matchMedia('(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)');
  const dot=ref.current;
  let frame=0,x=0,y=0,targetX=0,targetY=0,visible=false,lastTime=0,vx=0,vy=0;
  const hide=()=>{visible=false;dot.dataset.visible='false';cancelAnimationFrame(frame);frame=0;lastTime=0;vx=0;vy=0};
  const tick=time=>{
   frame=0;
   if(!visible)return;
   const dt=lastTime?Math.min(time-lastTime,32):16;
   lastTime=time;
   const step=dt/16.667;
   const damping=Math.pow(.82,step);
   vx=(vx+(targetX-x)*.025*step)*damping;
   vy=(vy+(targetY-y)*.025*step)*damping;
   x+=vx*step;y+=vy*step;
   const speed=Math.hypot(vx,vy);
   const stretch=1+Math.min(speed/45,.9);
   const angle=Math.atan2(vy,vx)*180/Math.PI;
   dot.style.setProperty('--dot-angle',`${angle}deg`);
   dot.style.setProperty('--dot-stretch',stretch);
   dot.style.setProperty('--dot-squash',1/Math.sqrt(stretch));
   dot.style.transform=`translate3d(${x}px,${y}px,0)`;
   if(Math.abs(targetX-x)+Math.abs(targetY-y)+Math.hypot(vx,vy)>.1)frame=requestAnimationFrame(tick);
   else lastTime=0;
  };
  const move=event=>{
   if(!media.matches||event.pointerType!=='mouse')return;
   targetX=event.clientX+12;targetY=event.clientY+12;
   if(!visible){x=targetX;y=targetY;visible=true;dot.dataset.visible='true'}
   if(!frame)frame=requestAnimationFrame(tick);
  };
  const leave=event=>{if(!event.relatedTarget)hide()};
  const visibility=()=>{if(document.hidden)hide()};
  window.addEventListener('pointermove',move,{passive:true});
  document.addEventListener('pointerout',leave);
  window.addEventListener('blur',hide);
  document.addEventListener('visibilitychange',visibility);
  media.addEventListener('change',hide);
  return()=>{hide();window.removeEventListener('pointermove',move);document.removeEventListener('pointerout',leave);window.removeEventListener('blur',hide);document.removeEventListener('visibilitychange',visibility);media.removeEventListener('change',hide)};
 },[]);
 return createPortal(<div ref={ref} className="cursor-dot" aria-hidden="true" data-visible="false"><span/></div>,document.body);
}
