import RollingLabel from './RollingLabel';
import React, {useEffect, useRef, useState} from 'react';
import SiteIcon from './SiteIcon';
import {services} from '../../designer-theme/src/data';
import './designer-services.css';

const asset=name=>`/assets/designer-services/${name}`;
export default function DesignerServices({reduced=false}){
 const [active,setActive]=useState(0);
 const [paused,setPaused]=useState(false),[focused,setFocused]=useState(false),[visible,setVisible]=useState(false),[pageVisible,setPageVisible]=useState(!document.hidden);
 const stage=useRef(null);
 const touch=useRef(null);
 useEffect(()=>{
  const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{threshold:0.15});
  observer.observe(stage.current);
  const visibility=()=>setPageVisible(!document.hidden);
  document.addEventListener('visibilitychange',visibility);
  return()=>{observer.disconnect();document.removeEventListener('visibilitychange',visibility)};
 },[]);
 useEffect(()=>{
  if(reduced||paused||focused||!visible||!pageVisible)return;
  const timer=setTimeout(()=>setActive(index=>(index+1)%services.length),6000);
  return()=>clearTimeout(timer);
 },[active,reduced,paused,focused,visible,pageVisible]);
 const change=direction=>setActive(index=>(index+direction+services.length)%services.length);
 const swipeEnd=event=>{
  if(!touch.current)return;
  const {clientX,clientY}=event.changedTouches[0];
  const dx=clientX-touch.current.x,dy=clientY-touch.current.y;
  touch.current=null;
  if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.3)change(dx<0?1:-1);
 };
 return <section id="services" className="designer-services" aria-labelledby="designer-services-title" data-reduced={reduced} onFocusCapture={()=>setFocused(true)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget))setFocused(false)}}>
  <div className="ds-wrap ds-intro">
   <div className="ds-label"><span><SiteIcon name="scan" size={15}/>WHAT WE OFFER</span><span>SERVICES, WITH THE WORK BESIDE THEM</span></div>
   <div className="ds-heading-row"><h2 id="designer-services-title">Everything a story needs<br/>to reach the screen.</h2><p>Bring us in at the start, or at the stage where you need us most. Each service sits beside the work, so you can see the craft, not just read about it.</p></div>
  </div>
  <div className="ds-stage" ref={stage} onTouchStart={event=>{const t=event.touches[0];touch.current={x:t.clientX,y:t.clientY}}} onTouchEnd={swipeEnd} onTouchCancel={()=>touch.current=null}>
   <img className="ds-backdrop" src={asset('services-background.webp')} width="736" height="451" alt="" loading="lazy" decoding="async"/>
   <div className="ds-shade"/>
   <div className="ds-wrap ds-inner">
    <div className="ds-controls"><span className="ds-count" role="status" aria-live={paused||focused||reduced?'polite':'off'} aria-atomic="true"><b>{String(active+1).padStart(2,'0')}</b> / 06</span><div className="ds-arrows">{!reduced&&<button type="button" aria-label={paused?'Play services automatically':'Pause automatic services'} onClick={()=>setPaused(value=>!value)}><span aria-hidden="true">{paused?'▶':'Ⅱ'}</span></button>}<button type="button" aria-label="Previous service" onClick={()=>change(-1)}><SiteIcon name="arrow-left" size={18}/></button><button type="button" aria-label="Next service" onClick={()=>change(1)}><SiteIcon name="arrow" size={18}/></button></div></div>
    <div className="ds-slides" id="designer-service-panel" role="region" aria-labelledby={`designer-service-name-${active}`} >{services.map((service,index)=><div className={`ds-content${active===index?' is-active':''}`} key={service.title} aria-hidden={active!==index} inert={active!==index}>
     <div className="ds-copy"><h3 id={`designer-service-name-${index}`}>{service.title}</h3><p>{service.text}</p><ul>{service.points.map(point=><li key={point}>{point}</li>)}</ul><a className="ds-cta" href={service.href}><RollingLabel>Explore service</RollingLabel><SiteIcon name="film" size={17}/></a></div>
     <a href={service.href} className="ds-picture" aria-label={`Explore ${service.title}`}><img src={asset(service.image)} alt="Production reference" loading="lazy" decoding="async" width="640" height="640"/></a>
    </div>)}</div>
   </div>
  </div>
  <div className="ds-tabs-band"><div className="ds-wrap ds-tabs" role="group" aria-label="Choose a production service">{services.map((item,index)=><button key={item.title} type="button" aria-pressed={active===index} aria-controls="designer-service-panel" onPointerEnter={event=>{if(event.pointerType==='mouse')setActive(index)}} onFocus={()=>setActive(index)} onClick={()=>setActive(index)}><span>{String(index+1).padStart(2,'0')}</span>{item.title}</button>)}</div></div>
 </section>;
}
