import React,{useEffect,useRef,useState} from 'react';
import PageTransitionLoader from './PageTransitionLoader';
import {incomingTransition,isPageNavigation,transitionKey} from './page-transition';
import './page-progress.css';

export default function PageProgress({ready=false,onActiveChange}){
 const [transition,setTransition]=useState(incomingTransition);
 const [leaving,setLeaving]=useState(false);
 const inFlight=useRef(Boolean(transition));
 const timers=useRef([]);
 const reset=()=>{
  timers.current.forEach(clearTimeout);timers.current=[];
  inFlight.current=false;setTransition(null);setLeaving(false);
  try{sessionStorage.removeItem(transitionKey);}catch{}
 };
 useEffect(()=>{onActiveChange?.(Boolean(transition));},[transition,onActiveChange]);
 useEffect(()=>{
  // Consume once; direct visits, refreshes and history restores skip this loader.
  try{sessionStorage.removeItem(transitionKey);}catch{}
  const click=event=>{
   const link=event.target.closest?.('a[href]');
   if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||!link||(link.target&&link.target!=='_self')||link.hasAttribute('download')||!isPageNavigation(link.href,location.href)||inFlight.current)return;
   event.preventDefault();
   const next={to:link.href,from:location.href,startedAt:Date.now(),phase:'departing'};
   inFlight.current=true;setTransition(next);
   try{sessionStorage.setItem(transitionKey,JSON.stringify(next));}catch{}
   const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
   timers.current.push(setTimeout(()=>location.assign(next.to),reduced?0:180));
   timers.current.push(setTimeout(reset,15000));
  };
  const restore=event=>{if(event.persisted)reset();};
  const offline=()=>reset();
  document.addEventListener('click',click);window.addEventListener('pageshow',restore);window.addEventListener('offline',offline);
  return()=>{timers.current.forEach(clearTimeout);document.removeEventListener('click',click);window.removeEventListener('pageshow',restore);window.removeEventListener('offline',offline);};
 },[]);
 useEffect(()=>{
  if(!transition||transition.phase!=='arriving'||!ready)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const timer=setTimeout(()=>{setLeaving(true);timers.current.push(setTimeout(reset,reduced?0:180));},Math.max(0,(reduced?0:650)-(Date.now()-transition.startedAt)));
  return()=>clearTimeout(timer);
 },[transition,ready]);
 useEffect(()=>{
  if(!transition)return;
  const timer=setTimeout(reset,15000);
  return()=>clearTimeout(timer);
 },[transition]);
 return transition?<PageTransitionLoader startedAt={transition.startedAt} leaving={leaving}/>:null;
}
