import {createServer} from 'vite';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {writeFile,access,readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import sharp from 'sharp';
const entries=[['/','HomePage'],['/about/','pages/StudioPages'],['/india-production-services/','pages/IndiaProductionServicesPage'],['/how-we-work/','pages/HowWeWorkPage'],['/partner-with-us/','pages/PartnerWithUsPage'],['/develop/','pages/DevelopPage'],['/develop/story-script/','pages/StoryScriptPage'],['/develop/packaging-talent/','pages/PackagingTalentPage'],['/develop/budgeting-scheduling/','pages/BudgetingSchedulingPage'],['/finance/','pages/FinancePage'],['/finance/finance-structuring/','pages/FinanceStructuringPage'],['/finance/co-production/','pages/CoProductionPage'],['/finance/international-co-productions/','pages/InternationalCoProductionsPage'],['/produce/','pages/ProducePage'],['/produce/line-production/','pages/LineProductionPage'],['/produce/casting/','pages/CastingPage'],['/produce/locations-logistics/','pages/LocationsLogisticsPage'],['/produce/crew-equipment/','pages/CrewEquipmentPage'],['/produce/set-production-design/','pages/SetProductionDesignPage'],['/produce/shooting-on-location/','pages/ShootingProductionPage'],['/what-we-make/','pages/WhatWeMakePage'],['/what-we-make/feature-films/','pages/FeatureFilmsPage'],['/what-we-make/series-ott/','pages/SeriesOttPage'],['/what-we-make/documentaries/','pages/DocumentariesPage'],['/what-we-make/short-films/','pages/ShortFilmsPage'],['/post/','pages/PostOverviewPage'],['/post-production/','pages/PostProductionPage'],['/release/','pages/ReleaseOverviewPage'],['/release/distribution-release-support/','pages/DistributionReleasePage'],['/release/festival-awards-strategy/','pages/FestivalAwardsPage'],['/services/','pages/ServicesPage','ServicesPage'],['/projects/','pages/ProjectsPage','ProjectsPage'],['/careers/','pages/CareersPage','CareersPage'],['/contact/','pages/ContactPage','ContactPage'],['/blog/','pages/BlogPage'],['/news/','pages/NewsPage','NewsPage'],['/press-media/','pages/PressMediaPage']];
const overrides=JSON.parse(await readFile(new URL('../src/media-placement-overrides.json',import.meta.url),'utf8'));
const emptySlots=new Map();
const server=await createServer({server:{middlewareMode:true},appType:'custom'});
const seen=new Set(),placements={},inventory=[],renderedImages=new Set();let videos=0,renderedPlaceholders=0;
const fresh=[['purple-camera-crew','Camera crew working on a purple-lit studio set'],['city-story','A cinematic portrait amid a moving crowd'],['location-camera-operator','Camera operator filming on location'],['sunset-film-crew','Film crew shooting on a road at sunset'],['colour-clapperboard','Colourful clapperboard in red and blue studio lighting'],['production-slate','Production slate on an interior set'],['supplied-film-still','Camera operators working together on a studio set']];
let replacementIndex=0;
const fingerprints=[],fingerprintCache=new Map();
async function artworkIdentity(source){
 if(fingerprintCache.has(source))return fingerprintCache.get(source);
 const pixels=await sharp(new URL('../public'+source,import.meta.url).pathname).resize(32,32,{fit:'cover'}).removeAlpha().raw().toBuffer();
 let identity=source;
 for(const candidate of fingerprints){let difference=0;for(let i=0;i<pixels.length;i++)difference+=Math.abs(pixels[i]-candidate.pixels[i]);if(difference/pixels.length<4){identity=candidate.identity;break;}}
 if(identity===source)fingerprints.push({identity,pixels});fingerprintCache.set(source,identity);return identity;
}
try{
 for(const [page,moduleName,exportName] of entries){
 globalThis.location=new URL(page,'http://127.0.0.1:3007');
 const module=await server.ssrLoadModule(`/src/${moduleName}.jsx`);
 const html=renderToStaticMarkup(React.createElement(exportName?module[exportName]:module.default));
 if(process.argv.includes('--verify')){
  renderedPlaceholders+=(html.match(/class="studio-image-needed/g)||[]).length;
  for(const tag of html.matchAll(/<img\b[^>]*>/g)){const source=tag[0].match(/\ssrc="([^"]+)"/)?.[1];if(!source||!/^\/assets\/(stills|services|designer-services|designer-productions|hero-films|motion-films|supplied)\//.test(source))continue;const identity=await artworkIdentity(source);assert(!renderedImages.has(identity),`Repeated image: ${source} on ${page}`);renderedImages.add(identity);await access(new URL('../public'+source,import.meta.url));}
  for(const clip of html.matchAll(/src="(\/assets\/supplied\/[^"]+\.mp4)"/g)){await access(new URL('../public'+clip[1],import.meta.url));videos++;}
 }
 for(const match of html.matchAll(/<(?:img|span)\b[^>]*data-media-slot="([^"]+)"[^>]*data-media-original="([^"]+)"[^>]*>/g)){
 const [,slot,src]=match;if(match[0].startsWith('<span')){const key=`${page}|${slot}|${src}`;emptySlots.set(key,(emptySlots.get(key)||0)+1);}
 if(!/^\/assets\/(stills|services|designer-services|designer-productions|hero-films|motion-films)\//.test(src))continue;
 const identity=src.split('?')[0].replace(/-(640|960|1600)(?=\.)/,'').replace(/\.(webp|avif|png|jpe?g)$/i,'');
 const key=`${page}|${slot}|${identity}`;
 if(key in placements)continue;
 const artwork=await artworkIdentity(src);
 if(!seen.has(artwork)){seen.add(artwork);if(identity.endsWith('/work-period-camera')){const replacement={src:'/assets/supplied/interior-camera-crew.webp',alt:'Camera crew filming a warmly lit interior'};placements[key]=replacement;inventory.push({page,slot,src,status:'replaced',replacement:replacement.src});}else inventory.push({page,slot,src,status:'retained'});continue;}
 // Add each newly supplied photograph once, then leave an explicit content slot.
 let replacement=null;
 if(page!=='/' && replacementIndex<fresh.length){const [name,alt]=fresh[replacementIndex++];replacement={src:`/assets/supplied/${name}.webp`,alt};}
 placements[key]=replacement;inventory.push({page,slot,src,status:replacement?'replaced':'provide image',replacement:replacement?.src});
 }
 }
 if(process.argv.includes('--list-empty'))for(const [key,count] of emptySlots)console.log(`${count} ${key}`);
 if(process.argv.includes('--verify')){assert.equal(videos,2);console.log(`Verified ${renderedImages.size} unique images, ${renderedPlaceholders} placeholders and ${videos} supplied videos`);}
 Object.assign(placements,overrides);
 for(const item of inventory){const identity=item.src.split('?')[0].replace(/-(640|960|1600)(?=\.)/,'').replace(/\.(webp|avif|png|jpe?g)$/i,'');const override=overrides[`${item.page}|${item.slot}|${identity}`];if(override){item.status='replaced';item.replacement=override.src;}}
 if(process.argv.includes('--write'))await writeFile(new URL('../src/media-placements.json',import.meta.url),JSON.stringify(placements,null,2)+'\n');
 await writeFile(new URL('../../output/media-placement-audit.json',import.meta.url),JSON.stringify(inventory,null,2)+'\n');
 console.log(JSON.stringify({pages:entries.length,originalImagesRetained:seen.size,newImagesUsed:replacementIndex+1+Object.values(overrides).filter(Boolean).length,placeholders:inventory.filter(item=>item.status==='provide image').length}));
}finally{await server.close();}
