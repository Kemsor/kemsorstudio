import {defaultMenuPlacement} from './menu-catalogue.js';
import {innerPageKey} from '../../shared/inner-page-content.js';

// Plain-text values preserve the original React markup and supplied defaults.
let modules={};
export function setSiteModules(value){modules=value&&typeof value==='object'?value:{};}
export function getSiteModule(key,fallback){return Object.hasOwn(modules,key)?modules[key]:fallback;}
// Stage labels remain unnumbered even when older CMS copy includes a prefix.
export function withoutStageNumber(value){
 if(typeof value!=='string')return value;
 return value.replace(/^\d{2}\s*[·/]\s*/, '')
  .replace(/^00:\d{2}\s*·\s*(?:REEL\s+\d+\s*·\s*)?/i,'')
  .replace(/^00:\d{2}\s+(?=[A-Za-z])/,'')
  .replace(/^(\s*(?:(?:Next:|Go to)\s+)?)0\d\s+(?=(?:Develop|Finance|Produce|Post|Release)\b)/i,'$1');
}
export function cmsText(group,key,fallback){const value=modules[`copy:${group}`]?.[key];const result=typeof value==='string'?value:fallback;return (group.endsWith('Page')||group==='StudioPages'||group==='SectionSubmenu')&&withoutStageNumber(fallback)!==fallback?withoutStageNumber(result):result;}
// Existing source data stays lazy, so a CMS refresh updates array-driven sections too.
export function cmsData(factory){const first=factory();return new Proxy(Array.isArray(first)?[]:{},{get(_target,key){return Reflect.get(factory(),key)},has(_target,key){return Reflect.has(factory(),key)},ownKeys(){return Reflect.ownKeys(factory())},getOwnPropertyDescriptor(_target,key){const descriptor=Object.getOwnPropertyDescriptor(factory(),key);return descriptor&&{...descriptor,configurable:key==='length'?false:true}}});}
export function cmsDocument(group,value,prefix=''){
 if(value===null||typeof value!=='object'){const overrides=modules[group];return overrides&&Object.hasOwn(overrides,prefix)?overrides[prefix]:value;}
 return new Proxy(value,{get(target,key){if(typeof key==='symbol')return Reflect.get(target,key);const path=prefix?`${prefix}.${key}`:String(key);const current=target[key];return typeof current==='function'?current:cmsDocument(group,current,path);}});
}
function insertCustomLinks(entries,prefix,overrides){
 const side=prefix.split('.')[0];
 const custom=overrides[`${side}.customLinks`];
 if(!Array.isArray(custom))return entries;
 const links=custom.flatMap((link,index)=>(link.placement||defaultMenuPlacement(side))===prefix
  ?[{id:`custom-${index}`,label:link.label,href:link.href,position:link.position}]:[]);
 const legacy=links.filter(link=>typeof link.position==='number')
  .map(link=>({...link,_position:link.position}));
 const sorted=[...entries,...legacy].sort((a,b)=>a._position-b._position);
 const first=links.filter(link=>link.position==='first');
 const anchored=links.filter(link=>typeof link.position==='string'&&link.position.startsWith('after:'));
 const last=links.filter(link=>link.position==='last');
 const unmatched=anchored.filter(link=>!sorted.some(entry=>link.position==='after:'+entry._menuIndex));
 return [...first,...sorted.flatMap(entry=>[entry,...anchored.filter(link=>link.position==='after:'+entry._menuIndex)]),...unmatched,...last];
}

export function applyNavigation(items,prefix='header',overrides=getSiteModule('navigation',{})){
 const entries=items.flatMap((item,index)=>{
  const key=`${prefix}.${index}`;
  if((overrides[`${key}.enabled`]??item.enabled)===false)return [];
  const value={...item,_menuIndex:index,_position:overrides[`${key}.position`]??index+1};
  for(const name of ['label','title','href']){
   if(Object.hasOwn(overrides,`${key}.${name}`))value[name]=overrides[`${key}.${name}`];
  }
  for(const name of ['groups','links']){
   if(item[name])value[name]=applyNavigation(item[name],`${key}.${name}`,overrides);
  }
  return [value];
 }).filter(item=>(!item.groups||item.groups.length)&&(!item.links||item.links.length));
 const arranged=insertCustomLinks(entries.sort((a,b)=>a._position-b._position),prefix,overrides);
 if(prefix==='footer'){
  const more=insertCustomLinks([],'footer.custom',overrides);
  if(more.length)arranged.push({id:'custom',title:'More pages',links:more});
 }
 return arranged;
}

export function currentPageContentKey() {
  const page = document.body.dataset.page;
  const query = new URLSearchParams(location.search);
  if ((page === 'blog' && query.has('post')) ||
      (page === 'find-talent' && query.has('id')) ||
      (page === 'legal' && /\/legal\/[^/]+\/?$/.test(location.pathname))) return null;
  return innerPageKey(page);
}
