import React from 'react';
import { CTA } from './PageUI';
import './scroll-story.css';

export default function ScrollStory() {
  return <section className="screenplay-story direct-image-story" id="story-in-motion" aria-labelledby="story-title">
    <div className="screenplay-stage">
      <div className="screenplay-copy">
        <p className="page-eyebrow">THE DISTANCE BETWEEN IDEA AND AUDIENCE</p>
        <h2 id="story-title">First, a page.<br /><span>Then, a possibility.</span></h2>
        <p>A script takes shape through locations, performances and the work of a production team.</p>
        <p>We help bring the creative vision and the practical pieces together.</p>
        <CTA href="/services/">Explore the journey</CTA>
      </div>
      <figure className="screenplay-direct-image">
        <img src="/assets/stills/period-costume.webp" alt="A performer in a gold period costume standing in a traditional colonnade." width="1079" height="1541" loading="lazy" decoding="async" />
      </figure>
    </div>
  </section>;
}
