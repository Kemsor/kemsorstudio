import { sitePages } from './src/sitePages.js';

const xmlEscape = value => value.replace(/[<>&"']/g, character => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[character]));
export function sitemapAssets(siteUrl) {
 let base = '/';
 let assets;
 const respond = (req, res, next) => {
  const path = req.url?.split('?')[0];
  const asset = assets.find(asset => path === `${base}${asset.fileName}`);
  if (!asset) return next();
  res.setHeader('Content-Type', asset.fileName.endsWith('.xml') ? 'application/xml; charset=utf-8' : 'text/plain; charset=utf-8');
  res.end(asset.source);
 };
 return {
  name: 'kemsor-sitemaps',
  configResolved(config) {
   base = config.base;
   const origin = new URL(siteUrl || 'https://app.kemsorstudio.com');
   if (!['https:', 'http:'].includes(origin.protocol)) throw new Error('SITE_URL must be an HTTP or HTTPS URL');
   const url = path => new URL(`${base}${path.replace(/^\//, '')}`, origin.origin).href;
   assets = [
    {fileName:'sitemap.xml',source:`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitePages.filter(page => page.indexable).map(page => `  <url><loc>${xmlEscape(url(page.href))}</loc></url>`).join('\n')}\n</urlset>\n`},
    {fileName:'robots.txt',source:`User-agent: *\nAllow: /\n\nSitemap: ${url('/sitemap.xml')}\n`},
   ];
  },
  configureServer(server) { server.middlewares.use(respond); },
  generateBundle() { for (const asset of assets) this.emitFile({type:'asset',...asset}); },
 };
}
