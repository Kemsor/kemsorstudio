// Shared by the server, browser editor and public React renderer. Never accepts HTML.
const inline=new Set(['text','strong','em','u','a','br']);
const blocks=new Set(['p','h2','h3','blockquote','ul','ol']);
export function safeRichLink(value) {
 if(typeof value!=='string'||value.length>1500||/[\u0000-\u0020\u007f]/.test(value)||value.startsWith('//'))return null;
 try {
  const url=new URL(value,'https://local.invalid');
  if(url.username||url.password)return null;
  return value.startsWith('/')||value.startsWith('#')||/^(https?:\/\/|mailto:)/i.test(value)?value:null;
 }catch{return null;}
}
export function parseRichText(raw) {
 if(!raw)return null;
 const encoded=typeof raw==='string'?raw:JSON.stringify(raw);
 if(encoded.length>60000)throw new Error('Formatted content is too long.');
 const source=typeof raw==='string'?JSON.parse(raw):raw;
 if(source?.version!==1||source.type!=='doc'||!Array.isArray(source.children))throw new Error('Invalid formatted content.');
 let count=0,totalText=0;
 const node=(value,parent,depth)=>{
  if(++count>5000||depth>12||!value||typeof value!=='object')throw new Error('Formatted content is too complex.');
  const type=value.type;
  const permitted=parent==='doc'?blocks.has(type):['ul','ol'].includes(parent)?type==='li':['li','blockquote'].includes(parent)?inline.has(type)||blocks.has(type):inline.has(type);
  if(!permitted)throw new Error('Unsupported content formatting.');
  if(type==='text'){if(typeof value.text!=='string')throw new Error('Invalid content text.');totalText+=value.text.length;if(totalText>60000)throw new Error('Content is too long.');return {type,text:value.text};}
  if(type==='br')return {type};
  if(!Array.isArray(value.children))throw new Error('Invalid content structure.');
  const result={type,children:value.children.map(child=>node(child,type,depth+1))};
  if(type==='a'){const href=safeRichLink(value.href);if(!href)throw new Error('Use a valid link beginning with https://, http://, mailto:, / or #.');result.href=href;}
  return result;
 };
 return {version:1,type:'doc',children:source.children.map(child=>node(child,'doc',0))};
}
export function richTextPlain(document) {
 const content=parseRichText(document);if(!content)return '';
 const text=node=>node.type==='text'?node.text:node.type==='br'?'\n':node.children.map(text).join(['ul','ol'].includes(node.type)?'\n':'');
 return content.children.map(text).join('\n\n');
}
export function plainRichText(text='') {
 const children=String(text).split(/\n\s*\n/).filter(Boolean).map(paragraph=>{
  const heading=/^\d+\.\s+[^\n]+$/.test(paragraph);
  const lines=paragraph.split('\n'),content=[];
  lines.forEach((line,index)=>{if(index)content.push({type:'br'});content.push({type:'text',text:line});});
  return {type:heading?'h2':'p',children:content};
 });
 return {version:1,type:'doc',children};
}
const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export function richTextHtml(raw,{legalAnchors=false}={}) {
 const document=parseRichText(raw);if(!document)return '';
 const text=node=>node.type==='text'?node.text:(node.children||[]).map(text).join('');
 const html=node=>{
  if(node.type==='text')return escape(node.text);
  if(node.type==='br')return '<br>';
  let attributes='';
  if(node.type==='a')attributes=` href="${escape(node.href)}"${/^https?:/i.test(node.href)?' target="_blank" rel="noopener noreferrer"':''}`;
  if(legalAnchors&&['h2','h3'].includes(node.type)){const number=text(node).match(/^(\d+)\.\s/);if(number)attributes+=` id="privacy-section-${number[1]}"`;}
  return `<${node.type}${attributes}>${node.children.map(html).join('')}</${node.type}>`;
 };
 return document.children.map(html).join('');
}
