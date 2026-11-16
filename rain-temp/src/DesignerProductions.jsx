import {cmsText} from './siteContent';
import StudioImage from './StudioImage';
import React, {useEffect,useState} from 'react';
import SiteIcon from './SiteIcon';
import {CTA} from './PageUI';
import {productions} from '../../designer-theme/src/data';
import './designer-productions.css';
const formatLinks=['/what-we-make/short-films/','/finance/co-production/','/what-we-make/series-ott/','/post-production/','/finance/international-co-productions/'];

export default function DesignerProductions({reduced=false}){
 const slides=[{title:'The Uttarakhand Story',category:'Feature film',image:'/assets/supplied/uttarakhand-story-poster.jpeg',poster:true},...productions];
 const [active,setActive]=useState(0),[paused,setPaused]=useState(false);
 const advance=direction=>setActive(index=>(index+direction+slides.length)%slides.length);
 useEffect(()=>{
  if(reduced||paused)return;
  const timer=setInterval(()=>{if(!document.hidden)setActive(index=>(index+1)%slides.length);},5000);
  return()=>clearInterval(timer);
 },[reduced,paused,active]);
 return <section id="productions" className="motion-work" aria-labelledby="motion-work-title" data-reduced={reduced}>
  <div className="mw-layout">
   <div className="mw-intro"><span className="mw-pill"><SiteIcon name="scan" size={15}/>{cmsText("DesignerProductions","57eb1614793facc1","STORIES, SEEN IN MOTION")}</span><p className="mw-eyebrow">{cmsText("DesignerProductions","f68dccc8bd02a991","STORIES, SEEN IN MOTION")}</p><h2 id="motion-work-title">{cmsText("DesignerProductions","4bfeb5a2c769cf7b","The work.")}<br/><span className="heading-accent">{cmsText("DesignerProductions","5e3ea49a74a344f7","In frame.")}</span></h2><p className="mw-description">{cmsText("DesignerProductions","c326534e81be93cb","A selection of the formats and production settings at the heart of our work.")}</p><CTA href="/productions/" className="cta-white">{cmsText("DesignerProductions","c582c4db08413e5f","View all productions")}</CTA></div>
   <div className="mw-gallery-wrap" onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)} onFocusCapture={()=>setPaused(true)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget))setPaused(false)}}>
    <div className="mw-gallery" role="region" aria-roledescription="carousel" aria-label="Production references" tabIndex={0} onKeyDown={event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();advance(event.key==='ArrowLeft'?-1:1)}}}>
     <div className="mw-slide-track" style={{transform:`translateX(-${active*100}%)`}}>{slides.map((item,index)=><article key={item.title} className={`mw-card${active===index?' is-active':''}${item.poster?' mw-poster':''}`} aria-hidden={active!==index} aria-label={`${index+1} of ${slides.length}`}>
      <StudioImage mediaSlot={item.poster?"DesignerProductions-poster":"DesignerProductions-1"} src={item.poster?item.image:`/assets/designer-productions/${item.image}`} alt={item.poster?"The Uttarakhand Story film poster":""} loading="lazy" decoding="async" width="640" height="900"/>
      {!item.poster&&<span className="mw-scrim" aria-hidden="true"/>}
      {!item.poster&&<div className="mw-caption"><small>{item.category}</small><strong>{item.title}</strong><span>{cmsText("DesignerProductions","a933db72f5fd6764","Production reference")}</span></div>}
     </article>)}</div>
     <div className="mw-slide-controls"><button type="button" onClick={()=>advance(-1)} aria-label="Previous slide">←</button><span>{active+1} / {slides.length}</span><button type="button" onClick={()=>advance(1)} aria-label="Next slide">→</button></div>
    </div><a className="mw-format-link" href={(active===0?'/productions/':formatLinks[active-1])||'/productions/'}>Explore {slides[active].category}<SiteIcon name="arrow" size={18}/></a>
   </div>
  </div>
 </section>;
}
