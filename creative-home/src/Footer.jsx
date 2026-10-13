import React from 'react';
import { pageHref, pageInfo } from './pageInfo';
import './footer-socials.css';

// Add confirmed studio profile URLs here to activate each social link.
const socials = [
  { name: 'Facebook', href: null, icon: <path d="M20 30V18h4l.7-5H20v-3c0-1.5.5-2.5 2.5-2.5H25V3.2c-1-.2-2.5-.3-4-.3-4 0-6.5 2.5-6.5 6.8V13H10v5h4.5v12Z" fill="currentColor" stroke="none" /> },
  { name: 'Instagram', href: null, icon: <><rect x="4" y="4" width="24" height="24" rx="7" /><circle cx="16" cy="16" r="6" /><circle cx="24" cy="8.5" r="1.5" fill="currentColor" stroke="none" /></> },
  { name: 'YouTube', href: null, icon: <><path d="M28.5 10a4 4 0 0 0-3-3C22.5 6.4 16 6.4 16 6.4S9.5 6.4 6.5 7a4 4 0 0 0-3 3C3 12 3 16 3 16s0 4 .5 6a4 4 0 0 0 3 3c3 .6 9.5.6 9.5.6s6.5 0 9.5-.6a4 4 0 0 0 3-3c.5-2 .5-6 .5-6s0-4-.5-6Z" /><path d="m13 11 8 5-8 5Z" fill="currentColor" stroke="none" /></> },
];

function SocialIcons() {
  return <div className="footer-socials" role="group" aria-label="Kemsor social media">
    {socials.map(({ name, href, icon }) => {
      const graphic = <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">{icon}</svg>;
      return href ? <a key={name} className="footer-social-icon" href={href} target="_blank" rel="noopener noreferrer" aria-label={`Kemsor on ${name}`}>{graphic}</a> : <span key={name} className="footer-social-icon" role="img" aria-label={`${name} — profile link coming soon`} title={`${name} — profile link coming soon`}>{graphic}</span>;
    })}
  </div>;
}

export default function Footer({ paused, onToggle, reduced, page = 'home' }) {
  return <footer className="creative-footer">
    <div className="footer-upper"><a className="footer-brand" href="/#home" aria-label="Kemsor Studios home"><picture><source srcSet="/assets/kemsor-logo.webp" type="image/webp"/><img src="/assets/kemsor-logo.svg" alt="" width="3650" height="3300" loading="lazy" decoding="async"/></picture></a><p>From the first idea<br/>to the finished frame.</p><a className="footer-top-link" href="#top">Back to the first frame <span aria-hidden="true">↑</span></a></div>
    <div className="footer-navigation-row">
      <nav className="footer-page-links" aria-label="Footer navigation">{Object.entries(pageInfo).map(([key,info]) => <a key={key} href={pageHref(key)} aria-current={page===key?'page':undefined}>{info.label}</a>)}</nav>
      <SocialIcons />
    </div>
    <div className="footer-baseline"><span>© {new Date().getFullYear()} Kemsor Studios</span><span>FILM. SERIES. DOCUMENTARIES.</span><button className="footer-motion-toggle" onClick={onToggle} role="switch" aria-label="Background motion" aria-checked={!paused}>Motion <span className="footer-motion-track" aria-hidden="true"><span /></span></button></div>
    {reduced&&<span className="sr-only">Your reduced motion preference is respected.</span>}
  </footer>;
}
