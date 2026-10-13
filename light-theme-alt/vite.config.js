import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { cp, stat } from 'node:fs/promises';

// Keep source films and design originals locally, but ship only web assets.
function lightweightAssets() {
  let config;
  return {
    name: 'lightweight-assets',
    apply: 'build',
    configResolved(value) { config = value; },
    async closeBundle() {
      await cp(resolve(config.root, 'public/assets'), resolve(config.root, config.build.outDir, 'assets'), {
        recursive: true,
        filter: async source => {
          if ((await stat(source)).isDirectory()) return true;
          return /\.(webp|ttf|txt)$/.test(source) || /(studio-film-lite|[kemsor]-preview|supplied-film)\.mp4$/.test(source);
        },
      });
    },
  };
}

// Real page entries support direct links on ordinary static hosting.
export default defineConfig({
  appType: 'mpa',
  plugins: [lightweightAssets()],
  // Dev serves public files normally; production copies only the filtered set.
  build: { copyPublicDir: false, rollupOptions: { input: Object.fromEntries(['home', 'about', 'services', 'projects', 'news', 'careers', 'contact'].map(page => [page, resolve(process.cwd(), page === 'home' ? 'index.html' : `${page}/index.html`)])) } },
  server: { port: 3005, strictPort: true },
  preview: { port: 4175, strictPort: true },
});
