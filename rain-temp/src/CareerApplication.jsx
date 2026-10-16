import React,{useEffect,useRef,useState} from 'react';
import {cmsApi} from './CmsContent';
import EnquirySuccess from './EnquirySuccess';
import './career-application.css';
export default function CareerApplication({role,onClose}){
 const dialog=useRef(null),request=useRef(null);
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[result,setResult]=useState(null);
 useEffect(()=>{dialog.current.showModal();return()=>{request.current?.abort();};},[]);
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
 return <dialog ref={dialog} className="career-application-dialog" aria-labelledby="career-apply-title" onCancel={event=>{event.preventDefault();if(!busy)onClose();}} onClick={event=>{if(event.target===event.currentTarget&&!busy)onClose();}}>
  <div className="career-application-head"><div><p>CAREER APPLICATION</p><h2 id="career-apply-title">{role.title}</h2></div><button type="button" aria-label="Close application form" disabled={busy} onClick={onClose}>×</button></div>
  {result?<EnquirySuccess reference={result.reference} message="Your application has been submitted successfully. Our team will review your details and résumé and contact you if your profile matches the opportunity."/>:<form onSubmit={submit} className="career-application-form">
   <fieldset disabled={busy}><div className="career-application-fields">
    <label>Full name<input name="name" autoComplete="name" required maxLength="100"/></label><label>Email<input name="email" type="email" autoComplete="email" required maxLength="254"/></label>
    <label>Phone<input name="phone" type="tel" autoComplete="tel" required maxLength="40"/></label><label>City<input name="city" autoComplete="address-level2" maxLength="100"/></label>
    <label className="full">Relevant experience<input name="experience" maxLength="200" placeholder="e.g. 2 years in production coordination"/></label>
    <label className="full">Message<textarea name="message" rows="4" maxLength="8000" placeholder="Tell us why you are interested in this role."/></label>
    <label className="full">Upload résumé<input type="file" name="attachment" accept=".pdf,application/pdf" required/><small>PDF only · Maximum 5 MB</small></label>
   </div><label className="enquiry-honeypot" aria-hidden="true">Website<input name="website" tabIndex="-1" autoComplete="off"/></label>
   <p className="career-privacy">Kemsor Studios will use your contact details, application and résumé to review your suitability and contact you about this opportunity. Your application is stored privately and is available to authorised recruitment staff.</p>
   <label className="career-consent"><input type="checkbox" name="consent" value="true" required/>I agree to my details and résumé being used for this application as described above.</label>
   {error&&<p className="career-application-error" role="alert">{error}</p>}
   <button type="submit" className="creative-cta">{busy?'Submitting application…':'Submit application'}</button></fieldset>
  </form>}
 </dialog>;
}
