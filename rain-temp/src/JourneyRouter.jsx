import React from 'react';
import './journey-router.css';

const routes = [
  { theme:'idea', title:'I have a script or idea', action:'Script to Production ↗', href:'/script-to-production/' },
  { theme:'production', title:'I need a production partner', action:'Production services ↓', href:'#services' },
  { theme:'partnership', title:'I’m a financier or platform', action:'Business & Partnerships ↗', href:'/contact/#co-producers' },
  { theme:'india', title:'I’m filming in India', action:'India Production Services ↗', href:'/services/#india-production-services' },
];
export default function JourneyRouter() {
 return <nav id="journey" className="journey-router" aria-label="Where are you in the journey?">
  <p>WHERE ARE YOU IN THE JOURNEY?</p>
  <div>{routes.map(({theme,title,action,href})=><a className={`journey-option journey-option-${theme}`} key={theme} href={href}><strong>{title}</strong><span>{action.replace(/ ([↗↓])$/, '\u00a0$1')}</span></a>)}</div>
 </nav>;
}
