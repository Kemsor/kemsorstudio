import RollingLabel from './RollingLabel';
import SiteIcon from './SiteIcon';
import React, { useEffect, useRef, useState } from 'react';
import { useCms } from './CmsContent';
import { CTA } from './PageUI';
import StudioClipViewer from './StudioClipViewer';

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
  const viewer = useRef(null);
  const [expanded, setExpanded] = useState(false);
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
  const playing = enabled && !paused && !blocked && visible && tabVisible && !expanded;

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

  return <><section id="home" ref={section} className="cinema-opening immersive-opening" data-in-view={visible} aria-labelledby="opening-title">
    <div className="opening-screen">
    <div className="opening-films" aria-hidden="true">{films.map((film, index) => <div className="opening-film" key={film.src} data-active={active === index} data-ready={!blocked && ready[index] && !failed[index]}>
      <img src={(requestedPosters[index] || index===active) ? film.poster.replace('.jpg','-960.webp') : undefined} srcSet={(requestedPosters[index] || index===active) ? `${film.poster.replace('.jpg','-640.webp')} 640w, ${film.poster.replace('.jpg','-960.webp')} 960w, ${film.poster.replace('.jpg','-1600.webp')} 1600w` : undefined} sizes="100vw" alt="" width="1280" height="720" loading={index === 0 ? 'eager' : 'lazy'} fetchPriority={index === 0 ? 'high' : 'auto'} decoding="async" />
      <video ref={element => { videos.current[index] = element; }} src={enabled && !blocked && (index === 0 || active === index) ? film.src : undefined} muted loop playsInline preload="none"
        onLoadedMetadata={event => { if (film.startAt && event.currentTarget.currentTime < film.startAt) event.currentTarget.currentTime = film.startAt; }}
        onTimeUpdate={event => {
          if (film.startAt && event.currentTarget.currentTime < film.startAt) event.currentTarget.currentTime = film.startAt;
          if (event.currentTarget.currentTime > (film.startAt || 0) + .12) setReady(previous => previous[index] ? previous : previous.map((value, position) => position === index ? true : value));
        }}
        onError={() => setFailed(previous => previous.map((value, position) => position === index ? true : value))} />
    </div>)}</div>
    <div className="opening-shade" aria-hidden="true" />
    <div className="opening-copy">
      <p className="opening-eyebrow">FILM &amp; PRODUCTION PARTNER</p>
      <h1 id="opening-title">{customTitle ? hero.title : <><span>From your first page.</span><span className="heading-accent">To the <em>big screen.</em></span></>}</h1>
      <p className="opening-description">{customSummary ? hero.summary : 'Creative ambition. Practical production. Kemsor is the studio for the journey in between, from development and financing to the shoot, post and release.'}</p>
      <div className="opening-actions"><CTA href="#work-with-kemsor">Partner with us</CTA><a className="opening-watch" href="#showreel"><RollingLabel>Watch the showreel</RollingLabel></a></div>
    </div>
      <div className="opening-playback-tools" role="group" aria-label="Hero video controls">
        <button type="button" className="opening-next" onClick={() => { setActive(index => (index + 1) % films.length); setPaused(false); }} aria-label={`Play next hero film: ${films[(active + 1) % films.length].label}`}><span>Next</span><SiteIcon name="arrow" size={17} /></button>
        <button type="button" className="opening-fullscreen" onClick={() => viewer.current.open(films[active], videos.current[active]?.currentTime || 0)} aria-label={`View ${films[active].label} fullscreen`} title="Fullscreen video"><SiteIcon name="expand" size={16} /></button>
      </div>
    </div>
  </section><StudioClipViewer ref={viewer} onOpenChange={setExpanded}/></>;
}
