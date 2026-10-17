import React, { useEffect, useRef, useState } from 'react';
import { useCms } from './CmsContent';
import { CTA } from './PageUI';

const films = [
  { label: 'Story in motion', src: '/assets/hero-films/kemsor-story.mp4', poster: '/assets/hero-films/kemsor-story.jpg' },
  { label: 'Behind the frame', src: '/assets/hero-films/kemsor-production.mp4', poster: '/assets/hero-films/kemsor-production.jpg' },
];

export default function HeroSequence({ motionPaused = false, reduced = false }) {
  const { entries } = useCms();
  const hero = entries.find(entry => entry.type === 'home' && entry.slug === 'home-hero');
  const customTitle = hero?.title && hero.title.toLowerCase() !== 'cinematic production.';
  const customSummary = hero?.summary && hero.summary !== 'Creative vision. From idea to screen.';
  const section = useRef(null);
  const videos = useRef([]);
  const [active, setActive] = useState(0);
  const [requestedPosters, setRequestedPosters] = useState([true, false]);
  useEffect(() => {
    setRequestedPosters(previous => previous.map((value, index) => value || index === active));
  }, [active]);
  const [enabled, setEnabled] = useState(false);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  const [ready, setReady] = useState([false, false]);
  const [failed, setFailed] = useState([false, false]);
  const [saveData, setSaveData] = useState(() => Boolean(navigator.connection?.saveData));
  const prefersReduced = reduced || Boolean(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  const blocked = prefersReduced || motionPaused || saveData;
  const playing = enabled && !paused && !blocked && visible && tabVisible;

  useEffect(() => {
    const connection = navigator.connection;
    const update = () => setSaveData(Boolean(connection?.saveData));
    connection?.addEventListener?.('change', update);
    return () => connection?.removeEventListener?.('change', update);
  }, []);
  useEffect(() => {
    if (blocked) return;
    const timer = setTimeout(() => setEnabled(true), 600);
    return () => clearTimeout(timer);
  }, [blocked]);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .08 });
    observer.observe(section.current);
    const update = () => setTabVisible(!document.hidden);
    update();
    document.addEventListener('visibilitychange', update);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', update); };
  }, []);
  useEffect(() => {
    let cancelled = false;
    videos.current.forEach((film, index) => {
      if (!film) return;
      if (index === active && playing && !failed[index]) {
        film.play().catch(error => { if (!cancelled && error.name !== 'AbortError') setPaused(true); });
      } else film.pause();
    });
    return () => { cancelled = true; videos.current.forEach(film => film?.pause()); };
  }, [active, playing, failed]);
  useEffect(() => {
    if (!playing || failed[active]) return;
    const timer = setTimeout(() => setActive(index => (index + 1) % films.length), 10000);
    return () => clearTimeout(timer);
  }, [active, playing, failed]);

  return <section id="home" ref={section} className="cinema-opening" aria-labelledby="opening-title">
    <div className="opening-films" aria-hidden="true">{films.map((film, index) => <div className="opening-film" key={film.src} data-active={active === index} data-ready={!blocked && ready[index] && !failed[index]}>
      <img src={(requestedPosters[index] || index===active) ? film.poster.replace('.jpg','-960.webp') : undefined} srcSet={(requestedPosters[index] || index===active) ? `${film.poster.replace('.jpg','-640.webp')} 640w, ${film.poster.replace('.jpg','-960.webp')} 960w, ${film.poster.replace('.jpg','-1600.webp')} 1600w` : undefined} sizes="100vw" alt="" width="1280" height="720" loading={index === 0 ? 'eager' : 'lazy'} fetchPriority={index === 0 ? 'high' : 'auto'} decoding="async" />
      <video ref={element => { videos.current[index] = element; }} src={enabled && !blocked && (index === 0 || active === index) ? film.src : undefined} muted loop playsInline preload="none"
        onLoadedMetadata={event => { if (film.startAt && event.currentTarget.currentTime < film.startAt) event.currentTarget.currentTime = film.startAt; }}
        onTimeUpdate={event => {
          if (film.startAt && event.currentTarget.currentTime < film.startAt) event.currentTarget.currentTime = film.startAt;
          if (event.currentTarget.currentTime > (film.startAt || 0) + .12) setReady(previous => previous.map((value, position) => position === index ? true : value));
        }}
        onError={() => setFailed(previous => previous.map((value, position) => position === index ? true : value))} />
    </div>)}</div>
    <div className="opening-shade" aria-hidden="true" />
    <button type="button" className="opening-next-film" onClick={() => { setActive(index => (index + 1) % films.length); setPaused(false); }} aria-label={`Play next hero film: ${films[(active + 1) % films.length].label}`}>
      <b aria-hidden="true">→</b>
    </button>
    <div className="opening-docket"><span><i aria-hidden="true" /> KEMSOR STUDIOS</span><span>STORY. CRAFT. CINEMA.</span></div>
    <div className="opening-copy">
      <p className="opening-eyebrow">FILM &amp; PRODUCTION PARTNER</p>
      <h1 id="opening-title">{customTitle ? hero.title : <><span>From your first page.</span><span>To the <em>big screen.</em></span></>}</h1>
      <p className="opening-description">{customSummary ? hero.summary : 'Creative ambition. Practical production. Kemsor is the studio for the journey in between — from development and financing to the shoot, post and release.'}</p>
      <div className="opening-actions"><CTA href="/script-to-production/">Bring us your story</CTA><a className="opening-watch" href="#showreel"><span aria-hidden="true">▶</span>Watch the showreel</a></div>
    </div>
    <div className="opening-bottom">
      <div className="opening-chapters" role="group" aria-label="Hero film selection">{films.map((film, index) => <button type="button" key={film.label} aria-pressed={active === index} onClick={() => setActive(index)}><span className="opening-chapter-line" aria-hidden="true" />{film.label}</button>)}</div>
      <a className="opening-scroll" href="#studio">Discover the studio <span aria-hidden="true">↓</span></a>
    </div>
    <nav className="journey-router" aria-label="Where are you in the journey?"><p>WHERE ARE YOU IN THE JOURNEY?</p><div>
      <a href="/script-to-production/"><strong>I have a script or idea</strong><span>Script to Production ↗</span></a>
      <a href="#services"><strong>I need a production partner</strong><span>Production services ↓</span></a>
      <a href="/contact/#co-producers"><strong>I’m a financier or platform</strong><span>Business &amp; Partnerships ↗</span></a>
      <a href="/services/#india-production-services"><strong>I’m filming in India</strong><span>India Production Services ↗</span></a>
    </div></nav>
  </section>;
}
