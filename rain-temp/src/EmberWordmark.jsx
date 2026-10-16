import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from './useMotion';
import './ember.css';

// The earlier template's fire-filled letterforms, rendered at 12fps only in view.
export default function EmberWordmark({ paused: externalPaused = false }) {
  const surface=useRef(null), host=useRef(null), flameTime=useRef(2.7);
  const reduced=useReducedMotion();
  const stopped=externalPaused||reduced;
  useEffect(() => {
    const canvas=surface.current;
    const context=canvas.getContext('2d');
    if(!context)return;
    const texture=document.createElement('canvas');texture.width=160;texture.height=64;
    const ink=texture.getContext('2d');
    const pixels=ink.createImageData(texture.width,texture.height);
    const grid=new Float32Array(128*128);
    let seed=72831;
    for(let index=0;index<grid.length;index++){seed=(seed*1664525+1013904223)>>>0;grid[index]=seed/4294967296;}
    const noise=(x,y)=>{
      const ix=Math.floor(x),iy=Math.floor(y);let fx=x-ix,fy=y-iy;fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy);
      const a=grid[(iy&127)*128+(ix&127)],b=grid[(iy&127)*128+((ix+1)&127)],c=grid[((iy+1)&127)*128+(ix&127)],d=grid[((iy+1)&127)*128+((ix+1)&127)];
      return a+(b-a)*fx+(c-a)*fy+(a-b-c+d)*fx*fy;
    };
    const turbulence=(x,y)=>noise(x,y)*.65+noise(x*2.07,y*2.07)*.35;
    let frame=0,inView=false,disposed=false,last=0;
    const paint=()=>{
      const time=flameTime.current;
      for(let y=0;y<texture.height;y++)for(let x=0;x<texture.width;x++){
        const height=y/texture.height,nx=x/texture.width*10,warp=turbulence(nx*.7,height*2+time*.45);
        const flowing=turbulence(nx+(warp-.5)*2.8,height*1.9+time*1.1),tongues=turbulence(nx*1.4+(warp-.5)*2,height*1.8+time*.85);
        const heat=Math.max(0,Math.min(1,(flowing*.7+tongues*.3+height*.28-.43)*2.15)),at=(y*texture.width+x)*4;
        pixels.data[at]=Math.min(255,heat*640);pixels.data[at+1]=Math.min(255,Math.pow(heat,1.65)*290);pixels.data[at+2]=Math.min(140,Math.pow(heat,4.5)*140);pixels.data[at+3]=255;
      }
      ink.putImageData(pixels,0,0);
      const width=canvas.width,height=canvas.height;context.clearRect(0,0,width,height);context.save();
      context.font=`700 ${height*1.02}px "Manrope", Arial, sans-serif`;
      const metrics=context.measureText('KEMSOR'),textHeight=metrics.actualBoundingBoxAscent+metrics.actualBoundingBoxDescent;
      context.translate(width*.015,(height-textHeight)/2+metrics.actualBoundingBoxAscent);context.scale(width*.97/metrics.width,1);context.fillStyle='#fff';context.fillText('KEMSOR',0,0);context.restore();
      context.globalCompositeOperation='source-in';context.drawImage(texture,0,0,width,height);context.globalCompositeOperation='source-over';canvas.dataset.rendered='true';
    };
    const animate=stamp=>{
      if(disposed||!inView||document.hidden||stopped){frame=0;return;}
      if(stamp-last>=1000/12){flameTime.current+=Math.min((stamp-last)/1000,.09);last=stamp;paint();}
      frame=requestAnimationFrame(animate);
    };
    const sync=()=>{cancelAnimationFrame(frame);frame=0;host.current.dataset.motion=inView&&!document.hidden&&!stopped?'running':'paused';last=performance.now();if(inView&&!document.hidden&&!stopped)frame=requestAnimationFrame(animate);};
    const resize=()=>{const box=canvas.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,1.25);canvas.width=Math.max(1,Math.round(box.width*ratio));canvas.height=Math.max(1,Math.round(box.height*ratio));if(inView)paint();};
    const observer=new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;if(inView){resize();paint();}sync();},{rootMargin:'60px'});
    observer.observe(host.current);const sizes=new ResizeObserver(resize);sizes.observe(canvas);document.addEventListener('visibilitychange',sync);
    document.fonts.load('700 100px "Manrope"').then(()=>{if(!disposed&&inView)resize();});
    return()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();sizes.disconnect();document.removeEventListener('visibilitychange',sync);};
  },[stopped]);
  return <div className="ember-panel ember-wordmark-only" ref={host} data-motion="paused"><div className="ember-wordmark"><span>KEMSOR</span><canvas ref={surface} aria-hidden="true" /></div></div>;
}
