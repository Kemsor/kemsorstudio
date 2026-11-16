import {cmsDocument} from '../siteContent';
import {cmsText} from '../siteContent';
import React,{useState} from 'react';
import SiteIcon from '../SiteIcon';
import MotionHeading from '../TextMotion';
import {EditorialHero} from '../EditorialPage';
import {CTA,TextLink} from '../PageUI';
import CareerApplication from '../CareerApplication';
import {CmsText,useCms} from '../CmsContent';
import preservedContent from '../../../shared/careers-content.json';
const content=cmsDocument('careers-copy',preservedContent);
import './careers-list.css';
import './careers-page.css';

const filters=['All','Full-time','Project-based','Internship'];
const normalize=value=>String(value||'').toLowerCase().replace(/[^a-z]/g,'');
export function CareersPage({openingsOnly=false}) {
 const [filter,setFilter]=useState('All');
 const {entries,connected}=useCms();
 const roles=entries.filter(entry=>entry.type==='career'&&!/^sample\b/i.test(entry.title)&&!/sample|example/i.test(entry.metadata?.category||''));
 const visible=roles.filter(role=>filter==='All'||normalize(role.metadata?.role)===normalize(filter));
 if(openingsOnly)return <div className="careers-page careers-openings-page"><EditorialHero compact page="latest-openings" title="Latest openings" caption="YOUR NEXT CHAPTER" description="Explore the opportunities currently open at Kemsor Studios. Choose an engagement type, read the role details and send your application." actions={<TextLink href="/careers/">Life at Kemsor</TextLink>}/><section className="careers-section careers-list-page" id="openings" aria-labelledby="careers-openings"><div className="careers-section-heading"><div><p className="page-eyebrow">{cmsText("CareersPage","0b944889f4a568b9","FIND YOUR NEXT ROLE")}</p><MotionHeading as="h2" id="careers-openings">{cmsText("CareersPage","7e54cbc0e19b80c3","Open roles")}</MotionHeading></div><span className="careers-role-count">{roles.length} {roles.length===1?'open role':'open roles'}</span></div>
   <div className="careers-filters" role="group" aria-label="Filter opportunities by engagement type">{filters.map(value=><button type="button" key={value} aria-pressed={filter===value} onClick={()=>setFilter(value)}>{value}</button>)}</div>
   <p className="careers-filter-status" role="status">{!connected?'Loading opportunities…':`${visible.length} ${visible.length===1?'role':'roles'} shown`}</p>
   {connected&&!roles.length&&<div className="careers-empty"><h3>{cmsText("CareersPage","13a9c8e72c71bdf6","No open roles right now.")}</h3><p>{cmsText("CareersPage","8131ddfbd453bb58","Send us your CV, and we will contact you when a suitable role opens.")}</p><a className="line-link" href="/career-application/">{cmsText("CareersPage","62f9acf273876f94","Send us your CV")}</a></div>}
   {roles.length>0&&!visible.length&&<div className="careers-empty"><p>{cmsText("CareersPage","0bb1b81d516ae681","No roles match this filter.")}</p><button type="button" onClick={()=>setFilter('All')}>{cmsText("CareersPage","2e05c3c505f7793c","View all roles")}</button></div>}
   <div className="career-list">{visible.map((role,index)=><article className="career-listing" key={role.id} id={role.slug}><div className="career-role-number" aria-hidden="true"><SiteIcon name="briefcase"/></div><div className="career-role-copy">{role.metadata?.category&&<span className="career-category">{role.metadata.category}</span>}<h3>{role.title}</h3><p className="career-meta">{[role.metadata?.role,role.metadata?.location].filter(Boolean).join(' · ')}</p>{role.summary&&<p className="career-summary">{role.summary}</p>}<details className="career-role-details"><summary>{cmsText("CareersPage","2ea9f848e8076182","View role details")}<span aria-hidden="true"><SiteIcon name="plus" size={16}/></span></summary><div><CmsText richText={role.metadata?.rich_text} text={role.body}/></div></details><a className="creative-cta career-apply-button" href={`/career-application/?role=${encodeURIComponent(role.id)}`}>{cmsText("CareersPage","f553f6a4a3bf59a6","View role and apply")}</a></div></article>)}</div>
  </section><section className="careers-section careers-openings-footer"><h2>Don’t see the right role?</h2><p>Introduce yourself for a future opportunity, or register with our freelance crew network.</p><div className="ep-actions"><CTA href="/career-application/">Send your CV</CTA><TextLink href="/careers/#crew-network">Join the crew network</TextLink></div></section></div>;
 return <div className="careers-page">
  <EditorialHero compact page="careers" eyebrow={cmsText("CareersPage","d5691f50616563b2","CAREERS")} title={content.title} caption="THE PEOPLE BEHIND THE FRAME" foot={<div className="careers-hero-foot"><span>Development · Production · Post · Release</span><span>Staff roles · Freelance crew · Internships</span></div>} description={content.intro} actions={<><CTA href="/latest-openings/">{cmsText("CareersPage","4b4da454bbc21dc2","See open roles")}</CTA><TextLink href="#crew-network">{cmsText("CareersPage","ef2d8547f16c1575","Join our crew network")}</TextLink></>}/>
  <section className="careers-section" aria-labelledby="careers-why"><p className="page-eyebrow">{cmsText("CareersPage","7e0a7edead3eb006","WHY KEMSOR")}</p><MotionHeading as="h2" id="careers-why">{cmsText("CareersPage","d2b0ef2e6cc6cb6e","Why KEMSOR")}</MotionHeading><div className="careers-reasons">{content.reasons.map(([title,copy],index)=><article key={title}><h3>{title}</h3><p>{copy}</p></article>)}</div></section>
  <section className="careers-section" aria-labelledby="careers-teams"><p className="page-eyebrow">{cmsText("CareersPage","1a06919ec76f887d","THE PEOPLE BEHIND THE FRAME")}</p><MotionHeading as="h2" id="careers-teams">{cmsText("CareersPage","21b1f9f792a32ad3","Our teams")}</MotionHeading><div className="careers-teams">{content.teams.map(([title,copy],index)=><article key={title}><div><h3>{title}</h3><p>{copy}</p></div></article>)}</div></section>
  <section className="careers-section careers-openings-preview" id="openings"><div><p className="page-eyebrow">LATEST OPENINGS</p><MotionHeading as="h2">Find your place in the studio.</MotionHeading><p>Browse current opportunities, explore the role details and apply for the work that fits your skills.</p></div><div><span className="careers-role-count">{connected?`${roles.length} open ${roles.length===1?'role':'roles'}`:'Explore opportunities'}</span><CTA href="/latest-openings/">View latest openings</CTA></div></section>
  <section className="careers-section careers-split" id="crew-network"><div><p className="page-eyebrow">{cmsText("CareersPage","d82fa123e844eaa8","PROJECTS NEED PEOPLE")}</p><MotionHeading as="h2">{cmsText("CareersPage","f0891f48250b5342","Join our crew network")}</MotionHeading></div><div><p>{cmsText("CareersPage","63d9c87e35c921d0","Are you a freelance technician, crew member, or creative professional? Join our crew network, and we will reach out when a project needs your skills.")}</p><p>{cmsText("CareersPage","ab18d67c065a366d","We hire freelancers across camera, lighting, sound, art, costume, makeup, production, editing and VFX.")}</p><CTA href="/join/">{cmsText("CareersPage","d38033f33bddcfde","Register with us")}</CTA></div></section>
  <section className="careers-section careers-split" id="internships"><div><p className="page-eyebrow">{cmsText("CareersPage","b0b1ac3d83c6ee45","START WITH THE CRAFT")}</p><MotionHeading as="h2">{cmsText("CareersPage","e1cb07cd6eb08162","Internships")}</MotionHeading></div><div><p>{cmsText("CareersPage","df42fa24693871db","Starting out in film? Our internships give students and fresh graduates real experience on live projects in development, production, and post-production.")}</p><p>{cmsText("CareersPage","8e97cd9371b10832","Internships run for 3 to 6 months and open twice a year.")}</p><a className="line-link" href="/career-application/?type=internship">{cmsText("CareersPage","4b3d36c5f82c5838","Apply for an internship")}</a></div></section>
  <section className="careers-section" aria-labelledby="careers-process"><p className="page-eyebrow">{cmsText("CareersPage","0c4ccb1992ee0977","HOW WE HIRE")}</p><MotionHeading as="h2" id="careers-process">{cmsText("CareersPage","43d01eac01e3f940","How we hire")}</MotionHeading><ol className="careers-process">{content.hiring.map(([title,copy],index)=><li key={title}><h3>{title}</h3><p>{copy}</p></li>)}</ol></section>
  <section className="careers-section careers-split" id="apply-now"><div><p className="page-eyebrow">YOUR NEXT CHAPTER</p><MotionHeading as="h2">Apply now</MotionHeading><p>Tell us where you would like to contribute.</p></div><div><CTA href="/career-application/">Start your application</CTA></div></section>
  <section className="careers-section careers-notice"><div><p className="page-eyebrow">{cmsText("CareersPage","8bafa0f776166123","RECRUITMENT NOTICE")}</p><h2>{cmsText("CareersPage","5adc17ae0224ece6","Beware of fake job offers")}</h2><p>{cmsText("CareersPage","40e35370804da6e0","KEMSOR Studios never asks for money at any stage of hiring. All official job openings are posted on our Latest Openings page and our verified social media accounts. If you receive a suspicious offer in our name, please report it to ")}<a href="mailto:careers@kemsor.com">{cmsText("CareersPage","cce284a4bd2b762a","careers@kemsor.com")}</a>.</p></div><div><h2>{cmsText("CareersPage","ec6e6ee38d3bb2ec","Questions?")}</h2><p>{cmsText("CareersPage","02460c6e1134ffe5","Write to us at ")}<a href="mailto:info@kemsorstudio.com">{cmsText("CareersPage","35af5c8b8018d42e","info@kemsorstudio.com")}</a>{cmsText("CareersPage","c8d653aec2a365dc",". We are happy to help.")}</p></div></section>

 </div>;
}
export default CareersPage;

