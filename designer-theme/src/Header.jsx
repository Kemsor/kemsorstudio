import React, {useEffect, useRef, useState} from 'react';
import {ChevronDown, Menu, UserRound, X} from 'lucide-react';
import {navigation} from './navigation';
import './navigation.css';

const drawerQuery = '(max-width:1250px)';
export default function Header(){
 const [drawer,setDrawer]=useState(false);
 const [mobile,setMobile]=useState(()=>matchMedia(drawerQuery).matches);
 const [active,setActive]=useState(null);
 const [scrolled,setScrolled]=useState(false);
 const header=useRef(null), toggle=useRef(null), triggers=useRef({}), timer=useRef(null);
 const cancelClose=()=>{clearTimeout(timer.current);timer.current=null};
 const close=()=>{cancelClose();setActive(null);setDrawer(false)};
 const leave=()=>{if(!mobile){cancelClose();timer.current=setTimeout(()=>setActive(null),180)}};
 useEffect(()=>{
  const query=matchMedia(drawerQuery);
  const resize=()=>{setMobile(query.matches);setDrawer(false);setActive(null)};
  const scroll=()=>setScrolled(value=>value?scrollY>8:scrollY>48);
  const outside=e=>{if(!header.current?.contains(e.target))close()};
  const escape=e=>{if(e.key==='Escape'){
   if(active){triggers.current[active]?.focus();setActive(null)}
   else if(drawer){setDrawer(false);toggle.current?.focus()}
  }};
  scroll();query.addEventListener('change',resize);
  window.addEventListener('scroll',scroll,{passive:true});
  document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);
  return()=>{clearTimeout(timer.current);query.removeEventListener('change',resize);window.removeEventListener('scroll',scroll);document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape)};
 },[active,drawer]);
 return <header ref={header} className={`site-header ${scrolled?'is-scrolled':''} ${active?'has-dropdown':''}`}>
  <span className="brand" aria-label="Kemsor Studios"><img src={`${import.meta.env.BASE_URL}assets/logo.webp`} alt="" width="59" height="59" decoding="async"/></span>
  <nav id="main-navigation" className={drawer?'is-open':''} aria-label="Main navigation">
   {navigation.map(item=><div key={item.id} className={`nav-item ${item.id==='capabilities'?'has-mega':''}`} onPointerEnter={event=>{if(!mobile&&event.pointerType!=='touch'){cancelClose();setActive(item.groups?item.id:null)}}} onPointerLeave={leave} onBlur={event=>{if(!mobile&&!event.currentTarget.contains(event.relatedTarget))setActive(current=>current===item.id?null:current)}}>
    {item.href?<span className="nav-direct">{item.label}</span>:<>
     <button ref={node=>triggers.current[item.id]=node} className="nav-trigger" aria-expanded={active===item.id} aria-controls={`nav-dropdown-${item.id}`} onClick={()=>{cancelClose();setActive(active===item.id?null:item.id)}} onKeyDown={event=>{if(event.key==='ArrowDown'){event.preventDefault();setActive(item.id)}}}>{item.label}<ChevronDown size={12}/></button>
     <div id={`nav-dropdown-${item.id}`} className={`nav-dropdown ${item.id==='capabilities'?'mega-dropdown':''}`} hidden={active!==item.id} onPointerEnter={cancelClose}>
      <div className="dropdown-groups">{item.groups.map((group,index)=><div className="dropdown-group" key={group.title||index}>
       {group.title&&<h2>{group.title}</h2>}
       {group.links.map(link=><span className="nav-text" key={`${link.label}-${link.href}`}>{link.label}</span>)}
      </div>)}</div>
     </div>
    </>}
   </div>)}
   <span className="nav-mobile-login">Login</span>
  </nav>
  <div className="header-actions"><span className="login-link">Login</span><span className="start-project">Script to Production</span><span className="account-link" aria-label="Your profile"><UserRound size={19}/></span><button ref={toggle} className="menu-toggle" aria-label={drawer?'Close menu':'Open menu'} aria-expanded={drawer} aria-controls="main-navigation" onClick={()=>{cancelClose();setDrawer(!drawer);setActive(null)}}>{drawer?<X/>:<Menu/>}</button></div>
 </header>;
}
