import MotionHeading, { MotionCopy } from '../TextMotion';
import { EditorialHero } from '../EditorialPage';
import React, { useState } from 'react';
import { CmsText, useCms } from '../CmsContent';
import './news-page.css';

export function NewsPage() {
 const { entries, connected } = useCms();
 const [paused,setPaused] = useState(false);
 const news = entries.filter(entry => entry.type === 'news');
 const partners = entries.filter(entry => entry.type === 'media_partner');
 return <div className="newsroom-page">
  <EditorialHero compact page="news" eyebrow="NEWS" title="News"/>
  <section className="newsroom-stories" aria-label="Studio news">
   {!news.length && <MotionCopy className="newsroom-empty" role="status">{connected ? 'Studio news will appear here as updates are published.' : 'Loading studio news…'}</MotionCopy>}
   {news.map(entry => <article className="newsroom-story" key={entry.id} id={entry.slug}>
    {entry.image_url && <img src={entry.image_url} alt={entry.image_alt || ''} loading="lazy"/>}
    <div>{entry.published_at && <time dateTime={entry.published_at.replace(' ','T')+'Z'}>{new Date(entry.published_at.replace(' ','T')+'Z').toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</time>}<MotionHeading as="h2">{entry.title}</MotionHeading>{entry.summary && <p className="newsroom-summary">{entry.summary}</p>}<CmsText text={entry.body}/></div>
   </article>)}
  </section>
  <section className="media-partners" id="press-media" aria-labelledby="media-partners-title">
   <div className="media-partners-heading"><MotionHeading as="h2" id="media-partners-title">Media partners</MotionHeading>{partners.length>0 && <button type="button" onClick={()=>setPaused(value=>!value)} aria-pressed={paused}>{paused?'Play slider':'Pause slider'}</button>}</div>
   {partners.some(partner=>partner.metadata?.category==='sample') && <p className="media-partners-note">Sample partner logos — the studio will update this list.</p>}
   {!partners.length ? <p>Media partners will appear here when published.</p> : <div className="media-partners-window" aria-label="Media partner logos"><div className={`media-partners-track${paused?' is-paused':''}`} style={{'--partner-duration':`${Math.max(8,partners.length*1.6)}s`}}>{[0,1,2,3].map(copy=><div className="media-partners-set" key={copy} aria-hidden={copy>0?true:undefined}>{partners.map((partner,index)=><div className="media-partner-logo" key={partner.id}>{partner.image_url?<img src={partner.image_url} alt={partner.title} loading="lazy"/>:<span className={`sample-wordmark wordmark-${index%3}`}><b aria-hidden="true">{partner.title.split(' ').map(word=>word[0]).join('')}</b>{partner.title}</span>}</div>)}</div>)}</div></div>}
  </section>
 </div>;
}
export default NewsPage;
