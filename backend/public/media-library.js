const make=(tag,className,text)=>{const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;};
for(const button of document.querySelectorAll('[data-copy-media]'))button.addEventListener('click',async()=>{
 const card=button.closest('.library-card'),input=card.querySelector('input[readonly]'),feedback=card.querySelector('[data-copy-feedback]');
 try{await navigator.clipboard.writeText(new URL(input.value,location.origin).href);feedback.textContent='Media URL copied.';}
 catch{input.focus();input.select();feedback.textContent='URL selected. Copy it with your keyboard.';}
});
for(const select of document.querySelectorAll('form select[name="image_id"]')){
 const controls=make('div','image-picker-controls'),choose=make('button','quiet','Choose image'),remove=make('button','quiet','Remove image'),current=make('span','image-picker-current'),thumb=make('img','image-picker-thumb'),status=make('span','image-picker-status');
 choose.type=remove.type='button';status.setAttribute('role','status');current.append(thumb,status);controls.append(choose,remove,current);
 const label=select.closest('label');if(label){const host=make('div',label.className);label.replaceWith(host);host.append(label,controls);}else select.after(controls);
 const update=()=>{const option=select.selectedOptions[0];thumb.hidden=!select.value;remove.disabled=!select.value;if(select.value){thumb.src='/media/'+encodeURIComponent(select.value);thumb.alt=option?.dataset.mediaAlt||'';}status.textContent=select.value?(option?.dataset.mediaName||option?.textContent||'Selected image'):'No image selected';};select.addEventListener('change',update);update();
 remove.addEventListener('click',()=>{select.value='';select.dispatchEvent(new Event('input',{bubbles:true}));select.dispatchEvent(new Event('change',{bubbles:true}));});
 choose.addEventListener('click',()=>{
  if(select.form.dataset.mediaUploading==='true'||select.form.querySelector('input[type=file][name=image]')?.files.length){status.textContent='Upload or cancel the selected file before choosing a library image.';return;}
  const dialog=make('dialog','image-picker-dialog'),heading=make('div','publishing-preview-heading'),title=make('strong','','Choose an image'),close=make('button','quiet','Close image picker');close.type='button';heading.append(title,close);
  const label=make('label','','Search images'),search=make('input');search.type='search';search.placeholder='File name or image description';label.append(search);
  const refresh=make('button','quiet','Refresh library');refresh.type='button';
  const count=make('p','image-picker-count');count.setAttribute('role','status');const grid=make('div','image-picker-grid'),empty=make('p','empty','No images match your search. Try another name or description.');
  const library=make('a','', 'Upload or manage images in Media library');library.href='/admin/media?kind=image';library.target='_blank';library.rel='noopener noreferrer';
  let options=[...select.options].filter(option=>/^\d+$/.test(option.value));
  const render=()=>{const term=search.value.toLocaleLowerCase().trim(),shown=options.filter(option=>`${option.dataset.mediaName||option.textContent} ${option.dataset.mediaAlt||''}`.toLocaleLowerCase().includes(term));grid.replaceChildren();count.textContent=`${shown.length} ${shown.length===1?'image':'images'}`;empty.hidden=shown.length>0;
   for(const option of shown){const name=option.dataset.mediaName||option.textContent,button=make('button','image-picker-option'),image=make('img'),copy=make('span','',name),alt=make('small','',option.dataset.mediaAlt||'Image description missing');button.type='button';button.setAttribute('aria-label','Select '+name);button.setAttribute('aria-pressed',String(select.value===option.value));image.src='/media/'+encodeURIComponent(option.value);image.alt='';image.loading='lazy';button.append(image,copy,alt);button.addEventListener('click',()=>{select.value=option.value;select.dispatchEvent(new Event('input',{bubbles:true}));select.dispatchEvent(new Event('change',{bubbles:true}));dialog.close();});grid.append(button);}
  };
  refresh.addEventListener('click',async()=>{
   refresh.disabled=true;
   try{
    const response=await fetch('/admin/media/images.json',{headers:{Accept:'application/json'}});if(!response.ok)throw new Error('Unable to refresh the library. Sign in again if needed, then retry.');
    const data=await response.json();if(!Array.isArray(data.images))throw new Error('The image library could not be refreshed.');
    const selected=select.value,placeholder=select.options[0].cloneNode(true),images=data.images.filter(image=>Number.isSafeInteger(Number(image.id))&&Number(image.id)>0).map(image=>{const option=new Option(`${image.original_name} · ${image.alt}`,String(image.id));option.dataset.mediaAlt=image.alt;option.dataset.mediaName=image.original_name;return option;});
    select.replaceChildren(placeholder,...images);select.value=images.some(option=>option.value===selected)?selected:'';options=images;
    select.dispatchEvent(new Event('change',{bubbles:true}));if(selected!==select.value)select.dispatchEvent(new Event('input',{bubbles:true}));render();
   }catch(error){count.textContent=error.message;}finally{refresh.disabled=false;}
  });
  search.addEventListener('input',render);close.addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>{dialog.remove();choose.focus({preventScroll:true});});dialog.append(heading,label,refresh,count,grid,empty,library);document.body.append(dialog);render();dialog.showModal();search.focus();
 });
}
