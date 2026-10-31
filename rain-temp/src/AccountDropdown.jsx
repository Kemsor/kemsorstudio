import React,{useEffect,useRef,useState} from 'react';
import {useMember,LogoutButton} from './MemberSession';
import {siteLink} from './talent-api';
import SiteIcon from './SiteIcon';
import './account-dropdown.css';
export default function AccountDropdown({mobile=false,onOpenChange}){
 const {user,loading}=useMember(),[open,setOpen]=useState(false),root=useRef(null),trigger=useRef(null),hoverTimer=useRef(null);
 useEffect(()=>()=>clearTimeout(hoverTimer.current),[]);
 const id=mobile?'mobile-account-options':'header-account-options';
 useEffect(()=>{onOpenChange?.(open);return()=>onOpenChange?.(false);},[open,onOpenChange]);
 useEffect(()=>{
  if(!open)return;
  const outside=event=>{if(!root.current?.contains(event.target))setOpen(false);};
  const escape=event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();setOpen(false);trigger.current?.focus();}};
  document.addEventListener('pointerdown',outside);root.current?.addEventListener('keydown',escape);
  const node=root.current;
  return()=>{document.removeEventListener('pointerdown',outside);node?.removeEventListener('keydown',escape);};
 },[open]);
 if(loading)return null;
 return <div ref={root} className={`account-dropdown${mobile?' account-dropdown-mobile':''}`} onPointerEnter={event=>{if(event.pointerType==='mouse'){clearTimeout(hoverTimer.current);setOpen(true);}}} onPointerLeave={event=>{if(event.pointerType==='mouse')hoverTimer.current=setTimeout(()=>setOpen(false),180);}} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget))setOpen(false);}}>
  <button ref={trigger} type="button" className={mobile?'account-dropdown-trigger creative-nav-mobile-login':'account-dropdown-trigger header-login'} aria-expanded={open} aria-controls={id} onPointerUp={event=>{if(event.pointerType==='touch')setOpen(value=>!value);}} onFocus={event=>{if(event.currentTarget.matches(':focus-visible'))setOpen(true);}} onKeyDown={event=>{if(event.key==='ArrowDown'){event.preventDefault();setOpen(true);requestAnimationFrame(()=>root.current?.querySelector('.account-dropdown-panel a')?.focus());}}}><SiteIcon name={user?'people':'lock'} size={16}/><span>{user?'My account':'Login'}</span><SiteIcon name="chevron" size={13}/></button>
  <div id={id} className="account-dropdown-panel" hidden={!open}>
   <div className="account-dropdown-intro"><small>{user?'YOUR STUDIO WORKSPACE':'WELCOME TO KEMSOR'}</small><strong>{user?user.name:'Your next story starts here.'}</strong></div>
   {user?<><a href={siteLink('profile')} onClick={()=>setOpen(false)}><SiteIcon name="people" size={18}/><span>Profile<small>Your dashboard & professional details</small></span></a><LogoutButton className="account-dropdown-logout"/></>:<><a href={siteLink('login')}><SiteIcon name="lock" size={18}/><span>Login<small>Continue to your workspace</small></span></a><div className="account-dropdown-registration"><small>REGISTER</small><a href={siteLink('join')}><SiteIcon name="people" size={18}/><span>Register as an artist</span></a><a href={`${siteLink('join')}?type=professional`}><SiteIcon name="film" size={18}/><span>Register as a film professional</span></a></div></>}
  </div>
 </div>;
}
