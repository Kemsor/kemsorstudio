// Plain-text values preserve the original React markup and supplied defaults.
let modules={};
export function setSiteModules(value){modules=value&&typeof value==='object'?value:{};}
export function getSiteModule(key,fallback){return Object.hasOwn(modules,key)?modules[key]:fallback;}
export function cmsText(group,key,fallback){const value=modules[`copy:${group}`]?.[key];return typeof value==='string'?value:fallback;}
// Existing source data stays lazy, so a CMS refresh updates array-driven sections too.
export function cmsData(factory){const first=factory();return new Proxy(Array.isArray(first)?[]:{},{get(_target,key){return Reflect.get(factory(),key)},has(_target,key){return Reflect.has(factory(),key)},ownKeys(){return Reflect.ownKeys(factory())},getOwnPropertyDescriptor(_target,key){const descriptor=Object.getOwnPropertyDescriptor(factory(),key);return descriptor&&{...descriptor,configurable:key==='length'?false:true}}});}
export function cmsDocument(group,value,prefix=''){
 if(value===null||typeof value!=='object'){const overrides=modules[group];return overrides&&Object.hasOwn(overrides,prefix)?overrides[prefix]:value;}
 return new Proxy(value,{get(target,key){if(typeof key==='symbol')return Reflect.get(target,key);const path=prefix?`${prefix}.${key}`:String(key);const current=target[key];return typeof current==='function'?current:cmsDocument(group,current,path);}});
}
export function applyNavigation(items,prefix='header'){
 const overrides=getSiteModule('navigation',{});
 return items.map((item,index)=>{const key=`${prefix}.${index}`,value={...item};for(const name of ['label','title','href'])if(Object.hasOwn(overrides,`${key}.${name}`))value[name]=overrides[`${key}.${name}`];for(const name of ['groups','links'])if(item[name])value[name]=applyNavigation(item[name],`${key}.${name}`);return {...value,_visible:overrides[`${key}.enabled`]!==false,_position:overrides[`${key}.position`]??index+1};}).filter(item=>item._visible).sort((a,b)=>a._position-b._position);
}
