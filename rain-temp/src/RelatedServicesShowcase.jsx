import React from 'react';
import StudioImage from './StudioImage';
import MotionHeading, { MotionCopy } from './TextMotion';
import { Arrow } from './PageUI';
import './related-services-showcase.css';
import './section-number.css';

const relatedImages = [
  '/assets/stills/daylight-valley-production-960.webp',
  '/assets/stills/fort-action-production-960.webp',
  '/assets/stills/work-camera-crew-960.webp',
  '/assets/stills/work-period-camera-960.webp',
];

export default function RelatedServicesShowcase({ id, label, sectionNumber, heading = 'Related services.', intro, items, actionLabel = 'Explore service' }) {
  return <section className="produce-section produce-related line-production-related related-services-showcase" aria-labelledby={id}>
    <div className="related-showcase-heading">
      <div className="related-showcase-heading-title">
        <span className="related-showcase-count" aria-hidden={sectionNumber ? undefined : true}>{sectionNumber ?? String(items.length).padStart(2, '0')}</span>
        <div className="produce-label"><span>{label}</span></div>
        <MotionHeading as="h2" id={id}>{heading}</MotionHeading>
      </div>
      <MotionCopy>{intro}</MotionCopy>
    </div>
    <div className="produce-related-grid related-showcase-grid">{items.map(([number, title, href, customAction], index) => <a href={href} key={title}>
      <figure><StudioImage src={relatedImages[index % relatedImages.length]} alt="" width="960" height="1200" loading="lazy" decoding="async"/></figure>
      <div className="related-showcase-card-copy"><span className="related-showcase-card-number">{number}</span><h3>{title}</h3><span className="line-production-related-link">{customAction || actionLabel} <Arrow/></span></div>
    </a>)}</div>
  </section>;
}
