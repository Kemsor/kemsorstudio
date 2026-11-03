// Stage media first; content saves contain only the completed asset reference.
for(const form of document.querySelectorAll('main form[method="post"],main form[method="POST"]')){
 if(new URL(form.getAttribute('action')||location.href,location.href).pathname==='/admin/media')continue;
 const image=form.querySelector('select[name="image_id"]');
 const existingFile=form.querySelector('input[type="file"][name="image"]');
 const targets=[];
 if(image)targets.push({target:image,file:existingFile,kind:'image'});
 const hero=(form.getAttribute('action')||'').includes('/admin/manage/hero/save');
 if(hero)for(const [name,kind]of [['src','video'],['poster','image']]){const target=form.querySelector(`input[name="${name}"]`);if(target)targets.push({target,kind});}
 for(const target of form.querySelectorAll('[data-content-video]'))targets.push({target,kind:'video'});
 for(const target of form.querySelectorAll('[data-image-url]'))targets.push({target,kind:'image'});
 for(const target of form.querySelectorAll('[data-caption-upload]'))targets.push({target,kind:'captions'});
 for(const target of form.querySelectorAll('[data-document-upload]'))targets.push({target,kind:'document'});
 const pageMedia=form.querySelector('[data-page-video-fields]'),page=form.querySelector('select[name="page"]');
 if(pageMedia&&page){const toggle=()=>{const enabled=['feature-films','series-ott','documentaries','productions'].includes(page.value);pageMedia.hidden=!enabled;pageMedia.querySelectorAll('input').forEach(input=>input.disabled=!enabled);};page.addEventListener('change',toggle);toggle();}
 if(!targets.length)continue;
 const stages=[];
 for(const {target,file:provided,kind}of targets){
  const box=document.createElement('div');box.className='media-upload-stage';
  const file=provided||document.createElement('input');
  if(!provided){file.type='file';file.accept=kind==='video'?'video/mp4':kind==='captions'?'.vtt,text/vtt':kind==='document'?'application/pdf':'image/jpeg,image/png,image/webp,image/avif';const label=document.createElement('label');label.textContent=kind==='video'?'Upload an MP4 video (up to 50 MB)':kind==='captions'?'Upload WebVTT subtitles':kind==='document'?'Upload a PDF document':'Upload a new image';label.append(file);box.append(label);}
  const alt=provided?form.querySelector('[data-banner-alt]'):null;
  const description=alt||document.createElement('input');
  if(!alt){description.type='text';description.maxLength=300;const label=document.createElement('label');label.textContent=kind==='video'?'Video description':kind==='document'?'Document title':kind==='captions'?'Subtitle description':'Image description';label.append(description);box.append(label);}
  const upload=document.createElement('button');upload.type='button';upload.className='quiet';upload.textContent=kind==='video'?'Upload video':kind==='captions'?'Upload subtitles':kind==='document'?'Upload PDF':'Upload image';upload.disabled=true;
  const cancel=document.createElement('button');cancel.type='button';cancel.className='quiet';cancel.textContent='Cancel selection';cancel.hidden=true;
  const progress=document.createElement('progress');progress.max=100;progress.value=0;progress.hidden=true;progress.setAttribute('aria-label','Media upload progress');
  const status=document.createElement('span');status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.tabIndex=-1;
  const actions=document.createElement('div');actions.className='button-row';actions.append(upload,cancel);box.append(actions,progress,status);
  const preview=document.createElement(kind==='video'?'video':kind==='image'?'img':'a');if(['captions','document'].includes(kind)){preview.textContent='Open uploaded file';preview.target='_blank';preview.rel='noopener';}preview.className='media-upload-preview';preview.hidden=true;if(kind==='video'){preview.controls=true;preview.preload='metadata';}else preview.alt='Uploaded image preview';box.append(preview);
  if(provided)provided.closest('label').after(box);else target.closest('label').after(box);
  const state={file,status,busy:false,pending:false};stages.push(state);let xhr;
  file.addEventListener('change',()=>{state.pending=Boolean(file.files.length);upload.disabled=!state.pending;cancel.hidden=!state.pending;status.textContent=state.pending?'Ready to upload. Upload this file before saving the form.':'';progress.hidden=true;});
  cancel.addEventListener('click',()=>{xhr?.abort();file.value='';state.pending=false;upload.disabled=true;cancel.hidden=true;progress.hidden=true;status.textContent='Selection cancelled. The previous media is kept.';if(alt)alt.required=false;});
  upload.addEventListener('click',async()=>{
   const selected=file.files[0];if(!selected||state.busy||form.dataset.mediaUploading==='true')return;
   if(!description.value.trim()){status.textContent='Add a description before uploading.';description.focus();return;}
   if(selected.size>50*1024*1024){status.textContent='Choose a file of up to 50 MB.';return;}
   const pageWasDisabled=page?.disabled;if(page)page.disabled=true;state.busy=true;form.dataset.mediaUploading='true';cancel.disabled=true;file.disabled=true;upload.disabled=true;progress.hidden=false;progress.value=0;status.textContent='Uploading…';
   const buttons=[...form.querySelectorAll('button:not([type="button"]),input[type="submit"]')].map(button=>[button,button.disabled]);buttons.forEach(([button])=>button.disabled=true);
   try{
    const session=await fetch('/api/csrf',{headers:{Accept:'application/json'}});if(!session.ok)throw new Error('Your session expired. Sign in again and retry.');
    const {token}=await session.json();const csrf=form.querySelector('input[name="_csrf"]');if(csrf)csrf.value=token;
    const data=new FormData();data.set('_csrf',token);data.set('image',selected);data.set('kind',kind);data.set('alt',description.value.trim());
    const result=await new Promise((resolve,reject)=>{
     xhr=new XMLHttpRequest();xhr.open('POST','/admin/media/upload');xhr.setRequestHeader('Accept','application/json');xhr.timeout=600000;
     xhr.upload.onprogress=event=>{if(event.lengthComputable){const percent=Math.round(event.loaded/event.total*100);progress.value=percent;status.textContent=percent===100?'Processing upload…':`Uploading ${percent}%`;}};
     xhr.onload=()=>{let body;try{body=JSON.parse(xhr.responseText);}catch{reject(new Error('Upload could not be confirmed. Sign in again if needed, then retry.'));return;}if(xhr.status!==201){reject(new Error(body.error||'Upload failed. Please retry.'));return;}resolve(body);};
     xhr.onerror=()=>reject(new Error('Connection failed. Your form is kept; retry the upload.'));xhr.ontimeout=()=>reject(new Error('Upload timed out. Please retry.'));xhr.onabort=()=>reject(new Error('Upload cancelled.'));xhr.send(data);
    });
    if(target.tagName==='SELECT'){const option=new Option(`${result.name} · ${result.alt}`,String(result.id),true,true);target.append(option);target.value=String(result.id);}else target.value=result.url;
    target.dispatchEvent(new Event('change',{bubbles:true}));target.dispatchEvent(new Event('input',{bubbles:true}));
    file.value='';state.pending=false;if(alt)alt.required=false;progress.value=100;status.textContent='Uploaded successfully. You can now save the rest of the form.';cancel.hidden=true;if(['captions','document'].includes(kind))preview.href=result.url;else preview.src=result.url;preview.hidden=false;
   }catch(error){status.textContent=error.message;}
   finally{state.busy=false;if(page)page.disabled=pageWasDisabled;delete form.dataset.mediaUploading;cancel.disabled=false;file.disabled=false;upload.disabled=!state.pending;buttons.forEach(([button,disabled])=>button.disabled=disabled);xhr=null;}
  });
 }
 if(pageMedia&&page)page.addEventListener('change',()=>{if(pageMedia.hidden)for(const state of stages){if(state.file.closest('[data-page-video-fields]')){state.file.value='';state.pending=false;state.status.textContent='';}}});
 form.addEventListener('submit',event=>{
  const blocked=stages.find(state=>state.busy||state.pending);if(!blocked)return;
  event.preventDefault();event.stopImmediatePropagation();blocked.status.textContent=blocked.busy?'Wait for the upload to finish before saving.':'Upload the selected file or cancel its selection before saving.';blocked.status.focus();blocked.status.scrollIntoView({block:'center'});
 },true);
}
