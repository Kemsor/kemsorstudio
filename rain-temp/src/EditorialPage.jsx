import ManagedHero from './ManagedHero';
import PageBreadcrumbs from './PageBreadcrumbs';
import {cmsText} from './siteContent';
import StudioImage from './StudioImage';
import {chapterStyler} from './VisualChapters';
import SiteIcon from './SiteIcon';
import { isTextElement } from './TextMotion';
import React, { Children, cloneElement, isValidElement, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from './useMotion';
import './editorial-page.css';
import SectionSubmenu from './SectionSubmenu';
import { PageHero, SectionHeading, PageCTA } from './PageUI';

const hasClass = (node, name) => isValidElement(node) && (node.props.className || '').split(/\s+/).includes(name);
function nodes(children) {
  return Children.toArray(children).flatMap(node => isValidElement(node) && node.type === React.Fragment ? nodes(node.props.children) : [node]);
}
function findNode(node, predicate) {
  if (!isValidElement(node)) return null;
  if (predicate(node)) return node;
  for (const child of nodes(node.props.children)) { const match = findNode(child, predicate); if (match) return match; }
  return null;
}
export function ProcessRoute() {
  return <div className="ep-process-route" aria-hidden="true"><svg viewBox="0 0 900 90" fill="none"><path className="ep-route-base" d="M20 45H180Q225 45 225 65T270 65H410Q450 65 450 35T490 35H630Q675 35 675 55T720 55H880"/><path className="ep-route-trace" pathLength="1" d="M20 45H180Q225 45 225 65T270 65H410Q450 65 450 35T490 35H630Q675 35 675 55T720 55H880"/>{[[20,45],[305,65],[590,35],[880,55]].map(([cx,cy])=><circle key={cx} cx={cx} cy={cy} r="7"/>)}</svg></div>;
}

export function EditorialHero({page='studio',heading,title,accent,description,image,alt,id,breadcrumb}) {
  const backdrop=typeof image==='string'
    ?<StudioImage mediaSlot="EditorialPage-1" src={image} alt={alt||''} fetchPriority="high" decoding="async"/>
    :image;
  return <>
    <ManagedHero heading={heading} title={accent&&typeof title==='string'&&title.endsWith(',')?`${title} ${accent}`:title} description={description} image={backdrop} id={id}/>
    <PageBreadcrumbs page={page}>{breadcrumb}</PageBreadcrumbs>
  </>;
}

function ServiceAccordion({ list }) {
  const [motionPaused,setMotionPaused] = useState(false);
  const [active,setActive] = useState(0);
  const items = nodes(list.props.children).filter(isValidElement);
  return <div className="ep-accordion studio-ledger studio-ledger-accordion">{items.map((item,index)=>{
    const dt = findNode(item,n=>n.type==='dt');
    const dd = findNode(item,n=>n.type==='dd');
    if(!dt || !dd) return item;
    const title = nodes(dt.props.children).filter(n=>!(isValidElement(n)&&n.type==='span'&&n.props['aria-hidden']));
    if(list.props['data-independent']) return <details key={item.key || index}><summary><h3>{title}</h3><span className="ep-plus" aria-hidden="true"><SiteIcon name="chevron" size={16}/></span></summary><div className="ep-accordion-copy">{dd.props.children}</div></details>;
    return <details key={item.key || index} open={active===index} onPointerEnter={event=>{if(event.pointerType==='mouse')setActive(index);}}><summary onClick={event=>{event.preventDefault();setActive(value=>value===index?-1:index);}}><h3>{title}</h3><span className="ep-plus" aria-hidden="true"><SiteIcon name="plus" size={16} /></span></summary><div className="ep-accordion-copy">{dd.props.children}</div></details>;
  })}</div>;
}
function prepareSection(node, process) {
  if (!isValidElement(node)) return node;
  if(hasClass(node,'line-production-deliverables')) return <ServiceAccordion key={node.key} list={node}/>;
  const content = nodes(node.props.children).map(child=>prepareSection(child,false));
  return cloneElement(node,{},...content);
}
// Adapts the existing, authored section elements without duplicating page copy.
// The original section IDs and all nested forms, links and CMS components survive.
export default function EditorialPage({page,children,sectionOrder}) {
  const styleChapter=chapterStyler(page);
  const root = Children.only(children);
  const all = nodes(root.props.children);
  const hero = all.find(n=>hasClass(n,'produce-hero') || n.type===PageHero);
  const breadcrumb = all.find(n=>hasClass(n,'produce-breadcrumb'));
  const outsideActions = all.find(n=>hasClass(n,'about-banner-actions'));
  const isSharedHero = hero?.type===PageHero;
  const heroContent = hero && findNode(hero,n=>hasClass(n,'produce-hero-content'));
  const heading = hero && findNode(hero,n=>isTextElement(n,'h1'));
  const image = hero && findNode(hero,n=>(n.type==='img'||n.type===StudioImage));
  const description = heroContent && nodes(heroContent.props.children).find(n=>isValidElement(n)&&isTextElement(n,'p')&&!hasClass(n,'produce-kicker'));
  const pack = hero && findNode(hero,n=>hasClass(n,'finance-pack'));
  const serviceSubmenu = ['develop','story-script','packaging-talent','budgeting-scheduling'].includes(page) ? all.find(n=>hasClass(n,'finance-subnav')) : null;
  const body = all.filter(n=>n!==hero&&n!==breadcrumb&&n!==outsideActions&&!hasClass(n,'make-top-strip')).flatMap(n=>hasClass(n,'page-directory')?nodes(n.props.children):[n]);
  if(pack) body.unshift(cloneElement(pack,{key:'finance-pack-chapter',id:'finance-ready-pack'}));
  const orderedBody = sectionOrder
    ? sectionOrder.map(id=>body.find(node=>node.props?.id===id)).filter(Boolean)
    : body;
  const content = orderedBody.map((node,index)=>{
    if(!isValidElement(node))return node;
    if(node===serviceSubmenu)return null;
    const section = node.type==='section'||node.type==='aside'||node.type===PageCTA;
    if(!section)return node;
    const id = node.props.id || `${page}-chapter-${index+1}`;
    const process = hasClass(node,'produce-process') || hasClass(node,'about-approach') || id==='production-process';
    const props = {id,className:`${node.props.className||''} ep-chapter${process?' ep-process':''}`, 'data-ep-chapter':true};
    const prepared = prepareSection(node,process);
    return styleChapter(typeof node.type==='string' ? cloneElement(prepared,{...props,key:node.key||id}) : <div {...props} key={id}>{prepared}</div>,index);
  });
  const host = useRef(null);
  const reduced = useReducedMotion();
  const [motionPaused,setMotionPaused] = useState(false);
  useEffect(()=>{
    const container = host.current;
    const elements = [...container.querySelectorAll('[data-ep-chapter]')];
    const observer = new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('ep-in-view');observer.unobserve(entry.target);}}),{rootMargin:cmsText("EditorialPage","67055bdace6960a4","0px 0px 20px 0px"),threshold:0});
    elements.forEach(element=>observer.observe(element));
    return()=>observer.disconnect();
  },[page,content.length]);
  const shared = isSharedHero ? hero.props : {};
  return <div ref={host} className={`${root.props.className||''} ep-page editorial-page service-page-layout`} data-service-page={page} data-ep-motion={motionPaused?'paused':'playing'} data-ep-reduced={reduced?'true':'false'}>
    <EditorialHero {...shared} page={page} breadcrumb={breadcrumb} heading={heading} description={description||shared.description} image={image||shared.image}/>
    {serviceSubmenu && <SectionSubmenu section="develop" page={page}/>}
    <div className="ep-body ep-width ep-body-single"><div className="ep-chapters">{content}</div></div>
  </div>;
}
