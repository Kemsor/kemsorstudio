import React,{useEffect,useId,useRef,useState} from 'react';
import {cmsApi} from './CmsContent';
import EnquirySuccess from './EnquirySuccess';
import careerContent from '../../shared/careers-content.json';
import './career-application.css';
export default function CareerApplication({role,onClose,inline=false,onBusyChange}){
 const dialog=useRef(null),request=useRef(null),titleId=useId();
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[result,setResult]=useState(null);
 const general=['general','internship'].includes(role.id);
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
  <div className="career-application-head"><div><p>{role.id==='internship'?'INTERNSHIP APPLICATION':'CAREER APPLICATION'}</p><h2 id={titleId}>{role.title}</h2></div>{!inline&&<button type="button" aria-label="Close application form" disabled={busy} onClick={onClose}>×</button>}</div>
  {result?<EnquirySuccess reference={result.reference} message="Your application and CV have been submitted successfully. Our team will review your details and contact you about a suitable opportunity."/>:<form onSubmit={submit} className="career-application-form">
   <fieldset disabled={busy}><div className="career-application-fields">
    <label>Full name<input name="name" autoComplete="name" required maxLength="100"/></label><label>Email address<input name="email" type="email" autoComplete="email" required maxLength="254"/></label>
    <label>Phone number<input name="phone" type="tel" autoComplete="tel" required maxLength="40"/></label><label>City<input name="city" autoComplete="address-level2" maxLength="100"/></label>
    {general&&<label className="full">Role you are applying for<input name="role_title" required maxLength="150" defaultValue={role.id==='internship'?'Internship':''} placeholder="Role or area of interest"/></label>}
    <label>Team you are interested in<select name="team" required={general} defaultValue={careerContent.teams.some(([team])=>team===role.metadata?.category)?role.metadata.category:''}><option value="">Select a team</option>{careerContent.teams.map(([team])=><option key={team}>{team}</option>)}</select></label>
    <label>Years of experience<input type="number" name="experience" min="0" max="70" step="0.5" placeholder="e.g. 2"/></label>
    <label className="full">Portfolio or showreel link<input type="url" name="portfolio_url" maxLength="1000" placeholder="https://…"/><small>Optional HTTPS link to your work.</small></label><label className="full">Tell us about yourself<textarea name="message" rows="4" maxLength="8000"/></label>
    <label className="full">Upload CV<input type="file" name="attachment" accept=".pdf,application/pdf" required/><small>PDF only · Maximum 5 MB</small></label>
   </div><label className="enquiry-honeypot" aria-hidden="true">Website<input name="website" tabIndex="-1" autoComplete="off"/></label>
   <p className="career-privacy">KEMSOR Studios will use your contact details, application and CV to assess your suitability and contact you about relevant opportunities. Your application is stored privately and is available to authorised recruitment staff.</p>
   <label className="career-consent"><input type="checkbox" name="consent" value="true" required/><span>I agree that KEMSOR may use my details to assess my application, as explained in the <a href="/privacy-policy/" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.</span></label>
   {error&&<p className="career-application-error" role="alert">{error}</p>}
   <button type="submit" className="creative-cta">{busy?'Submitting application…':'Submit application'}</button></fieldset>
  </form>}
 </Container>;
}
