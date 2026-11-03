import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createPreferences, parsePreferences, preferenceKey, preferenceLifetime, readPreferences } from './cookiePreferences';
import './cookie-consent.css';

const CookieContext = createContext(null);
const readStored = () => { try { return readPreferences(window.localStorage); } catch { return null; } };
export function CookieConsentProvider({ children }) {
 const [preferences,setPreferences] = useState(readStored);
 const [opened,setOpened] = useState(false);
 const [notice,setNotice] = useState('');
 const openPreferences = useCallback(()=>setOpened(true),[]);
 const savePreferences = useCallback(externalMedia => {
  const record = createPreferences(externalMedia);
  let persisted = true;
  try { window.localStorage.setItem(preferenceKey,JSON.stringify(record)); } catch { persisted=false; }
  setPreferences(record);setOpened(false);
  setNotice(persisted?'Cookie preferences saved.': 'Preferences apply for this visit. Your browser could not save them for future visits.');
 },[]);
 useEffect(()=>{
  const sync = event => {
   try { if(event.storageArea && event.storageArea !== window.localStorage) return; } catch { return; }
   if(event.key === preferenceKey || event.key === null) setPreferences(parsePreferences(event.newValue));
  };
  window.addEventListener('storage',sync);
  return ()=>window.removeEventListener('storage',sync);
 },[]);
 useEffect(()=>{
  if(!preferences)return;
  const expire = () => {if(Date.now()-preferences.savedAt>=preferenceLifetime)setPreferences(null);};
  let timer;
  const schedule = () => {
   const remaining=preferenceLifetime-(Date.now()-preferences.savedAt);
   if(remaining<=0)expire();
   else timer=setTimeout(schedule,Math.min(remaining,2147483647));
  };
  schedule();
  window.addEventListener('focus',expire);
  return ()=>{clearTimeout(timer);window.removeEventListener('focus',expire);};
 },[preferences]);
 return <CookieContext.Provider value={{preferences,opened,setOpened,openPreferences,savePreferences,notice}}>{children}</CookieContext.Provider>;
}
export const useCookieConsent = () => useContext(CookieContext);

export function CookiePreferences({ hidden = false }) {
 const {preferences,opened,setOpened,openPreferences,savePreferences,notice} = useCookieConsent();
 const dialog = useRef(null);
 const opener = useRef(null);
 const [externalMedia,setExternalMedia] = useState(false);
 useEffect(()=>{
  const element = dialog.current;
  if(opened && !hidden) {
   opener.current=document.activeElement;
   setExternalMedia(preferences?.externalMedia===true);
   if(!element.open)element.showModal();
  } else if(element.open) {
   element.close();
   if(opener.current?.isConnected)opener.current.focus();
  }
 },[opened,hidden]);
 // Consent changes in another tab also revoke embeds immediately.
 useEffect(()=>{if(opened)setExternalMedia(preferences?.externalMedia===true);},[preferences,opened]);
 return <>
  {!hidden && !preferences && !opened && <section className="cookie-banner" aria-labelledby="cookie-banner-title" aria-describedby="cookie-banner-description"><div><h2 id="cookie-banner-title">Your privacy choices</h2><p id="cookie-banner-description">Necessary cookies support sign-in, security and forms. With your permission, we also load Google Maps and externally hosted videos, which may use cookies and receive your device information.</p><a href="/privacy-policy/#privacy-section-9">Read our Privacy Policy</a></div><div className="cookie-actions"><button type="button" onClick={()=>savePreferences(false)}>Reject optional</button><button type="button" onClick={()=>savePreferences(true)}>Accept optional</button><button type="button" className="cookie-text-button" onClick={openPreferences}>Manage preferences</button></div></section>}
  <dialog ref={dialog} className="cookie-dialog" aria-labelledby="cookie-preferences-title" aria-describedby="cookie-preferences-description" onCancel={()=>setOpened(false)} onClose={()=>setOpened(false)}>
   <div className="cookie-dialog-heading"><h2 id="cookie-preferences-title">Cookie preferences</h2><button type="button" className="cookie-close" aria-label="Close cookie preferences" onClick={()=>setOpened(false)}>×</button></div>
   <p id="cookie-preferences-description">Choose whether to allow optional external media. You can change your choice at any time using Cookie preferences in the footer.</p>
   <div className="cookie-category"><div><h3>Necessary</h3><p>Required for sign-in, secure sessions and forms. Your preference is stored in this browser for up to 180 days.</p></div><span className="cookie-required">Always active</span></div>
   <div className="cookie-category"><div><h3>External media</h3><p>Allows Google Maps and externally hosted hero videos. These providers may receive your IP address and browser information and use their own cookies when content loads.</p></div><label className="cookie-toggle"><input type="checkbox" checked={externalMedia} onChange={event=>setExternalMedia(event.target.checked)}/><span>Allow external media</span></label></div>
   <p className="cookie-choice-note">Turning this off stops optional maps and videos from loading. It cannot undo information already sent to providers or remove cookies set on their domains.</p>
   <a href="/privacy-policy/#privacy-section-9">Read our Privacy Policy</a>
   <div className="cookie-actions"><button type="button" onClick={()=>savePreferences(false)}>Reject optional</button><button type="button" onClick={()=>savePreferences(true)}>Accept optional</button><button type="button" onClick={()=>savePreferences(externalMedia)}>Save preferences</button></div>
  </dialog>
  <span className="sr-only" role="status">{notice}</span>
 </>;
}

export function ConsentMap({ src, title, ...props }) {
 const { preferences,openPreferences } = useCookieConsent();
 if(preferences?.externalMedia) return <iframe {...props} title={title} src={src}/>;
 return <div className="cookie-map-placeholder"><strong>Find us in Dehradun</strong><p>Allow external media to load Google Maps.</p><button type="button" onClick={openPreferences}>Manage map preferences</button></div>;
}
