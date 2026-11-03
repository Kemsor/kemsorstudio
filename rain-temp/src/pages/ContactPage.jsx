import {cmsText} from '../siteContent';
import { ConsentMap } from '../CookieConsent';
import { getStudioContacts } from '../studioContact';
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
 const {email:studioEmail,phone:studioPhone,phoneHref:studioPhoneHref}=getStudioContacts(settings);
 const selectedCategory=new URLSearchParams(location.search).get('category');
 const enquiryCategory=['business','partnerships','press','careers','production','copyright','general','creative','brand','distribution','financing','international','partner_registration'].includes(selectedCategory)?selectedCategory:'general';
 const address=settings.contact_address&&!/sample|example/i.test(settings.contact_address)?settings.contact_address:studioAddress;
 const partnerId=new URLSearchParams(location.search).get('partner');
 if(Object.hasOwn(partners,partnerId))return <><EditorialHero compact page="contact" eyebrow={cmsText("ContactPage","0ea6b18448f6a097","CONTACT")} title={partners[partnerId]}/><EnquiryForm standalone showHeading={false} title={partners[partnerId]} initialCategory={partnerId==='co-producers'?'partnerships':'production'} initialSubject={`${partners[partnerId]} enquiry`}/></>;
 return <><EditorialHero compact page="contact" eyebrow={cmsText("ContactPage","38eab4e9a0eecaab","CONTACT")} title={cmsText("ContactPage","2100e437109ba54f","General enquiry")}/><div className="contact-simple">
  <div className="contact-simple-grid">
   <section id="project-brief" className="contact-form-column" aria-labelledby="contact-form-title"><MotionHeading as="h2" id="contact-form-title" className="ep-form-heading">{cmsText("ContactPage","6c72d2d9e46ec942","General enquiry")}</MotionHeading><EnquiryForm standalone showHeading={false} initialCategory={enquiryCategory}/></section>
   <aside className="contact-details" aria-labelledby="contact-details-title"><MotionHeading as="h2" id="contact-details-title">{cmsText("ContactPage","c4f0efba9892596f","Contact details")}</MotionHeading>{settings.contact_note&&<p className="contact-sample-label">{settings.contact_note}</p>}<dl><dt>{cmsText("ContactPage","5f434e833a259cc5","Email")}</dt><dd>{<a href={`mailto:${studioEmail}`}>{studioEmail}</a>}</dd><dt>{cmsText("ContactPage","5d7f8cc7fd7df74f","Phone")}</dt><dd>{<a href={studioPhoneHref}>{studioPhone}</a>}</dd><dt>{cmsText("ContactPage","93223b77aec35cff","Address")}</dt><dd style={{whiteSpace:'pre-line'}}>{address}</dd></dl>
    <MotionHeading as="h2">{cmsText("ContactPage","0822e7f0e843498a","Find the studio")}</MotionHeading><p className="contact-map-caption">{settings.map_caption||'Dehradun, Uttarakhand'}</p><ConsentMap className="studio-location-map" title={cmsText("ContactPage","2b4e55daf55c6b21","Google Map showing Kemsor Studios in Dehradun")} src={settings.map_location&&!/sample|mumbai/i.test(settings.map_location)?`https://maps.google.com/maps?q=${encodeURIComponent(settings.map_location)}&z=15&output=embed`:studioMapEmbed} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/>

   </aside>
  </div>
 </div></>;
}
export default ContactPage;
