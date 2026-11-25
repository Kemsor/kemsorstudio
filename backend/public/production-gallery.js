for(const editor of document.querySelectorAll('[data-production-gallery]')){
 const input=editor.querySelector('[data-gallery-value]'),rows=editor.querySelector('[data-gallery-rows]'),add=editor.querySelector('[data-gallery-add]'),status=editor.querySelector('[data-gallery-status]');
 const fields=['media_id','kind','alt','caption'];
 const sync=()=>{
  input.value=JSON.stringify([...rows.children].map(row=>Object.fromEntries(fields.map(key=>[key,row.querySelector(`[data-gallery-field="${key}"]`).value]))));
  [...rows.children].forEach((row,index)=>{row.querySelector('legend').textContent=`Gallery image ${index+1}`;row.querySelector('[data-gallery-up]').disabled=index===0;row.querySelector('[data-gallery-down]').disabled=index===rows.children.length-1;const preview=row.querySelector('[data-gallery-preview]'),id=row.querySelector('select').value;preview.hidden=!id;if(id)preview.src=`/media/${id}`;});
  add.disabled=rows.children.length>=24;
 };
 const append=value=>{
  const row=editor.querySelector('template').content.firstElementChild.cloneNode(true);
  for(const key of fields)row.querySelector(`[data-gallery-field="${key}"]`).value=value[key]??(key==='kind'?'still':'');
  row.addEventListener('input',sync);row.addEventListener('change',sync);
  row.querySelector('[data-gallery-remove]').onclick=()=>{row.remove();sync();status.textContent='Image removed. Save the production to apply changes.';add.focus();};
  row.querySelector('[data-gallery-up]').onclick=()=>{const previous=row.previousElementSibling;if(previous){rows.insertBefore(row,previous);sync();row.querySelector('[data-gallery-down]').focus();status.textContent='Image moved up.';}};
  row.querySelector('[data-gallery-down]').onclick=()=>{const next=row.nextElementSibling;if(next){rows.insertBefore(next,row);sync();row.querySelector('[data-gallery-up]').focus();status.textContent='Image moved down.';}};
  rows.append(row);sync();return row;
 };
 const saved=JSON.parse(input.value||'[]');saved.forEach(append);
 add.onclick=()=>{if(rows.children.length<24){append({}).querySelector('[data-gallery-field=media_id]').focus();status.textContent='Image added. Upload an image to continue.';}};
 editor.closest('form').addEventListener('submit',sync);
}
