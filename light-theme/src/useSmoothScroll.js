import { useEffect } from 'react';

// Shared desktop wheel easing. Touch, keyboard and nested scrollers stay native.
export default function useSmoothScroll() {
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const fine = matchMedia('(pointer: fine)');
    let frame = 0, target = scrollY, previous = 0;
    const cancel = () => { cancelAnimationFrame(frame); frame = 0; target = scrollY; };
    const limit = () => Math.max(0, document.documentElement.scrollHeight - innerHeight);
    const animate = stamp => {
      const dt = Math.min(48, stamp - previous || 16);
      previous = stamp;
      target = Math.max(0, Math.min(limit(), target));
      const remaining = target - scrollY;
      if (Math.abs(remaining) < 2) { window.scrollTo({ top: target, behavior: 'instant' }); frame = 0; return; }
      window.scrollTo({ top: scrollY + Math.sign(remaining) * Math.max(1, Math.abs(remaining) * (1 - Math.exp(-dt / 95))), behavior: 'instant' });
      frame = requestAnimationFrame(animate);
    };
    const wheel = event => {
      if (reduced.matches || !fine.matches || event.defaultPrevented || !event.cancelable || event.ctrlKey || event.metaKey || event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      if (document.querySelector('dialog[open], .site-header[data-open=true], .site-loading')) return;
      // Forms and independently scrolling menus/dialogs retain their own behavior.
      for (let el = event.target instanceof Element ? event.target : null; el && el !== document.body; el = el.parentElement) {
        if (el.matches('input, textarea, select, [contenteditable=true]')) return;
        if (el.scrollHeight > el.clientHeight + 1 && /auto|scroll/.test(getComputedStyle(el).overflowY)) return;
      }
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
      if (!delta) return;
      if (!frame) target = scrollY;
      target = Math.max(0, Math.min(limit(), target + delta));
      event.preventDefault();
      if (!frame) { previous = performance.now(); frame = requestAnimationFrame(animate); }
    };
    window.addEventListener('wheel', wheel, { passive: false });
    // Stop easing before native navigation, scrolling keys or scrollbar dragging.
    window.addEventListener('pointerdown', cancel, { passive: true });
    window.addEventListener('touchstart', cancel, { passive: true });
    window.addEventListener('keydown', cancel);
    document.addEventListener('click', cancel, true);
    window.addEventListener('popstate', cancel);
    document.addEventListener('visibilitychange', cancel);
    reduced.addEventListener('change', cancel);
    fine.addEventListener('change', cancel);
    return () => {
      cancel();
      window.removeEventListener('wheel', wheel);
      window.removeEventListener('pointerdown', cancel);
      window.removeEventListener('touchstart', cancel);
      window.removeEventListener('keydown', cancel);
      document.removeEventListener('click', cancel, true);
      window.removeEventListener('popstate', cancel);
      document.removeEventListener('visibilitychange', cancel);
      reduced.removeEventListener('change', cancel);
      fine.removeEventListener('change', cancel);
    };
  }, []);
}
