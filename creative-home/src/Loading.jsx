import React, { useEffect, useRef, useState } from 'react';
import './loading.css';

export function TaskLoader({ progress = 0, label = 'Preparing the next frame', overlay = false }) {
  const value = Math.max(0, Math.min(100, Math.round(progress)));
  return <div className={`task-loader${overlay ? ' task-loader-overlay' : ''}`} role="status">
    <div className="task-loader-copy"><span>{label}</span><strong aria-hidden="true">{String(value).padStart(2, '0')}<small>%</small></strong></div>
    <div className="loading-track" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}><span style={{ width: `${value}%` }} /></div>
    <span className="sr-only">{label}: {value} percent.</span>
  </div>;
}

export function OpeningLoader({ ready, reduced, onComplete }) {
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [letterIndex, setLetterIndex] = useState(0);
  const targetProgress = useRef(0);
  const began = useRef(performance.now());
  const sequenceDuration = reduced ? 360 : 900;
  useEffect(() => {
    const tick = setInterval(() => {
      const elapsed = performance.now() - began.current;
      setLetterIndex(Math.min(5, Math.floor(elapsed / (sequenceDuration / 6))));
      const next = Math.min(targetProgress.current, Math.floor(elapsed / sequenceDuration * 95));
      setProgress(previous => Math.max(previous, next));
    }, 30);
    return () => clearInterval(tick);
  }, [sequenceDuration]);
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    const timers = new Set();
    const delay = ms => new Promise(resolve => { const id = setTimeout(() => { timers.delete(id); resolve(); }, ms); timers.add(id); });
    const settle = promise => Promise.race([promise.catch(() => {}), delay(8000)]);
    async function prepare() {
      // The page module is mounted. Track fonts and eager images, never lazy media.
      targetProgress.current = 20;
      const images = [...document.querySelectorAll('main img:not([loading="lazy"])')];
      const total = images.length + 1;
      let done = 0;
      const finished = () => { if (!cancelled) targetProgress.current = 20 + Math.floor(++done / total * 75); };
      const fonts = settle(document.fonts.ready).then(finished);
      const pictures = images.map(img => settle(img.decode()).then(finished));
      await Promise.all([fonts, ...pictures]);
      await delay(Math.max(0, sequenceDuration - (performance.now() - began.current)));
      if (cancelled) return;
      setProgress(100);
      await delay(reduced ? 80 : 150);
      if (cancelled) return;
      setLeaving(true);
      await delay(reduced ? 0 : 250);
      if (!cancelled) onComplete();
    }
    prepare();
    return () => { cancelled = true; timers.forEach(clearTimeout); };
  }, [ready, reduced, sequenceDuration, onComplete]);
  return <div className={`opening-loader${leaving ? ' is-leaving' : ''}`} role="status" aria-label="Opening Kemsor Studios">
    <div className="opening-center">
      <div className="opening-word" aria-hidden="true"><span key={letterIndex}>{'KEMSOR'[letterIndex]}</span></div>
      <div className="opening-progress" role="progressbar" aria-label="Website preparation" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><strong>{String(progress).padStart(2, '0')}<small>%</small></strong></div>
    </div>
    <span className="sr-only">{progress === 100 ? 'Website ready.' : 'Preparing website.'}</span>
  </div>;
}

// Percentage of the short buffer needed for playback, rather than the whole film.
export function useMediaProgress(media, active) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const node = media.current;
    if (!active || !node) { setProgress(0); return; }
    const update = () => {
      const target = Math.min(3, Number.isFinite(node.duration) ? node.duration - node.currentTime : 3);
      let ahead = 0;
      for (let index = 0; index < node.buffered.length; index++) {
        if (node.buffered.start(index) <= node.currentTime + .1 && node.buffered.end(index) >= node.currentTime) ahead = node.buffered.end(index) - node.currentTime;
      }
      setProgress(node.readyState >= 3 ? 100 : Math.min(99, Math.round(ahead / Math.max(.1, target) * 100)));
    };
    const events = ['progress', 'loadedmetadata', 'loadeddata', 'canplay', 'waiting', 'stalled', 'playing'];
    events.forEach(event => node.addEventListener(event, update));
    update();
    return () => events.forEach(event => node.removeEventListener(event, update));
  }, [media, active]);
  return progress;
}
