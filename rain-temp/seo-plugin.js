import { pageSeo, seoMetaTags, schemaJson } from './src/seo.js';

const escapeHtml = value => value.replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
export function frontendSeo(origin) {
 let base = '/';
 return {
  name:'kemsor-frontend-seo',
  configResolved(config) { base = config.base; },
  transformIndexHtml: {
   order:'post',
   handler(html) {
    const page = html.match(/<body\b[^>]*\bdata-page=["']([^"']+)["']/i)?.[1];
    // Legacy redirect documents have their own canonical destination.
    if (!page) return html;
    const seo = pageSeo(page,{origin,base});
    const cleaned = html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi,'').replace(/<meta\b(?=[^>]*\bname=["'](?:description|robots)["'])[^>]*>/gi,'');
    return {html:cleaned,tags:[
     {tag:'title',children:escapeHtml(seo.title),injectTo:'head'},
     {tag:'link',attrs:{rel:'canonical',href:seo.canonical},injectTo:'head'},
     ...seoMetaTags(seo).map(attrs=>({tag:'meta',attrs,injectTo:'head'})),
     ...(seo.schema?[{tag:'script',attrs:{type:'application/ld+json',id:'site-structured-data'},children:schemaJson(seo.schema),injectTo:'head'}]:[]),
    ]};
   },
  },
 };
}
