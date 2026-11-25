(() => {
 const list=document.querySelector('[data-site-area-list]');
 if(!list)return;
 const controls=list.querySelector('[data-site-tabs]');
 const tablist=controls.querySelector('[role="tablist"]');
 const search=controls.querySelector('[data-site-search]');
 const tabs=[...tablist.querySelectorAll('[role="tab"]')];
 const panels=tabs.map(tab=>{
  const panel=document.getElementById(tab.getAttribute('aria-controls'));
  panel.setAttribute('role','tabpanel');
  panel.setAttribute('aria-labelledby',tab.id);
  return {
   panel,
   items:[...panel.querySelectorAll('[data-site-search-item]')],
   empty:panel.querySelector('[data-site-search-empty]'),
  };
 });
 if(!tabs.length)return;
 let active=0;

 const filter=()=>{
  const query=search.value.trim().toLocaleLowerCase();
  const {items,empty}=panels[active];
  for(const item of items)item.hidden=!item.textContent.toLocaleLowerCase().includes(query);
  empty.hidden=items.some(item=>!item.hidden);
 };
 const select=index=>{
  active=index;
  tabs.forEach((tab,position)=>{
   const selected=position===index;
   tab.setAttribute('aria-selected',String(selected));
   tab.tabIndex=selected?0:-1;
   tab.classList.toggle('quiet',!selected);
   panels[position].panel.hidden=!selected;
  });
  filter();
 };

 tabs.forEach((tab,index)=>tab.addEventListener('click',()=>select(index)));
 tablist.addEventListener('keydown',event=>{
  const direction={ArrowLeft:-1,ArrowRight:1}[event.key];
  let index;
  if(direction)index=(active+direction+tabs.length)%tabs.length;
  else if(event.key==='Home')index=0;
  else if(event.key==='End')index=tabs.length-1;
  else return;
  event.preventDefault();
  select(index);
  tabs[index].focus();
 });
 search.addEventListener('input',filter);
 select(0);
 controls.hidden=false;
})();


(() => {
 const form=document.querySelector('.site-module-editor'),search=document.querySelector('[data-site-search]');if(!form)return;
 const grid=form.querySelector('.field-grid'),items=[...grid.querySelectorAll('[data-site-search-item]')],moduleKey=form.elements.namedItem('module_key').value;
 const groups=[];let frame;
 const reveal=field=>window.adminRevealField?.(field);
 const groupFields=metadata=>{
  const buckets=new Map();
  const videoLabels={enabled:'Show video',position:'Display order',label:'Video title',src:'Video URL',poster:'Poster image',captions:'Subtitles',language:'Subtitle language',description:'Description'};
  const readable=name=>name.replace(/[-_]/g,' ').replace(/^./,letter=>letter.toUpperCase());
  for(const item of items){const field=item.querySelector('[name^="value:"]'),key=field.name.slice(6),label=item.querySelector('label'),text=label.firstChild;
   const original=text.textContent.trim(),prefix=original.includes(':')?original.split(':')[0]:'';
   const [slot,videoField]=moduleKey==='videos'?key.split('.'):[];
   const name=slot?readable(slot):item.dataset.section||metadata?.fields[key]||(prefix?readable(prefix):'Page content');
   if(!buckets.has(name))buckets.set(name,[]);buckets.get(name).push(item);
   if(slot&&videoLabels[videoField])text.textContent=videoLabels[videoField];else if(metadata?.labels[key])text.textContent=metadata.labels[key];else if(prefix)text.textContent=original.slice(original.indexOf(':')+1).trim();
   if(field.tagName==='TEXTAREA')field.rows=field.value.length>100?3:1;
  }
  const names=[...(metadata?.order||[]).filter(name=>buckets.has(name)),...[...buckets.keys()].filter(name=>!metadata?.order.includes(name))];
  if(names.length===1&&names[0]==='Page content')return;
  for(const name of names){const details=document.createElement('details'),summary=document.createElement('summary'),heading=document.createElement('span'),count=document.createElement('small'),content=document.createElement('div');details.className='site-editor-group';details.open=names.length===1;heading.textContent=name;count.textContent=`${buckets.get(name).length} fields`;summary.append(heading,count);content.className='field-grid site-editor-group-content';content.append(...buckets.get(name));details.append(summary,content);grid.before(details);groups.push(details);}
  grid.remove();
 };
 const initialize=async()=>{const section=form.elements.namedItem('section');let metadata;if(!section&&moduleKey==='copy:BudgetingSchedulingPage'){try{const response=await fetch('/budgeting-editor-sections.json');if(response.ok)metadata=await response.json();}catch{}}
 if(!section||section.value==='showreel')groupFields(metadata);
 if(moduleKey==='copy:BudgetingSchedulingPage'){
  const workspace=document.createElement('div');workspace.className='site-editor-workspace';form.before(workspace);workspace.append(form);
  const aside=document.createElement('aside');aside.className='site-editor-preview';const title=document.createElement('h2');title.textContent='Unsaved page preview';const hint=document.createElement('p');hint.textContent='Changes appear here as you type. Save a draft or publish when ready.';
  const controls=document.createElement('div');controls.className='button-row';frame=document.createElement('iframe');frame.title='Unsaved Budgeting and Scheduling page preview';frame.src='/develop/budgeting-scheduling/?admin_preview=copy%3ABudgetingSchedulingPage';
  let previewWidth=1024;const resizePreview=()=>{const scale=Math.min(1,(aside.clientWidth-34)/previewWidth);frame.style.width=previewWidth+'px';frame.style.maxWidth='none';frame.style.zoom=String(scale);frame.style.height=(innerHeight*.72/scale)+'px';};new ResizeObserver(resizePreview).observe(aside);
  for(const [label,width] of [['Desktop',1024],['Mobile',375]]){const button=document.createElement('button');button.type='button';button.textContent=label;button.setAttribute('aria-pressed',String(label==='Desktop'));button.addEventListener('click',()=>{previewWidth=width;resizePreview();controls.querySelectorAll('button').forEach(node=>node.setAttribute('aria-pressed',String(node===button)));});controls.append(button);}
  aside.append(title,hint,controls,frame);workspace.append(aside);frame.addEventListener('load',syncPreview);window.addEventListener('message',event=>{if(event.origin===location.origin&&event.source===frame.contentWindow&&event.data?.type==='kemsor-preview-ready')syncPreview();});
 }
 };
 const syncPreview=()=>{if(!frame)return;const values={};for(const item of items){const field=item.querySelector('[name^="value:"]');values[field.name.slice(6)]=field.type==='checkbox'?field.checked:field.type==='number'?field.valueAsNumber:field.value;}frame.contentWindow.postMessage({type:'kemsor-copy-preview',moduleKey,values},location.origin);};
 let timer;form.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(syncPreview,150);});
 search?.addEventListener('input',()=>{const query=search.value.trim().toLocaleLowerCase();for(const item of items){const values=[...item.querySelectorAll('textarea,input')].map(field=>field.value).join(' ');item.hidden=!`${item.textContent} ${values}`.toLocaleLowerCase().includes(query);}for(const group of groups){const matches=[...group.querySelectorAll('[data-site-search-item]')].some(item=>!item.hidden);group.hidden=Boolean(query)&&!matches;if(query&&matches){if(!group.hasAttribute('data-search-open'))group.dataset.searchOpen=String(group.open);group.open=true;}else if(!query&&group.hasAttribute('data-search-open')){group.open=group.dataset.searchOpen==='true';delete group.dataset.searchOpen;}}});
 form.addEventListener('invalid',event=>reveal(event.target),true);initialize();
})();

