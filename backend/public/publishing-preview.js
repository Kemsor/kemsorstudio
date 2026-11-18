import {previewBody,publishingChecks} from './publishing-preview-model.js';

const node=(tag,className,text)=>{const element=document.createElement(tag);if(className)element.className=className;if(text!==undefined)element.textContent=text;return element;};
function viewport(article){
 const host=node('div','publishing-preview-surface'),controls=node('div','preview-device-controls'),label=node('span','preview-device-size'),hint=node('p','preview-link-hint');hint.setAttribute('role','status');
 controls.setAttribute('role','group');controls.setAttribute('aria-label','Preview screen size');
 const scroll=node('div','preview-frame-scroll'),frame=node('iframe','publishing-preview-frame');frame.setAttribute('sandbox','allow-same-origin');frame.height='640';
 const sizes=[['desktop','Desktop',1024],['mobile','Mobile',375]],buttons=[];
 const setSize=type=>{const selected=sizes.find(item=>item[0]===type);frame.width=String(selected[2]);frame.title=selected[1]+' content preview';label.textContent=selected[2]+' px';buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.device===type)));};
 for(const [type,text]of sizes){const button=node('button','quiet',text);button.type='button';button.dataset.device=type;button.addEventListener('click',()=>setSize(type));buttons.push(button);controls.append(button);}
 controls.append(label);scroll.append(frame);host.append(controls,scroll,hint);
 const doc=document.implementation.createHTMLDocument('Private publishing preview');doc.documentElement.lang='en';
 const base=doc.createElement('base');base.href=location.origin+'/';doc.head.append(base);
 const meta=doc.createElement('meta');meta.name='viewport';meta.content='width=device-width, initial-scale=1';doc.head.append(meta);
 const css=doc.createElement('link');css.rel='stylesheet';css.href=location.origin+'/publishing-preview-frame.css?v=1';doc.head.append(css);doc.body.append(doc.importNode(article,true));
 frame.addEventListener('load',()=>{
  const content=frame.contentDocument;if(!content)return;
  for(const link of content.querySelectorAll('a'))link.title=link.getAttribute('href');
  content.addEventListener('click',event=>{const link=event.target.closest('a');if(link){event.preventDefault();hint.textContent='Link destination: '+link.getAttribute('href');}});
 });
 frame.srcdoc='<!doctype html>'+doc.documentElement.outerHTML;setSize(matchMedia('(max-width:600px)').matches?'mobile':'desktop');
 return host;
}
const readImage=async editor=>{
 const selected=editor.querySelector('select[name="image_id"]')?.selectedOptions[0],file=editor.querySelector('input[name="image"][type=file]')?.files[0];
 const uploaded=file&&['image/png','image/jpeg','image/webp','image/avif'].includes(file.type);
 let src=selected?.value?'/media/'+encodeURIComponent(selected.value):'';
 if(uploaded)src=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('The selected image could not be previewed.'));reader.readAsDataURL(file);});
 return {src,alt:uploaded?(editor.querySelector('[name="banner_alt"]')?.value||''):(selected?.dataset.mediaAlt||''),pendingUpload:Boolean(file),name:selected?.dataset.mediaName||''};
};
for(const editor of document.querySelectorAll('form.editor')){
 const trigger=editor.querySelector('[data-preview-content]');if(!trigger)continue;trigger.classList.add('publishing-preview-trigger');
 for(const button of editor.querySelectorAll('button[name="publish_action"][value="published"]')){button.classList.add('publishing-publish');button.setAttribute('aria-label',button.textContent.trim());button.title='Publish this content to the website';}
 trigger.addEventListener('click',async()=>{
  editor.querySelector('[data-preview-error]')?.remove();
  if(!editor.dispatchEvent(new Event('admin:preview',{cancelable:true})))return;
  trigger.disabled=true;
  try{
   const values=Object.fromEntries(new FormData(editor)),image=await readImage(editor),body=previewBody(values),checks=publishingChecks(values,{hasImage:Boolean(image.src),imageAlt:image.alt,pendingUpload:image.pendingUpload});
   for(const field of editor.elements){if(field.required&&!field.disabled&&field.willValidate&&!field.checkValidity()&&!checks.some(check=>check.field===field.name))checks.push({field:field.name,message:field.validationMessage,level:'required'});}
   const dialog=node('dialog','publishing-preview-dialog publishing-preview-expanded');dialog.setAttribute('aria-label','Unsaved publishing preview');
   const heading=node('div','publishing-preview-heading'),title=node('strong','','Unsaved publishing preview'),close=node('button','quiet','Close preview');close.type='button';heading.append(title,close);
   const note=node('p','preview-notice','Current form values • Not saved or published. Close this preview to keep editing.');
   const checklist=node('details','publishing-readiness'),summary=node('summary','',checks.length?`${checks.length} ${checks.length===1?'item':'items'} to review before publishing`:'Publishing checks complete');checklist.open=checks.length>0;checklist.append(summary);
   if(checks.length){const list=node('ul');for(const check of checks){const item=node('li',check.level==='required'?'needs-detail':'suggestion'),button=node('button','quiet',check.message);button.type='button';button.addEventListener('click',()=>{dialog.close();const field=editor.elements.namedItem(check.field);const visible=check.field==='body'?editor.querySelector('.rich-editor-surface'):field;visible?.focus?.();visible?.scrollIntoView({block:'center',behavior:'instant'});});item.append(button);list.append(item);}checklist.append(list);if(image.src&&!image.alt&&!image.pendingUpload){const library=node('a','', 'Edit the image description in Media library');library.href='/admin/media?q='+encodeURIComponent(image.name);library.target='_blank';library.rel='noopener noreferrer';checklist.append(library);}}
   else checklist.append(node('p','','The title, content and publishing details checked here are filled in.'));
   const article=node('article','content-preview');article.append(node('p','preview-kicker',values.type||'Content'));
   if(image.src){const img=node('img');img.src=image.src;img.alt=image.alt;article.append(img);}
   article.append(node('h1','',values.title?.trim()||'Untitled draft'));
   const metadata=[values.category,values.role,values.location].filter(Boolean).join(' · ');if(metadata)article.append(node('p','preview-metadata',metadata));
   if(values.summary)article.append(node('p','preview-summary',values.summary));
   const content=node('div','preview-body');content.innerHTML=body;article.append(content);
   dialog.append(heading,note,checklist,viewport(article));document.body.append(dialog);
   close.addEventListener('click',()=>dialog.close());
   dialog.addEventListener('close',()=>{dialog.remove();trigger.focus({preventScroll:true});});
   dialog.showModal();
  }catch(error){let feedback=editor.querySelector('[data-preview-error]');if(!feedback){feedback=node('p','admin-field-error');feedback.dataset.previewError='true';feedback.setAttribute('role','alert');trigger.after(feedback);}feedback.textContent=error.message;}
  finally{trigger.disabled=false;}
 });
}
// Saved previews use the same isolated desktop/mobile viewport, with their saved-content label intact.
const saved=document.querySelector('main>article.content-preview');if(saved)saved.replaceWith(viewport(saved));
