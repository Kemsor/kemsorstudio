import {captureEntryRevision} from './content-revisions.js';
import {statuses} from './enquiry-options.js';
import {Router} from 'express';
import {rows,audit} from './db.js';
import {canEdit,canEnquire} from './security.js';
export function tableView(req,total,columns,defaultSort,filters={},defaultDirection='desc'){
 const sort=Object.hasOwn(columns,req.query.sort)?req.query.sort:defaultSort;
 const dir=req.query.dir==='asc'?'asc':req.query.dir==='desc'?'desc':defaultDirection;
 const limit=[25,50,100].includes(Number(req.query.per_page))?Number(req.query.per_page):25;
 const pages=Math.max(1,Math.ceil(total/limit));const requested=Number(req.query.p||req.query.page)||1;
 const page=Math.min(pages,Math.max(1,Number.isFinite(requested)?Math.floor(requested):1));
 const params={...filters,sort,dir,per_page:String(limit)};
 const link=(changes={})=>{const q=new URLSearchParams();for(const [key,val]of Object.entries({...params,p:String(page),...changes}))if(val!==''&&val!==undefined&&val!==null)q.set(key,String(val));return `${req.path}?${q}`;};
 const filterLabels={q:'Search',status:'Status',category:'Category',role:'Role',owner:'Owner',priority:'Priority',due:'Follow-up'};
 const activeFilters=Object.entries(filterLabels).filter(([key])=>filters[key]!=null&&filters[key]!=='').map(([key,label])=>({key,label,value:key==='q'?String(filters[key]):({me:'Assigned to me',unassigned:'Unassigned',overdue:'Overdue',upcoming:'Next 7 days',unscheduled:'Not scheduled'})[filters[key]]||String(filters[key]).replaceAll('_',' '),removeLink:link({[key]:'',p:1})}));
 const resetLink=link({...Object.fromEntries(Object.keys(filterLabels).map(key=>[key,''])),p:1});
 return {sort,dir,limit,page,pages,total,from:total?(page-1)*limit+1:0,to:Math.min(page*limit,total),offset:(page-1)*limit,columns,filters,link,activeFilters,resetLink,order:`${columns[sort]} ${dir.toUpperCase()}, id DESC`,key:`${req.path}:${filters.type||''}:${filters.page||''}:${filters.role||''}`};
}
export function bulkRouter(db){
 const router=Router();
 const resources={content:{table:'cms_entries',access:canEdit,states:['draft','archived'],path:'/admin/content'},enquiries:{table:'cms_enquiries',access:canEnquire,states:statuses.filter(status=>status!=='assigned'),path:'/admin/enquiries'},applications:{table:'career_applications',access:canEnquire,states:['new','reviewing','shortlisted','rejected'],path:'/admin/applications'},members:{table:'talent_accounts',access:user=>user?.role==='admin',states:['pending','suspended'],path:'/admin/talent'}};
 router.post('/admin/tables/:resource/bulk',async(req,res)=>{
  const config=Object.hasOwn(resources,req.params.resource)?resources[req.params.resource]:null;if(!config||!config.access(req.user))throw Object.assign(new Error('Access denied.'),{status:403});
  const raw=Array.isArray(req.body.ids)?req.body.ids:[req.body.ids];const ids=[...new Set(raw.map(Number))];
  if(!ids.length||ids.length>100||ids.some(id=>!Number.isSafeInteger(id)||id<=0))throw Object.assign(new Error('Select between 1 and 100 valid records.'),{status:422});
  if(!config.states.includes(req.body.status))throw Object.assign(new Error('Choose a valid bulk action.'),{status:422});
  const returnUrl=new URL(typeof req.body.return_to==='string'?req.body.return_to:config.path,'http://local');
  if(returnUrl.origin!=='http://local'||returnUrl.pathname!==config.path)throw Object.assign(new Error('Invalid return page.'),{status:422});
  const conn=await db.getConnection();
  try{
   await conn.beginTransaction();const placeholders=ids.map(()=>'?').join(',');
   const selected=await rows(conn,`SELECT ${req.params.resource==='content'?'*':'id,status'} FROM ${config.table} WHERE id IN (${placeholders}) FOR UPDATE`,ids);
   if(req.params.resource==='content'&&selected.some(record=>record.type==='legal'))throw Object.assign(new Error('Use the managed legal editor for legal documents.'),{status:422});
   if(selected.length!==ids.length)throw Object.assign(new Error('One or more selected records no longer exist. Refresh the table and try again.'),{status:422});
   if(req.params.resource==='content')for(const record of selected)await captureEntryRevision(conn,record,'before-change',record.updated_by,{initial:true});
   const extra=req.params.resource==='content'?',updated_by=?,revision=revision+1':'';
   await rows(conn,`UPDATE ${config.table} SET status=?${extra} WHERE id IN (${placeholders})`,[req.body.status,...(extra?[req.user.id]:[]),...ids]);
   if(req.params.resource==='content'){const changed=await rows(conn,`SELECT * FROM cms_entries WHERE id IN (${placeholders})`,ids);for(const record of changed)await captureEntryRevision(conn,record,`bulk-${req.body.status}`,req.user.id);}
   if(req.params.resource==='enquiries')for(const record of selected)if(record.status!==req.body.status)await rows(conn,'INSERT INTO cms_enquiry_history(enquiry_id,user_id,from_status,to_status) VALUES(?,?,?,?)',[record.id,req.user.id,record.status,req.body.status]);
   if(req.params.resource==='applications')for(const record of selected)if(record.status!==req.body.status)await rows(conn,'INSERT INTO career_application_history(application_id,user_id,from_status,to_status) VALUES(?,?,?,?)',[record.id,req.user.id,record.status,req.body.status]);
   for(const id of ids){if(req.params.resource==='members'&&req.body.status==='suspended')await rows(conn,"DELETE FROM cms_sessions WHERE JSON_EXTRACT(data,'$.memberId')=?",[id]);await audit(conn,req.user,`bulk_${req.body.status}`,req.params.resource,id,{changes:[{field:'Status',before:selected.find(record=>record.id===id)?.status??null,after:req.body.status}]});}
   await conn.commit();
  }catch(error){await conn.rollback();throw error;}finally{conn.release();}
  returnUrl.searchParams.set('saved','1');res.redirect(returnUrl.pathname+returnUrl.search);
 });return router;
}
