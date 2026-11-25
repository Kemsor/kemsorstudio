// Prepare sidebar state before the new admin page is painted.
(() => {
 const nav=document.querySelector('.cms-nav');
 if(!nav)return;
 const root=document.documentElement;
 const key='kemsor-admin-nav-scroll';
 const saved={top:0,left:0,groups:{}};
 try {
  const stored=JSON.parse(sessionStorage.getItem(key)||'{}');
  saved.top=Number.isFinite(stored?.top)?Math.max(0,stored.top):0;
  saved.left=Number.isFinite(stored?.left)?Math.max(0,stored.left):0;
  if(stored?.groups&&typeof stored.groups==='object')saved.groups=stored.groups;
 }catch { /* Navigation remains usable when storage is unavailable. */ }
 const current=new URL(location.href);
 const pathname=current.pathname.replace(/\/$/,'');
 const routeMatch=link=>{
  const currentPage=link.getAttribute('aria-current')==='page';
  const target=new URL(link.href,current);
  const path=target.pathname.replace(/\/$/,'');
  const matches=pathname===path||(path!=='/admin'&&pathname.startsWith(path+'/'));
  const query=[...target.searchParams];
  if(target.origin!==current.origin||!matches||!query.every(([name,value])=>current.searchParams.get(name)===value)){
   return currentPage?[0,0,1]:null;
  }
  return [path.length,query.length,Number(currentPage)];
 };
 let activeLink=null,activeMatch=null;
 for(const link of nav.querySelectorAll('a[href]')){
  const match=routeMatch(link);
  if(!match)continue;
  if(!activeMatch||match[0]>activeMatch[0]||
   (match[0]===activeMatch[0]&&(match[1]>activeMatch[1]||
    (match[1]===activeMatch[1]&&match[2]>activeMatch[2])))){
   activeLink=link;
   activeMatch=match;
  }
 }
 const remember=()=>{
  try{sessionStorage.setItem(key,JSON.stringify({top:nav.scrollTop,left:nav.scrollLeft,groups:saved.groups}));}catch{}
 };
 nav.querySelectorAll('.nav-label').forEach((label,index)=>{
  const links=[];
  for(let item=label.nextElementSibling;item&&!item.matches('.nav-label,.sidebar-note');item=item.nextElementSibling){
   if(item.matches('a'))links.push(item);
  }
  if(!links.length)return;
  const name=label.textContent.trim();
  const button=document.createElement('button');
  button.type='button';button.className='nav-group-toggle';
  button.textContent=name;
  const chevron=document.createElementNS('http://www.w3.org/2000/svg','svg');
  chevron.classList.add('nav-group-chevron');chevron.setAttribute('aria-hidden','true');chevron.setAttribute('viewBox','0 0 24 24');chevron.setAttribute('fill','none');chevron.setAttribute('stroke','currentColor');chevron.setAttribute('stroke-width','1.75');chevron.setAttribute('stroke-linecap','round');chevron.setAttribute('stroke-linejoin','round');
  const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d','m9 6 6 6-6 6');chevron.append(path);button.append(chevron);
  links.forEach((link,i)=>{link.id=`nav-group-${index}-link-${i}`;});
  button.setAttribute('aria-controls',links.map(link=>link.id).join(' '));
  const setExpanded=expanded=>{
   button.setAttribute('aria-expanded',String(expanded));
   links.forEach(link=>{link.hidden=!expanded;});
  };
  setExpanded(saved.groups[name]===true||links.includes(activeLink));
  button.addEventListener('click',()=>{
   const expanded=button.getAttribute('aria-expanded')!=='true';
   saved.groups[name]=expanded;
   setExpanded(expanded);
   remember();
  });
  label.replaceChildren(button);
 });
 nav.scrollTop=saved.top;nav.scrollLeft=saved.left;
 nav.addEventListener('scroll',remember,{passive:true});
 nav.addEventListener('click',remember);
 addEventListener('pagehide',remember);
 const ready=()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{root.dataset.adminNavReady='true';}));
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});
 else ready();
 addEventListener('pageshow',ready);
})();
