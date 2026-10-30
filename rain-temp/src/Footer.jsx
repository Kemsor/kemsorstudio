import RollingLabel from './RollingLabel';
import { faFacebookF, faInstagram, faYoutube, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';
import React from 'react';
import { pageHref } from './pageInfo';
import SiteIcon from './SiteIcon';
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
  const email = settings.contact_email && !/\.example$|example\.com/i.test(settings.contact_email)
    ? settings.contact_email : 'info@kemsorstudio.com';
  const phone = settings.contact_phone && !/sample|00000/i.test(settings.contact_phone) ? settings.contact_phone : '';
  const address = settings.contact_address && !/sample|example/i.test(settings.contact_address)
    ? settings.contact_address.replace(/\\n/g, '\n') : '';
  return <footer className="creative-footer footer-jumbo footer-editorial footer-reference">
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
        <div className="footer-info-block"><h3>{address ? 'Our location' : 'The studio'}</h3>
          <p>{address || (settings.footer_description ?? 'For production enquiries and collaborations,\nget in touch with the studio.')}</p>
        </div>
        <div className="footer-info-block footer-network"><h3>Social network</h3><SocialIcons/></div>
      </div>
      <div className="footer-contact-column">
        {phone && <div className="footer-info-block"><h3>Call the studio</h3><a href={`tel:${phone.replace(/[^+0-9]/g, '')}`}>{phone}</a></div>}
        <div className="footer-info-block"><h3>Email us</h3><a href={`mailto:${email}`}>{email}</a></div>
      </div>
      <div className="footer-directory">
        <nav className="footer-link-groups" aria-label="Footer navigation">{footerGroups.map(group => <div className={`footer-link-group footer-link-group-${group.id}`} key={group.id}>
          <h3>{group.title}</h3><div className="footer-link-list">{group.links.map(([label,key]) => <a key={key} href={pageHref(key)} aria-current={page === key ? 'page' : undefined}><span className="footer-link-label">{label}</span></a>)}</div>
        </div>)}</nav>
        <div id="footer-guide-slot" className="footer-guide-slot"/>
      </div>
    </div>
    <nav className="footer-journey-links" aria-label="Where are you in the journey?">
      <h3>Where are you in the journey?</h3>
      <div>{[
        ['I have a script or idea','/script-to-production/','script','Develop your story'],
        ['I need a production partner','/#services','film','Build the production'],
        ['I’m a financier or platform','/contact/?partner=co-producers','partnership','Explore a partnership'],
        ['I’m filming in India','/india-production-services/','location','Plan your India shoot'],
      ].map(([label,href,icon,note],index)=><a href={href} key={href}><span className="footer-journey-mark" aria-hidden="true"><SiteIcon name={icon} size={21}/></span><span className="footer-journey-copy"><span className="footer-journey-title">{label}</span><span className="footer-journey-note">{note}</span></span><span className="footer-journey-number" aria-hidden="true">0{index+1}</span></a>)}</div>
    </nav>
    <div className="footer-signature" aria-hidden="true"><strong className="footer-word">{'KEMSOR'.split('').map((letter,index)=><i key={letter+index}>{letter}</i>)}</strong><span className="footer-studios-signature">Studios</span></div>
    <div className="footer-baseline"><span>© {new Date().getFullYear()} {settings.footer_copyright || 'Kemsor Studios'}</span></div>
    {reduced&&<span className="sr-only">Your reduced motion preference is respected.</span>}
  </footer>;
}
