import React from 'react';
import {parseRichText} from '../../backend/public/rich-text-core.js';
import './rich-text.css';

export default function RichText({document,legalAnchors=false}) {
 let content;try{content=parseRichText(document);}catch{return null;}if(!content)return null;
 const plain=node=>node.type==='text'?node.text:(node.children||[]).map(plain).join('');
 const render=(node,index)=>{
  if(node.type==='text')return node.text;
  const props={key:index};
  if(node.type==='a'){props.href=node.href;if(/^https?:/i.test(node.href)){props.target='_blank';props.rel='noopener noreferrer';}}
  if(legalAnchors&&['h2','h3'].includes(node.type)){const number=plain(node).match(/^(\d+)\.\s/);if(number)props.id=`privacy-section-${number[1]}`;}
  return React.createElement(node.type,props,...(node.children||[]).map(render));
 };
 return <div className="cms-rich-text">{content.children.map(render)}</div>;
}
