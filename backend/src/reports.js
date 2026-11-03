import {Router} from 'express';
import {rows,audit} from './db.js';
import {canEdit,canEnquire} from './security.js';
import {categories,statuses} from './enquiry-options.js';
export const reportResources={
 enquiries:{label:'Enquiries',description:'Review studio enquiries, follow-up stages, priorities and sources.',icon:'enquiries',table:'cms_enquiries',access:canEnquire,statuses,columns:['id','name','email','category','subject','status','priority','assigned_to','source','follow_up_at','created_at'],search:['name','email','subject','tags','source']},
 applications:{label:'Career applications',description:'Review applications by opportunity, location and recruitment status.',icon:'career',table:'career_applications',access:canEnquire,statuses:['new','reviewing','shortlisted','rejected'],columns:['id','name','email','career_title','city','team','application_type','status','portfolio_url','created_at'],search:['name','email','career_title']},
 content:{label:'Publishing',description:'Review news, blog posts, career listings and other CMS content entries.',icon:'news',table:'cms_entries',access:canEdit,statuses:['draft','published','archived'],columns:['id','type','title','slug','status','published_at','updated_at','created_at'],search:['title','slug']},
 activity:{label:'Admin activity',description:'Review recorded staff actions and administrative activity.',icon:'audit',table:'cms_audit',access:user=>user?.role==='admin',statuses:[],columns:['id','user_id','action','target_type','target_id','created_at'],search:['action','target_type','target_id']},
 registrations:{label:'Member registrations',description:'Review artist and professional registrations, departments and approval status.',icon:'team',table:'talent_accounts',access:user=>user?.role==='admin',statuses:['pending','approved','suspended'],columns:['id','name','email','role','department','specialty','city','status','visible','contact_checked','created_at'],search:['name','email','city','department','specialty']},
 talent:{label:'Talent enquiries',description:'Review member-to-artist project enquiries and recorded responses.',icon:'enquiries',table:'talent_enquiries',access:user=>user?.role==='admin',statuses:['new','interested','declined'],columns:['id','sender_id','artist_id','project','status','created_at'],search:['project']},
 projects:{label:'Production projects',description:'Review member-owned planning projects, budgets, languages and timelines. Private scripts and planning notes are excluded.',icon:'production',table:'production_projects',access:user=>user?.role==='admin',statuses:[],group:'currency',columns:['id','account_id','title','budget','currency','language','timeline','created_at','updated_at'],search:['title','language','currency']}

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
 const allowedFor=user=>Object.entries(reportResources).filter(([,config])=>config.access(user));
 const renderReport=async(req,res)=>{
  const allowed=allowedFor(req.user);
  if(!allowed.length)fail('Report access required.',403);
  const type=req.params.type||req.query.type||allowed[0][0];
  if(!Object.hasOwn(reportResources,type)||!reportResources[type].access(req.user))fail('You do not have access to this report.',403);
  const config=reportResources[type],reportUrl=`/admin/reports/${type}`;
  const filters=reportFilters(req.query,config),clauses=['created_at>=?','created_at<DATE_ADD(?,INTERVAL 1 DAY)'],params=[filters.from,filters.to];
  if(filters.status){clauses.push('status=?');params.push(filters.status)}
  if(filters.category){clauses.push('category=?');params.push(filters.category)}
  if(filters.q){clauses.push('('+config.search.map(column=>`${column} LIKE ?`).join(' OR ')+')');params.push(...config.search.map(()=>`%${filters.q}%`))}
  const where='WHERE '+clauses.join(' AND '),total=Number((await rows(db,`SELECT COUNT(*) AS total FROM ${config.table} ${where}`,params))[0].total);
  const group=config.group||(config.statuses.length?'status':'action');
  const summary=await rows(db,`SELECT ${group} AS label,COUNT(*) AS total FROM ${config.table} ${where} GROUP BY ${group} ORDER BY total DESC,label`,params);
  const download=req.path.endsWith('.csv');
  if(download&&total>50000)fail('This report contains more than 50,000 rows. Narrow the filters before downloading.');
  const perPage=[25,50,100].includes(Number(req.query.per_page))?Number(req.query.per_page):50;
  const pages=Math.max(1,Math.ceil(total/perPage));
  const requested=Number(req.query.p)||1,page=Number.isFinite(requested)?Math.min(pages,Math.max(1,Math.floor(requested))):1;
  const records=await rows(db,`SELECT ${config.columns.join(',')} FROM ${config.table} ${where} ORDER BY created_at DESC,id DESC LIMIT ${download?50000:perPage}${download?'':` OFFSET ${(page-1)*perPage}`}`,params);
  const query=new URLSearchParams(filters);
  if(download){await audit(db,req.user,'download_report',type,String(total));return res.set({'Content-Type':'text/csv; charset=utf-8','Content-Disposition':`attachment; filename="kemsor-${type}-${filters.from}-to-${filters.to}.csv"`}).send('\uFEFF'+[config.columns.map(csvCell).join(','),...records.map(record=>config.columns.map(column=>csvCell(record[column])).join(','))].join('\r\n'))}
  const pageUrl=value=>`${reportUrl}?${new URLSearchParams({...filters,per_page:String(perPage),p:String(value)})}`;
  res.render('reports',{report:config,reportType:type,reportUrl,reportOptions:allowed.map(([value,{label}])=>({value,label})),filters,categories,records,total,summary,page,pages,perPage,pageUrl,downloadUrl:`${reportUrl}/download.csv?${query}`});
 };
 router.get('/admin/reports',async(req,res)=>{
  const allowed=allowedFor(req.user);if(!allowed.length)fail('Report access required.',403);
  // Preserve existing bookmarked filters and report links.
  if(Object.keys(req.query).some(key=>['type','from','to','status','category','q','p','per_page'].includes(key)))return renderReport(req,res);
  res.render('reports-index',{reports:allowed.map(([key,config])=>({key,...config}))});
 });
 router.get('/admin/reports/download.csv',renderReport);
 router.get('/admin/reports/:type/download.csv',renderReport);
 router.get('/admin/reports/:type',renderReport);
 return router;
}
