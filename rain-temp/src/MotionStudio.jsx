import React, { useEffect, useRef, useState } from 'react';
import './motion.css';

/** A compositor-only motion study. Its animation runs only while it can be seen. */
export default function MotionStudio({ paused: externalPaused = false } = {}) {
  const section = useRef(null);
  const stage = useRef(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const node = section.current;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let inView = false;
    const sync = () => {
      node.dataset.motion = inView && !document.hidden && !externalPaused && !preference.matches ? 'running' : 'paused';
    };
    const updatePreference = () => {
      setReduced(preference.matches);
      sync();
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    }, { threshold: 0.06 });
    observer.observe(node);
    document.addEventListener('visibilitychange', sync);
    preference.addEventListener('change', updatePreference);
    updatePreference();
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
      preference.removeEventListener('change', updatePreference);
    };
  }, [externalPaused]);

  const followFrame = (event) => {
    if (event.pointerType !== 'mouse' || externalPaused || reduced) return;
    const bounds = stage.current.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    stage.current.style.setProperty('--frame-x', `${(x * 12).toFixed(1)}px`);
    stage.current.style.setProperty('--frame-y', `${(y * 12).toFixed(1)}px`);
  };

  const resetFrame = () => {
    stage.current.style.setProperty('--frame-x', '0px');
    stage.current.style.setProperty('--frame-y', '0px');
  };

  return (
    <section className="motion-studio" id="motion-studio" ref={section} data-motion="paused" aria-labelledby="motion-studio-title">
      <div className="motion-editorial">
        <p className="motion-eyebrow"><span aria-hidden="true" /> The art of production</p>
        <h2 id="motion-studio-title">Frame by<br /><em>frame.</em></h2>
        <p className="motion-intro">A location. A performance. A precisely timed cut. Every detail changes the picture.</p>
        <div className="motion-note">
          
          <p>Frames.<br /><strong>One story.</strong></p>
        </div>
      </div>

      <div className="motion-artwork">
        <div className="motion-stage" ref={stage} onPointerMove={followFrame} onPointerLeave={resetFrame}>
          <div className="motion-axis motion-axis-x" aria-hidden="true" />
          <div className="motion-axis motion-axis-y" aria-hidden="true" />
          <div className="motion-orange-frame" aria-hidden="true"><span /></div>
          <div className="motion-outline-frame" aria-hidden="true" />

          <div className="motion-picture">
            <img src="/assets/stills/riders-scene.webp" alt="Horse riders emerging through a misty cinematic scene" width="2048" height="1436" loading="lazy" decoding="async" />
            <div className="motion-picture-shade" aria-hidden="true" />
            <div className="motion-picture-heading" aria-hidden="true"><span>VIEWFINDER</span><span>01 / 24</span></div>
            <div className="motion-focus" aria-hidden="true"><i /><i /><i /><i /><span /></div>
            <div className="motion-scan-line" aria-hidden="true" />
            <div className="motion-picture-bottom" aria-hidden="true"><span className="motion-rec-dot" /> IN THE MAKING<span>24 FPS</span></div>
          </div>

          <div className="motion-registration motion-registration-a" aria-hidden="true"><span /><span /></div>
          <div className="motion-registration motion-registration-b" aria-hidden="true"><span /><span /></div>
          <p className="motion-side-caption" aria-hidden="true">A CHANGE OF PERSPECTIVE</p>
          <div className="motion-sprocket" aria-hidden="true">{Array.from({ length: 9 }, (_, index) => <i key={index} />)}</div>
          <span className="motion-corner-index" aria-hidden="true">K / 01</span>
        </div>

        <div className="motion-control-rail">
          <p><span aria-hidden="true">↳</span> Different angles. One clear vision.</p>
          <div className="motion-playback">
            <span className="motion-status" aria-live="polite">{reduced ? 'Still frame' : externalPaused ? 'Motion off' : 'Motion study'}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
