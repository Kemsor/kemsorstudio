import {parseRichText,plainRichText,richTextHtml,richTextPlain,safeRichLink} from './rich-text-core.js';

for(const textarea of document.querySelectorAll('textarea[data-rich-editor]')) {
 if(textarea.dataset.richEditorReady)continue;
 textarea.dataset.richEditorReady='true';
 let initial;
 try{initial=parseRichText(textarea.dataset.richDocument)||plainRichText(textarea.value);}catch{initial=plainRichText(textarea.value);}
 const wrapper=document.createElement('div');wrapper.className='rich-editor';
 const toolbar=document.createElement('div');toolbar.className='rich-editor-toolbar';toolbar.setAttribute('role','group');toolbar.setAttribute('aria-label','Text formatting');
 const surface=document.createElement('div');surface.className='rich-editor-surface';surface.contentEditable='true';surface.setAttribute('role','textbox');surface.setAttribute('aria-multiline','true');surface.setAttribute('aria-label',textarea.dataset.editorLabel||'Content');surface.spellcheck=true;surface.innerHTML=richTextHtml(initial);
 const preview=document.createElement('div');preview.className='rich-editor-preview';preview.hidden=true;
 const hidden=document.createElement('input');hidden.type='hidden';hidden.name='rich_text';hidden.value=JSON.stringify(initial);
 const feedback=document.createElement('p');feedback.className='rich-editor-feedback';feedback.setAttribute('role','status');
 let range=null,previewing=false;
 const remember=()=>{const selection=getSelection();if(selection?.rangeCount&&surface.contains(selection.anchorNode))range=selection.getRangeAt(0).cloneRange();};
 const restore=()=>{surface.focus({preventScroll:true});const selection=getSelection();selection.removeAllRanges();if(range&&surface.contains(range.commonAncestorContainer))selection.addRange(range);else{const end=document.createRange();end.selectNodeContents(surface);end.collapse(false);selection.addRange(end);}};
 const inlineTypes=new Set(['text','strong','em','u','a','br']);
 const convert=node=>{
  if(node.nodeType===Node.TEXT_NODE)return node.textContent?[{type:'text',text:node.textContent}]:[];
  if(node.nodeType!==Node.ELEMENT_NODE)return [];
  const tag=node.tagName.toLowerCase();
  if(['script','style','iframe','object','svg','img','video'].includes(tag))return [];
  let children=[...node.childNodes].flatMap(convert);
  const type=({div:'p',b:'strong',i:'em'})[tag]||tag;
  if(type==='br')return [{type:'br'}];
  if(type==='a'){const href=safeRichLink(node.getAttribute('href'));return href?[{type,href,children}]:children;}
  if(type==='p'&&children.some(child=>!inlineTypes.has(child.type)))return children;
  if(['p','h2','h3','blockquote','ul','ol','li','strong','em','u'].includes(type))return [{type,children}];
  return children;
 };
 const collect=()=>{
  const nodes=[...surface.childNodes].flatMap(convert),children=[];let pending=[];
  const flush=()=>{if(pending.length){children.push({type:'p',children:pending});pending=[];}};
  for(const node of nodes){if(inlineTypes.has(node.type))pending.push(node);else{flush();children.push(node);}}flush();
  return parseRichText({version:1,type:'doc',children});
 };
 const sync=()=>{
  try {
   const document=collect(),encoded=JSON.stringify(document),plain=richTextPlain(document);
   const changed=hidden.value!==encoded||textarea.value!==plain;
   hidden.value=encoded;textarea.value=plain;textarea.setCustomValidity('');feedback.textContent='';
   if(previewing)preview.innerHTML=richTextHtml(document);
   if(changed)textarea.dispatchEvent(new Event('input',{bubbles:true}));return true;
  }catch(error){feedback.textContent=error.message;textarea.setCustomValidity(error.message);return false;}
 };
 const button=(label,command,value)=>{
  const element=document.createElement('button');element.type='button';element.textContent=label;element.title=label;
  element.addEventListener('mousedown',event=>event.preventDefault());
  element.addEventListener('click',event=>{event.preventDefault();if(previewing)return;restore();document.execCommand(command,false,value);remember();sync();});toolbar.append(element);return element;
 };
 const format=document.createElement('select');format.setAttribute('aria-label','Paragraph style');
 for(const [value,label] of [['p','Paragraph'],['h2','Heading 2'],['h3','Heading 3']]){const option=document.createElement('option');option.value=value;option.textContent=label;format.append(option);}
 format.addEventListener('change',()=>{if(previewing)return;restore();document.execCommand('formatBlock',false,format.value);remember();sync();});toolbar.append(format);
 button('Bold','bold');button('Italic','italic');button('Underline','underline');button('Bullets','insertUnorderedList');button('Numbered list','insertOrderedList');button('Quote','formatBlock','blockquote');
 const linkButton=document.createElement('button');linkButton.type='button';linkButton.textContent='Link';toolbar.append(linkButton);
 linkButton.addEventListener('mousedown',event=>event.preventDefault());
 linkButton.addEventListener('click',event=>{event.preventDefault();if(previewing)return;const value=window.prompt('Link destination (https://…, mailto:…, /page/ or #section)');if(value===null)return;const href=safeRichLink(value.trim());if(!href){feedback.textContent='Enter a valid website, email or internal link.';return;}restore();document.execCommand('createLink',false,href);remember();sync();});
 button('Remove link','unlink');button('Clear formatting','removeFormat');button('Undo','undo');button('Redo','redo');
 const toggle=document.createElement('button');toggle.type='button';toggle.textContent='Preview';toggle.setAttribute('aria-pressed','false');
 toggle.addEventListener('click',event=>{event.preventDefault();if(!sync())return;previewing=!previewing;surface.hidden=previewing;preview.hidden=!previewing;preview.innerHTML=richTextHtml(collect());toggle.textContent=previewing?'Edit content':'Preview';toggle.setAttribute('aria-pressed',String(previewing));for(const control of toolbar.querySelectorAll('button,select'))if(control!==toggle)control.disabled=previewing;});toolbar.append(toggle);
 surface.addEventListener('input',()=>{remember();sync();});surface.addEventListener('keyup',remember);surface.addEventListener('mouseup',remember);surface.addEventListener('blur',remember);
 surface.addEventListener('click',event=>{if(event.target.closest('a'))event.preventDefault();});
 surface.addEventListener('paste',event=>{event.preventDefault();restore();document.execCommand('insertText',false,event.clipboardData.getData('text/plain'));remember();sync();});
 surface.addEventListener('drop',event=>event.preventDefault());
 textarea.form?.addEventListener('submit',event=>{if(!sync()){event.preventDefault();event.stopImmediatePropagation();surface.hidden=false;preview.hidden=true;surface.focus();}},true);
 wrapper.append(toolbar,surface,preview,feedback,hidden);
 const label=textarea.closest('label');
 if(label){const host=document.createElement('div');host.className=label.className;label.replaceWith(host);host.append(label,wrapper);label.classList.remove('wide');}
 else textarea.after(wrapper);
 textarea.hidden=true;
 // Native required validation belongs to the visible editor after enhancement.
 surface.setAttribute('aria-required',String(textarea.required));const required=textarea.required;textarea.required=false;
 textarea.form?.addEventListener('submit',event=>{if(required&&!textarea.value.trim()){event.preventDefault();event.stopImmediatePropagation();feedback.textContent='Enter content before saving.';surface.focus();}},true);
}
