import SiteIcon from './SiteIcon';
import React, { useEffect, useRef } from 'react';
import './enquiry-success.css';
export default function EnquirySuccess({reference,onAnother,message='Your enquiry has been submitted successfully. Our team will review your message and contact you soon.'}){
 const panel=useRef(null);
 useEffect(()=>{panel.current?.focus({preventScroll:true});panel.current?.scrollIntoView({behavior:'instant',block:'nearest'});},[]);
 return <div className="enquiry-success" ref={panel} role="status" tabIndex="-1"><span className="enquiry-success-mark" aria-hidden="true"><SiteIcon name="check" /></span><div><h2>Thank you for reaching out.</h2><p>{message}</p>{reference&&<p className="enquiry-success-reference">Your reference: <strong>{reference}</strong></p>}{onAnother&&<button type="button" className="enquiry-success-another" onClick={onAnother}>Send another enquiry</button>}</div></div>;
}
