import {Router} from 'express';
import {rows,json} from './db.js';
import {tableView} from './admin-tables.js';
import {activityTarget,describeActivity} from './dashboard-presentation.js';

const fail=(ok,message)=>{if(!ok)throw Object.assign(new Error(message),{status:422});};
const day=value=>/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;
export function auditFilters(query){
 const text=(key,max)=>{fail(query[key]===undefined||typeof query[key]==='string',`Choose a valid ${key} filter.`);const value=(query[key]||'').trim();fail(value.length<=max,`${key} filter is too long.`);return value;};
 const filters={q:text('q',100),actor:text('actor',20),action:text('action',100),module:text('module',50),from:text('from',10),to:text('to',10)};
 fail(!filters.actor||['system','former'].includes(filters.actor)||/^[1-9]\d{0,9}$/.test(filters.actor),'Choose a valid staff member.');
 fail(!filters.from||day(filters.from),'Choose a valid start date.');fail(!filters.to||day(filters.to),'Choose a valid end date.');fail(!filters.from||!filters.to||filters.from<=filters.to,'The end date must be on or after the start date.');
 const clauses=[],values=[];
 if(filters.q){clauses.push('(u.name LIKE ? OR a.action LIKE ? OR a.target_type LIKE ? OR a.target_id LIKE ? OR CAST(a.details AS CHAR) LIKE ?)');values.push(...Array(5).fill(`%${filters.q}%`));}
 if(filters.actor==='system')clauses.push('a.user_id IS NULL');else if(filters.actor==='former')clauses.push('a.user_id IS NOT NULL AND u.id IS NULL');else if(filters.actor){clauses.push('a.user_id=?');values.push(Number(filters.actor));}
 for(const [key,column] of [['action','action'],['module','target_type']])if(filters[key]){clauses.push(`a.${column}=?`);values.push(filters[key]);}
 if(filters.from){clauses.push('a.created_at>=?');values.push(filters.from);}
 if(filters.to){clauses.push('a.created_at<DATE_ADD(?,INTERVAL 1 DAY)');values.push(filters.to);}
 return {filters,where:clauses.length?'WHERE '+clauses.join(' AND '):'',values};
}
const stable=value=>JSON.stringify(value??null);
export function contentAuditDetails(before,after){
 const changes=[];
 for(const [key,field] of [['title','Title'],['slug','URL slug'],['status','Publishing status'],['image_id','Image']])if(stable(before?.[key])!==stable(after[key]))changes.push({field,before:before?.[key]??null,after:after[key]??null});
 for(const [key,field] of [['summary','Summary'],['body','Body'],['metadata','Publishing details and formatting']])if(stable(before?.[key])!==stable(after[key]))changes.push({field});
 return {changes,revision:after.revision};
}
export function auditChangeRows(details){
 let parsed;try{parsed=json(details);}catch{return [];}
 return Array.isArray(parsed?.changes)?parsed.changes.slice(0,50).filter(change=>typeof change?.field==='string').map(change=>({field:change.field.slice(0,120),hasValues:Object.hasOwn(change,'before')&&Object.hasOwn(change,'after'),before:String(change.before??'Not set').slice(0,300),after:String(change.after??'Not set').slice(0,300)})):[];
}
export function auditLogRouter(db){
 const router=Router();
 router.get('/admin/audit',async(req,res)=>{
  if(req.user?.role!=='admin')throw Object.assign(new Error('Administrator access required.'),{status:403});
  const {filters,where,values}=auditFilters(req.query),join='FROM cms_audit a LEFT JOIN cms_users u ON u.id=a.user_id';
  const total=Number((await rows(db,`SELECT COUNT(*) AS total ${join} ${where}`,values))[0].total);
  const table=tableView(req,total,{time:'a.id'},'time',filters);
  const [records,staff,actions,modules]=await Promise.all([
   rows(db,`SELECT a.*,u.name ${join} ${where} ORDER BY a.id DESC LIMIT ? OFFSET ?`,[...values,table.limit,table.offset]),
   rows(db,'SELECT id,name,active FROM cms_users ORDER BY name,id'),
   rows(db,'SELECT DISTINCT action FROM cms_audit ORDER BY action'),rows(db,'SELECT DISTINCT target_type FROM cms_audit ORDER BY target_type'),
  ]);
  const events=records.map(event=>{
   const target=activityTarget(event,req.user),presented=describeActivity(event,req.user,target);
   // Missing actors are explicit; older records do not establish whether a deleted user or automation acted.
   if(event.action.startsWith('access_'))presented.actionLabel='Changed staff access';
   presented.actor=event.name||(event.user_id?'Former staff member':'System / member / unavailable');
   if(presented.href==='/admin/audit')presented.href=null;
   return {...presented,changes:auditChangeRows(event.details),hasChangeDetails:event.details!==null,historyUrl:event.target_type==='content'&&!/^delete/.test(event.action)&&/^\d+$/.test(event.target_id)?`/admin/content/${event.target_id}/revisions`:null};
  });
  res.render('audit',{events,filters,table,staff,actions:actions.map(row=>row.action),modules:modules.map(row=>row.target_type),title:'Activity log | Kemsor CMS'});
 });return router;
}
