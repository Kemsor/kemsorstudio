import React, { useRef, useState } from 'react';
import SiteIcon from './SiteIcon';
import JourneyArtwork from './JourneyArtwork';
import './production-journey.css';

export default function ProductionJourney({ steps, exploreLabel }) {
  const [active, setActive] = useState(0);
  const tabs = useRef([]);
  const stages = Array.from(steps);

  function navigate(event, index) {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % stages.length;
    if (event.key === 'ArrowLeft') next = (index + stages.length - 1) % stages.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = stages.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    setActive(next);
    tabs.current[next]?.focus({ preventScroll: true });
  }

  return <div className="production-journey">
    <div className="journey-stage-tabs" role="tablist" aria-label="Production journey">
      {stages.map(([title, , path], index) => <button
        key={path} ref={el => { tabs.current[index] = el; }} type="button" role="tab" style={{ '--stage-rise': index }}
        id={`journey-tab-${path}`} data-stage={path} aria-selected={active === index} aria-controls={`journey-panel-${path}`}
        tabIndex={active === index ? 0 : -1} onFocus={() => setActive(index)} onClick={() => setActive(index)}
        onPointerEnter={event => { if (event.pointerType === 'mouse') setActive(index); }}
        onKeyDown={event => navigate(event, index)}
      ><span>{title}</span><SiteIcon name="arrow-up-right" size={18} /></button>)}
    </div>
    <div className="journey-stage-display">
      {stages.map(([title, copy, path], index) => <div key={path} className="journey-stage-panel" data-stage={path}
        role="tabpanel" id={`journey-panel-${path}`} aria-labelledby={`journey-tab-${path}`}
        hidden={active !== index} tabIndex={0}>
        <div className="journey-stage-art" aria-hidden="true"><JourneyArtwork stage={path} /></div>
        <div className="journey-stage-copy">
          <h3>{title}</h3><p>{copy}</p>
          <a className="journey-explore" href={`/${path}/`}><span>{exploreLabel}{title}</span><span className="journey-explore-arrow"><SiteIcon name="arrow-up-right" size={24} /></span></a>
        </div>
      </div>)}
    </div>
  </div>;
}
