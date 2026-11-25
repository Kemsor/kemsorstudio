import React, {Children, cloneElement, isValidElement} from 'react';
import StudioImage from './StudioImage';
import {defaultHeroImages} from './default-hero-images';
import {currentPageContentKey,getSiteModule} from './siteContent';
import {isTextElement} from './TextMotion';
import {removeTrailingTitlePeriods} from './hero-title';
import './managed-hero.css';

function copyText(node) {
  if (typeof node==='string'||typeof node==='number') return String(node);
  if (Array.isArray(node)) return node.map(copyText).join(' ');
  if (!isValidElement(node)||node.props['aria-hidden']) return '';
  return node.type==='br'?' ':copyText(node.props.children);
}

function mainHeading(node) {
  if (!isValidElement(node)) return node;
  const parts=Children.toArray(node.props.children);
  const accent=parts.findIndex((part,index)=>
    isValidElement(part)&&part.type!=='br'&&
    typeof parts[index-1]==='string'&&/[.!?]$/.test(parts[index-1].trim()));
  return accent>0?parts.slice(0,accent):node;
}

function authoredBanner(source) {
  let heading,description,image;
  function visit(node) {
    if (!isValidElement(node)) return;
    if (!heading&&isTextElement(node,'h1')) heading=node;
    else if (heading&&!description&&isTextElement(node,'p')) description=node;
    if (!image&&(node.type==='img'||node.type===StudioImage)) image=node;
    if (typeof node.type==='string'||node.type===React.Fragment) Children.forEach(node.props.children,visit);
  }
  visit(source);
  return {heading,description,image};
}

function resolveAsset(url) {
  const base=import.meta.env.BASE_URL;
  return base!=='/'&&url.startsWith('/')&&!url.startsWith(base)?base+url.slice(1):url;
}

export default function ManagedHero({children, heading, title, description, image, id, usePageSettings=true}) {
  const source=children?Children.only(children):null;
  const authored=source?authoredBanner(source):{};
  const pageKey=usePageSettings?currentPageContentKey():null;
  const settings=pageKey?getSiteModule(`hero:${pageKey}`,{}):{};
  const titleText=removeTrailingTitlePeriods(copyText(settings.title||title||mainHeading(heading||authored.heading))).replace(/\s+/g,' ');
  const descriptionText=copyText(settings.description||description||authored.description).replace(/\s+/g,' ').trim();
  const headingId=id||heading?.props.id||authored.heading?.props.id;
  const backdrop=image||authored.image||defaultHeroImages[pageKey];
  const media=settings.image
    ?<img src={resolveAsset(settings.image)} alt={settings.imageAlt||''} fetchPriority="high"/>
    :typeof backdrop==='string'
      ?<StudioImage src={backdrop} alt="" fetchPriority="high" sizes="100vw"/>
      :isValidElement(backdrop)?cloneElement(backdrop,{sizes:'100vw',fetchPriority:'high'}):null;

  return <section className="inner-page-banner" aria-labelledby={headingId}>
    {media&&<div className="inner-page-banner-media">{media}</div>}
    <div className="inner-page-banner-copy">
      <h1 id={headingId}>{titleText}</h1>
      {descriptionText&&<p>{descriptionText}</p>}
    </div>
  </section>;
}
