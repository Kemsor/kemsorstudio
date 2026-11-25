import {publishingChecks,publishingValues} from './publishing-preview-model.js?v=4';
const make=(tag,className,text)=>{const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;};
function publicationErrors(form,checks){
 form.querySelector('[data-publication-errors]')?.remove();
 const box=make('div','admin-form-feedback'),title=make('strong','','Complete the required publishing details.');box.dataset.publicationErrors='true';box.setAttribute('role','alert');box.tabIndex=-1;box.append(title);
 const list=make('ul');for(const check of checks){const li=make('li'),button=make('button','quiet',check.message);button.type='button';button.addEventListener('click',()=>{const field=form.elements.namedItem(check.field);window.adminRevealField?.(field);field?.focus?.();field?.scrollIntoView?.({block:'center'});});li.append(button);list.append(li);}box.append(list);form.prepend(box);box.focus();
}
for(const form of document.querySelectorAll('main form')){
 const shared=Boolean(form.querySelector('[data-preview-content]'));
 const publishButtons=form.querySelectorAll('button[name="publish_action"][value="published"],button[name="action"][value="publish"]');
 if(!shared&&!publishButtons.length)continue;
 let approved=false;
 form.addEventListener('submit',event=>{
  const button=event.submitter,values=publishingValues(form),publishing=button?.name==='publish_action'?button.value==='published':button?.name==='action'?button.value==='publish':shared&&values.status==='published';
  if(!publishing||event.defaultPrevented)return;
  if(approved){approved=false;return;}
  event.preventDefault();event.stopImmediatePropagation();form.querySelector('[data-publication-errors]')?.remove();
  const checks=[];
  if(shared){const select=form.querySelector('select[name="image_id"]'),file=form.querySelector('input[type=file][name=image]')?.files[0];checks.push(...publishingChecks({...values,status:'published'},{hasImage:Boolean(select?.value||file),imageAlt:file?(values.banner_alt||''):(select?.selectedOptions[0]?.dataset.mediaAlt||''),pendingUpload:Boolean(file)}));}
  for(const field of form.elements)if(field.willValidate&&!field.checkValidity()&&!checks.some(check=>check.field===field.name))checks.push({field:field.name,message:field.validationMessage,level:'required'});
  const required=checks.filter(check=>check.level==='required');if(required.length){publicationErrors(form,required);return;}
  const dialog=make('dialog','publication-review-dialog');dialog.setAttribute('aria-label','Review publication');
  const heading=make('h2','','Review publication'),description=make('p','','Publishing applies these form values to the website.'),details=make('dl','publication-review-details');
  const target=values.title||values.name||values.label||document.querySelector('main h1')?.textContent||'Website content';
  const entries=[['Item',target],['Publishing state','Published'],...(values.type?[['Content area',values.type]]:[]),...(values.page?[['Website page',values.page]]:[]),...(values.category?[['Category',values.category]]:[]),...(values.work_arrangement?[['Work arrangement',values.work_arrangement]]:[]),...(values.location?[['Location',values.location]]:[]),...(values.image_id?[['Image','Selected image #'+values.image_id]]:[])];
  for(const [label,value]of entries){const row=make('div');row.append(make('dt','',label),make('dd','',value));details.append(row);}
  const optional=checks.filter(check=>check.level!=='required');if(optional.length){const suggestions=make('details','publication-suggestions'),summary=make('summary','',`${optional.length} optional ${optional.length===1?'improvement':'improvements'}`),list=make('ul');for(const check of optional)list.append(make('li','',check.message));suggestions.append(summary,list);dialog.append(heading,description,details,suggestions);}else dialog.append(heading,description,details);
  const actions=make('div','button-row'),cancel=make('button','quiet','Keep editing'),confirm=make('button','publication-confirm','Publish now');cancel.type=confirm.type='button';actions.append(cancel,confirm);dialog.append(actions);document.body.append(dialog);
  cancel.addEventListener('click',()=>dialog.close());confirm.addEventListener('click',()=>{approved=true;dialog.close();form.requestSubmit(button||undefined);});dialog.addEventListener('close',()=>{dialog.remove();button?.focus({preventScroll:true});});dialog.showModal();cancel.focus();
 },true);
}
for(const form of document.querySelectorAll('form.editor')){
 const id=Number(form.querySelector('input[name=id]')?.value),version=form.querySelector('input[name=revision]');if(!id||!version||!form.querySelector('[data-preview-content]'))continue;
 let busy=false;
 const check=async()=>{
  if(document.hidden||busy)return;busy=true;
  try{const response=await fetch(`/admin/content/${id}/version`,{headers:{Accept:'application/json'}});if(!response.ok)return;const latest=await response.json();if(Number(latest.revision)<=Number(version.value))return;
   let banner=form.querySelector('[data-newer-version]');if(!banner){banner=make('div','publishing-newer-version');banner.dataset.newerVersion='true';banner.setAttribute('role','status');form.prepend(banner);}
   const copy=make('span','',`A newer saved version is available${latest.editor?' from '+latest.editor:''}${latest.updatedAt?' ('+latest.updatedAt+' UTC)':''}. Your unsaved entries are kept.`),link=make('a','','Open latest saved version');link.href=latest.editorUrl;link.target='_blank';link.rel='noopener noreferrer';banner.replaceChildren(copy,link);
  }catch{/* A failed check never changes the form or its save version. */}finally{busy=false;}
 };
 let timer;const start=()=>{clearInterval(timer);check();timer=setInterval(check,30000);};start();addEventListener('pageshow',start);addEventListener('focus',check);document.addEventListener('visibilitychange',check);addEventListener('pagehide',()=>clearInterval(timer));
}
const changesOnly=document.querySelector('[data-revision-changes-only]');if(changesOnly){const update=()=>document.querySelectorAll('[data-revision-field]').forEach(row=>{row.hidden=changesOnly.checked&&row.dataset.changed!=='true';});changesOnly.addEventListener('change',update);update();}
