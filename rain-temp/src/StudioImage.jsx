import slots from '../../shared/site-image-slots.json';
import {getSiteModule} from './siteContent';
import React from 'react';
import placements from './media-placements.json';
import optimizedImages from './optimized-images.json';
import {optimizedImage} from './image-delivery';
import './studio-image.css';

export function imageIdentity(src=''){
 return String(src).split('?')[0].replace(/-(640|960|1600)(?=\.)/,'').replace(/\.(webp|avif|png|jpe?g)$/i,'');
}
export function placementKey(page,slot,src){return `${page}|${slot}|${imageIdentity(src)}`;}
export function getImagePlacement(mediaSlot,src){
 const pathname=typeof location==='undefined'?'/':location.pathname;
 const page=pathname==='/'?'/':`${pathname.replace(/\/$/,'')}/`;
 const key=placementKey(page,mediaSlot,src);
 return placements[key];
}
export default function StudioImage({mediaSlot,src,srcSet,alt,...props}){
 let replacement=getImagePlacement(mediaSlot,src);
 const pathname=typeof location==='undefined'?'/':location.pathname;
 const page=pathname==='/'?'/':`${pathname.replace(/\/$/,'')}/`;
 const registered=slots[placementKey(page,mediaSlot,src)];
 if(registered){const values=getSiteModule(`images:${encodeURIComponent(page)}`,{});if(Object.hasOwn(values,`${registered.id}.src`)){const next=values[`${registered.id}.src`];replacement=next?{src:next,alt:values[`${registered.id}.alt`]??replacement?.alt??alt}:null;}else if(replacement!==null&&Object.hasOwn(values,`${registered.id}.alt`))replacement={...(replacement||{src}),alt:values[`${registered.id}.alt`]};}

 const audit={'data-media-slot':mediaSlot,'data-media-original':src};
 if(replacement===null)return <span {...audit} className={`studio-image-needed ${props.className||''}`} role="img" aria-label="Provide image"><span>Provide image</span></span>;
 const resolvedSrc=replacement?.src||src;
 const optimized=optimizedImage(resolvedSrc,optimizedImages,import.meta.env.BASE_URL);
 const resolvedSrcSet=optimized?.srcSet||(replacement?replacement.srcSet:srcSet);
 const eager=props.loading==='eager'||props.fetchPriority==='high';
 return <img decoding="async" loading={eager?'eager':'lazy'} {...props} {...audit}
  src={optimized?.src||resolvedSrc} srcSet={resolvedSrcSet}
  sizes={props.sizes||(resolvedSrcSet?(props.fetchPriority==='high'?'100vw':'(max-width: 600px) calc(100vw - 32px), (max-width: 1000px) 70vw, 800px'):undefined)}
  width={props.width||(!props.height?optimized?.width:undefined)} height={props.height||(!props.width?optimized?.height:undefined)}
  alt={replacement?.alt??alt}/>;
}
