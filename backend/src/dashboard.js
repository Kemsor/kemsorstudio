import { rows, settings } from './db.js';
import { canEdit, canEnquire } from './security.js';
import {followUpStatuses} from './enquiry-options.js';
import {dashboardShortcuts,activityTarget,describeActivity} from './dashboard-presentation.js';
export const notificationCategories=user=>({...(canEnquire(user)?{enquiry:'Studio enquiries',application:'Career applications'}:{}),...(canEdit(user)?{draft:'Drafts and publishing'}:{}),...(user.role==='admin'?{talent:'Member reviews',setup:'Site setup reminders'}:{})});
export async function notificationPreferences(db,user){const stored=await rows(db,'SELECT category,enabled FROM cms_notification_preferences WHERE user_id=?',[user.id]);return Object.entries(notificationCategories(user)).map(([key,label])=>({key,label,enabled:stored.find(item=>item.category===key)?.enabled!==0}));}
export async function notifications(db,user,{includeMuted=false}={}) {
  const items=[];
  if(canEnquire(user)){
    const enquiries=await rows(db,'SELECT id,subject,created_at FROM cms_enquiries WHERE status="new" ORDER BY id DESC LIMIT 20');
    const applications=await rows(db,'SELECT id,name,career_title,created_at FROM career_applications WHERE status="new" ORDER BY id DESC LIMIT 20');
    for(const a of applications)items.push({key:`application:${a.id}`,tone:'amber',title:'New career application',text:`${a.name} · ${a.career_title}`,href:`/admin/applications/${a.id}`,date:a.created_at});
    for(const e of enquiries)items.push({key:`enquiry:${e.id}`,tone:'coral',title:'New studio enquiry',text:e.subject,href:`/admin/enquiries/${e.id}`,date:e.created_at});
  }
  if(canEdit(user)){
    const drafts=await rows(db,'SELECT id,title,updated_at FROM cms_entries WHERE status="draft" ORDER BY updated_at DESC LIMIT 10');
    for(const d of drafts)items.push({key:`draft:${d.id}:${d.updated_at.replace(/\D/g,'')}`,tone:'violet',title:'Draft awaiting publication',text:d.title,href:`/admin/content/${d.id}`,date:d.updated_at});
  }
  if(user.role==='admin'){
    const pending=await rows(db,"SELECT id,name,updated_at FROM talent_accounts WHERE status='pending' ORDER BY updated_at DESC LIMIT 20");
    for(const a of pending)items.push({key:`talent:${a.id}:${a.updated_at.replace(/\D/g,'')}`,tone:'violet',title:'Talent registration needs review',text:a.name,href:`/admin/talent/${a.id}`,date:a.updated_at});
    const config=await settings(db);
    if(!config.enquiries_enabled)items.push({key:'setup:enquiries',tone:'amber',title:'Enquiry form is switched off',text:'Add the approved privacy notice and enable submissions when ready.',href:'/admin/settings',date:null});
    if(!config.facebook || !config.instagram || !config.youtube || !config.linkedin)items.push({key:'setup:socials',tone:'mint',title:'Connect the studio’s social profiles',text:'Complete Facebook, Instagram, YouTube and LinkedIn links.',href:'/admin/settings',date:null});
  }
  // Keep snapshots independently of current tasks and notification preferences.
  const conn=await db.getConnection();
  try{
    await conn.beginTransaction();await rows(conn,'SELECT id FROM cms_users WHERE id=? FOR UPDATE',[user.id]);
    await rows(conn,'UPDATE cms_notification_history SET active=0 WHERE user_id=?',[user.id]);
    for(const item of items){const category=item.key.split(':')[0],source=Number(item.key.split(':')[1]);
      await rows(conn,'INSERT INTO cms_notification_history(user_id,notification_key,category,source_id,tone,title,text,href,event_date,active) VALUES(?,?,?,?,?,?,?,?,?,1) ON DUPLICATE KEY UPDATE active=1,title=VALUES(title),text=VALUES(text),href=VALUES(href)',[user.id,item.key,category,Number.isSafeInteger(source)&&source>0?source:null,item.tone,item.title,item.text,item.href,item.date]);
    }
    await conn.commit();
  }catch(error){await conn.rollback();throw error;}finally{conn.release();}
  const preferences=await notificationPreferences(db,user),allowed=new Set(preferences.filter(item=>includeMuted||item.enabled).map(item=>item.key));
  const read=await rows(db,'SELECT notification_key FROM cms_notification_reads WHERE user_id=?',[user.id]);const keys=new Set(read.map(r=>r.notification_key));
  const history=await rows(db,'SELECT * FROM cms_notification_history WHERE user_id=? ORDER BY active DESC,COALESCE(event_date,first_seen_at) DESC LIMIT 200',[user.id]);
  return history.filter(item=>allowed.has(item.category)).map(item=>({key:item.notification_key,tone:item.tone,title:item.title,text:item.text,href:item.href,date:item.event_date,active:Boolean(item.active),read:keys.has(item.notification_key)||!item.active})).sort((a,b)=>Number(a.read)-Number(b.read)||String(b.date||'').localeCompare(String(a.date||'')));

}
export async function dashboard(db,user){
  const publishing=canEdit(user),inbox=canEnquire(user);
  const counts=publishing ? await rows(db,'SELECT type,status,COUNT(*) AS total FROM cms_entries WHERE type<>"legal" GROUP BY type,status') : [];
  const enquiryCounts=inbox ? await rows(db,'SELECT status,COUNT(*) AS total FROM cms_enquiries GROUP BY status') : [];
  const applicationCounts=inbox?await rows(db,'SELECT status,COUNT(*) AS total FROM career_applications GROUP BY status'):[];
  const totalFor=(list,status)=>list.filter(r=>r.status===status).reduce((n,r)=>n+Number(r.total),0);
  const metrics=[];
  if(publishing){metrics.push({label:'Published stories & content',value:totalFor(counts,'published'),hint:'Published records',href:'/admin/content?type=all&status=published',tone:'violet',icon:'news'},{label:'Drafts in the making',value:totalFor(counts,'draft'),hint:'Your next updates',href:'/admin/content?type=all&status=draft',tone:'amber',icon:'blog'});}
  if(inbox){metrics.push({label:'New enquiries',value:totalFor(enquiryCounts,'new'),hint:'Ready for a first response',href:'/admin/enquiries?section=all&status=new',tone:'coral',icon:'enquiries'},{label:'Follow-ups in progress',value:followUpStatuses.reduce((total,status)=>total+totalFor(enquiryCounts,status),0),hint:'Keep the conversation moving',href:'/admin/enquiries?section=all&status=follow_up',tone:'mint',icon:'followup'});}
  if(inbox)metrics.push({label:'New career applications',value:totalFor(applicationCounts,'new'),hint:'Review candidates and respond',href:'/admin/applications?status=new',tone:'coral',icon:'career'});
  const registrations=user.role==='admin'?await rows(db,'SELECT status,COUNT(*) AS total FROM talent_accounts GROUP BY status'):[];
  const recentRegistrations=user.role==='admin'?await rows(db,'SELECT id,name,role,specialty,status,created_at FROM talent_accounts ORDER BY id DESC LIMIT 5'):[];
  if(user.role==='admin')metrics.push({label:'All registrations',value:registrations.reduce((n,r)=>n+Number(r.total),0),hint:'Artists, crew and film professionals',href:'/admin/talent',tone:'violet',icon:'team'},{label:'Profiles awaiting review',value:totalFor(registrations,'pending'),hint:'Check contact details and approve',href:'/admin/talent?status=pending',tone:'amber',icon:'review'});
  const recentContent=publishing ? await rows(db,'SELECT e.id,e.type,e.title,e.status,e.updated_at,u.name AS editor FROM cms_entries e LEFT JOIN cms_users u ON u.id=e.updated_by WHERE e.type<>"legal" ORDER BY e.updated_at DESC,e.id DESC LIMIT 6') : [];
  const recentEnquiries=inbox ? await rows(db,'SELECT id,subject,name,category,status,created_at FROM cms_enquiries ORDER BY id DESC LIMIT 5') : [];
  const activityRows=user.role==='admin' ? await rows(db,'SELECT a.*,u.name FROM cms_audit a LEFT JOIN cms_users u ON u.id=a.user_id ORDER BY a.id DESC LIMIT 6') : await rows(db,'SELECT a.*,u.name FROM cms_audit a LEFT JOIN cms_users u ON u.id=a.user_id WHERE a.user_id=? ORDER BY a.id DESC LIMIT 6',[user.id]);
  const activity=await Promise.all(activityRows.map(async event=>{
    const target=activityTarget(event,user);
    const record=target.query&&!/^delete/.test(event.action)?(await rows(db,target.query,[target.id]))[0]:null;
    if(target.query&&!record)target.href=target.list;
    return describeActivity(event,user,target,record?.title);
  }));
  const priorities=['New enquiries','New career applications','Profiles awaiting review','Drafts in the making'];
  const attentionTasks=priorities.map(label=>metrics.find(metric=>metric.label===label)).filter(Boolean);
  metrics.sort((a,b)=>(priorities.includes(a.label)?priorities.indexOf(a.label):100)-(priorities.includes(b.label)?priorities.indexOf(b.label):100));
  const attentionTotal=attentionTasks.reduce((total,item)=>total+item.value,0);
  const nextTask=attentionTasks.find(item=>item.value>0)||null;
  const shortcuts=dashboardShortcuts(user);
  const weekly=await rows(db,'SELECT DATE(created_at) AS day,COUNT(*) AS total FROM cms_audit WHERE created_at>=UTC_DATE()-INTERVAL 6 DAY AND (?="admin" OR user_id=?) GROUP BY DATE(created_at)',[user.role,user.id]);
  const days=await rows(db,'SELECT UTC_DATE() AS today');
  const today=new Date(`${days[0].today}T00:00:00Z`);
  const series=Array.from({length:7},(_,i)=>{const date=new Date(today);date.setUTCDate(date.getUTCDate()-6+i);const iso=date.toISOString().slice(0,10);return {label:date.toLocaleDateString('en-IN',{weekday:'short',timeZone:'UTC'}),total:Number(weekly.find(r=>r.day===iso)?.total || 0)};});
  const media=publishing ? Number((await rows(db,'SELECT COUNT(*) AS total FROM cms_media'))[0].total) : 0;
  return {attentionTasks,attentionTotal,nextTask,shortcuts,recentRegistrations,publishing,inbox,counts,enquiryCounts,metrics,recentContent,recentEnquiries,activity,series,media,weeklyTotal:series.reduce((n,d)=>n+d.total,0)};
}
