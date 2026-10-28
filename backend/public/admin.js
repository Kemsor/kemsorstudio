const workspaceIcon = name => document.querySelector(`template[data-admin-icon="${name}"]`).content.cloneNode(true);
const dropdown=document.querySelector('.notification-dropdown');
if(dropdown){
 const toggle=dropdown.querySelector('[data-unread-only]');
 const list=dropdown.querySelector('.notification-items');
 const error=dropdown.querySelector('.notification-dropdown-error');
 const csrf=dropdown.querySelector('input[name="_csrf"]').value;
 let pending=false,items=null;
 const iconNames={enquiry:'enquiries',draft:'page',talent:'team',application:'career',setup:'settings'};
 function render(){
  if(!items)return;
  const unreadOnly=toggle.getAttribute('aria-pressed')==='true';
  const shown=items.filter(item=>!unreadOnly||!item.read).slice(0,5);
  if(!shown.length){const empty=document.createElement('div');empty.className='notification-empty';const title=document.createElement('strong');title.textContent=unreadOnly?'You’re all caught up.':'No notifications yet.';const copy=document.createElement('p');copy.textContent='New workspace updates will appear here.';empty.append(title,copy);list.replaceChildren(empty);return;}
  list.replaceChildren(...shown.map(item=>{
   const article=document.createElement('article');article.className=`notification-item ${item.read?'is-read':'is-unread'}`;
   const indicator=document.createElement('span');indicator.className=`notification-indicator tone-${item.tone}`;indicator.setAttribute('aria-hidden','true');
   indicator.append(workspaceIcon(iconNames[item.key.split(':')[0]]||'settings'));
   const content=document.createElement('div'),link=document.createElement('a');link.href=item.href;
   const title=document.createElement('strong');title.textContent=item.title;const copy=document.createElement('span');copy.textContent=item.text;link.append(title,copy);content.append(link);
   if(item.date){const date=document.createElement('small');date.textContent=`${item.date} UTC`;content.append(date);}
   if(!item.read){const form=document.createElement('form');form.method='post';form.action='/admin/notifications/read';for(const [name,value]of Object.entries({_csrf:csrf,key:item.key})){const input=document.createElement('input');input.type='hidden';input.name=name;input.value=value;form.append(input);}const button=document.createElement('button');button.className='notification-read';button.textContent='Mark as read';form.append(button);content.append(form);}
   article.append(indicator,content);if(!item.read){const dot=document.createElement('span');dot.className='unread-dot';dot.setAttribute('aria-label','Unread');article.append(dot);}return article;
  }));
 }
 async function refresh(force=false){
  if(document.hidden||pending)return;pending=true;
  try{const response=await fetch('/admin/notifications.json',{headers:{Accept:'application/json'}});if(!response.ok)throw new Error();const data=await response.json();items=data.items;
   document.querySelectorAll('[data-notification-count]').forEach(node=>{node.textContent=String(data.unread);node.hidden=!data.unread;});
   dropdown.querySelector('[data-notification-label]').textContent=`${data.unread} unread ${data.unread===1?'update':'updates'}`;
   dropdown.querySelector('.notification-mark-all').disabled=!data.unread;
   if(force||!dropdown.open)render();
  }catch{if(force){error.textContent='Unable to refresh notifications. Please try again.';error.hidden=false;}}finally{pending=false;}
 }
 toggle.addEventListener('click',()=>{toggle.setAttribute('aria-pressed',String(toggle.getAttribute('aria-pressed')!=='true'));render();});
 dropdown.addEventListener('toggle',()=>{dropdown.querySelector('summary').setAttribute('aria-expanded',String(dropdown.open));if(dropdown.open){error.hidden=true;refresh(true);}});
 dropdown.addEventListener('submit',async event=>{
  const form=event.target;if(form.action!==new URL('/admin/notifications/read',location.origin).href)return;
  event.preventDefault();const button=form.querySelector('button');button.disabled=true;error.hidden=true;
  try{const response=await fetch(form.action,{method:'POST',headers:{Accept:'application/json'},body:new FormData(form)});if(!response.ok)throw new Error();await refresh(true);toggle.focus({preventScroll:true});}
  catch{button.disabled=false;error.textContent='Could not mark the update as read. Please try again.';error.hidden=false;}
 });
 document.addEventListener('click',event=>{if(!dropdown.contains(event.target))dropdown.open=false;});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&dropdown.open){dropdown.open=false;dropdown.querySelector('summary').focus();}});
 setInterval(()=>refresh(false),30000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh(false);});
}

document.addEventListener('submit',event=>{const message=event.target.dataset.confirm;if(message&&!window.confirm(message))event.preventDefault();},true);

