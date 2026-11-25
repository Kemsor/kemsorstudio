import workInFrame from '../../shared/home-work-in-frame.json' with {type:'json'};
import {editableInnerPages,maxPageFaqs} from '../../shared/inner-page-content.js';
import faqDefaults from '../../shared/inner-faq-defaults.json' with {type:'json'};
import {applyNavigation} from '../../rain-temp/src/siteContent.js';
import {headerMenu,footerMenu,headerCta,footerSocialProfiles,menuPlacements,defaultMenuPlacement} from '../../rain-temp/src/menu-catalogue.js';
import contentPages from '../../shared/content-pages.json' with {type:'json'};
import {pageHref} from '../../rain-temp/src/pageInfo.js';
import leadership from '../../shared/leadership-content.json' with {type:'json'};
import {Router} from 'express';
import {rows,json,audit,settings} from './db.js';
import {canEdit} from './security.js';
import budgetingEditor from '../public/budgeting-editor-sections.json' with {type:'json'};
import copy from '../../shared/site-copy-catalogue.json' with {type:'json'};
import images from '../../shared/site-image-slots.json' with {type:'json'};
import videos from '../../shared/site-video-defaults.json' with {type:'json'};
import careers from '../../shared/careers-content.json' with {type:'json'};
const fail=(condition,message,status=422)=>{if(!condition)throw Object.assign(new Error(message),{status});};
const modules=new Map();
for(const [key,group]of Object.entries(copy))modules.set(`copy:${key}`,{label:group.label,area:'Existing page copy',fields:group.fields});
const budgetingModule=modules.get('copy:BudgetingSchedulingPage');
budgetingModule.label='Budgeting & Scheduling';
budgetingModule.href=pageHref('budgeting-scheduling');
budgetingModule.fields=[
 ...Object.entries(budgetingEditor.sections).map(([id,section])=>({
  key:`sections.${id}.enabled`,label:'Show this section',section,type:'boolean',default:true,
 })),
 ...budgetingModule.fields,
];
const moduleSections=new Map();
for(const [key,module] of modules){
 const metadata=module===budgetingModule?budgetingEditor:null;
 const groups=new Map();
 for(const field of module.fields){
  const colon=field.label.indexOf(':');
  const prefix=colon>0?field.label.slice(0,colon):'';
  const label=field.section||metadata?.fields[field.key]||
   (prefix?prefix.replaceAll('_',' ').replace(/^./,character=>character.toUpperCase()):'Page content');
  const faqLayout=metadata&&label==='FAQs';
  const layoutLabel=faqLayout&&metadata.faqLayoutLabels[field.key];
  if(faqLayout&&!field.section&&!layoutLabel)continue;
  if(!groups.has(label))groups.set(label,[]);
  groups.get(label).push({...field,label:layoutLabel||metadata?.labels[field.key]||(prefix?field.label.slice(colon+1).trim():field.label)});
 }
 const labels=[...(metadata?.order||[]).filter(label=>groups.has(label)),
  ...[...groups.keys()].filter(label=>!metadata?.order.includes(label))];
 if(labels.length>1)moduleSections.set(key,new Map(labels.map(label=>[
  metadata?label.toLowerCase().replaceAll(' ','-'):label,
  {label:metadata&&label==='FAQs'?'FAQ layout':label,fields:groups.get(label)},
 ])));
}
const sectionValues=(values,keys,include)=>Object.fromEntries(
 Object.entries(values||{}).filter(([key])=>keys.has(key)===include),
);
const editUrl=(key,section)=>'/admin/site-content/edit?'+new URLSearchParams(section?{key,section}:{key});
const budgetingFaqKey='faq:budgeting-scheduling';
const budgetingFaqUrl=editUrl('copy:BudgetingSchedulingPage','faqs');
for(const [key,item]of Object.entries(images)){
 const moduleKey=`images:${encodeURIComponent(item.page)}`;
 if(!modules.has(moduleKey))modules.set(moduleKey,{label:item.page==='/'?'Homepage images':item.page,area:'Image placements',fields:[]});
 modules.get(moduleKey).fields.push({key:`${item.id}.src`,label:`${item.slot} · ${item.original.split('/').at(-1)}`,type:'image',default:item.value?.src||''},{key:`${item.id}.alt`,label:`${item.slot} · Image description`,type:'text',default:item.value?.alt||''});
}
const videoFields=[];
for(const [key,slot]of Object.entries(videos))for(const [field,type,value]of [['enabled','boolean',true],['position','number',Object.keys(videos).indexOf(key)+1],['label','text',slot.label],['src','video',slot.src],['poster','image',slot.poster],['captions','captions',''],['language','language','en']]){if(field==='position'&&!key.startsWith('showreel-'))continue;videoFields.push({key:`${key}.${field}`,label:`${key} · ${field}`,type,default:value});}
for(const [key,slot]of Object.entries(videos))if(key.startsWith('showreel-'))videoFields.push({key:`${key}.description`,label:`${key} · Text under the reel title`,type:'text',default:slot.description||''});
modules.set('branding',{label:'Website logo',area:'Branding',adminOnly:true,fields:[{key:'logo',label:'Logo image (leave blank for supplied logo)',type:'image',default:''},{key:'alt',label:'Logo description',type:'text',default:'Kemsor Studios'}]});
videoFields.push(
 {key:'showreel.title',label:'Showreel heading: Title',type:'text',default:''},
 {key:'showreel.eyebrow',label:'Showreel heading: Eyebrow',type:'text',default:''},
);
modules.set('videos',{label:'Page videos',area:'Video sections',fields:videoFields});
const showreelField = key => /^showreel[.-]/.test(key);
const showreelFields = videoFields.filter(field=>showreelField(field.key));
const pageVideoFields = videoFields.filter(field=>!showreelField(field.key));
const showreelValues = (values,include) => Object.fromEntries(Object.entries(values||{}).filter(([key])=>showreelField(key)===include));
const workInFrameFields = [
 {key:'enabled',label:'Section: Show this section',type:'boolean',default:true},
 ...[['eyebrow','Eyebrow'],['title','Title'],['accent','Accent line'],['description','Description'],['buttonLabel','Button label'],['buttonHref','Button destination'],['referenceLabel','Reference caption']].map(([key,label])=>({
  key,label:`Section: ${label}`,type:key==='buttonHref'?'link':'text',default:workInFrame[key],
 })),
 ...workInFrame.slides.flatMap((slide,index)=>{
  const imageId=slide.image.replace(/\.[^.]+$/,'');
  const placement=images[`/|${slide.poster?'DesignerProductions-poster':'DesignerProductions-1'}|${imageId}`]?.value;
  return [
   ['enabled','Show this slide','boolean',true],['position','Display order','number',index+1],
   ['title','Title','text',slide.title],['category','Category','text',slide.category],
   ['image','Image or poster','image',placement?.src||slide.image],['alt','Image description','text',placement?.alt||slide.alt||''],
   ['href','Link destination','link',slide.href],['note','Note above the slide','text',slide.note||''],
  ].map(([key,label,type,value])=>({key:`slides.${slide.id}.${key}`,label:`Slide ${index+1} · ${slide.title}: ${label}`,type,default:value}));
 }),
];
modules.set('home-work-in-frame',{label:'The work. In frame.',area:'Homepage',adminOnly:true,href:'/#productions',fields:workInFrameFields});

