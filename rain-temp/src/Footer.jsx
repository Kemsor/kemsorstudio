import footerNavigation from '../../shared/footer-navigation.json';
import {applyNavigation,cmsText,getSiteModule} from './siteContent';
import {legalHref} from './LegalDocument';
import { useCookieConsent } from './CookieConsent';
import { getStudioContacts } from './studioContact';
import {studioAddress} from './studioLocation';
import { faFacebookF, faInstagram, faYoutube, faLinkedinIn, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import React from 'react';
import { pageHref } from './pageInfo';
import './footer-socials.css';
import './footer-jumbo.css';
import './footer-editorial.css';
import './footer-compact.css';
import './footer-grid.css';
import { useCms } from './CmsContent';

// Official brand artwork; Lucide intentionally excludes social brand logos.
const socials = [
 {name:'Facebook',href:'https://www.facebook.com/kemsorstudio',icon:faFacebookF},
 {name:'Instagram',href:'https://www.instagram.com/kemsorstudio/',icon:faInstagram},
 {name:'YouTube',href:null,icon:faYoutube},
 {name:'LinkedIn',href:null,icon:faLinkedinIn},
];

function SocialIcons() {
  const { settings } = useCms();
  const {whatsapp,whatsappHref}=getStudioContacts(settings);
  const links=[...socials,...(whatsapp?[{name:'WhatsApp',href:whatsappHref,icon:faWhatsapp}]:[])];
  return <div className="footer-socials" role="group" aria-label="Kemsor social media">
    {links.map(({ name, href: fallback, icon }) => {
      const configured = name==='WhatsApp'?whatsappHref:settings[name.toLowerCase()];
      const href = typeof configured === 'string' ? configured : fallback;
      const [width,height,,,path] = icon.icon;
      const graphic = <svg viewBox={`0 0 ${width} ${height}`} fill="currentColor" aria-hidden="true" focusable="false"><path d={path} /></svg>;
      const className = `footer-social-icon footer-social-${name.toLowerCase()}`;
      return href ? <a key={name} className={className} href={href} target="_blank" rel="noopener noreferrer" aria-label={name==='WhatsApp'?`WhatsApp only: ${whatsapp}`:`Kemsor on ${name}`} title={name==='WhatsApp'?`WhatsApp: ${whatsapp}`:name}>{graphic}</a> : <span key={name} className={className} role="img" aria-label={`${name}: profile link coming soon`} title={`${name}: profile link coming soon`}>{graphic}</span>;
    })}
  </div>;
}



export default function Footer({ reduced, page = 'home' }) {
  const {openPreferences}=useCookieConsent();
  const {settings,legalDocuments}=useCms();
  const groups=applyNavigation(footerNavigation,'footer').map(group=>({...group,links:group.links.map(link=>[link.label,link.page,link.href])})).map(group=>({...group,links:group.links.flatMap(link=>link[1]==='privacy-policy'&&Array.isArray(legalDocuments)?legalDocuments.filter(document=>document.footer).map(document=>[document.footerLabel||document.title,document.slug,legalHref(document.slug)]):[link])}));
  const {email,phone,phoneHref,landline,landlineHref}=getStudioContacts(settings);
  const address = settings.contact_address && !/sample|example/i.test(settings.contact_address) ? settings.contact_address : studioAddress;
  const branding=getSiteModule('branding',{});
  const orderedGroups=[...groups].sort((a,b)=>['studio','explore','connected'].indexOf(a.id)-['studio','explore','connected'].indexOf(b.id));
  return <footer className="creative-footer footer-grid">
    <div className="footer-grid-layout">
      <div className="footer-grid-brand-column">
        <a className="footer-grid-brand" href="/" aria-label="Kemsor Studios home">
          <img src={branding.logo||'/assets/kemsor-logo.webp'} alt="" width="70" height="70" loading="lazy" decoding="async"/>
          <span>Kemsor<br/><span>Studios</span></span>
        </a>
        <div className="footer-grid-social-group"><p>{settings.footer_social_label||'Follow the frame'}</p><SocialIcons/></div>
      </div>
      <div className="footer-grid-information">
        <nav className="footer-grid-navigation" aria-label="Footer navigation">{orderedGroups.map(group=><div className="footer-grid-link-group" key={group.id}>
          <h3>{group.title}</h3><div>{group.links.map(([label,key,href])=><a key={href||key} href={href||pageHref(key)} aria-current={page===key?'page':undefined}>{label}</a>)}</div>
        </div>)}</nav>
        <div className="footer-grid-contacts footer-contact-column">
          <div className="footer-info-block"><h3>{address?'Our location':'The studio'}</h3><p>{address||'Contact the studio for production enquiries.'}</p><a href={`mailto:${email}`}>{email}</a></div>
          <div className="footer-info-block"><h3>{cmsText('Footer','a684c056996ee3b3','Call the studio')}</h3>{landline&&<p><span>Landline</span><a href={landlineHref}>{landline}</a></p>}{phone&&<p><span>Mobile · calls only</span><a href={phoneHref}>{phone}</a></p>}</div>
        </div>
      </div>
    </div>
    <div className="footer-grid-baseline">
      <p>© {new Date().getFullYear()} {settings.footer_copyright||'Kemsor Studios'}. All rights reserved.</p>
      <div className="footer-grid-tools"><div id="footer-guide-slot" className="footer-guide-slot"/><button type="button" className="cookie-footer-button" onClick={openPreferences}>{cmsText('Footer','bdc267b775d4971d','Cookie preferences')}</button></div>
    </div>
    {reduced&&<span className="sr-only">{cmsText('Footer','c66ed758780a0707','Your reduced motion preference is respected.')}</span>}
  </footer>;
}
