import React, { useEffect, useRef, useState } from 'react';
import './director-chair.css';
import { TaskLoader } from './Loading';

const clamp = value => Math.max(0, Math.min(1, value));
const smooth = value => value * value * (3 - 2 * value);
const stillPath = name => `${import.meta.env.BASE_URL}assets/chair/${name}.webp`;

export default function DirectorChair({ paused = false }) {
  const [localPaused, setLocalPaused] = useState(false);
  const [nearby, setNearby] = useState(false);
  const [visible, setVisible] = useState(false);
  const [tabHidden, setTabHidden] = useState(() => document.hidden);
  const [staticScreen, setStaticScreen] = useState(() => matchMedia('(prefers-reduced-motion: reduce), (max-width: 760px)').matches);
  const [modelState, setModelState] = useState('pending');
  const [portraitReady, setPortraitReady] = useState(false);
  const container = useRef(null);
  const artwork = useRef(null);
  const host = useRef(null);
  const model = useRef(null);
  const disabled = paused || localPaused || staticScreen;
  const staticView = disabled || modelState === 'unavailable';

  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce), (max-width: 760px)');
    const update = () => setStaticScreen(query.matches);
    const visibility = () => setTabHidden(document.hidden);
    query.addEventListener('change', update);
    document.addEventListener('visibilitychange', visibility);
    const nearObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setNearby(true);
      nearObserver.disconnect();
    }, { rootMargin: '180px 0px' });
    const viewObserver = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    nearObserver.observe(container.current);
    viewObserver.observe(container.current);
    return () => {
      query.removeEventListener('change', update);
      document.removeEventListener('visibilitychange', visibility);
      nearObserver.disconnect();
      viewObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!nearby || disabled || tabHidden) return;
    let cancelled = false;
    let renderer;
    const target = host.current;
    const lost = event => {
      event.preventDefault();
      setModelState('unavailable');
    };
    setModelState('pending');
    import('./ChairRenderer.js').then(({ createChairRenderer }) => {
      if (cancelled) return;
      try {
        renderer = createChairRenderer(target);
        model.current = renderer;
        target.querySelector('canvas')?.addEventListener('webglcontextlost', lost);
        setModelState('ready');
      } catch {
        setModelState('unavailable');
      }
    }).catch(() => { if (!cancelled) setModelState('unavailable'); });
    return () => {
      cancelled = true;
      target.querySelector('canvas')?.removeEventListener('webglcontextlost', lost);
      renderer?.dispose();
      model.current = null;
    };
  }, [nearby, disabled, tabHidden]);

  useEffect(() => {
    const frame = artwork.current;
    if (staticView) {
      frame.style.setProperty('--director-reveal', '1');
      return;
    }
    if (!visible || tabHidden) return;
    let raf = 0;
    const paint = () => {
      raf = 0;
      const top = container.current.getBoundingClientRect().top;
      const progress = clamp((window.innerHeight * .9 - top) / (window.innerHeight * .72));
      const rotation = 180 * (1 - smooth(clamp(progress / .65)));
      const reveal = portraitReady ? smooth(clamp((progress - .65) / .25)) : 0;
      if (modelState === 'ready') model.current?.setRotation(rotation);
      frame.style.setProperty('--director-reveal', String(reveal));
      frame.dataset.rotation = rotation.toFixed(1);
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(paint); };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    paint();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [staticView, visible, tabHidden, modelState, portraitReady]);

  return <figure className="director-scene" ref={container} data-static={staticView} aria-label="A director’s chair turns to reveal a filmmaker seated in it.">
    <div className="director-frame" ref={artwork} data-model={modelState}>
      <img className="director-placeholder" src={nearby ? stillPath('turn-back') : undefined} width="1672" height="941" alt="" decoding="async" aria-hidden="true" />
      <div className="director-webgl" ref={host} aria-hidden="true" />
      {nearby && !staticView && modelState === 'pending' && <TaskLoader overlay label="Preparing the director’s chair" progress={portraitReady ? 50 : 0} />}
      <img className="director-portrait" src={nearby ? stillPath('turn-seated') : undefined} width="1672" height="941" alt="" decoding="async" aria-hidden="true" onLoad={event => {
        const image = event.currentTarget;
        if (image.decode) image.decode().catch(() => {}).then(() => setPortraitReady(true));
        else setPortraitReady(true);
      }} />
      <span className="director-stage-label">THE DIRECTOR’S CHAIR</span>
      {!staticScreen && <button className="director-pause" type="button" onClick={() => setLocalPaused(value => !value)} aria-label={localPaused ? 'Resume director’s chair motion' : 'Pause director’s chair motion'} aria-pressed={localPaused} disabled={paused}>
        <span aria-hidden="true">{localPaused || paused ? '▶' : 'Ⅱ'}</span>
      </button>}
    </div>
    <figcaption className="director-caption"><span>A SEAT FOR YOUR NEXT CHAPTER</span><span>{staticView ? 'CREATIVE / PRODUCTION / POST' : 'SCROLL TO TURN THE CHAIR'}</span></figcaption>
  </figure>;
}