const navFields=[];
function navFieldsFor(items,prefix){items.forEach((node,index)=>{const key=`${prefix}.${index}`;for(const field of ['label','title','href'])if(node[field])navFields.push({key:`${key}.${field}`,label:`${node.label||node.title||'Navigation group'} · ${field}`,type:field==='href'?'link':'text',default:node[field]});navFields.push({key:`${key}.enabled`,label:`${node.label||node.title||'Navigation group'} · visible`,type:'boolean',default:node.enabled!==false},{key:`${key}.position`,label:`${node.label||node.title||'Navigation group'} · order`,type:'number',default:index+1});if(node.groups)navFieldsFor(node.groups,key+'.groups');if(node.links)navFieldsFor(node.links,key+'.links');});}
navFieldsFor(headerMenu,'header');navFieldsFor(footerMenu,'footer');
navFields.push(
 {key:'header.cta.label',label:'Button text',type:'text',default:headerCta.label},
 {key:'header.cta.href',label:'Button destination',type:'link',default:headerCta.href},
 ...['header','footer'].map(side=>({key:`${side}.customLinks`,type:'customLinks',default:[]})),
 ...footerSocialProfiles().map(profile=>({key:`footer.social.${profile.id}.enabled`,label:profile.label,type:'boolean',default:true})),
);
modules.set('navigation',{label:'Header & footer navigation',area:'Navigation',adminOnly:true,fields:navFields});
moduleSections.set('navigation',new Map([
 ['header',{label:'Header navigation',fields:navFields.filter(field=>field.key.startsWith('header.'))}],
 ['footer',{label:'Footer navigation',fields:navFields.filter(field=>field.key.startsWith('footer.'))}],
]));
const careerFields=[];
function flatten(value,path=[]){if(typeof value==='string'){if(path[0]==='teams'&&path.at(-1)==='0')return;careerFields.push({key:path.join('.'),label:path.join(' / '),type:'text',default:value});}else for(const [key,item]of Object.entries(value))flatten(item,[...path,key]);}
flatten(careers);modules.set('careers-copy',{label:'Careers introduction & hiring process',area:'Existing page copy',fields:careerFields});
const leadershipFields=[];
function leadershipControls(value,path=[]){if(typeof value==='string'){const key=path.join('.');const label=path[0]==='paragraphs'?`Biography paragraph ${Number(path[1])+1}`:path[0]==='screenWork'?`Screen credit ${Number(path[1])+1}`:path[0]==='honours'?`Honour ${Number(path[1])+1}`:({pageTitle:'Page title',eyebrow:'Section heading',name:'Name',role:'Role',portrait:'Portrait image',portraitAlt:'Portrait description',tagline:'Introduction',quote:'Founder quote',workHeading:'Screen work heading',honoursHeading:'Honours heading'}[key]||key);leadershipFields.push({key,label,type:key==='portrait'?'image':'text',default:value});}else for(const [key,item]of Object.entries(value))leadershipControls(item,[...path,key]);}
leadershipControls(leadership);modules.set('leadership',{label:'Leadership · Dev Raturi',area:'Studio pages',fields:leadershipFields});
const heroFields = [
 {key:'image',label:'Hero image',type:'image',default:''},
 {key:'imageAlt',label:'Image description',type:'text',default:''},
 {key:'title',label:'Title',type:'text',default:''},
 {key:'description',label:'Description',type:'text',default:''},
];
for (const page of editableInnerPages) {
 const settings={label:page.label,adminOnly:true,href:pageHref(page.key)};
 modules.set(`hero:${page.key}`,{...settings,area:'Hero section',fields:heroFields});
 modules.set(`faq:${page.key}`,{...settings,area:'FAQs',fields:[],faq:faqDefaults[page.key]||[],faqLimit:maxPageFaqs});
}

