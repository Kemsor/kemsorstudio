import pages from './content-pages.json' with {type:'json'};

export const editableInnerPages = [
  ...pages.filter(page => page.key !== 'home'),
  {key:'find-talent',label:'Find Talent'},
  {key:'sitemap',label:'Sitemap'},
  {key:'legal',label:'Legal Centre'},
  {key:'privacy-policy',label:'Privacy Policy'},
];

export const innerPageKey = page => page === 'news' ? 'press-media' : page;
export const maxPageFaqs = 30;

export const pagesWithAuthoredFaqs = [
  'budgeting-scheduling', 'casting', 'co-production', 'crew-equipment',
  'develop', 'distribution-release', 'documentaries', 'feature-films',
  'festival-awards', 'finance', 'finance-structuring', 'india-production-services',
  'international-co-productions', 'line-production', 'locations-logistics', 'packaging-talent',
  'post-production', 'produce', 'productions', 'release',
  'series-ott', 'set-production-design', 'shooting-on-location', 'short-films',
  'story-script', 'artist-digital-media-studio',
];
