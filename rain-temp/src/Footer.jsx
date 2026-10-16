import React from 'react';
import {useMember,LogoutButton} from './MemberSession';
import { pageHref, pageInfo } from './pageInfo';
import './footer-socials.css';
import './footer-jumbo.css';
import { useCms } from './CmsContent';

// Add confirmed studio profile URLs here to activate each social link.
const socials = [
 {name:'Facebook',href:null,icon:<path d="M14 21v-8h3l.5-4H14V7c0-1 .3-2 2-2h2V1.5c-.8-.2-1.8-.3-3-.3-3 0-5 1.9-5 5.3V9H7v4h3v8Z" fill="currentColor" stroke="none"/>},
 {name:'Instagram',href:null,icon:<><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></>},
 {name:'YouTube',href:null,icon:<><path d="M21 7a3 3 0 0 0-2-2c-3-.5-11-.5-14 0a3 3 0 0 0-2 2c-.5 2-.5 8 0 10a3 3 0 0 0 2 2c3 .5 11 .5 14 0a3 3 0 0 0 2-2c.5-2 .5-8 0-10Z"/><path d="m10 8 6 4-6 4Z" fill="currentColor" stroke="none"/></>},
 {name:'LinkedIn',href:null,icon:<><circle cx="5" cy="5" r="2" fill="currentColor" stroke="none"/><path d="M3 9h4v12H3zM10 9h4v1.8c.8-1.3 2-2.1 3.7-2.1 3 0 4.3 2 4.3 5.3v7h-4v-6.3c0-1.8-.5-2.8-1.8-2.8-1.5 0-2.2 1-2.2 2.8V21h-4Z" fill="currentColor" stroke="none"/></>},
];

function SocialIcons() {
  const { settings } = useCms();
  return <div className="footer-socials" role="group" aria-label="Kemsor social media">
    {socials.map(({ name, href: fallback, icon }) => {
      const href = settings[name.toLowerCase()] || fallback;
      const graphic = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">{icon}</svg>;
      const className = `footer-social-icon footer-social-${name.toLowerCase()}`;
      return href ? <a key={name} className={className} href={href} target="_blank" rel="noopener noreferrer" aria-label={`Kemsor on ${name}`}>{graphic}</a> : <span key={name} className={className} role="img" aria-label={`${name} — profile link coming soon`} title={`${name} — profile link coming soon`}>{graphic}</span>;
    })}
  </div>;
}

const footerGroups = [
  { title: 'The studio', links: [['Home','home'],['About Kemsor','about'],['Leadership','about','leadership'],['Productions','projects'],['Careers','careers']] },
  { title: 'Production support', links: [['All services','services'],['Development & planning','services','development'],['Film financing','services','capability-financing'],['Casting & talent','services','capability-casting'],['Filming & production','services','capability-filming'],['Design & post-production','services','capability-post'],['India production services','services','india-production-services']] },
  { title: 'Talent & tools', links: [['Find Talent','find-talent'],['Join KEMSOR','join'],['Login','login'],['My Profile','profile'],['Script to Production','script-to-production']] },
  { title: 'Stay connected', links: [['Contact','contact'],['Blog','blog'],['News','news'],['Press & media','news','press-media'],['Legal & privacy','legal']] },
];

