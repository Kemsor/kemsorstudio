import React from 'react';
import StudioImage from './StudioImage';
import MotionHeading from './TextMotion';
import './audience-collage.css';

export default function AudienceCollage({ id, label, sectionNumber, heading = 'Who it’s for.', audiences, images, eyebrow = 'BUILT AROUND THE WORK' }) {
  return <section className="produce-section audience-collage" aria-labelledby={id}>
    <div className="audience-collage-inner">
      <div className="audience-collage-heading">
        <span className="audience-collage-lines" aria-hidden="true" />
        {sectionNumber && <span className="related-showcase-count">{sectionNumber}</span>}
        <div className="produce-label"><span>{label}</span></div>
        <MotionHeading as="h2" id={id}>{heading}</MotionHeading>
        <p className="audience-collage-eyebrow">{eyebrow}</p>
      </div>
      <div className="audience-collage-art" aria-hidden="true">
        <figure className="audience-collage-photo audience-collage-photo-small"><StudioImage src={images[0]} alt="" width="960" height="1200" loading="lazy" decoding="async"/></figure>
        <figure className="audience-collage-photo audience-collage-photo-large"><StudioImage src={images[1]} alt="" width="960" height="1200" loading="lazy" decoding="async"/></figure>
      </div>
      <ol className="audience-collage-list">{audiences.map(([title, description], index) => <li key={title}>
        <span>{String(index + 1).padStart(2, '0')}</span><div><h3>{title}</h3><p>{description}</p></div>
      </li>)}</ol>
    </div>
  </section>;
}
