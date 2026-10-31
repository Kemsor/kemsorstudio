import {Router} from 'express';
import {rows,audit} from './db.js';
import {canEdit,canEnquire} from './security.js';
import {categories,statuses} from './enquiry-options.js';
const resources={
 enquiries:{label:'Enquiries',table:'cms_enquiries',access:canEnquire,statuses,columns:['id','name','email','category','subject','status','priority','assigned_to','source','follow_up_at','created_at'],search:['name','email','subject','tags','source']},
 applications:{label:'Career applications',table:'career_applications',access:canEnquire,statuses:['new','reviewing','shortlisted','rejected'],columns:['id','name','email','career_title','city','status','portfolio_url','created_at'],search:['name','email','career_title']},
 content:{label:'Publishing',table:'cms_entries',access:canEdit,statuses:['draft','published','archived'],columns:['id','type','title','slug','status','published_at','updated_at','created_at'],search:['title','slug']},
 activity:{label:'Admin activity',table:'cms_audit',access:user=>user?.role==='admin',statuses:[],columns:['id','user_id','action','target_type','target_id','created_at'],search:['action','target_type','target_id']}
};
const fail=(message,status=422)=>{throw Object.assign(new Error(message),{status})};
export function csvCell(value){let text=String(value??'');if(/^\s*[=+@-]/.test(text)||/^[\t\r\n]/.test(text))text="'"+text;return '"'+text.replaceAll('"','""')+'"'}
const day=value=>/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;
export function reportFilters(query,config){
 const end=query.to||new Date().toISOString().slice(0,10),start=query.from||new Date(Date.now()-29*86400000).toISOString().slice(0,10);
 if(!day(start)||!day(end)||start>end)fail('Choose a valid start and end date.');
 const status=query.status||'',category=query.category||'',search=typeof query.q==='string'?query.q.trim():'';
 if(status&&!config.statuses.includes(status))fail('Choose a valid report status.');
 if(category&&!Object.hasOwn(categories,category))fail('Choose a valid enquiry category.');
 if(search.length>100)fail('Search must be at most 100 characters.');
 return {from:start,to:end,status,category:config.table==='cms_enquiries'?category:'',q:search};
}
export function reportsRouter(db){
 const router=Router();
 router.get(['/admin/reports','/admin/reports/download.csv'],async(req,res)=>{
  const allowed=Object.entries(resources).filter(([,config])=>config.access(req.user));
  if(!allowed.length)fail('Report access required.',403);
  const type=req.query.type||allowed[0][0],config=resources[type];
  if(!Object.hasOwn(resources,type)||!config.access(req.user))fail('You do not have access to this report.',403);
  const filters=reportFilters(req.query,config),clauses=['created_at>=?','created_at<DATE_ADD(?,INTERVAL 1 DAY)'],params=[filters.from,filters.to];
  if(filters.status){clauses.push('status=?');params.push(filters.status)}
  if(filters.category){clauses.push('category=?');params.push(filters.category)}
  if(filters.q){clauses.push('('+config.search.map(column=>`${column} LIKE ?`).join(' OR ')+')');params.push(...config.search.map(()=>`%${filters.q}%`))}
  const where='WHERE '+clauses.join(' AND '),total=Number((await rows(db,`SELECT COUNT(*) AS total FROM ${config.table} ${where}`,params))[0].total);
  const group=config.statuses.length?'status':'action';
  const summary=await rows(db,`SELECT ${group} AS label,COUNT(*) AS total FROM ${config.table} ${where} GROUP BY ${group} ORDER BY total DESC,label`,params);
  const download=req.path.endsWith('.csv');
  if(download&&total>50000)fail('This report contains more than 50,000 rows. Narrow the filters before downloading.');
  const records=await rows(db,`SELECT ${config.columns.join(',')} FROM ${config.table} ${where} ORDER BY created_at DESC,id DESC LIMIT ${download?50000:100}`,params);
  const query=new URLSearchParams({type,...filters});
  if(download){await audit(db,req.user,'download_report',type,String(total));return res.set({'Content-Type':'text/csv; charset=utf-8','Content-Disposition':`attachment; filename="kemsor-${type}-${filters.from}-to-${filters.to}.csv"`}).send('\uFEFF'+[config.columns.map(csvCell).join(','),...records.map(record=>config.columns.map(column=>csvCell(record[column])).join(','))].join('\r\n'))}
  res.render('reports',{report:config,reportType:type,reportOptions:allowed.map(([value,{label}])=>({value,label})),filters,categories,records,total,summary,downloadUrl:`/admin/reports/download.csv?${query}`});
 });
 return router;
}
