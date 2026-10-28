import React, {useEffect,useRef,useState} from 'react';
import {ArrowUp} from 'lucide-react';
export default function BackToTop(){
 const button=useRef(null);
 const [visible,setVisible]=useState(false);
 useEffect(()=>{
  let frame;
  const update=()=>{
   frame=null;
   const control=button.current;
   if(!control)return;
   const rect=control.getBoundingClientRect();
   const coversContent=[.15,.5,.85].some(x=>[.15,.5,.85].some(y=>document.elementsFromPoint(rect.left+rect.width*x,rect.top+rect.height*y).some(element=>!control.contains(element)&&element.closest('main,footer')&&element.closest('a,button,input,textarea,select,h1,h2,h3,p,li,img,video,.wordmark'))));
   setVisible(scrollY>innerHeight*.75&&!coversContent);
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};
  schedule();window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);
  return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule)};
 },[]);
 return <button ref={button} className={`back-to-top ${visible?'is-visible':''}`} aria-label="Back to top" title="Back to top" disabled={!visible} onClick={()=>scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'})}><ArrowUp size={21}/></button>;
}
