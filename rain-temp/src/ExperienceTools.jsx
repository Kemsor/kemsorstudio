import React, { useRef, useState } from 'react';
import SiteIcon from './SiteIcon';
import { guideFlows } from './guideFlows';
import { useCms } from './CmsContent';

export default function ExperienceTools({ page }) {
  const { entries, settings } = useCms();
  const dialog = useRef(null);
  const opener = useRef(null);
  const [flow, setFlow] = useState(null);
  const openGuide = event => { opener.current = event.currentTarget; setFlow(null); dialog.current.showModal(); };
  return <aside className="experience-tools" aria-label="Site tools">
    <div className="experience-floating">
      <button className="experience-top" type="button" aria-label="Back to top" title="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>↑</button>
      <button className="experience-guide-launch" type="button" onClick={openGuide} aria-haspopup="dialog">Studio guide <span aria-hidden="true">↗</span></button>
    </div>
    <nav className="mobile-bottom-bar" aria-label="Mobile quick navigation">
      <a href="/#home" aria-current={page === 'home' ? 'page' : undefined}><SiteIcon name="home"/>Home</a>
      <a href="/projects/" aria-current={page === 'projects' ? 'page' : undefined}><SiteIcon name="film"/>Productions</a>
      <button type="button" onClick={openGuide} aria-haspopup="dialog"><SiteIcon name="guide"/>Guide</button>
      <a href="/contact/" aria-current={page === 'contact' ? 'page' : undefined}><SiteIcon name="contact"/>Contact</a>
    </nav>
    <dialog ref={dialog} className="studio-guide" aria-labelledby="studio-guide-title" onClose={() => opener.current?.focus()} onClick={event => { if (event.target === event.currentTarget) dialog.current.close(); }}>
      <div className="studio-guide-head"><div><p className="page-eyebrow">KEMSOR / YOUR WAY THROUGH</p><h2 id="studio-guide-title">Studio guide</h2></div><button type="button" autoFocus aria-label="Close studio guide" onClick={() => dialog.current.close()}>×</button></div>
      <p className="studio-guide-intro">What brings you here? Choose a starting point.</p>
      <div className="studio-guide-options">{guideFlows.map(item => <button key={item.id} type="button" aria-pressed={flow?.id === item.id} onClick={() => setFlow(item)}>{item.title}<span aria-hidden="true">→</span></button>)}</div>
      {flow && <div className="studio-guide-answer"><p role="status">{flow.id === 'careers' && entries.some(entry => entry.type === 'career') ? 'Explore the current roles and their requirements, or discuss a production partnership with the studio.' : flow.text}</p><div>{[...flow.links, ...(settings.enquiries_enabled && ['project', 'india', 'careers'].includes(flow.id) ? [['Send a studio enquiry', '/contact/#send-enquiry']] : [])].map(([label, href]) => <a key={href} href={href} onClick={() => dialog.current.close()}>{label}<span aria-hidden="true">↗</span></a>)}</div></div>}
    </dialog>
  </aside>;
}
