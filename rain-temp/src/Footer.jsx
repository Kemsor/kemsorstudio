import React from 'react';
import {useMember,LogoutButton} from './MemberSession';
import { pageHref, pageInfo } from './pageInfo';
import './footer-socials.css';
import './footer-jumbo.css';
import { useCms } from './CmsContent';

// Add confirmed studio profile URLs here to activate each social link.
const socials = [
  { name: 'Facebook', href: null, icon: <path d="M20 30V18h4l.7-5H20v-3c0-1.5.5-2.5 2.5-2.5H25V3.2c-1-.2-2.5-.3-4-.3-4 0-6.5 2.5-6.5 6.8V13H10v5h4.5v12Z" fill="currentColor" stroke="none" /> },
  { name: 'Instagram', href: null, icon: <><rect x="4" y="4" width="24" height="24" rx="7" /><circle cx="16" cy="16" r="6" /><circle cx="24" cy="8.5" r="1.5" fill="currentColor" stroke="none" /></> },
  { name: 'YouTube', href: null, icon: <><path d="M28.5 10a4 4 0 0 0-3-3C22.5 6.4 16 6.4 16 6.4S9.5 6.4 6.5 7a4 4 0 0 0-3 3C3 12 3 16 3 16s0 4 .5 6a4 4 0 0 0 3 3c3 .6 9.5.6 9.5.6s6.5 0 9.5-.6a4 4 0 0 0 3-3c.5-2 .5-6 .5-6s0-4-.5-6Z" /><path d="m13 11 8 5-8 5Z" fill="currentColor" stroke="none" /></> },
];

function SocialIcons() {
  const { settings } = useCms();
  return <div className="footer-socials" role="group" aria-label="Kemsor social media">
    {socials.map(({ name, href: fallback, icon }) => {
      const href = settings[name.toLowerCase()] || fallback;
      const graphic = <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">{icon}</svg>;
      return href ? <a key={name} className="footer-social-icon" href={href} target="_blank" rel="noopener noreferrer" aria-label={`Kemsor on ${name}`}>{graphic}</a> : <span key={name} className="footer-social-icon" role="img" aria-label={`${name} — profile link coming soon`} title={`${name} — profile link coming soon`}>{graphic}</span>;
    })}
  </div>;
}

const footerGroups = [
  { title: 'The studio', links: [['Home','home'],['About Kemsor','about'],['Leadership','about','leadership'],['Productions','projects'],['Careers','careers']] },
  { title: 'Production support', links: [['All services','services'],['Development & planning','services','development'],['Film financing','services','capability-financing'],['Casting & talent','services','capability-casting'],['Filming & production','services','capability-filming'],['Design & post-production','services','capability-post'],['India production services','services','india-production-services']] },
  { title: 'Talent & tools', links: [['Find Talent','find-talent'],['Join KEMSOR','join'],['Login','login'],['My Profile','profile'],['Script to Production','script-to-production']] },
  { title: 'Stay connected', links: [['Contact','contact'],['Partner with us','contact','filmmakers'],['Newsroom','news'],['Press & media','news','press-media'],['Blog','blog'],['Legal & privacy','legal']] },
];
export default function Footer({ paused, onToggle, reduced, page = 'home' }) {
  const {user,loading}=useMember();
  return <footer className="creative-footer footer-jumbo">
    <div className="footer-invitation"><div><p className="footer-kicker">THE NEXT GREAT STORY</p><h2>Let’s make<br/><span>a scene.</span></h2></div><div className="footer-invitation-copy"><p>From the first idea to the finished frame.<br/>Bring your story. We’ll find the next step.</p><a href={pageHref('contact')} className="footer-conversation">Talk to the studio <span aria-hidden="true">↗</span></a></div></div>
    <div className="footer-directory"><nav className="footer-link-groups" aria-label="Footer navigation">{footerGroups.map(group=><div className="footer-link-group" key={group.title}><h3>{group.title}</h3>{group.links.filter(([,key])=>(!['join','login'].includes(key)||(!user&&!loading))&&(key!=='script-to-production'||(!loading&&user?.role!=='artist'))).map(([label,key,anchor])=><a key={label} href={`${pageHref(key)}${anchor?'#'+anchor:''}`} aria-current={page===key&&!anchor?'page':undefined}>{label}</a>)}{group.title==='Talent & tools'&&user&&<LogoutButton className="footer-logout"/>}</div>)}</nav><div className="footer-social-column"><p className="footer-kicker">FOLLOW THE FRAME</p><SocialIcons/><p className="footer-social-caption">Facebook · Instagram · YouTube</p></div></div>
    <div className="footer-signature" aria-hidden="true">KEMSOR<span>STUDIOS</span></div>
    <div className="footer-baseline"><span>© {new Date().getFullYear()} Kemsor Studios</span><a className="footer-top-link" href="#top">Back to top <span aria-hidden="true">↑</span></a><button className="footer-motion-toggle" onClick={onToggle} role="switch" aria-label="Background motion" aria-checked={!paused}>Motion <span className="footer-motion-track" aria-hidden="true"><span /></span></button></div>
    {reduced&&<span className="sr-only">Your reduced motion preference is respected.</span>}
  </footer>;
}
