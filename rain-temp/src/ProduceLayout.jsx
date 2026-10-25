import { isTextElement } from './TextMotion';
import React, { Children, cloneElement, isValidElement } from 'react';
import SectionSubmenu from './SectionSubmenu';
import './produce-layout.css';

const hasClass = (node, name) => isValidElement(node) && (node.props.className || '').split(/\s+/).includes(name);
const nodes = children => Children.toArray(children).flatMap(node => isValidElement(node) && node.type === React.Fragment ? nodes(node.props.children) : [node]);
function find(node, predicate) {
  if (!isValidElement(node)) return null;
  if (predicate(node)) return node;
  for (const child of nodes(node.props.children)) { const match = find(child, predicate); if (match) return match; }
  return null;
}

// Produce uses a panoramic presentation. Authored copy, sections and destinations are retained.
export default function ProduceLayout({page,children}) {
  const root = Children.only(children);
  const all = nodes(root.props.children);
  const hero = all.find(node => hasClass(node,'produce-hero'));
  const copy = find(hero,node=>hasClass(node,'produce-hero-content'));
  const heading = find(copy,node=>isTextElement(node,'h1'));
  const kicker = find(copy,node=>hasClass(node,'produce-kicker'));
  const description = nodes(copy?.props.children).find(node=>isTextElement(node,'p')&&!hasClass(node,'produce-kicker'));
  const actions = find(copy,node=>hasClass(node,'produce-actions'));
  const image = find(hero,node=>node.type==='img');
  const foot = find(hero,node=>hasClass(node,'produce-hero-foot'));
  const breadcrumb = all.find(node=>hasClass(node,'produce-breadcrumb'));
  const sections = all.filter(node=>node!==hero&&node!==breadcrumb);
  return <div className={`${root.props.className || ''} production-layout`}>
    <header className="pl-hero"><div className="pl-width">
      <div className="pl-breadcrumb">{breadcrumb}</div>
      <div className="pl-hero-heading"><div>{kicker}{heading}</div><span className="pl-stage-number" aria-hidden="true">03</span></div>
      <figure className="pl-panorama">{image&&cloneElement(image,{alt:image.props.alt||'Illustrative production image',sizes:'(max-width: 600px) 90vw, 92vw'})}<span className="pl-frame pl-frame-a" aria-hidden="true"/><span className="pl-frame pl-frame-b" aria-hidden="true"/></figure>
      <div className="pl-hero-brief"><div>{description}</div>{actions}</div>
      {foot&&<div className="pl-hero-foot">{foot.props.children}</div>}
    </div></header>
    <SectionSubmenu section="produce" page={page}/>
    <div className="pl-body">{sections.map((node,index)=>{
      if(!isValidElement(node))return node;
      const id=node.props.id||`${page}-chapter-${index+1}`;
      return <section id={id} className={`pl-section${hasClass(node,'produce-process')?' pl-process':''}${hasClass(node,'produce-audiences')?' pl-audiences':''}${hasClass(node,'produce-closing')?' pl-closing':''}`} aria-labelledby={node.props['aria-labelledby']} key={id}><div className="pl-width">{cloneElement(node,{id:undefined,className:`${node.props.className||''} pl-section-content`})}</div></section>;
    })}</div>
  </div>;
}
