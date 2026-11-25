window.createAdminUploadProgress=()=>{
 const element=document.createElement('div');
 element.className='media-progress-ring';
 element.hidden=true;
 const caption=document.createElement('span');
 caption.setAttribute('aria-hidden','true');
 element.append(caption);
 const update=(state,percent)=>{
  element.hidden=state==='idle';
  element.dataset.state=state;
  element.style.setProperty('--media-upload-percent',`${percent??(state==='complete'?100:0)}%`);
  caption.textContent=state==='complete'?'✓':state==='error'?'!':Number.isFinite(percent)?`${percent}%`:'';
  if(state==='uploading'||state==='processing'){
   element.setAttribute('role','progressbar');
   element.setAttribute('aria-label',state==='processing'?'Processing upload':'Uploading file');
   if(Number.isFinite(percent))element.setAttribute('aria-valuenow',String(percent));
   else element.removeAttribute('aria-valuenow');
  }else{
   element.removeAttribute('role');
   element.removeAttribute('aria-label');
   element.removeAttribute('aria-valuenow');
  }
 };
 return {element,update};
};

// Stage media first; content saves contain only the completed asset reference.
const initializeMediaUploads=form=>{
 if(new URL(form.getAttribute('action')||location.href,location.href).pathname==='/admin/media')return;
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
 for(const target of form.querySelectorAll('[data-gallery-field=media_id]'))targets.push({target,kind:'image'});
 if(!targets.length)return;
 const stages=form._mediaUploadStages||(form._mediaUploadStages=[]);
 for(const {target,file:provided,kind}of targets){
  if(target.dataset['uploadReady'+kind])continue;target.dataset['uploadReady'+kind]='true';
  const placement=target.closest('[data-image-placement]');
  const showUploadPreview=!placement&&!form.matches('[data-media-partner-editor]');
  const box=document.createElement('div');box.className='media-upload-stage';if(target.name)box.dataset.mediaFor=target.name;
  const file=provided||document.createElement('input');
  const providedLabel=provided?.closest('label');
  let chooseFile,filename,picker;
  if(!provided){
   file.type='file';
   file.accept=kind==='video'?'video/mp4':kind==='captions'?'.vtt,text/vtt':kind==='document'?'application/pdf':'image/jpeg,image/png,image/webp,image/avif';
  }
  if(kind==='image'){
   file.hidden=true;
   const title=document.createElement('span');
   title.className='media-image-upload-title';
   title.textContent=providedLabel?.firstChild?.textContent.trim()||'Choose a new image';
   picker=document.createElement('div');
   picker.className='image-placement-picker';
   chooseFile=document.createElement('button');
   chooseFile.type='button';
   chooseFile.className='quiet image-placement-choose';
   chooseFile.textContent='Choose file';
   chooseFile.addEventListener('click',()=>file.click());
   filename=document.createElement('span');
   filename.className='image-placement-filename';
   filename.setAttribute('aria-live','polite');
   picker.append(chooseFile,file);
   box.append(title,picker,filename);
   const help=providedLabel?.querySelector('small');
   if(help)box.append(help);
  }else if(!provided){
   const label=document.createElement('label');
   label.textContent=kind==='video'?'Upload an MP4 video (up to 50 MB)':kind==='captions'?'Upload WebVTT subtitles':'Upload a PDF document (up to 10 MB)';
   label.append(file);
   box.append(label);
  }
  const descriptionField=placement?.querySelector('[data-placement-description]')||
   (target.dataset.imageDescriptionField&&form.elements.namedItem(target.dataset.imageDescriptionField));
  const alt=provided?form.querySelector('[data-banner-alt]'):null;
  const description=alt||descriptionField||document.createElement('input');
  if(!alt&&!descriptionField){description.type='text';description.maxLength=300;const label=document.createElement('label');label.textContent=kind==='video'?'Video description':kind==='document'?'Document title':kind==='captions'?'Subtitle description':'Image description (optional)';label.append(description);box.append(label);}
  const upload=document.createElement('button');upload.type='button';upload.className='quiet';upload.textContent=kind==='video'?'Upload video':kind==='captions'?'Upload subtitles':kind==='document'?'Upload PDF':'Upload image';upload.disabled=true;
  const cancel=document.createElement('button');cancel.type='button';cancel.className='quiet';cancel.textContent='Cancel selection';cancel.hidden=true;
  const progress=window.createAdminUploadProgress();
  const status=document.createElement('span');status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.tabIndex=-1;
  const actions=picker||document.createElement('div');
  if(picker)upload.classList.add('media-image-submit');
  else actions.className='button-row';
  if(!placement)actions.append(upload);
  actions.append(cancel);
  if(!picker)box.append(actions);
  const feedback=document.createElement('div');
  feedback.className='media-progress-feedback';
  feedback.append(progress.element,status);
  box.append(feedback);
  const preview=placement?.querySelector('[data-placement-preview]')||document.createElement(kind==='video'?'video':kind==='image'?'img':'a');if(['captions','document'].includes(kind)){preview.textContent='Open uploaded file';preview.target='_blank';preview.rel='noopener';}preview.className='media-upload-preview';if(!placement)preview.hidden=true;if(kind==='video'){preview.controls=true;preview.preload='metadata';}else if(!placement)preview.alt='Uploaded image preview';if(showUploadPreview)box.append(preview);
  if(placement){
   const mount=placement.querySelector('[data-placement-upload]');
   mount.append(box);
   mount.hidden=false;
   target.addEventListener('change',()=>{
    const url=target.value.trim();
    if(url)preview.src=url;
    else preview.removeAttribute('src');
    preview.hidden=!url;
   });
  }else if(providedLabel){
   providedLabel.after(box);
   if(picker)providedLabel.hidden=true;
  }else target.closest('label').after(box);
  if(target.tagName==='SELECT'&&!target.hasAttribute('data-keep-image-select'))target.closest('label').hidden=true;
  const state={file,status,busy:false,pending:false};stages.push(state);let xhr,uploadController,uploadedReference;
  const updateFilename=()=>{if(filename)filename.textContent=file.files[0]?.name||'';};
  const clearFile=()=>{
   file.value='';
   updateFilename();
   state.pending=false;
   upload.disabled=true;
   cancel.hidden=true;
  };
  if(kind==='image'&&target.tagName==='SELECT')target.addEventListener('change',()=>{
   if(target.value&&(!uploadedReference||target.value===uploadedReference))return;
   uploadedReference=undefined;
   if(!target.value){
    uploadController?.abort();
    xhr?.abort();
    clearFile();
    description.value='';
   }
   progress.update('idle');
   status.textContent='';
   preview.removeAttribute('src');
   preview.hidden=true;
  });
  file.addEventListener('change',()=>{updateFilename();state.pending=Boolean(file.files.length);upload.disabled=!state.pending;cancel.hidden=!state.pending;status.textContent=state.pending?(placement?'Ready to save.':'Ready to upload. Upload this file before saving the form.'):'';progress.update('idle');});
  cancel.addEventListener('click',()=>{clearFile();progress.update('idle');status.textContent='Selection cancelled. The previous media is kept.';});
  const uploadFile=async()=>{
   const selected=file.files[0];if(!selected||state.busy||form.dataset.mediaUploading==='true')return;
   if(kind!=='image'&&!description.value.trim()){status.textContent='Add a description before uploading.';description.focus();return;}
   const limit=kind==='document'?10:kind==='captions'?1:50;
   if(selected.size>limit*1024*1024){status.textContent=`Choose a file of up to ${limit} MB.`;return;}
   const pageWasDisabled=page?.disabled;if(page)page.disabled=true;state.busy=true;form.dataset.mediaUploading='true';cancel.disabled=true;file.disabled=true;if(chooseFile)chooseFile.disabled=true;upload.disabled=true;progress.update('uploading');status.textContent='Uploading…';
   const buttons=[...form.querySelectorAll('button:not([type="button"]),input[type="submit"]')].map(button=>[button,button.disabled]);buttons.forEach(([button])=>button.disabled=true);
   const controller=new AbortController();
   uploadController=controller;
   try{
    const session=await fetch('/api/csrf',{headers:{Accept:'application/json'},signal:controller.signal});if(!session.ok)throw new Error('Your session expired. Sign in again and retry.');
    const {token}=await session.json();if(controller.signal.aborted)return;const csrf=form.querySelector('input[name="_csrf"]');if(csrf)csrf.value=token;
    const data=new FormData();data.set('_csrf',token);data.set('image',selected);data.set('kind',kind);if(target.name==='epk_url')data.set('epk_private','true');data.set('alt',description.value.trim());
    const result=await new Promise((resolve,reject)=>{
     xhr=new XMLHttpRequest();xhr.open('POST','/admin/media/upload');xhr.setRequestHeader('Accept','application/json');xhr.timeout=600000;
     const processing=()=>{if(controller.signal.aborted)return;progress.update('processing');status.textContent='Processing upload…';};
     xhr.upload.onprogress=event=>{
      if(controller.signal.aborted||!event.lengthComputable||!event.total)return;
      if(event.loaded>=event.total){processing();return;}
      progress.update('uploading',Math.min(99,Math.round(event.loaded/event.total*100)));
     };
     xhr.upload.onload=processing;
     xhr.onload=()=>{let body;try{body=JSON.parse(xhr.responseText);}catch{reject(new Error('Upload could not be confirmed. Sign in again if needed, then retry.'));return;}if(xhr.status!==201){reject(new Error(body.error||'Upload failed. Please retry.'));return;}resolve(body);};
     xhr.onerror=()=>reject(new Error('Connection failed. Your form is kept; retry the upload.'));xhr.ontimeout=()=>reject(new Error('Upload timed out. Please retry.'));xhr.onabort=()=>reject(new Error('Upload cancelled.'));xhr.send(data);
    });
    if(controller.signal.aborted)return;
    if(target.tagName==='SELECT'){const option=new Option(`${result.name} · ${result.alt}`,String(result.id),true,true);option.dataset.mediaAlt=result.alt;option.dataset.mediaName=result.name;target.append(option);target.value=String(result.id);}else target.value=result.url;
    uploadedReference=target.value;
    target.dispatchEvent(new Event('change',{bubbles:true}));target.dispatchEvent(new Event('input',{bubbles:true}));
    clearFile();progress.update('complete');status.textContent='Upload complete.';if(['captions','document'].includes(kind))preview.href=result.url;else preview.src=result.url;preview.hidden=false;
    return true;
   }catch(error){if(!controller.signal.aborted){progress.update('error');status.textContent=error.message;}}
   finally{state.busy=false;if(page)page.disabled=pageWasDisabled;delete form.dataset.mediaUploading;cancel.disabled=false;file.disabled=false;if(chooseFile)chooseFile.disabled=false;upload.disabled=!state.pending;buttons.forEach(([button,disabled])=>button.disabled=disabled);xhr=null;uploadController=null;}
  };
  upload.addEventListener('click',uploadFile);
  if(placement)state.uploadOnSave=uploadFile;
 }
 if(form.dataset.uploadHandlers==='true')return;form.dataset.uploadHandlers='true';
 if(pageMedia&&page)page.addEventListener('change',()=>{if(pageMedia.hidden)for(const state of stages){if(state.file.closest('[data-page-video-fields]')){state.file.value='';state.pending=false;state.status.textContent='';}}});
 form.addEventListener('submit',async event=>{
  const blocked=stages.find(state=>state.file.isConnected&&(state.busy||state.pending));if(!blocked)return;
  event.preventDefault();event.stopImmediatePropagation();
  if(blocked.uploadOnSave&&!blocked.busy&&['publish','draft'].includes(event.submitter?.value)){
   if(await blocked.uploadOnSave())form.requestSubmit(event.submitter);
   return;
  }
  blocked.status.textContent=blocked.busy?'Wait for the upload to finish before saving.':'Upload the selected file or cancel its selection before saving.';blocked.status.focus();blocked.status.scrollIntoView({block:'center'});
 },true);
};
for(const form of document.querySelectorAll('main form[method="post"],main form[method="POST"]')){
 initializeMediaUploads(form);
 if(form.querySelector('[data-production-gallery],[data-production-collection]'))new MutationObserver(()=>initializeMediaUploads(form)).observe(form,{childList:true,subtree:true});
}
