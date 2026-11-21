(() => {
 const form=document.querySelector('.site-module-editor'),search=document.querySelector('[data-site-search]');if(!form)return;
 const grid=form.querySelector('.field-grid'),items=[...grid.querySelectorAll('[data-site-search-item]')],moduleKey=form.elements.namedItem('module_key').value;
 const groups=[];let frame;
 const reveal=field=>window.adminRevealField?.(field);
 const groupFields=metadata=>{
  const buckets=new Map();
  for(const item of items){const field=item.querySelector('[name^="value:"]'),key=field.name.slice(6),label=item.querySelector('label'),text=label.firstChild;
   const original=text.textContent.trim(),prefix=original.includes(':')?original.split(':')[0]:'';
   const name=metadata?.fields[key]||(prefix?prefix.replaceAll('_',' ').replace(/^./,c=>c.toUpperCase()):'Page content');
   if(!buckets.has(name))buckets.set(name,[]);buckets.get(name).push(item);
   if(metadata?.labels[key])text.textContent=metadata.labels[key];else if(prefix)text.textContent=original.slice(original.indexOf(':')+1).trim();
   if(field.tagName==='TEXTAREA')field.rows=field.value.length>100?3:1;
  }
  const names=[...(metadata?.order||[]).filter(name=>buckets.has(name)),...[...buckets.keys()].filter(name=>!metadata?.order.includes(name))];
  for(const name of names){const details=document.createElement('details'),summary=document.createElement('summary'),heading=document.createElement('span'),count=document.createElement('small'),content=document.createElement('div');details.className='site-editor-group';heading.textContent=name;count.textContent=`${buckets.get(name).length} fields`;summary.append(heading,count);content.className='field-grid site-editor-group-content';content.append(...buckets.get(name));details.append(summary,content);grid.before(details);groups.push(details);}
  grid.remove();
 };
 const initialize=async()=>{let metadata;if(moduleKey==='copy:BudgetingSchedulingPage'){try{const response=await fetch('/budgeting-editor-sections.json');if(response.ok)metadata=await response.json();}catch{}}
 groupFields(metadata);
 if(moduleKey==='copy:BudgetingSchedulingPage'){
  const workspace=document.createElement('div');workspace.className='site-editor-workspace';form.before(workspace);workspace.append(form);
  const aside=document.createElement('aside');aside.className='site-editor-preview';const title=document.createElement('h2');title.textContent='Unsaved page preview';const hint=document.createElement('p');hint.textContent='Changes appear here as you type. Save a draft or publish when ready.';
  const controls=document.createElement('div');controls.className='button-row';frame=document.createElement('iframe');frame.title='Unsaved Budgeting and Scheduling page preview';frame.src='/develop/budgeting-scheduling/?admin_preview=copy%3ABudgetingSchedulingPage';
  let previewWidth=1024;const resizePreview=()=>{const scale=Math.min(1,(aside.clientWidth-34)/previewWidth);frame.style.width=previewWidth+'px';frame.style.maxWidth='none';frame.style.zoom=String(scale);frame.style.height=(innerHeight*.72/scale)+'px';};new ResizeObserver(resizePreview).observe(aside);
  for(const [label,width] of [['Desktop',1024],['Mobile',375]]){const button=document.createElement('button');button.type='button';button.textContent=label;button.setAttribute('aria-pressed',String(label==='Desktop'));button.addEventListener('click',()=>{previewWidth=width;resizePreview();controls.querySelectorAll('button').forEach(node=>node.setAttribute('aria-pressed',String(node===button)));});controls.append(button);}
  aside.append(title,hint,controls,frame);workspace.append(aside);frame.addEventListener('load',syncPreview);window.addEventListener('message',event=>{if(event.origin===location.origin&&event.source===frame.contentWindow&&event.data?.type==='kemsor-preview-ready')syncPreview();});
 }
 };
 const syncPreview=()=>{if(!frame)return;const values={};for(const item of items){const field=item.querySelector('[name^="value:"]');values[field.name.slice(6)]=field.type==='checkbox'?field.checked:field.value;}frame.contentWindow.postMessage({type:'kemsor-copy-preview',moduleKey,values},location.origin);};
 let timer;form.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(syncPreview,150);});
 search?.addEventListener('input',()=>{const query=search.value.trim().toLocaleLowerCase();for(const item of items){const values=[...item.querySelectorAll('textarea,input')].map(field=>field.value).join(' ');item.hidden=!`${item.textContent} ${values}`.toLocaleLowerCase().includes(query);}for(const group of groups){const matches=[...group.querySelectorAll('[data-site-search-item]')].some(item=>!item.hidden);group.hidden=Boolean(query)&&!matches;if(query&&matches){if(!group.hasAttribute('data-search-open'))group.dataset.searchOpen=String(group.open);group.open=true;}else if(!query&&group.hasAttribute('data-search-open')){group.open=group.dataset.searchOpen==='true';delete group.dataset.searchOpen;}}});
 form.addEventListener('invalid',event=>reveal(event.target),true);initialize();
})();
