import { useEffect, useState } from 'react';

export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return reduced;
}

export function useReveals(disabled) {
  useEffect(() => {
    const nodes = [...document.querySelectorAll('[data-reveal]')];
    if (disabled || !('IntersectionObserver' in window)) {
      nodes.forEach(node => node.classList.remove('reveal-waiting'));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.remove('reveal-waiting'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0, rootMargin: '0px 0px 160px 0px' });
    nodes.forEach(node => {
      if (node.getBoundingClientRect().top > window.innerHeight) node.classList.add('reveal-waiting');
      observer.observe(node);
    });
    return () => { observer.disconnect(); nodes.forEach(node => node.classList.remove('reveal-waiting')); };
  }, [disabled]);
}
