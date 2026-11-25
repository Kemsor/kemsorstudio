import SectionSubmenu from '../SectionSubmenu';
import ManagedHero from '../ManagedHero';
import {cmsDocument,cmsText} from '../siteContent';
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


const normalize=value=>String(value||'').toLowerCase().replace(/[^a-z]/g,'');
export function CareersPage() {
 const [filter,setFilter]=useState('All');
 const {entries}=useCms();
 const roles=entries.filter(entry=>entry.type==='career'&&!/^(?:sample|dummy|example|test)(?:-|$)/i.test(entry.slug||'')&&!/^(?:sample|dummy|example)\b/i.test(entry.title)&&!/sample|example/i.test(entry.metadata?.category||''));
 const filters=['All',...new Set(roles.map(role=>role.metadata?.role).filter(Boolean))];
 const selectedFilter=filters.includes(filter)?filter:'All';
 const visible=roles.filter(role=>selectedFilter==='All'||normalize(role.metadata?.role)===normalize(selectedFilter));
 return <div className="careers-page">
  <EditorialHero compact page="careers" eyebrow="Careers at KEMSOR Studios" title={content.title}
   description={content.intro} foot={<div className="careers-hero-foot">Staff roles · Freelance crew · Internships</div>}
   actions={<><CTA href="/career-application/">Apply now</CTA><TextLink href="#ways">Ways to join</TextLink></>}/>
  <SectionSubmenu section="studio" page="careers"/>
  <section className="careers-section" aria-labelledby="careers-why">
   <MotionHeading as="h2" id="careers-why">Why people stay at KEMSOR</MotionHeading>
   <div className="careers-reasons">{content.reasons.map(([title,copy])=><article key={title}><h3>{title}</h3><p>{copy}</p></article>)}</div>
  </section>
  <section className="careers-ways-band" id="ways" aria-labelledby="careers-ways">
   <div className="careers-section">
   <MotionHeading as="h2" id="careers-ways">Three ways to join</MotionHeading>
   <p>Pick the one that fits where you are right now. All three use the same short application form.</p>
   <div className="careers-paths">
    <article>
     <h3>Studio jobs</h3>
     <p>Full-time roles across our seven teams:</p>
     <ul>{content.teams.map(([team])=><li key={team}>{team}</li>)}</ul>
     <CTA href="/career-application/">Apply for a job</CTA>
    </article>
    <article id="crew-network">
     <h3>Freelance crew</h3>
     <p>Camera, lighting, sound, art, costume, makeup, production, editing or VFX. Register once with your credits and showreel, and we will call you when a project needs your skills.</p>
     <p>Best for working technicians and creative professionals.</p>
     <CTA href="/career-application/?type=freelance">Join the crew network</CTA>
    </article>
    <article id="internships">
     <h3>Internships</h3>
     <p>For students and fresh graduates who want to learn on live projects in development, production and post-production.</p>
     <p>3 to 6 months · intakes open twice a year</p>
     <CTA href="/career-application/?type=internship">Apply for an internship</CTA>
    </article>
   </div>
   </div>
  </section>
  <section className="careers-section careers-list-page" id="openings" aria-labelledby="careers-openings">
   <MotionHeading as="h2" id="careers-openings">Latest openings</MotionHeading>
   {filters.length>1&&<div className="careers-filters" role="group" aria-label="Filter opportunities by engagement type">{filters.map(value=><button type="button" key={value} aria-pressed={selectedFilter===value} onClick={()=>setFilter(value)}>{value}</button>)}</div>}
   {roles.length>0
    ? <p className="careers-filter-status" role="status">{visible.length} {visible.length===1?'role':'roles'} shown</p>
    : <p className="careers-empty" role="status">No current openings. Please check back soon.</p>}
   {roles.length>0&&!visible.length&&<div className="careers-empty"><p>{cmsText("CareersPage","0bb1b81d516ae681","No roles match this filter.")}</p><button type="button" onClick={()=>setFilter('All')}>{cmsText("CareersPage","2e05c3c505f7793c","View all roles")}</button></div>}
   <div className="career-list">{visible.map(role=><article className="career-listing" key={role.id} id={role.slug}><div className="career-role-number" aria-hidden="true"><SiteIcon name="briefcase"/></div><div className="career-role-copy">{role.metadata?.category&&<span className="career-category">{role.metadata.category}</span>}<h3>{role.title}</h3><p className="career-meta">{[role.metadata?.role,role.metadata?.work_arrangement,role.metadata?.location].filter(Boolean).join(' · ')}</p>{role.summary&&<p className="career-summary">{role.summary}</p>}<details className="career-role-details"><summary>{cmsText("CareersPage","2ea9f848e8076182","View role details")}<span aria-hidden="true"><SiteIcon name="plus" size={16}/></span></summary><div><CmsText richText={role.metadata?.rich_text} text={role.body}/></div></details><a className="creative-cta career-apply-button" href={`/career-application/?role=${encodeURIComponent(role.id)}`}>{cmsText("CareersPage","f553f6a4a3bf59a6","View role and apply")}</a></div></article>)}</div>
  </section>
  <section className="careers-section" id="apply-now" aria-labelledby="careers-process">
   <MotionHeading as="h2" id="careers-process">Apply to KEMSOR</MotionHeading>
   <p>It takes about five minutes. Here is what happens after you hit submit.</p>
   <ol className="careers-process">{content.hiring.map(([title,copy])=><li key={title}><h3>{title}</h3><p>{copy}</p></li>)}</ol>
   <CTA href="/career-application/">Start your application</CTA>
  </section>
  <section className="careers-section careers-notice">
   <div><h2>Beware of fake job offers</h2><p>We never ask for money at any stage of hiring. Real openings appear only on this page and our verified social accounts. Report anything suspicious to <a href="mailto:careers@kemsor.com">careers@kemsor.com</a>.</p></div>
   <div><h2>Questions?</h2><p>Write to <a href="mailto:info@kemsorstudio.com">info@kemsorstudio.com</a>.</p></div>
  </section>
 </div>;
}
export default CareersPage;

