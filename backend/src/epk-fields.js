import {productionRows,productionText} from './production-extensions.js';
export const epkMode=metadata=>metadata.epk_mode||'public';
export function epkFields(body,previous){
 const mode=Object.hasOwn(body,'epk_mode')?body.epk_mode:epkMode(previous);if(!['public','link_only','disabled'].includes(mode))throw Object.assign(new Error('Choose valid EPK access.'),{status:422});
 const structured=Object.hasOwn(body,'epk_structured')?body.epk_structured==='yes':Boolean(previous.epk_structured);
 const people=productionRows(body,'epk_people',previous,30,item=>{const id=Number(item.person_id);if(!Number.isSafeInteger(id)||id<=0)throw Object.assign(new Error('Choose an EPK biography.'),{status:422});return {person_id:id};});
 if(new Set(people.map(item=>item.person_id)).size!==people.length)throw Object.assign(new Error('Choose each EPK biography once.'),{status:422});
 return {epk_mode:mode,epk_structured:structured,epk_intro:Object.hasOwn(body,'epk_intro')?productionText(body.epk_intro,3000,'EPK introduction'):previous.epk_intro||'',epk_people:people,epk_statements:productionRows(body,'epk_statements',previous,12,item=>({title:productionText(item.title,200,'Statement title',true),author:productionText(item.author,160,'Statement author'),body:productionText(item.body,12000,'Statement',true)}))};
}
export function publicEpkFields(metadata){if(epkMode(metadata)==='public')return metadata;const {epk_url,epk_structured,epk_intro,epk_people,epk_statements,...safe}=metadata;return safe;}
