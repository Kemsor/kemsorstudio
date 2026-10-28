import React from 'react';
import SiteIcon from './SiteIcon';
import './journey-router.css';

const routes = [
 {theme:'idea',icon:'script',title:'I have a script or idea',action:'Script to Production',href:'/script-to-production/'},
 {theme:'production',icon:'film',title:'I need a production partner',action:'Production services',href:'#services'},
 {theme:'partnership',icon:'partnership',title:'I’m a financier or platform',action:'Business & Partnerships',href:'/contact/?partner=co-producers'},
 {theme:'india',icon:'location',title:'I’m filming in India',action:'India Production Services',href:'/india-production-services/'},
];
export default function JourneyRouter(){
 return <nav id="journey" className="journey-router" aria-label="Where are you in the journey?">
  <p>WHERE ARE YOU IN THE JOURNEY?</p>
  <div>{routes.map(({theme,icon,title,action,href},index)=><a className={`journey-option journey-option-${theme}`} key={theme} href={href}>
   <span className="journey-card-top"><span className="journey-symbol" aria-hidden="true"><SiteIcon name={icon} size={22}/></span><strong>{title}</strong><span className="journey-number" aria-hidden="true">0{index+1}</span></span>
   <span className="journey-card-action"><span>{action}</span><span className="journey-arrow" aria-hidden="true"><SiteIcon name={theme==='production'?'arrow-down':'arrow-up-right'} size={18}/></span></span>
  </a>)}</div>
 </nav>;
}
