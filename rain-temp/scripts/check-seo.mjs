import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pageInfo, pageHref } from '../src/pageInfo.js';
import { sitePages } from '../src/sitePages.js';
import { pageSeo, schemaJson } from '../src/seo.js';

const directory = resolve(process.argv[2] || 'dist');
const origin = process.argv[3] || 'https://app.kemsorstudio.com';
const base = process.argv[4] || '/';
const decode = value => value.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>');
const tags = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map(([tag]) => Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([,key,value])=>[key,decode(value)])));
for(const {key,href,indexable} of sitePages) {
 const html = readFileSync(resolve(directory,`.${href}index.html`),'utf8');
 const expected = pageSeo(key,{origin,base});
 const meta = tags(html,'meta');
 const get = key => meta.filter(tag=>tag.name===key || tag.property===key);
 const titles = [...html.matchAll(/<title>([\s\S]*?)<\/title>/gi)];
 assert.equal(titles.length,1,`${href}: title count`);
 assert.equal(decode(titles[0][1]),pageInfo[key].title);
 const canonical = tags(html,'link').filter(tag=>tag.rel==='canonical');
 assert.equal(canonical.length,1,`${href}: canonical count`);
 assert.equal(canonical[0].href,expected.canonical);
 for(const [name,value] of Object.entries({description:expected.description,'og:title':expected.title,'og:description':expected.description,'og:url':expected.canonical,'og:image':expected.image,'twitter:card':'summary_large_image','twitter:title':expected.title,'twitter:description':expected.description,'twitter:image':expected.image,robots:expected.robots})) {
  assert.equal(get(name).length,1,`${href}: ${name} count`);
  assert.equal(get(name)[0].content,value,`${href}: ${name}`);
 }
 const schemas = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
 assert.equal(schemas.length,indexable?1:0,`${href}: schema count`);
 if(indexable) {
  const schema=JSON.parse(schemas[0][1]);
  const page=schema['@graph'].find(item=>item['@id']===`${expected.canonical}#webpage`);
  assert.equal(page.url,expected.canonical);
  assert.equal(page.name,expected.title);
  assert.equal(schema['@graph'].filter(item=>item['@type']==='BreadcrumbList').length,key==='home'?0:1);
 }
 assert.ok(existsSync(resolve(directory,'assets/hero-films/kemsor-story-1600.webp')));
}
const xml=readFileSync(resolve(directory,'sitemap.xml'),'utf8');
const locations=[...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(([,url])=>decode(url));
assert.deepEqual(new Set(locations),new Set(sitePages.filter(page=>page.indexable).map(page=>pageSeo(page.key,{origin,base}).canonical)));
assert.ok(readFileSync(resolve(directory,'robots.txt'),'utf8').includes(new URL(`${base}sitemap.xml`,origin).href));
for(const [route,destination] of [['projects','productions'],['news','press-media']]) {
 const html=readFileSync(resolve(directory,route,'index.html'),'utf8');
 assert.equal(tags(html,'meta').find(tag=>tag.name==='robots')?.content.includes('noindex'),true);
 assert.ok(html.includes(`../${destination}/`));
}
assert.ok(!schemaJson({'name':'</script><script>alert(1)</script>'}).includes('</script>'));
const cms=pageSeo('contact',{origin,base,title:'Approved CMS title',description:'Approved CMS description'});
assert.equal(cms.schema['@graph'][2].name,'Approved CMS title');
assert.equal(cms.canonical,new URL(`${base}contact/`,origin).href);
console.log(`SEO checks passed: ${sitePages.length} pages, ${locations.length} sitemap URLs, metadata, structured data and redirects (${origin}${base}).`);
