const make=(tag,className,text)=>{const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;};
for(const button of document.querySelectorAll('[data-copy-media]'))button.addEventListener('click',async()=>{
 const card=button.closest('.library-card'),input=card.querySelector('input[readonly]'),feedback=card.querySelector('[data-copy-feedback]');
 try{await navigator.clipboard.writeText(new URL(input.value,location.origin).href);feedback.textContent='Media URL copied.';}
 catch{input.focus();input.select();feedback.textContent='URL selected. Copy it with your keyboard.';}
});
for(const select of document.querySelectorAll('form select[name="image_id"]')){
 const label=select.closest('label');const controls=make('div','image-picker-controls'),remove=make('button','quiet','Remove image'),thumb=make('img','image-picker-thumb');remove.type='button';controls.append(remove,thumb);label.after(controls);label.hidden=true;
 const update=()=>{const option=select.selectedOptions[0];thumb.hidden=!select.value;remove.disabled=!select.value;if(select.value){thumb.src='/media/'+encodeURIComponent(select.value);thumb.alt=option?.dataset.mediaAlt||'';}};select.addEventListener('change',update);update();
 remove.addEventListener('click',()=>{select.value='';select.dispatchEvent(new Event('input',{bubbles:true}));select.dispatchEvent(new Event('change',{bubbles:true}));});
}
