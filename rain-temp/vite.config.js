import {readdirSync,readFileSync} from 'node:fs';
import { defineConfig, loadEnv } from 'vite';
import { frontendSeo } from './seo-plugin.js';
import { siteOrigin, defaultSiteUrl } from './src/seo.js';
import { resolve } from 'node:path';
import { sitemapAssets } from './sitemap-plugin.js';

const entries=['leadership','sitemap','privacy-policy','partner-with-us','what-we-make/documentaries','what-we-make/series-ott','what-we-make/short-films','what-we-make/feature-films','india-production-services','how-we-work','press-media','post','post-production','release','release/distribution-release-support','release/festival-awards-strategy','home','about','develop','develop/story-script','develop/packaging-talent','develop/budgeting-scheduling','finance','finance/co-production','finance/finance-structuring','finance/international-co-productions','what-we-make','produce','produce/line-production','produce/casting','produce/crew-equipment','produce/locations-logistics','produce/set-production-design','produce/shooting-on-location','services','productions','projects','news','blog','careers','contact','legal','find-talent','join','login','profile','script-to-production'];
// Prefix runtime JSX/JS paths when hosting this static site in a subdirectory.
// Vite already applies its base to HTML, CSS and generated chunk imports.
const runtimeBase = () => {
 let base='/';
 return {
  name:'kemsor-runtime-base',
  apply:'build',
  configResolved(config){base=config.base;},
  transform(code,id){
   if(base==='/'||!/[\\/]src[\\/].*\.[jt]sx?$/.test(id))return null;
   return {
    code:code.replace(/(['"`])\/(?=(?:assets|leadership|partner-with-us|about|how-we-work|india-production-services|develop|finance|what-we-make|produce|release|post|post-production|services|productions|projects|press-media|news|blog|careers|contact|privacy-policy|sitemap|legal|find-talent|join|login|profile|script-to-production)\/|\$\{page\}\/|#home)/g,(_,quote)=>quote+base),
    map:null,
   };
  },
 };
};
const legalPages=()=>({name:'kemsor-legal-pages',configureServer(server){server.middlewares.use((req,res,next)=>{if(/^\/legal\/[a-z0-9-]+\/?(?:\?.*)?$/.test(req.url||''))req.url='/legal/index.html';next();});}});
const notFoundPage=()=>({name:'kemsor-not-found',configureServer(server){
 server.middlewares.use((req,res,next)=>{
  const pathname=(req.url||'/').split('?')[0];
  const route=pathname.replace(/^\/|\/$/g,'').replace(/\/index\.html$/,'');
  if(!['GET','HEAD'].includes(req.method)||!req.headers.accept?.includes('text/html')||/^\/(?:api|admin|media|health|assets|legal)(?:\/|$)/.test(pathname)||(pathname.includes('.')&&!pathname.endsWith('.html'))||pathname==='/404.html'||pathname==='/index.html'||!route||entries.includes(route))return next();
  res.statusCode=404;res.setHeader('Content-Type','text/html; charset=utf-8');res.setHeader('X-Robots-Tag','noindex, follow');
  res.end(req.method==='HEAD'?'':readFileSync(resolve(import.meta.dirname,'public/404.html')));
 });
}});
export default defineConfig(({mode}) => {
 const env=loadEnv(mode,process.cwd(),'');
 const origin=siteOrigin(process.env.SITE_URL||env.SITE_URL||env.VITE_SITE_URL||defaultSiteUrl);
 return {
 define:{'import.meta.env.VITE_SITE_URL':JSON.stringify(origin)},
 plugins:[notFoundPage(),legalPages(),runtimeBase(),sitemapAssets(origin),frontendSeo(origin)],
 appType:'mpa',
 server:{port:3007,strictPort:true,proxy:Object.fromEntries([...new Set(['/health','/admin','/api','/media',...readdirSync(resolve(import.meta.dirname,'../backend/public')).filter(file=>!file.startsWith('.')).map(file=>'/'+file)])].map(prefix=>[prefix,{target:'http://127.0.0.1:8100'}]))},
 preview:{port:4177,strictPort:true},
 build:{target:'es2022',rollupOptions:{input:Object.fromEntries(entries.map(page=>[page,resolve(process.cwd(),page==='home'?'index.html':`${page}/index.html`)]))}},
};
});
