import {parse} from '@babel/parser';
import fs from 'node:fs';import path from 'node:path';import {createHash}from'node:crypto';
const root=path.resolve(import.meta.dirname,'../src'),cataloguePath=path.resolve(root,'../../shared/site-copy-catalogue.json'),catalogue=JSON.parse(fs.readFileSync(cataloguePath));
const extras=['Header.jsx','Footer.jsx','JourneyLinks.jsx','PrincipleSteps.jsx','PageUI.jsx','SectionSubmenu.jsx','ExperienceTools.jsx','guideFlows.js','pages/partnerRoutes.js','pages/NewsPage.jsx','pages/BlogPage.jsx','pages/SitemapPage.jsx','pages/LegalPage.jsx','../../designer-theme/src/data.js'];
const sources=[...new Set([...Object.values(catalogue).map(g=>g.source),...extras])];
const forbidden=new Set(['id','key','page','type','name','href','src','poster','image','icon','className','mediaSlot','accept','pattern','role','value','field','options','style','color','colors','background']);
const technical=/^(?:statuses|categories|filters|images|scenes|icons|routes|partners|teamOptions|intakes|hints|parts|.*Query|.*Fields|.*Options)$/i;
const readable=s=>s.trim()&&/[\p{L}]/u.test(s)&&/[A-Z\s]/.test(s)&&!s.startsWith('/')&&!s.startsWith('#')&&!/^(?:https?:|mailto:|tel:)/.test(s)&&s.length<12000;
function clean(value){const lines=value.replace(/\t/g,' ').split(/\r?\n/);let last=0;lines.forEach((s,i)=>{if(/[^ ]/.test(s))last=i});return lines.map((s,i)=>{if(i)s=s.replace(/^ +/,'');if(i<lines.length-1)s=s.replace(/ +$/,'');return s&&i<last?s+' ':s}).join('');}
for(const sourcePath of sources){
 const absolute=path.resolve(root,sourcePath),source=fs.readFileSync(absolute,'utf8'),ast=parse(source,{sourceType:'module',plugins:['jsx']});let group=Object.keys(catalogue).find(k=>catalogue[k].source===sourcePath)||path.basename(sourcePath).replace(/\.(jsx?|tsx?)$/,'');if(sourcePath.includes('designer-theme'))group='HomepageServiceData';
 const current=catalogue[group]||{source:sourcePath,label:group.replace(/Page$|Pages$/,'').replace(/([a-z])([A-Z])/g,'$1 $2'),fields:[]},known=new Set(current.fields.map(f=>f.key)),edits=[],wrapped=new Set();
 function add(node,value,label,jsx){if(!value.trim()||!/[\p{L}]/u.test(value))return;let ordinal=0,key;do{key=createHash('sha256').update(group+'|text|'+value+'|'+ordinal++).digest('hex').slice(0,16)}while(known.has(key));known.add(key);current.fields.push({key,label:label||value.trim().slice(0,85),default:value,type:'text'});const call=`cmsText(${JSON.stringify(group)},${JSON.stringify(key)},${JSON.stringify(value)})`;edits.push({start:node.start,end:node.end,text:jsx?`{${call}}`:call});}
 function walk(node,anc=[]){if(!node||typeof node!=='object'||!node.type)return;const parent=anc.at(-1);
  if(node.type==='JSXText')add(node,clean(node.value),undefined,true);
  else if(node.type==='StringLiteral'&&parent?.type==='JSXAttribute'&&['title','heading','description','accent','eyebrow','caption'].includes(parent.name?.name))add(node,node.value,`${parent.name.name}: ${node.value.slice(0,75)}`,true);
  else if(node.type==='StringLiteral'&&readable(node.value)&&parent?.type!=='JSXAttribute'&&!anc.some(a=>a.type==='ImportDeclaration')){
   const containerIndex=anc.findLastIndex(a=>['ArrayExpression','ObjectExpression'].includes(a.type));const property=anc.findLast(a=>a.type==='ObjectProperty');const declaration=anc.findLast(a=>a.type==='VariableDeclarator');
   const blocked=anc.slice(containerIndex+1).some(a=>['CallExpression','NewExpression'].includes(a.type))||anc.some(a=>a.type==='JSXAttribute')||(property&&(property.key===node||forbidden.has(property.key?.name||property.key?.value)))||technical.test(declaration?.id?.name||'');
   if(containerIndex>=0&&!blocked){add(node,node.value);if(declaration&&['ArrayExpression','ObjectExpression'].includes(declaration.init?.type)&&!anc.some(a=>['FunctionDeclaration','ArrowFunctionExpression','FunctionExpression'].includes(a.type)))wrapped.add(declaration.init);}
   else if(parent?.type==='JSXExpressionContainer'&&!anc.some(a=>a.type==='JSXAttribute'))add(node,node.value);
  }
  for(const [key,value]of Object.entries(node)){if(['loc','extra','comments','tokens'].includes(key))continue;if(Array.isArray(value))value.forEach(item=>walk(item,[...anc,node]));else if(value?.type)walk(value,[...anc,node]);}
 }
 walk(ast);if(!edits.length)continue;
 for(const node of wrapped)edits.push({start:node.start,end:node.start,text:'cmsData(()=>('},{start:node.end,end:node.end,text:'))'});
 let result=source;for(const edit of edits.sort((a,b)=>b.start-a.start||b.end-a.end))result=result.slice(0,edit.start)+edit.text+result.slice(edit.end);
 const imported=/import \{([^}]+)\} from ['"][^'"]*siteContent(?:\.js)?['"];/.exec(result);
 if(imported){const names=new Set(imported[1].split(',').map(x=>x.trim()));names.add('cmsText');if(wrapped.size)names.add('cmsData');result=result.replace(imported[0],imported[0].replace(imported[1],[...names].join(',')));}
 else{let relative=path.relative(path.dirname(absolute),path.join(root,'siteContent.js')).replaceAll('\\','/');if(!relative.startsWith('.'))relative='./'+relative;result=`import {cmsText${wrapped.size?',cmsData':''}} from ${JSON.stringify(relative)};\n`+result;}
 parse(result,{sourceType:'module',plugins:['jsx']});fs.writeFileSync(absolute,result);catalogue[group]=current;
}
fs.writeFileSync(cataloguePath,JSON.stringify(catalogue,null,2)+'\n');console.log(`${Object.keys(catalogue).length} groups; ${Object.values(catalogue).reduce((n,g)=>n+g.fields.length,0)} fields`);
