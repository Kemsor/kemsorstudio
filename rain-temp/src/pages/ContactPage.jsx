import { studioEmail, studioPhone, studioPhoneHref } from '../studioContact';
import {studioAddress,studioMapEmbed} from '../studioLocation';
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
 const selectedCategory=new URLSearchParams(location.search).get('category');
 const enquiryCategory=['business','partnerships','press','careers','production','copyright','general','creative','brand','distribution','financing','international','partner_registration'].includes(selectedCategory)?selectedCategory:'general';
 const address=settings.contact_address&&!/sample|example/i.test(settings.contact_address)?settings.contact_address:studioAddress;
 const partnerId=new URLSearchParams(location.search).get('partner');
 if(Object.hasOwn(partners,partnerId))return <><EditorialHero compact page="contact" eyebrow="CONTACT" title={partners[partnerId]}/><EnquiryForm standalone showHeading={false} title={partners[partnerId]} initialCategory={partnerId==='co-producers'?'partnerships':'production'} initialSubject={`${partners[partnerId]} enquiry`}/></>;
 return <><EditorialHero compact page="contact" eyebrow="CONTACT" title="General enquiry"/><div className="contact-simple">
  <div className="contact-simple-grid">
   <section id="project-brief" className="contact-form-column" aria-labelledby="contact-form-title"><MotionHeading as="h2" id="contact-form-title" className="ep-form-heading">General enquiry</MotionHeading><EnquiryForm standalone showHeading={false} initialCategory={enquiryCategory}/></section>
   <aside className="contact-details" aria-labelledby="contact-details-title"><MotionHeading as="h2" id="contact-details-title">Contact details</MotionHeading>{settings.contact_note&&<p className="contact-sample-label">{settings.contact_note}</p>}<dl><dt>Email</dt><dd>{<a href={`mailto:${studioEmail}`}>{studioEmail}</a>}</dd><dt>Phone</dt><dd>{<a href={studioPhoneHref}>{studioPhone}</a>}</dd><dt>Address</dt><dd style={{whiteSpace:'pre-line'}}>{address}</dd></dl>
    <MotionHeading as="h2">Find the studio</MotionHeading><p className="contact-map-caption">Dehradun, Uttarakhand</p><iframe className="studio-location-map" title="Google Map showing Kemsor Studios in Dehradun" src={settings.map_location&&!/sample|mumbai/i.test(settings.map_location)?`https://maps.google.com/maps?q=${encodeURIComponent(settings.map_location)}&z=15&output=embed`:studioMapEmbed} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/>

   </aside>
  </div>
 </div></>;
}
export default ContactPage;
