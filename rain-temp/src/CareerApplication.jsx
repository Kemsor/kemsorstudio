import React,{useEffect,useId,useRef,useState} from 'react';
import {cmsApi} from './CmsContent';
import EnquirySuccess from './EnquirySuccess';
import careerContent from '../../shared/careers-content.json';
import './career-application.css';
const applicationFields={
 general:{
  role:'Role you are applying for',roleHint:'e.g. Line Producer, or “general application”',
  experience:'Years of experience',about:'What you have worked on, and what you would like to do here.',
  submit:'Send application',
 },
 internship:{
  role:'What would you like to learn?',roleHint:'e.g. Editing, script research, production',
  experience:'College and course',about:'Why film, what you have made so far, and when you can start.',
  submit:'Apply for an internship',
 },
 freelance:{
  role:'Your craft',roleHint:'e.g. Gaffer, Sound recordist, Colourist',
  experience:'Years in the industry',about:'Key credits, the kit you own, languages and the cities you can work in.',
  submit:'Join the crew network',
 },
};
export default function CareerApplication({role,onClose,inline=false,onBusyChange,titleAs:Title='h2'}){
 const dialog=useRef(null),request=useRef(null),titleId=useId();
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[result,setResult]=useState(null);
 const intake=Object.hasOwn(applicationFields,role.id);
 const fields=intake?applicationFields[role.id]:applicationFields.general;
 useEffect(()=>{onBusyChange?.(busy);},[busy,onBusyChange]);
 useEffect(()=>{const opener=document.activeElement;if(!inline)dialog.current.showModal();return()=>{request.current?.abort();if(!inline&&opener?.isConnected)opener.focus();};},[inline]);
 async function submit(event){
  event.preventDefault();if(busy)return;const data=new FormData(event.currentTarget);const file=data.get('attachment');
  if(!file?.size||file.size>5*1024*1024){setError('Choose a PDF résumé of up to 5 MB.');return;}
  setBusy(true);setError('');const controller=new AbortController();request.current=controller;const timer=setTimeout(()=>controller.abort(),30000);
  try{
   const csrf=await fetch(`${cmsApi}/csrf`,{credentials:'same-origin',signal:controller.signal});if(!csrf.ok)throw new Error('Unable to prepare your application. Please try again.');
   const {token}=await csrf.json();
   const response=await fetch(`${cmsApi}/careers/${role.id}/applications`,{method:'POST',credentials:'same-origin',headers:{'X-CSRF-Token':token},body:data,signal:controller.signal});
   const value=await response.json();if(!response.ok)throw new Error(value.error||'Unable to submit your application.');setResult(value);
  }catch(reason){setError(reason.name==='AbortError'?'The request timed out. Please check with the studio before submitting again.':reason.message);}finally{clearTimeout(timer);setBusy(false);request.current=null;}
 }
 const Container=inline?'section':'dialog';
 return <Container ref={inline?undefined:dialog} className={inline?'career-application-inline':'career-application-dialog'} aria-labelledby={titleId} onCancel={inline?undefined:event=>{event.preventDefault();if(!busy)onClose();}} onClick={inline?undefined:event=>{if(event.target===event.currentTarget&&!busy)onClose();}}>
  <div className="career-application-head"><div><p>{role.id==='internship'?'INTERNSHIP APPLICATION':'CAREER APPLICATION'}</p><Title id={titleId}>{role.title}</Title></div>{!inline&&<button type="button" aria-label="Close application form" disabled={busy} onClick={onClose}>×</button>}</div>
  {result?<EnquirySuccess reference={result.reference} message="Your application and CV have been submitted successfully. Our team will review your details and contact you about a suitable opportunity."/>:<form onSubmit={submit} className="career-application-form">
   <fieldset disabled={busy}><div className="career-application-fields">
    <label>Full name<input name="name" autoComplete="name" required maxLength="100"/></label><label>Email address<input name="email" type="email" autoComplete="email" required maxLength="254"/></label>
    <label>Phone number<input name="phone" type="tel" autoComplete="tel" required maxLength="40"/></label><label>City<input name="city" autoComplete="address-level2" maxLength="100"/></label>
    {intake&&<label className="full">{fields.role}<input name="role_title" required maxLength="150" placeholder={fields.roleHint}/></label>}
    <label>Team you are interested in<select name="team" required={intake} defaultValue={careerContent.teams.some(([team])=>team===role.metadata?.category)?role.metadata.category:''}><option value="">Select a team</option>{careerContent.teams.map(([team])=><option key={team}>{team}</option>)}</select></label>
    <label>{fields.experience}{role.id==='internship'?<input name="experience" maxLength="200"/>:<input type="number" name="experience" min="0" max="70" step="0.5" placeholder="e.g. 2"/>}</label>
    <label className="full">Portfolio or showreel link<input type="url" name="portfolio_url" maxLength="1000" placeholder="https://…"/><small>Optional HTTPS link to your work.</small></label><label className="full">Tell us about yourself<textarea name="message" rows="4" maxLength="8000" placeholder={fields.about}/></label>
    <label className="full">Upload CV<input type="file" name="attachment" accept=".pdf,application/pdf" required/><small>PDF only · Maximum 5 MB</small></label>
   </div><label className="enquiry-honeypot" aria-hidden="true">Website<input name="website" tabIndex="-1" autoComplete="off"/></label>
   <label className="career-consent"><input type="checkbox" name="consent" value="true" required/><span>I agree that KEMSOR Studios may use my details and CV to assess my application and contact me about suitable work, as set out in the <a href="/privacy-policy/" target="_blank" rel="noopener noreferrer">Privacy Policy</a>. Only authorised recruitment staff can see it.</span></label>
   {error&&<p className="career-application-error" role="alert">{error}</p>}
   <button type="submit" className="creative-cta">{busy?'Submitting application…':fields.submit}</button></fieldset>
  </form>}
 </Container>;
}
