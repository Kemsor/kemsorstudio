import React,{useEffect,useState} from 'react';
import './page-progress.css';
export default function PageProgress(){
 const [loading,setLoading]=useState(false);
 useEffect(()=>{
  let timer;
  const reset=()=>{clearTimeout(timer);setLoading(false)};
  const click=event=>{
   const link=event.target.closest?.('a[href]');
   if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||!link||link.target==='_blank'||link.hasAttribute('download'))return;
   const url=new URL(link.href,location.href);
   if(url.origin!==location.origin||url.protocol!=='http:'&&url.protocol!=='https:'||url.pathname===location.pathname&&url.search===location.search)return;
   clearTimeout(timer);timer=setTimeout(()=>setLoading(true),120);
  };
  document.addEventListener('click',click);window.addEventListener('pageshow',reset);window.addEventListener('offline',reset);
  return()=>{clearTimeout(timer);document.removeEventListener('click',click);window.removeEventListener('pageshow',reset);window.removeEventListener('offline',reset)};
 },[]);
 return loading?<div className="page-route-progress" role="progressbar" aria-label="Loading the next page"><i/></div>:null;
}
