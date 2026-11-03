import { pageInfo, pageHref } from './pageInfo.js';
import { noIndexPages } from './seo.js';

// The HTML directory and search-engine sitemap share the canonical page metadata.
export const sitePages = [...new Map(Object.entries(pageInfo).filter(([key]) => key !== 'news').map(([key, info]) => [pageHref(key), {
 key, label: info.label, href: pageHref(key), indexable: !noIndexPages.has(key),
}])).values()];
const groups = [
 ['Studio', ['home','about','leadership','how-we-work','partner-with-us','india-production-services','careers','contact']],
 ['Productions & formats', ['productions','what-we-make','feature-films','series-ott','documentaries','short-films']],
 ['Capabilities · Develop', ['services','develop','story-script','packaging-talent','budgeting-scheduling']],
 ['Capabilities · Finance', ['finance','finance-structuring','co-production','international-co-productions']],
 ['Capabilities · Produce', ['produce','line-production','casting','locations-logistics','crew-equipment','set-production-design','shooting-on-location']],
 ['Capabilities · Post & Release', ['post','post-production','release','distribution-release','festival-awards']],
 ['Talent & workspace', ['find-talent','script-to-production','join','login','profile']],
 ['News & information', ['press-media','blog','legal','privacy-policy','sitemap']],
];
export const sitemapGroups = groups.map(([title, keys]) => ({title, pages: keys.map(key => sitePages.find(page => page.href === pageHref(key))).filter(Boolean)}));
