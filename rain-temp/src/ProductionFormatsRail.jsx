import React,{useEffect,useRef} from 'react';
import StudioImage from './StudioImage';
import {pageHref} from './pageInfo';
import {TextLink} from './PageUI';
import './production-formats-rail.css';

export default function ProductionFormatsRail({formats,formatLabel,exploreLabel}){
 const viewport=useRef(null),group=useRef(null);
 const control=useRef({width:0,visible:false,hover:false,focus:false,drag:null,suppressClick:false,resumeAt:0,reduced:false});
 useEffect(()=>{
  const el=viewport.current,model=control.current,media=matchMedia('(prefers-reduced-motion: reduce)');
  let frame=0,last=0,position=0;
  function measure(){
   const previous=model.width;model.width=group.current?.getBoundingClientRect().width||0;
   if(model.reduced){el.scrollLeft=0;return;}
   const phase=previous?((el.scrollLeft%previous)+previous)%previous:0;
   el.scrollLeft=model.width+(previous?phase/previous*model.width:0);position=el.scrollLeft;
  }
  function normalize(){
   if(model.reduced||!model.width)return;
   if(el.scrollLeft<model.width*.5)el.scrollLeft+=model.width;
   else if(el.scrollLeft>model.width*1.5)el.scrollLeft-=model.width;
  }
  function tick(time){
   const elapsed=last?Math.min(time-last,48):0;last=time;
   if(model.visible&&!document.hidden&&!model.reduced&&!model.hover&&!model.focus&&!model.drag&&time>model.resumeAt){
    position+=elapsed*.03;el.scrollLeft=position;normalize();
    if(Math.abs(el.scrollLeft-position)>1.1)position=el.scrollLeft;
   }else position=el.scrollLeft;
   frame=requestAnimationFrame(tick);
  }
  function motion(){model.reduced=media.matches;measure();}
  function scroll(){normalize();}
  function interact(){model.hover=false;model.focus=false;model.resumeAt=performance.now()+1200;}
  const resize=new ResizeObserver(measure);resize.observe(group.current);
  const observer=new IntersectionObserver(entries=>{model.visible=entries[0].isIntersecting;},{threshold:.05});observer.observe(el);
  media.addEventListener('change',motion);el.addEventListener('scroll',scroll,{passive:true});el.addEventListener('wheel',interact,{passive:true});el.addEventListener('touchstart',interact,{passive:true});el.addEventListener('touchmove',interact,{passive:true});el.addEventListener('touchend',interact,{passive:true});motion();frame=requestAnimationFrame(tick);
  return()=>{cancelAnimationFrame(frame);resize.disconnect();observer.disconnect();media.removeEventListener('change',motion);el.removeEventListener('scroll',scroll);el.removeEventListener('wheel',interact);el.removeEventListener('touchstart',interact);el.removeEventListener('touchmove',interact);el.removeEventListener('touchend',interact);};
 },[]);
 function pointerDown(event){
  control.current.focus=false;
  control.current.suppressClick=false;
  if(event.pointerType==='touch'||event.button!==0)return;
  control.current.drag={id:event.pointerId,x:event.clientX,lastX:event.clientX,y:event.clientY,moved:false};
 }
 function pointerMove(event){
  const model=control.current,drag=model.drag;if(!drag||drag.id!==event.pointerId)return;
  if(!drag.moved&&Math.abs(event.clientX-drag.x)>7&&Math.abs(event.clientX-drag.x)>Math.abs(event.clientY-drag.y)){
   drag.moved=true;model.suppressClick=true;viewport.current.setPointerCapture(event.pointerId);viewport.current.dataset.dragging='true';
  }
  if(drag.moved){event.preventDefault();viewport.current.scrollLeft-=event.clientX-drag.lastX;}
  drag.lastX=event.clientX;
 }
 function release(event){
  const el=viewport.current,model=control.current,drag=model.drag;if(!drag)return;
  model.drag=null;
  if(drag.moved){model.hover=false;model.focus=false;}
  if(el.hasPointerCapture(event.pointerId))el.releasePointerCapture(event.pointerId);
  model.resumeAt=performance.now()+1200;el.dataset.dragging='false';
 }
 return <div className="production-formats-rail" ref={viewport} role="region" aria-label="Production formats. Drag or swipe to browse, or use the left and right arrow keys." tabIndex={0} data-lenis-prevent
  onPointerEnter={event=>{if(event.pointerType==='mouse')control.current.hover=true;}}
  onPointerLeave={event=>{control.current.hover=false;if(!control.current.drag?.moved)release(event);}}
  onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}
  onDragStart={event=>event.preventDefault()}
  onClickCapture={event=>{if(control.current.suppressClick){event.preventDefault();event.stopPropagation();control.current.suppressClick=false;}}}
  onFocusCapture={event=>{control.current.focus=event.target.matches(':focus-visible');}}
  onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget))control.current.focus=false;}}
  onKeyDown={event=>{control.current.focus=true;if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();const card=group.current?.firstElementChild;viewport.current.scrollBy({left:(event.key==='ArrowRight'?1:-1)*((card?.getBoundingClientRect().width||300)+24),behavior:control.current.reduced?'instant':'smooth'});}}}>
  <div className="production-formats-track">
   {[0,1,2].map(copy=><div className="production-formats-group" key={copy} ref={copy===1?group:undefined} data-copy={copy!==1?'true':undefined} aria-hidden={copy!==1?true:undefined}>
    {formats.map(([id,title,text,image])=><article className="production-format-slide" key={id} id={copy===1?id:undefined}>
     <a href={pageHref(id)} tabIndex={-1} aria-hidden="true" className="production-format-photo"><StudioImage src={`/assets/stills/${image}-960.webp`} alt="" loading="lazy" width="960" height="540" draggable={false}/></a>
     <div className="production-format-copy"><span className="produce-label">{formatLabel}</span><h3>{title}</h3><p>{text}</p>{copy===1?<TextLink href={pageHref(id)}>{exploreLabel}{title}</TextLink>:<a className="line-link" href={pageHref(id)} tabIndex={-1}>{exploreLabel}{title}</a>}</div>
    </article>)}
   </div>)}
  </div>
 </div>;
}
