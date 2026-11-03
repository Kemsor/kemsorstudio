import {legalHref,legalSlug} from './LegalDocument';
import React, { useEffect } from 'react';
import { useCms } from './CmsContent';
import { pageSeo, seoMetaTags, schemaJson, defaultSiteUrl } from './seo';

// Keep visible-page and sharing metadata consistent when CMS overrides load.
export default function SeoMetadata({ page }) {
 const { entries,legalDocuments } = useCms();
 const slug=page==='privacy-policy'?'privacy-policy':page==='legal'?legalSlug(location.pathname):null;
 const documentInfo=legalDocuments?.find(item=>item.slug===slug);
 const sections = entries.filter(entry => entry.type === 'page' && (entry.metadata?.page==='news'?'press-media':entry.metadata?.page) === page);
 const title = documentInfo?.title ? `${documentInfo.title} | Kemsor Studios` : sections.find(entry => entry.metadata?.seo_title)?.metadata.seo_title;
 const description = documentInfo?.description || sections.find(entry => entry.metadata?.seo_description)?.metadata.seo_description;
 useEffect(() => {
  const seo = pageSeo(page,{origin:import.meta.env.VITE_SITE_URL||defaultSiteUrl,base:import.meta.env.BASE_URL,title,description,...(documentInfo?{href:legalHref(documentInfo.slug),label:documentInfo.title}:{})});
  document.title = seo.title;
  for(const attrs of seoMetaTags(seo)) {
   const attribute = attrs.property ? 'property' : 'name';
   let element = document.head.querySelector(`meta[${attribute}="${attrs[attribute]}"]`);
   if(!element) { element=document.createElement('meta');element.setAttribute(attribute,attrs[attribute]);document.head.append(element); }
   element.setAttribute('content',attrs.content);
  }
  let canonical = document.head.querySelector('link[rel="canonical"]');
  if(!canonical) { canonical=document.createElement('link');canonical.rel='canonical';document.head.append(canonical); }
  canonical.href=seo.canonical;
  let structured = document.getElementById('site-structured-data');
  if(seo.schema) {
   if(!structured) { structured=document.createElement('script');structured.id='site-structured-data';structured.type='application/ld+json';document.head.append(structured); }
   structured.textContent=schemaJson(seo.schema);
  } else structured?.remove();
 },[page,title,description,slug]);
 return null;
}
