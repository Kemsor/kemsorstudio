import {setSiteModules} from './siteContent';
import CmsVideo from './CmsVideo';
import RichText from './RichText';
import {parseRichText} from '../../backend/public/rich-text-core.js';
import StudioImage from './StudioImage';
import SiteIcon from './SiteIcon';
import React, { createContext, useContext, useEffect, useState } from 'react';
import './cms-content.css';

const ContentContext = createContext({ entries: [], settings: {}, connected: false });
const api = import.meta.env.VITE_CMS_API_URL || '/api';
export const cmsApi = api;
export function CmsProvider({ children }) {
  const [content, setContent] = useState({ entries: [], settings: {}, connected: false });
  useEffect(() => {
    let current, publishedModules={}, previewValues=null;
    const previewKey=new URLSearchParams(location.search).get('admin_preview');
    const applyModules=()=>setSiteModules(previewValues?{...publishedModules,[previewKey]:previewValues}:publishedModules);
    const previewMessage=event=>{
      if(previewKey!=='copy:BudgetingSchedulingPage'||window.parent===window||event.origin!==location.origin||event.source!==window.parent||event.data?.type!=='kemsor-copy-preview'||event.data.moduleKey!==previewKey)return;
      const values=event.data.values;if(!values||typeof values!=='object'||Array.isArray(values))return;
      previewValues=Object.fromEntries(Object.entries(values).filter(([key,value])=>/^[a-f0-9]{16}$/.test(key)&&typeof value==='string'&&value.length<=12000));applyModules();setContent(previous=>({...previous}));
    };
    window.addEventListener('message',previewMessage);
    if(previewKey==='copy:BudgetingSchedulingPage'&&window.parent!==window)window.parent.postMessage({type:'kemsor-preview-ready'},location.origin);
    const refresh = async () => {
      if (document.hidden) return;
      current?.abort(); const controller=new AbortController();current=controller;
      const timeout = setTimeout(() => controller.abort(), 30000);
      try {
        const response = await fetch(`${api}/site`, { signal: controller.signal, credentials: 'same-origin' });
        if (!response.ok) throw new Error('CMS unavailable');
        const data = await response.json();
        const all=[...(data.entries||[])];const cursors=new Set();let next=data.nextCursor;
        while(next){if(cursors.has(next))throw new Error('Repeated content cursor');cursors.add(next);const batchResponse=await fetch(`${api}/site?cursor=${encodeURIComponent(next)}`,{signal:controller.signal,credentials:'same-origin'});if(!batchResponse.ok)throw new Error('Content batch unavailable');const batch=await batchResponse.json();all.push(...batch.entries);next=batch.nextCursor;}
        data.entries=[...new Map(all.map(entry=>[entry.id,entry])).values()];

        if(current===controller&&Array.isArray(data.entries)){publishedModules=data.siteModules||{};applyModules();setContent({ ...data, connected: true });}
      } catch { /* Keep the supplied website content available if the API is offline. */ }
      finally { clearTimeout(timeout); }
    };
    const onVisible=()=>{if(!document.hidden)refresh();};
    const timer=setInterval(onVisible,30000);
    refresh(); window.addEventListener('focus', refresh);document.addEventListener('visibilitychange',onVisible);
    return () => { window.removeEventListener('message',previewMessage);current?.abort();clearInterval(timer);window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',onVisible); };
  }, []);
  return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>;
}
export function useCms() { return useContext(ContentContext); }
export function CmsText({ text,richText }) {
  try{if(parseRichText(richText))return <RichText document={richText}/>;}catch{}
  return String(text || '').split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p className="cms-paragraph" key={index}>{paragraph}</p>);
}
export function CmsEntries({ type, entries: supplied, id, heading, compact = false }) {
  const { entries } = useCms();
  const records = supplied || entries.filter(entry => entry.type === type);
  if (!records.length) return null;
  return <section className={`page-section cms-published ${compact ? 'cms-compact' : ''}`} id={id}>
    {heading && <h2 className="cms-heading">{heading}</h2>}
    <div className="cms-published-grid">{records.map(entry => <article className="page-card cms-entry" id={`cms-${entry.slug}`} key={entry.id}>
      {entry.metadata?.video_url ? <CmsVideo entry={entry}/> : entry.image_url && <StudioImage mediaSlot="CmsContent-1" src={entry.image_url} alt={entry.image_alt || ''} width="1280" height="720" loading="lazy" decoding="async" />}
      {entry.metadata?.category && <p className="page-eyebrow">{entry.metadata.category}</p>}
      <h3>{entry.title}</h3>
      {(entry.metadata?.role || entry.metadata?.location) && <p className="page-eyebrow">{[entry.metadata.role, entry.metadata.location].filter(Boolean).join(' / ')}</p>}
      {entry.summary && <p className="page-lead">{entry.summary}</p>}
      <CmsText text={entry.body} richText={entry.metadata?.rich_text} />
      {type === 'career' && <a className="line-link" href="/contact/#send-enquiry">Send a careers enquiry <SiteIcon name="arrow" size={16} /></a>}
    </article>)}</div>
  </section>;
}
export function CmsPageSections({ page }) {
  const { entries } = useCms();
  const sections = entries.filter(entry => entry.type === 'page' && (entry.metadata?.page==='news'?'press-media':entry.metadata?.page) === page);
  return <CmsEntries entries={sections} />;
}
