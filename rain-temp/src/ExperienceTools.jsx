import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import SiteIcon from './SiteIcon';
import { guideFlows } from './guideFlows';
import { useCms } from './CmsContent';
import './experience-utilities.css';

export default function ExperienceTools({ page }) {
  const { entries, settings } = useCms();
  const dialog = useRef(null);
  const opener = useRef(null);
  const topButton = useRef(null);
  const [guideTarget, setGuideTarget] = useState(null);
  const [topVisible, setTopVisible] = useState(false);
  const [flow, setFlow] = useState(null);
  useEffect(() => {
    setGuideTarget(document.getElementById('footer-guide-slot'));
    let frame;
    const update = () => {
      frame = null;
      const button = topButton.current;
      if (!button) return;
      const rect = button.getBoundingClientRect();
      // Leave text, links and media unobstructed, including on narrow screens.
      const obstructsContent = [0.15, 0.5, 0.85].some(x => [0.15, 0.5, 0.85].some(y =>
        document.elementsFromPoint(rect.left + rect.width * x, rect.top + rect.height * y).some(element =>
          !button.contains(element) && element.closest('main, footer') &&
          element.closest('a, button, input, select, textarea, h1, h2, h3, p, li, img, video')
        )
      ));
      setTopVisible(window.scrollY > window.innerHeight * 0.75 && !obstructsContent);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [page]);
  const openGuide = event => { opener.current = event.currentTarget; setFlow(null); dialog.current.showModal(); };
  return <aside className="experience-tools" aria-label="Site tools">
    <button ref={topButton} className={`experience-top experience-top-floating${topVisible ? ' is-visible' : ''}`} type="button" aria-label="Back to top" title="Back to top" disabled={!topVisible} onClick={() => window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })}><SiteIcon name="arrow-up" size={20}/></button>
    {guideTarget && createPortal(<button className="experience-guide-launch" type="button" onClick={openGuide} aria-haspopup="dialog">Studio guide <span aria-hidden="true"><SiteIcon name="arrow-up-right" size={16} /></span></button>, guideTarget)}
    <nav className="mobile-bottom-bar" aria-label="Mobile quick navigation">
      <a href="/" aria-current={page === 'home' ? 'page' : undefined}><SiteIcon name="home"/>Home</a>
      <a href="/projects/" aria-current={page === 'projects' ? 'page' : undefined}><SiteIcon name="film"/>Productions</a>
      <button type="button" onClick={openGuide} aria-haspopup="dialog"><SiteIcon name="guide"/>Guide</button>
      <a href="/contact/" aria-current={page === 'contact' ? 'page' : undefined}><SiteIcon name="contact"/>Contact</a>
    </nav>
    <dialog ref={dialog} className="studio-guide" aria-labelledby="studio-guide-title" onClose={() => opener.current?.focus()} onClick={event => { if (event.target === event.currentTarget) dialog.current.close(); }}>
      <div className="studio-guide-head"><div><p className="page-eyebrow">KEMSOR / YOUR WAY THROUGH</p><h2 id="studio-guide-title">Studio guide</h2></div><button type="button" autoFocus aria-label="Close studio guide" onClick={() => dialog.current.close()}>×</button></div>
      <p className="studio-guide-intro">What brings you here? Choose a starting point.</p>
      <div className="studio-guide-options">{guideFlows.map(item => <button key={item.id} type="button" aria-pressed={flow?.id === item.id} onClick={() => setFlow(item)}>{item.title}<span aria-hidden="true"><SiteIcon name="arrow" size={16} /></span></button>)}</div>
      {flow && <div className="studio-guide-answer"><p role="status">{flow.id === 'careers' && entries.some(entry => entry.type === 'career') ? 'Explore the current roles and their requirements, or discuss a production partnership with the studio.' : flow.text}</p><div>{[...flow.links, ...(settings.enquiries_enabled && ['project', 'india', 'careers'].includes(flow.id) ? [['Send a studio enquiry', '/contact/#send-enquiry']] : [])].map(([label, href]) => <a key={href} href={href} onClick={() => dialog.current.close()}>{label}<span aria-hidden="true"><SiteIcon name="arrow-up-right" size={16} /></span></a>)}</div></div>}
    </dialog>
  </aside>;
}
