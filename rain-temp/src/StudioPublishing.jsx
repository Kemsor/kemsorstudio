import { studioEmail } from './studioContact';
import StudioImage from './StudioImage';
import React from 'react';
import {useCms,CmsText} from './CmsContent';
import {TextLink} from './PageUI';
import './studio-publishing.css';

export function ProductionAnnouncements({compact=false}){
 const {entries}=useCms();
 const projects=entries.filter(entry=>entry.type==='production');
 const stages=[['upcoming','Upcoming'],['in_development','In Development'],['coming_soon','Coming Soon'],['released','Released']];
 if(compact&&!projects.length)return null;
 return <section className="page-section production-announcements" id="production-announcements"><p className="page-eyebrow">KEMSOR PRODUCTIONS</p><h2>{compact?'Coming from the studio':'Our production slate'}</h2>{stages.filter(([stage])=>!compact||projects.some(project=>project.metadata?.production_stage===stage)).map(([stage,label])=><div key={stage} className="production-stage-group"><h3>{label}</h3><div className="publishing-cards">{projects.filter(project=>project.metadata?.production_stage===stage).slice(0,compact?2:100).map(project=><article key={project.id} id={`production-${project.slug}`}>{project.image_url&&<StudioImage mediaSlot="StudioPublishing-1" src={project.image_url} alt={project.image_alt||project.title} loading="lazy"/>}<p className="page-eyebrow">{[project.metadata.format,project.metadata.language].filter(Boolean).join(' · ')}</p><h3>{project.title}</h3>{project.summary&&<p>{project.summary}</p>}{!compact&&<CmsText text={project.body}/>}</article>)}</div>{!projects.some(project=>project.metadata?.production_stage===stage)&&<p className="publishing-empty">Studio-approved announcements will appear here when available.</p>}</div>)}{compact&&<TextLink href="/projects/#production-announcements">Explore productions</TextLink>}</section>;
}
export function HomeNews(){
 const {entries}=useCms();const news=entries.filter(entry=>entry.type==='news').slice(0,3);
 if(!news.length)return null;
 return <section className="page-section homepage-news"><p className="page-eyebrow">FROM THE STUDIO</p><h2>News & highlights</h2><div className="publishing-cards">{news.map(entry=><article key={entry.id}><h3><a href={`/news/#${entry.slug}`}>{entry.title}</a></h3><p>{entry.summary}</p></article>)}</div><TextLink href="/news/">News, Press & Media</TextLink></section>;
}
export function PressResources(){
 const {entries,settings}=useCms();const assets=entries.filter(entry=>entry.type==='press_asset');
 return <section className="page-section press-resources"><h2>Approved studio resources</h2>{!assets.length&&<p>Company profiles and approved media resources will be published here when available.</p>}<div className="publishing-cards">{assets.map(entry=><article key={entry.id}>{entry.image_url&&<StudioImage mediaSlot="StudioPublishing-2" src={entry.image_url} alt={entry.image_alt||entry.title} loading="lazy"/>}<h3>{entry.title}</h3><p>{entry.summary}</p><CmsText text={entry.body}/><p className="asset-usage">{entry.metadata?.usage}</p>{entry.metadata?.asset_url&&<a className="line-link" href={entry.metadata.asset_url} target="_blank" rel="noopener noreferrer">Open approved resource</a>}</article>)}</div><h3>Media enquiries</h3>{<p><a href={`mailto:${studioEmail}`}>{studioEmail}</a></p>}<TextLink href="/contact/?category=press#project-brief">Send a press enquiry</TextLink></section>;
}
