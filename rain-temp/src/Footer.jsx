import {footerMenu,footerSocialProfiles} from './menu-catalogue';
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
const socialIcons={facebook:faFacebookF,instagram:faInstagram,youtube:faYoutube,linkedin:faLinkedinIn,whatsapp:faWhatsapp};

function SocialIcons({settings}) {
  const menu=getSiteModule('navigation',{});
  const links=footerSocialProfiles(settings).filter(({id,href})=>href&&menu[`footer.social.${id}.enabled`]!==false);
  if(!links.length)return null;
  return <div className="footer-grid-social-group">
    <p>{settings.footer_social_label||'Follow the frame'}</p>
    <div className="footer-socials" role="group" aria-label="Kemsor social media">
      {links.map(({id,label,href})=>{
        const [width,height,,,path]=socialIcons[id].icon;
        return <a key={id} className={`footer-social-icon footer-social-${id}`} href={href} target="_blank" rel="noopener noreferrer" aria-label={`Kemsor on ${label}`} title={label}>
          <svg viewBox={`0 0 ${width} ${height}`} fill="currentColor" aria-hidden="true" focusable="false"><path d={path}/></svg>
        </a>;
      })}
    </div>
  </div>;
}

export default function Footer({ reduced, page = 'home' }) {
  const {openPreferences}=useCookieConsent();
  const {settings,legalDocuments}=useCms();
  const groups=applyNavigation(footerMenu,'footer').map(group=>({...group,links:group.links.map(link=>[link.label,link.page,link.href])})).map(group=>({...group,links:group.links.flatMap(link=>link[1]==='privacy-policy'&&Array.isArray(legalDocuments)?legalDocuments.filter(document=>document.footer).map(document=>[document.footerLabel||document.title,document.slug,legalHref(document.slug)]):[link])}));
  const {email,phone,phoneHref,landline,landlineHref}=getStudioContacts(settings);
  const address = settings.contact_address && !/sample|example/i.test(settings.contact_address) ? settings.contact_address : studioAddress;
  const branding=getSiteModule('branding',{});
  const orderedGroups=[...groups].sort((a,b)=>['studio','explore','connected','custom'].indexOf(a.id)-['studio','explore','connected','custom'].indexOf(b.id));
  return <footer id="studio-footer" className="creative-footer footer-grid">
    <div className="footer-grid-layout">
      <div className="footer-grid-brand-column">
        <a className="footer-grid-brand" href="/" aria-label="Kemsor Studios home">
          <img src={branding.logo||'/assets/kemsor-logo.webp'} alt="" width="250" height="250" loading="lazy" decoding="async"/>
        </a>
        <SocialIcons settings={settings}/>
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
