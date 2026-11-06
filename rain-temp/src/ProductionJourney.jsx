import React,{useEffect,useRef,useState} from 'react';
import SiteIcon from './SiteIcon';
import './production-journey.css';

const icons=['script','briefcase','film','video','guide'];
export default function ProductionJourney({steps,exploreLabel}){
 const root=useRef(null),[entered,setEntered]=useState(false);
 useEffect(()=>{
  const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){setEntered(true);observer.disconnect();}},{threshold:.15});
  if(root.current)observer.observe(root.current);
  return()=>observer.disconnect();
 },[]);
 return <ol ref={root} className="production-journey" data-entered={entered} aria-label="Production journey">
  {steps.map(([title,copy,path],index)=><li key={title} style={{'--journey-delay':`${index*140}ms`}}>
   <a className="production-journey-stop" href={`/${path}/`}>
    <span className="production-journey-node" aria-hidden="true"><SiteIcon name={icons[index]} size={27}/></span>
    <div className="production-journey-copy"><h3>{title}</h3><p>{copy}</p><span className="production-journey-link">{exploreLabel}{title}<SiteIcon name="arrow-up-right" size={16}/></span></div>
   </a>
  </li>)}
 </ol>;
}
