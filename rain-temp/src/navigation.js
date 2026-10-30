const pageHref = page => `/${page}/`;
const link = (label, page, anchor) => ({ label, href: `${pageHref(page)}${anchor ? `#${anchor}` : ''}` });
export const navigation = [
 {id:'talent',label:'Talent Network',page:'find-talent',groups:[{links:[link('Find Talent','find-talent'),link('My Profile','profile')]}]},
  { id: 'studio', label: 'Studio', page: 'about', groups: [{ links: [link('About Kemsor','about'),link('Leadership','about','leadership'),link('How We Work','how-we-work'),link('Partner With Us','partner-with-us'),link('Careers','careers')] }] },
  { id: 'capabilities', label: 'Capabilities', page: 'services', groups: [
    { title:'01 Develop', links:[link('Develop: Overview','develop'),link('Story & Script Development','develop/story-script'),link('Packaging & Talent Attachment','develop/packaging-talent'),link('Budgeting & Scheduling','develop/budgeting-scheduling')] },
    { title:'02 Finance', links:[link('Finance: Overview','finance'),link('Finance Structuring','finance/finance-structuring'),link('Co-Production','finance/co-production'),link('International Co-Productions','finance/international-co-productions')] },
    { title:'03 Produce', links:[link('Produce: Overview','produce'),link('Line Production & Production Management','produce/line-production'),link('Pre-Production: Casting & Talent Coordination','produce/casting'),link('Pre-Production: Locations & Logistics','produce/locations-logistics'),link('Pre-Production: Crew & Equipment','produce/crew-equipment'),link('Pre-Production: Set & Production Design','produce/set-production-design'),link('Shooting & On-Location Production','produce/shooting-on-location')] },
    { title:'04 Post', links:[link('Overview','post'),link('Post-Production Supervision','post-production')] },
    { title:'05 Release', links:[link('Overview','release'),link('Distribution & Release Support','release/distribution-release-support'),link('Festival & Awards Strategy','release/festival-awards-strategy')] },
    { title:'What We Make', links:[link('What We Make: Overview','what-we-make'),link('Feature Films','what-we-make/feature-films'),link('Series & OTT','what-we-make/series-ott'),link('Documentaries','what-we-make/documentaries'),link('Short Films','what-we-make/short-films')] },
  ] },
  { id:'india', label:'India Production Services', page:'india-production-services', href:pageHref('india-production-services') },
  { id:'productions', label:'Productions', page:'projects', groups:[{links:[link('All Productions','projects','project-showcase')]}] },
];
