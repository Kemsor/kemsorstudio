import { rows, settings } from './db.js';
import { canEdit, canEnquire } from './security.js';
export async function notifications(db,user) {
  const items=[];
  if(canEnquire(user)){
    const enquiries=await rows(db,'SELECT id,subject,created_at FROM cms_enquiries WHERE status="new" ORDER BY id DESC LIMIT 20');
    for(const e of enquiries)items.push({key:`enquiry:${e.id}`,tone:'coral',title:'New studio enquiry',text:e.subject,href:`/admin/enquiries/${e.id}`,date:e.created_at});
  }
  if(canEdit(user)){
    const drafts=await rows(db,'SELECT id,title,updated_at FROM cms_entries WHERE status="draft" ORDER BY updated_at DESC LIMIT 10');
    for(const d of drafts)items.push({key:`draft:${d.id}:${d.updated_at.replace(/\D/g,'')}`,tone:'violet',title:'Draft awaiting publication',text:d.title,href:`/admin/content/${d.id}`,date:d.updated_at});
  }
  if(user.role==='admin'){
    const pending=await rows(db,"SELECT id,name,updated_at FROM talent_accounts WHERE status='pending' ORDER BY updated_at DESC LIMIT 20");
    for(const a of pending)items.push({key:`talent:${a.id}:${a.updated_at.replace(/\D/g,'')}`,tone:'violet',title:'Talent registration needs review',text:a.name,href:'/admin/talent?status=pending',date:a.updated_at});
    const config=await settings(db);
    if(!config.enquiries_enabled)items.push({key:'setup:enquiries',tone:'amber',title:'Enquiry form is switched off',text:'Add the approved privacy notice and enable submissions when ready.',href:'/admin/settings',date:null});
    if(!config.facebook || !config.instagram || !config.youtube)items.push({key:'setup:socials',tone:'mint',title:'Connect the studio’s social profiles',text:'Complete Facebook, Instagram and YouTube links.',href:'/admin/settings',date:null});
  }
  const read=await rows(db,'SELECT notification_key FROM cms_notification_reads WHERE user_id=?',[user.id]);
  const keys=new Set(read.map(r=>r.notification_key));
  return items.map(item=>({...item,read:keys.has(item.key)})).sort((a,b)=>Number(a.read)-Number(b.read) || String(b.date || '').localeCompare(String(a.date || '')));
}
export async function dashboard(db,user){
  const publishing=canEdit(user),inbox=canEnquire(user);
  const counts=publishing ? await rows(db,'SELECT type,status,COUNT(*) AS total FROM cms_entries GROUP BY type,status') : [];
  const enquiryCounts=inbox ? await rows(db,'SELECT status,COUNT(*) AS total FROM cms_enquiries GROUP BY status') : [];
  const totalFor=(list,status)=>list.filter(r=>r.status===status).reduce((n,r)=>n+Number(r.total),0);
  const metrics=[];
  if(publishing){metrics.push({label:'Published stories & content',value:totalFor(counts,'published'),hint:'Visible on your website',href:'/admin/content?type=all&status=published',tone:'violet',icon:'↗'},{label:'Drafts in the making',value:totalFor(counts,'draft'),hint:'Your next updates',href:'/admin/content?type=all&status=draft',tone:'amber',icon:'✎'});}
  if(inbox){metrics.push({label:'New conversations',value:totalFor(enquiryCounts,'new'),hint:'Ready for a first response',href:'/admin/enquiries?status=new',tone:'coral',icon:'✉'},{label:'Follow-ups in progress',value:totalFor(enquiryCounts,'in_review')+totalFor(enquiryCounts,'contacted'),hint:'Keep the conversation moving',href:'/admin/enquiries',tone:'mint',icon:'↔'});}
  const registrations=user.role==='admin'?await rows(db,'SELECT status,COUNT(*) AS total FROM talent_accounts GROUP BY status'):[];
  const recentRegistrations=user.role==='admin'?await rows(db,'SELECT id,name,role,status,created_at FROM talent_accounts ORDER BY id DESC LIMIT 5'):[];
  if(user.role==='admin')metrics.push({label:'Talent registrations',value:registrations.reduce((n,r)=>n+Number(r.total),0),hint:'Artists, crew and hirers',href:'/admin/talent',tone:'violet',icon:'↗'},{label:'Profiles awaiting review',value:totalFor(registrations,'pending'),hint:'Check contact details and approve',href:'/admin/talent?status=pending',tone:'amber',icon:'✎'});
  const recentContent=publishing ? await rows(db,'SELECT e.id,e.type,e.title,e.status,e.updated_at,u.name AS editor FROM cms_entries e LEFT JOIN cms_users u ON u.id=e.updated_by ORDER BY e.updated_at DESC,e.id DESC LIMIT 6') : [];
  const recentEnquiries=inbox ? await rows(db,'SELECT id,subject,name,category,status,created_at FROM cms_enquiries ORDER BY id DESC LIMIT 5') : [];
  const activity=user.role==='admin' ? await rows(db,'SELECT a.*,u.name FROM cms_audit a LEFT JOIN cms_users u ON u.id=a.user_id ORDER BY a.id DESC LIMIT 6') : await rows(db,'SELECT a.*,u.name FROM cms_audit a LEFT JOIN cms_users u ON u.id=a.user_id WHERE a.user_id=? ORDER BY a.id DESC LIMIT 6',[user.id]);
  const weekly=await rows(db,'SELECT DATE(created_at) AS day,COUNT(*) AS total FROM cms_audit WHERE created_at>=UTC_DATE()-INTERVAL 6 DAY AND (?="admin" OR user_id=?) GROUP BY DATE(created_at)',[user.role,user.id]);
  const days=await rows(db,'SELECT UTC_DATE() AS today');
  const today=new Date(`${days[0].today}T00:00:00Z`);
  const series=Array.from({length:7},(_,i)=>{const date=new Date(today);date.setUTCDate(date.getUTCDate()-6+i);const iso=date.toISOString().slice(0,10);return {label:date.toLocaleDateString('en-IN',{weekday:'short',timeZone:'UTC'}),total:Number(weekly.find(r=>r.day===iso)?.total || 0)};});
  const media=publishing ? Number((await rows(db,'SELECT COUNT(*) AS total FROM cms_media'))[0].total) : 0;
  return {recentRegistrations,publishing,inbox,counts,enquiryCounts,metrics,recentContent,recentEnquiries,activity,series,media,weeklyTotal:series.reduce((n,d)=>n+d.total,0)};
}
