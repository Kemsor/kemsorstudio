import MotionHeading from '../TextMotion';
import { EditorialHero } from '../EditorialPage';
import React from 'react';
import EnquiryForm from '../EnquiryForm';
import {useCms} from '../CmsContent';
import './contact-page.css';
const partners = {
 filmmakers:'Filmmakers & creators', studios:'Studios & platforms',
 'co-producers':'Co-producers & financiers', 'international-productions':'International productions',
};
export function ContactPage() {
 const {settings}=useCms();
 const partnerId=new URLSearchParams(location.search).get('partner');
 if(Object.hasOwn(partners,partnerId))return <><EditorialHero compact page="contact" eyebrow="CONTACT" title={partners[partnerId]}/><EnquiryForm standalone showHeading={false} title={partners[partnerId]} initialCategory={partnerId==='co-producers'?'partnerships':'production'} initialSubject={`${partners[partnerId]} enquiry`}/></>;
 return <><EditorialHero compact page="contact" eyebrow="CONTACT" title="General enquiry"/><div className="contact-simple">
  <div className="contact-simple-grid">
   <section id="project-brief" className="contact-form-column" aria-labelledby="contact-form-title"><MotionHeading as="h2" id="contact-form-title" className="ep-form-heading">General enquiry</MotionHeading><EnquiryForm standalone showHeading={false} initialCategory="general"/></section>
   <aside className="contact-details" aria-labelledby="contact-details-title"><MotionHeading as="h2" id="contact-details-title">Contact details</MotionHeading>{settings.contact_note&&<p className="contact-sample-label">{settings.contact_note}</p>}<dl><dt>Email</dt><dd>{settings.contact_email?<a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a>:'Not provided yet'}</dd><dt>Phone</dt><dd>{settings.contact_phone?<a href={`tel:${settings.contact_phone.replace(/[^+0-9]/g,'')}`}>{settings.contact_phone}</a>:'Not provided yet'}</dd><dt>Address</dt><dd style={{whiteSpace:'pre-line'}}>{settings.contact_address||'Not provided yet'}</dd></dl>
    {settings.map_location&&<><MotionHeading as="h2">Location</MotionHeading>{settings.map_caption&&<p className="contact-map-caption">{settings.map_caption}</p>}<iframe title="Studio location map" src={`https://maps.google.com/maps?q=${encodeURIComponent(settings.map_location)}&z=14&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen/></>}
   </aside>
  </div>
 </div></>;
}
export default ContactPage;
