import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// Real page entries support direct links on ordinary static hosting.
export default defineConfig({
  appType: 'mpa',
  server: { port: 3003, strictPort: true },
  preview: { port: 4173, strictPort: true },
  build: { rollupOptions: { input: Object.fromEntries(['home', 'about', 'services', 'projects', 'news', 'careers', 'contact'].map(page => [page, resolve(process.cwd(), page === 'home' ? 'index.html' : `${page}/index.html`)])) } },
});
