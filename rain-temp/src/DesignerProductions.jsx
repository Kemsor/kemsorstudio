import React, {useRef,useState} from 'react';
import SiteIcon from './SiteIcon';
import {CTA} from './PageUI';
import {productions} from '../../designer-theme/src/data';
import './designer-productions.css';

export default function DesignerProductions({reduced=false}){
 const [active,setActive]=useState(0),buttons=useRef([]);
 const move=(event,index)=>{
  let next;
  if(event.key==='ArrowRight'||event.key==='ArrowDown')next=(index+1)%productions.length;
  else if(event.key==='ArrowLeft'||event.key==='ArrowUp')next=(index-1+productions.length)%productions.length;
  else if(event.key==='Home')next=0;
  else if(event.key==='End')next=productions.length-1;
  if(next===undefined)return;
  event.preventDefault();setActive(next);buttons.current[next]?.focus({preventScroll:true});
 };
 return <section id="productions" className="motion-work" aria-labelledby="motion-work-title" data-reduced={reduced}>
  <div className="mw-layout">
   <div className="mw-intro"><span className="mw-pill"><SiteIcon name="scan" size={15}/>STORIES, SEEN IN MOTION</span><p className="mw-eyebrow">STORIES, SEEN IN MOTION</p><h2 id="motion-work-title">The work.<br/><span className="heading-accent">In frame.</span></h2><p className="mw-description">A selection of the formats and production settings at the heart of our work.</p><CTA href="/projects/" className="cta-white">View all productions</CTA></div>
   <div className="mw-gallery" role="group" aria-label="Explore production references">{productions.map((item,index)=><button key={item.title} ref={node=>{buttons.current[index]=node}} type="button" className={`mw-card${active===index?' is-active':''}`} aria-expanded={active===index} aria-controls={`motion-work-caption-${index}`} aria-label={`Explore ${item.title}`} onPointerEnter={event=>{if(event.pointerType==='mouse'&&matchMedia('(hover:hover) and (pointer:fine)').matches)setActive(index)}} onFocus={()=>setActive(index)} onClick={()=>setActive(index)} onKeyDown={event=>move(event,index)}>
    <img src={`/assets/designer-productions/${item.image}`} alt="" loading="lazy" decoding="async" width="640" height="900"/>
    <span className="mw-scrim" aria-hidden="true"/><span className="mw-vertical" aria-hidden="true">{item.label}</span>
    <span className="mw-caption" id={`motion-work-caption-${index}`} aria-hidden={active!==index}><small>{item.category}</small><strong>{item.title}</strong><span>Production reference</span></span>
   </button>)}</div>
  </div>
 </section>;
}
