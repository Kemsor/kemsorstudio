import React from 'react';
import StudioImage from './StudioImage';
import './faq-panel.css';

export default function FaqPanel({heading,children}){
 return <div className="standard-faq-panel">
  <figure className="standard-faq-image"><StudioImage mediaSlot="FaqPanel-1" src="/assets/stills/faq-film-studio.webp" alt="Frequently asked questions, with film studio lighting and camera equipment" width="1200" height="800" loading="lazy" decoding="async"/></figure>
  <div className="standard-faq-content"><div className="standard-faq-heading">{heading}</div>{children}</div>
 </div>;
}
