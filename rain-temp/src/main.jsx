import React, { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Header from './Header';
import {MemberSessionProvider} from './MemberSession';
import Footer from './Footer';
import ExperienceTools from './ExperienceTools';
import { CmsProvider, CmsPageSections } from './CmsContent';
import { pageInfo } from './pageInfo';
import { useReducedMotion, useReveals } from './useMotion';
import './home.css';
import './theme.css';
import './pages.css';
import './experience.css';
import './workspace-clean.css';
import './design-refinement.css';
import './client-design.css';
import './homepage-direction.css';
import './navbar-showcase.css';
import './sleek-effects.css';
import './color-system.css';
import './footer-cinematic.css';
import './motion-polish.css';
import './readability-fixes.css';
import './typography-scale.css';
import './compact-buttons.css';
import { OpeningLoader, TaskLoader } from './Loading';

if (location.hash === '#home') history.replaceState(history.state, '', `${location.pathname}${location.search}`);
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (!location.hash) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

const routes={
 'find-talent':lazy(()=>import('./pages/TalentPages').then(m=>({default:m.FindTalentPage}))),
 'join':lazy(()=>import('./pages/TalentPages').then(m=>({default:m.JoinPage}))),
 'login':lazy(()=>import('./pages/TalentPages').then(m=>({default:m.LoginPage}))),
 'profile':lazy(()=>import('./pages/TalentPages').then(m=>({default:m.ProfilePage}))),
 'script-to-production':lazy(()=>import('./pages/ProductionTool')),

 home:lazy(()=>import('./HomePage')),
 about:lazy(()=>import('./pages/StudioPages').then(module=>({default:module.AboutPage}))),
 services:lazy(()=>import('./pages/ServicesPage').then(module=>({default:module.ServicesPage}))),
 projects:lazy(()=>import('./pages/ProjectsPage').then(module=>({default:module.ProjectsPage}))),
 news:lazy(()=>import('./pages/NewsPage').then(module=>({default:module.NewsPage}))),
 blog:lazy(()=>import('./pages/BlogPage')),
 legal:lazy(()=>import('./pages/LegalPage')),
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
 const requested=document.body.dataset.page||location.pathname.slice(import.meta.env.BASE_URL.length).split('/').filter(Boolean)[0]||'home';
 const page=routes[requested]?requested:'home';
 const Page=routes[page];
 const formOnly=page==='contact' && ['filmmakers','studios','co-producers','international-productions'].includes(new URLSearchParams(location.search).get('partner'));
 const reduced=useReducedMotion();
 const [opening,setOpening]=useState(()=>!formOnly && shouldShowOpening());
 const [ready,setReady]=useState(false);
 const onReady=useCallback(()=>setReady(true),[]);
 const finishOpening=useCallback(()=>setOpening(false),[]);
 useEffect(()=>{
  if(!opening)return;
  const previous=document.body.style.overflow;
  document.body.style.overflow='hidden';
  return()=>{document.body.style.overflow=previous;};
 },[opening]);
 const paused=false;
 useEffect(()=>{
  if(location.hash)return;
  const reset=()=>window.scrollTo({top:0,left:0,behavior:'instant'});
  reset();
  const frame=requestAnimationFrame(reset);
  return()=>cancelAnimationFrame(frame);
 },[page]);
 useEffect(()=>{
  document.title=pageInfo[page].title;
  document.querySelector('meta[name="description"]')?.setAttribute('content',pageInfo[page].description);
 },[page]);
 return <>{opening&&<OpeningLoader ready={ready} reduced={reduced} onComplete={finishOpening}/>}<div id="top" className={`creative-site site-page-${page}`} data-motion={paused?'paused':'playing'} inert={opening?true:undefined} aria-hidden={opening?true:undefined}>
  <a className="skip-link" href="#main">Skip to content</a>
  <Header page={page}/>
  <main id="main" tabIndex="-1" className={page==='home'?'':'inner-page'}><Suspense fallback={<PendingPage/>}><ReadyPage paused={paused} reduced={reduced} onReady={onReady}><Page paused={paused||opening} reduced={reduced}/>{!formOnly && !['news','blog','contact','careers'].includes(page) && <CmsPageSections page={page}/>}</ReadyPage></Suspense></main>
  <Footer page={page} reduced={reduced}/>
  {!formOnly && <ExperienceTools page={page}/>}
 </div></>;
}
createRoot(document.getElementById('root')).render(<CmsProvider><MemberSessionProvider><App/></MemberSessionProvider></CmsProvider>);
