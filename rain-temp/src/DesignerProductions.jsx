import React, {useEffect,useState} from 'react';
import defaults from '../../shared/home-work-in-frame.json';
import {cmsText,getSiteModule} from './siteContent';
import StudioImage from './StudioImage';
import SiteIcon from './SiteIcon';
import {CTA} from './PageUI';
import './designer-productions.css';

const resolvePath = value => {
 const base=import.meta.env.BASE_URL;
 return base!=='/' && value.startsWith('/') && !value.startsWith(base) ? base+value.slice(1) : value;
};
const priorCopy = (key, fallback) => cmsText('DesignerProductions', key, fallback);

export default function DesignerProductions({reduced=false}){
 const values=getSiteModule('home-work-in-frame',{});
 const copy=(field,key)=>values[field]??priorCopy(key,defaults[field]);
 const slides=defaults.slides.map((item,index)=>{
  const prefix=`slides.${item.id}.`;
  const value=key=>values[prefix+key];
  return {
   ...item,
   title:value('title')??(item.titleKey?cmsText('HomepageServiceData',item.titleKey,item.title):item.title),
   category:value('category')??(item.categoryKey?cmsText('HomepageServiceData',item.categoryKey,item.category):item.category),
   image:resolvePath(value('image')??item.image),
   hasEditedImage:Boolean(value('image')),
   alt:value('alt'),
   href:resolvePath(value('href')??item.href),
   note:value('note')??item.note,
   position:value('position')??index+1,
   enabled:value('enabled')??true,
   showCaption:!item.poster||value('title')!==undefined||value('category')!==undefined,
  };
 }).filter(item=>item.enabled).sort((a,b)=>a.position-b.position);
 const [position,setPosition]=useState(0);
 const [paused,setPaused]=useState(false);
 const count=slides.length;
 const active=count?position%count:0;
 const selected=slides[active];
 const advance=direction=>setPosition(index=>(index+direction+count)%count);
 useEffect(()=>{
  if(reduced||paused||count<2)return;
  const timer=setInterval(()=>{if(!document.hidden)setPosition(index=>(index+1)%count);},5000);
  return()=>clearInterval(timer);
 },[reduced,paused,position,count]);
 if(values.enabled===false)return null;
 const buttonHref=values.buttonHref??defaults.buttonHref;
 return <section id="productions" className="motion-work" aria-labelledby="motion-work-title" data-reduced={reduced}>
  <div className="mw-layout">
   <div className="mw-intro">
    <span className="mw-pill"><SiteIcon name="scan" size={15}/>{copy('eyebrow','57eb1614793facc1')}</span>
    <p className="mw-eyebrow">{copy('eyebrow','f68dccc8bd02a991')}</p>
    <h2 id="motion-work-title">{copy('title','4bfeb5a2c769cf7b')}<br/><span className="heading-accent">{copy('accent','5e3ea49a74a344f7')}</span></h2>
    <p className="mw-description">{copy('description','c326534e81be93cb')}</p>
    {buttonHref&&<CTA href={resolvePath(buttonHref)} className="cta-white">{copy('buttonLabel','c582c4db08413e5f')}</CTA>}
   </div>
   {selected&&<div className="mw-gallery-wrap" onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)} onFocusCapture={()=>setPaused(true)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget))setPaused(false)}}>
    {selected.note&&<p className="mw-release-title">{selected.note}</p>}
    <div className="mw-gallery" role="region" aria-roledescription="carousel" aria-label="Production references" tabIndex={0} onKeyDown={event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();advance(event.key==='ArrowLeft'?-1:1)}}}>
     <div className="mw-slide-track" style={{transform:`translateX(-${active*100}%)`}}>{slides.map((item,index)=><article key={item.id} className={`mw-card${active===index?' is-active':''}${item.poster?' mw-poster':''}`} aria-hidden={active!==index} aria-label={`${index+1} of ${count}`}>
      <StudioImage mediaSlot={item.hasEditedImage?undefined:item.poster?'DesignerProductions-poster':'DesignerProductions-1'} src={item.image} alt={item.poster?defaults.slides[0].alt:''} altOverride={item.alt} loading="lazy" decoding="async" width="640" height="900"/>
      {item.showCaption&&<><span className="mw-scrim" aria-hidden="true"/><div className="mw-caption"><small>{item.category}</small><strong>{item.title}</strong>{!item.poster&&<span>{copy('referenceLabel','a933db72f5fd6764')}</span>}</div></>}
     </article>)}</div>
     {count>1&&<div className="mw-slide-controls"><button type="button" onClick={()=>advance(-1)} aria-label="Previous slide">←</button><span>{active+1} / {count}</span><button type="button" onClick={()=>advance(1)} aria-label="Next slide">→</button></div>}
    </div>
    {selected.href&&<a className="mw-format-link" href={selected.href}>Explore {selected.category}<SiteIcon name="arrow" size={18}/></a>}
   </div>}
  </div>
 </section>;
}
