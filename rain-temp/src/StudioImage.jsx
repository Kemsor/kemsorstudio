import React from 'react';
import placements from './media-placements.json';
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
 const replacement=getImagePlacement(mediaSlot,src);
 const audit={'data-media-slot':mediaSlot,'data-media-original':src};
 if(replacement===null)return <span {...audit} className={`studio-image-needed ${props.className||''}`} role="img" aria-label="Provide image"><span>Provide image</span></span>;
 return <img {...props} {...audit} src={replacement?.src||src} srcSet={replacement?replacement.srcSet:srcSet} alt={replacement?.alt??alt}/>;
}
