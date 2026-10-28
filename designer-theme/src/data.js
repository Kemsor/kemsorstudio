export const SITE = import.meta.env.VITE_MAIN_SITE_URL || (import.meta.env.DEV ? 'http://127.0.0.1:3007' : 'https://app.kemsorstudio.com');
export const page = path => `${SITE}${path}`;
export const services = [
 {title:'Development & Packaging',text:'Shaping the idea, the script and the creative package that makes a project ready to pitch.',points:['Script development','Creative package','Pitch-ready project'],href:'/develop/',image:'studio-interview.webp',background:'services-background.webp'},
 {title:'Financing & Co-Production',text:'Bringing financiers and production partners together around a clear budget, plan and shared creative goals.',points:['Investment coordination','Budget & production plan','Co-production partners'],href:'/finance/',image:'finance.webp',background:'services-background.webp'},
 {title:'Pre-Production, Casting & Talent',text:'The people, places and practical decisions that give the shoot a clear starting point.',points:['Casting & talent coordination','Crew & locations','Set & production design'],href:'/produce/casting/',image:'casting.webp',background:'services-background.webp'},
 {title:'Production & Line Production',text:'Running the shoot day to day, on set and on location, with the right team behind every frame.',points:['Production management','Location & logistics','Crew & equipment'],href:'/produce/line-production/',image:'crew.webp',background:'services-background.webp'},
 {title:'Post-Production & Release',text:'Overseeing edit, sound, colour and VFX through to final deliverables and the release conversation.',points:['Post supervision','Final deliverables','Platform & distributor coordination'],href:'/post/',image:'post.webp',background:'services-background.webp'},
 {title:'India Production Services',text:'On-the-ground support for international and domestic productions filming across India.',points:['Line production','Locations & logistics','Crew, equipment & casting'],href:'/india-production-services/',image:'valley.webp',background:'services-background.webp'},
];
export const productions = [
 {title:'On the road',category:'Short Films',label:'01 ON LOCATION',image:'location.webp'},
 {title:'Behind the production',category:'Co-Productions',label:'02 CO-FINANCE',image:'finance.webp'},
 {title:'Performance in motion',category:'Web Series & OTT',label:'03 IN THE FRAME',image:'dance.webp'},
 {title:'The finishing frame',category:'Post-Production',label:'04 POST MASTER',image:'post.webp'},
 {title:'Stories across borders',category:'International',label:'05 GLOBAL SLATE',image:'valley.webp'},
];
