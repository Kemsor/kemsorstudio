import {parse} from '@babel/parser';
import {readFile,writeFile,readdir,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
const root=new URL('../src/',import.meta.url), backup='/tmp/kemsor-cms-preserved-sources';
await mkdir(backup,{recursive:true});
const excluded=new Set(['MemberDashboard.jsx','PlannerWorkflow.jsx','ProductionTool.jsx','TalentPages.jsx','PrivacyPolicyPage.jsx','LegalPage.jsx','PressMediaPage.jsx','NewsPage.jsx','BlogPage.jsx','SitemapPage.jsx']);
const files=(await readdir(new URL('pages/',root))).filter(f=>f.endsWith('.jsx')&&!excluded.has(f)).map(f=>'pages/'+f).concat(['HomePage.jsx','DesignerServices.jsx','DesignerProductions.jsx','EditorialPage.jsx']);
const catalogue=JSON.parse(await readFile(new URL('../../shared/site-copy-catalogue.json',import.meta.url),'utf8').catch(()=> '{}'));
const forbidden=/^(?:id|key|page|type|name|href|src|poster|image|icon|className|mediaSlot|accept|pattern|role|value|field|fields|options)$/;
const skipData=/^(?:statuses|categories|filters|images|scenes|icons|routes|partners|teamOptions|intakes|hints|parts|.*Query|.*Fields|.*Options)$/i;
const readable=s=>/[A-Z\s]/.test(s)&&/[\p{L}]/u.test(s)&&!s.startsWith('/')&&!/^https?:|^mailto:|^tel:|^[\w-]+\.(webp|png|svg|mp4|jpe?g)$/.test(s)&&s.length<12000;
function jsxText(value){const lines=value.replace(/\t/g,' ').split(/\r?\n/);let last=0;lines.forEach((s,i)=>{if(/[^ ]/.test(s))last=i});return lines.map((s,i)=>{if(i)s=s.replace(/^ +/,'');if(i<lines.length-1)s=s.replace(/ +$/,'');return s&&i<last?s+' ':s}).join('');}
for(const file of files){
 const url=new URL(file,root),source=await readFile(url,'utf8');
 if(source.includes("from '../siteContent'")||source.includes("from './siteContent'"))continue;
 await writeFile(path.join(backup,file.replaceAll('/','_')),source);
 const ast=parse(source,{sourceType:'module',plugins:['jsx']}),group=file.replace(/^pages\//,'').replace(/\.jsx$/,'');
 const fields=[],edits=[],wrapped=new Set(),seen=new Map();
 function add(node,value,label,type='text'){
  if(!value.trim()||!/[\p{L}\p{N}]/u.test(value))return;
  const ordinal=seen.get(value)||0;seen.set(value,ordinal+1);
  const key=createHash('sha256').update(group+'|'+type+'|'+value+'|'+ordinal).digest('hex').slice(0,16);
  fields.push({key,label:label||value.trim().slice(0,85),default:value,type});
  return `cmsText(${JSON.stringify(group)},${JSON.stringify(key)},${JSON.stringify(value)})`;
 }
 function walk(node,ancestors=[]){
  if(!node||typeof node!=='object'||!node.type)return;
  const parent=ancestors.at(-1);
  if(node.type==='JSXText'){
   const value=jsxText(node.value);if(value.trim()&&/[\p{L}]/u.test(value)){
    const replacement=add(node,value,value.trim().slice(0,85));if(replacement)edits.push({start:node.start,end:node.end,text:`{${replacement}}`});
   }
  }else if(node.type==='StringLiteral'&&parent?.type==='JSXAttribute'&&['title','heading','description','accent','eyebrow','caption','alt'].includes(parent.name?.name)){
   const replacement=add(node,node.value,`${parent.name.name}: ${node.value.slice(0,75)}`);if(replacement)edits.push({start:node.start,end:node.end,text:`{${replacement}}`});
  }else if(node.type==='StringLiteral'){
   const declarator=[...ancestors].reverse().find(a=>a.type==='VariableDeclarator'&&['ArrayExpression','ObjectExpression'].includes(a.init?.type));
   if(declarator&&!skipData.test(declarator.id?.name||'')&&readable(node.value)&&!ancestors.some(a=>['JSXAttribute','ImportDeclaration','CallExpression','NewExpression'].includes(a.type))&&!(parent?.type==='ObjectProperty'&&(parent.key===node||forbidden.test(parent.key?.name||parent.key?.value||'')))){
    const replacement=add(node,node.value,`${declarator.id.name}: ${node.value.slice(0,75)}`);if(replacement){edits.push({start:node.start,end:node.end,text:replacement});
     if(!ancestors.some(a=>['FunctionDeclaration','ArrowFunctionExpression','FunctionExpression'].includes(a.type)))wrapped.add(declarator.init);
    }
   }
  }
  for(const [key,value] of Object.entries(node)){if(['loc','start','end','extra','comments','tokens'].includes(key))continue;if(Array.isArray(value))value.forEach(child=>walk(child,[...ancestors,node]));else if(value?.type)walk(value,[...ancestors,node]);}
 }
 walk(ast);
 for(const node of wrapped){edits.push({start:node.start,end:node.start,text:'cmsData(()=>('},{start:node.end,end:node.end,text:'))'});}
 if(!fields.length)continue;
 let result=source;for(const edit of edits.sort((a,b)=>b.start-a.start||b.end-a.end))result=result.slice(0,edit.start)+edit.text+result.slice(edit.end);
 result=`import {cmsText${wrapped.size?',cmsData':''}} from '${file.startsWith('pages/')?'../':'./'}siteContent';\n`+result;
 parse(result,{sourceType:'module',plugins:['jsx']});
 catalogue[group]={label:group.replace(/Page$|Pages$/,'').replace(/([a-z])([A-Z])/g,'$1 $2'),source:file,fields};
 await writeFile(url,result);
}
await writeFile(new URL('../../shared/site-copy-catalogue.json',import.meta.url),JSON.stringify(catalogue,null,2)+'\n');
console.log(`Registered ${Object.keys(catalogue).length} content groups and ${Object.values(catalogue).reduce((n,g)=>n+g.fields.length,0)} text fields. Originals preserved in ${backup}.`);