(() => {
 const editor=document.querySelector('[data-faq-editor]');
 if(!editor)return;
 const rows=editor.querySelector('[data-faq-rows]');
 const template=editor.querySelector('[data-faq-template]');
 const add=editor.querySelector('[data-faq-action="add"]');
 const refresh=()=>{
  const items=[...rows.children];
  add.disabled=items.length>=Number(editor.dataset.limit);
  for(const [index,row] of items.entries()){
   row.querySelector('[data-faq-action="up"]').disabled=index===0;
   row.querySelector('[data-faq-action="down"]').disabled=index===items.length-1;
  }
 };
 editor.addEventListener('click',event=>{
  const button=event.target.closest('[data-faq-action]');
  if(!button||button.disabled)return;
  const row=button.closest('[data-faq-row]');
  switch(button.dataset.faqAction){
   case 'add':
    rows.append(template.content.cloneNode(true));
    rows.lastElementChild.querySelector('input').focus();
    break;
   case 'remove': {
    const next=row.nextElementSibling||row.previousElementSibling;
    row.remove();
    (next?.querySelector('input')||add).focus();
    break;
   }
   case 'up':
    row.previousElementSibling.before(row);
    row.querySelector('input').focus();
    break;
   case 'down':
    row.nextElementSibling.after(row);
    row.querySelector('input').focus();
    break;
  }
  refresh();
 });
 refresh();
})();


(() => {
 const list=document.querySelector('[data-image-placement-list]');
 if(!list)return;
 const forms=[...list.querySelectorAll('[data-image-placement]')];
 const search=document.querySelector('[data-image-placement-search]');
 search?.addEventListener('input',()=>{
  const query=search.value.trim().toLocaleLowerCase();
  for(const form of forms){
   const name=form.getAttribute('aria-label');
   const values=[...form.querySelectorAll('[name^="value:"]')].map(input=>input.value);
   form.hidden=![name,...values].join(' ').toLocaleLowerCase().includes(query);
  }
 });

 let saving=false;
 for(const form of forms)form.addEventListener('submit',async event=>{
  event.preventDefault();
  const status=form.querySelector('[data-placement-save-status]');
  status.hidden=false;
  if(saving){
   status.textContent='Another image is saving. Try again in a moment.';
   return;
  }
  const action=event.submitter?.value||'publish';
  const data=new URLSearchParams(new FormData(form));
  data.set('action',action);
  const buttons=[...form.querySelectorAll('button[name="action"]')];
  saving=true;
  buttons.forEach(button=>button.disabled=true);
  status.textContent='Saving…';
  try{
   const response=await fetch(form.action,{method:'POST',headers:{Accept:'application/json'},body:data});
   if(response.redirected)throw new Error('Your session expired. Sign in again and retry.');
   const result=await response.json();
   if(!response.ok)throw new Error(result.error||'The image could not be saved.');
   for(const editor of forms)editor.elements.namedItem('revision').value=result.revision;
   if(action==='reset'||action==='restore'){
    for(const [key,value] of Object.entries(result.values)){
     const field=form.elements.namedItem('value:'+key);
     field.value=value;
     field.dispatchEvent(new Event('change',{bubbles:true}));
    }
   }
   status.textContent={
    draft:'Image draft saved.',publish:'Image saved and published.',
    reset:'Image reset to its default.',restore:'Earlier image draft restored.',
   }[action];
  }catch(error){
   status.textContent=error.message||'The image could not be saved.';
  }finally{
   saving=false;
   buttons.forEach(button=>button.disabled=false);
  }
 });
})();
