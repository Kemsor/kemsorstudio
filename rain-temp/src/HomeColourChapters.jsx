import {useEffect} from 'react';

// Keep the shared homepage styling hooks, with a fixed palette instead of
// recolouring the page and its sections as the visitor scrolls.
const palette={bg:'#fff',ink:'#2d2926',muted:'#4d4946',line:'#cdcccb',panel:'#f6f5f5'};

export default function HomeColourChapters(){
 useEffect(()=>{
  const root=document.getElementById('top');
  if(!root)return;
  root.dataset.homeColors='static';
  root.dataset.chapterTone='light';
  for(const [key,value] of Object.entries(palette))root.style.setProperty(`--chapter-${key}`,value);
  return()=>{
   delete root.dataset.homeColors;
   delete root.dataset.chapterTone;
   for(const key of Object.keys(palette))root.style.removeProperty(`--chapter-${key}`);
  };
 },[]);
 return null;
}
