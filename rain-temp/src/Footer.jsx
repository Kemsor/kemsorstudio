import { faFacebookF, faInstagram, faYoutube, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';
import React from 'react';
import { pageHref } from './pageInfo';
import './footer-socials.css';
import './footer-jumbo.css';
import './footer-editorial.css';
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
 {id:'connected',title:'Updates & information',links:[['Blog','blog'],['Press & media','news'],['Legal & privacy','legal']]},
];

export default function Footer({ reduced, page = 'home' }) {
  const {settings}=useCms();
  const groups=footerGroups;
  return <footer className="creative-footer footer-jumbo footer-editorial">
    <div className="footer-invitation"><div><p className="footer-kicker">{settings.footer_kicker ?? 'THE NEXT GREAT STORY'}</p><h2>{settings.footer_title ?? 'Let’s make'}<br/><span>{settings.footer_accent ?? 'a scene.'}</span></h2></div><div className="footer-invitation-copy"><p style={{whiteSpace:'pre-line'}}>{settings.footer_description ?? 'For production enquiries and collaborations,\nget in touch with the studio.'}</p><a href={pageHref('contact')} className="footer-conversation"><b className="cta-label">{settings.footer_cta_label || 'Talk to the studio'}</b></a><SocialIcons/></div></div>
    <div className="footer-directory"><nav className="footer-link-groups" aria-label="Footer navigation">{groups.map(group=><div className={`footer-link-group footer-link-group-${group.id}`} key={group.id}><h3>{group.title}</h3><div className="footer-link-list">{group.links.map(([label,key])=><a key={key} href={pageHref(key)} aria-current={page===key?'page':undefined}><span className="footer-link-label">{label}</span></a>)}</div></div>)}</nav><div id="footer-guide-slot" className="footer-guide-slot"/></div>
    <div className="footer-signature" aria-hidden="true"><strong className="footer-word">{'KEMSOR'.split('').map((letter,index)=><i key={letter+index}>{letter}</i>)}</strong><span className="footer-studios-signature">Studios</span></div>
    <div className="footer-baseline"><span>© {new Date().getFullYear()} {settings.footer_copyright || 'Kemsor Studios'}</span></div>
    {reduced&&<span className="sr-only">Your reduced motion preference is respected.</span>}
  </footer>;
}
