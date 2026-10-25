import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import './smooth-scroll.css';

// Smooth wheel input on desktop while keeping the actual document scroll position.
// Native touch, keyboard, nested panels and reduced-motion scrolling are preserved.
export function useSmoothScroll(disabled) {
  useEffect(() => {
    if (disabled) return;
    const pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    let cleanup;
    const connect = () => {
      cleanup?.();
      cleanup = undefined;
      if (!pointer.matches) return;
      const lenis = new Lenis({
        autoRaf: true,
        lerp: 0.085,
        wheelMultiplier: 0.8,
        smoothWheel: true,
        syncTouch: false,
        anchors: true,
        prevent: node => node.matches?.('dialog, textarea, select, .creative-nav, .creative-dropdown, [data-lenis-prevent]'),
      });
      // Pinned visuals use the same scroll frame rather than trailing the
      // document by another animation frame.
      const syncVisuals = () => window.dispatchEvent(new Event('kemsor:smooth-scroll'));
      lenis.on('scroll', syncVisuals);
      // Existing drawers and dialogs lock body scrolling. Stop inertia immediately
      // when they open so the background cannot continue drifting underneath.
      const syncLock = () => {
        const locked = document.body.style.overflow === 'hidden' || Boolean(document.querySelector('dialog[open]'));
        if (locked && !lenis.isStopped) lenis.stop();
        else if (!locked && lenis.isStopped) lenis.start();
      };
      const observer = new MutationObserver(syncLock);
      observer.observe(document.body, { attributes: true, attributeFilter: ['style'] });
      observer.observe(document.documentElement, { subtree: true, attributes: true, attributeFilter: ['open'] });
      syncLock();
      cleanup = () => { observer.disconnect(); lenis.off('scroll', syncVisuals); lenis.destroy(); };
    };
    connect();
    pointer.addEventListener('change', connect);
    return () => { pointer.removeEventListener('change', connect); cleanup?.(); };
  }, [disabled]);
}
