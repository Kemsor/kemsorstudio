import leadership from '../../shared/leadership-content.json' with {type:'json'};
import footerNavigation from '../../shared/footer-navigation.json' with {type:'json'};
import {Router} from 'express';
import {rows,json,audit} from './db.js';
import {canEdit} from './security.js';
import copy from '../../shared/site-copy-catalogue.json' with {type:'json'};
import images from '../../shared/site-image-slots.json' with {type:'json'};
import videos from '../../shared/site-video-defaults.json' with {type:'json'};
import navigation from '../../shared/header-navigation.json' with {type:'json'};
import careers from '../../shared/careers-content.json' with {type:'json'};
const fail=(condition,message,status=422)=>{if(!condition)throw Object.assign(new Error(message),{status});};
const modules=new Map();
for(const [key,group]of Object.entries(copy))modules.set(`copy:${key}`,{label:group.label,area:'Existing page copy',fields:group.fields});
for(const [key,item]of Object.entries(images)){
 const moduleKey=`images:${encodeURIComponent(item.page)}`;
 if(!modules.has(moduleKey))modules.set(moduleKey,{label:item.page==='/'?'Homepage images':item.page,area:'Image placements',fields:[]});
 modules.get(moduleKey).fields.push({key:`${item.id}.src`,label:`${item.slot} · ${item.original.split('/').at(-1)}`,type:'image',default:item.value?.src||''},{key:`${item.id}.alt`,label:`${item.slot} · Image description`,type:'text',default:item.value?.alt||''});
}
const videoFields=[];
for(const [key,slot]of Object.entries(videos))for(const [field,type,value]of [['enabled','boolean',true],['position','number',Object.keys(videos).indexOf(key)+1],['label','text',slot.label],['src','video',slot.src],['poster','image',slot.poster],['captions','captions',''],['language','language','en']]){if(field==='position'&&!key.startsWith('showreel-'))continue;videoFields.push({key:`${key}.${field}`,label:`${key} · ${field}`,type,default:value});}
for(const [key,slot]of Object.entries(videos))if(key.startsWith('showreel-'))videoFields.push({key:`${key}.description`,label:`${key} · Text under the reel title`,type:'text',default:slot.description||''});
modules.set('branding',{label:'Website logo',area:'Branding',adminOnly:true,fields:[{key:'logo',label:'Logo image (leave blank for supplied logo)',type:'image',default:''},{key:'alt',label:'Logo description',type:'text',default:'Kemsor Studios'}]});
modules.set('videos',{label:'Showreel & page videos',area:'Video sections',fields:videoFields});
const navFields=[];
function navFieldsFor(items,prefix){items.forEach((node,index)=>{const key=`${prefix}.${index}`;for(const field of ['label','title','href'])if(node[field])navFields.push({key:`${key}.${field}`,label:`${node.label||node.title||'Navigation group'} · ${field}`,type:field==='href'?'link':'text',default:node[field]});navFields.push({key:`${key}.enabled`,label:`${node.label||node.title||'Navigation group'} · visible`,type:'boolean',default:true},{key:`${key}.position`,label:`${node.label||node.title||'Navigation group'} · order`,type:'number',default:index+1});if(node.groups)navFieldsFor(node.groups,key+'.groups');if(node.links)navFieldsFor(node.links,key+'.links');});}
navFieldsFor(navigation,'header');navFieldsFor(footerNavigation,'footer');
modules.set('navigation',{label:'Header & footer navigation',area:'Navigation',adminOnly:true,fields:navFields});
const careerFields=[];
function flatten(value,path=[]){if(typeof value==='string'){if(path[0]==='teams'&&path.at(-1)==='0')return;careerFields.push({key:path.join('.'),label:path.join(' / '),type:'text',default:value});}else for(const [key,item]of Object.entries(value))flatten(item,[...path,key]);}
flatten(careers);modules.set('careers-copy',{label:'Careers introduction & hiring process',area:'Existing page copy',fields:careerFields});
const leadershipFields=[];
function leadershipControls(value,path=[]){if(typeof value==='string'){const key=path.join('.');const label=path[0]==='paragraphs'?`Biography paragraph ${Number(path[1])+1}`:path[0]==='screenWork'?`Screen credit ${Number(path[1])+1}`:path[0]==='honours'?`Honour ${Number(path[1])+1}`:({pageTitle:'Page title',eyebrow:'Section heading',name:'Name',role:'Role',portrait:'Portrait image',portraitAlt:'Portrait description',tagline:'Introduction',quote:'Founder quote',workHeading:'Screen work heading',honoursHeading:'Honours heading'}[key]||key);leadershipFields.push({key,label,type:key==='portrait'?'image':'text',default:value});}else for(const [key,item]of Object.entries(value))leadershipControls(item,[...path,key]);}
leadershipControls(leadership);modules.set('leadership',{label:'Leadership · Dev Raturi',area:'Studio pages',fields:leadershipFields});
export const siteModuleCatalogue=modules;
export async function publishedSiteModules(db){return Object.fromEntries((await rows(db,'SELECT module_key,published FROM cms_site_modules WHERE published IS NOT NULL')).map(row=>[row.module_key,json(row.published)]));}
export function validateSiteModule(key,body){
 const module=modules.get(key);fail(module,'Unknown website area.',404);const result={};
 for(const field of module.fields){
  const raw=body[`value:${field.key}`];let value;
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
  if(value!==field.default)result[field.key]=value;
 }
 if(key==='videos')for(const slot of Object.keys(videos)){const read=name=>Object.hasOwn(result,`${slot}.${name}`)?result[`${slot}.${name}`]:module.fields.find(f=>f.key===`${slot}.${name}`).default;if(read('enabled'))fail(read('src')&&read('poster')&&read('label'),'Every visible video needs a file, poster and label.');}
 return result;
}
export function siteModulesRouter(db){
 const router=Router();router.use('/admin/site-content',(req,res,next)=>{res.set('Content-Security-Policy',"default-src 'self'; img-src 'self' data: https:; media-src 'self' https:; style-src 'self'; script-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'self'");next();});router.use('/admin/site-content',(req,res,next)=>canEdit(req.user)?next():next(Object.assign(new Error('Publishing access required.'),{status:403})));
 router.get('/admin/site-content',async(req,res)=>{const records=await rows(db,'SELECT module_key,revision,published,updated_at FROM cms_site_modules');res.render('site-modules',{modules:[...modules].filter(([,m])=>!m.adminOnly||req.user.role==='admin'),records});});
 router.get('/admin/site-content/edit',async(req,res)=>{const key=req.query.key,module=modules.get(key);fail(module,'Unknown website area.',404);fail(!module.adminOnly||req.user.role==='admin','Administrator access required.',403);const row=(await rows(db,'SELECT * FROM cms_site_modules WHERE module_key=?',[key]))[0];const draft=row?json(row.draft):{};res.render('site-module-edit',{key,module,draft,revision:row?.revision||0,live:row?.published!==null&&Boolean(row),history:await rows(db,'SELECT revision,action,created_at FROM cms_site_module_revisions WHERE module_key=? ORDER BY revision DESC LIMIT 10',[key])});});
 router.post('/admin/site-content/save',async(req,res)=>{
  const key=req.body.module_key,module=modules.get(key);fail(module,'Unknown website area.',404);fail(!module.adminOnly||req.user.role==='admin','Administrator access required.',403);
  const action=req.body.action;fail(['draft','publish','reset','restore'].includes(action),'Choose a valid action.');let draft=['reset','restore'].includes(action)?{}:validateSiteModule(key,req.body);
  for(const field of module.fields){const value=draft[field.key];if(['image','video','captions'].includes(field.type)&&value){const match=value.match(/^\/media\/(\d+)(?:\/(video\.mp4|captions\.vtt))?$/);if(match){const media=(await rows(db,'SELECT m.mime FROM cms_media m WHERE m.id=? AND NOT EXISTS(SELECT 1 FROM talent_accounts t WHERE t.image_id=m.id)',[match[1]]))[0];fail(media&&(field.type==='image'?media.mime.startsWith('image/'):field.type==='video'?media.mime==='video/mp4':media.mime==='text/vtt'),'The selected uploaded media does not exist or has the wrong type.');}}}
  const connection=await db.getConnection();try{await connection.beginTransaction();const current=(await rows(connection,'SELECT * FROM cms_site_modules WHERE module_key=? FOR UPDATE',[key]))[0];fail(Number(req.body.revision)===(current?.revision||0),'This content changed. Reload before saving.',409);
   if(action==='restore'){fail(Number.isSafeInteger(Number(req.body.restore_revision))&&Number(req.body.restore_revision)>0,'Choose a revision to restore.');const previous=(await rows(connection,'SELECT snapshot FROM cms_site_module_revisions WHERE module_key=? AND revision=?',[key,Number(req.body.restore_revision)]))[0];fail(previous,'Revision not found.',404);draft=json(previous.snapshot).draft;}
   const revision=(current?.revision||0)+1,published=action==='publish'?draft:action==='reset'?null:current?.published?json(current.published):null;
   if(action==='reset')draft={};
   await rows(connection,'INSERT INTO cms_site_modules(module_key,draft,published,revision,updated_by) VALUES(?,?,?,?,?) ON DUPLICATE KEY UPDATE draft=VALUES(draft),published=VALUES(published),revision=VALUES(revision),updated_by=VALUES(updated_by)',[key,JSON.stringify(draft),published?JSON.stringify(published):null,revision,req.user.id]);
   await rows(connection,'INSERT INTO cms_site_module_revisions(module_key,revision,snapshot,action,created_by) VALUES(?,?,?,?,?)',[key,revision,JSON.stringify({draft,published}),action,req.user.id]);await audit(connection,req.user,`site_${action}`,'site_content',key);await connection.commit();
  }catch(error){await connection.rollback();throw error;}finally{connection.release();}
  res.redirect(`/admin/site-content/edit?key=${encodeURIComponent(key)}&saved=1`);
 });return router;
}
