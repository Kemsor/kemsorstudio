import {Router} from 'express';
import {rows,json,audit} from './db.js';
import {canEdit} from './security.js';
const fail=(ok,message,status=422)=>{if(!ok)throw Object.assign(new Error(message),{status});};
export function categoryName(value){
 fail(typeof value==='string','Enter a category name.');
 const name=value.normalize('NFKC').trim().replace(/\s+/g,' ');
 fail(name.length>0&&name.length<=100&&!/[\u0000-\u001f\u007f]/.test(name),'Use a category name between 1 and 100 characters.');return name;
}
const tables={blog:'cms_blog_categories',news:'cms_news_categories'};
const tableFor=type=>{fail(Object.hasOwn(tables,type),'Unknown category type.');return tables[type];};
export async function categoryChoices(db,type,metadata={}){
 const table=tableFor(type);
 const saved=await rows(db,`SELECT id,name FROM ${table} ORDER BY name,id`);
 const ids=Array.isArray(metadata.category_ids)?metadata.category_ids.map(Number):[];
 const names=Array.isArray(metadata.categories)?metadata.categories:[metadata.category].filter(Boolean);
 return saved.map(category=>({...category,selected:ids.length?ids.includes(category.id):names.some(name=>typeof name==='string'&&name.toLocaleLowerCase()===category.name.toLocaleLowerCase())}));
}
export async function categoryMetadata(db,type,body,previous=null){
 const table=tableFor(type);
 fail(!body.category,'Choose saved categories. Create a new category from the category popup.');
 if(body.category_ids===undefined&&body.categories_present!=='1'){
  const old=previous?json(previous.metadata):{};const selected=(await categoryChoices(db,type,old||{})).filter(category=>category.selected);
  return {category_ids:selected.map(category=>category.id),categories:selected.map(category=>category.name),category:selected[0]?.name||''};
 }
 const raw=body.category_ids===undefined?[]:Array.isArray(body.category_ids)?body.category_ids:[body.category_ids];
 fail(raw.length<=20&&raw.every(id=>typeof id==='string'&&/^[1-9]\d{0,9}$/.test(id)),'Choose up to 20 saved categories.');
 const ids=[...new Set(raw.map(Number))];
 const selected=ids.length?await rows(db,`SELECT id,name FROM ${table} WHERE id IN (${ids.map(()=>'?').join(',')}) ORDER BY name,id`,ids):[];
 fail(selected.length===ids.length,'A selected category is unavailable. Reload the category list.');
 return {category_ids:selected.map(category=>category.id),categories:selected.map(category=>category.name),category:selected[0]?.name||''};
}
export async function lockCategorySelection(db,type,metadata){
 const table=tableFor(type),ids=metadata.category_ids||[];if(!ids.length)return;
 const selected=await rows(db,`SELECT id FROM ${table} WHERE id IN (${ids.map(()=>'?').join(',')}) ORDER BY id FOR UPDATE`,ids);
 fail(selected.length===ids.length,'A selected category was deleted. Reload the editor and choose saved categories.');
}
const usedBy="(JSON_CONTAINS(e.metadata,JSON_ARRAY(c.id),'$.category_ids') OR LOWER(JSON_UNQUOTE(JSON_EXTRACT(e.metadata,'$.category')))=LOWER(c.name) OR JSON_CONTAINS(e.metadata,JSON_ARRAY(c.name),'$.categories'))";
export function publishingCategoriesRouter(db){
 const router=Router();
 for(const type of Object.keys(tables)){
  const table=tableFor(type),base=`/admin/${type}-categories`,label=type==='blog'?'Blog':'News';
  router.use(base,(req,res,next)=>canEdit(req.user)?next():next(Object.assign(new Error('Publishing access required.'),{status:403})));
  const create=async(req,res)=>{
   const name=categoryName(req.body.name),conn=await db.getConnection();let category,existing=false;
   try{
    await conn.beginTransaction();
    try{const result=await rows(conn,`INSERT INTO ${table}(name,created_by) VALUES(?,?)`,[name,req.user.id]);category={id:result.insertId,name};await audit(conn,req.user,'create',`${type}_category`,category.id);}
    catch(error){if(error.code!=='ER_DUP_ENTRY')throw error;category=(await rows(conn,`SELECT id,name FROM ${table} WHERE name=? FOR UPDATE`,[name]))[0];existing=true;}
    await conn.commit();
   }catch(error){await conn.rollback();throw error;}finally{conn.release();}
   if(req.path.endsWith('/manage'))return res.redirect(`${base}/manage?saved=1`);
   res.status(existing?200:201).json({category,existing});
  };
  router.get(base,async(req,res)=>res.json({categories:(await categoryChoices(db,type)).map(({id,name})=>({id,name}))}));
  router.post(base,create);router.post(`${base}/manage`,create);
  router.get(`${base}/manage`,async(req,res)=>{
   const search=typeof req.query.q==='string'?req.query.q.trim():'';fail(search.length<=100,'Search must be at most 100 characters.');
   const categories=await rows(db,`SELECT c.id,c.name,(SELECT COUNT(*) FROM cms_entries e WHERE e.type=? AND ${usedBy}) AS uses FROM ${table} c WHERE c.name LIKE ? ORDER BY c.name,c.id`,[type,`%${search}%`]);
   res.render('publishing-categories',{categoryType:type,categoryLabel:label,categoryBase:base,categoryRows:categories,search,title:`${label} categories | Kemsor CMS`});
  });
  router.post(`${base}/:id/delete`,async(req,res)=>{
   const id=Number(req.params.id);fail(Number.isSafeInteger(id)&&id>0,'Choose a valid category.');
   const conn=await db.getConnection();
   try{
    await conn.beginTransaction();const category=(await rows(conn,`SELECT c.id,c.name FROM ${table} c WHERE c.id=? FOR UPDATE`,[id]))[0];fail(category,'Category not found.',404);
    const usage=Number((await rows(conn,`SELECT COUNT(*) AS total FROM cms_entries e JOIN ${table} c ON c.id=? WHERE e.type=? AND ${usedBy}`,[id,type]))[0].total);
    fail(!usage,`This category is used by ${usage} ${usage===1?'post':'posts'}. Remove it from those posts before deleting.`,409);
    await rows(conn,`DELETE FROM ${table} WHERE id=?`,[id]);await audit(conn,req.user,'delete',`${type}_category`,id);await conn.commit();
   }catch(error){await conn.rollback();throw error;}finally{conn.release();}
   res.redirect(`${base}/manage?saved=1`);
  });
 }return router;
}
