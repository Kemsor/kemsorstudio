import React, {Children, cloneElement, isValidElement} from 'react';
import StudioImage from './StudioImage';
import SiteIcon from './SiteIcon';
import {currentPageContentKey,getSiteModule} from './siteContent';
import './faq-panel.css';

const plainText = children => Children.toArray(children).map(node =>
  isValidElement(node) ? plainText(node.props.children) : String(node)
).join('');

export function ManagedPageFaq({page}) {
 const {items} = getSiteModule(`faq:${page}`, {});
 if (!items?.length) return null;
 return <section className="standard-faq-simple" id="questions" aria-labelledby="managed-faq-title">
  <FaqPanel heading={<h2 id="managed-faq-title">Frequently asked questions</h2>}/>
 </section>;
}

export default function FaqPanel({heading,children}) {
 const {items} = getSiteModule(`faq:${currentPageContentKey()}`, {});
 if (items?.length === 0) return null;
 let content = children;
 if (items) {
  const authored = Children.toArray(children).flatMap(node => Children.toArray(node.props?.children));
  const defaults = new Map(authored.filter(node=>node.type==='details').map(node=>{
   const [summary,answer] = Children.toArray(node.props.children);
   return [JSON.stringify([plainText(summary),plainText(answer)]),node];
  }));
  content = <div className="standard-faq-list">{items.map(([question,answer],index)=>{
   const original = defaults.get(JSON.stringify([question,answer]));
   return original ? cloneElement(original,{key:index}) : <details key={index}>
    <summary>{question}<span aria-hidden="true"><SiteIcon name="chevron" size={16}/></span></summary>
    <p>{answer}</p>
   </details>;
  })}</div>;
 }
 return <div className="standard-faq-panel">
  <figure className="standard-faq-image"><StudioImage mediaSlot="FaqPanel-1" src="/assets/stills/faq-film-studio.webp" alt="Frequently asked questions, with film studio lighting and camera equipment" width="1200" height="800" loading="lazy" decoding="async"/></figure>
  <div className="standard-faq-content"><div className="standard-faq-heading">{heading}</div>{content}</div>
 </div>;
}