const slugPreview=document.querySelector('[data-auto-slug]');
const contentTitle=document.querySelector('.editor input[name="title"]');
if(slugPreview && contentTitle && !slugPreview.dataset.existingSlug){
 const preview=()=>{slugPreview.value=contentTitle.value.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,180).replace(/-$/,'') || (contentTitle.value.trim()?'content':'');};
 contentTitle.addEventListener('input',preview);preview();
}

const blogBanner=document.querySelector('[data-blog-banner]');
const bannerAlt=document.querySelector('[data-banner-alt]');
if(blogBanner&&bannerAlt)blogBanner.addEventListener('change',()=>{bannerAlt.required=Boolean(blogBanner.files.length);});

const adminNav=document.querySelector('.cms-nav');
if(adminNav){
 const key='kemsor-admin-nav-scroll';
 try{const saved=JSON.parse(sessionStorage.getItem(key)||'{}');adminNav.scrollTop=saved.top||0;adminNav.scrollLeft=saved.left||0;}catch{}
 const remember=()=>{try{sessionStorage.setItem(key,JSON.stringify({top:adminNav.scrollTop,left:adminNav.scrollLeft}));}catch{}};
 adminNav.addEventListener('scroll',remember,{passive:true});adminNav.addEventListener('click',remember);window.addEventListener('pagehide',remember);
}
document.querySelectorAll('input[type="password"]').forEach(input=>{
 const wrapper=document.createElement('span');wrapper.className='password-control';input.replaceWith(wrapper);wrapper.append(input);
 const button=document.createElement('button');button.type='button';button.className='password-eye';button.setAttribute('aria-label','Show password');button.setAttribute('aria-pressed','false');
 button.append(workspaceIcon('eye'));
 button.addEventListener('click',event=>{event.preventDefault();const show=input.type==='password';input.type=show?'text':'password';button.setAttribute('aria-label',show?'Hide password':'Show password');button.setAttribute('aria-pressed',String(show));button.replaceChildren(workspaceIcon(show?'eye-off':'eye'));});wrapper.append(button);
});

// Progressive form handling: failed saves leave the actual form and uploads in place.
for(const form of document.querySelectorAll('main form[method="post"],main form[method="POST"]')){
 if(form.closest('.notification-dropdown'))continue;
 form.noValidate=true;
 const clear=()=>{form.querySelectorAll('[data-form-field-error],.admin-form-feedback').forEach(node=>node.remove());for(const field of form.querySelectorAll('[aria-invalid=true]')){field.removeAttribute('aria-invalid');const ids=(field.getAttribute('aria-describedby')||'').split(' ').filter(id=>!id.startsWith('admin-error-'));if(ids.length)field.setAttribute('aria-describedby',ids.join(' '));else field.removeAttribute('aria-describedby');}};
 const feedback=(message,errors={})=>{
  clear();const box=document.createElement('div');box.className='admin-form-feedback';box.setAttribute('role','alert');box.tabIndex=-1;
  const title=document.createElement('strong');title.textContent='Please check the details below.';const copy=document.createElement('span');copy.textContent=message;box.append(title,copy);
  const list=document.createElement('ul');
  for(const [name,text]of Object.entries(errors)){
   const field=[...form.elements].find(field=>field.name===name && field.type!=='hidden');if(!field)continue;
   const note=document.createElement('small');note.className='admin-field-error';note.dataset.formFieldError='true';note.id=`admin-error-${name}`;note.textContent=text;
   field.setAttribute('aria-invalid','true');field.setAttribute('aria-describedby',`${field.getAttribute('aria-describedby')||''} ${note.id}`.trim());
   (field.closest('.password-control')||field).after(note);
   const row=document.createElement('li'),link=document.createElement('a');link.href='#';link.textContent=text;link.addEventListener('click',event=>{event.preventDefault();field.focus();field.scrollIntoView({block:'center',behavior:'instant'});});row.append(link);list.append(row);
  }
  if(list.childNodes.length)box.append(list);form.prepend(box);box.focus({preventScroll:true});box.scrollIntoView({block:'nearest',behavior:'instant'});
 };
 form.addEventListener('input',event=>{const field=event.target;if(field.getAttribute('aria-invalid')==='true'){field.removeAttribute('aria-invalid');const id=`admin-error-${field.name}`;form.querySelector(`[id="${CSS.escape(id)}"]`)?.remove();const description=(field.getAttribute('aria-describedby')||'').split(' ').filter(value=>value!==id).join(' ');if(description)field.setAttribute('aria-describedby',description);else field.removeAttribute('aria-describedby');}});
 form.addEventListener('submit',async event=>{
  if(event.defaultPrevented)return;
  if(form.dataset.saving==='true'){event.preventDefault();return;}
  const errors={};
  for(const field of form.elements){if(field.willValidate && !field.checkValidity())errors[field.name]=field.validationMessage;if(field.type==='file'&&field.files?.[0]?.size>5*1024*1024)errors[field.name]='Choose a file of up to 5 MB.';}
  if(Object.keys(errors).length){event.preventDefault();feedback('Correct the highlighted fields and try again.',errors);return;}
  if(new URL(form.action,location.href).pathname==='/admin/login')return;
  event.preventDefault();clear();
  const data=new FormData(form);if(event.submitter?.name)data.append(event.submitter.name,event.submitter.value);
  const buttons=[...form.querySelectorAll('button')].map(button=>({button,disabled:button.disabled}));
  form.dataset.saving='true';form.setAttribute('aria-busy','true');buttons.forEach(({button})=>button.disabled=true);
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),45000);
  try{
   const session=await fetch('/api/csrf',{headers:{Accept:'application/json'},credentials:'same-origin',signal:controller.signal});
   if(session.ok){const fresh=await session.json();data.set('_csrf',fresh.token);const input=form.querySelector('input[name="_csrf"]');if(input)input.value=fresh.token;}
   const response=await fetch(form.action,{method:'POST',headers:{Accept:'application/json'},body:data,signal:controller.signal,credentials:'same-origin'});
   if(response.headers.get('content-type')?.includes('application/json')){const result=await response.json();if(!response.ok){feedback(result.error||'Unable to save these details.',result.fields||{});return;}if(result.redirect){window.adminSaveCompleted=true;location.assign(result.redirect);return;}feedback('The request completed. Refresh the page to see the latest changes.');return;}
   if(response.redirected&&response.ok){if(new URL(response.url).pathname==='/admin/login'){feedback('Your session has expired. Open the admin login in another tab, sign in, then retry. Your entries are still here.');return;}window.adminSaveCompleted=true;location.assign(response.url);return;}
   feedback('Unable to save right now. Your entries are still here; please try again.');
  }catch(error){feedback(error.name==='AbortError'?'The request timed out. Your entries are still here. Check the list before trying again to avoid duplicate submissions.':'Unable to connect. Your entries are still here; please try again.');}
  finally{clearTimeout(timeout);delete form.dataset.saving;form.removeAttribute('aria-busy');buttons.forEach(({button,disabled})=>button.disabled=disabled);}
 });
}

