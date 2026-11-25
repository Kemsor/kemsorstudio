(() => {
 const editor=document.querySelector('[data-menu-custom]');
 if(!editor)return;
 const rows=editor.querySelector('[data-menu-links]');
 const template=editor.querySelector('template');
 const add=editor.querySelector('[data-menu-add]');
 const limit=Number(editor.dataset.limit);
 const refresh=()=>{add.disabled=rows.children.length>=limit;};

 add.addEventListener('click',()=>{
  if(rows.children.length>=limit)return;
  rows.append(template.content.cloneNode(true));
  rows.lastElementChild.querySelector('input').focus();
  refresh();
 });
 rows.addEventListener('change',event=>{
  const placement=event.target.closest('[data-menu-placement]');
  if(!placement)return;
  const position=placement.closest('[data-menu-link]').querySelector('[data-menu-position]');
  const previous=position.value;
  const choices=JSON.parse(placement.selectedOptions[0].dataset.positions);
  position.replaceChildren(new Option('First','first'),...choices.map(choice=>new Option(choice.label,choice.value)),new Option('Last','last'));
  position.value=previous==='first'?'first':'last';
 });
 rows.addEventListener('click',event=>{
  const button=event.target.closest('[data-menu-remove]');
  if(!button)return;
  const row=button.closest('[data-menu-link]');
  const next=row.nextElementSibling||row.previousElementSibling;
  row.remove();
  refresh();
  (next?.querySelector('input')||add).focus();
 });
 refresh();
})();
