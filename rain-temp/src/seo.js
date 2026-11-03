import { pageInfo, pageHref } from './pageInfo.js';

export const defaultSiteUrl = 'https://app.kemsorstudio.com';
export const noIndexPages = new Set(['login', 'join', 'profile']);
export function siteOrigin(value = defaultSiteUrl) {
 const url = new URL(value);
 if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Site URL must use HTTP or HTTPS');
 return url.origin;
}
export function pageSeo(page, { origin = defaultSiteUrl, base = '/', title, description, href, label } = {}) {
 const info = pageInfo[page];
 if (!info) throw new Error(`Unknown SEO page: ${page}`);
 const absolute = path => new URL(base !== '/' && path.startsWith(base) ? path : `${base}${path.replace(/^\//, '')}`, siteOrigin(origin)).href;
 const url = absolute(href||pageHref(page));
 const home = absolute('/');
 const organization = `${home}#organization`;
 const website = `${home}#website`;
 const name = title || info.title;
 const summary = description || info.description;
 const image = absolute('/assets/hero-films/kemsor-story-1600.webp');
 const indexable = !noIndexPages.has(page);
 const graph = [
  {'@type':'Organization','@id':organization,name:'Kemsor Studios',legalName:'KEMSOR STUDIOS PRIVATE LIMITED',url:home,logo:{'@type':'ImageObject',url:absolute('/assets/kemsor-logo.webp')}},
  {'@type':'WebSite','@id':website,url:home,name:'Kemsor Studios',publisher:{'@id':organization},inLanguage:'en'},
  {'@type':page==='contact'?'ContactPage':page==='about'?'AboutPage':'WebPage','@id':`${url}#webpage`,url,name,description:summary,isPartOf:{'@id':website},about:{'@id':organization},inLanguage:'en',...(page!=='home'?{breadcrumb:{'@id':`${url}#breadcrumb`}}:{})},
 ];
 if(page!=='home') graph.push({'@type':'BreadcrumbList','@id':`${url}#breadcrumb`,itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:home},{'@type':'ListItem',position:2,name:label||info.label,item:url}]});
 return {title:name,description:summary,canonical:url,image,imageAlt:'Cinematic production visual for Kemsor Studios',robots:indexable?'index, follow':'noindex, follow',schema:indexable?{'@context':'https://schema.org','@graph':graph}:null};
}
export function seoMetaTags(seo) {
 return [
  {name:'description',content:seo.description},
  {name:'robots',content:seo.robots},
  {property:'og:type',content:'website'},
  {property:'og:site_name',content:'Kemsor Studios'},
  {property:'og:locale',content:'en_IN'},
  {property:'og:title',content:seo.title},
  {property:'og:description',content:seo.description},
  {property:'og:url',content:seo.canonical},
  {property:'og:image',content:seo.image},
  {property:'og:image:alt',content:seo.imageAlt},
  {name:'twitter:card',content:'summary_large_image'},
  {name:'twitter:title',content:seo.title},
  {name:'twitter:description',content:seo.description},
  {name:'twitter:image',content:seo.image},
  {name:'twitter:image:alt',content:seo.imageAlt},
 ];
}
export const schemaJson = schema => JSON.stringify(schema).replace(/</g,'\\u003c');
