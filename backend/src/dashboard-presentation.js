import {canEdit,canEnquire} from './security.js';

export function dashboardShortcuts(user){
 if(user.role==='admin')return [
  ['Review new enquiries','enquiries','/admin/enquiries?section=all&status=new'],
  ['Review pending profiles','review','/admin/talent?status=pending'],
  ['Review career applications','career','/admin/applications?status=new'],
  ['New blog story','blog','/admin/content/new?type=blog'],
  ['Upload media','media','/admin/media'],
 ];
 if(canEdit(user))return [
  ['New blog story','blog','/admin/content/new?type=blog'],
  ['Review drafts','review','/admin/content?type=all&status=draft'],
  ['Studio announcement','news','/admin/content/new?type=news'],
  ['Upload media','media','/admin/media'],
 ];
 return canEnquire(user)?[
  ['Review new enquiries','enquiries','/admin/enquiries?section=all&status=new'],
  ['Continue follow-ups','followup','/admin/enquiries?section=all&status=follow_up'],
  ['Review career applications','career','/admin/applications?status=new'],
 ]:[];
}

// Only known, role-appropriate destinations become links in the activity feed.
export function activityTarget(event,user){
 const id=Number(event.target_id),valid=Number.isSafeInteger(id)&&id>0;
 const targets={
  content:{allowed:canEdit(user),label:'Content',list:'/admin/content?type=all',detail:'/admin/content/',query:'SELECT title AS title FROM cms_entries WHERE id=?'},
  enquiry:{allowed:canEnquire(user),label:'Enquiry',list:'/admin/enquiries?section=all',detail:'/admin/enquiries/',query:'SELECT subject AS title FROM cms_enquiries WHERE id=?'},
  career_application:{allowed:canEnquire(user),label:'Career application',list:'/admin/applications',detail:'/admin/applications/',query:'SELECT name AS title FROM career_applications WHERE id=?'},
  talent:{allowed:user.role==='admin',label:'Member profile',list:'/admin/talent',detail:'/admin/talent/',query:'SELECT name AS title FROM talent_accounts WHERE id=?'},
  media:{allowed:canEdit(user),label:'Media',list:'/admin/media',query:'SELECT original_name AS title FROM cms_media WHERE id=?'},
  casting_call:{allowed:canEdit(user),label:'Casting call',list:'/admin/casting',detail:'/admin/casting/',query:'SELECT title AS title FROM casting_calls WHERE id=?'},
 };
 const type={enquiries:'enquiry',applications:'career_application',members:'talent'}[event.target_type]||event.target_type;
 const target=targets[type];
 if(target?.allowed&&valid)return {...target,id,href:/^delete/.test(event.action)?target.list:(target.detail?target.detail+id:target.list)};
 if(['blog_category','news_category'].includes(type)&&canEdit(user))return {label:type==='blog_category'?'Blog category':'News category',href:`/admin/${type==='blog_category'?'blog':'news'}-categories/manage`};
 if(type==='settings'&&user.role==='admin')return {label:'Site settings',href:'/admin/settings'};
 if(type==='site_content'&&canEdit(user))return {label:'Website content',href:'/admin/site-content'};
 if(type==='user'&&valid&&(id===user.id||user.role==='admin'))return {label:'Admin account',href:id===user.id?'/admin/profile':'/admin/users'};
 return {label:String(event.target_type||'Workspace').replaceAll('_',' '),href:user.role==='admin'?'/admin/audit':null};
}

export function describeActivity(event,user,target,title){
 const actions={login:'Signed in',member_login:'Signed in',member_logout:'Signed out',register:'Registered',save:'Saved',publish:'Published',archive:'Archived',create:'Created',update:'Updated',review:'Reviewed',upload:'Uploaded',delete:'Deleted',delete_personal_data:'Deleted personal data for',change_password:'Changed password',toggle_access:'Changed access',bulk_draft:'Moved to draft',bulk_archived:'Archived',bulk_closed:'Closed',bulk_reviewing:'Started reviewing',profile_update:'Updated profile'};
 const raw=String(event.action).replaceAll('_',' ');
 const actionLabel=actions[event.action]||raw.charAt(0).toUpperCase()+raw.slice(1);
 const actor=event.name||(event.target_type==='talent'&&title?title:'System');
 return {...event,actor,actionLabel,recordTitle:title||`${target.label}${target.id?' #'+target.id:''}`,href:target.href};
}
