import {useReducedMotion} from './useMotion';
import React from 'react';
import {useCookieConsent} from './CookieConsent';
import {getSiteVideo} from './siteVideo';
export default function ManagedSectionVideo({slot}){
 const reduced=useReducedMotion();const clip=getSiteVideo(slot),{preferences,openPreferences}=useCookieConsent();if(!clip?.enabled)return null;
 const external=new URL(clip.src,location.origin).origin!==location.origin;
 if(external&&!preferences?.externalMedia)return <div className="cms-video-consent"><p>Allow external media to watch {clip.label}.</p><button type="button" onClick={openPreferences}>Video preferences</button></div>;
 return <video key={clip.src} autoPlay={!reduced} muted loop controls playsInline preload="metadata" poster={clip.poster} aria-label={clip.label}><source src={clip.src} type="video/mp4"/>{clip.captions&&<track kind="subtitles" src={clip.captions} srcLang={clip.language} label={clip.language.toUpperCase()}/>}</video>;
}