export function LatestOpeningsPage(){return <CareersPage openingsOnly/>;}

export function CareerApplicationPage(){
 const {entries,connected}=useCms();
 const params=new URLSearchParams(typeof window==='undefined'?'':window.location.search);
 const roleId=params.get('role');
 const [intake,setIntake]=useState(params.get('type')==='internship'?'internship':'general');
 const [busy,setBusy]=useState(false);
 const role=roleId?entries.find(entry=>entry.type==='career'&&String(entry.id)===roleId):null;
 if(roleId&&!role)return <div className="careers-page career-form-page"><section className="career-form-wrap"><h1>Career application</h1><p role="status">{connected?'This opportunity is no longer available. Please choose a current opening.':'Loading application…'}</p>{connected&&<TextLink href="/latest-openings/">View latest openings</TextLink>}</section></div>;
 return <div className="careers-page career-form-page"><div className="career-form-wrap">
 {!role&&<div className="careers-intake-switch" role="group" aria-label="Application type">{['general','internship'].map(value=><button key={value} type="button" disabled={busy} aria-pressed={intake===value} onClick={()=>setIntake(value)}>{value==='general'?'General application':'Internship'}</button>)}</div>}
 <CareerApplication key={role?.id||intake} inline titleAs="h1" onBusyChange={setBusy} role={role||{id:intake,title:intake==='internship'?'Internship application':'Career application'}}/>
 </div></div>;
}
