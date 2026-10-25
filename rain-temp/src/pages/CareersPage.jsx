import MotionHeading, { MotionCopy } from '../TextMotion';
import { EditorialHero } from '../EditorialPage';
import React,{useState} from 'react';
import CareerApplication from '../CareerApplication';
import { CmsText, useCms } from '../CmsContent';
import './careers-list.css';

export function CareersPage() {
 const [applying,setApplying]=useState(null);
 const { entries,connected } = useCms();
 const roles=entries.filter(entry=>entry.type==='career');
 return <><EditorialHero compact page="careers" eyebrow="CAREERS" title="Career opportunities" description={<p className="careers-role-count">{roles.length} {roles.length===1?'listing':'listings'}</p>}/><section className="careers-list-page page-section" id="openings">
  {!roles.length && <MotionCopy role="status">{connected?'No opportunities are listed right now.':'Loading opportunities…'}</MotionCopy>}
  <div className="career-list">{roles.map((role,index)=><article className="career-listing" key={role.id} id={role.slug}>
   <div className="career-role-number" aria-hidden="true">{String(index+1).padStart(2,'0')}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 7h18v13H3zM8 7V4h8v3M3 12h18M10 12v3h4v-3"/></svg></div>
   <div className="career-role-copy">
   {role.metadata?.category && <span className="career-category">{role.metadata.category}</span>}
   <MotionHeading as="h2">{role.title}</MotionHeading>
   {(role.metadata?.role || role.metadata?.location) && <MotionCopy className="career-meta">{[role.metadata.role,role.metadata.location].filter(Boolean).join(' · ')}</MotionCopy>}
   {role.summary && <p className="career-summary">{role.summary}</p>}
   <details className="career-role-details"><summary>View role details<span aria-hidden="true">+</span></summary><div><CmsText text={role.body}/></div></details>
   <button type="button" className="creative-cta career-apply-button" onClick={()=>setApplying(role)}>Apply for this role</button>
   </div>
  </article>)}</div>
  {applying&&<CareerApplication role={applying} onClose={()=>setApplying(null)}/>}
 </section></>;
}
export default CareersPage;
