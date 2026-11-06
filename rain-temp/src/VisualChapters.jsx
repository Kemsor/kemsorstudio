import PageBreadcrumbs from './PageBreadcrumbs';
import React,{Children,cloneElement,isValidElement} from 'react';
const classes=node=>String(node?.props?.className||'');

// A section receives the same reading frame on every inner page. Authored media,
// forms and IDs stay in place; no stock images or alternating tones are injected.
export function visualChapter(node){
 if(!isValidElement(node)||classes(node).split(/\s/).includes('inner-hero'))return node;
 return cloneElement(node,{className:`${classes(node)} inner-content-section${/\b(?:pl-closing|fl-closing-section)\b/.test(classes(node))?' inner-closing':''}`});
}
export function chapterStyler(){return visualChapter;}
export default function PageVisuals({page,children}){
 let index=0;const styleChapter=chapterStyler(page);
 function walk(node){
  if(!isValidElement(node))return node;
  if(classes(node).split(/\s/).includes('inner-hero'))return node;
  if(node.type==='section')return styleChapter(node,index++);
  if(!node.props.children)return node;
  return cloneElement(node,{},Children.map(node.props.children,walk));
 }
 const root=Children.only(children);
 const childrenList=Children.toArray(root.props.children);
 const breadcrumb=childrenList.find(node=>isValidElement(node)&&node.props['aria-label']==='Breadcrumb');
 const arranged=childrenList.filter(node=>node!==breadcrumb).flatMap(node=>
  isValidElement(node)&&classes(node).split(/\s/).includes('inner-hero')
   ? [node,<PageBreadcrumbs key="page-breadcrumbs" page={page}>{breadcrumb}</PageBreadcrumbs>] : [node]);
 return walk(cloneElement(root,{className:`${classes(root)} service-page-layout`,'data-service-page':page},arranged));
}
