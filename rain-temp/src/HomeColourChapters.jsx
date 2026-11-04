import {useEffect} from 'react';

// Four content chapters, with a dark closing palette for the footer.
const chapters=[
 {selector:'#home',name:'opening',background:[255,255,255]},
 {selector:'#studio',name:'studio',background:[255,255,255]},
 {selector:'#services',name:'work',background:[0,0,0]},
 {selector:'.final-process',name:'collaboration',background:[255,255,255]},
 {selector:'.creative-footer',name:'footer',background:[0,0,0]},
];
const mix=(a,b,t)=>a.map((value,index)=>Math.round(value+(b[index]-value)*t));
const rgb=value=>`rgb(${value.join(' ')})`;
const luminance=color=>color.map(value=>{const c=value/255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;}).reduce((sum,value,index)=>sum+value*[.2126,.7152,.0722][index],0);
function palette(background){
 const light=luminance(background);
 const contrast=color=>{const textLight=luminance(color);return (Math.max(textLight,light)+.05)/(Math.min(textLight,light)+.05);};
 let ink=light>.18?[45,41,38]:[239,234,226];
 if(contrast(ink)<4.5)ink=light>.179?[0,0,0]:[255,255,255];
 let muted=mix(ink,background,.15);if(contrast(muted)<4.5)muted=ink;
 return {bg:background,ink,muted,line:mix(background,ink,.24),panel:mix(background,ink,.045)};
}

export default function HomeColourChapters({reduced=false}){
 useEffect(()=>{
  const root=document.getElementById('top'),main=document.getElementById('main');
  if(!root||!main)return;
  let frame=null,stops=[],active=-1,displayed=null,from=null,target=null,started=0,last='';
  const write=(prefix,colors)=>Object.entries(colors).forEach(([key,value])=>root.style.setProperty(`--${prefix}-${key}`,rgb(value)));
  const draw=time=>{
   frame=null;if(!stops.length)return;
   const maximum=document.documentElement.scrollHeight-innerHeight;
   let next=0;
   for(let index=1;index<stops.length;index++){
    const boundary=index===stops.length-1?Math.min(stops[index]-innerHeight*.5,maximum):stops[index]-innerHeight*.525;
    if(scrollY<boundary)break;next=index;
   }
   if(next!==active){
    const initial=active===-1;
    active=next;from=displayed||chapters[next].background;target=chapters[next].background;started=initial?time-420:time;
    root.dataset.homeColors=chapters[next].name;
    // Menus use the settled chapter palette, so they never become grey-on-grey.
    write('home-nav',palette(target));
   }
   const progress=reduced?1:Math.min(1,(time-started)/420);
   const eased=1-(1-progress)**3;
   displayed=mix(from,target,eased);
   const key=displayed.join(',');
   if(key!==last){last=key;write('chapter',palette(displayed));root.dataset.chapterTone=luminance(displayed)>.18?'light':'dark';}
   // Finish even if the visitor stops scrolling midway through a chapter change.
   if(progress<1)frame=requestAnimationFrame(draw);
  };
  const request=()=>{if(frame==null)frame=requestAnimationFrame(draw);};
  const measure=()=>{stops=chapters.map(chapter=>{const element=root.querySelector(chapter.selector);return element?element.getBoundingClientRect().top+scrollY:Infinity;});request();};
  const observer=new ResizeObserver(measure);observer.observe(main);const footer=root.querySelector('.creative-footer');if(footer)observer.observe(footer);
  addEventListener('scroll',request,{passive:true});addEventListener('resize',measure);
  measure();
  return()=>{observer.disconnect();removeEventListener('scroll',request);removeEventListener('resize',measure);cancelAnimationFrame(frame);delete root.dataset.homeColors;delete root.dataset.chapterTone;for(const prefix of ['chapter','home-nav'])for(const key of ['bg','ink','muted','line','panel'])root.style.removeProperty(`--${prefix}-${key}`);};
 },[reduced]);
 return null;
}
