import React,{Children,cloneElement,isValidElement,useEffect,useRef,useState} from 'react';
import './sliding-cards.css';
export default function SlidingCards({children,className='',as:Tag='div'}){
 const host=useRef(null),current=useRef(null),[active,setActive]=useState(-1);
 function place(card,event){
  if(!card||!host.current)return;
  current.current=card;
  const rect=card.getBoundingClientRect(),parent=host.current.getBoundingClientRect(),style=host.current.style;
  for(const [name,value]of Object.entries({x:rect.left-parent.left,y:rect.top-parent.top,width:rect.width,height:rect.height}))style.setProperty(`--sliding-${name}`,`${value}px`);
  if(event){style.setProperty('--sliding-glow-x',`${event.clientX-rect.left}px`);style.setProperty('--sliding-glow-y',`${event.clientY-rect.top}px`);}
  setActive(Number(card.dataset.slidingCard));
 }
 useEffect(()=>{const observer=new ResizeObserver(()=>{if(current.current)place(current.current);});if(host.current)observer.observe(host.current);return()=>observer.disconnect();},[]);
 function leave(){if(host.current?.contains(document.activeElement)){place(document.activeElement.closest('[data-sliding-card]'));return;}current.current=null;setActive(-1);}
 return <Tag ref={host} className={`sliding-cards ${className}`} data-sliding-active={active>=0} onPointerMove={event=>place(event.target.closest('[data-sliding-card]'),event)} onPointerLeave={leave} onFocus={event=>place(event.target.closest('[data-sliding-card]'))} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget)){current.current=null;setActive(-1);}}}>{Children.map(children,(child,index)=>isValidElement(child)?cloneElement(child,{'data-sliding-card':index,'data-sliding-selected':active===index,tabIndex:0}):child)}</Tag>;
}
