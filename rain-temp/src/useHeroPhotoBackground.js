import {useEffect} from 'react';
import './inner-hero-photo-background.css';

// Reuse the rendered/CMS-resolved photograph; no second image mapping to maintain.
export default function useHeroPhotoBackground(enabled){
 useEffect(()=>{
  if(!enabled)return;
  const main=document.getElementById('main');
  if(!main)return;
  function update(){
   for(const hero of main.querySelectorAll('.inner-hero,.page-hero')){
    const image=hero.querySelector('img:not(.cms-hero-image-source)');
    if(!image)continue;
    const src=image.getAttribute('src');
    if(!src)continue;
    const value=`url(${JSON.stringify(new URL(src,location.href).href)})`;
    if(hero.style.getPropertyValue('--hero-background-photo')!==value)hero.style.setProperty('--hero-background-photo',value);
    hero.classList.add('inner-hero-photo-background');
    // Contact sheets remain authored illustrations; single-photo layouts become backgrounds.
    if(hero.querySelector('.post-overview-sheet,.make-contact-sheet'))continue;
    const photographs=hero.classList.contains('studio-opening')?[...hero.querySelectorAll('img:not(.cms-hero-image-source)')]:[image];
    for(const photograph of photographs){
    photograph.classList.add('hero-background-source');
    for(let node=photograph.parentElement;node&&node!==hero;node=node.parentElement){
     if(node.matches('.pl-panorama,.fl-hero-image,.fl-hero-grid,.ep-board,.ep-hero-photo,.ep-image-window,.studio-contact-sheet,.studio-frame-main,.studio-frame-location,.india-hero-visual'))node.classList.add('hero-background-flat');
    }
    }
   }
  }
  update();
  const observer=new MutationObserver(update);
  observer.observe(main,{childList:true,subtree:true,attributes:true,attributeFilter:['src']});
  return()=>observer.disconnect();
 },[enabled]);
}
