import React, { useEffect, useRef, useState } from 'react';
import { useCms } from './CmsContent';

export default function HeroSequence({ motionPaused, reduced }) {
  const { entries } = useCms();
  const hero = entries.find(entry => entry.type === 'home' && entry.slug === 'home-hero');
  const section = useRef(null);
  const stage = useRef(null);
  const videos = useRef([]);
  const [active, setActive] = useState(0);
  const [enabled, setEnabled] = useState(false);
  const [secondLoaded, setSecondLoaded] = useState(false);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  const [ready, setReady] = useState([false, false]);
  const [stacked, setStacked] = useState(reduced);
  useEffect(() => {
    const query = matchMedia('(max-height: 600px)');
    const update = () => setStacked(reduced || query.matches);
    update(); query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, [reduced]);
  useEffect(() => {
    if (reduced || motionPaused || navigator.connection?.saveData) return;
    const timer = setTimeout(() => setEnabled(true), 1000);
    return () => clearTimeout(timer);
  }, [reduced, motionPaused]);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const box = section.current.getBoundingClientRect();
      const top = parseFloat(getComputedStyle(stage.current).top) || 0;
      const travel = section.current.offsetHeight - stage.current.offsetHeight;
      const progress = Math.max(0, Math.min(1, (top - box.top) / Math.max(1, travel)));
      const transition = Math.max(0, Math.min(1, (progress - .12) / .6));
      const blend = transition * transition * (3 - 2 * transition);
      stage.current.style.setProperty('--reveal-y', `${100 * (1 - blend)}%`);
      stage.current.style.setProperty('--first-y', `${-20 * blend}%`);
      stage.current.style.setProperty('--first-opacity', `${1 - blend}`);
      const next = stacked ? (box.top + stage.current.offsetHeight < innerHeight * .5 ? 1 : 0) : (transition > .5 ? 1 : 0);
      setActive(next);
      if (transition > .05 || (stacked && next === 1)) setSecondLoaded(true);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); };
  }, [stacked]);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(section.current);
    const update = () => setTabVisible(!document.hidden);
    update(); document.addEventListener('visibilitychange', update);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', update); };
  }, []);
  useEffect(() => {
    let cancelled = false;
    videos.current.forEach((film, index) => {
      if (!film) return;
      if (index === active && enabled && !paused && !motionPaused && visible && tabVisible && !reduced && !navigator.connection?.saveData && (index === 0 || secondLoaded)) {
        if (index === 0 && film.ended) film.currentTime = 0;
        film.play().catch(error => { if (!cancelled && error.name !== 'AbortError') setPaused(true); });
      } else film.pause();
    });
    return () => { cancelled = true; videos.current.forEach(film => film?.pause()); };
  }, [active, enabled, secondLoaded, paused, motionPaused, visible, tabVisible, reduced]);
  const nextFilm = () => {
    setSecondLoaded(true);
    const top = parseFloat(getComputedStyle(stage.current).top) || 0;
    const distance = stacked ? stage.current.offsetHeight : (section.current.offsetHeight - stage.current.offsetHeight) * .75;
    window.scrollTo({ top: window.scrollY + section.current.getBoundingClientRect().top - top + distance, behavior: reduced ? 'instant' : 'smooth' });
  };
  const finishFirstFilm = () => {
    if (active !== 0 || !visible || !tabVisible || paused || motionPaused || reduced) return;
    nextFilm();
  };
  return <section id="home" ref={section} className="cinema-hero-sequence" data-stacked={stacked} aria-label="Kemsor studio reveal and cinematic production">
    <div ref={stage} className="cinema-hero-stage">
      {[0, 1].map(index => <div key={index} className={`cinema-hero cinema-hero-chapter chapter-${index}`} data-ready={ready[index]} aria-hidden={!stacked && active !== index} inert={!stacked && active !== index ? true : undefined}>
        <div className="cinema-hero-media" aria-hidden="true">
          <img src={index === 0 ? '/assets/hero-films/studio-intro.jpg' : '/assets/hero-films/martial-arts.jpg'} width="1280" height="720" alt="" loading={index === 0 ? 'eager' : 'lazy'} fetchPriority={index === 0 ? 'high' : 'auto'} decoding="async" />
          <video ref={element => { videos.current[index] = element; }} src={enabled && (index === 0 || secondLoaded) ? (index === 0 ? '/assets/hero-films/studio-intro.mp4' : '/assets/hero-films/martial-arts.mp4') : undefined} muted loop={index === 1} playsInline preload={index === 1 && secondLoaded ? 'auto' : 'none'} onTimeUpdate={index === 0 ? event => { const film = event.currentTarget; if (!secondLoaded && film.duration - film.currentTime <= 3) setSecondLoaded(true); } : undefined} onEnded={index === 0 ? finishFirstFilm : undefined} onLoadedData={() => setReady(previous => previous.map((value, position) => position === index ? true : value))} onError={() => setPaused(true)} />
        </div>
        <div className="cinema-hero-shade" aria-hidden="true" />
        <div className="cinema-hero-docket"><span><i /> KEMSOR STUDIOS</span><span>{index === 0 ? 'THE STUDIO REVEAL' : 'FILM. SERIES. DOCUMENTARIES.'}</span></div>
        {index === 1 && <div className="cinema-hero-copy">
          <p className="cinema-hero-side cinema-hero-side-left">{hero && hero.summary !== 'Creative vision. From idea to screen.' ? <span>{hero.summary}</span> : <><strong>Creative vision.</strong><span>From idea to screen.</span></>}</p>
          <h1 className={hero && hero.title.toLowerCase() !== 'cinematic production.' ? 'cms-hero-title' : ''}>{hero && hero.title.toLowerCase() !== 'cinematic production.' ? hero.title : <>CINEMATIC<br /><span>PRODUCTION.</span></>}</h1>
          <p className="cinema-hero-side cinema-hero-side-right"><strong>Kemsor Studios</strong><span>Film. Series. Documentaries.</span></p>
        </div>}
        <div className="cinema-hero-bottom">
          {index === 0 ? <button type="button" className="cinema-hero-scroll" onClick={nextFilm}>SCROLL TO THE NEXT FILM <span aria-hidden="true">↓</span></button> : <a href="#studio" className="cinema-hero-scroll">MEET THE STUDIO <span aria-hidden="true">↓</span></a>}
          <button className="cinema-hero-playback" type="button" disabled={reduced || motionPaused} onClick={() => { setEnabled(true); setPaused(value => !value); }} aria-label={paused ? 'Play hero film' : 'Pause hero film'} aria-pressed={paused || motionPaused || reduced}><span aria-hidden="true">{paused || motionPaused || reduced ? '▶' : 'Ⅱ'}</span><span>{reduced || motionPaused ? 'STILL FRAME' : paused ? 'PLAY FILM' : 'PAUSE FILM'}</span></button>
        </div>
      </div>)}
    </div>
  </section>;
}
