import {castingRoleKey} from './casting-role.js';
import {Router} from 'express';
import {rows,json,audit} from './db.js';
import {canEdit} from './security.js';
const ensure=(ok,message,status=422)=>{if(!ok)throw Object.assign(new Error(message),{status});};
const text=(value,max,label)=>{ensure(typeof value==='string'&&value.trim()&&value.trim().length<=max,`${label} is required (up to ${max} characters).`);return value.trim();};
export const castingToday=(now=new Date())=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
export function castingFields(body){
 const productionId=Number(body.production_id);ensure(Number.isSafeInteger(productionId)&&productionId>0,'Choose a production.');
 ensure(['draft','published','archived'].includes(body.status),'Choose a publishing status.');ensure(['open','closed'].includes(body.call_state),'Choose an open or closed call.');
 const deadline=text(body.deadline,10,'Deadline');const date=new Date(`${deadline}T00:00:00Z`);ensure(/^[1-9]\d{3}-\d{2}-\d{2}$/.test(deadline)&&!Number.isNaN(date.getTime())&&date.toISOString().slice(0,10)===deadline,'Choose a valid deadline.');
 const lines=text(body.roles,35000,'Roles and eligibility').split(/\r?\n/).map(line=>line.trim()).filter(Boolean);ensure(lines.length<=50,'Use up to 50 roles per call.');
 const roles=lines.map((line,index)=>{const parts=line.split('|');ensure(parts.length===2,`Role ${index+1}: use Role | Eligibility.`);return {name:text(parts[0],160,'Role name'),eligibility:text(parts[1],500,'Role eligibility')};});
 ensure(new Set(roles.map(role=>castingRoleKey(role.name))).size===roles.length,'Use distinct role names within each call.');
 return {production_id:productionId,title:text(body.title,200,'Title'),summary:text(body.summary,2000,'Summary'),requirements:text(body.requirements,10000,'Requirements and audition details'),location:text(body.location,200,'Location'),deadline,roles,call_state:body.call_state,status:body.status};
}
export function castingCallsRouter(db){
 const router=Router();
 router.get('/api/casting-calls',async(req,res)=>{
  const page=Math.max(1,Math.min(10000,Number.parseInt(req.query.page,10)||1)),limit=20,today=castingToday();
  const records=await rows(db,`SELECT c.id,c.title,c.summary,c.requirements,c.location,c.deadline,c.roles,c.call_state,p.title AS production_title,p.slug AS production_slug FROM casting_calls c JOIN cms_entries p ON p.id=c.production_id WHERE c.status='published' AND c.published_at<=UTC_TIMESTAMP() AND p.type='production' AND p.status='published' AND p.published_at<=UTC_TIMESTAMP() ORDER BY c.id DESC LIMIT ? OFFSET ?`,[limit+1,(page-1)*limit]);
  res.set('Cache-Control','no-store').json({page,hasMore:records.length>limit,calls:records.slice(0,limit).map(call=>({...call,roles:json(call.roles).map(role=>({...role,id:castingRoleKey(role.name)})),state:call.call_state==='closed'||call.deadline<today?'closed':'open'}))});
 });
 router.use('/admin/casting',(req,res,next)=>canEdit(req.user)?next():next(Object.assign(new Error('Publishing access required.'),{status:403})));
 const productions=()=>rows(db,"SELECT id,title,status FROM cms_entries WHERE type='production' ORDER BY title,id");
 router.get('/admin/casting',async(req,res)=>{
  const status=['draft','published','archived'].includes(req.query.status)?req.query.status:'';
  const page=Math.max(1,Math.min(10000,Number.parseInt(req.query.page,10)||1));
  const calls=await rows(db,"SELECT c.*,p.title AS production_title FROM casting_calls c JOIN cms_entries p ON p.id=c.production_id WHERE (?='' OR c.status=?) ORDER BY c.id DESC LIMIT 31 OFFSET ?",[status,status,(page-1)*30]);
  res.render('casting-calls',{calls:calls.slice(0,30),hasMore:calls.length>30,page,status,today:castingToday()});
 });
 router.get('/admin/casting/new',async(req,res)=>res.render('casting-edit',{call:{status:'draft',call_state:'open',roles:[]},productions:await productions()}));
 router.get('/admin/casting/:id',async(req,res)=>{
  const call=(await rows(db,'SELECT * FROM casting_calls WHERE id=?',[req.params.id]))[0];ensure(call,'Casting call not found.',404);call.roles=json(call.roles);res.render('casting-edit',{call,productions:await productions()});
 });
 router.post('/admin/casting/save',async(req,res)=>{
  const call=castingFields(req.body),id=req.body.id?Number(req.body.id):null;
  if(id!==null){ensure(Number.isSafeInteger(id)&&id>0,'Choose a valid casting call.');ensure((await rows(db,'SELECT id FROM casting_calls WHERE id=?',[id])).length,'Casting call not found.',404);}
  const production=(await rows(db,"SELECT id,status,published_at FROM cms_entries WHERE type='production' AND id=?",[call.production_id]))[0];ensure(production,'Choose an existing production.');
  if(call.status==='published')ensure(production.status==='published'&&production.published_at&&new Date(production.published_at.replace(' ','T')+'Z')<=new Date(),'Publish the linked production before publishing this casting call.');
  const values=[call.production_id,call.title,call.summary,call.requirements,call.location,call.deadline,JSON.stringify(call.roles),call.call_state,call.status];
  let savedId=id;
  if(id)await rows(db,"UPDATE casting_calls SET production_id=?,title=?,summary=?,requirements=?,location=?,deadline=?,roles=?,call_state=?,status=?,published_at=IF(?='published',COALESCE(published_at,UTC_TIMESTAMP()),published_at),updated_by=? WHERE id=?",[...values,call.status,req.user.id,id]);
  else savedId=(await rows(db,"INSERT INTO casting_calls(production_id,title,summary,requirements,location,deadline,roles,call_state,status,published_at,created_by,updated_by) VALUES(?,?,?,?,?,?,?,?,?,IF(?='published',UTC_TIMESTAMP(),NULL),?,?)",[...values,call.status,req.user.id,req.user.id])).insertId;
  await audit(db,req.user,id?'update':'create','casting_call',savedId);res.redirect(303,`/admin/casting/${savedId}?saved=1`);
 });
 return router;
}
