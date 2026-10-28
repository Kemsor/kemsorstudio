import SiteIcon from './SiteIcon';
import React, { createContext, useContext, useEffect, useState } from 'react';
import './cms-content.css';

const ContentContext = createContext({ entries: [], settings: {}, connected: false });
const api = import.meta.env.VITE_CMS_API_URL || '/api';
export const cmsApi = api;
export function CmsProvider({ children }) {
  const [content, setContent] = useState({ entries: [], settings: {}, connected: false });
  useEffect(() => {
    let current;
    const refresh = async () => {
      if (document.hidden) return;
      current?.abort(); current = new AbortController();
      const timeout = setTimeout(() => current.abort(), 5000);
      try {
        const response = await fetch(`${api}/site`, { signal: current.signal, credentials: 'same-origin' });
        if (!response.ok) throw new Error('CMS unavailable');
        const data = await response.json();
        if (Array.isArray(data.entries)) setContent({ ...data, connected: true });
      } catch { /* Keep the supplied website content available if the API is offline. */ }
      finally { clearTimeout(timeout); }
    };
    const onVisible=()=>{if(!document.hidden)refresh();};
    const timer=setInterval(onVisible,30000);
    refresh(); window.addEventListener('focus', refresh);document.addEventListener('visibilitychange',onVisible);
    return () => { current?.abort();clearInterval(timer);window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',onVisible); };
  }, []);
  return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>;
}
export function useCms() { return useContext(ContentContext); }
export function CmsText({ text }) {
  return String(text || '').split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p className="cms-paragraph" key={index}>{paragraph}</p>);
}
export function CmsEntries({ type, entries: supplied, id, heading, compact = false }) {
  const { entries } = useCms();
  const records = supplied || entries.filter(entry => entry.type === type);
  if (!records.length) return null;
  return <section className={`page-section cms-published ${compact ? 'cms-compact' : ''}`} id={id}>
    {heading && <h2 className="cms-heading">{heading}</h2>}
    <div className="cms-published-grid">{records.map(entry => <article className="page-card cms-entry" id={`cms-${entry.slug}`} key={entry.id}>
      {entry.image_url && <img src={entry.image_url} alt={entry.image_alt || ''} width="1280" height="720" loading="lazy" decoding="async" />}
      {entry.metadata?.category && <p className="page-eyebrow">{entry.metadata.category}</p>}
      <h3>{entry.title}</h3>
      {(entry.metadata?.role || entry.metadata?.location) && <p className="page-eyebrow">{[entry.metadata.role, entry.metadata.location].filter(Boolean).join(' / ')}</p>}
      {entry.summary && <p className="page-lead">{entry.summary}</p>}
      <CmsText text={entry.body} />
      {type === 'career' && <a className="line-link" href="/contact/#send-enquiry">Send a careers enquiry <SiteIcon name="arrow" size={16} /></a>}
    </article>)}</div>
  </section>;
}
export function CmsPageSections({ page }) {
  const { entries } = useCms();
  const sections = entries.filter(entry => entry.type === 'page' && entry.metadata?.page === page);
  useEffect(() => {
    const metadata = sections.find(entry => entry.metadata?.seo_title || entry.metadata?.seo_description)?.metadata;
    if (metadata?.seo_title) document.title = metadata.seo_title;
    if (metadata?.seo_description) document.querySelector('meta[name="description"]')?.setAttribute('content', metadata.seo_description);
  }, [sections.map(entry => `${entry.id}:${entry.metadata?.seo_title}:${entry.metadata?.seo_description}`).join('|')]);
  return <CmsEntries entries={sections} />;
}
