(() => {
 const root=document.querySelector('[data-blog-categories]'),dialog=document.querySelector('[data-blog-category-dialog]');if(!root||!dialog)return;
 const opener=root.querySelector('[data-create-blog-category]'),form=dialog.querySelector('form'),name=form.querySelector('[name=name]'),error=form.querySelector('[data-blog-category-error]'),cancel=form.querySelector('[data-blog-category-cancel]'),submit=form.querySelector('button.admin-save'),list=root.querySelector('[data-blog-category-list]'),summary=root.querySelector('[data-blog-category-summary]'),status=root.querySelector('[data-blog-category-status]'),editor=root.closest('form');let pending=false;
 const update=()=>{const checked=[...list.querySelectorAll('input:checked')];summary.textContent=checked.length?checked.map(field=>field.dataset.categoryName).join(', '):'Select categories';};
 const add=category=>{
  let field=[...list.querySelectorAll('input')].find(input=>input.value===String(category.id));
  if(!field){const label=document.createElement('label'),span=document.createElement('span');label.className='blog-category-option';field=document.createElement('input');field.type='checkbox';field.name='category_ids';field.value=String(category.id);field.dataset.categoryName=category.name;span.textContent=category.name;label.append(field,span);list.append(label);}
  field.checked=true;root.querySelector('[data-blog-category-empty]').hidden=true;update();editor.dispatchEvent(new Event('change',{bubbles:true}));
 };
 opener.addEventListener('click',()=>{form.reset();error.hidden=true;dialog.showModal();name.focus();});
 cancel.addEventListener('click',()=>dialog.close());dialog.addEventListener('cancel',event=>{if(pending)event.preventDefault();});dialog.addEventListener('close',()=>opener.focus({preventScroll:true}));
 list.addEventListener('change',update);update();
 form.addEventListener('submit',async event=>{
  event.preventDefault();event.stopImmediatePropagation();if(pending)return;
  name.value=name.value.trim().replace(/\s+/g,' ');if(!name.value){error.textContent='Enter a category name.';error.hidden=false;name.focus();return;}
  if(!form.checkValidity()){form.reportValidity();return;}
  const data=new FormData(form);pending=true;name.readOnly=true;submit.disabled=cancel.disabled=true;submit.textContent='Saving…';error.hidden=true;
  try{const response=await fetch(form.action,{method:'POST',headers:{Accept:'application/json'},body:data,signal:AbortSignal.timeout(20000)}),result=await response.json();if(!response.ok)throw Error(result.error||'Unable to save this category.');add(result.category);status.textContent=result.existing?'Existing category selected.':'Category saved and selected. Your post has not been saved.';dialog.close();}
  catch(problem){error.textContent=problem.name==='TimeoutError'?'The request timed out. Check the connection and try again.':problem.message||'Unable to save this category. Please try again.';error.hidden=false;name.focus();}
  finally{pending=false;name.readOnly=false;submit.disabled=cancel.disabled=false;submit.textContent='Save category';}
 },true);
})();
