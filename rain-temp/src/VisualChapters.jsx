import StudioImage from './StudioImage';
import React,{Children,cloneElement,isValidElement} from 'react';
import {isTextElement} from './TextMotion';
import './visual-chapters.css';
const scenes={
 develop:['development-packaging','daylight-interior-production'],
 'story-script':['daylight-interior-production','development-packaging'],
 'packaging-talent':['pre-production-casting','work-camera-crew'],
 'budgeting-scheduling':['development-packaging','financing-co-production'],
 finance:['financing-co-production','partner-studio'],
 'finance-structuring':['financing-co-production','development-packaging'],
 'co-production':['partner-studio','work-camera-crew'],
 'international-co-productions':['daylight-valley-production','partner-studio'],
 produce:['daylight-park-production','work-camera-crew'],
 'line-production':['daylight-snow-production','work-camera-crew'],
 casting:['pre-production-casting','family-drama-scene'],
 'crew-equipment':['work-camera-crew','work-location-lighting'],
 'locations-logistics':['daylight-valley-production','daylight-park-production'],
 'set-production-design':['courtyard-dance-production','work-period-set'],
 'shooting-on-location':['fort-action-production','work-action-set'],
 'how-we-work':['development-packaging','work-camera-crew'],
 'partner-with-us':['partner-studio','financing-co-production'],
 'what-we-make':['work-period-camera','family-drama-scene'],
 'feature-films':['work-period-camera','work-action-set'],
 'series-ott':['family-drama-scene','work-camera-crew'],
 documentaries:['work-forest-set','daylight-valley-production'],
 'short-films':['work-camera-crew','daylight-interior-production'],
 post:['post-production-release','work-camera-crew'],
 'post-production':['post-production-release','work-period-camera'],
 release:['work-celebration-set','post-production-release'],
 'distribution-release':['post-production-release','partner-studio'],
 'festival-awards':['work-celebration-set','work-period-camera'],
 services:['work-camera-crew','daylight-valley-production'],
 productions:['work-period-set','work-action-set']
};
function has(node,predicate){if(!isValidElement(node))return false;return predicate(node)||Children.toArray(node.props.children).some(child=>has(child,predicate));}
const classes=node=>String(node?.props?.className||'');
export function visualChapter(node,page,index,order=Math.floor(index/2)){
 if(!scenes[page]||!isValidElement(node)||index%2!==0||!has(node,n=>isTextElement(n,'h2')))return node;
 // Forms, FAQs and data tables keep the space they need for interaction and reading.
 if(has(node,n=>['form','table','details','iframe'].includes(n.type)||/Form|Faq|FAQ/.test(n.type?.name||'')||/closing|questions|faq|page-next|partner-route-panel|india-|produce-work|related-work/.test(classes(n))))return node;
 const hasImage=has(node,n=>(n.type==='img'||n.type===StudioImage)||/Gallery|Image|Announcements/.test(n.type?.name||''));
 const dense=has(node,n=>/crafts|review-cards|story-formats|structuring-formats|coproduction-brief|post-overview-stages/.test(classes(n)));
 const direction=order%2===1?'left':'right',dark=direction==='left',image=scenes[page][order%2];
 const video=order===0?({'how-we-work':'studio-film-loop','what-we-make':'creative-film-loop'}[page]):null;
 // Dense lists stay focused on their content; do not append decorative image strips.
 const content=(hasImage||dense)?node.props.children:<div className={`visual-chapter-layout visual-image-${direction}`}><div className="visual-chapter-content">{node.props.children}</div><figure className="visual-chapter-image"><div>{video?<video autoPlay muted loop controls playsInline preload="metadata" aria-label="Supplied studio film clip"><source src={`/assets/supplied/${video}.mp4`} type="video/mp4"/>Your browser does not support video.</video>:<StudioImage mediaSlot={`VisualChapters-${page}-${order}`} src={`/assets/stills/${image}-960.webp`} srcSet={[640,960,1600].map(width=>`/assets/stills/${image}-${width}.webp ${width}w`).join(', ')} sizes="(max-width:900px) 90vw, 40vw" width="960" height="640" alt="Illustrative film production visual" loading="lazy" decoding="async"/>}</div><figcaption><span>STORY. CRAFT. CINEMA.</span><span>ILLUSTRATIVE VISUAL</span></figcaption></figure></div>;
 return cloneElement(node,{className:`${classes(node)} visual-chapter${dark?' visual-chapter-dark':' visual-chapter-light'}${hasImage?' visual-chapter-existing-image':''}${dense?' visual-chapter-dense':''}`},content);
}
export function chapterStyler(page){let order=0;return(node,index)=>{const result=visualChapter(node,page,index,order);if(result!==node)order++;return result;};}
export default function PageVisuals({page,children}){
 let index=0;const styleChapter=chapterStyler(page);
 function walk(node){
  if(!isValidElement(node))return node;
  if(classes(node).split(/\s/).includes('inner-hero'))return node;
  if(node.type==='section')return styleChapter(node,index++);
  if(!node.props.children)return node;
  return cloneElement(node,{},Children.map(node.props.children,walk));
 }
 return walk(Children.only(children));
}
