export const introduction = 'Kemsor works with filmmakers, studios and production partners on films, series and documentaries. We help develop the project, plan the production and coordinate the people who bring it to screen.';
export const studioCopy = 'Some projects need support from the first draft. Others need a team on the ground, help through post-production or a plan for release. We shape our role around the stage and scope of your project.';
export const serviceCopy = 'Financing, locations, casting, crew, production and post. Practical support for the decisions and details that make a shoot work.';
export const closingCopy = 'Start with what you have: a script, a brief or a production already in progress. Outline the project, its stage and the support you need.';
export const formats = [
  { title: 'Web Series & OTT Content', description: 'Episodic stories developed and produced for digital audiences.', image: 'e', category: 'EPISODIC / DIGITAL' },
  { title: 'Short Films & Documentaries', description: 'Focused storytelling with a clear creative vision.', image: 'r', category: 'SHORT FORM / REAL STORIES' },
  { title: 'International Co-Productions', description: 'Coordination across creative teams, locations and production partners.', image: 'm', category: 'COLLABORATION / WORLDWIDE' },
  { title: 'Regional Cinema', description: 'Production shaped around language, culture and audience.', image: 'o', category: 'LANGUAGE / CULTURE' },
];
export const capabilities = [
  ['Film Financing & Investment', 'Structure funding conversations and investment coordination.'],
  ['Line Production', 'On-ground production leadership and coordination.'],
  ['Production Management', 'Keep schedules, budgets, people and decisions aligned.'],
  ['Location & Logistics Management', 'Plan and manage locations, travel and production logistics.'],
  ['Casting & Talent Coordination', 'Manage casting, talent and artist coordination.'],
  ['Crew & Equipment Management', 'Assemble and coordinate crew, equipment and vendors.'],
  ['Set Design & Production Design', 'Shape the visual world of the production.'],
  ['Shooting & On-Location Production', 'Support smooth, efficient shoots on location.'],
  ['Post-Production Supervision', 'Oversee the path from footage to finished cut.'],
  ['Distribution & Release Support', 'Prepare the strategy and materials needed for release.'],
];
export const stages = [
  ['Development & Packaging', 'Shape the concept, materials, creative team and production approach.'],
  ['Financing & Co-Production', 'Structure the project for funding conversations and production partnerships.'],
  ['Pre-Production', 'Prepare schedules, budgets, locations, casting, crew and logistics.'],
  ['Production & Line Production', 'Coordinate the people, resources and decisions that keep the shoot moving.'],
  ['Post-Production', 'Supervise the path from captured material to finished film or series.'],
  ['Distribution & Release', 'Support the strategy and materials needed to bring the work to audiences.'],
];
export const clips = [
  {letter:'K',name:'Action',key:'k'}, {letter:'E',name:'Adventure',key:'e'},
  {letter:'M',name:'Scale',key:'m'}, {letter:'S',name:'Emotion',key:'s'},
  {letter:'O',name:'Imagination',key:'o'}, {letter:'R',name:'Story',key:'r'},
];

// Six visual chapters cover every service capability in the supplied document.
export const serviceChapters = [
  { id: 'financing', label: 'FINANCING & DEVELOPMENT', heading: 'Financing & development', title: ['Financing &', 'development.'], image: 'financing', alt: 'Film producers studying a screenplay and storyboards in a warmly lit production office.', services: [0], position: '64% center' },
  { id: 'planning', label: 'PRODUCTION PLANNING', heading: 'Locations & production planning', title: ['Locations &', 'planning.'], image: 'planning', alt: 'A location manager and assistant director planning a shoot in a historic courtyard.', services: [2, 3], position: '62% center' },
  { id: 'casting', label: 'CASTING & TALENT', heading: 'Casting & talent', title: ['Casting &', 'talent.'], image: 'casting', alt: 'An actress rehearsing a scene during a cinematic casting session.', services: [4], position: '65% center' },
  { id: 'filming', label: 'CAMERA, CREW & PRODUCTION', heading: 'Crew, camera & production', title: ['Crew, camera &', 'production.'], image: 'filming', alt: 'A cinematographer operating a professional cinema camera on an atmospheric film set.', services: [1, 5, 7], position: '62% center' },
  { id: 'design', label: 'SET & PRODUCTION DESIGN', heading: 'Art & production design', title: ['Art &', 'production design.'], image: 'design', alt: 'Production designers creating a detailed period film set inside a soundstage.', services: [6], position: '65% center' },
  { id: 'post', label: 'POST-PRODUCTION & RELEASE', heading: 'Post-production & release', title: ['Post-production &', 'release.'], image: 'post', alt: 'A colorist refining a film in a professional grading and screening suite.', services: [8, 9], position: '62% center' },
];
