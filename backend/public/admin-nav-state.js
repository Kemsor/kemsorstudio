// Loaded immediately after the sidebar markup, before the main content is parsed.
(() => {
 const nav=document.querySelector('.cms-nav');
 if(!nav)return;
 const root=document.documentElement;
 const key='kemsor-admin-nav-scroll';
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
  setExpanded(links.some(link=>link.getAttribute('aria-current')==='page'));
  button.addEventListener('click',()=>{
   setExpanded(button.getAttribute('aria-expanded')!=='true');
  });
  label.replaceChildren(button);
 });
 let saved={top:0,left:0};
 try {
  const stored=JSON.parse(sessionStorage.getItem(key)||'{}');
  saved.top=Number.isFinite(stored.top)?Math.max(0,stored.top):0;
  saved.left=Number.isFinite(stored.left)?Math.max(0,stored.left):0;
 }catch { /* Navigation remains usable when storage is unavailable. */ }
 nav.scrollTop=saved.top;nav.scrollLeft=saved.left;
 const remember=()=>{try{sessionStorage.setItem(key,JSON.stringify({top:nav.scrollTop,left:nav.scrollLeft}));}catch{}};
 nav.addEventListener('scroll',remember,{passive:true});
 nav.addEventListener('click',remember);
 addEventListener('pagehide',remember);
 const ready=()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{root.dataset.adminNavReady='true';}));
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});
 else ready();
 addEventListener('pageshow',ready);
})();
