import PageBreadcrumbs from './PageBreadcrumbs';
import {cmsText,cmsData} from './siteContent';
import StudioImage from './StudioImage';
import {chapterStyler} from './VisualChapters';
import SiteIcon from './SiteIcon';
import MotionHeading, { isTextElement } from './TextMotion';
import React, { Children, cloneElement, isValidElement, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from './useMotion';
import './editorial-page.css';
import SectionSubmenu from './SectionSubmenu';
import { PageHero, SectionHeading, PageCTA, CTA, TextLink } from './PageUI';

const directions = cmsData(()=>({
  'locations-logistics': [cmsText("EditorialPage","444c13aaa83e3e01","THE LOCATION FILE"), cmsText("EditorialPage","ba1cfcd4cd116be3","From the script"), cmsText("EditorialPage","ed386dbcdcb5a713","to solid ground."), 'location'],
  'line-production': [cmsText("EditorialPage","f592a900b1d0c29f","THE PRODUCTION FILE"), cmsText("EditorialPage","f5de7032b4808afd","People. Time. Money."), cmsText("EditorialPage","3a0ffc7762daf9d1","One working plan."), 'production'],
  casting: [cmsText("EditorialPage","3a7a4ecb1081dc4e","THE CASTING FILE"), cmsText("EditorialPage","92129094cb4fcae4","From the character"), cmsText("EditorialPage","f4bb6ebe0ec47b38","to the cast."), 'casting'],
  'crew-equipment': [cmsText("EditorialPage","25d7b8bd8e4cdb6e","THE TECHNICAL FILE"), cmsText("EditorialPage","ad0db4d1a5d3c307","The people. The kit."), cmsText("EditorialPage","58c6b3236ff8157b","Ready for the shoot."), 'crew'],
  'set-production-design': [cmsText("EditorialPage","97f6efc094f21104","THE DESIGN FILE"), cmsText("EditorialPage","5cc8793a953ab24d","From the page"), cmsText("EditorialPage","38c125f83e9d92f0","to a world on set."), 'design'],
  'shooting-on-location': [cmsText("EditorialPage","22f2f182f8be68bb","THE SHOOT FILE"), cmsText("EditorialPage","e2f111d34afdf909","From the call sheet"), cmsText("EditorialPage","7bbfdf005f22bd7f","to the final take."), 'camera'],
  'international-co-productions': [cmsText("EditorialPage","330da85571b1d616","THE INTERNATIONAL FILE"), cmsText("EditorialPage","dcd503b09e21c2de","Many countries."), cmsText("EditorialPage","6415a4617bd273f3","One production plan."), 'international'],
  'finance-structuring': [cmsText("EditorialPage","21a19825cc6a852d","THE STRUCTURING FILE"), cmsText("EditorialPage","a57d88cda6aa0cf5","Budget. Sources. Timing."), cmsText("EditorialPage","a552e74577d19245","One finance plan."), 'finance'],
  'co-production': [cmsText("EditorialPage","1012dfecba0a4e77","THE PARTNERSHIP FILE"), cmsText("EditorialPage","90f3aef8273fa02a","Shared strengths."), cmsText("EditorialPage","4354fcf53d182d41","One agreed plan."), 'production'],
  'story-script': [cmsText("EditorialPage","2fa11893e343974d","THE SCRIPT FILE"), cmsText("EditorialPage","ba3ce3b70d7f6f59","Creative and production."), cmsText("EditorialPage","862037e7e7d60db4","On the same page."), 'production'],
  'packaging-talent': [cmsText("EditorialPage","69f1c1e1bdd17301","PROJECT PACKAGE"), cmsText("EditorialPage","adf3d9c86bb63b4e","The right people."), cmsText("EditorialPage","1f9691666858e31c","An honest picture."), 'production'],
  'budgeting-scheduling': [cmsText("EditorialPage","fc0f31676834b9cd","THE PRODUCTION PLAN"), cmsText("EditorialPage","9437a0d490104634","Cost and time."), cmsText("EditorialPage","b8d3e498d22d72c8","Built from the script."), 'finance'],
  develop: [cmsText("EditorialPage","f9e68c0487f6f0cd","DEVELOPMENT JOURNEY"), cmsText("EditorialPage","6871aa1c1a532810","From the first idea"), cmsText("EditorialPage","a9fbe79187b03d77","to a project ready to make."), 'production'],
  finance: [cmsText("EditorialPage","86b1873d2bad3df8","THE FINANCE FILE"), cmsText("EditorialPage","f30c699f781da67a","The creative vision."), cmsText("EditorialPage","3eb40bd560d7aca5","A plan to carry it."), 'finance'],
  'what-we-make': [cmsText("EditorialPage","993ea25958f6dda5","THE STORY FILE"), cmsText("EditorialPage","43fef8c6e1e03de3","Different formats."), cmsText("EditorialPage","4a4cf6dae336003e","The same craft."), 'frames'],
  about: [cmsText("EditorialPage","b0d1a3a36ca91303","THE STUDIO FILE"), cmsText("EditorialPage","58eb6c270135435a","Creative ambition."), cmsText("EditorialPage","9643e90bf396a618","Production discipline."), 'production'],
  services: [cmsText("EditorialPage","ffd3241d2e31fd8f","THE PRODUCTION FILE"), cmsText("EditorialPage","1c40a88200f4c9bf","From the first idea"), cmsText("EditorialPage","e24998f431c6c6ba","to the final frame."), 'production'],
  productions: [cmsText("EditorialPage","c5b818ec0bf71009","THE VISUAL ARCHIVE"), cmsText("EditorialPage","8e91cbc575f9305f","Character. Place."), cmsText("EditorialPage","33582a96581b99bb","A moment in frame."), 'frames'],
  produce: [cmsText("EditorialPage","5c01175fe2b246d6","THE PRODUCTION FILE"), cmsText("EditorialPage","4fed55456c43787b","Story first."), cmsText("EditorialPage","f311ae7640fcd829","Production ready."), 'camera'],
}));
const clientContentPages = new Set(["develop", "story-script", "packaging-talent", "budgeting-scheduling", "finance", "finance-structuring", "co-production", "international-co-productions", "produce", "line-production", "casting", "crew-equipment", "locations-logistics", "set-production-design", "shooting-on-location", "what-we-make"]);
const defaultDirection = cmsData(()=>([cmsText("EditorialPage","917266806ca001e5","KEMSOR STUDIOS"), cmsText("EditorialPage","f92f90958af4b78a","Story. Craft."), cmsText("EditorialPage","4288c4fbc24e0d05","Cinema."), 'frames']));
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
function text(node) {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(text).join(' ');
  if (!isValidElement(node)) return '';
  return node.type === 'br' ? ' ' : text(node.props.children);
}
const tidy = value => value.replace(/\s+/g, ' ').trim();

export function ProductionDrawing({ kind = 'production' }) {
  return <svg className={`ep-drawing ep-drawing-${kind}`} viewBox="0 0 300 315" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    {kind === 'location' ? <>
      <g className="ep-contours" strokeWidth=".8">{Array.from({length:11}, (_,i) => <path key={i} transform={`translate(0 ${i*24})`} d="M-30 95C45-12 98 12 150 39S229 29 334-13"/>)}</g>
      <path className="ep-survey-route" d="M57 249C35 206 119 222 110 172S57 117 112 92S207 124 229 69" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="5 7"/>
      <circle cx="57" cy="249" r="7" fill="#ffffff"/><circle cx="57" cy="249" r="2" fill="currentColor"/>
      <circle className="ep-pin-pulse" cx="229" cy="69" r="18"/><path d="M229 48C219 48 212 55 212 64C212 78 229 90 229 90S246 78 246 64C246 55 239 48 229 48Z" fill="currentColor"/><circle cx="229" cy="64" r="5" fill="#d2d2d2" stroke="none"/>
      <path d="M237 270H273M255 252V288"/><circle cx="255" cy="270" r="22" strokeDasharray="1 6"/>
    </> : <>
      <g className="ep-drawing-grid" strokeWidth=".6">{[40,80,120,160,200,240,280].map(n=><React.Fragment key={n}><path d={`M20 ${n}H280`}/><path d={`M${n} 20V290`}/></React.Fragment>)}</g>
      {kind === 'international' ? <><ellipse cx="150" cy="154" rx="96" ry="96"/><ellipse cx="150" cy="154" rx="44" ry="96"/><path d="M54 154H246 M67 108H233 M67 200H233 M150 58V250" strokeWidth=".8"/><path className="ep-survey-route" d="M79 192Q102 67 220 115 M79 192Q211 268 220 115" strokeWidth="3" strokeDasharray="4 7"/><circle cx="79" cy="192" r="8" fill="#d2d2d2"/><circle className="ep-pin-pulse" cx="220" cy="115" r="15"/><circle cx="220" cy="115" r="6" fill="currentColor"/></> : kind === 'finance' ? <><path d="M57 65H183L209 91V235H57Z M183 65V91H209 M74 108H160 M74 126H135 M74 195H189"/><path d="M83 182V157H102V182 M119 182V142H138V182 M155 182V116H174V182"/><path className="ep-survey-route" d="M35 250H230V114H250" strokeDasharray="4 7"/><circle cx="230" cy="250" r="7" fill="#d2d2d2"/><path d="M232 54V36H250 M41 218H23V236"/></> :
      kind === 'casting' ? <><path d="M55 63H245V247H55Z M43 87V51H79 M221 51H257V87 M43 223V259H79 M221 259H257V223"/><circle cx="150" cy="125" r="30"/><path d="M91 223V205C91 169 209 169 209 205V223 M126 128H133 M167 128H174 M139 143Q150 151 161 143"/><path className="ep-survey-route" d="M75 80H225V230H75Z" strokeDasharray="3 7"/></> :
      kind === 'design' ? <><path d="M44 133L149 78L256 133V232L149 285L44 232Z M44 133L149 186L256 133 M149 186V285 M149 78V36 M23 123L5 114 M275 123L293 114"/><path d="M76 148V215L126 240V173 M177 172V239L226 215V148"/><path className="ep-survey-route" d="M149 78V186M44 232L149 179L256 232" strokeDasharray="4 7"/><circle cx="149" cy="186" r="6" fill="#d2d2d2"/></> :
      kind === 'crew' ? <><path d="M73 102H180V180H73Z M180 125L222 104V177L180 157 M89 102V86H149V102 M128 180V212 M94 257L128 212L162 257 M128 212V264"/><circle cx="98" cy="142" r="12"/><path className="ep-survey-route" d="M38 63H249V223H204 M38 63V223H65" strokeDasharray="4 7"/><circle cx="38" cy="63" r="6" fill="#d2d2d2"/><path d="M25 277H275"/></> :
      kind === 'frames' ? <><path d="M39 52H174V145H39Z M126 171H261V264H126Z M51 133L81 98L112 119L145 84L162 104 M138 250L166 219L193 237L222 198L249 227"/><circle cx="65" cy="77" r="8"/><circle cx="236" cy="188" r="7"/><path className="ep-survey-route" d="M185 98H232V151M68 158V218H115" strokeDasharray="4 7"/><path d="M226 145L232 151L238 145 M109 212L115 218L109 224"/></> :
      kind === 'camera' ? <><path d="M47 83H253V236H47Z M35 104V71H68 M232 71H265V104 M35 215V248H68 M232 248H265V215"/><circle cx="150" cy="159" r="48"/><circle cx="150" cy="159" r="28"/><path d="M150 98V220M89 159H211" strokeWidth=".7"/><circle className="ep-pin-pulse" cx="150" cy="159" r="56"/><path d="M70 270H230" strokeDasharray="4 6"/></> :
      <><path d="M45 49H111L129 67V132H45Z M111 49V67H129 M58 83H110 M58 97H104 M58 111H110 M174 183H255V257H174Z M165 193V174H184 M245 174H264V193 M165 248V267H184 M245 267H264V248"/><path className="ep-survey-route" d="M87 144V204Q87 220 104 220H159 M143 211L159 220L143 229" strokeDasharray="4 7"/><circle cx="215" cy="220" r="20"/><path d="M209 211L224 220L209 229Z" fill="currentColor" stroke="none"/></>}
    </>}
  </svg>;
}

export function ProcessRoute() {
  return <div className="ep-process-route" aria-hidden="true"><svg viewBox="0 0 900 90" fill="none"><path className="ep-route-base" d="M20 45H180Q225 45 225 65T270 65H410Q450 65 450 35T490 35H630Q675 35 675 55T720 55H880"/><path className="ep-route-trace" pathLength="1" d="M20 45H180Q225 45 225 65T270 65H410Q450 65 450 35T490 35H630Q675 35 675 55T720 55H880"/>{[[20,45],[305,65],[590,35],[880,55]].map(([cx,cy])=><circle key={cx} cx={cx} cy={cy} r="7"/>)}</svg></div>;
}

export function EditorialHero({ page = 'studio', heading, title, accent, description, eyebrow, image, alt, caption, actions, breadcrumb, foot, id, compact = false, paused = false, graphic, onMotionChange }) {
  const reduced = useReducedMotion();
  const stop = paused || reduced;
  const [label, line, ending, kind] = directions[page] || defaultDirection;
  const sourceCopy = clientContentPages.has(page);
  const headingNode = heading || <MotionHeading as="h1" id={id}>{title}{accent && <span>{accent}</span>}</MotionHeading>;
  const responsiveBase = typeof image === 'string' ? image.match(/^(\/assets\/stills\/.+)-(?:640|960|1600)\.webp$/)?.[1] : null;
  const imageNode = typeof image === 'string' ? <StudioImage mediaSlot="EditorialPage-1" src={image} srcSet={responsiveBase ? [640,960,1600].map(width=>`${responsiveBase}-${width}.webp ${width}w`).join(', ') : undefined} alt={alt || ''} fetchPriority="high" decoding="async" width="1600" height="900"/> : image;
  function move(event) {
    if(stop || event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--ep-image-x',`${(event.clientX-rect.left-rect.width/2)*-.012}px`);
    event.currentTarget.style.setProperty('--ep-image-y',`${(event.clientY-rect.top-rect.height/2)*-.012}px`);
  }
  function reset(event) {event.currentTarget.style.setProperty('--ep-image-x','0px');event.currentTarget.style.setProperty('--ep-image-y','0px');}
  return <><section className={`inner-hero ep-hero${compact ? ' ep-hero-compact' : ''}`} data-ep-motion={stop?'paused':'playing'} aria-labelledby={headingNode.props.id || undefined}>
    <div className="ep-width">
      <div className="ep-hero-heading"><div>{headingNode}{caption && <p className="ep-hero-note">{caption}</p>}</div><div className="ep-hero-copy">{description && (isValidElement(description) ? description : <p>{description}</p>)}{actions && <div className="ep-actions">{actions}</div>}</div></div>
      {!compact && imageNode && <div className="ep-board"><figure className="ep-hero-photo"><div className="ep-image-window" onPointerMove={move} onPointerLeave={reset}>{cloneElement(imageNode,{alt:imageNode.props.alt || alt || cmsText("EditorialPage","b06bd5e721f9ca3b","Production visual supplied for Kemsor Studios"),sizes:cmsText("EditorialPage","c5ab29676d354502","(max-width: 600px) 90vw, (max-width: 900px) 65vw, 70vw")})}{['a','b','c','d'].map(c=><span key={c} className={`ep-corner ep-corner-${c}`} aria-hidden="true"/>)}<span className="ep-focus" aria-hidden="true"><i/></span><span className="ep-frame-tab">{cmsText("EditorialPage","2e357267b4309176","STORY. CRAFT. CINEMA.")}</span></div><figcaption><span>{eyebrow}</span><span>{cmsText("EditorialPage","0f452bf909f900a9","VISUAL STUDY / KEMSOR STUDIOS")}</span></figcaption></figure><aside className="ep-file-card" aria-label={graphic?.props['aria-label'] || `${label.toLowerCase()} illustration`}><div className="ep-file-heading"><span>{label}</span><span aria-hidden="true"><SiteIcon name="arrow-up-right" size={16} /></span></div>{graphic || <ProductionDrawing kind={kind}/>}{!sourceCopy && <div className="ep-file-caption"><span>{line}<br/><strong>{ending}</strong></span><span className="ep-file-mark" aria-hidden="true">{cmsText("EditorialPage","e49c7dbc81bb767b","K")}</span></div>}</aside></div>}
      {!compact && imageNode && <details className="ep-mobile-study"><summary><span>{label}</span><span aria-hidden="true"><SiteIcon name="plus" size={16} /></span></summary><div className="ep-mobile-study-content">{graphic || <ProductionDrawing kind={kind}/>}</div></details>}
      {foot && <div className="ep-hero-foot">{foot}</div>}
    </div>
  </section><PageBreadcrumbs page={page}>{breadcrumb}</PageBreadcrumbs></>;
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
export default function EditorialPage({page,children}) {
  const styleChapter=chapterStyler(page);
  const root = Children.only(children);
  const all = nodes(root.props.children);
  const hero = all.find(n=>hasClass(n,'produce-hero') || n.type===PageHero);
  const breadcrumb = all.find(n=>hasClass(n,'produce-breadcrumb'));
  const outsideActions = all.find(n=>hasClass(n,'about-banner-actions'));
  const isSharedHero = hero?.type===PageHero;
  const heroContent = hero && findNode(hero,n=>hasClass(n,'produce-hero-content'));
  const heading = hero && findNode(hero,n=>isTextElement(n,'h1'));
  const kicker = hero && findNode(hero,n=>hasClass(n,'produce-kicker'));
  const graphic = hero && findNode(hero,n=>hasClass(n,'editorial-hero-graphic'));
  const image = hero && findNode(hero,n=>(n.type==='img'||n.type===StudioImage));
  const description = heroContent && nodes(heroContent.props.children).find(n=>isValidElement(n)&&isTextElement(n,'p')&&!hasClass(n,'produce-kicker'));
  const actionGroup = heroContent && findNode(heroContent,n=>hasClass(n,'produce-actions'));
  const directAction = heroContent && nodes(heroContent.props.children).filter(n=>n.type===CTA||n.type===TextLink);
  const heroFoot = hero && findNode(hero,n=>hasClass(n,'produce-hero-foot'));
  const pack = hero && findNode(hero,n=>hasClass(n,'finance-pack'));
  const serviceSubmenu = ['develop','story-script','packaging-talent','budgeting-scheduling'].includes(page) ? all.find(n=>hasClass(n,'finance-subnav')) : null;
  const body = all.filter(n=>n!==hero&&n!==breadcrumb&&n!==outsideActions&&!hasClass(n,'make-top-strip')).flatMap(n=>hasClass(n,'page-directory')?nodes(n.props.children):[n]);
  if(pack) body.unshift(cloneElement(pack,{key:'finance-pack-chapter',id:'finance-ready-pack'}));
  const content = body.map((node,index)=>{
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
    <EditorialHero {...shared} graphic={graphic} page={page} onMotionChange={setMotionPaused} breadcrumb={breadcrumb} heading={heading} description={description||shared.description} eyebrow={tidy(text(kicker))||shared.eyebrow} image={image||shared.image} actions={actionGroup?.props.children || directAction?.length>0&&directAction || outsideActions?.props.children} foot={heroFoot?.props.children} caption={shared.caption}/>
    {serviceSubmenu && <SectionSubmenu section="develop" page={page}/>}
    <div className="ep-body ep-width ep-body-single"><div className="ep-chapters">{content}</div></div>
  </div>;
}
