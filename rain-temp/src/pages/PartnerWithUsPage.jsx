import {cmsText} from '../siteContent';
import StudioImage from '../StudioImage';
import PageVisuals from '../VisualChapters';
import React, {useEffect,useRef,useState} from 'react';
import {CTA} from '../PageUI';
import SiteIcon from '../SiteIcon';
import {partnerRoutes} from './partnerRoutes';
import './partner-with-us.css';

function RouteList({title,items,ordered=false}){const Tag=ordered?'ol':'ul';return <section className="partner-route-list"><h3>{title}</h3><Tag>{items.map(item=><li key={item}>{item}</li>)}</Tag></section>}
export default function PartnerWithUsPage(){
 const initial=()=>{const id=new URLSearchParams(location.search).get('route');return partnerRoutes.some(route=>route.id===id)?id:'filmmakers';};
 const [active,setActive]=useState(initial);
 const routeTabs=useRef([]);
 useEffect(()=>{const back=()=>setActive(initial());addEventListener('popstate',back);return()=>removeEventListener('popstate',back);},[]);
 const route=partnerRoutes.find(route=>route.id===active);
 const choose=id=>{setActive(id);const url=new URL(location.href);url.searchParams.set('route',id);history.replaceState(history.state,'',`${url.pathname}${url.search}${url.hash}`);};
 const selectTabWithKey=(event,index)=>{let next;if(event.key==='ArrowRight')next=(index+1)%partnerRoutes.length;else if(event.key==='ArrowLeft')next=(index+partnerRoutes.length-1)%partnerRoutes.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=partnerRoutes.length-1;else return;event.preventDefault();choose(partnerRoutes[next].id);routeTabs.current[next]?.focus();};
 const selectedIndex=partnerRoutes.findIndex(item=>item.id===active);
 return <PageVisuals page="partner-with-us"><div className="partner-page">
  <section className="inner-hero partner-page-hero partner-width"><p className="partner-page-eyebrow">{cmsText("PartnerWithUsPage","6b12f79334b87c46","PARTNER WITH US")}</p><h1>{cmsText("PartnerWithUsPage","cbe8a0231f5c169d","Partner with us.")}</h1><h2>{cmsText("PartnerWithUsPage","4312a5ad1dafa0e7","Four ways in.")}<br/><span>{cmsText("PartnerWithUsPage","02b4a7daf8e8b7f6","One team behind every one.")}</span></h2><p>{cmsText("PartnerWithUsPage","cfa090add84f0987","Choose the option that fits your role and project. Each route explains how Kemsor can help and what to include in your enquiry.")}</p></section>
  <section className="partner-route-picker partner-width" aria-labelledby="partner-route-label">
   <p className="partner-page-eyebrow" id="partner-route-label">{cmsText("PartnerWithUsPage","0270484c5651c92a","CHOOSE YOUR ROUTE")}</p>
   <div className="partner-connected-tabs" role="tablist" aria-label="Choose your partnership route">{partnerRoutes.map((item,index)=><button ref={node=>{routeTabs.current[index]=node}} key={item.id} id={`partner-tab-${item.id}`} type="button" role="tab" className="partner-route-tab" aria-selected={active===item.id} tabIndex={active===item.id?0:-1} aria-controls="partner-route-panel" onClick={()=>choose(item.id)} onKeyDown={event=>selectTabWithKey(event,index)}>{item.tag.replace(/^For /,'')}<SiteIcon name={active===item.id?'check':'arrow-right'} size={17}/></button>)}</div>
   <section id="partner-route-panel" role="tabpanel" tabIndex={0} className="partner-connected-panel" aria-labelledby={`partner-tab-${active}`} key={active}>
    <div className="partner-selected-intro">
     <div className="partner-selected-card"><StudioImage mediaSlot="PartnerWithUsPage-1" src={`/assets/stills/${['work-period-camera','work-camera-crew','financing-co-production','daylight-valley-production'][selectedIndex]}-640.webp`} alt="" width="640" height="360" loading="lazy" decoding="async"/><strong>{route.card}</strong><p>{route.line}</p></div>
     <div className="partner-route-heading"><p className="partner-page-eyebrow">{route.tag}</p><h2 id="partner-route-heading">{route.heading}</h2><p>{route.intro}</p></div>
    </div>
   <div className="partner-route-grid"><div className="partner-route-copy"><RouteList title={cmsText("PartnerWithUsPage","a6b9a2ad040a16d6","What we offer you")} items={route.offers}/><RouteList title={cmsText("PartnerWithUsPage","6dd74e5cb2f4f252","What to send")} items={route.send}/><RouteList title={cmsText("PartnerWithUsPage","464f1640c107281d","What happens next")} items={route.next} ordered/><aside className="partner-route-note">{route.note}</aside></div><section className="partner-route-form"><h3>{route.formHeading}</h3><p>Send your enquiry through our contact page. Your enquiry type will be selected for you.</p><CTA href={`/contact/?category=${route.category}#project-brief`}>{route.submit}</CTA></section></div>
   </section>
  </section>
  <section className="partner-business-channels partner-width"><h2>{cmsText("PartnerWithUsPage","a68d106b81002f89","Other ways to work together")}</h2><div>{[[cmsText("PartnerWithUsPage","584b423c36148843","Marketing & brand collaboration"),'brand'],[cmsText("PartnerWithUsPage","286f1ef0d1b8610a","Distribution & OTT partnerships"),'distribution'],[cmsText("PartnerWithUsPage","df1f3e0ef4bd2d48","Production partner registration"),'partner_registration'],[cmsText("PartnerWithUsPage","aa7fb42209f721f4","Strategic business partnerships"),'partnerships']].map(([label,category])=><a className="line-link" key={category} href={`/contact/?category=${category}#project-brief`}>{label}</a>)}</div></section>
  <section className="partner-general partner-width"><div><h2>{cmsText("PartnerWithUsPage","2ac6f0c0a291bc48","Not sure which route fits?")}</h2><p>{cmsText("PartnerWithUsPage","9b9607e2402d2fee","Write to us anyway. We’ll point you to the right person.")}</p></div><CTA href="/contact/">{cmsText("PartnerWithUsPage","57d106bf5878bc1a","General enquiry")}</CTA></section>
 </div></PageVisuals>;
}
