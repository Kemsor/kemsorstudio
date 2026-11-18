import {workflowFields} from './enquiry-options.js';
import {rows} from './db.js';
export const closedStatuses={enquiry:['converted','rejected','closed','spam'],application:['rejected']};
export function workflowFilters(query,userId,resource){
 const owner=['me','unassigned'].includes(query.owner)?query.owner:'',priority=['low','normal','high','urgent'].includes(query.priority)?query.priority:'',due=['overdue','upcoming','unscheduled'].includes(query.due)?query.due:'';
 const clauses=[],params=[];
 if(owner==='me'){clauses.push('assigned_to=?');params.push(userId);}else if(owner==='unassigned')clauses.push('assigned_to IS NULL');
 if(priority){clauses.push('priority=?');params.push(priority);}
 const active=`status NOT IN (${closedStatuses[resource].map(status=>`'${status}'`).join(',')})`;
 const withoutDue=clauses.length?clauses.join(' AND '):'1=1';
 if(due==='overdue')clauses.push(`${active} AND follow_up_at<UTC_TIMESTAMP()`);
 if(due==='upcoming')clauses.push(`${active} AND follow_up_at>=UTC_TIMESTAMP() AND follow_up_at<DATE_ADD(UTC_TIMESTAMP(),INTERVAL 7 DAY)`);
 if(due==='unscheduled')clauses.push(`${active} AND follow_up_at IS NULL`);
 return {owner,priority,due,where:clauses.length?clauses.join(' AND '):'1=1',withoutDue,params,active};
}
export function followUpOrder(resource){return `CASE WHEN status IN (${closedStatuses[resource].map(status=>`'${status}'`).join(',')}) OR follow_up_at IS NULL THEN '9999-12-31 23:59:59' ELSE follow_up_at END`;}
export function followUpState(record,resource,now=new Date()){
 if(closedStatuses[resource].includes(record.status))return {key:'complete',label:'Complete'};
 if(!record.follow_up_at)return {key:'unscheduled',label:'Not scheduled'};
 return new Date(String(record.follow_up_at).replace(' ','T')+'Z')<now?{key:'overdue',label:'Overdue'}:{key:'upcoming',label:'Upcoming'};
}
export function workflowReturn(value,resource){
 const path=resource==='application'?'/admin/applications':'/admin/enquiries';
 const fallback=path+(resource==='enquiry'?'?section=all':'');
 if(typeof value!=='string'||value.length>2500)return fallback;
 try{const url=new URL(value,'http://local');return url.origin==='http://local'&&url.pathname===path?url.pathname+url.search:fallback;}catch{return fallback;}
}
export function workflowRecordUrl(resource,id,returnTo,saved=false){
 const base=`/admin/${resource==='application'?'applications':'enquiries'}/${id}`;
 const query=new URLSearchParams();if(saved)query.set('saved','1');if(returnTo)query.set('return_to',workflowReturn(returnTo,resource));return base+(query.size?'?'+query:'');
}
export function workflowDetails(body,old={}){
 const details=workflowFields({priority:body.priority??old.priority,tags:body.tags??old.tags,source:body.source??old.source,follow_up_at:body.follow_up_at});
 if(body.follow_up_at===undefined)details.followUp=old.follow_up_at||null;
 const nextAction=body.next_action===undefined?(old.next_action||''):body.next_action;
 if(typeof nextAction!=='string'||nextAction.trim().length>500)throw Object.assign(new Error('Use a next action of up to 500 characters.'),{status:422});
 const raw=body.assigned_to===undefined?old.assigned_to:body.assigned_to;
 const assigned=raw===null||raw===undefined||raw===''?null:Number(raw);
 if(assigned!==null&&(!Number.isSafeInteger(assigned)||assigned<1))throw Object.assign(new Error('Choose a valid staff member.'),{status:422});
 return {...details,assigned,nextAction:nextAction.trim()};
}
export function workflowChanges(old,details){
 const values={assigned_to:details.assigned,priority:details.priority,follow_up_at:details.followUp,next_action:details.nextAction};
 return Object.fromEntries(Object.entries(values).filter(([key,value])=>(old[key]??(key==='next_action'?'':null))!==value).map(([key,to])=>[key,{from:old[key]??null,to}]));
}
export async function workflowSummary(db,table,where,params,active){
 const result=(await rows(db,`SELECT COALESCE(SUM(${active} AND follow_up_at<UTC_TIMESTAMP()),0) AS overdue,COALESCE(SUM(${active} AND follow_up_at>=UTC_TIMESTAMP() AND follow_up_at<DATE_ADD(UTC_TIMESTAMP(),INTERVAL 7 DAY)),0) AS upcoming,COALESCE(SUM(${active} AND assigned_to IS NULL),0) AS unassigned FROM ${table} WHERE ${where}`,params))[0];
 return Object.fromEntries(Object.entries(result).map(([key,value])=>[key,Number(value)]));
}
export async function recordTimeline(db,resource,record,notes,history,users=[]){
 const prefix=resource==='enquiry'?'KEM':'APP';
 const replies=await rows(db,`SELECT o.id,o.subject,o.body,o.status,o.created_at,o.sent_at,o.last_error,u.name AS staff_name FROM cms_email_outbox o LEFT JOIN cms_audit a ON a.action='compose_reply' AND a.target_type='email' AND a.target_id=CAST(o.id AS CHAR) LEFT JOIN cms_users u ON u.id=a.user_id WHERE o.receipt_key LIKE ? ORDER BY o.id DESC`,[`${prefix}-${String(record.id).padStart(6,'0')}-REPLY-%`]);
 const names=new Map(users.map(user=>[Number(user.id),user.name]));
 const format=(key,value)=>value===null||value===''?'Not set':key==='assigned_to'?(names.get(Number(value))||'Staff #'+value):String(value).replaceAll('_',' ');
 const events=[{id:0,kind:'received',date:record.created_at,title:resource==='enquiry'?'Enquiry received':'Application submitted',actor:record.name,changes:[]}];
 for(const note of notes)events.push({id:note.id,kind:'note',date:note.created_at,title:'Internal note',actor:note.name||note.staff_name||'Former staff member',body:note.note,changes:[]});
 for(const event of history){let changes={};try{changes=typeof event.changes==='string'?JSON.parse(event.changes):event.changes||{};}catch{}
  const statusChanged=event.from_status!==event.to_status;
  const labels={assigned_to:'Owner',priority:'Priority',follow_up_at:'Follow-up (UTC)',next_action:'Next action'};
  const details=Object.entries(changes).filter(([key])=>key in labels).map(([key,value])=>`${labels[key]}: ${format(key,value.from)} → ${format(key,value.to)}`);
  if(statusChanged)details.unshift(`Status: ${(event.from_status||'new').replaceAll('_',' ')} → ${event.to_status.replaceAll('_',' ')}`);
  if(!Object.keys(changes).length&&event.assigned_to)details.push('Owner: '+format('assigned_to',event.assigned_to));
  events.push({id:event.id,kind:'change',date:event.created_at,title:statusChanged?'Status updated':'Follow-up updated',actor:event.name||event.staff_name||'Former staff member',changes:details});
 }
 for(const reply of replies)events.push({id:reply.id,kind:'email',date:reply.created_at,title:reply.subject,actor:reply.staff_name||'Staff member',body:reply.body,delivery:reply.status,sentAt:reply.sent_at,changes:[],error:reply.last_error});
 return events.sort((a,b)=>String(b.date).localeCompare(String(a.date))||(a.kind==='received'?1:b.kind==='received'?-1:b.id-a.id));
}
