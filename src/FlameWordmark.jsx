import React, { useEffect, useRef, useState } from 'react';

// An original moving fire texture, clipped to crisp, locally hosted letterforms.
// No video download or audio track is needed for the effect.
export default function FlameWordmark() {
  const canvas = useRef(null);
  const section = useRef(null);
  const flameTime = useRef(2.7);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    const surface = canvas.current;
    const ctx = surface.getContext('2d');
    if (!ctx) return;
    const fire = document.createElement('canvas');
    fire.width = 420; fire.height = 160;
    const ink = fire.getContext('2d');
    const pixels = ink.createImageData(fire.width, fire.height);
    const grid = new Float32Array(256 * 256);
    // Deterministic noise keeps the initial still identical across devices.
    let seed = 72831;
    for (let i = 0; i < grid.length; i++) { seed = (seed * 1664525 + 1013904223) >>> 0; grid[i] = seed / 4294967296; }
    const noise = (x, y) => {
      const ix = Math.floor(x), iy = Math.floor(y);
      let fx = x - ix, fy = y - iy;
      fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
      const a = grid[(iy & 255) * 256 + (ix & 255)];
      const b = grid[(iy & 255) * 256 + ((ix + 1) & 255)];
      const c = grid[((iy + 1) & 255) * 256 + (ix & 255)];
      const d = grid[((iy + 1) & 255) * 256 + ((ix + 1) & 255)];
      return a + (b-a)*fx + (c-a)*fy + (a-b-c+d)*fx*fy;
    };
    const turbulence = (x,y) => noise(x,y)*.58 + noise(x*2.07,y*2.07)*.28 + noise(x*4.13,y*4.13)*.14;
    let raf = 0, nearby = false, disposed = false, last = 0, time = flameTime.current;
    const paint = () => {
      for (let y = 0; y < fire.height; y++) {
        const height = y / fire.height;
        for (let x = 0; x < fire.width; x++) {
          const nx = x / fire.width * 10;
          const warp = turbulence(nx*.7, height*2 + time*.45);
          const flowing = turbulence(nx + (warp-.5)*2.8, height*1.9 + time*1.1);
          const tongues = turbulence(nx*1.4 + (warp-.5)*2, height*1.8 + time*.85);
          const heat = Math.max(0, Math.min(1, (flowing*.7 + tongues*.3 + height*.28 - .43)*2.15));
          const at = (y * fire.width + x)*4;
          pixels.data[at] = Math.min(255, heat*640);
          pixels.data[at+1] = Math.min(255, Math.pow(heat,1.65)*290);
          pixels.data[at+2] = Math.min(140, Math.pow(heat,4.5)*140);
          pixels.data[at+3] = 255;
        }
      }
      ink.putImageData(pixels,0,0);
      const w = surface.width, h = surface.height;
      ctx.clearRect(0,0,w,h);
      ctx.save();
      ctx.font = `400 ${h*1.15}px "Bebas Neue", Impact, sans-serif`;
      const metrics = ctx.measureText('KEMSOR');
      const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
      ctx.translate(w*.015, (h-textHeight)/2 + metrics.actualBoundingBoxAscent);
      ctx.scale(w*.97/metrics.width,1);
      ctx.fillStyle = '#fff';
      ctx.fillText('KEMSOR',0,0);
      ctx.restore();
      ctx.globalCompositeOperation = 'source-in';
      ctx.drawImage(fire,0,0,w,h);
      ctx.globalCompositeOperation = 'source-over';
      surface.dataset.rendered = 'true';
    };
    const frame = stamp => {
      if (disposed || !nearby || document.hidden || paused || reduced) { raf = 0; return; }
      if (stamp-last >= 1000/24) { time += Math.min((stamp-last)/1000,.06); last=stamp; flameTime.current=time; paint(); }
      raf=requestAnimationFrame(frame);
    };
    const resume = () => {
      if (raf) cancelAnimationFrame(raf);
      raf=0;last=performance.now();
      if (nearby && !document.hidden && !paused && !reduced) raf=requestAnimationFrame(frame);
    };
    const resize = () => {
      const box = surface.getBoundingClientRect();
      const ratio = Math.min(devicePixelRatio || 1,2);
      surface.width = Math.round(box.width*ratio);
      surface.height = Math.round(box.height*ratio);
      paint();
    };
    const observer = new IntersectionObserver(([entry])=>{nearby=entry.isIntersecting;resume();},{rootMargin:'80px'});
    observer.observe(section.current);
    const sizes = new ResizeObserver(resize); sizes.observe(surface);
    document.addEventListener('visibilitychange',resume);
    document.fonts.load('400 100px "Bebas Neue"').then(()=>{if(!disposed)resize();});
    resize();
    return ()=>{disposed=true;cancelAnimationFrame(raf);observer.disconnect();sizes.disconnect();document.removeEventListener('visibilitychange',resume);};
  }, [paused,reduced]);
  return <section className="flame-section" ref={section} aria-labelledby="flame-title">
    <div className="flame-heading"><p className="eyebrow">EVERY GREAT STORY STARTS WITH A SPARK.</p>{!reduced && <button type="button" onClick={()=>setPaused(!paused)} aria-label={paused?'Play flame animation':'Pause flame animation'}>{paused?'▶ PLAY':'Ⅱ PAUSE'} <span>FLAMES</span></button>}</div>
    <h2 id="flame-title" className="flame-wordmark"><span className="flame-fallback">KEMSOR</span><canvas ref={canvas} aria-hidden="true"/></h2>
    <div className="flame-caption"><span>BRING THE IDEA.</span><span>LET’S MAKE IT BURN BRIGHT.</span></div>
  </section>;
}
