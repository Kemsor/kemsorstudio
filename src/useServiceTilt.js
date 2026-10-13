import { useEffect } from 'react';

// One scroll read/write per frame, only while service cards are nearby.
export default function useServiceTilt(ref) {
  useEffect(() => {
    const root = ref.current;
    const cards = [...root.querySelectorAll('.capability-chapter')];
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const nearby = new Set();
    let frame = 0, listening = false;
    const paint = () => {
      frame = 0;
      const limit = innerWidth <= 600 ? 3 : innerWidth <= 900 ? 6 : 10;
      const updates = cards.map(card => {
        const art = card.querySelector('.capability-art');
        // Measure the layout box, not the rotated image, to avoid feedback.
        const top = card.getBoundingClientRect().top + art.offsetTop;
        const progress = Math.max(0, Math.min(1, (innerHeight * .82 - top) / (innerHeight * .65)));
        const eased = progress * progress * (3 - 2 * progress);
        return [art, motion.matches ? 0 : eased * limit];
      });
      updates.forEach(([art, angle]) => art.style.setProperty('--service-tilt', `${angle.toFixed(3)}deg`));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };
    const sync = () => {
      const shouldListen = nearby.size > 0 && !motion.matches && !document.hidden;
      if (shouldListen && !listening) window.addEventListener('scroll', schedule, { passive: true });
      if (!shouldListen && listening) window.removeEventListener('scroll', schedule);
      listening = shouldListen;
      schedule();
    };
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) nearby.add(entry.target); else nearby.delete(entry.target);
      });
      sync();
    }, { rootMargin: '150px' });
    cards.forEach(card => observer.observe(card));
    const size = new ResizeObserver(schedule); size.observe(root);
    motion.addEventListener('change', sync);
    window.addEventListener('resize', schedule);
    document.addEventListener('visibilitychange', sync);
    paint();
    return () => {
      cancelAnimationFrame(frame); observer.disconnect(); size.disconnect();
      window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule);
      motion.removeEventListener('change', sync); document.removeEventListener('visibilitychange', sync);
    };
  }, [ref]);
}
