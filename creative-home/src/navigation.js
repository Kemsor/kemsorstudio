const pageHref = page => `/${page}/`;
const link = (label, page, anchor) => ({ label, href: `${pageHref(page)}${anchor ? `#${anchor}` : ''}` });
export const navigation = [
  { id: 'studio', label: 'Studio', page: 'about', groups: [{ links: [link('About Kemsor','about'),link('Leadership','about','leadership'),link('How We Work','services','production-process'),link('Careers','careers')] }] },
  { id: 'capabilities', label: 'Capabilities', page: 'services', groups: [
    { title:'01 Develop', links:[link('Story & Script Development','services','development'),link('Packaging & Talent Attachment','services','development'),link('Budgeting & Scheduling','services','capability-planning')] },
    { title:'02 Finance', links:[link('Finance Structuring','services','capability-financing'),link('Co-Production','services','capability-financing'),link('International Co-Productions','projects','international-co-productions')] },
    { title:'03 Produce', links:[link('Line Production & Production Management','services','capability-filming'),link('Pre-Production: Casting & Talent Coordination','services','capability-casting'),link('Pre-Production: Locations & Logistics','services','capability-planning'),link('Pre-Production: Crew & Equipment','services','capability-filming'),link('Pre-Production: Set & Production Design','services','capability-design'),link('Shooting & On-Location Production','services','capability-filming')] },
    { title:'04 Post', links:[link('Post-Production Supervision','services','capability-post')] },
    { title:'05 Release', links:[link('Distribution & Release Support','services','capability-post'),link('Festival & Awards Strategy','services','festival-strategy')] },
    { title:'What We Make', links:[link('Feature Films','projects','feature-films'),link('Series & OTT','projects','series-ott'),link('Documentaries','projects','documentaries'),link('Short Films','projects','short-films')] },
  ] },
  { id:'india', label:'India Production Services', page:'services', href:`${pageHref('services')}#india-production-services` },
  { id:'productions', label:'Productions', page:'projects', groups:[{links:[link('All Productions','projects','project-showcase')]}] },
  { id:'partners', label:'Partner With Us', page:'contact', groups:[{links:[link('For Filmmakers & Creators','contact','filmmakers'),link('For Studios & Platforms','contact','studios'),link('For Co-Producers & Financiers','contact','co-producers'),link('For International Productions','contact','international-productions')]}] },
  { id:'newsroom', label:'Newsroom', page:'news', groups:[{links:[link('News','news'),link('Press & Media','news','press-media')]}] },
  { id:'project', label:'Start a Project', page:'contact', href:`${pageHref('contact')}#project-brief`, cta:true },
];