const pageCopyModules={
 home:['HomePage','DesignerServices','DesignerProductions','HomepageServiceData'],
 about:['StudioPages'],
 release:['ReleaseOverviewPage'],
 'press-media':['NewsPage'],
 legal:['LegalPage'],
};
const pageDirectoryUrl=page=>'/admin/pages/'+encodeURIComponent(page);
const pageRegistry=new Map([
 ['home',{key:'home',label:'Homepage'}],
 ...editableInnerPages.map(page=>[page.key,page]),
]);
const contentPageKeys=new Set(contentPages.map(page=>page.key));
const pageExtras={
 home:[['Homepage hero slides','/admin/manage/hero',true],['Showreel',editUrl('videos','showreel')],['The work. In frame.',editUrl('home-work-in-frame'),true],['Default hero text and additional content','/admin/pages/home/sections']],
 leadership:[['Founder biography and portrait',editUrl('leadership')],['Team profiles','/admin/content?type=team']],
 careers:[['Introduction and hiring process',editUrl('careers-copy')],['Career opportunities','/admin/content?type=career']],
 productions:[['Production listings','/admin/content?type=production']],
 'press-media':[['News posts','/admin/content?type=news'],['Press resources','/admin/content?type=press_asset'],['Media partners','/admin/content?type=media_partner']],
 blog:[['Blog posts','/admin/content?type=blog']],
 contact:[['Contact and site settings','/admin/settings',true]],
 legal:[['Legal documents','/admin/manage/legal',true]],
 'privacy-policy':[['Privacy policy document','/admin/manage/legal',true]],
};
function pageCopyKeys(page){
 const component=page.split('-').map(word=>word[0].toUpperCase()+word.slice(1)).join('')+'Page';
 return (pageCopyModules[page]||[component]).map(name=>'copy:'+name).filter(key=>modules.has(key));
}
export function pageEditors(page,role){
 const entry=pageRegistry.get(page);
 if(!entry)return null;
 const links=[];
 const addModule=(key,label)=>{
  const module=modules.get(key);
  if(module&&(!module.adminOnly||role==='admin'))links.push({label,href:editUrl(key)});
 };
 addModule('hero:'+page,'Hero settings');
 for(const key of pageCopyKeys(page)){
  const module=modules.get(key),sections=moduleSections.get(key);
  if(sections){
   for(const [id,section] of sections){
    const label=page==='home'?`${module.label} · ${section.label}`:section.label;
    links.push({label:module===budgetingModule&&id==='faqs'?'FAQs':label,href:editUrl(key,id)});
   }
  }else addModule(key,page==='home'?module.label:'Page copy');
 }
 if(page!=='budgeting-scheduling')addModule('faq:'+page,'FAQ entries');
 addModule('images:'+encodeURIComponent(pageHref(page)),'Images');
 for(const [label,href,adminOnly] of pageExtras[page]||[]){
  if(!adminOnly||role==='admin')links.push({label,href});
 }
 if(contentPageKeys.has(page)&&page!=='home'){
  links.push({label:'Additional sections and metadata',href:'/admin/content?'+new URLSearchParams({type:'page',page})});
 }
 return {module:{...entry,href:pageHref(page)},sections:links};
}

