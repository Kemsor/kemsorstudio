import { defineConfig } from 'vite';
import { resolve } from 'node:path';

const entries=['post','post-production','release','release/distribution-release-support','release/festival-awards-strategy','home','about','develop','develop/story-script','develop/packaging-talent','develop/budgeting-scheduling','finance','finance/co-production','finance/finance-structuring','finance/international-co-productions','what-we-make','produce','produce/line-production','produce/casting','produce/crew-equipment','produce/locations-logistics','produce/set-production-design','produce/shooting-on-location','services','projects','news','blog','careers','contact','legal','find-talent','join','login','profile','script-to-production'];
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
    code:code.replace(/(['"`])\/(?=(?:assets|about|develop|finance|what-we-make|produce|release|post|post-production|services|projects|news|blog|careers|contact|legal|find-talent|join|login|profile|script-to-production)\/|\$\{page\}\/|#home)/g,(_,quote)=>quote+base),
    map:null,
   };
  },
 };
};
export default defineConfig({
 plugins:[runtimeBase()],
 appType:'mpa',
 server:{port:3007,strictPort:true,proxy:{'/admin':{target:'http://127.0.0.1:8100'},'/dashboard.css':{target:'http://127.0.0.1:8100'},'/api':{target:'http://127.0.0.1:8100'},'/media':{target:'http://127.0.0.1:8100'}}},
 preview:{port:4177,strictPort:true},
 build:{target:'es2022',rollupOptions:{input:Object.fromEntries(entries.map(page=>[page,resolve(process.cwd(),page==='home'?'index.html':`${page}/index.html`)]))}},
});