// Publishing previews use current form values; no content is published by previewing.
for(const editor of document.querySelectorAll('form.editor')){
 const status=editor.querySelector('select[name="status"]'),state=editor.querySelector('[data-change-state]');
 const snapshot=()=>JSON.stringify([...editor.elements].filter(field=>field.name&&!['hidden','submit','button'].includes(field.type)).map(field=>[field.name,field.type==='file'?[...field.files].map(file=>[file.name,file.size,file.lastModified]):field.type==='checkbox'?field.checked:field.value]));
 const initial=snapshot();let dirty=false;
 const update=()=>{dirty=snapshot()!==initial;state.textContent=dirty?'Unsaved changes':'No unsaved changes';state.classList.toggle('is-dirty',dirty);if(status){const badge=editor.querySelector('[data-publishing-status]');badge.textContent=status.value;badge.className=`badge badge-${status.value}`;editor.querySelector('[data-publishing-help]').textContent=dirty?'Selected status takes effect when saved':status.value==='published'?'Published on the website':status.value==='archived'?'Archived — hidden from the website':'Draft — visible only to publishing staff';}};
 editor.addEventListener('input',update);editor.addEventListener('change',update);
 window.addEventListener('beforeunload',event=>{if(dirty&&!window.adminSaveCompleted){event.preventDefault();event.returnValue='';}});
 editor.querySelector('[data-preview-content]').addEventListener('click',()=>{
  const dialog=document.createElement('dialog');dialog.className='publishing-preview-dialog';dialog.setAttribute('aria-label','Preview unsaved content');
  const heading=document.createElement('div');heading.className='publishing-preview-heading';const title=document.createElement('strong');title.textContent='Preview changes';const close=document.createElement('button');close.type='button';close.className='quiet';close.textContent='Close preview';heading.append(title,close);
  const note=document.createElement('p');note.className='preview-notice';note.textContent='Preview only. Your changes have not been saved or published.';
  const article=document.createElement('article');article.className='content-preview';
  const data=new FormData(editor),image=document.createElement('img');image.hidden=true;image.alt=data.get('banner_alt')||'Selected content image';
  const file=editor.querySelector('input[type="file"][name="image"]')?.files[0];
  if(file&&['image/png','image/jpeg','image/webp'].includes(file.type)){const reader=new FileReader();reader.onload=()=>{image.src=reader.result;image.hidden=false;};reader.readAsDataURL(file);}else if(data.get('image_id')){image.src=`/media/${encodeURIComponent(data.get('image_id'))}`;image.hidden=false;}
  const h2=document.createElement('h2');h2.textContent=data.get('title')||'Untitled draft';const meta=document.createElement('p');meta.className='preview-metadata';meta.textContent=[data.get('role'),data.get('location')].filter(Boolean).join(' · ');
  const summary=document.createElement('p');summary.className='preview-summary';summary.textContent=data.get('summary')||'';const body=document.createElement('div');body.className='preview-body';
  String(data.get('body')||'').split(/\n\s*\n/).filter(Boolean).forEach(text=>{const paragraph=document.createElement('p');paragraph.textContent=text;body.append(paragraph);});article.append(image,h2,meta,summary,body);dialog.append(heading,note,article);document.body.append(dialog);
  close.addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>{dialog.remove();editor.querySelector('[data-preview-content]').focus({preventScroll:true});});dialog.addEventListener('click',event=>{const box=dialog.getBoundingClientRect();if(event.target===dialog&&(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom))dialog.close();});dialog.showModal();
 });
}

