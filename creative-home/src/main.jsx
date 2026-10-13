import React, { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Header from './Header';
import Footer from './Footer';
import { pageInfo } from './pageInfo';
import { useReducedMotion, useReveals } from './useMotion';
import './home.css';
import './theme.css';
import './pages.css';
import './cinema-textures.css';
import { OpeningLoader, TaskLoader } from './Loading';

const routes={
 home:lazy(()=>import('./HomePage')),
 about:lazy(()=>import('./pages/StudioPages').then(module=>({default:module.AboutPage}))),
 services:lazy(()=>import('./pages/ServicesPage').then(module=>({default:module.ServicesPage}))),
 projects:lazy(()=>import('./pages/ProjectsPage').then(module=>({default:module.ProjectsPage}))),
 news:lazy(()=>import('./pages/NewsPage').then(module=>({default:module.NewsPage}))),
 careers:lazy(()=>import('./pages/CareersPage').then(module=>({default:module.CareersPage}))),
 contact:lazy(()=>import('./pages/ContactPage').then(module=>({default:module.ContactPage}))),
};
function shouldShowOpening() {
 const navigation=performance.getEntriesByType('navigation')[0];
 if(navigation?.type==='back_forward')return false;
 if(navigation?.type==='reload')return true;
 try {
  return !document.referrer || new URL(document.referrer).origin!==location.origin;
 } catch { return true; }
}
function PendingPage() {
 const [visible,setVisible]=useState(false);
 useEffect(()=>{
  const timer=setTimeout(()=>setVisible(true),300);
  return()=>clearTimeout(timer);
 },[]);
 return <div className="page-pending" aria-busy="true">{visible&&<TaskLoader label="Opening the next chapter"/>}</div>;
}
function ReadyPage({children,paused,reduced,onReady}) {
 useReveals(paused||reduced);
 useEffect(() => { onReady(); }, [onReady]);
 useEffect(()=>{
  let cancelled=false,frame;
  const scrollToAnchor=()=>{
   let id;
   try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}
   if(!id)return;
   frame=requestAnimationFrame(()=>{if(!cancelled)document.getElementById(id)?.scrollIntoView({behavior:'instant',block:'start'});});
  };
  document.fonts.ready.then(scrollToAnchor);
  return()=>{cancelled=true;cancelAnimationFrame(frame);};
 },[]);
 return children;
}
function App() {
 const requested=document.body.dataset.page||location.pathname.split('/').filter(Boolean)[0]||'home';
 const page=routes[requested]?requested:'home';
 const Page=routes[page];
 const reduced=useReducedMotion();
 const [opening,setOpening]=useState(shouldShowOpening);
 const [ready,setReady]=useState(false);
 const onReady=useCallback(()=>setReady(true),[]);
 const finishOpening=useCallback(()=>setOpening(false),[]);
 useEffect(()=>{
  if(!opening)return;
  const previous=document.body.style.overflow;
  document.body.style.overflow='hidden';
  return()=>{document.body.style.overflow=previous;};
 },[opening]);
 const [paused,setPaused]=useState(()=>{try{return localStorage.getItem('kemsor-motion-paused')==='true';}catch{return false;}});
 const [theme,setTheme]=useState(()=>document.documentElement.dataset.theme||'light');
 useEffect(()=>{
  document.documentElement.dataset.theme=theme;
  document.documentElement.style.colorScheme=theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='dark'?'#10100E':'#ffffff');
  try{localStorage.setItem('kemsor-creative-theme',theme);}catch{}
 },[theme]);
 useEffect(()=>{try{localStorage.setItem('kemsor-motion-paused',String(paused));}catch{}},[paused]);
 useEffect(()=>{
  document.title=pageInfo[page].title;
  document.querySelector('meta[name="description"]')?.setAttribute('content',pageInfo[page].description);
 },[page]);
 return <>{opening&&<OpeningLoader ready={ready} reduced={reduced} onComplete={finishOpening}/>}<div id="top" className={`creative-site site-page-${page}`} data-motion={paused?'paused':'playing'} inert={opening?true:undefined} aria-hidden={opening?true:undefined}>
  <a className="skip-link" href="#main">Skip to content</a>
  <Header page={page} theme={theme} onThemeToggle={()=>setTheme(value=>value==='dark'?'light':'dark')}/>
  <main id="main" tabIndex="-1" className={page==='home'?'':'inner-page'}><Suspense fallback={<PendingPage/>}><ReadyPage paused={paused} reduced={reduced} onReady={onReady}><Page paused={paused||opening} reduced={reduced}/></ReadyPage></Suspense></main>
  <Footer page={page} paused={paused} reduced={reduced} onToggle={()=>setPaused(value=>!value)}/>
 </div></>;
}
createRoot(document.getElementById('root')).render(<App/>);
