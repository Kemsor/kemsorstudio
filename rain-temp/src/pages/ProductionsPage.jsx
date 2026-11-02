import React, { useState } from 'react';
import StudioImage from '../StudioImage';
import { EditorialHero } from '../EditorialPage';
import MotionHeading from '../TextMotion';
import { CTA, TextLink } from '../PageUI';
import { useCms, CmsText } from '../CmsContent';
import './produce-page.css';
import './productions-page.css';

const formats = [
 ['feature-films', 'Feature Films', 'Theatrical and streaming features in Hindi, English and regional languages, from intimate dramas to large-scale genre films.', 'coastal-motorcycle-chase'],
 ['series-ott', 'Series & OTT', "Scripted and unscripted series for streaming platforms, developed with the writers’ room and delivered to platform specs.", 'courtyard-dance-production'],
 ['documentaries', 'Documentaries', 'Feature and series documentaries built on access, research and patient storytelling.', 'daylight-forest-action'],
 ['short-films', 'Short Films', 'Short fiction for festivals and digital release, and a proving ground for new directors.', 'family-drama-scene'],
];
const statuses = [['in_development','In Development'],['in_production','In Production'],['in_post_production','In Post-Production'],['released','Released']];
const strengths = [
 ['Development that starts with the story', 'Our development team works with writers and directors on script, packaging and budget before a project is green-lit.'],
 ['Finance in the same building', 'We structure financing and co-productions in-house, so creative and money decisions are made together.'],
 ['Production anywhere in India', 'Our line production and crew network covers locations, permits and logistics across India.'],
 ['A release plan from day one', 'Distribution, festival and platform strategy is planned during development, not after the edit.'],
];
const steps = [['Develop','Script, packaging, budget and schedule.','develop'],['Finance','Financing structure, co-producers and partners.','finance'],['Produce','Casting, locations, crew and the shoot.','produce'],['Post','Edit, VFX, sound, music and colour.','post'],['Release','Distribution, platforms, festivals and awards.','release']];
const audiences = [
 ['Filmmakers & creators','Bring us a script, a treatment or an idea.','For Filmmakers & Creators','/partner-with-us/?route=filmmakers#partner-route-panel'],
 ['Studios & platforms','Commission or co-develop series and films.','For Studios & Platforms','/partner-with-us/?route=studios#partner-route-panel'],
 ['Co-producers & financiers','Join a project at the development or production stage.','For Co-Producers & Financiers','/partner-with-us/?route=co-producers#partner-route-panel'],
 ['International productions','Shoot in India with our production services team.','India Production Services','/india-production-services/'],
];
const questions = [
 ['What does KEMSOR Studios produce?','Feature films, series for OTT platforms, documentaries and short films. Each project is developed, financed and produced in-house.'],
 ['Do you accept scripts from new writers and directors?','Yes. Use Start a Project to share a logline and a short synopsis. Full scripts are reviewed only after you accept our submission terms.'],
 ['Do you produce web series for OTT platforms?','Yes. We develop and produce scripted and unscripted series and deliver them to each platform’s technical specifications.'],
 ['Can international producers shoot in India with KEMSOR?','Yes. Our India Production Services team handles line production, permits, locations, crew and equipment.'],
 ['Where is KEMSOR Studios based?','In Dehradun, India, with productions across the country.'],
];
const normalize = value => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g,'');
const stageOf = entry => normalize(entry.metadata?.production_stage || entry.metadata?.status);
function Slate() {
 const { entries } = useCms();
 const [status,setStatus] = useState('all');
 const [format,setFormat] = useState('all');
 const projects = entries.filter(entry => entry.type === 'production');
 const visible = projects.filter(entry => (status==='all'||stageOf(entry)===normalize(status))&&(format==='all'||normalize(entry.metadata?.format)===normalize(format)));
 return <section className="productions-section" id="production-announcements" aria-labelledby="slate-title"><span id="project-showcase" className="productions-anchor"/><p className="produce-label">THE SLATE</p><MotionHeading as="h2" id="slate-title">Our slate</MotionHeading><p>Everything KEMSOR Studios has in development, in production and on screen.</p>
  <div className="productions-filters"><fieldset><legend>Status</legend><div>{[['all','All'],...statuses].map(([value,label])=><button type="button" key={value} aria-pressed={status===value} onClick={()=>setStatus(value)}>{label}</button>)}</div></fieldset><label>Format<select value={format} onChange={event=>setFormat(event.target.value)}><option value="all">All formats</option>{formats.map(([,title])=><option key={title}>{title}</option>)}</select></label></div>
  <p className="productions-result" role="status">{projects.length ? `${visible.length} ${visible.length===1?'production':'productions'}` : 'Slate announcements coming soon'}</p>
  {!visible.length?<div className="productions-empty"><span aria-hidden="true">K / PRODUCTIONS</span><h3>{projects.length?'No productions match these filters.':'Our first titles will be announced here.'}</h3>{projects.length?<button type="button" onClick={()=>{setStatus('all');setFormat('all');}}>Clear filters</button>:<p>Follow the <a href="/press-media/">Newsroom</a> for slate news.</p>}</div>:<div className="productions-cards">{visible.map(entry=><article key={entry.id} id={`production-${entry.slug}`}>
   {entry.image_url&&<StudioImage src={entry.image_url} alt={entry.image_alt||entry.title} loading="lazy"/>}<h3>{entry.title}</h3><p>{[entry.metadata?.format,entry.metadata?.language,statuses.find(([key])=>normalize(key)===stageOf(entry))?.[1]||entry.metadata?.production_stage,entry.metadata?.year].filter(Boolean).join(' · ')}</p>{entry.summary&&<p>{entry.summary}</p>}<details><summary>View production</summary><CmsText text={entry.body||entry.summary}/></details>
  </article>)}</div>}
 </section>;
}
export function ProductionsPage() {
 return <div className="produce-hub productions-page">
  <EditorialHero page="productions" eyebrow="PRODUCTIONS" title="A film production company in India," accent="built for the whole life of a story" description="Feature films, series, documentaries and short films. Developed, financed, produced, and released by one studio." image="/assets/stills/fort-helicopter-action-1600.webp" alt="Illustrative helicopter action sequence above an Indian fort" actions={<><CTA href="#production-announcements">See the slate</CTA><TextLink href="/contact/?partner=filmmakers">Start a Project</TextLink></>}/>
  <section className="productions-section productions-intro"><div><p className="produce-label">KEMSOR STUDIOS</p><MotionHeading as="h2">Stories that go the distance</MotionHeading></div><div><p>Most production houses in India do one part of a film well. KEMSOR Studios is set up to carry a project the whole way: we develop the script, structure the finance, run the shoot, supervise post-production, and plan the release.</p><p>That means one team, one budget and one point of accountability, from the first draft to the festival screening or streaming premiere. As an independent film studio based in Dehradun, we choose projects for the strength of the story, then put the full weight of the studio behind them.</p></div></section>
  <section className="productions-section" id="what-we-make"><p className="produce-label">THE FORMATS</p><MotionHeading as="h2">What we make</MotionHeading><div className="productions-formats">{formats.map(([id,title,copy,image],index)=><article key={id} id={id}><a href={`/what-we-make/${id}/`} tabIndex={-1} aria-hidden="true"><StudioImage src={`/assets/stills/${image}-960.webp`} alt="" loading="lazy" width="960" height="540"/></a><span className="produce-label">0{index+1} / 04</span><h3>{title}</h3><p>{copy}</p><TextLink href={`/what-we-make/${id}/`}>Explore {title}</TextLink></article>)}</div></section>
  <Slate/>
  <section className="productions-section"><p className="produce-label">WHY KEMSOR</p><MotionHeading as="h2">One studio, script to screen</MotionHeading><div className="productions-strengths">{strengths.map(([title,copy],index)=><article key={title}><span>0{index+1}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></section>
  <section className="productions-section" id="production-process"><p className="produce-label">HOW EVERY PRODUCTION IS MADE</p><MotionHeading as="h2">From first draft to final release</MotionHeading><ol className="productions-process">{steps.map(([title,copy,path],index)=><li key={title}><a href={`/${path}/`}><span>0{index+1}</span><h3>{title}</h3><p>{copy}</p><span className="line-link">Explore {title}</span></a></li>)}</ol></section>
  <section className="productions-section" id="international-co-productions"><p className="produce-label">WHO WE WORK WITH</p><MotionHeading as="h2">Make your next production with us</MotionHeading><div className="productions-audiences">{audiences.map(([title,copy,label,href])=><article key={title}><h3>{title}</h3><p>{copy}</p><TextLink href={href}>{label}</TextLink></article>)}</div></section>
  <section className="productions-section productions-questions"><div><p className="produce-label">FAQ</p><MotionHeading as="h2">Frequently asked questions</MotionHeading></div><div className="produce-faqs">{questions.map(([question,answer])=><details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></section>
  <section className="productions-section productions-closing"><p className="produce-label">YOUR NEXT PRODUCTION</p><div><MotionHeading as="h2">Have a story worth making?</MotionHeading><div><p>Tell us about your film or series. We reply to every enquiry within 5 working days.</p><div className="productions-actions"><CTA href="/contact/?partner=filmmakers">Start a Project</CTA><TextLink href="/partner-with-us/">Partner With Us</TextLink></div></div></div></section>
 </div>;
}
export default ProductionsPage;
