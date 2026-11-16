import {useEffect} from 'react';

// Keep the shared homepage styling hooks, with a fixed palette instead of
// recolouring the page and its sections as the visitor scrolls.
const palette={bg:'#251c12',ink:'#f2e8d7',muted:'#cbbda7',line:'#e5b76533',panel:'#302419'};

export default function HomeColourChapters(){
 useEffect(()=>{
  const root=document.getElementById('top');
  if(!root)return;
  root.dataset.homeColors='static';
  root.dataset.chapterTone='dark';
  for(const [key,value] of Object.entries(palette))root.style.setProperty(`--chapter-${key}`,value);
  return()=>{
   delete root.dataset.homeColors;
   delete root.dataset.chapterTone;
   for(const key of Object.keys(palette))root.style.removeProperty(`--chapter-${key}`);
  };
 },[]);
 return null;
}
