import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { IndexLabel } from './PageUI';
import { useReducedMotion } from './useMotion';
import { motionFilms } from './motionFilms';
import './video-showcase.css';
import { TaskLoader, useMediaProgress } from './Loading';

const durationLabel = value => {
  const seconds = Math.round(Number(value));
  return Number.isFinite(seconds) ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}` : '';
};
const ExpandIcon = () => <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 4H4v5m11-5h5v5M4 15v5h5m11-5v5h-5" /></svg>;
const SoundIcon = ({ muted }) => <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4Z" />{muted ? <path d="m16 9 6 6m0-6-6 6" /> : <><path d="M15 8a6 6 0 0 1 0 8" /><path d="M18 5a10 10 0 0 1 0 14" /></>}</svg>;

function FilmCard({ film, index, paused, automaticBlocked, takePlayback, onEnlarge }) {
  const card = useRef(null);
  const video = useRef(null);
  const mounted = useRef(true);
  const wantsPlay = useRef(false);
  const request = useRef(0);
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState('idle');
  const bufferProgress = useMediaProgress(video, loaded && status === 'loading');
  const stop = useCallback(() => {
    wantsPlay.current = false;
    request.current += 1;
    const node = video.current;
    if (node) {
      node.pause();
      try { node.currentTime = 0; } catch { /* Metadata may still be loading. */ }
    }
    if (mounted.current) setStatus('idle');
  }, []);
  const attemptPlay = useCallback(token => {
    const node = video.current;
    if (!node || !wantsPlay.current) return;
    node.muted = true;
    if (node.error) node.load();
    node.play()?.then(() => {
      if (!mounted.current) { node.pause(); return; }
      if (token !== request.current) { if (!wantsPlay.current) node.pause(); return; }
      if (wantsPlay.current && !document.hidden) setStatus('playing');
      else node.pause();
    }).catch(error => {
      if (!mounted.current || token !== request.current || !wantsPlay.current) return;
      wantsPlay.current = false;
      setStatus(error.name === 'AbortError' ? 'idle' : 'error');
    });
  }, []);
  const start = () => {
    if (paused || automaticBlocked || document.hidden || wantsPlay.current) return;
    takePlayback(stop);
    wantsPlay.current = true;
    const token = ++request.current;
    setStatus('loading');
    if (!loaded) setLoaded(true);
    else attemptPlay(token);
  };
  useEffect(() => {
    if (!loaded) return;
    if (wantsPlay.current) attemptPlay(request.current);
    const node = video.current;
    return () => { if (node) { node.pause(); node.removeAttribute('src'); node.load(); } };
  }, [loaded, attemptPlay]);
  useEffect(() => { if (paused || automaticBlocked) stop(); }, [paused, automaticBlocked, stop]);
  useEffect(() => {
    mounted.current = true;
    const observer = new IntersectionObserver(([entry]) => { if (entry.intersectionRatio < .12) stop(); }, { threshold: [0, .12] });
    observer.observe(card.current);
    return () => { mounted.current = false; observer.disconnect(); stop(); };
  }, [stop]);
  const message = status === 'error' ? 'Preview unavailable. Use the corner icon to watch the full film.' : status === 'loading' ? 'Loading preview.' : status === 'playing' ? 'Silent preview in motion.' : 'Use the corner icon to watch the full film with sound.';
  return (
    <article className={`film-desk-card film-desk-card-${index + 1}`} data-film-index={index} ref={card}>
      <div className="film-preview" data-playing={String(status === 'playing')} style={{ '--film-ratio': `${film.width} / ${film.height}` }}
        onPointerEnter={event => { if (event.pointerType === 'mouse') start(); }} onPointerLeave={event => { if (event.pointerType === 'mouse') stop(); }}
        onFocus={event => { if (event.target.matches(':focus-visible')) start(); }} onBlur={stop}>
        <img className="film-preview-poster" src={film.poster} alt="" width={film.width} height={film.height} loading="lazy" decoding="async" />
        {loaded && <video className="film-preview-video" ref={video} src={film.preview} width={film.width} height={film.height} muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1} onWaiting={() => { if (wantsPlay.current) setStatus('loading'); }} onPlaying={() => { if (wantsPlay.current) setStatus('playing'); }} onError={() => { if (wantsPlay.current) { wantsPlay.current = false; setStatus('error'); } }} />}
        {status === 'loading' && <TaskLoader overlay progress={bufferProgress} label="Preparing preview" />}
        <span className="film-preview-shade" aria-hidden="true" />
        
        <button className="film-enlarge" type="button" onClick={event => onEnlarge(film, event.currentTarget)} aria-label={`Enlarge ${film.title}`} aria-describedby={`film-preview-status-${film.id}`} title={`Enlarge ${film.title}`}><span className="film-play-symbol" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m9 5 11 7-11 7Z" fill="currentColor" stroke="none" /></svg></span><span className="film-watch-label">Watch film <span aria-hidden="true">↗</span></span></button>
      </div>
      <div className="film-desk-card-caption"><h3>{film.title}</h3><span>{durationLabel(film.duration)}</span></div>
      <p className="film-desk-description">{film.description}</p>
      <p className="sr-only" id={`film-preview-status-${film.id}`} role="status">{message}</p>
    </article>
  );
}

export default function VideoShowcase({ paused = false, reduced = false } = {}) {
  const systemReduced = useReducedMotion();
  const [saveData, setSaveData] = useState(() => typeof navigator !== 'undefined' && Boolean(navigator.connection?.saveData));
  const [selected, setSelected] = useState(null);
  const [viewerStatus, setViewerStatus] = useState('idle');
  const [viewerMuted, setViewerMuted] = useState(false);
  const [canFullscreen, setCanFullscreen] = useState(false);
  const activePreview = useRef(null);
  const dialog = useRef(null);
  const viewerContent = useRef(null);
  const player = useRef(null);
  const bufferProgress = useMediaProgress(player, Boolean(selected) && viewerStatus === 'loading');
  const opener = useRef(null);
  const fullRequest = useRef(0);
  const resumeOnVisible = useRef(false);
  const stopPreviews = useCallback(() => { activePreview.current?.(); activePreview.current = null; }, []);
  const takePlayback = useCallback(stop => { if (activePreview.current !== stop) activePreview.current?.(); activePreview.current = stop; }, []);
  const releasePlayer = useCallback(() => {
    fullRequest.current += 1;
    resumeOnVisible.current = false;
    const node = player.current;
    if (node) { node.pause(); node.removeAttribute('src'); node.load(); }
  }, []);
  const startFullFilm = useCallback(() => {
    const node = player.current;
    if (!node || document.hidden) return;
    const token = ++fullRequest.current;
    node.play()?.then(() => {
      if (token !== fullRequest.current) return;
      if (document.hidden) node.pause();
      else setViewerStatus('ready');
    }).catch(error => {
      if (token !== fullRequest.current || error.name === 'AbortError') return;
      setViewerStatus(error.name === 'NotAllowedError' ? 'gesture-required' : 'error');
    });
  }, []);
  const finishClose = useCallback(() => {
    releasePlayer();
    setSelected(null);
    setViewerStatus('idle');
    const trigger = opener.current;
    requestAnimationFrame(() => { if (trigger?.isConnected) trigger.focus({ preventScroll: true }); });
  }, [releasePlayer]);
  const closeViewer = useCallback(() => {
    if (document.fullscreenElement === viewerContent.current) document.exitFullscreen()?.catch(() => {});
    releasePlayer();
    if (dialog.current?.open) dialog.current.close();
    else finishClose();
  }, [releasePlayer, finishClose]);
  useEffect(() => {
    const connection = navigator.connection;
    const update = () => setSaveData(Boolean(connection?.saveData));
    update();
    connection?.addEventListener?.('change', update);
    setCanFullscreen(Boolean(document.documentElement.requestFullscreen));
    const onVisibility = () => {
      const node = player.current;
      if (document.hidden) {
        stopPreviews();
        resumeOnVisible.current = Boolean(node && !node.paused);
        node?.pause();
      } else if (resumeOnVisible.current && dialog.current?.open) {
        resumeOnVisible.current = false;
        startFullFilm();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => { connection?.removeEventListener?.('change', update); document.removeEventListener('visibilitychange', onVisibility); stopPreviews(); releasePlayer(); };
  }, [stopPreviews, releasePlayer, startFullFilm]);
  useEffect(() => { if (paused) stopPreviews(); }, [paused, stopPreviews]);
  useLayoutEffect(() => {
    if (!selected || !dialog.current || !player.current) return;
    const node = player.current;
    dialog.current.showModal();
    node.muted = false;
    startFullFilm();
    return () => { fullRequest.current += 1; node.pause(); };
  }, [selected, startFullFilm]);
  const enlarge = (film, trigger) => {
    stopPreviews();
    opener.current = trigger;
    // Commit the player inside the activation gesture so original sound can start on phones too.
    flushSync(() => { setViewerMuted(false); setViewerStatus('loading'); setSelected(film); });
  };
  const toggleFilm = () => {
    const node = player.current;
    if (!node) return;
    if (node.paused) startFullFilm();
    else { fullRequest.current += 1; resumeOnVisible.current = false; node.pause(); }
  };
  const toggleSound = () => {
    const node = player.current;
    if (!node) return;
    node.muted = !node.muted;
    setViewerMuted(node.muted);
    if (node.paused) startFullFilm();
  };
  const fullscreen = () => {
    if (document.fullscreenElement === viewerContent.current) document.exitFullscreen()?.catch(() => setViewerStatus('fullscreen-unavailable'));
    else viewerContent.current?.requestFullscreen?.().catch(() => setViewerStatus('fullscreen-unavailable'));
  };
  const backdropClick = event => {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeViewer();
  };
  return (
    <section className="video-showcase film-gallery" id="films-in-motion" aria-labelledby="video-showcase-title">
      <div className="film-desk-top"><IndexLabel index="03" right="STORIES, SEEN IN MOTION">THE MOVING IMAGE</IndexLabel>
        <div className="film-desk-intro" data-reveal><h2 id="video-showcase-title">Stories that move.<br /><span>Frames that stay.</span></h2><p>The quiet before a scene. The energy inside it.<br />Take a moment. Watch a little closer.</p></div>
      </div>
      <div className="film-gallery-grid" role="region" aria-label={`Explore ${motionFilms.length} films`}>
        {motionFilms.map((film, index) => <FilmCard key={film.id} film={film} index={index} paused={paused} automaticBlocked={reduced || systemReduced || saveData || Boolean(selected)} takePlayback={takePlayback} onEnlarge={enlarge} />)}
      </div>
      <p className="film-gallery-note">A selection of supplied footage and visual references. Production credits are not attributed.</p>
      <dialog className="film-viewer" ref={dialog} aria-labelledby="film-viewer-title" onCancel={event => { event.preventDefault(); closeViewer(); }} onClose={finishClose} onClick={backdropClick}>
        <div className="film-viewer-content" ref={viewerContent}>
        <div className="film-viewer-heading"><div><p>{selected?.kicker || 'IN MOTION'}</p><h3 id="film-viewer-title">{selected?.title || 'Film viewer'}</h3></div><div className="film-viewer-actions"><button type="button" className="film-viewer-close" autoFocus onClick={closeViewer} aria-label="Close film"><span aria-hidden="true">×</span></button></div></div>
        {selected && <div className="film-viewer-screen">
          <video className="film-viewer-video" ref={player} src={selected.src} poster={selected.poster} width={selected.width} height={selected.height} playsInline loop preload="metadata" tabIndex={0} aria-label={selected.title} aria-describedby="film-viewer-hint" onClick={toggleFilm} onKeyDown={event => { if ((event.code === 'Space' || event.key === 'Enter') && !event.repeat) { event.preventDefault(); toggleFilm(); } }} onWaiting={() => setViewerStatus('loading')} onPlaying={() => setViewerStatus('ready')} onLoadedData={() => setViewerStatus(status => status === 'gesture-required' ? status : 'ready')} onPlay={() => { if (document.hidden) player.current?.pause(); else setViewerStatus('ready'); }} onVolumeChange={() => setViewerMuted(Boolean(player.current?.muted))} onError={() => { if (dialog.current?.open) setViewerStatus('error'); }} />
          {viewerStatus === 'loading' && <TaskLoader overlay progress={bufferProgress} label="Buffering film" />}
          <button type="button" className="film-sound-toggle" onClick={toggleSound} aria-label={viewerMuted ? 'Unmute film sound' : 'Mute film sound'} aria-pressed={!viewerMuted} title={viewerMuted ? 'Sound off' : 'Sound on'}><SoundIcon muted={viewerMuted} /></button>
          {canFullscreen && <button type="button" className="film-viewer-fullscreen" onClick={fullscreen} aria-label="Toggle fullscreen" title="Fullscreen"><ExpandIcon /></button>}
        </div>}
        <p className="sr-only" id="film-viewer-hint">Click the film or press Space to toggle playback. Escape closes the enlarged view.</p>
        <div className="film-viewer-footer"><p role="status">{viewerStatus === 'loading' ? 'Loading film…' : viewerStatus === 'gesture-required' ? 'Tap the film to start with sound.' : viewerStatus === 'error' ? 'The film couldn’t load. Close and try again.' : viewerStatus === 'fullscreen-unavailable' ? 'The enlarged view is available here.' : selected?.description}</p><span>{selected && durationLabel(selected.duration)}</span></div>
        </div>
      </dialog>
    </section>
  );
}