const applicationTypes={general:'A studio job',internship:'An internship',freelance:'Freelance crew'};

export function CareerApplicationPage(){
 const {entries,connected}=useCms();
 const params=new URLSearchParams(typeof window==='undefined'?'':window.location.search);
 const roleId=params.get('role');
 const [intake,setIntake]=useState(()=>Object.hasOwn(applicationTypes,params.get('type'))?params.get('type'):'general');
 const [busy,setBusy]=useState(false);
 const role=roleId?entries.find(entry=>entry.type==='career'&&String(entry.id)===roleId):null;
 if(roleId&&!role)return <div className="careers-page career-form-page"><ManagedHero title="Career application" description="Apply to work with KEMSOR Studios."/><section className="career-form-wrap"><p role="status">{connected?'This opportunity is no longer available. Please choose a current opening.':'Loading application…'}</p>{connected&&<TextLink href="/careers/#openings">View latest openings</TextLink>}</section></div>;
 return <div className="careers-page career-form-page"><ManagedHero title={role?.title||"Career application"} description="Send your résumé and tell us about your experience."/><div className="career-form-wrap">
 {!role&&<><p id="career-intake-label">I am applying for</p><div className="careers-intake-switch" role="group" aria-labelledby="career-intake-label">{Object.entries(applicationTypes).map(([value,label])=><button key={value} type="button" disabled={busy} aria-pressed={intake===value} onClick={()=>setIntake(value)}>{label}</button>)}</div></>}
 <CareerApplication key={role?.id||intake} inline titleAs="h2" onBusyChange={setBusy} role={role||{id:intake,title:{general:'Studio job application',internship:'Internship application',freelance:'Freelance crew application'}[intake]}}/>
 </div></div>;
}
