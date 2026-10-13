import React, { useEffect, useRef, useState } from 'react';

const clamp = n => Math.max(0, Math.min(1, n));


export default function Careers() {
  const [open, setOpen] = useState(false);
  const [nearby, setNearby] = useState(false);
  const [portraitReady, setPortraitReady] = useState(false);
  const [modelState, setModelState] = useState('pending');
  const [staticView, setStaticView] = useState(() => matchMedia('(prefers-reduced-motion: reduce), (max-height: 700px), (max-width: 800px)').matches);
  const modelHost = useRef(null);
  const model = useRef(null);
  const section = useRef(null);
  const stage = useRef(null);
  const artwork = useRef(null);
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce), (max-height: 700px), (max-width: 800px)');
    const update = () => setStaticView(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!nearby || staticView) return;
    let cancelled = false;
    let renderer;
    const lost = event => { event.preventDefault(); setModelState('unavailable'); };
    import('./ChairRenderer').then(({ createChairRenderer }) => {
      if (cancelled) return;
      try {
        renderer = createChairRenderer(modelHost.current);
        model.current = renderer;
        modelHost.current.querySelector('canvas').addEventListener('webglcontextlost', lost);
        setModelState('ready');
      } catch { setModelState('unavailable'); }
    }).catch(() => { if (!cancelled) setModelState('unavailable'); });
    return () => {
      cancelled = true;
      modelHost.current?.querySelector('canvas')?.removeEventListener('webglcontextlost', lost);
      renderer?.dispose(); model.current = null;
    };
  }, [nearby, staticView]);

  useEffect(() => {
    const container = section.current;
    const frame = artwork.current;

    let raf = 0;
    let listening = false;
    const paint = () => {
      raf = 0;
      const distance = Math.max(1, container.offsetHeight - stage.current.offsetHeight);
      const progress = clamp(-container.getBoundingClientRect().top / distance);
      // Begin facing away, make one gentle half-turn, then settle into the portrait.
      const turn = clamp((progress - .08) / .57);
      const easedTurn = turn * turn * (3 - 2 * turn);
      const rotation = 180 * (1 - easedTurn);
      const revealProgress = clamp((progress - .65) / .17);
      const reveal = staticView || modelState === 'unavailable' ? 1 : portraitReady ? revealProgress * revealProgress * (3 - 2 * revealProgress) : 0;
      if (!staticView && modelState === 'ready') model.current?.setRotation(rotation);
      frame.style.setProperty('--portrait-reveal', String(reveal));
      frame.dataset.rotation = rotation.toFixed(1);
      frame.dataset.progress = progress.toFixed(3);
      container.dataset.finished = String(reveal > .95);
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(paint); };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setNearby(true);
        if (!listening) { window.addEventListener('scroll', schedule, { passive: true }); listening = true; }
      } else if (listening) { window.removeEventListener('scroll', schedule); listening = false; }
      schedule();
    }, { rootMargin: '200px 0px' });
    observer.observe(container);
    const resize = new ResizeObserver(schedule);
    resize.observe(stage.current);
    window.addEventListener('resize', schedule);

    paint();
    return () => { observer.disconnect(); resize.disconnect(); cancelAnimationFrame(raf); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); };
  }, [portraitReady, modelState, staticView]);

  return <section ref={section} className="careers careers-turn" data-static={staticView || modelState === 'unavailable'} id="careers" aria-labelledby="careers-title">
    <div ref={stage} className="careers-stage">
      <div className="careers-heading">
        <p className="eyebrow">05 / CAREERS AT KEMSOR</p>
        <h2 id="careers-title">For the people<br /><span>behind the frame.</span></h2>
        <p className="careers-intro">Production brings many disciplines together.<br />Find out where yours fits.</p>
        <button type="button" className="careers-button button-cta" aria-expanded={open} aria-controls="career-opportunities" onClick={() => setOpen(!open)}>{open ? 'Close opportunities' : 'View opportunities'} <span className="cta-icon" aria-hidden="true">{open ? '−' : '→'}</span></button>
        <div id="career-opportunities" className="career-opportunities" hidden={!open}>
          <h3>No open roles listed right now.</h3>
          <p>Future opportunities and application details will appear here. Check back for future roles.</p><a className="text-link" href={`${import.meta.env.BASE_URL}careers/`}>Explore careers at Kemsor <span aria-hidden="true">→</span></a>
        </div>
      </div>
      <figure className="chair-scene" aria-label="A director’s chair turns from the back toward the viewer to reveal a woman filmmaker seated in it.">
        <div className="chair-volume-frame" ref={artwork} data-model={modelState}>
          <img className="chair-volume-placeholder" src={nearby ? `${import.meta.env.BASE_URL}assets/careers/turn-back.webp` : undefined} alt="" aria-hidden="true" width="1672" height="941" decoding="async" />
          <div className="chair-webgl" ref={modelHost} />
          <img className="chair-portrait" src={nearby ? `${import.meta.env.BASE_URL}assets/careers/turn-seated.webp` : undefined} alt="" aria-hidden="true" width="1672" height="941" decoding="async" onLoad={event => { event.currentTarget.decode().then(() => setPortraitReady(true)).catch(() => {}); }} />
        </div>
        <figcaption><span className="chair-scroll-hint">A SEAT FOR YOUR NEXT CHAPTER <span aria-hidden="true">↓</span></span><span className="chair-reveal-caption">CREATIVE / PRODUCTION / POST</span></figcaption>
      </figure>
    </div>
  </section>;
}