export async function pageEditorGroups(db,role){
 const [record]=await rows(db,'SELECT published FROM cms_site_modules WHERE module_key=?',['navigation']);
 const menu=applyNavigation(headerMenu,'header',json(record?.published)||{});
 const pagesByHref=new Map([...pageRegistry].map(([key,page])=>[pageHref(key),page]));
 const seen=new Set();
 const add=(href,label)=>{
  const pathname=href?.startsWith('/')?href.split(/[?#]/)[0].replace(/\/?$/,'/'):href;
  const page=pagesByHref.get(pathname);
  if(!page||seen.has(page.key))return [];
  seen.add(page.key);
  if(!pageEditors(page.key,role).sections.length)return [];
  return [{label:label||page.label,href:pageDirectoryUrl(page.key)}];
 };
 const groups=[{pages:add('/')}];
 for(const item of menu){
  if(item.href)groups.push({pages:add(item.href,item.label)});
  else for(const group of item.groups||[]){
   groups.push({label:[item.label,group.title].filter(Boolean).join(' · '),
    pages:(group.links||[]).flatMap(link=>add(link.href,link.label))});
  }
 }
 groups.push({label:'Other website pages',pages:[...pageRegistry.keys()].flatMap(page=>add(pageHref(page)))});
 return groups.filter(group=>group.pages.length);
}

function parentPageForModule(key){
 if(key.startsWith('hero:')||key.startsWith('faq:'))return key.slice(key.indexOf(':')+1);
 if(key.startsWith('copy:'))return [...pageRegistry.keys()].find(page=>pageCopyKeys(page).includes(key));
 if(key.startsWith('images:'))return [...pageRegistry.keys()].find(page=>key==='images:'+encodeURIComponent(pageHref(page)));
 if(key==='leadership'||key==='careers-copy')return key==='leadership'?'leadership':'careers';
 if(key==='home-work-in-frame')return 'home';
}

function validatePageFaq(module,body) {
 const array = value => value === undefined ? [] : Array.isArray(value) ? value : [value];
 const questions=array(body.faq_question), answers=array(body.faq_answer);
 fail(questions.length===answers.length&&questions.length<=module.faqLimit,`Use up to ${module.faqLimit} questions and answers.`);
 const items=[];
 for (const [index,question] of questions.entries()) {
  const answer=answers[index];
  fail(typeof question==='string'&&typeof answer==='string'&&question.length<=300&&answer.length<=4000,'Keep questions within 300 characters and answers within 4,000 characters.');
  const pair=[question.trim(),answer.trim()];
  if (pair.every(value=>!value)) continue;
  fail(pair.every(Boolean),'Fill in both the question and answer, or remove the row.');
  items.push(pair);
 }
 return JSON.stringify(items)===JSON.stringify(module.faq)?{}:{items};
}

export const siteModuleCatalogue=modules;
export async function publishedSiteModules(db){return Object.fromEntries((await rows(db,'SELECT module_key,published FROM cms_site_modules WHERE published IS NOT NULL')).map(row=>[row.module_key,json(row.published)]));}
const hasSectionVisibility=(body,key)=>body.section_visibility==='1'||
 Object.hasOwn(body,`value:${key}`)||Object.hasOwn(body,`value:${key.replace(/enabled$/, 'position')}`);
function customMenuLinks(body,side){
 const array=value=>value===undefined?[]:Array.isArray(value)?value:[value];
 const labels=array(body.menu_link_label),paths=array(body.menu_link_href),positions=array(body.menu_link_position);
 const placements=array(body.menu_link_placement);
 const choices=new Map(menuPlacements(side).map(choice=>[choice.id,choice]));
 fail(labels.length===paths.length&&labels.length===positions.length&&(!placements.length||labels.length===placements.length)&&labels.length<=12,'Add up to 12 custom page links.');
 const links=[];
 for(const [index,label] of labels.entries()){
  const path=paths[index],placement=placements[index]??defaultMenuPlacement(side);
  const choice=choices.get(placement);
  const selectedPosition=positions[index];
  const position=typeof selectedPosition==='string'&&/^\d+$/.test(selectedPosition)?Number(selectedPosition):selectedPosition;
  fail(typeof label==='string'&&typeof path==='string','Enter a page name and URL.');
  if(!label.trim()&&!path.trim())continue;
  const href=path.trim();
  fail(label.trim()&&label.trim().length<=100,'Enter a page name of up to 100 characters.');
  fail(href.length<=500&&/^\/(?!\/)/.test(href)&&!/[\\\s\u0000-\u001f\u007f]/.test(href),'Use a website path that starts with a single slash.');
  fail(choice,'Choose where the page should appear.');
  fail(position==='first'||position==='last'||choice.positions.some(option=>option.value===position)||
   (placement===defaultMenuPlacement(side)&&Number.isInteger(position)&&position>=1&&position<=1000),
   'Choose a valid position for this menu location.');
  fail(!links.some(link=>link.href===href),'Add each custom page URL only once.');
  links.push({label:label.trim(),href,placement,position});
 }
 return links;
}
export function validateSiteModule(key,body,fields){
 const module=modules.get(key);fail(module,'Unknown website area.',404);
 if(module.faq)return validatePageFaq(module,body);
 const result={};
 for(const field of fields||module.fields){
  if(field.type==='customLinks'){
   if(body.menu_custom_links==='1'){
    const links=customMenuLinks(body,field.key.split('.')[0]);
    if(links.length)result[field.key]=links;
   }
   continue;
  }
  const raw=body[`value:${field.key}`];let value;
  if(field.type==='boolean'&&field.section&&!hasSectionVisibility(body,field.key))continue;
  if(field.type==='boolean')value=raw==='on';
  else if(field.type==='number'){value=Number(raw??field.default);fail(Number.isInteger(value)&&value>=1&&value<=1000,'Use an order from 1 to 1000.');}
  else{value=typeof raw==='string'?raw:field.default;fail(typeof value==='string'&&value.length<=12000,'Keep text within 12,000 characters.');
   if(['image','video','captions','link'].includes(field.type)&&value){
    let url;try{url=new URL(value,'https://local.invalid')}catch{}fail(url&&!url.username&&!url.password&&!/[\r\n]/.test(value)&&((value.startsWith('/')&&!value.startsWith('//'))||value.startsWith('#')||url.protocol==='https:'||(field.type==='link'&&['mailto:','tel:'].includes(url.protocol))),'Use a local path or an approved HTTPS URL.');
    if(field.type==='image')fail((value.startsWith('/')&&!value.startsWith('//'))||url.protocol==='https:','Use an image path or HTTPS image URL.');
    if(field.type==='video')fail(url.pathname.toLowerCase().endsWith('.mp4'),'Videos must use direct MP4 URLs.');
    if(field.type==='captions')fail(/^\/media\/\d+\/captions\.vtt$/.test(value),'Upload a WebVTT subtitle file.');
   }
   if(field.type==='language')fail(/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})?$/.test(value),'Use a language code such as en or hi.');
  }
  if(key.startsWith('hero:'))value=value.trim();
  if(field.key==='header.cta.label'){
   value=value.trim();
   fail(value.length>0&&value.length<=80,'Enter a header button label of up to 80 characters.');
  }
  if(field.key==='header.cta.href')fail(value.trim(),'Enter a header button destination.');
  if(value!==field.default)result[field.key]=value;
 }
 if(key.startsWith('hero:')){
  fail(!result.title||result.title.length<=200,'Keep the hero title within 200 characters.');
  fail(!result.description||result.description.length<=2000,'Keep the hero description within 2,000 characters.');
  fail(!result.imageAlt||result.imageAlt.length<=254,'Keep the image description within 254 characters.');
 }
 if(key==='home-work-in-frame'){
  const read=name=>result[name]??workInFrameFields.find(field=>field.key===name)?.default;
  fail(read('title').trim(),'Enter a section title.');
  for(const slide of workInFrame.slides){
   const prefix=`slides.${slide.id}.`;
   if(read(prefix+'enabled'))fail(read(prefix+'title').trim()&&read(prefix+'category').trim()&&read(prefix+'image'), 'Every visible slide needs a title, category and image.');
  }
 }
 if(key==='videos')for(const slot of Object.keys(videos)){
  if(fields&&!fields.some(field=>field.key===`${slot}.enabled`))continue;const read=name=>Object.hasOwn(result,`${slot}.${name}`)?result[`${slot}.${name}`]:module.fields.find(f=>f.key===`${slot}.${name}`).default;if(read('enabled'))fail(read('src')&&read('poster')&&read('label'),'Every visible video needs a file, poster and label.');}
 return result;
}
export function siteModulesRouter(db){
 const router=Router();router.use('/admin/site-content',(req,res,next)=>{res.set('Content-Security-Policy',"default-src 'self'; img-src 'self' data: https:; media-src 'self' https:; style-src 'self'; script-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'self'");next();});router.use('/admin/site-content',(req,res,next)=>canEdit(req.user)?next():next(Object.assign(new Error('Publishing access required.'),{status:403})));
 router.get('/admin/site-content',async(req,res)=>{const records=await rows(db,'SELECT module_key,revision,published,updated_at FROM cms_site_modules');
  res.render('site-modules',{modules:[...modules].filter(([key,module])=>
   parentPageForModule(key)!=='home'&&(!module.adminOnly||req.user.role==='admin')),records});});
 router.get('/admin/site-content/edit',async(req,res)=>{
  const key=req.query.key,entry=modules.get(key);fail(entry,'Unknown website area.',404);fail(!entry.adminOnly||req.user.role==='admin','Administrator access required.',403);
  if(key===budgetingFaqKey)return res.redirect(budgetingFaqUrl+'#faq-questions');
  const showreel=key==='videos'&&req.query.section==='showreel';
  const sections=moduleSections.get(key);
  if(sections&&req.query.section===undefined){
   const links=[...sections].map(([id,section])=>({
    label:entry===budgetingModule&&id==='faqs'?'FAQs':section.label,
    href:editUrl(key,id),
   }));
   return res.render('site-module-sections',{module:entry,sections:links});
  }
  const section=sections?.get(req.query.section);
  if(sections)fail(section,'Unknown page section.',404);
  const module=section?{...entry,label:section.label,area:entry.label,fields:section.fields}:
   showreel?{...entry,label:'Homepage showreel',href:'/#showreel',fields:showreelFields}:key==='videos'?{...entry,label:'Page videos',fields:pageVideoFields}:entry;
  const row=(await rows(db,'SELECT * FROM cms_site_modules WHERE module_key=?',[key]))[0];
  const draft=row?json(row.draft):{};
  const sectionKeys=section&&new Set(section.fields.map(field=>field.key));
  const live=section?Object.keys(sectionValues(json(row?.published),sectionKeys,true)).length>0:showreel?Boolean(row?.published&&Object.keys(showreelValues(json(row.published),true)).length):Boolean(row?.published);
  const historyQuery='SELECT revision,action,created_at FROM cms_site_module_revisions WHERE module_key=? ORDER BY revision DESC LIMIT 10';
  const history=await rows(db,historyQuery,[key]);
  const budgetingFaqLayout=entry===budgetingModule&&req.query.section==='faqs';
  let faqEditor;
  if(budgetingFaqLayout&&req.user.role==='admin'){
   const [faqRows,faqHistory]=await Promise.all([
    rows(db,'SELECT revision,draft FROM cms_site_modules WHERE module_key=?',[budgetingFaqKey]),
    rows(db,historyQuery,[budgetingFaqKey]),
   ]);
   const faqRow=faqRows[0];
   faqEditor={key:budgetingFaqKey,module:modules.get(budgetingFaqKey),
    draft:json(faqRow?.draft)||{},revision:faqRow?.revision||0,history:faqHistory};
  }
  if(key==='navigation'){
   const sectionId=req.query.section;
   return res.render('site-navigation-edit',{key,module,draft,revision:row?.revision||0,history,sectionId,
    menu:sectionId==='header'?headerMenu:footerMenu,
    placements:menuPlacements(sectionId),defaultPlacement:defaultMenuPlacement(sectionId),
    socials:sectionId==='footer'?footerSocialProfiles(await settings(db)):[],
   });
  }
  const page=showreel?'home':parentPageForModule(key);
  res.render('site-module-edit',{key,module,draft,revision:row?.revision||0,live,history,showreel,budgetingFaqLayout,faqEditor,
   sectionId:section?req.query.section:null,
   sectionsUrl:page?pageDirectoryUrl(page):section?editUrl(key):null,
   sectionsLabel:page?pageRegistry.get(page).label:entry.label});
 });
 router.post('/admin/site-content/save',async(req,res)=>{
  const key=req.body.module_key,module=modules.get(key);fail(module,'Unknown website area.',404);fail(!module.adminOnly||req.user.role==='admin','Administrator access required.',403);
  const showreel=key==='videos'&&req.body.section==='showreel';
  const sectionId=req.body.section;
  const placement=req.body.placement;
  const placementFields=typeof placement==='string'&&key.startsWith('images:')
   ?module.fields.filter(field=>field.key===placement+'.src'||field.key===placement+'.alt'):[];
  if(placement!==undefined)fail(placementFields.some(field=>field.type==='image'),'Unknown image placement.',404);
  const section=placementFields.length?{fields:placementFields}:moduleSections.get(key)?.get(sectionId);
  if(sectionId!==undefined)fail(section||showreel,'Unknown page section.',404);
  const action=req.body.action;fail(['draft','publish','reset','restore'].includes(action),'Choose a valid action.');
  let fields=section?.fields||(key==='videos'?(showreel?showreelFields:pageVideoFields):module.fields);
  const menuEditor=key==='navigation'&&section&&req.body.menu_editor==='1'&&['draft','publish'].includes(action);
  if(menuEditor){
   fields=fields.filter(field=>field.key.startsWith('header.cta.')||field.type==='boolean'||(field.type==='customLinks'&&req.body.menu_custom_links==='1')||
    (field.type==='number'&&(sectionId==='header'||field.key.includes('.links.'))));
  }
  if(key==='navigation'&&section&&['draft','publish'].includes(action)&&req.body.menu_custom_links!=='1'){
   fields=fields.filter(field=>field.type!=='customLinks');
  }
  let draft=['reset','restore'].includes(action)?{}:validateSiteModule(key,req.body,fields);
  for(const field of fields){const value=draft[field.key];if(['image','video','captions'].includes(field.type)&&value){const match=value.match(/^\/media\/(\d+)(?:\/(video\.mp4|captions\.vtt))?$/);if(match){const media=(await rows(db,'SELECT m.mime FROM cms_media m WHERE m.id=? AND NOT EXISTS(SELECT 1 FROM talent_accounts t WHERE t.image_id=m.id)',[match[1]]))[0];fail(media&&(field.type==='image'?media.mime.startsWith('image/'):field.type==='video'?media.mime==='video/mp4':media.mime==='text/vtt'),'The selected uploaded media does not exist or has the wrong type.');}}}
  let revision,savedPlacement;
  const connection=await db.getConnection();try{await connection.beginTransaction();const current=(await rows(connection,'SELECT * FROM cms_site_modules WHERE module_key=? FOR UPDATE',[key]))[0];fail(Number(req.body.revision)===(current?.revision||0),'This content changed. Reload before saving.',409);
   if(module===budgetingModule&&(action==='draft'||action==='publish')){
    const previous=json(current?.draft)||{};
    for(const field of fields.filter(field=>field.section&&field.type==='boolean')){
     if(!hasSectionVisibility(req.body,field.key)&&Object.hasOwn(previous,field.key))draft[field.key]=previous[field.key];
    }
   }
   if(action==='restore'){fail(Number.isSafeInteger(Number(req.body.restore_revision))&&Number(req.body.restore_revision)>0,'Choose a revision to restore.');const previous=(await rows(connection,'SELECT snapshot FROM cms_site_module_revisions WHERE module_key=? AND revision=?',[key,Number(req.body.restore_revision)]))[0];fail(previous,'Revision not found.',404);draft=json(previous.snapshot).draft;}
   const live=current?.published?json(current.published):null;
   let published=action==='publish'?draft:action==='reset'?null:live;
   if(action==='reset')draft={};
   if(key==='navigation'&&!section&&req.body.menu_custom_links!=='1'){
    for(const side of ['header','footer']){
     const customKey=`${side}.customLinks`;
     const savedDraft=json(current?.draft)?.[customKey];
     if(savedDraft&&(action==='draft'||action==='publish'))draft[customKey]=savedDraft;
     if(live?.[customKey]&&action==='publish')published={...published,[customKey]:live[customKey]};
    }
   }
   if(section){
    const keys=new Set(fields.map(field=>field.key));
    const next=sectionValues(draft,keys,true);
    draft={...sectionValues(json(current?.draft),keys,false),...next};
    if(action==='publish'||action==='reset'){
     published={...sectionValues(live,keys,false),...next};
     if(!Object.keys(published).length)published=null;
    }
   }
   if(key==='videos'){
    const next=showreelValues(draft,showreel);
    draft={...showreelValues(json(current?.draft),!showreel),...next};
    if(action==='publish'||action==='reset'){
     published={...showreelValues(live,!showreel),...next};
     if(!Object.keys(published).length)published=null;
    }
   }
   revision=(current?.revision||0)+1;
   if(placement)savedPlacement=Object.fromEntries(fields.map(field=>[field.key,draft[field.key]??field.default]));
   await rows(connection,'INSERT INTO cms_site_modules(module_key,draft,published,revision,updated_by) VALUES(?,?,?,?,?) ON DUPLICATE KEY UPDATE draft=VALUES(draft),published=VALUES(published),revision=VALUES(revision),updated_by=VALUES(updated_by)',[key,JSON.stringify(draft),published?JSON.stringify(published):null,revision,req.user.id]);
   await rows(connection,'INSERT INTO cms_site_module_revisions(module_key,revision,snapshot,action,created_by) VALUES(?,?,?,?,?)',[key,revision,JSON.stringify({draft,published}),action,req.user.id]);await audit(connection,req.user,`site_${action}`,'site_content',key);await connection.commit();
  }catch(error){await connection.rollback();throw error;}finally{connection.release();}
  if(key===budgetingFaqKey)return res.redirect(budgetingFaqUrl+'&saved=1#faq-questions');
  if(placement&&req.accepts(['html','json'])==='json')return res.json({revision,values:savedPlacement});
  res.redirect(`${editUrl(key,sectionId)}&saved=1${placement?'#image-'+encodeURIComponent(placement):''}`);
 });return router;
}
