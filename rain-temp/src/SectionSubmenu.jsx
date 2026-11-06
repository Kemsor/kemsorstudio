import {cmsText,cmsData,withoutStageNumber} from "./siteContent.js";
import React, {useEffect,useRef,useState} from 'react';
import { pageHref } from './pageInfo';
import './section-submenu.css';

const sections = cmsData(()=>({
  'what-we-make': { label:cmsText("SectionSubmenu","43359ac7f46e3b79","WHAT WE MAKE"), name:'Story formats', href:'/what-we-make/', pages:[['feature-films',cmsText("SectionSubmenu","8931d1f9eb6cec0f","Feature Films")],['series-ott',cmsText("SectionSubmenu","447f80f474a47396","Series & OTT")],['documentaries',cmsText("SectionSubmenu","54f53deb4bce48d6","Documentaries")],['short-films',cmsText("SectionSubmenu","1a2b8340a945afd6","Short Films")]] },
  studio: { label:cmsText("SectionSubmenu","424167676d83b043","STUDIO"), name:'Studio pages', href:'/about/', pages:[['about',cmsText("SectionSubmenu","9fc14c6a85d800bc","About Kemsor")],['leadership',cmsText("SectionSubmenu","167893fa075b29f5","Leadership"),'/leadership/'],['how-we-work',cmsText("SectionSubmenu","86d85d94fad82299","How We Work")],['partner-with-us',cmsText("SectionSubmenu","64fe201d9a21e13c","Partner With Us")],['careers',cmsText("SectionSubmenu","da96a8f3c9a63385","Careers")]] },
  post: { label:cmsText("SectionSubmenu","5fea1b161e50d9f9","04 · POST"), name:'Post services', href:'/post/', pages:[['post',cmsText("SectionSubmenu","752886b075c9ff25","Overview")],['post-production',cmsText("SectionSubmenu","cfa95bd5f3b9484d","Post-Production Supervision")]] },
  release: { label:cmsText("SectionSubmenu","e2fd6c508abeac2f","05 · RELEASE"), name:'Release services', href:'/release/', pages:[['release',cmsText("SectionSubmenu","b4610c074781cfd3","Overview")],['distribution-release',cmsText("SectionSubmenu","1f4337a29be1bf7c","Distribution & Release Support")],['festival-awards',cmsText("SectionSubmenu","398638c1b090eb25","Festival & Awards Strategy")]] },
  develop: { label:cmsText("SectionSubmenu","da5f5997dc153918","01 · DEVELOP"), name:'Development services', pages:[['develop',cmsText("SectionSubmenu","78f8e88841c9c2b1","Overview")],['story-script',cmsText("SectionSubmenu","8817a264a7ed253c","Story & Script")],['packaging-talent',cmsText("SectionSubmenu","2c08ade316774a59","Packaging & Talent")],['budgeting-scheduling',cmsText("SectionSubmenu","156858ead2a1cab9","Budgeting & Scheduling")]] },
  finance: { label:cmsText("SectionSubmenu","d1d7abb02a06ff4a","02 · FINANCE"), name:'Finance services', pages:[['finance',cmsText("SectionSubmenu","d05145232dc7a41b","Overview")],['finance-structuring',cmsText("SectionSubmenu","e8f51a729eb6df15","Finance Structuring")],['co-production',cmsText("SectionSubmenu","6780501a30e6fb75","Co-Production")],['international-co-productions',cmsText("SectionSubmenu","8968327055b84d26","International Co-Productions")]] },
  produce: { label:cmsText("SectionSubmenu","4e881270b05f7d52","03 · PRODUCE"), name:'Produce services', pages:[['produce',cmsText("SectionSubmenu","51670799707de4a7","Overview")],['line-production',cmsText("SectionSubmenu","4763195d1e91c40e","Line Production")],['casting',cmsText("SectionSubmenu","a99ef8c8c23a4bdd","Casting & Talent")],['locations-logistics',cmsText("SectionSubmenu","8fbcd86b07bb58fe","Locations & Logistics")],['crew-equipment',cmsText("SectionSubmenu","17cd92d55c4d86c8","Crew & Equipment")],['set-production-design',cmsText("SectionSubmenu","fb8160cb234a19a8","Set & Design")],['shooting-on-location',cmsText("SectionSubmenu","59611fc3408a2262","Shooting")]] },
}));
export default function SectionSubmenu({section,page,menu:customMenu,id}) {
  const ref=useRef(null);
  const [stuck,setStuck]=useState(false);
  useEffect(()=>{
    const node=ref.current;
    if(!node)return;
    let frame;
    const measure=()=>{
      frame=null;
      const style=getComputedStyle(node);
      const top=parseFloat(style.top);
      setStuck(style.position==='sticky' && Number.isFinite(top) && window.scrollY>0 && node.getBoundingClientRect().top<=top+1);
    };
    const update=()=>{if(!frame)frame=requestAnimationFrame(measure)};
    window.addEventListener('scroll',update,{passive:true});
    window.addEventListener('resize',update);
    update();
    return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',update);window.removeEventListener('resize',update)};
  },[]);
  const menu=customMenu||sections[section];
  if(!menu)return null;
  return <nav ref={ref} data-stuck={stuck} id={id} className="section-submenu" aria-label={menu.name}><div className="section-submenu-width"><a className="section-submenu-category" href={menu.href||pageHref(section)}>{withoutStageNumber(menu.label)}</a><div className="section-submenu-links">{menu.pages.map(([key,label,href])=><a href={href||(customMenu?`#${key}`:pageHref(key))} key={key} aria-current={page===key?(customMenu?'location':'page'):undefined}>{withoutStageNumber(label)}</a>)}</div></div></nav>;
}
