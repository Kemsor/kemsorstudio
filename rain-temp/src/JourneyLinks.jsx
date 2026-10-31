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
      <h3>Where are you in the journey?</h3>
      <div ref={grid} className="journey-hover-grid" data-hovering={Boolean(panel)}
       style={panel ? {'--panel-x':`${panel.x}px`,'--panel-y':`${panel.y}px`,'--panel-width':`${panel.width}px`,'--panel-height':`${panel.height}px`} : undefined}
       onPointerLeave={() => { const focused=grid.current.querySelector('a:focus-visible'); if(focused) positionPanel(focused); else clearPanel(); }}
       onBlur={event => {if(!event.currentTarget.contains(event.relatedTarget)) clearPanel();}}>{[
        ['I have a script or idea','/contact/','script','Develop your story'],
        ['I need a production partner','/contact/','film','Build the production'],
        ['I’m a financier or platform','/contact/','partnership','Explore a partnership'],
        ['I’m filming in India','/contact/','location','Plan your India shoot'],
      ].map(([label,href,icon,note],index)=><a href={href} key={label} onPointerEnter={event=>positionPanel(event.currentTarget)} onFocus={event=>positionPanel(event.currentTarget)}><span className="footer-journey-mark" aria-hidden="true"><SiteIcon name={icon} size={21}/></span><span className="footer-journey-copy"><span className="footer-journey-title">{label}</span><span className="footer-journey-note">{note}</span></span><span className="footer-journey-number" aria-hidden="true">0{index+1}</span></a>)}</div>
    </nav>
</section>;}
