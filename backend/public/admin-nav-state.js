// Loaded immediately after the sidebar markup, before the main content is parsed.
(() => {
 const nav=document.querySelector('.cms-nav');
 if(!nav)return;
 const root=document.documentElement;
 const key='kemsor-admin-nav-scroll';
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
