// Update reviewed copy without changing CMS control keys or legal text.
import {parse} from '@babel/parser';
import {readFile,writeFile,readdir} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../..');
const updates=JSON.parse(await readFile(path.join(root,'shared/editorial-copy-updates.json'),'utf8'));
let strings=0,files=0;
async function sourceFiles(dir){const list=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())list.push(...await sourceFiles(p));else if(/\.jsx?$/.test(e.name))list.push(p);}return list;}
for(const file of await sourceFiles(path.join(root,'rain-temp/src'))){
 const source=await readFile(file,'utf8'),ast=parse(source,{sourceType:'module',plugins:['jsx']}),edits=[];
 function walk(node){if(!node||typeof node!=='object')return;
  if(node.type==='StringLiteral'&&Object.hasOwn(updates,node.value))edits.push({start:node.start,end:node.end,text:JSON.stringify(updates[node.value])});
  for(const [key,value]of Object.entries(node)){if(['loc','extra','comments','tokens'].includes(key))continue;if(Array.isArray(value))value.forEach(walk);else if(value&&typeof value==='object')walk(value);}
 }
 walk(ast);if(!edits.length)continue;
 let next=source;for(const e of edits.sort((a,b)=>b.start-a.start))next=next.slice(0,e.start)+e.text+next.slice(e.end);
 await writeFile(file,next);strings+=edits.length;files++;
}
function revise(value){if(typeof value==='string')return updates[value]??value;if(Array.isArray(value))return value.map(revise);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,revise(item)]));return value;}
for(const name of ['site-copy-catalogue','careers-content','hero-slides','site-video-defaults']){
 const file=path.join(root,`shared/${name}.json`),source=await readFile(file,'utf8'),current=JSON.parse(source),next=revise(current);
 if(JSON.stringify(current)!==JSON.stringify(next))await writeFile(file,JSON.stringify(next,null,2)+'\n');
}
// Hex literals avoid quoting errors and semicolons inside SQL migration statements.
const sqlValue=value=>value?`CONVERT(0x${Buffer.from(value).toString('hex')} USING utf8mb4) COLLATE utf8mb4_bin`:"_utf8mb4'' COLLATE utf8mb4_bin";
const statements=['START TRANSACTION','CREATE TEMPORARY TABLE kemsor_copy_modules_before AS SELECT * FROM cms_site_modules',"CREATE TEMPORARY TABLE kemsor_copy_hero_before AS SELECT * FROM cms_managed_content WHERE kind='hero'"];
for(const [before,after]of Object.entries(updates)){
 statements.push(`SET @copy_before=${sqlValue(before)}`,`SET @copy_after=${sqlValue(after)}`);
 for(const [table,condition]of [['cms_site_modules',''],['cms_managed_content',"kind='hero' AND "]])statements.push(`UPDATE ${table} SET draft=REPLACE(draft,JSON_QUOTE(@copy_before),JSON_QUOTE(@copy_after)),published=REPLACE(published,JSON_QUOTE(@copy_before),JSON_QUOTE(@copy_after)) WHERE ${condition}(LOCATE(JSON_QUOTE(@copy_before),draft)>0 OR LOCATE(JSON_QUOTE(@copy_before),published)>0)`);
 statements.push("UPDATE cms_entries SET title=REPLACE(title,@copy_before,@copy_after),summary=REPLACE(summary,@copy_before,@copy_after),body=REPLACE(body,@copy_before,@copy_after),metadata=REPLACE(metadata,JSON_QUOTE(@copy_before),JSON_QUOTE(@copy_after)) WHERE type<>'legal' AND (LOCATE(@copy_before,title)>0 OR LOCATE(@copy_before,summary)>0 OR LOCATE(@copy_before,body)>0 OR LOCATE(JSON_QUOTE(@copy_before),metadata)>0)");
 statements.push("UPDATE cms_settings SET value=REPLACE(value,JSON_QUOTE(@copy_before),JSON_QUOTE(@copy_after)) WHERE name IN ('footer_description','footer_kicker','footer_title','footer_accent','contact_note','map_caption') AND LOCATE(JSON_QUOTE(@copy_before),value)>0");
}
const changed='NOT(m.draft<=>b.draft) OR NOT(m.published<=>b.published)';
for(const [table,backup,history,id]of [['cms_site_modules','kemsor_copy_modules_before','cms_site_module_revisions','module_key'],['cms_managed_content','kemsor_copy_hero_before','cms_managed_revisions','id']]){
 const historyKey=id==='id'?'content_id':id;
 const snapshot=alias=>`JSON_OBJECT('draft',JSON_EXTRACT(${alias}.draft,'$'),'published',JSON_EXTRACT(${alias}.published,'$'))`;
 statements.push(`INSERT IGNORE INTO ${history}(${historyKey},revision,snapshot,action) SELECT b.${id},b.revision,${snapshot('b')},'before-copy-review' FROM ${backup} b JOIN ${table} m ON m.${id}=b.${id} WHERE ${changed}`);
 statements.push(`INSERT INTO ${history}(${historyKey},revision,snapshot,action) SELECT m.${id},m.revision+1,${snapshot('m')},'copy-review' FROM ${table} m JOIN ${backup} b ON m.${id}=b.${id} WHERE ${changed}`);
 statements.push(`UPDATE ${table} m JOIN ${backup} b ON m.${id}=b.${id} SET m.revision=m.revision+1,m.updated_by=NULL WHERE ${changed}`);
}
statements.push("INSERT INTO cms_audit(action,target_type,target_id) VALUES('copy_review','website','025_editorial_copy_review')",'DROP TEMPORARY TABLE kemsor_copy_modules_before','DROP TEMPORARY TABLE kemsor_copy_hero_before','COMMIT');
await writeFile(path.join(root,'backend/migrations/025_editorial_copy_review.sql'),statements.join(';\n')+';\n');
console.log(`Updated ${strings} source strings across ${files} files. CMS keys preserved; migration generated from ${Object.keys(updates).length} reviewed text changes.`);
