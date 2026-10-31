import {useEffect} from 'react';

// Native details retain their click, touch and keyboard behaviour.
export function installFaqAccordions(root){
 const itemFor=target=>{
  const item=target.closest?.('details');
  if(!item || item.closest('.ep-accordion') || !item.closest('[class*="faq"], [class*="questions"]'))return null;
  return item;
 };
 const closeOthers=item=>{
  for(const sibling of item.parentElement.children){
   if(sibling!==item && sibling.tagName==='DETAILS')sibling.open=false;
  }
 };
 const hover=event=>{
  if(event.pointerType!=='mouse')return;
  const item=itemFor(event.target);
  if(!item || item.contains(event.relatedTarget))return;
  closeOthers(item);item.open=true;
 };
 const toggle=event=>{
  const item=itemFor(event.target);
  if(item?.open)closeOthers(item);
 };
 root.addEventListener('pointerover',hover);
 root.addEventListener('toggle',toggle,true);
 return()=>{root.removeEventListener('pointerover',hover);root.removeEventListener('toggle',toggle,true);};
}
export default function useFaqAccordions(){
 useEffect(()=>installFaqAccordions(document.getElementById('main')||document),[]);
}
