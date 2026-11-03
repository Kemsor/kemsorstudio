import {cmsText} from '../siteContent';
import StudioImage from '../StudioImage';
import PageVisuals from '../VisualChapters';
import React, {useEffect,useRef,useState} from 'react';
import {cmsApi,useCms} from '../CmsContent';
import {CTA} from '../PageUI';
import SiteIcon from '../SiteIcon';
import EnquirySuccess from '../EnquirySuccess';
import {partnerRoutes} from './partnerRoutes';
import './partner-with-us.css';

function PartnerField({field,prefix}){
 const {name,label,type,required,options}=field;
 const id=`${prefix}-${name}`;
 if(type==='checkboxes')return <fieldset className="partner-check-options"><legend>{label}</legend><div>{options.map(option=><label key={option}><input type="checkbox" name={name} value={option}/><span>{option}</span></label>)}</div></fieldset>;
 const maxLength=name==='name'?100:name==='organisation'?150:type==='email'?254:type==='url'?1000:type==='textarea'?3500:200;
 const props={id,name,required,maxLength};
 return <label className={`partner-field ${type==='textarea'?'partner-field-wide':''}`} htmlFor={id}><span>{label}{required&&<span className="partner-required" aria-hidden="true"> *</span>}</span>
 {type==='select'?<select {...props} defaultValue=""><option value="" disabled={required}>{cmsText("PartnerWithUsPage","1f07db5a51f30ee4","Choose an option")}</option>{options.map(option=><option key={option} value={option}>{option}</option>)}</select>:type==='textarea'?<textarea {...props} rows={name==='logline'?4:6}/>:<input {...props} type={type} autoComplete={({name:'name',email:'email',organisation:'organization',phone:'tel',country:'country-name'})[name]||'off'}/>}
 </label>;
}
function PartnerForm({route}){
 const {settings,connected}=useCms();
 const [busy,setBusy]=useState(false),[result,setResult]=useState(null),[error,setError]=useState('');
 const request=useRef(null),errorBox=useRef(null);
 useEffect(()=>()=>{const controller=request.current;request.current=null;controller?.abort();},[]);
 const unavailable=!connected||!settings.enquiries_enabled;
 const submit=async event=>{
  event.preventDefault();if(busy||unavailable)return;
  const form=event.currentTarget,data=new FormData(form);
  setError('');
  if(data.get('shoot_start')&&data.get('shoot_end')&&data.get('shoot_end')<data.get('shoot_start')){setError('Shoot end must be on or after the shoot start.');requestAnimationFrame(()=>errorBox.current?.focus());return;}
  const details=[route.tag,...route.fields.map(field=>{
   const value=data.getAll(field.name).filter(Boolean).join(', ');
   return value?`${field.label}: ${value}`:null;
  }).filter(Boolean),route.ack?`Acknowledgement: ${route.ack}`:null,route.optionalAck?`NDA requested: ${data.has('nda')?cmsText("PartnerWithUsPage","6f176748af06814b","Yes"):cmsText("PartnerWithUsPage","65eaf42d7c997536","No")}`:null,cmsText("PartnerWithUsPage","5d943ab417dd4a09","Privacy consent: Accepted")].filter(Boolean).join('\n\n');
  if(details.length>8000){setError('Please shorten the enquiry to a total of 8,000 characters, including the form details.');requestAnimationFrame(()=>errorBox.current?.focus());return;}
  const controller=new AbortController();request.current=controller;
  const timeout=setTimeout(()=>controller.abort(),30000);setBusy(true);
  try{
   const csrf=await fetch(`${cmsApi}/csrf`,{credentials:'same-origin',signal:controller.signal});
   if(!csrf.ok)throw Error('Could not prepare the enquiry. Please try again.');
   const {token}=await csrf.json();
   const response=await fetch(`${cmsApi}/enquiries`,{method:cmsText("PartnerWithUsPage","ae681dbd53056ac3","POST"),credentials:'same-origin',headers:{'Content-Type':'application/json','X-CSRF-Token':token},signal:controller.signal,body:JSON.stringify({category:route.category,source:`/partner-with-us/?route=${route.id}`,name:data.get('name'),email:data.get('email'),organisation:data.get('organisation')||'',subject:`${route.tag}: ${data.get('project_title')||route.formHeading}`.slice(0,200),message:details,consent:data.get('consent')==='true',website:data.get('website')||''})});
   const body=await response.json().catch(()=>{throw Error('The enquiry service is unavailable. Please try again.');});
   if(!response.ok)throw Error(body.error||'Could not send your enquiry.');
   if(!body.reference)throw Error('The studio did not return a confirmation. Please check with us before sending again.');
   setResult(body);
  }catch(reason){if(!controller.signal.aborted){setError(reason.message);requestAnimationFrame(()=>errorBox.current?.focus());}else if(request.current===controller){setError('Sending was interrupted. Check with the studio before sending again.');}}
  finally{clearTimeout(timeout);if(request.current===controller){request.current=null;setBusy(false);}}
 };
 if(result)return <EnquirySuccess reference={result.reference} onAnother={()=>setResult(null)}/>;
 return <form className="partner-route-form" onSubmit={submit} aria-labelledby="partner-form-title" aria-busy={busy}>
  <h3 id="partner-form-title">{route.formHeading}</h3><p className="partner-form-helper">{cmsText("PartnerWithUsPage","45656e0db52f2576","Fields marked * are required.")}</p>
  {unavailable&&<p className="partner-form-status" role="status">{cmsText("PartnerWithUsPage","44e48d18be91f2f2","Enquiry submissions are currently unavailable. Please try again later.")}</p>}
  <fieldset className="partner-form-fields" disabled={busy||unavailable}>
   <input type="hidden" name="partner_route" value={route.tag}/><input type="hidden" name="category" value={route.category}/>
   <div className="partner-fields-grid">{route.fields.map(field=><PartnerField key={field.name} field={field} prefix={route.id}/>)}</div>
   {route.ack&&<label className="partner-ack"><input name="acknowledgement" type="checkbox" value="true" required/><span>{route.ack}<span aria-hidden="true"> *</span></span></label>}
   {route.optionalAck&&<label className="partner-ack"><input name="nda" type="checkbox" value="true"/><span>{route.optionalAck}</span></label>}
   <label className="enquiry-honeypot" aria-hidden="true">{cmsText("PartnerWithUsPage","49b9ec66c5648f3f","Website")}<input name="website" tabIndex="-1" autoComplete="off"/></label>
   <p className="partner-privacy">{cmsText("PartnerWithUsPage","127de7d7747d123e","We use your details only to respond to your enquiry. See our ")}<a href="/legal/">{cmsText("PartnerWithUsPage","0dd28f0db442c8b4","Legal & Privacy")}</a>{cmsText("PartnerWithUsPage","dfbd871c01c8837b"," page.")}</p>
   {settings.privacy_notice&&<p className="partner-privacy">{settings.privacy_notice}</p>}
   <label className="partner-ack"><input type="checkbox" name="consent" value="true" required/><span>{cmsText("PartnerWithUsPage","6d1e1de30dd5314b","I agree to my details being used for this enquiry as described above. *")}</span></label>
   <button className="partner-submit" type="submit">{busy?'Sending enquiry…':route.submit}<SiteIcon name="arrow" size={17}/></button>
  </fieldset>
  {error&&<p className="partner-form-error" role="alert" tabIndex="-1" ref={errorBox}>{error}</p>}
 </form>;
}
function RouteList({title,items,ordered=false}){const Tag=ordered?'ol':'ul';return <section className="partner-route-list"><h3>{title}</h3><Tag>{items.map(item=><li key={item}>{item}</li>)}</Tag></section>}
export default function PartnerWithUsPage(){
 const initial=()=>{const id=new URLSearchParams(location.search).get('route');return partnerRoutes.some(route=>route.id===id)?id:'filmmakers';};
 const [active,setActive]=useState(initial);
 useEffect(()=>{const back=()=>setActive(initial());addEventListener('popstate',back);return()=>removeEventListener('popstate',back);},[]);
 const route=partnerRoutes.find(route=>route.id===active);
 const choose=id=>{setActive(id);const url=new URL(location.href);url.searchParams.set('route',id);history.replaceState(history.state,'',`${url.pathname}${url.search}${url.hash}`);};
 return <PageVisuals page="partner-with-us"><div className="partner-page">
  <section className="inner-hero partner-page-hero partner-width"><p className="partner-page-eyebrow">{cmsText("PartnerWithUsPage","6b12f79334b87c46","PARTNER WITH US")}</p><h1>{cmsText("PartnerWithUsPage","cbe8a0231f5c169d","Partner with us.")}</h1><h2>{cmsText("PartnerWithUsPage","4312a5ad1dafa0e7","Four ways in.")}<br/><span>{cmsText("PartnerWithUsPage","02b4a7daf8e8b7f6","One team behind every one.")}</span></h2><p>{cmsText("PartnerWithUsPage","cfa090add84f0987","Choose the option that fits your role and project. Each route explains how Kemsor can help and what to include in your enquiry.")}</p></section>
  <section className="partner-route-picker partner-width" aria-labelledby="partner-route-label"><p className="partner-page-eyebrow" id="partner-route-label">{cmsText("PartnerWithUsPage","0270484c5651c92a","CHOOSE YOUR ROUTE")}</p><div className="partner-route-cards" role="group" aria-label="Choose your partnership route">{partnerRoutes.map((item,index)=><button key={item.id} type="button" className="partner-route-card" aria-pressed={active===item.id} aria-controls="partner-route-panel" onClick={()=>choose(item.id)}><span className="partner-route-card-top"><span>0{index+1}</span><span className="partner-route-selection" aria-hidden="true"><SiteIcon name={active===item.id?'check':'plus'} size={16}/></span><span className="partner-route-active-label">{active===item.id?'Selected route':'Select route'}</span></span><span className={`partner-route-image partner-route-shape-${index}`} aria-hidden="true"><StudioImage mediaSlot="PartnerWithUsPage-1" src={`/assets/stills/${['work-period-camera','work-camera-crew','financing-co-production','daylight-valley-production'][index]}-640.webp`} alt="" width="640" height="360" loading="lazy" decoding="async"/></span><span className="partner-route-tag">{item.tag}</span><strong>{item.card}</strong><span className="partner-route-line">{item.line}</span></button>)}</div></section>
  <section id="partner-route-panel" className="partner-route-panel partner-width" aria-labelledby="partner-route-heading" key={active}>
   <div className="partner-route-heading"><p className="partner-page-eyebrow">{route.tag}</p><h2 id="partner-route-heading">{route.heading}</h2><p>{route.intro}</p></div>
   <div className="partner-route-grid"><div className="partner-route-copy"><RouteList title={cmsText("PartnerWithUsPage","a6b9a2ad040a16d6","What we offer you")} items={route.offers}/><RouteList title={cmsText("PartnerWithUsPage","6dd74e5cb2f4f252","What to send")} items={route.send}/><RouteList title={cmsText("PartnerWithUsPage","464f1640c107281d","What happens next")} items={route.next} ordered/><aside className="partner-route-note">{route.note}</aside></div><PartnerForm route={route}/></div>
  </section>
  <section className="partner-business-channels partner-width"><h2>{cmsText("PartnerWithUsPage","a68d106b81002f89","Other ways to work together")}</h2><div>{[[cmsText("PartnerWithUsPage","584b423c36148843","Marketing & brand collaboration"),'brand'],[cmsText("PartnerWithUsPage","286f1ef0d1b8610a","Distribution & OTT partnerships"),'distribution'],[cmsText("PartnerWithUsPage","df1f3e0ef4bd2d48","Production partner registration"),'partner_registration'],[cmsText("PartnerWithUsPage","aa7fb42209f721f4","Strategic business partnerships"),'partnerships']].map(([label,category])=><a className="line-link" key={category} href={`/contact/?category=${category}#project-brief`}>{label}</a>)}</div></section>
  <section className="partner-general partner-width"><div><h2>{cmsText("PartnerWithUsPage","2ac6f0c0a291bc48","Not sure which route fits?")}</h2><p>{cmsText("PartnerWithUsPage","9b9607e2402d2fee","Write to us anyway. We’ll point you to the right person.")}</p></div><CTA href="/contact/">{cmsText("PartnerWithUsPage","57d106bf5878bc1a","General enquiry")}</CTA></section>
 </div></PageVisuals>;
}
