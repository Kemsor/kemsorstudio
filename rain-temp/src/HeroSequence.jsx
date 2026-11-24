import originalSlides from '../../shared/hero-slides.json';
import {useCookieConsent} from './CookieConsent';
import StudioImage from './StudioImage';
import RollingLabel from './RollingLabel';
import SiteIcon from './SiteIcon';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useCms } from './CmsContent';
import { CTA } from './PageUI';
import StudioClipViewer from './StudioClipViewer';
import {heroSwipeDirection} from './hero-swipe';
import './hero-swipe.css';

const localAsset=value=>value?.startsWith('/')&&!value.startsWith('//')&&!(import.meta.env.BASE_URL!=='/'&&value.startsWith(import.meta.env.BASE_URL))?`${import.meta.env.BASE_URL}${value.slice(1)}`:value;
export default function HeroSequence(props) {
 const {heroSlides}=useCms();
 const {preferences,openPreferences}=useCookieConsent();
 const availableSlides=Array.isArray(heroSlides)&&heroSlides.length?heroSlides:originalSlides;
 const slides=availableSlides.slice(-2);
 const external=value=>value&&new URL(value,location.origin).origin!==location.origin;
 const films=slides.map(record=>{
  // A published CMS record may still reference the earlier bundled films.
  const replacement=originalSlides.find(item=>item.previousSrc && localAsset(item.previousSrc)===localAsset(record.src));
  const previousPoster=replacement?.previousSrc.replace('.mp4','-960.webp');
  const slide=replacement && localAsset(previousPoster)===localAsset(record.poster)
   ? {...record,src:replacement.src,poster:replacement.poster,posterSrcSet:replacement.posterSrcSet}
   : record;
  const requiresConsent=Boolean((external(slide.src)||external(slide.poster))&&!preferences?.externalMedia);
  const poster=requiresConsent&&external(slide.poster)?originalSlides[0].poster:slide.poster;
  const original = originalSlides.find(item => localAsset(item.src) === localAsset(slide.src));
  const preview = !requiresConsent && original?.preview && (slide.startAt || 0) === 0 && (slide.duration || 5) <= 5 ? localAsset(original.preview) : undefined;
  return {...slide,requiresConsent,preview,src:requiresConsent?'':localAsset(slide.src),poster:localAsset(poster),posterSrcSet:requiresConsent?'':(slide.posterSrcSet||'').split(', ').filter(Boolean).map(source=>{const [url,width]=source.split(' ');return `${localAsset(url)} ${width}`;}).join(', ')};
 });
 return <HeroPlayback key={JSON.stringify(films)} {...props} films={films} openPreferences={openPreferences}/>;
}
function HeroPlayback({ motionPaused = false, reduced = false,films,openPreferences }) {
  const { entries } = useCms();
  const hero = entries.find(entry => entry.type === 'home' && (entry.metadata?.home_slot==='hero'||entry.slug === 'home-hero'));
  const customTitle = hero?.title && hero.title.toLowerCase() !== 'cinematic production.';
  const customSummary = hero?.summary && hero.summary !== 'Creative vision. From idea to screen.';
  const section = useRef(null);
  const videos = useRef([]);
  const viewer = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [active, setActive] = useState(0);
  const [outgoing, setOutgoing] = useState(null);
  const gesture=useRef(null);
  const [dragging,setDragging]=useState(false);
  const advance = useCallback((direction=1) => {
    if(films.length<2)return;
    const next = (active + direction + films.length) % films.length;
    setReady(previous => previous.map((value, index) => index === next ? false : value));
    setOutgoing(active);
    setActive(next);
  }, [active,films.length]);
  useEffect(() => {
    if (outgoing === null) return;
    const timer = setTimeout(() => setOutgoing(null), 1100);
    return () => clearTimeout(timer);
  }, [outgoing, active]);
  const [requestedPosters, setRequestedPosters] = useState(() => films.map((_, index) => index === 0));
  const [firstPosterSettled, setFirstPosterSettled] = useState(false);
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    setRequestedPosters(previous => previous.map((value, index) => value || index === active || (enabled && index === (active + 1) % films.length)));
  }, [active, enabled, films.length]);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  const [ready, setReady] = useState(() => films.map(() => false));
  const [failed, setFailed] = useState(() => films.map(() => false));
  const [saveData, setSaveData] = useState(() => Boolean(navigator.connection?.saveData));
  const prefersReduced = reduced || Boolean(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  const blocked = prefersReduced || motionPaused || saveData;
  const playing = enabled && !paused && !blocked && visible && tabVisible && !expanded && !dragging;

  const resetDrag=()=>{
    gesture.current=null;setDragging(false);
    section.current?.style.setProperty('--hero-drag-offset','0px');
  };
  const startDrag=event=>{
    if(!event.isPrimary){resetDrag();return;}
    if(films.length<2||expanded||!matchMedia('(max-width:1024px)').matches||!['touch','pen'].includes(event.pointerType))return;
    if(event.target.closest('a,button,input,select,textarea,[role=button]'))return;
    gesture.current={id:event.pointerId,x:event.clientX,y:event.clientY,horizontal:false};
  };
  const moveDrag=event=>{
    const start=gesture.current;if(!start||start.id!==event.pointerId)return;
    const dx=event.clientX-start.x,dy=event.clientY-start.y;
    if(!start.horizontal){
      if(Math.max(Math.abs(dx),Math.abs(dy))<10)return;
      if(Math.abs(dx)<Math.abs(dy)*1.3){resetDrag();return;}
      start.horizontal=true;setDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    if(!prefersReduced)section.current.style.setProperty('--hero-drag-offset',`${Math.max(-32,Math.min(32,dx*.15))}px`);
  };
  const endDrag=event=>{
    const start=gesture.current;
    if(start?.id===event.pointerId&&start.horizontal){
      const direction=heroSwipeDirection(event.clientX-start.x,event.clientY-start.y,section.current.clientWidth);
      if(direction)advance(direction);
    }
    resetDrag();
  };

  useEffect(() => {
    const connection = navigator.connection;
    const update = () => setSaveData(Boolean(connection?.saveData));
    connection?.addEventListener?.('change', update);
    return () => connection?.removeEventListener?.('change', update);
  }, []);
  useEffect(() => {
    if (blocked || (!firstPosterSettled && films[0].poster)) return;
    const timer = setTimeout(() => setEnabled(true), 1500);
    return () => clearTimeout(timer);
  }, [blocked, firstPosterSettled, films[0].poster]);
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
      if ((index === active || index === outgoing) && playing && !failed[index]) {
        film.play().catch(error => { if (!cancelled && error.name !== 'AbortError') setPaused(true); });
      } else film.pause();
    });
    return () => { cancelled = true; videos.current.forEach(film => film?.pause()); };
  }, [active, outgoing, playing, failed]);
  useEffect(() => {
    if (!playing || !ready[active] || failed[active]) return;
    const timer = setTimeout(advance, (films[active].duration||5)*1000);
    return () => clearTimeout(timer);
  }, [advance, active, playing, failed, ready, films]);

  return <><section id="home" ref={section} className="cinema-opening immersive-opening" data-in-view={visible} data-dragging={dragging} aria-labelledby="opening-title"
    onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={resetDrag} onLostPointerCapture={event=>{if(event.target===event.currentTarget)resetDrag();}}>
    <div className="opening-screen">
    <div className="opening-films" aria-hidden="true">{films.map((film, index) => <div className="opening-film" key={film.id||film.slug||index} data-active={active === index} data-outgoing={outgoing === index} data-entering={active === index && outgoing !== null} data-ready={!blocked && ready[index] && !failed[index]}>
      {(requestedPosters[index] || index === active) && <StudioImage mediaSlot="HeroSequence-1" src={film.poster} srcSet={film.posterSrcSet || undefined} sizes="100vw" alt="" width="1280" height="720" loading={index === 0 ? 'eager' : 'lazy'} fetchPriority={index === 0 ? 'high' : 'low'} decoding="async"
        onLoad={index === 0 ? () => setFirstPosterSettled(true) : undefined} onError={index === 0 ? () => setFirstPosterSettled(true) : undefined} />}
      <video ref={element => { videos.current[index] = element; }} src={film.src && enabled && !blocked && (active === index || outgoing === index) ? (film.preview || film.src) : undefined} muted loop playsInline preload="none"
        onLoadedMetadata={event => { if (film.startAt && event.currentTarget.currentTime < film.startAt) event.currentTarget.currentTime = film.startAt; }}
        onTimeUpdate={event => {
          if (film.startAt && event.currentTarget.currentTime < film.startAt) event.currentTarget.currentTime = film.startAt;
          if (event.currentTarget.currentTime > (film.startAt || 0) + .12) setReady(previous => previous[index] ? previous : previous.map((value, position) => position === index ? true : value));
        }}
        onError={() => setFailed(previous => previous.map((value, position) => position === index ? true : value))} />
    </div>)}</div>
    <div className="opening-shade" aria-hidden="true" />
    <div className="opening-copy">
      <p className="opening-eyebrow">{films[active].eyebrow||'FILM & PRODUCTION PARTNER'}</p>
      <h1 id="opening-title">{films[active].title || (customTitle ? hero.title : <><span>From your first page.</span><span className="heading-accent">To the <em>big screen.</em></span></>)}</h1>
      <p className="opening-description">{films[active].description || (customSummary ? hero.summary : 'Creative ambition. Practical production. Kemsor is the studio for the journey in between, from development and financing to the shoot, post and release.')}</p>
      <div className="opening-actions"><CTA href={localAsset(films[active].buttonHref)||"/partner-with-us/"}>{films[active].buttonLabel||'Partner with us'}</CTA><a className="opening-watch" href="#showreel"><RollingLabel>Watch the showreel</RollingLabel></a></div>
    </div>
      <div className="opening-playback-tools" role="group" aria-label="Hero video controls">
        <button type="button" className="opening-next" disabled={films.length<2} onClick={() => { advance(); setPaused(false); }} aria-label={`Play next hero film: ${films[(active + 1) % films.length].label}`}><span>Next</span><SiteIcon name="arrow" size={17} /></button>
        {films[active].src&&<button type="button" className="opening-fullscreen" onClick={() => viewer.current.open(films[active], videos.current[active]?.currentTime || 0)} aria-label={`View ${films[active].label} fullscreen`} title="Fullscreen video"><SiteIcon name="expand" size={16} /></button>}
        {films[active].requiresConsent&&<button type="button" onClick={openPreferences}>Video preferences</button>}
      </div>
    </div>
  </section><StudioClipViewer ref={viewer} onOpenChange={setExpanded}/></>;
}