// Table views are stored only in this browser session and scoped to the signed-in user.
const tableTools=document.querySelector('[data-table-key]');
if(tableTools){
 const storageKey=`kemsor-table:${tableTools.dataset.tableUser}:${tableTools.dataset.tableKey}`;
 const status=tableTools.querySelector('[data-table-view-status]'),load=tableTools.querySelector('[data-load-table-view]');
 try{load.disabled=!sessionStorage.getItem(storageKey);}catch{}
 tableTools.querySelector('[data-save-table-view]').addEventListener('click',()=>{try{sessionStorage.setItem(storageKey,location.pathname+location.search);load.disabled=false;status.textContent='View saved for this session.';}catch{status.textContent='Your browser could not save this view.';}});
 load.addEventListener('click',()=>{try{const saved=sessionStorage.getItem(storageKey);if(!saved)return;const url=new URL(saved,location.origin);if(url.origin===location.origin&&url.pathname===location.pathname)location.assign(url.href);}catch{status.textContent='Unable to load the saved view.';}});
 const form=document.getElementById('table-bulk-form'),all=document.querySelector('[data-select-page]'),rows=[...document.querySelectorAll('[data-row-select]')];
 const sync=()=>{const selected=rows.filter(row=>row.checked).length;form.querySelector('[data-selection-count]').textContent=`${selected} selected`;form.querySelector('[data-bulk-submit]').disabled=!selected;form.dataset.confirm=`Apply this status change to ${selected} selected ${selected===1?'record':'records'}?`;all.checked=rows.length>0&&selected===rows.length;all.indeterminate=selected>0&&selected<rows.length;};
 all.addEventListener('change',()=>{rows.forEach(row=>row.checked=all.checked);sync();});rows.forEach(row=>row.addEventListener('change',sync));form.querySelector('[data-clear-selection]').addEventListener('click',()=>{rows.forEach(row=>row.checked=false);sync();});sync();
}

for(const preview of document.querySelectorAll('.resume-preview'))preview.addEventListener('toggle',()=>{if(preview.open){const frame=preview.querySelector('[data-resume-src]');if(!frame.getAttribute('src'))frame.src=frame.dataset.resumeSrc;}});

const imageDialog=document.querySelector('[data-image-dialog]');
function previewLibraryImage(src,title){if(!imageDialog)return;imageDialog.querySelector('[data-image-dialog-title]').textContent=title;const img=imageDialog.querySelector('[data-image-dialog-image]');img.src=src;img.alt=title;imageDialog.showModal();}
imageDialog?.querySelector('[data-close-image]').addEventListener('click',()=>imageDialog.close());
imageDialog?.addEventListener('click',event=>{if(event.target===imageDialog){const box=imageDialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)imageDialog.close();}});
for(const button of document.querySelectorAll('[data-image-preview]'))button.addEventListener('click',()=>previewLibraryImage(button.dataset.imagePreview,button.dataset.imageTitle));
for(const img of document.querySelectorAll('[data-image-dimensions]')){const update=()=>{img.closest('.library-card').querySelector('[data-dimensions]').textContent=`${img.naturalWidth} × ${img.naturalHeight} px`;};img.addEventListener('load',update);img.addEventListener('error',()=>{img.closest('.library-card').querySelector('[data-dimensions]').textContent='Image unavailable';});if(img.complete&&img.naturalWidth)update();}
for(const select of document.querySelectorAll('[data-library-banner]')){const box=select.closest('.blog-banner-fields').querySelector('.library-banner-selection'),img=box.querySelector('[data-selected-banner]');const update=()=>{box.hidden=!select.value;if(select.value)img.src=`/media/${select.value}`;};select.addEventListener('change',update);box.querySelector('[data-selected-preview]').addEventListener('click',()=>previewLibraryImage(img.src,select.selectedOptions[0].textContent));update();}
