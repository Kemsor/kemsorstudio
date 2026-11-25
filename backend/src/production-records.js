import {epkFields,publicEpkFields} from './epk-fields.js';
import {productionExtensions,linkedCredits} from './production-extensions.js';
export const productionStages=['upcoming','in_development','in_pre_production','in_production','in_post_production','coming_soon','released'];
const fail=message=>{throw Object.assign(new Error(message),{status:422});};
function text(value,max,label){
 if(value===undefined||value===null)return '';
 if(typeof value!=='string')fail(`${label} must be text.`);
 const result=value.trim();if(result.length>max)fail(`${label} must be ${max} characters or fewer.`);
 return result;
}
function list(value,label){
 const items=[...new Set(text(value,1000,label).split(',').map(item=>item.trim()).filter(Boolean))];
 if(items.length>12||items.some(item=>item.length>80))fail(`${label}: use up to 12 comma-separated values, each up to 80 characters.`);
 return items;
}
// Each line is a credited name, optionally followed by | character / job title.
function credits(body,key,previous){
 if(!Object.hasOwn(body,key))return previous[key]||[];
 const lines=text(body[key],35000,key==='cast_credits'?'Cast credits':'Crew credits').split(/\r?\n/).map(line=>line.trim()).filter(Boolean);
 if(lines.length>100)fail('Use at most 100 credits in each section.');
 return lines.map((line,index)=>{
  const parts=line.split('|');
  if(parts.length>2)fail(`Credit ${index+1}: use Name | Role, with one separator only.`);
  const name=text(parts[0],160,`Credit ${index+1} name`);
  const role=text(parts[1],160,`Credit ${index+1} role`);
  if(!name)fail(`Credit ${index+1} needs a name.`);
  if(key==='crew_credits'&&!role)fail(`Crew credit ${index+1} needs a job title.`);
  const linked=(previous[key]||[]).find(credit=>credit.name===name&&credit.role===role&&credit.person_id);
  return {name,role,...(linked?{person_id:linked.person_id}:{})};
 });
}
function gallery(body,previous){
 if(!Object.hasOwn(body,'gallery'))return previous.gallery||[];
 const raw=text(body.gallery,40000,'Gallery');
 let items;try{items=JSON.parse(raw||'[]');}catch{fail('Gallery must be a valid image list.');}
 if(!Array.isArray(items)||items.length>24)fail('Choose up to 24 gallery images.');
 const ids=new Set();
 return items.map(item=>{
  if(!item||typeof item!=='object'||Array.isArray(item))fail('Choose a valid gallery image.');
  const id=Number(item.media_id);
  if(!Number.isSafeInteger(id)||id<=0||ids.has(id))fail('Choose distinct valid gallery images.');
  ids.add(id);
  if(!['still','behind_the_scenes'].includes(item.kind))fail('Choose a gallery image type.');
  const alt=text(item.alt,300,'Gallery alt text');
  return {media_id:id,kind:item.kind,alt,caption:text(item.caption,500,'Gallery caption')};
 });
}
export function productionMetadata(body,previous={}){
 if(!productionStages.includes(body.production_stage))fail('Choose a production stage.');
 const epkUrl=Object.hasOwn(body,'epk_url')?text(body.epk_url,100,'Press kit PDF'):previous.epk_url||'';
 if(epkUrl&&!/^\/media\/[1-9]\d*\/document\.pdf$/.test(epkUrl))fail('Upload a press kit PDF using the document uploader.');
 const year=text(body.year,4,'Year');if(year&&!/^[1-9]\d{3}$/.test(year))fail('Use a four-digit production year.');
 const workingTitle=Object.hasOwn(body,'working_title')?text(body.working_title,200,'Working title'):previous.working_title||'';
 const genres=Object.hasOwn(body,'genres')?list(body.genres,'Genres'):previous.genres||[];
 const language=text(body.language,200,'Languages');
 const languages=list(language,'Languages');
 const releaseDate=Object.hasOwn(body,'release_date')?text(body.release_date,10,'Release date'):previous.release_date||'';
 if(releaseDate){
  if(!/^[1-9]\d{3}-\d{2}-\d{2}$/.test(releaseDate))fail('Use a valid release date (YYYY-MM-DD).');
  const date=new Date(`${releaseDate}T00:00:00Z`);
  if(Number.isNaN(date.getTime())||date.toISOString().slice(0,10)!==releaseDate)fail('Choose a real calendar release date.');
 }
 return {...epkFields(body,previous),...productionExtensions(body,previous),epk_url:epkUrl,gallery:gallery(body,previous),cast_credits:linkedCredits(body,'cast_credits',previous)||credits(body,'cast_credits',previous),crew_credits:linkedCredits(body,'crew_credits',previous,true)||credits(body,'crew_credits',previous),contributor_credits:linkedCredits(body,'contributor_credits',previous,true)||previous.contributor_credits||[],production_stage:body.production_stage,format:text(body.format,100,'Format'),year,language:languages.join(', '),languages,genres,working_title:workingTitle,release_date:releaseDate};
}
// A working title is an internal planning field, never part of the public feed.
export function publicProductionMetadata(metadata){
 const {working_title,rights_notes,...publicFields}=metadata;
 return publicEpkFields(publicFields);
}
