import {useEffect} from 'react';

// Reveal decorative groups once, after the page and opening sequence are ready.
export default function useThemeMotion(enabled) {
 useEffect(()=>{
  if(!enabled || !('IntersectionObserver' in window))return;
  const selector='.proof-strip>div,.ds-intro,.mw-intro,.final-process ol>li,.script-card,.collaboration-path,.footer-invitation-main,.footer-signup,.footer-journey-links';
  const nodes=[...document.querySelectorAll(selector)];
  const observer=new IntersectionObserver(entries=>{
   entries.forEach(({target,isIntersecting})=>{
    if(!isIntersecting)return;
    target.classList.remove('theme-motion-pending');
    observer.unobserve(target);
   });
  },{threshold:.08,rootMargin:'0px 0px 40px 0px'});
  nodes.forEach(node=>{
   const siblings=[...node.parentElement.children];
   node.style.setProperty('--theme-reveal-delay',`${Math.min(siblings.indexOf(node),3)*85}ms`);
   node.classList.add('theme-motion-reveal');
   if(node.getBoundingClientRect().top>window.innerHeight)node.classList.add('theme-motion-pending');
   observer.observe(node);
  });
  return()=>{observer.disconnect();nodes.forEach(node=>{node.classList.remove('theme-motion-reveal','theme-motion-pending');node.style.removeProperty('--theme-reveal-delay')})};
 },[enabled]);
}
