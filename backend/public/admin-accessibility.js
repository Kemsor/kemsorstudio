// Shared enhancements leave native form controls and table semantics intact.
(() => {
 const main=document.querySelector('#main');if(!main)return;
 for(const link of document.querySelectorAll('.admin-skip-link'))link.addEventListener('click',()=>document.querySelector(link.getAttribute('href'))?.focus());
 // An implicit select label must not include every option in its accessible name.
 for(const select of main.querySelectorAll('select:not([aria-label]):not([aria-labelledby])')){
  const label=select.labels?.[0];if(!label)continue;
  const copy=label.cloneNode(true);copy.querySelectorAll('input,select,textarea,button,svg,small,[role="alert"]').forEach(node=>node.remove());
  const text=copy.textContent.replace(/\s+/g,' ').trim();if(text)select.setAttribute('aria-label',text);
 }
 let serial=0;const regions=[];
 for(const table of main.querySelectorAll('table')){
  for(const th of table.querySelectorAll('thead th:not([scope])'))th.scope='col';
  let region=table.closest('.table-wrap,.report-table-scroll,.admin-data-table');
  if(!region){region=document.createElement('div');region.className='table-wrap';table.before(region);region.append(table);}
  if(regions.some(item=>item.region===region))continue;
  const index=++serial,heading=table.caption?.textContent.trim()||region.closest('section')?.querySelector('h2')?.textContent.trim()||main.querySelector('h1')?.textContent.trim()||'Records';
  if(!region.hasAttribute('role'))region.setAttribute('role','region');
  if(!region.hasAttribute('aria-label')&&!region.hasAttribute('aria-labelledby'))region.setAttribute('aria-label',`${heading} table${index>1?' '+index:''}`);
  region.classList.add('admin-accessible-table');
  const hint=document.createElement('p');hint.className='admin-table-scroll-hint';hint.id=`admin-table-scroll-${index}`;hint.hidden=true;region.before(hint);
  const originalTabIndex=region.getAttribute('tabindex');
  regions.push({region,hint,originalTabIndex});
 }
 const update=()=>{for(const {region,hint,originalTabIndex} of regions){
  const horizontal=region.scrollWidth>region.clientWidth+1,vertical=region.scrollHeight>region.clientHeight+1,scrollable=horizontal||vertical;
  hint.hidden=!scrollable;hint.textContent=horizontal?'More columns are available. Swipe horizontally, or focus the table and use the arrow keys.':'More rows are available. Focus the table and use the arrow keys to scroll.';
  const ids=(region.getAttribute('aria-describedby')||'').split(/\s+/).filter(id=>id&&id!==hint.id);if(scrollable)ids.push(hint.id);
  if(ids.length)region.setAttribute('aria-describedby',ids.join(' '));else region.removeAttribute('aria-describedby');
  if(scrollable)region.tabIndex=0;else if(originalTabIndex!==null)region.setAttribute('tabindex',originalTabIndex);else region.removeAttribute('tabindex');
 }};
 let pending;const schedule=()=>{cancelAnimationFrame(pending);pending=requestAnimationFrame(update);};
 if(typeof ResizeObserver!=='undefined'){const observer=new ResizeObserver(schedule);for(const {region} of regions){observer.observe(region);for(const table of region.querySelectorAll('table'))observer.observe(table);}}
 addEventListener('resize',schedule);addEventListener('load',schedule);document.fonts?.ready.then(schedule);schedule();
})();