function FooterLinkIcon({ type, anchor }) {
  const name = anchor || type;
  const paths = {
    home: <><path d="M3 9.5 10 4l7 5.5"/><path d="M5 8.5V17h10V8.5M8 17v-5h4v5"/></>,
    about: <><circle cx="10" cy="7" r="3"/><path d="M4.5 17c.6-3.1 2.5-4.7 5.5-4.7s4.9 1.6 5.5 4.7"/></>,
    projects: <><rect x="3" y="5" width="14" height="11" rx="1.5"/><path d="m4 8 12-3M7 6l2 2m2-4 2 2"/></>,
    careers: <><rect x="3" y="7" width="14" height="10" rx="1.5"/><path d="M7 7V4h6v3M3 11h14"/></>,
    development: <><path d="m4 15 1-4L14 2l4 4-9 9-4 1Z"/><path d="m12 4 4 4"/></>,
    'capability-financing': <><circle cx="10" cy="10" r="7"/><path d="M12.5 7.5c-.7-.5-1.5-.7-2.4-.7-1.5 0-2.6.7-2.6 1.8 0 2.8 5.2 1.1 5.2 4 0 1.1-1 1.9-2.7 1.9-.9 0-1.9-.3-2.6-.8M10 5v10"/></>,
    'capability-casting': <><circle cx="7" cy="8" r="3"/><circle cx="14" cy="9" r="2.4"/><path d="M2.5 17c.5-3.1 2-4.6 4.5-4.6s4 1.5 4.5 4.6m.2-3.7c2.8-.6 4.7.7 5.3 3.7"/></>,
    'capability-filming': <><rect x="2.5" y="6" width="11" height="9" rx="1.5"/><path d="m13.5 9 4-2v7l-4-2"/><circle cx="8" cy="10.5" r="2.2"/></>,
    'capability-post': <><path d="M4 4v12M10 4v12M16 4v12"/><circle cx="4" cy="8" r="2"/><circle cx="10" cy="13" r="2"/><circle cx="16" cy="7" r="2"/></>,
    'india-production-services': <><path d="M10 18s5-5.1 5-10a5 5 0 0 0-10 0c0 4.9 5 10 5 10Z"/><circle cx="10" cy="8" r="1.7"/></>,
    'find-talent': <><circle cx="8" cy="8" r="3"/><path d="M3 16c.6-3 2.2-4.5 5-4.5 1.4 0 2.5.4 3.3 1.1M13 13l4 4m0-4-4 4"/></>,
    join: <><circle cx="8" cy="7" r="3"/><path d="M3 17c.6-3.3 2.3-5 5-5 1.5 0 2.7.5 3.6 1.4M15 8v6m-3-3h6"/></>,
    login: <><path d="M9 4H4v12h5M12 7l3 3-3 3m3-3H8"/></>,
    profile: <><circle cx="10" cy="7" r="3"/><path d="M4 17c.7-3.4 2.7-5 6-5s5.3 1.6 6 5"/></>,
    'script-to-production': <><path d="M5 2.5h7l3 3V18H5Z"/><path d="M12 2.5V6h3M8 10h4M8 13h4"/></>,
    contact: <><rect x="2.5" y="4.5" width="15" height="11" rx="1.5"/><path d="m3.5 6 6.5 5 6.5-5"/></>,
    legal: <><path d="M10 2.5 16 5v4.5c0 4-2.2 6.6-6 8-3.8-1.4-6-4-6-8V5Z"/><path d="m7 10 2 2 4-4"/></>,
    services: <><circle cx="10" cy="10" r="7"/><path d="M10 6v8M6 10h8"/></>,
    leadership: <><circle cx="10" cy="6" r="2.5"/><circle cx="5" cy="9" r="2"/><circle cx="15" cy="9" r="2"/><path d="M6 17c.4-2.8 1.7-4.3 4-4.3s3.6 1.5 4 4.3M2 17c.2-2.2 1.2-3.4 3-3.4m10 0c1.8 0 2.8 1.2 3 3.4"/></>,
    blog: <><path d="M4 3h12v14H4Z"/><path d="M7 7h6M7 10h6M7 13h4"/></>,
    news: <><path d="M3 4h12v12H4.5A1.5 1.5 0 0 1 3 14.5Z"/><path d="M6 7h6M6 10h6M6 13h3M15 7h2v7.5a1.5 1.5 0 0 1-1.5 1.5"/></>,
    'press-media': <><rect x="7" y="3" width="6" height="9" rx="3"/><path d="M4.5 9.5a5.5 5.5 0 0 0 11 0M10 15v3M7 18h6"/></>,
  };
  return <svg className="footer-link-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths[type] || paths.services}</svg>;
}
export default function Footer({ reduced, page = 'home' }) {
  const {user,loading}=useMember();
  const {settings}=useCms();
  return <footer className="creative-footer footer-jumbo">
    <div className="footer-invitation"><div><p className="footer-kicker">{settings.footer_kicker ?? 'THE NEXT GREAT STORY'}</p><h2>{settings.footer_title ?? 'Let’s make'}<br/><span>{settings.footer_accent ?? 'a scene.'}</span></h2></div><div className="footer-invitation-copy"><p style={{whiteSpace:'pre-line'}}>{settings.footer_description ?? 'From the first idea to the finished frame.\nBring us your story — we’ll find the next step.'}</p><a href={pageHref('contact')} className="footer-conversation"><b className="cta-label">{settings.footer_cta_label || 'Talk to the studio'}</b> <span aria-hidden="true">↗</span></a></div></div>
    <div className="footer-directory"><nav className="footer-link-groups" aria-label="Footer navigation">{footerGroups.map(group=><div className="footer-link-group" key={group.title}><h3>{group.title}</h3>{group.links.filter(([,key])=>(!['join','login'].includes(key)||(!user&&!loading))&&(key!=='script-to-production'||(!loading&&user?.role!=='artist'))).map(([label,key,anchor])=><a key={label} href={`${pageHref(key)}${anchor?'#'+anchor:''}`} aria-current={page===key&&!anchor?'page':undefined}><FooterLinkIcon type={key} anchor={anchor}/><span>{label}</span><span className="footer-link-arrow" aria-hidden="true">↗</span></a>)}{group.title==='Talent & tools'&&user&&<LogoutButton className="footer-logout"/>}</div>)}</nav></div>
    <div className="footer-signature" aria-hidden="true"><strong className="footer-word">{'KEMSOR'.split('').map((letter,index)=><i key={letter+index}>{letter}</i>)}</strong><span>STUDIOS</span></div>
    <div className="footer-baseline"><span>© {new Date().getFullYear()} {settings.footer_copyright || 'Kemsor Studios'}</span><div className="footer-baseline-socials"><span>{settings.footer_social_label ?? 'Follow us'}</span><SocialIcons/></div></div>
    {reduced&&<span className="sr-only">Your reduced motion preference is respected.</span>}
  </footer>;
}
