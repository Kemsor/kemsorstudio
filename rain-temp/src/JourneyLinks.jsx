import {cmsText} from "./siteContent.js";
import React, { useEffect, useRef, useState } from 'react';
import SiteIcon from './SiteIcon';
import './journey-links.css';

export default function JourneyLinks(){
 const grid = useRef(null);
 const activeLink = useRef(null);
 const [panel, setPanel] = useState(null);
 const positionPanel = link => {
  activeLink.current = link;
  const parent = grid.current.getBoundingClientRect();
  const rect = link.getBoundingClientRect();
  setPanel({x:rect.left-parent.left,y:rect.top-parent.top,width:rect.width,height:rect.height});
 };
 const clearPanel = () => { activeLink.current = null; setPanel(null); };
 useEffect(() => {
  const observer = new ResizeObserver(() => { if(activeLink.current) positionPanel(activeLink.current); });
  observer.observe(grid.current);
  return () => observer.disconnect();
 }, []);
 return <section className="home-journey-section">
    <nav className="footer-journey-links" aria-label="Where are you in the journey?">
      <h2>{cmsText("JourneyLinks","0b162fdc78345179","Where are you in the journey?")}</h2>
      <div ref={grid} className="journey-hover-grid" data-hovering={Boolean(panel)}
       style={panel ? {'--panel-x':`${panel.x}px`,'--panel-y':`${panel.y}px`,'--panel-width':`${panel.width}px`,'--panel-height':`${panel.height}px`} : undefined}
       onPointerLeave={() => { const focused=grid.current.querySelector('a:focus-visible'); if(focused) positionPanel(focused); else clearPanel(); }}
       onBlur={event => {if(!event.currentTarget.contains(event.relatedTarget)) clearPanel();}}>{[
        [cmsText("JourneyLinks","b5fe8376135aa1e6","I have a script or idea"),'/contact/','script',cmsText("JourneyLinks","b34ccacd1612fed7","Develop your story")],
        [cmsText("JourneyLinks","8b86f971c150e0b9","I need a production partner"),'/contact/','film',cmsText("JourneyLinks","05afd7517594d13a","Build the production")],
        [cmsText("JourneyLinks","351e667ef7a2ca24","I’m a financier or platform"),'/contact/','partnership',cmsText("JourneyLinks","ccc873c29a1b198e","Explore a partnership")],
        [cmsText("JourneyLinks","1d8be3e5c7c3cadd","I’m filming in India"),'/contact/','location',cmsText("JourneyLinks","6e5dd1e5ef7e673e","Plan your India shoot")],
      ].map(([label,href,icon,note])=><a href={href} key={label} onPointerEnter={event=>positionPanel(event.currentTarget)} onFocus={event=>positionPanel(event.currentTarget)}><span className="footer-journey-mark" aria-hidden="true"><SiteIcon name={icon} size={21}/></span><span className="footer-journey-copy"><span className="footer-journey-title">{label}</span><span className="footer-journey-note">{note}</span></span></a>)}</div>
    </nav>
</section>;}
