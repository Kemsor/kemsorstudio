import { studioEmail, studioPhone, studioPhoneHref } from './studioContact';
import {studioAddress} from './studioLocation';
import RollingLabel from './RollingLabel';
import { faFacebookF, faInstagram, faYoutube, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';
import React, { useEffect, useRef, useState } from 'react';
import { pageHref } from './pageInfo';
import SiteIcon from './SiteIcon';
import './footer-socials.css';
import './footer-jumbo.css';
import './footer-editorial.css';
import './footer-compact.css';
import { useCms } from './CmsContent';

// Official brand artwork; Lucide intentionally excludes social brand logos.
const socials = [
 {name:'Facebook',href:null,icon:faFacebookF},
 {name:'Instagram',href:null,icon:faInstagram},
 {name:'YouTube',href:null,icon:faYoutube},
 {name:'LinkedIn',href:null,icon:faLinkedinIn},
];

function SocialIcons() {
  const { settings } = useCms();
  return <div className="footer-socials" role="group" aria-label="Kemsor social media">
    {socials.map(({ name, href: fallback, icon }) => {
      const href = settings[name.toLowerCase()] || fallback;
      const [width,height,,,path] = icon.icon;
      const graphic = <svg viewBox={`0 0 ${width} ${height}`} fill="currentColor" aria-hidden="true" focusable="false"><path d={path} /></svg>;
      const className = `footer-social-icon footer-social-${name.toLowerCase()}`;
      return href ? <a key={name} className={className} href={href} target="_blank" rel="noopener noreferrer" aria-label={`Kemsor on ${name}`}>{graphic}</a> : <span key={name} className={className} role="img" aria-label={`${name}: profile link coming soon`} title={`${name}: profile link coming soon`}>{graphic}</span>;
    })}
  </div>;
}

const footerGroups = [
 {id:'connected',title:'Updates & information',links:[['Blog','blog'],['News, Press & Media','press-media'],['Legal & privacy','legal']]},
];

function FooterHandwriting({ reduced }) {
  const element = useRef(null);
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    if (reduced || !globalThis.IntersectionObserver) { setRevealed(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setRevealed(true); observer.disconnect(); }
    }, { threshold: .6 });
    observer.observe(element.current);
    return () => observer.disconnect();
  }, [reduced]);
  return <div ref={element} className="footer-handwriting" data-revealed={revealed} aria-label="Kemsor Studios">
    <span className="footer-written-name" aria-hidden="true">{["Kemsor", "Studios"].map((word, wordIndex) => <span className="footer-written-word" key={word}>{word.split('').map((letter, index) => <span className="footer-written-letter" key={index} style={{'--write-delay': `${(index + wordIndex * 6) * 0.28}s`}}>{letter}</span>)}</span>)}</span>
  </div>;
}

export default function Footer({ reduced, page = 'home' }) {
  const {settings}=useCms();
  const email = studioEmail;
  const phone = studioPhone;
  const address = settings.contact_address && !/sample|example/i.test(settings.contact_address) ? settings.contact_address : studioAddress;
  return <footer className="creative-footer footer-jumbo footer-editorial footer-reference footer-compact">
    <div className="footer-invitation">
      <form className="footer-signup" action={pageHref('join')} method="get">
        <label className="sr-only" htmlFor="footer-signup-email">Your email</label>
        <input id="footer-signup-email" type="email" name="email" placeholder="Your Email" autoComplete="email" required/>
        <button type="submit" className="footer-conversation">Sign Up <SiteIcon name="people" size={17}/></button>
        <p>Continue to Kemsor to create your account.</p>
      </form>
      <div className="footer-invitation-main">
        <p className="footer-kicker">{settings.footer_kicker ?? 'THE NEXT GREAT STORY'}</p>
        <h2>{settings.footer_title ?? 'Let’s make'} <span>{settings.footer_accent ?? 'a scene.'}</span></h2><p className="footer-intro-copy">From the first idea to the finished frame.<br/>Bring us your story. We’ll find the next step.</p>
        <a href={pageHref('contact')} className="footer-conversation"><b className="cta-label"><RollingLabel>{settings.footer_cta_label || 'Talk to the studio'}</RollingLabel></b><span aria-hidden="true"><SiteIcon name="contact" size={17}/></span></a>
      </div>
      <div className="footer-invitation-copy footer-studio-column">
        <div className="footer-info-block footer-network"><h3>Social network</h3><div className="footer-social-signature"><SocialIcons/><FooterHandwriting reduced={reduced}/></div></div>
      </div>
      <div className="footer-contact-column">
        <div className="footer-info-block"><h3>{address ? 'Our location' : 'The studio'}</h3>
          <p>{address || (settings.footer_description ?? 'For production enquiries and collaborations,\nget in touch with the studio.')}</p>
        </div>
        {phone && <div className="footer-info-block"><h3>Call the studio</h3><a href={studioPhoneHref}>{phone}</a></div>}
        <div className="footer-info-block"><h3>Email us</h3><a href={`mailto:${email}`}>{email}</a></div>
      </div>
      <div className="footer-directory">
        <nav className="footer-link-groups" aria-label="Footer navigation">{footerGroups.map(group => <div className={`footer-link-group footer-link-group-${group.id}`} key={group.id}>
          <h3>{group.title}</h3><div className="footer-link-list">{group.links.map(([label,key]) => <a key={key} href={pageHref(key)} aria-current={page === key ? 'page' : undefined}><span className="footer-link-label">{label}</span></a>)}</div>
        </div>)}</nav>
        <div id="footer-guide-slot" className="footer-guide-slot"/>
      </div>
    </div>

    <div className="footer-baseline"><span>© {new Date().getFullYear()} {settings.footer_copyright || 'Kemsor Studios'}</span></div>
    {reduced&&<span className="sr-only">Your reduced motion preference is respected.</span>}
  </footer>;
}
