export const pageInfo = {
 'find-talent':{label:'Find Talent',title:'Find Talent — Kemsor Studios',description:'Discover reviewed artist and crew portfolios.'},
 'join':{label:'Join KEMSOR',title:'Join KEMSOR — Kemsor Studios',description:'Register as an artist or casting director and producer.'},
 'login':{label:'Login',title:'Login — Kemsor Studios',description:'Sign in to your private KEMSOR workspace.'},
 'profile':{label:'My Profile',title:'My Profile — Kemsor Studios',description:'Manage your profile and creative opportunities.'},
 'script-to-production':{label:'Script to Production',title:'Script to Production — Kemsor Studios',description:'Plan scripts, budgets, timelines and production requirements.'},

  home: { label: 'Home', title: 'Kemsor Studios — Let’s make a scene.', description: 'Production support for films, series and documentaries, from the first idea to the finished frame.' },
  about: { label: 'Studio', title: 'The studio — Kemsor Studios', description: 'Creative ambition, grounded in production. Kemsor connects ideas, collaborators and execution from development to audiences.' },
  'what-we-make': { label: 'What We Make', title: 'What We Make - Feature Films, Series, Documentaries & Short Films | Kemsor Studios', description: 'Kemsor produces feature films, series and OTT content, documentaries and short films - from development and financing to production, post and release.' },
  casting: { label: 'Casting & Talent', title: 'Casting & Talent Coordination | Kemsor Studios', description: 'From casting call to call time, Kemsor finds and coordinates the talent your story needs, drawing on the Kemsor Talent Network.' },
  'line-production': { label: 'Line Production', title: 'Line Production & Production Management | Kemsor Studios', description: 'Kemsor runs the practical engine of your production: budgets, schedules, people and problems, managed so the director can direct.' },
  produce: { label: 'Produce', title: 'Produce — Production Services | Kemsor Studios', description: 'From casting and locations to crew, design and the shoot itself, Kemsor runs the practical side of production so the creative work has room to happen.' },
  services: { label: 'Services', title: 'Production services — Kemsor Studios', description: 'Production support from development and financing to locations, casting, crew, post-production and release.' },
  projects: { label: 'Productions', title: 'Productions & story formats — Kemsor Studios', description: 'Explore film, series, documentary and short film formats, and the supplied visual collection.' },
  news: { label: 'Newsroom', title: 'Newsroom & studio notes — Kemsor Studios', description: 'Latest Kemsor studio news and media partners.' },
  blog: { label: 'Blog', title: 'Blog — Kemsor Studios', description: 'Explore Kemsor production notes on development, planning, post-production and bringing stories to screen.' },
  careers: { label: 'Careers', title: 'Careers — Kemsor Studios', description: 'The creative, production and post-production disciplines behind the frame. Find the current opportunities at Kemsor.' },
  contact: { label: 'Contact', title: 'Start a project — Kemsor Studios', description: 'Contact Kemsor Studios with a general enquiry and find studio contact details and location.' },
  legal: { label: 'Legal', title: 'Legal centre — Kemsor Studios', description: 'Official studio notices, privacy information and website terms published by Kemsor Studios.' },
};
export const pageHref = page => page === 'home' ? '/' : page === 'casting' ? '/produce/casting/' : page === 'line-production' ? '/produce/line-production/' : `/${page}/`;
