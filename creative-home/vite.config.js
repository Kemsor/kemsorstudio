import { defineConfig } from 'vite';
import { resolve } from 'node:path';

const entries=['home','about','services','projects','news','careers','contact'];
export default defineConfig({
 appType:'mpa',
 server:{port:3006,strictPort:true},
 preview:{port:4176,strictPort:true},
 build:{target:'es2022',rollupOptions:{input:Object.fromEntries(entries.map(page=>[page,resolve(process.cwd(),page==='home'?'index.html':`${page}/index.html`)]))}},
});
