import pages from '../../shared/content-pages.json' with {type:'json'};
import footerDefaults from '../../shared/footer-navigation.json' with {type:'json'};
import {navigation as headerDefaults} from './navigation.js';
import {pageHref} from './pageInfo.js';
import {getStudioContacts} from './studioContact.js';

export const headerCta = {label:'Talk to studio',href:'/contact/'};
const extraPages = [
 {key:'find-talent',label:'Find Talent'},
 {key:'script-to-production',label:'FilmDesk'},
 {key:'legal',label:'Legal'},
 {key:'privacy-policy',label:'Privacy Policy'},
 {key:'sitemap',label:'Sitemap'},
];
const available = [...pages,...extraPages];
const optionalLink = ({key,label}) => ({id:key,page:key,label,href:pageHref(key),enabled:false});
const formats = new Set(['what-we-make','feature-films','short-films','series-ott','documentaries']);
const resources = new Set(['blog','press-media','legal','privacy-policy','sitemap']);
const headerPaths = new Set(headerDefaults.flatMap(item =>
 item.href?[item.href]:item.groups.flatMap(group=>group.links.map(link=>link.href)),
));
const otherHeaderPages = available.filter(page=>!headerPaths.has(pageHref(page.key)));
export const headerMenu = [
 ...headerDefaults,
 {id:'formats',label:'What we make',groups:[{links:otherHeaderPages.filter(page=>formats.has(page.key)).map(optionalLink)}]},
 {id:'resources',label:'More pages',groups:[
  {title:'Updates & information',links:otherHeaderPages.filter(page=>resources.has(page.key)).map(optionalLink)},
  {title:'Studio & services',links:otherHeaderPages.filter(page=>!formats.has(page.key)&&!resources.has(page.key)).map(optionalLink)},
 ]},
];

const footerPaths = new Set(footerDefaults.flatMap(group=>group.links.map(link=>link.href)));
const otherFooterPages = available.filter(page=>!footerPaths.has(pageHref(page.key)));
const footerGroup = page => resources.has(page.key)?'connected':
 ['find-talent','careers','script-to-production','partner-with-us'].includes(page.key)?'explore':'studio';
export const footerMenu = footerDefaults.map(group=>({
 ...group,
 links:[...group.links,...otherFooterPages.filter(page=>footerGroup(page)===group.id).map(optionalLink)],
}));

const socialProfiles = [
 ['facebook','Facebook','https://www.facebook.com/kemsorstudio'],
 ['instagram','Instagram','https://www.instagram.com/kemsorstudio/'],
 ['youtube','YouTube',''],
 ['linkedin','LinkedIn',''],
 ['whatsapp','WhatsApp',''],
];
export function footerSocialProfiles(settings={}){
 const {whatsappHref}=getStudioContacts(settings);
 return socialProfiles.map(([id,label,fallback])=>({
  id,label,href:id==='whatsapp'?whatsappHref:typeof settings[id]==='string'?settings[id]:fallback,
 }));
}

const pagePositions = items => items.map((item,index)=>({
 value:'after:'+index,label:'After '+(item.label||item.title),
}));
export const defaultMenuPlacement = side => side==='header'?'header':'footer.custom';

export function menuPlacements(side){
 if(side==='footer')return [
  ...footerMenu.map((group,index)=>({
   id:`footer.${index}.links`,label:group.title,positions:pagePositions(group.links),
  })),
  {id:'footer.custom',label:'More pages',positions:[]},
 ];
 return [
  {id:'header',label:'Top-level link',positions:pagePositions(headerMenu)},
  ...headerMenu.flatMap((item,index)=>(item.groups||[]).map((group,groupIndex)=>({
   id:`header.${index}.groups.${groupIndex}.links`,
   label:group.title?`${item.label} → ${group.title.replace(/^\d+\s+/,'')}`:item.label,
   positions:pagePositions(group.links),
  }))),
 ];
}
