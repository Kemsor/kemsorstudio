import React from 'react';
import {useCookieConsent} from './CookieConsent';
import './cms-video.css';
export default function CmsVideo({entry}){
 const {preferences,openPreferences}=useCookieConsent();
 const src=entry.metadata?.video_url;
 if(!src)return null;
 const external=new URL(src,location.origin).origin!==location.origin;
 const label=entry.metadata.video_caption||entry.title;
 return <figure className="cms-video">{external&&!preferences?.externalMedia?<div className="cms-video-consent">{entry.image_url&&<img src={entry.image_url} alt="" loading="lazy"/>}<p>Allow external media to watch this video.</p><button type="button" onClick={openPreferences}>Video preferences</button></div>:<video key={src} src={src} poster={entry.image_url||undefined} controls playsInline preload="none" aria-label={label}>{entry.metadata.video_captions_url&&<track kind="subtitles" src={entry.metadata.video_captions_url} srcLang={entry.metadata.video_language||'en'} label={(entry.metadata.video_language||'en').toUpperCase()}/>}</video>}<figcaption>{label}</figcaption></figure>;
}
