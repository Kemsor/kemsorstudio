import {useLayoutEffect,useRef} from 'react';

// Preserve the horizontal film motion with a bounded vertical scroll distance.
// Native scrolling remains available on touch layouts and with reduced motion.
export default function useCompactRail({runway,stage,viewport,track,disabled=false,resetKey='',snapToCards=false}){
 const move=useRef(()=>{});
 useLayoutEffect(()=>{
  const host=runway.current,frame=stage.current,windowEl=viewport.current,rail=track.current;
  if(!host||!frame||!windowEl||!rail)return;
  const query=matchMedia('(min-width:901px) and (min-height:700px)');
  let distance=0,budget=0,raf=0,drag=null,suppressUntil=0;
  const top=()=>parseFloat(getComputedStyle(frame).top)||0;
  const start=()=>scrollY+host.getBoundingClientRect().top-top();
  const current=()=>budget?Math.max(0,Math.min(distance,(scrollY-start())/budget*distance)):windowEl.scrollLeft;
  const update=()=>{raf=0;if(budget)rail.style.transform=`translate3d(${-current()}px,0,0)`;};
  const schedule=()=>{if(!raf)raf=requestAnimationFrame(update);};
  const go=(offset,instant=false)=>{
   const target=Math.max(0,Math.min(distance,offset));
   if(budget)window.scrollTo({top:start()+target/distance*budget,behavior:instant?'instant':'smooth'});
   else windowEl.scrollTo({left:target,behavior:instant||disabled?'instant':'smooth'});
  };
  move.current=direction=>{
   if(!snapToCards){go(current()+direction*windowEl.clientWidth*.8);return;}
   const offset=current();
   const stops=[...new Set([0,...[...rail.children].map(card=>Math.min(distance,card.offsetLeft)),distance])].sort((a,b)=>a-b);
   const next=direction>0?stops.find(stop=>stop>offset+2):stops.slice().reverse().find(stop=>stop<offset-2);
   go(next??(direction>0?distance:0));
  };
  const measure=()=>{
   const pinned=query.matches&&!disabled;
   host.dataset.pinned=String(pinned);
   distance=Math.max(0,rail.scrollWidth-windowEl.clientWidth);
   budget=pinned?Math.min(distance,innerHeight*.7):0;
   host.style.height=budget?`${frame.offsetHeight+budget}px`:'';
   if(!budget)rail.style.transform='';
   schedule();
  };
  const sync=()=>{cancelAnimationFrame(raf);update();};
  const focus=event=>{
   if(!budget)return;
   const card=event.target.closest('[data-clip],.work-scroll-track>a');if(!card)return;
   const left=card.offsetLeft,right=left+card.offsetWidth,offset=current();
   windowEl.scrollLeft=0;
   go(left<offset?left:right>offset+windowEl.clientWidth?right-windowEl.clientWidth:offset,true);
  };
  const down=event=>{
   if(event.pointerType!=='mouse'||event.button!==0||event.target.closest('button'))return;
   drag={id:event.pointerId,x:event.clientX,offset:current(),moved:false};
  };
  const pointerMove=event=>{
   if(!drag||drag.id!==event.pointerId)return;
   const delta=drag.x-event.clientX;
   if(!drag.moved&&Math.abs(delta)<5)return;
   drag.moved=true;event.preventDefault();windowEl.classList.add('is-dragging');
   if(!windowEl.hasPointerCapture(drag.id))windowEl.setPointerCapture(drag.id);
   go(drag.offset+delta,true);
  };
  const end=event=>{
   if(!drag||event.pointerId!==drag.id)return;
   const id=drag.id;if(drag.moved)suppressUntil=performance.now()+350;
   drag=null;windowEl.classList.remove('is-dragging');
   if(windowEl.hasPointerCapture(id))windowEl.releasePointerCapture(id);
  };
  const click=event=>{if(performance.now()<suppressUntil){event.preventDefault();event.stopPropagation();}};
  const nativeDrag=event=>event.preventDefault();
  const observer=new ResizeObserver(measure);[frame,windowEl,rail].forEach(el=>observer.observe(el));
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',measure);addEventListener('kemsor:smooth-scroll',sync);
  rail.addEventListener('focusin',focus);windowEl.addEventListener('pointerdown',down);addEventListener('pointermove',pointerMove,{passive:false});
  addEventListener('pointerup',end);addEventListener('pointercancel',end);windowEl.addEventListener('click',click,true);windowEl.addEventListener('dragstart',nativeDrag);
  windowEl.scrollLeft=0;measure();
  return()=>{
   observer.disconnect();cancelAnimationFrame(raf);move.current=()=>{};
   if(drag&&windowEl.hasPointerCapture(drag.id))windowEl.releasePointerCapture(drag.id);
   removeEventListener('scroll',schedule);removeEventListener('resize',measure);removeEventListener('kemsor:smooth-scroll',sync);
   rail.removeEventListener('focusin',focus);windowEl.removeEventListener('pointerdown',down);removeEventListener('pointermove',pointerMove);
   removeEventListener('pointerup',end);removeEventListener('pointercancel',end);windowEl.removeEventListener('click',click,true);windowEl.removeEventListener('dragstart',nativeDrag);
   host.style.height='';rail.style.transform='';
  };
 },[disabled,resetKey,snapToCards]);
 return direction=>move.current(direction);
}
