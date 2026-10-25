import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import './text-motion.css';

const MotionContext=createContext({disabled:false,suspended:false});
const waiting=new WeakMap();
let observer;
function watch(element,reveal){
 if(!observer)observer=new IntersectionObserver(entries=>{
  for(const entry of entries)if(entry.isIntersecting){
   waiting.get(entry.target)?.();waiting.delete(entry.target);observer.unobserve(entry.target);
  }
 },{threshold:0,rootMargin:'0px 0px -7% 0px'});
 waiting.set(element,reveal);observer.observe(element);
 return()=>{waiting.delete(element);observer.unobserve(element);};
}
export function TextMotionProvider({disabled,suspended,children}){
 const value=useMemo(()=>({disabled,suspended}),[disabled,suspended]);
 return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}
function Flow({children,kind}){
 const {disabled,suspended}=useContext(MotionContext);
 const first=useRef(null);
 const [seen,setSeen]=useState(false);
 useEffect(()=>{
  if(disabled||seen||suspended)return;
  if(!('IntersectionObserver' in window)){setSeen(true);return;}
  const block=first.current?.closest('[data-text-flow]');
  if(!block)return;
  return watch(block,()=>setSeen(true));
 },[disabled,suspended,seen]);
 let count=0;
 const split=node=>React.Children.map(node,child=>{
  if(typeof child==='string'||typeof child==='number'){
   // Retain actual spaces, punctuation and authored line breaks. Native React
   // nodes stay in React's ownership, including when CMS content changes.
   return String(child).split(/(\s+)/).filter(Boolean).map((part,i)=>{
    if(/^\s+$/.test(part))return part;
    const index=count++;
    const delay=kind==='copy'?Math.min(Math.floor(index/3)*65,520):Math.min(index*75,600);
    return <motion-word ref={index===0?first:undefined} key={i} className={`text-flow-word${disabled||seen?' is-seen':''}`} style={{'--text-word-delay':`${delay}ms`}}>{part}</motion-word>;
   });
  }
  if(React.isValidElement(child)){
   if(typeof child.type==='string'&&['a','button','svg','img','br','input'].includes(child.type))return child;
   if(child.props.children!==undefined)return React.cloneElement(child,undefined,split(child.props.children));
  }
  return child;
 });
 return split(children);
}
export default function MotionHeading({as:Tag='h2',children,...props}){
 return <Tag {...props} data-text-flow="heading"><Flow kind="heading">{children}</Flow></Tag>;
}
export function MotionCopy({children,...props}){
 const {disabled,suspended}=useContext(MotionContext);
 const block=useRef(null);
 const [seen,setSeen]=useState(false);
 useEffect(()=>{
  if(disabled||seen||suspended)return;
  if(!('IntersectionObserver' in window)){setSeen(true);return;}
  return watch(block.current,()=>setSeen(true));
 },[disabled,suspended,seen]);
 return <p {...props} ref={block} data-text-flow="copy" className={`${props.className||''} text-flow-copy${disabled||seen?' is-seen':''}`}>{children}</p>;
}

export function isTextElement(node,tag){
 return React.isValidElement(node)&&(node.type===tag||(node.type===MotionHeading&&node.props.as===tag)||(tag==='p'&&node.type===MotionCopy));
}
