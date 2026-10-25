import MotionHeading, { isTextElement } from './TextMotion';
import React, { Children, cloneElement, isValidElement, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from './useMotion';
import './editorial-page.css';
import SectionSubmenu from './SectionSubmenu';
import { PageHero, SectionHeading, PageCTA, CTA, TextLink } from './PageUI';

const directions = {
  'locations-logistics': ['THE LOCATION FILE', 'From the script', 'to solid ground.', 'location'],
  'line-production': ['THE PRODUCTION FILE', 'People. Time. Money.', 'One working plan.', 'production'],
  casting: ['THE CASTING FILE', 'From the character', 'to the cast.', 'casting'],
  'crew-equipment': ['THE TECHNICAL FILE', 'The people. The kit.', 'Ready for the shoot.', 'crew'],
  'set-production-design': ['THE DESIGN FILE', 'From the page', 'to a world on set.', 'design'],
  'shooting-on-location': ['THE SHOOT FILE', 'From the call sheet', 'to the final take.', 'camera'],
  'international-co-productions': ['THE INTERNATIONAL FILE', 'Many countries.', 'One production plan.', 'international'],
  'finance-structuring': ['THE STRUCTURING FILE', 'Budget. Sources. Timing.', 'One finance plan.', 'finance'],
  'co-production': ['THE PARTNERSHIP FILE', 'Shared strengths.', 'One agreed plan.', 'production'],
  'story-script': ['THE SCRIPT FILE', 'Creative and production.', 'On the same page.', 'production'],
  'packaging-talent': ['PROJECT PACKAGE', 'The right people.', 'An honest picture.', 'production'],
  'budgeting-scheduling': ['THE PRODUCTION PLAN', 'Cost and time.', 'Built from the script.', 'finance'],
  develop: ['DEVELOPMENT JOURNEY', 'From the first idea', 'to a project ready.', 'production'],
  finance: ['THE FINANCE FILE', 'The creative vision.', 'A plan to carry it.', 'finance'],
  'what-we-make': ['THE STORY FILE', 'Different formats.', 'The same craft.', 'frames'],
  about: ['THE STUDIO FILE', 'Creative ambition.', 'Production discipline.', 'production'],
  services: ['THE PRODUCTION FILE', 'From the first idea', 'to the final frame.', 'production'],
  projects: ['THE VISUAL ARCHIVE', 'Character. Place.', 'A moment in frame.', 'frames'],
  produce: ['THE PRODUCTION FILE', 'Story first.', 'Production ready.', 'camera'],
};
const clientContentPages = new Set(["develop", "story-script", "packaging-talent", "budgeting-scheduling", "finance", "finance-structuring", "co-production", "international-co-productions", "produce", "line-production", "casting", "crew-equipment", "locations-logistics", "set-production-design", "shooting-on-location", "what-we-make"]);
const defaultDirection = ['KEMSOR STUDIOS', 'Story. Craft.', 'Cinema.', 'frames'];
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
const sentence = value => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

export function ProductionDrawing({ kind = 'production' }) {
  return <svg className={`ep-drawing ep-drawing-${kind}`} viewBox="0 0 300 315" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    {kind === 'location' ? <>
      <g className="ep-contours" strokeWidth=".8">{Array.from({length:11}, (_,i) => <path key={i} transform={`translate(0 ${i*24})`} d="M-30 95C45-12 98 12 150 39S229 29 334-13"/>)}</g>
      <path className="ep-survey-route" d="M57 249C35 206 119 222 110 172S57 117 112 92S207 124 229 69" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="5 7"/>
      <circle cx="57" cy="249" r="7" fill="#fffaf0"/><circle cx="57" cy="249" r="2" fill="currentColor"/>
      <circle className="ep-pin-pulse" cx="229" cy="69" r="18"/><path d="M229 48C219 48 212 55 212 64C212 78 229 90 229 90S246 78 246 64C246 55 239 48 229 48Z" fill="currentColor"/><circle cx="229" cy="64" r="5" fill="#f4d17c" stroke="none"/>
      <path d="M237 270H273M255 252V288"/><circle cx="255" cy="270" r="22" strokeDasharray="1 6"/>
    </> : <>
      <g className="ep-drawing-grid" strokeWidth=".6">{[40,80,120,160,200,240,280].map(n=><React.Fragment key={n}><path d={`M20 ${n}H280`}/><path d={`M${n} 20V290`}/></React.Fragment>)}</g>
      {kind === 'international' ? <><ellipse cx="150" cy="154" rx="96" ry="96"/><ellipse cx="150" cy="154" rx="44" ry="96"/><path d="M54 154H246 M67 108H233 M67 200H233 M150 58V250" strokeWidth=".8"/><path className="ep-survey-route" d="M79 192Q102 67 220 115 M79 192Q211 268 220 115" strokeWidth="3" strokeDasharray="4 7"/><circle cx="79" cy="192" r="8" fill="#f4d17c"/><circle className="ep-pin-pulse" cx="220" cy="115" r="15"/><circle cx="220" cy="115" r="6" fill="currentColor"/></> : kind === 'finance' ? <><path d="M57 65H183L209 91V235H57Z M183 65V91H209 M74 108H160 M74 126H135 M74 195H189"/><path d="M83 182V157H102V182 M119 182V142H138V182 M155 182V116H174V182"/><path className="ep-survey-route" d="M35 250H230V114H250" strokeDasharray="4 7"/><circle cx="230" cy="250" r="7" fill="#f4d17c"/><path d="M232 54V36H250 M41 218H23V236"/></> :
      kind === 'casting' ? <><path d="M55 63H245V247H55Z M43 87V51H79 M221 51H257V87 M43 223V259H79 M221 259H257V223"/><circle cx="150" cy="125" r="30"/><path d="M91 223V205C91 169 209 169 209 205V223 M126 128H133 M167 128H174 M139 143Q150 151 161 143"/><path className="ep-survey-route" d="M75 80H225V230H75Z" strokeDasharray="3 7"/></> :
      kind === 'design' ? <><path d="M44 133L149 78L256 133V232L149 285L44 232Z M44 133L149 186L256 133 M149 186V285 M149 78V36 M23 123L5 114 M275 123L293 114"/><path d="M76 148V215L126 240V173 M177 172V239L226 215V148"/><path className="ep-survey-route" d="M149 78V186M44 232L149 179L256 232" strokeDasharray="4 7"/><circle cx="149" cy="186" r="6" fill="#f4d17c"/></> :
      kind === 'crew' ? <><path d="M73 102H180V180H73Z M180 125L222 104V177L180 157 M89 102V86H149V102 M128 180V212 M94 257L128 212L162 257 M128 212V264"/><circle cx="98" cy="142" r="12"/><path className="ep-survey-route" d="M38 63H249V223H204 M38 63V223H65" strokeDasharray="4 7"/><circle cx="38" cy="63" r="6" fill="#f4d17c"/><path d="M25 277H275"/></> :
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
  const [stopped, setStopped] = useState(false);
  const stop = paused || reduced || stopped;
  const [label, line, ending, kind] = directions[page] || defaultDirection;
  const sourceCopy = clientContentPages.has(page);
  const headingNode = heading || <MotionHeading as="h1" id={id}>{title}{accent && <span>{accent}</span>}</MotionHeading>;
  const responsiveBase = typeof image === 'string' ? image.match(/^(\/assets\/stills\/.+)-(?:640|960|1600)\.webp$/)?.[1] : null;
  const imageNode = typeof image === 'string' ? <img src={image} srcSet={responsiveBase ? [640,960,1600].map(width=>`${responsiveBase}-${width}.webp ${width}w`).join(', ') : undefined} alt={alt || ''} fetchPriority="high" decoding="async" width="1600" height="900"/> : image;
  function move(event) {
    if(stop || event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--ep-image-x',`${(event.clientX-rect.left-rect.width/2)*-.012}px`);
    event.currentTarget.style.setProperty('--ep-image-y',`${(event.clientY-rect.top-rect.height/2)*-.012}px`);
  }
  function reset(event) {event.currentTarget.style.setProperty('--ep-image-x','0px');event.currentTarget.style.setProperty('--ep-image-y','0px');}
  return <section className={`ep-hero${compact ? ' ep-hero-compact' : ''}`} data-ep-motion={stop?'paused':'playing'} aria-labelledby={headingNode.props.id || undefined}>
    <div className="ep-width"><div className="ep-docket">{breadcrumb || <p className="ep-eyebrow"><a href="/">KEMSOR STUDIOS</a><span aria-hidden="true">/</span>{eyebrow}</p>}{!compact && <button className="ep-motion-toggle" type="button" aria-pressed={stop} disabled={reduced || paused} onClick={()=>{setStopped(value=>!value);onMotionChange?.(!stopped);}}><span aria-hidden="true">{stop?'▷':'Ⅱ'}</span>{reduced?'Reduced motion':stop?'Play motion':'Pause motion'}</button>}</div>
      <div className="ep-hero-heading"><div>{headingNode}{caption && <p className="ep-hero-note">{caption}</p>}</div><div className="ep-hero-copy">{description && (isValidElement(description) ? description : <p>{description}</p>)}{actions && <div className="ep-actions">{actions}</div>}</div></div>
      {!compact && imageNode && <div className="ep-board"><figure className="ep-hero-photo"><div className="ep-image-window" onPointerMove={move} onPointerLeave={reset}>{cloneElement(imageNode,{alt:imageNode.props.alt || alt || 'Production visual supplied for Kemsor Studios',sizes:'(max-width: 600px) 90vw, (max-width: 900px) 65vw, 70vw'})}{['a','b','c','d'].map(c=><span key={c} className={`ep-corner ep-corner-${c}`} aria-hidden="true"/>)}<span className="ep-focus" aria-hidden="true"><i/></span><span className="ep-frame-tab">STORY. CRAFT. CINEMA.</span></div><figcaption><span>{eyebrow}</span><span>VISUAL STUDY / KEMSOR STUDIOS</span></figcaption></figure><aside className="ep-file-card" aria-label={graphic?.props['aria-label'] || `${label.toLowerCase()} illustration`}><div className="ep-file-heading"><span>{label}</span><span aria-hidden="true">↗</span></div>{graphic || <ProductionDrawing kind={kind}/>}{!sourceCopy && <div className="ep-file-caption"><span>{line}<br/><strong>{ending}</strong></span><span className="ep-file-mark" aria-hidden="true">K</span></div>}</aside></div>}
      {!compact && imageNode && <details className="ep-mobile-study"><summary><span>{label}</span><span aria-hidden="true">+</span></summary><div className="ep-mobile-study-content">{graphic || <ProductionDrawing kind={kind}/>}</div></details>}
      {foot && <div className="ep-hero-foot">{foot}</div>}
    </div>
  </section>;
}

function ServiceAccordion({ list }) {
  const [motionPaused,setMotionPaused] = useState(false);
  const [active,setActive] = useState(0);
  const items = nodes(list.props.children).filter(isValidElement);
  return <div className="ep-accordion">{items.map((item,index)=>{
    const dt = findNode(item,n=>n.type==='dt');
    const dd = findNode(item,n=>n.type==='dd');
    if(!dt || !dd) return item;
    const title = nodes(dt.props.children).filter(n=>!(isValidElement(n)&&n.type==='span'&&n.props['aria-hidden']));
    return <details key={item.key || index} open={active===index}><summary onClick={event=>{event.preventDefault();setActive(value=>value===index?-1:index);}}><span className="ep-item-number">{String(index+1).padStart(2,'0')}</span><h3>{title}</h3><span className="ep-plus" aria-hidden="true">+</span></summary><div className="ep-accordion-copy">{dd.props.children}</div></details>;
  })}</div>;
}
function prepareSection(node, process) {
  if (!isValidElement(node)) return node;
  if(hasClass(node,'line-production-deliverables')) return <ServiceAccordion key={node.key} list={node}/>;
  const content = nodes(node.props.children).map(child=>prepareSection(child,false));
  if(process) {
    const position = content.findIndex(child=>isValidElement(child)&&child.type==='ol');
    if(position>=0) content.splice(position,0,<ProcessRoute key="process-route"/>);
    else {const grid=content.findIndex(child=>hasClass(child,'page-principles')||hasClass(child,'process-grid'));if(grid>=0)content.splice(grid,0,<ProcessRoute key="process-route"/>);}
  }
  return cloneElement(node,{},...content);
}
function chapterLabel(node,index) {
  if(hasClass(node,'finance-pack'))return 'Finance-ready pack';
  const label = findNode(node,n=>n.type?.displayName==='EditorialLabel'||n.type===SectionHeading||hasClass(n,'page-eyebrow')||hasClass(n,'produce-label'));
  const content = label ? (label.props.label || label.props.children) : (node.props.eyebrow || node.props['aria-label'] || text(findNode(node,n=>isTextElement(n,'h2'))) || `Chapter ${index+1}`);
  return sentence(tidy(text(content)).replace(/^\d+\s*[/.·—-]\s*/,''));
}

// Adapts the existing, authored section elements without duplicating page copy.
// The original section IDs and all nested forms, links and CMS components survive.
export default function EditorialPage({page,children}) {
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
  const image = hero && findNode(hero,n=>n.type==='img');
  const description = heroContent && nodes(heroContent.props.children).find(n=>isValidElement(n)&&isTextElement(n,'p')&&!hasClass(n,'produce-kicker'));
  const actionGroup = heroContent && findNode(heroContent,n=>hasClass(n,'produce-actions'));
  const directAction = heroContent && nodes(heroContent.props.children).filter(n=>n.type===CTA||n.type===TextLink);
  const heroFoot = hero && findNode(hero,n=>hasClass(n,'produce-hero-foot'));
  const pack = hero && findNode(hero,n=>hasClass(n,'finance-pack'));
  const serviceSubmenu = ['develop','story-script','packaging-talent','budgeting-scheduling'].includes(page) ? all.find(n=>hasClass(n,'finance-subnav')) : null;
  const body = all.filter(n=>n!==hero&&n!==breadcrumb&&n!==outsideActions&&!hasClass(n,'make-top-strip')).flatMap(n=>hasClass(n,'page-directory')?nodes(n.props.children):[n]);
  if(pack) body.unshift(cloneElement(pack,{key:'finance-pack-chapter',id:'finance-ready-pack'}));
  const chapters = [];
  const content = body.map((node,index)=>{
    if(!isValidElement(node))return node;
    if(node===serviceSubmenu)return null;
    const section = node.type==='section'||node.type==='aside'||node.type===PageCTA;
    if(!section)return node;
    const label = chapterLabel(node,index);
    const id = node.props.id || `${page}-chapter-${index+1}`;
    const process = hasClass(node,'produce-process') || hasClass(node,'about-approach') || id==='production-process';
    chapters.push({id,label});
    const props = {id,className:`${node.props.className||''} ep-chapter${process?' ep-process':''}`, 'data-ep-chapter':true};
    const prepared = prepareSection(node,process);
    return typeof node.type==='string' ? cloneElement(prepared,{...props,key:node.key||id}) : <div {...props} key={id}>{prepared}</div>;
  });
  const host = useRef(null);
  const reduced = useReducedMotion();
  const [motionPaused,setMotionPaused] = useState(false);
  const [active,setActive] = useState(chapters[0]?.id);
  useEffect(()=>{
    const container = host.current;
    const elements = [...container.querySelectorAll('[data-ep-chapter]')];
    let frame;
    const update = ()=>{
      let current = elements[0];
      elements.forEach(element=>{if(element.getBoundingClientRect().top<innerHeight*.4)current=element;});
      if(current)setActive(current.id);
      frame=null;
    };
    const scroll = ()=>{if(!frame)frame=requestAnimationFrame(update);};
    const observer = new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('ep-in-view');observer.unobserve(entry.target);}}),{rootMargin:'0px 0px 20px 0px',threshold:0});
    elements.forEach(element=>observer.observe(element));update();
    addEventListener('scroll',scroll,{passive:true});addEventListener('resize',scroll);
    return()=>{observer.disconnect();removeEventListener('scroll',scroll);removeEventListener('resize',scroll);cancelAnimationFrame(frame);};
  },[page,content.length]);
  const shared = isSharedHero ? hero.props : {};
  return <div ref={host} className={`${root.props.className||''} ep-page editorial-page`} data-ep-motion={motionPaused?'paused':'playing'} data-ep-reduced={reduced?'true':'false'}>
    <EditorialHero {...shared} graphic={graphic} page={page} onMotionChange={setMotionPaused} breadcrumb={breadcrumb} heading={heading} description={description||shared.description} eyebrow={tidy(text(kicker))||shared.eyebrow} image={image||shared.image} actions={actionGroup?.props.children || directAction?.length>0&&directAction || outsideActions?.props.children} foot={heroFoot?.props.children} caption={shared.caption}/>
    {serviceSubmenu && <SectionSubmenu section="develop" page={page}/>}
    <div className={`ep-body ep-width${chapters.length?'':' ep-body-single'}`}>{chapters.length>0 && <aside className="ep-index"><div className="ep-mobile-chapters"><label htmlFor={`chapters-${page}`}>ON THIS PAGE</label><select id={`chapters-${page}`} value={active || chapters[0]?.id} onChange={event=>{const id=event.target.value;setActive(id);location.hash=id;}}>{chapters.map(({id,label},i)=><option value={id} key={id}>{String(i+1).padStart(2,'0')} · {label.split(' · ')[0]}</option>)}</select></div><p className="ep-eyebrow">IN THIS CHAPTER</p><nav aria-label="Page sections">{chapters.map(({id,label},i)=><a key={id} href={`#${id}`} aria-current={active===id?'location':undefined}><span>{String(i+1).padStart(2,'0')}</span>{label}<i aria-hidden="true">↗</i></a>)}</nav>{!clientContentPages.has(page) && <p className="ep-index-note">A story in the making.<br/>A plan to bring it to screen.<br/><strong>Kemsor Studios.</strong></p>}</aside>}<div className="ep-chapters">{content}</div></div>
  </div>;
}
