import React, { useEffect, useState } from 'react';

// Only opening assets gate entry. Media errors and slow connections never trap visitors.
export function useOpeningReady() {
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let cancelled = false;
    let completed = 0;
    const cleanup = [];
    const started = performance.now();
    let revealTimer;
    const reveal = () => { if (!cancelled) { setProgress(100); setReady(true); } };
    const assets = [`${import.meta.env.BASE_URL}assets/kemsor-logo.webp`];
    if (location.pathname === import.meta.env.BASE_URL) assets.push(`${import.meta.env.BASE_URL}assets/hero/poster.webp`);
    const total = assets.length;
    const complete = () => {
      if (cancelled) return;
      completed++;
      setProgress(Math.round(completed / total * 100));
      if (completed === total) revealTimer = setTimeout(reveal, Math.max(0, 250 - (performance.now() - started)));
    };
    for (const src of assets) {
      const image = new Image();
      image.onload = image.onerror = complete;
      image.src = src;
      cleanup.push(() => { image.onload = image.onerror = null; });
    }
    const deadline = setTimeout(reveal, 1500);
    return () => { cancelled = true; clearTimeout(deadline); clearTimeout(revealTimer); cleanup.forEach(fn => fn()); };
  }, []);
  return { ready, progress, enter: () => setReady(true) };
}

export default function LoadingScreen({ ready, progress, onEnter }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => setVisible(false), 450);
    return () => clearTimeout(timer);
  }, [ready]);
  if (!visible) return null;
  return <div className={`site-loader ${ready ? 'is-ready' : ''}`} aria-label="Loading Kemsor Studios" aria-hidden={ready || undefined}>
    <img src={`${import.meta.env.BASE_URL}assets/kemsor-logo.webp`} width="110" height="100" alt="" />
    <p className="loader-name">KEMSOR <span>STUDIOS</span></p>
    <p className="loader-caption">EVERY STORY STARTS WITH A MOMENT.</p>
    <div className="loader-progress" role="progressbar" aria-label="Preparing the studio" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{ transform: `scaleX(${progress / 100})` }} /></div>
    <p className="loader-status" role="status">{ready ? 'Welcome to the studio' : 'Preparing your experience'}</p>
    <button type="button" onClick={onEnter} tabIndex={ready ? -1 : 0}>Enter studio <span aria-hidden="true">→</span></button>
  </div>;
}
