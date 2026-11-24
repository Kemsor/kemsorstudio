import PageBreadcrumbs from './PageBreadcrumbs';
import StudioImage from './StudioImage';
import {chapterStyler} from './VisualChapters';
import MotionHeading, { isTextElement, MotionCopy } from './TextMotion';
import { CTA } from './PageUI';
import { cmsText } from './siteContent';
import React, { Children, cloneElement, isValidElement } from 'react';
import SectionSubmenu from './SectionSubmenu';
import RelatedServicesShowcase from './RelatedServicesShowcase';
import AudienceCollage from './AudienceCollage';
import FaqPanel from './FaqPanel';
import './produce-layout.css';

const hasClass = (node, name) => isValidElement(node) && (node.props.className || '').split(/\s+/).includes(name);
const nodes = children => Children.toArray(children).flatMap(node => isValidElement(node) && node.type === React.Fragment ? nodes(node.props.children) : [node]);
function find(node, predicate) {
  if (!isValidElement(node)) return null;
  if (predicate(node)) return node;
  for (const child of nodes(node.props.children)) { const match = find(child, predicate); if (match) return match; }
  return null;
}

function numberSection(node, nextNumber) {
  if (hasClass(node, 'produce-related-faq-group')) {
    return cloneElement(node, {}, Children.map(node.props.children, child => numberSection(child, nextNumber)));
  }
  if (!isValidElement(node)) return node;

  const number = nextNumber();
  if (node.type === RelatedServicesShowcase || node.type === AudienceCollage) {
    return cloneElement(node, { sectionNumber: number });
  }

  const marker = <span className="related-showcase-count">{number}</span>;
  let inserted = false;
  function insert(child) {
    if (inserted || !isValidElement(child)) return child;
    if (child.type === FaqPanel) {
      inserted = true;
      return cloneElement(child, { heading: <>{marker}{child.props.heading}</> });
    }
    if (hasClass(child, 'set-related-count')) {
      inserted = true;
      return marker;
    }
    if (child.type?.displayName === 'EditorialLabel' || hasClass(child, 'produce-label') || isTextElement(child, 'h2')) {
      inserted = true;
      return <>{marker}{child}</>;
    }
    return child.props.children ? cloneElement(child, {}, Children.map(child.props.children, insert)) : child;
  }
  return insert(node);
}

// Produce uses a panoramic presentation. Authored copy, sections and destinations are retained.
export default function ProduceLayout({page,children}) {
  const styleChapter=chapterStyler(page);
  const root = Children.only(children);
  const all = nodes(root.props.children);
  const hero = all.find(node => hasClass(node,'produce-hero'));
  const copy = find(hero,node=>hasClass(node,'produce-hero-content'));
  const heading = find(copy,node=>isTextElement(node,'h1'));
  const kicker = find(copy,node=>hasClass(node,'produce-kicker'));
  const description = nodes(copy?.props.children).find(node=>isTextElement(node,'p')&&!hasClass(node,'produce-kicker'));
  const actions = find(copy,node=>hasClass(node,'produce-actions'));
  const image = find(hero,node=>(node.type==='img'||node.type===StudioImage));
  const foot = find(hero,node=>hasClass(node,'produce-hero-foot'));
  const breadcrumb = all.find(node=>hasClass(node,'produce-breadcrumb'));
  const sectionNodes = all.filter(node=>node!==hero&&node!==breadcrumb);
  const sections = [];
  for (let index = 0; index < sectionNodes.length; index += 1) {
    const node = sectionNodes[index];
    const next = sectionNodes[index + 1];
    const isRelated = isValidElement(node) && (node.type === RelatedServicesShowcase || hasClass(node, 'set-related-showcase'));
    if (isRelated && hasClass(next, 'produce-questions')) {
      sections.push(<div className="produce-related-faq-group" key={`related-faq-${index}`}>{node}{next}</div>);
      index += 1;
    } else sections.push(node);
  }
  sections.push(
    <section className="produce-section produce-closing inner-closing" aria-labelledby="set-production-design-closing-title">
      <div className="produce-label"><span>{cmsText("SetProductionDesignPage","5f573be5f2ca65fb","YOUR NEXT PRODUCTION")}</span></div>
      <div>
        <MotionHeading as="h2" id="set-production-design-closing-title">
          {cmsText("SetProductionDesignPage","174fe079cc017f89","Building")}<br/><em>{cmsText("SetProductionDesignPage","c556647e0120edfd","a world?")}</em>
        </MotionHeading>
        <div>
          <MotionCopy>{cmsText("SetProductionDesignPage","70b419c445b96c8f","Tell us about the story and its setting. We’ll help bring it to the screen.")}</MotionCopy>
          <CTA href="/contact/?category=creative#project-brief">{cmsText("SetProductionDesignPage","364904d00c8092bd","Start a conversation")}</CTA>
        </div>
      </div>
    </section>
  );
  let sectionNumber = 0;
  const nextNumber = () => String(++sectionNumber).padStart(2, '0');
  return <div className={`${root.props.className || ''} production-layout service-page-layout`} data-service-page={page}>
    <header className="inner-hero pl-hero"><div className="pl-width">

      <div className="pl-hero-heading"><div>{kicker}{heading}</div></div>
      <figure className="pl-panorama">{image&&cloneElement(image,{alt:image.props.alt||'Illustrative production image',sizes:'(max-width: 600px) 90vw, 92vw'})}<span className="pl-frame pl-frame-a" aria-hidden="true"/><span className="pl-frame pl-frame-b" aria-hidden="true"/></figure>
      <div className="pl-hero-brief"><div>{description}</div>{actions}</div>
      {foot&&<div className="pl-hero-foot">{foot.props.children}</div>}
    </div></header>
    <PageBreadcrumbs page={page}>{breadcrumb}</PageBreadcrumbs>
    <SectionSubmenu section="produce" page={page}/>
    <div className="pl-body">{sections.map((node,index)=>{
      if(!isValidElement(node))return node;
      const id=node.props.id||`${page}-chapter-${index+1}`;
      return styleChapter(<section id={id} className={`pl-section${hasClass(node,'produce-process')?' pl-process':''}${hasClass(node,'produce-audiences')?' pl-audiences':''}${hasClass(node,'produce-closing')?' pl-closing':''}`} aria-labelledby={node.props['aria-labelledby']} key={id}><div className="pl-width">{cloneElement(numberSection(node, nextNumber),{id:undefined,className:`${node.props.className||''} pl-section-content`})}</div></section>,index);
    })}</div>
  </div>;
}
