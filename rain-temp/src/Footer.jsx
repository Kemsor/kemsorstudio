import React from 'react';
import {useMember,LogoutButton} from './MemberSession';
import { pageHref } from './pageInfo';
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
  { id:'studio', title: 'The studio', links: [['Home','home'],['About Kemsor','about'],['What We Make','what-we-make'],['Leadership','about','leadership'],['Productions','projects'],['Careers','careers']] },
  { id:'talent', title: 'Talent & tools', links: [['Find Talent','find-talent'],['Join KEMSOR','join'],['Login','login'],['My Profile','profile'],['Script to Production','script-to-production']] },
  { id:'production', title: 'Production support', links: [['All services','services'],['Produce','produce'],['Line Production','line-production'],['Development & planning','develop'],['Film financing','finance'],['Casting & talent','casting'],['Crew & equipment','crew-equipment'],['Locations & logistics','locations-logistics'],['Set & production design','set-production-design'],['Shooting & on-location','shooting-on-location'],['Post','post'],['Post-production supervision','post-production'],['India production services','services','india-production-services'],['Release','release'],['Distribution & release support','distribution-release'],['Festival & awards strategy','festival-awards']] },
  { id:'connected', title: 'Stay connected', links: [['Contact','contact'],['Blog','blog'],['News','news'],['Press & media','news','press-media'],['Legal & privacy','legal']] },
];

export default function Footer({ reduced, page = 'home' }) {
  const {user,loading}=useMember();
  const {settings}=useCms();
  return <footer className="creative-footer footer-jumbo">
    <div className="footer-invitation"><div><p className="footer-kicker">{settings.footer_kicker ?? 'THE NEXT GREAT STORY'}</p><h2>{settings.footer_title ?? 'Let’s make'}<br/><span>{settings.footer_accent ?? 'a scene.'}</span></h2></div><div className="footer-invitation-copy"><p style={{whiteSpace:'pre-line'}}>{settings.footer_description ?? 'From the first idea to the finished frame.\nBring us your story — we’ll find the next step.'}</p><a href={pageHref('contact')} className="footer-conversation"><b className="cta-label">{settings.footer_cta_label || 'Talk to the studio'}</b></a></div></div>
    <div className="footer-directory"><nav className="footer-link-groups" aria-label="Footer navigation">{footerGroups.map(group=><div className={`footer-link-group footer-link-group-${group.id}`} key={group.id}><h3>{group.title}</h3><div className="footer-link-list">{group.links.filter(([,key])=>(!['join','login'].includes(key)||(!user&&!loading))&&(key!=='script-to-production'||(!loading&&user?.role!=='artist'))).map(([label,key,anchor])=><a key={label} href={`${pageHref(key)}${anchor?'#'+anchor:''}`} aria-current={page===key&&!anchor?'page':undefined}><span className="footer-link-label">{label}</span></a>)}{group.title==='Talent & tools'&&user&&<LogoutButton className="footer-logout"/>}</div></div>)}</nav></div>
    <div className="footer-signature" aria-hidden="true"><strong className="footer-word">{'KEMSOR'.split('').map((letter,index)=><i key={letter+index}>{letter}</i>)}</strong><span className="footer-studios-signature">Studios</span></div>
    <div className="footer-baseline"><span>© {new Date().getFullYear()} {settings.footer_copyright || 'Kemsor Studios'}</span><div className="footer-baseline-socials"><span>{settings.footer_social_label ?? 'Follow us'}</span><SocialIcons/></div></div>
    {reduced&&<span className="sr-only">Your reduced motion preference is respected.</span>}
  </footer>;
}
