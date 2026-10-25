import { isTextElement } from './TextMotion';
import React, { Children, cloneElement, isValidElement } from 'react';
import SectionSubmenu from './SectionSubmenu';
import './finance-layout.css';

const hasClass = (node, name) => isValidElement(node) && (node.props.className || '').split(/\s+/).includes(name);
const nodes = children => Children.toArray(children).flatMap(node => isValidElement(node) && node.type === React.Fragment ? nodes(node.props.children) : [node]);
function find(node, predicate) {
  if (!isValidElement(node)) return null;
  if (predicate(node)) return node;
  for (const child of nodes(node.props.children)) { const result = find(child, predicate); if (result) return result; }
  return null;
}
function words(node) {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(words).join(' ');
  return isValidElement(node) ? words(node.props.children) : '';
}

function stripLabels(node) {
  if (!isValidElement(node)) return node;
  if (node.type?.displayName === 'EditorialLabel' || hasClass(node, 'produce-label')) return null;
  if (node.props.children === undefined) return node;
  return cloneElement(node, {}, nodes(node.props.children).map(stripLabels));
}

// A separate Finance presentation. The existing authored content and section IDs stay intact.
export default function FinanceLayout({ page, children }) {
  const root = Children.only(children);
  const all = nodes(root.props.children);
  const hero = all.find(node => hasClass(node, 'produce-hero'));
  const copy = find(hero, node => hasClass(node, 'produce-hero-content'));
  const heading = find(copy, node => isTextElement(node,'h1'));
  const kicker = find(copy, node => hasClass(node, 'produce-kicker'));
  const description = nodes(copy?.props.children).find(node => isTextElement(node,'p') && !hasClass(node, 'produce-kicker'));
  const actions = find(copy, node => hasClass(node, 'produce-actions'));
  const image = find(hero, node => node.type === 'img');
  const pack = find(hero, node => hasClass(node, 'finance-pack'));
  const breadcrumb = all.find(node => hasClass(node, 'produce-breadcrumb'));
  const body = all.filter(node => node !== hero && node !== breadcrumb);
  if (pack) body.unshift(cloneElement(pack, { key: 'finance-ready-pack', id: 'finance-ready-pack' }));
  return <div className={`${root.props.className || ''} finance-layout`}>
    <header className="fl-hero">
      <div className="fl-width">
        <div className="fl-breadcrumb">{breadcrumb}</div>
        <div className="fl-hero-grid">
          <div className="fl-hero-copy">{kicker}{heading}{description}{actions}</div>
          <figure className="fl-hero-image">{image && cloneElement(image, { alt: image.props.alt || 'Illustrative production image', sizes: '(max-width: 700px) 90vw, 44vw' })}<span className="fl-image-number" aria-hidden="true">02</span></figure>
        </div>
      </div>
    </header>
    <SectionSubmenu section="finance" page={page}/>
    <div className="fl-body">{body.map((node, index) => {
      if (!isValidElement(node) || hasClass(node, 'finance-subnav')) return null;
      const isPack = hasClass(node, 'finance-pack');
      const label = find(node, child => child.type?.displayName === 'EditorialLabel' || hasClass(child, 'produce-label'));
      const sectionTitle = find(node, child => isTextElement(child,'h2'));
      const id = node.props.id || `${page}-chapter-${index + 1}`;
      const sectionChildren = isPack ? cloneElement(node, { id: undefined }) : nodes(node.props.children).map(stripLabels);
      const sectionLabel = isPack ? 'FINANCE-READY PACK' : label ? label.props.children : node.props['aria-label'] || words(sectionTitle);
      const number = String(body.slice(0, index + 1).filter(child => isValidElement(child) && !hasClass(child, 'finance-subnav')).length).padStart(2, '0');
      return <section id={id} className={`fl-section ${isPack ? 'fl-pack-section' : ''} ${hasClass(node, 'produce-process') ? 'fl-process-section' : ''} ${hasClass(node, 'produce-closing') ? 'fl-closing-section' : ''}`} aria-labelledby={node.props['aria-labelledby']} aria-label={node.props['aria-label']} key={id}>
        <div className="fl-width fl-section-grid"><div className="fl-section-heading"><span>{number}</span><p>{sectionLabel}</p></div><div className={`fl-section-content ${isPack ? 'fl-pack-content' : node.props.className || ''}`}>{sectionChildren}</div></div>
      </section>;
    })}</div>
  </div>;
}
