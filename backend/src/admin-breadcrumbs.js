const sections={filmdesk:'FilmDesk submissions',notifications:'Notifications',pages:'Manage pages',media:'Media library',settings:'Site settings','site-content':'Website content',users:'Admin users & roles',talent:'Members',enquiries:'Contact page enquiries',applications:'Career applications',casting:'Casting calls','casting-applications':'Casting applications',people:'Production people','production-epks':'Production press kits',reports:'Reports',kpi:'KPI & outcomes',audit:'Activity log',operations:'Operations & backups',email:'Email delivery',profile:'My profile',password:'Change password',permissions:'Roles & permissions','news-campaigns':'News campaigns',newsletter:'News alert subscribers','casting-application-settings':'Casting application settings','blog-categories':'Blog categories','news-categories':'News categories'};
const contentTypes={blog:'Blog posts',news:'News posts',career:'Career opportunities',production:'Productions',press_asset:'Press resources',team:'Team profiles',media_partner:'Media partners',home:'Homepage',page:'Page content',all:'All content'};
export function adminBreadcrumbs(path,query={},context={}){
 const parts=path.replace(/\/+$/,'').split('/').filter(Boolean);
 if(parts[0]!=='admin'||['login','mfa'].includes(parts[1]))return [];
 const crumbs=[{label:'Overview',href:'/admin'}];
 const add=(label,href)=>crumbs.push({label,href});
 if(parts.length===1)return [{label:'Overview'}];
 const section=parts[1],base='/admin/'+section;
 if(section==='content'){
  const type=context.entry?.type||query.type||'all',label=contentTypes[type]||'Content',list='/admin/content?type='+encodeURIComponent(Object.hasOwn(contentTypes,type)?type:'all');
  add(label,list);
  if(parts[2]){const id=parts[2],name=context.entry?.title||'Edit content';if(id==='new')add('Add '+({blog:'blog post',news:'news post',career:'career opportunity',production:'production'}[type]||'content'));else{add(name,'/admin/content/'+encodeURIComponent(id));if(parts[3])add(({preview:'Preview',revisions:'Version history'})[parts[3]]||'Details');}}
 }else if(section==='manage'){
  const kind=parts[2]==='legal'?'legal':'hero';add(kind==='legal'?'Legal documents':'Homepage hero slides','/admin/manage/'+kind);
  if(parts[3]){add(parts[3]==='new'?'Add '+(kind==='legal'?'legal document':'hero slide'):(context.record?.draft?.title||'Edit '+(kind==='legal'?'legal document':'hero slide')),'/admin/manage/'+kind+'/'+encodeURIComponent(parts[3]));if(parts[4])add('Preview');}
 }else{
  add(sections[section]||'Admin',base);
  if(section==='site-content'&&parts[2])add(context.module?.label||'Edit website content');
  else if(section==='talent'&&parts[2]){add(({enquiries:'Talent enquiries',projects:'Member projects'})[parts[2]]||context.member?.name||'Member details',base+'/'+encodeURIComponent(parts[2]));}
  else if(section==='reports'&&parts[2])add(({enquiries:'Enquiry reports',applications:'Career reports',content:'Publishing reports',registrations:'Registration reports',talent:'Talent enquiry reports',projects:'FilmDesk reports',activity:'Activity reports'})[parts[2]]||'Report');
  else if(section==='kpi'&&parts[2])add(({settings:'Report settings',reports:'Saved report',actions:'Corrective actions',inputs:'Period inputs',snapshots:'Report snapshots'})[parts[2]]||'Details');
  else if(parts[2]&&!(['blog-categories','news-categories'].includes(section)&&parts[2]==='manage')){add(parts[2]==='new'?'Add new':({preview:'Preview',preferences:'Preferences'})[parts[2]]||'Details',base+'/'+encodeURIComponent(parts[2]));if(parts[3])add(parts[3]==='preview'?'Preview':'Details');}
 }
 // Only ancestors are links; the final item identifies the current location.
 delete crumbs.at(-1).href;return crumbs;
}
