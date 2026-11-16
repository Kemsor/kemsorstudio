import React,{useEffect,useRef,useState} from 'react';
import './production-gallery.css';
export default function ProductionGallery({images=[],title="Gallery",headingId="production-gallery-title"}){
 const [active,setActive]=useState(null),dialog=useRef(null);
 const open=active!==null;
 useEffect(()=>{
  if(!open)return;
  const element=dialog.current,previous=document.activeElement,overflow=document.body.style.overflow;
  element.showModal();document.body.style.overflow='hidden';
  return()=>{if(element.open)element.close();document.body.style.overflow=overflow;previous?.focus();};
 },[open]);
 if(!images.length)return null;
 const image=images[active];
 const step=delta=>setActive(index=>(index+delta+images.length)%images.length);
 return <section className="production-gallery" aria-labelledby={headingId}><h2 id={headingId}>{title}</h2><div className="production-gallery-grid">{images.map((item,index)=><figure key={item.media_id}><button type="button" onClick={()=>setActive(index)} aria-label={`View image ${index+1}: ${item.alt}`}><img src={`/media/${item.media_id}`} alt={item.alt} loading="lazy"/><span aria-hidden="true">View full size →</span></button><figcaption><span>{item.kind==='poster'?'Poster':item.kind==='behind_the_scenes'?'Behind the scenes':'Production still'}</span>{item.caption&&<p>{item.caption}</p>}</figcaption></figure>)}</div><dialog ref={dialog} className="production-gallery-dialog" aria-label="Production gallery viewer" onClose={()=>setActive(null)} onClick={event=>{if(event.target===event.currentTarget)setActive(null);}} onKeyDown={event=>{if(event.key==='ArrowRight'){event.preventDefault();step(1);}if(event.key==='ArrowLeft'){event.preventDefault();step(-1);}}}><div className="production-gallery-viewer"><button type="button" className="gallery-close" onClick={()=>setActive(null)} autoFocus>Close ×</button>{image&&<><figure><img src={`/media/${image.media_id}`} alt={image.alt}/>{image.caption&&<figcaption>{image.caption}</figcaption>}</figure><div className="gallery-controls"><button type="button" onClick={()=>step(-1)} disabled={images.length<2} aria-label="Previous gallery image">← Previous</button><span role="status" aria-live="polite">{active+1} / {images.length}</span><button type="button" onClick={()=>step(1)} disabled={images.length<2} aria-label="Next gallery image">Next →</button></div></>}</div></dialog></section>;
}
