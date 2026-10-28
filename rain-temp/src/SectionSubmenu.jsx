import React from 'react';
import { pageHref } from './pageInfo';
import './section-submenu.css';

const sections = {
  'what-we-make': { label:'WHAT WE MAKE', name:'Story formats', href:'/what-we-make/', pages:[['feature-films','Feature Films'],['series-ott','Series & OTT'],['documentaries','Documentaries'],['short-films','Short Films']] },
  studio: { label:'STUDIO', name:'Studio pages', href:'/about/', pages:[['about','About Kemsor'],['leadership','Leadership','/about/#leadership'],['how-we-work','How We Work'],['careers','Careers']] },
  post: { label:'04 · POST', name:'Post services', href:'/post/', pages:[['post','Overview'],['post-production','Post-Production Supervision']] },
  release: { label:'05 · RELEASE', name:'Release services', href:'/release/', pages:[['release','Overview'],['distribution-release','Distribution & Release Support'],['festival-awards','Festival & Awards Strategy']] },
  develop: { label:'01 · DEVELOP', name:'Development services', pages:[['develop','Overview'],['story-script','Story & Script'],['packaging-talent','Packaging & Talent'],['budgeting-scheduling','Budgeting & Scheduling']] },
  finance: { label:'02 · FINANCE', name:'Finance services', pages:[['finance','Overview'],['finance-structuring','Finance Structuring'],['co-production','Co-Production'],['international-co-productions','International Co-Productions']] },
  produce: { label:'03 · PRODUCE', name:'Produce services', pages:[['produce','Overview'],['line-production','Line Production'],['casting','Casting & Talent'],['locations-logistics','Locations & Logistics'],['crew-equipment','Crew & Equipment'],['set-production-design','Set & Design'],['shooting-on-location','Shooting']] },
};
export default function SectionSubmenu({section,page,menu:customMenu,id}) {
  const menu=customMenu||sections[section];
  if(!menu)return null;
  return <nav id={id} className="section-submenu" aria-label={menu.name}><div className="section-submenu-width"><a className="section-submenu-category" href={menu.href||pageHref(section)}>{menu.label}</a><div className="section-submenu-links">{menu.pages.map(([key,label,href])=><a href={href||(customMenu?`#${key}`:pageHref(key))} key={key} aria-current={page===key?(customMenu?'location':'page'):undefined}>{label}</a>)}</div></div></nav>;
}
