import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './studio-clip-viewer.css';

export default forwardRef(function StudioClipViewer({onOpenChange}, ref) {
 const dialog=useRef(null), screen=useRef(null), player=useRef(null), nativeFullscreen=useRef(false), opener=useRef(null);
 const [selection,setSelection]=useState(null);
 const close=()=>{
  if(document.fullscreenElement===screen.current)document.exitFullscreen().catch(()=>{});
  dialog.current?.close();
 };
 useImperativeHandle(ref,()=>({
  open(clip,time=0){
   opener.current=document.activeElement;
   setSelection({...clip,time});
   onOpenChange(true);
   dialog.current.showModal();
   // Request during the click gesture. The full-viewport dialog also works on
   // browsers that do not support element fullscreen (including some mobiles).
   if(screen.current.requestFullscreen){
    try{screen.current.requestFullscreen().catch(()=>{});}catch{/* Keep the dialog open. */}
   }
  }
 }),[onOpenChange]);
 useEffect(()=>{
  const sync=()=>{
   if(document.fullscreenElement===screen.current)nativeFullscreen.current=true;
   else if(nativeFullscreen.current){nativeFullscreen.current=false;dialog.current?.close();}
  };
  document.addEventListener('fullscreenchange',sync);
  return()=>{document.removeEventListener('fullscreenchange',sync);};
 },[]);
 return createPortal(<dialog ref={dialog} className="studio-video-viewer" aria-labelledby="studio-video-title" onCancel={event=>{event.preventDefault();close();}} onClose={()=>{player.current?.pause();nativeFullscreen.current=false;setSelection(null);onOpenChange(false);requestAnimationFrame(()=>opener.current?.focus({preventScroll:true}));}}>
  <div ref={screen} className="studio-video-screen"><header className="studio-video-toolbar"><span id="studio-video-title">{selection?.label||'Studio film'}</span><button type="button" autoFocus onClick={close} aria-label="Exit fullscreen video"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M9 3v6H3m18 0h-6V3M3 15h6v6m6 0v-6h6"/></svg><span>Exit fullscreen</span></button></header>
  {selection&&<video ref={player} src={selection.src} poster={selection.poster} controls controlsList="nofullscreen" autoPlay muted loop playsInline preload="metadata" aria-label={selection.label} onLoadedMetadata={event=>{const video=event.currentTarget;if(Number.isFinite(video.duration)&&selection.time<video.duration)video.currentTime=selection.time;video.play().catch(()=>{});}}/>}
 </div></dialog>,document.body);
});
