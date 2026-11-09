import React,{useRef} from 'react';
import {getSiteModule} from './siteContent';
import './page-transition.css';
export default function PageTransitionLoader({startedAt,leaving=false}){
 const logo=getSiteModule('branding',{}).logo||`${import.meta.env.BASE_URL}assets/kemsor-logo-email.png`;
 const delay=useRef(`-${Math.max(0,Date.now()-startedAt)%1000}ms`);
 return <div className={`page-transition-loader${leaving?' is-leaving':''}`} role="status" aria-live="polite" aria-label="Loading the next page" style={{'--clap-delay':delay.current}}>
  <div className="page-transition-center"><div className="transition-clapper" aria-hidden="true">
   <div className="transition-clapper-lid"><i/></div>
   <div className="transition-clapper-board"><div className="transition-clapper-stripe"/><div className="transition-clapper-brand"><img src={logo} width="64" height="58" alt=""/><span>KEMSOR<small>STUDIOS</small></span></div><div className="transition-clapper-rule"/><p>STORY. CRAFT. CINEMA.</p></div>
  </div><p className="page-transition-caption">Setting the next scene<span aria-hidden="true">…</span></p></div>
 </div>;
}
