import MotionHeading from './TextMotion';
import React from 'react';
import SiteIcon from './SiteIcon';

export const Arrow = () => <SiteIcon name="arrow"/>;
export function FrameMark({ className = '' }) {
  return <svg className={`frame-mark ${className}`} width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M18 6H6v12m24-12h12v12M6 30v12h12m24-12v12H30" stroke="currentColor" strokeWidth="3" /><rect x="16" y="18" width="16" height="12" stroke="currentColor" strokeWidth="2.5" /></svg>;
}
export function CTA({ children = 'Start with a story', href = '/contact/#project-brief', className = '' }) {
  return <a className={`creative-cta ${className}`} href={href}><span>{children}</span><span className="cta-arrow"><Arrow /></span></a>;
}
export function IndexLabel({ children, right }) {
  return <div className="index-label"><span>{children}</span>{right && <span className="index-right">{right}</span>}</div>;
}

export function TextLink({href,children}) {
 return <a className="line-link" href={href}>{children}<Arrow /></a>;
}
export function PageHero({eyebrow,title,accent,description,image,alt,caption='FROM IDEA TO SCREEN'}) {
 return <section className={`page-hero ${image?'':'page-hero-text'}`}>
  <div className="page-hero-docket"><a href="/">KEMSOR STUDIOS</a><span>{eyebrow}</span></div>
  <div className="page-hero-grid"><div className="page-hero-copy"><p className="page-eyebrow">{eyebrow}</p><MotionHeading as="h1" tabIndex="-1">{title}{accent&&<><br/><span>{accent}</span></>}</MotionHeading>{description&&<p className="page-lead">{description}</p>}</div>
   {image&&<figure className="page-hero-image"><img src={image} alt={alt||''} width="1672" height="941" fetchPriority="high" decoding="async"/><span className="page-image-bracket" aria-hidden="true"/><figcaption>{caption}<FrameMark/></figcaption></figure>}
  </div>
 </section>;
}
export function SectionHeading({index,label,title,description}) {
 return <><IndexLabel index={index}>{label}</IndexLabel><div className="page-section-heading" data-reveal><MotionHeading as="h2">{title}</MotionHeading>{description&&<p>{description}</p>}</div></>;
}
export function PageCTA({eyebrow='YOUR NEXT CHAPTER',title='What are you working on?',description='Start with a script, a concept or a production already in progress. Tell us where the work stands.',href='/contact/#project-brief',children='Start with a story'}) {
 return <section className="page-next page-section"><IndexLabel index="+">{eyebrow}</IndexLabel><div className="page-next-layout" data-reveal><MotionHeading as="h2">{title}</MotionHeading><div><p>{description}</p><CTA href={href}>{children}</CTA></div><FrameMark className="page-next-mark"/></div></section>;
}
