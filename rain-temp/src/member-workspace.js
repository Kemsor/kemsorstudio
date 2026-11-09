export const memberTabs=['overview','profile','saved','messages'];
export function memberTab(hash,role){
 const tab=String(hash||'').replace(/^#/,'');
 return memberTabs.includes(tab)&&!(role==='artist'&&tab==='saved')?tab:'overview';
}
export function profileReadiness(user){
 const filled=value=>typeof value==='string'?value.trim().length>0:Boolean(value);
 const professional=user?.role==='hirer';
 const checks=[
  ['name','Professional name','member-essentials',filled(user?.name)],
  ['city','Your location','member-essentials',filled(user?.city)],
  ['craft',professional?'Department & role':'Your discipline','member-essentials',professional?filled(user?.department)&&filled(user?.specialty):filled(user?.profession)],
  ['bio','Your introduction','member-craft',filled(user?.bio)],
  ['skills','Skills','member-craft',filled(user?.skills)],
  ['languages','Languages','member-craft',filled(user?.languages)],
  ['credits','Credits & experience','member-craft',filled(user?.credits)],
  ['image_id','Profile portrait','member-portrait',filled(user?.image_id)],
  ['availability','Availability','member-availability',filled(user?.availability)],
  ['showreel','Portfolio link','member-availability',filled(user?.showreel)],
 ].map(([key,label,section,complete])=>({key,label,section,complete}));
 const done=checks.filter(item=>item.complete).length;
 return {checks,done,total:checks.length,percent:Math.round(done/checks.length*100)};
}
export function matchingItems(items,query,fields){
 const search=String(query||'').trim().toLocaleLowerCase();
 return search?items.filter(item=>fields.some(field=>String(item[field]||'').toLocaleLowerCase().includes(search))):items;
}
