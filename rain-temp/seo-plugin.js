import { readFileSync } from 'node:fs';
import { optimizedImage } from './src/image-delivery.js';
import { pageSeo, seoMetaTags, schemaJson } from './src/seo.js';

const escapeHtml = value => value.replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const heroSlides = JSON.parse(readFileSync(new URL('../shared/hero-slides.json', import.meta.url)));
const optimizedImages = JSON.parse(readFileSync(new URL('./src/optimized-images.json', import.meta.url)));

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
    const poster = page === 'home' ? optimizedImage(heroSlides.slice(-2)[0]?.poster, optimizedImages, base) : null;
    const preload = poster ? `<link rel="preload" as="image" type="image/webp" imagesrcset="${escapeHtml(poster.srcSet)}" imagesizes="100vw" fetchpriority="high" />` : '';
    const cleaned = html.replace('<!-- home-hero-preload -->', preload).replace('assets/fonts/manrope.ttf" as="font" type="font/ttf"', 'assets/fonts/manrope.woff2" as="font" type="font/woff2"').replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi,'').replace(/<meta\b(?=[^>]*\bname=["'](?:description|robots)["'])[^>]*>/gi,'');
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
