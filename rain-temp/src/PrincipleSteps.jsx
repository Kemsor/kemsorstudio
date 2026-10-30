import React,{useRef,useState} from 'react';
import './principle-steps.css';

const images=['studio-interview.webp','finance.webp','post.webp','valley.webp'];
export default function PrincipleSteps({items}){
 const [active,setActive]=useState(0);
 const buttons=useRef([]);
 const keyboard=(event,index)=>{
  let next;
  if(event.key==='ArrowRight'||event.key==='ArrowDown')next=(index+1)%items.length;
  else if(event.key==='ArrowLeft'||event.key==='ArrowUp')next=(index+items.length-1)%items.length;
  else if(event.key==='Home')next=0;
  else if(event.key==='End')next=items.length-1;
  else return;
  event.preventDefault();setActive(next);buttons.current[next]?.focus();
 };
 return <div className="principle-panels" role="group" aria-label="What we stand for">{items.map(([title,copy],i)=><article className={`principle-panel${active===i?' is-active':''}`} key={title}>
  <img src={`/assets/designer-services/${images[i]}`} alt="" loading="lazy" decoding="async"/>
  <div className="principle-panel-shade" aria-hidden="true"/>
  <button ref={node=>{buttons.current[i]=node}} className="principle-panel-toggle" type="button" aria-label={title} aria-expanded={active===i} aria-controls={`principle-detail-${i}`} onPointerEnter={event=>{if(event.pointerType==='mouse')setActive(i)}} onFocus={()=>setActive(i)} onClick={()=>setActive(i)} onKeyDown={event=>keyboard(event,i)}><span>{String(i+1).padStart(2,'0')}</span></button>
  <div className="principle-panel-copy" id={`principle-detail-${i}`} hidden={active!==i}><h3>{title}</h3><p>{copy}</p></div>
 </article>)}</div>;
}
