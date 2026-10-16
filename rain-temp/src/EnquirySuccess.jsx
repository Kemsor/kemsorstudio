import React, { useEffect, useRef } from 'react';
import './enquiry-success.css';
export default function EnquirySuccess({reference,onAnother,message='Your enquiry has been submitted successfully. Our team will review your message and contact you soon.'}){
 const panel=useRef(null);
 useEffect(()=>{panel.current?.focus({preventScroll:true});panel.current?.scrollIntoView({behavior:'instant',block:'nearest'});},[]);
 return <div className="enquiry-success" ref={panel} role="status" tabIndex="-1"><span className="enquiry-success-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m5 12 4 4L19 6"/></svg></span><div><h2>Thank you for reaching out.</h2><p>{message}</p>{reference&&<p className="enquiry-success-reference">Your reference: <strong>{reference}</strong></p>}{onAnother&&<button type="button" className="enquiry-success-another" onClick={onAnother}>Send another enquiry</button>}</div></div>;
}
