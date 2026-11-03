import React,{useEffect,useRef,useState} from 'react';
import {cmsApi} from './CmsContent';
const topics=['Productions','Festivals and Awards','Press Releases'];
export default function NewsAlertsForm() {
 const [selected,setSelected]=useState(['Productions']),[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
 const request=useRef(null);useEffect(()=>()=>request.current?.abort(),[]);
 async function submit(event){
  event.preventDefault();if(busy)return;setError('');if(!selected.length){setError('Choose at least one topic.');return;}
  const form=new FormData(event.currentTarget),controller=new AbortController();request.current=controller;const timeout=setTimeout(()=>controller.abort(),30000);setBusy(true);
  try {
   const csrf=await fetch(`${cmsApi}/csrf`,{credentials:'same-origin',signal:controller.signal});if(!csrf.ok)throw new Error('Unable to prepare your request. Please try again.');
   const {token}=await csrf.json();
   const response=await fetch(`${cmsApi}/newsletter/subscribe`,{method:'POST',credentials:'same-origin',signal:controller.signal,headers:{'Content-Type':'application/json','X-CSRF-Token':token},body:JSON.stringify({email:form.get('email'),topics:selected,consent:form.get('consent')==='true',website:form.get('website')})});
   const result=await response.json();if(!response.ok)throw new Error(result.error||'Unable to save your preferences.');setMessage(result.message);
  }catch(reason){setError(reason.name==='AbortError'?'The request timed out. Check your inbox before trying again.':reason.message);}finally{clearTimeout(timeout);setBusy(false);request.current=null;}
 }
 if(message)return <div className="news-alert-success" role="status"><h3>Check your inbox</h3><p>{message}</p></div>;
 return <form className="news-alert-form" onSubmit={submit}><fieldset disabled={busy}><label className="news-alert-email">Email address<input type="email" name="email" required maxLength="254" autoComplete="email"/></label><fieldset className="news-alert-topics"><legend>Choose your topics</legend>{topics.map(topic=><label key={topic}><input type="checkbox" checked={selected.includes(topic)} onChange={event=>setSelected(current=>event.target.checked?[...current,topic]:current.filter(value=>value!==topic))}/>{topic}</label>)}</fieldset><label className="enquiry-honeypot" aria-hidden="true">Website<input name="website" tabIndex="-1" autoComplete="off"/></label><label className="news-alert-consent"><input type="checkbox" name="consent" value="true" required/><span>I agree to receive KEMSOR news by email. See our <a href="/privacy-policy/">Privacy Policy</a>.</span></label><p className="news-alert-note">Confirm your email to activate alerts. You can unsubscribe using the link in your confirmation email.</p>{error&&<p className="news-alert-error" role="alert">{error}</p>}<button type="submit" className="creative-cta">{busy?'Saving preferences…':'Get Alerts'}</button></fieldset></form>;
}
