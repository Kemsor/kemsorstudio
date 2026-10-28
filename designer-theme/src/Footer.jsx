import React, {useEffect, useRef, useState} from 'react';
import {ArrowUpRight, ArrowRight, X} from 'lucide-react';
import {page} from './data';
import {socialIcons} from './socialIcons';
import {guideFlows} from './guideFlows';
import './footer.css';

function StudioGuide(){
 const dialog=useRef(null),opener=useRef(null);
 const [flow,setFlow]=useState(null);
 const open=event=>{opener.current=event.currentTarget;setFlow(null);dialog.current.showModal()};
 return <><button className="footer-studio-guide" aria-haspopup="dialog" onClick={open}>Studio guide<ArrowUpRight size={16}/></button>
  <dialog ref={dialog} className="studio-guide-dialog" aria-labelledby="studio-guide-title" onClose={()=>opener.current?.focus({preventScroll:true})} onClick={e=>{if(e.target===e.currentTarget)dialog.current.close()}}>
   <header><div><p>KEMSOR / YOUR WAY THROUGH</p><h2 id="studio-guide-title">Studio guide</h2></div><button autoFocus aria-label="Close studio guide" onClick={()=>dialog.current.close()}><X size={22}/></button></header>
   <p>What brings you here? Choose a starting point.</p>
   <div className="guide-options">{guideFlows.map(item=><button key={item.id} aria-pressed={flow?.id===item.id} onClick={()=>setFlow(item)}>{item.title}<ArrowRight size={16}/></button>)}</div>
   {flow&&<div className="guide-answer"><p role="status">{flow.text}</p>{flow.links.map(([label,href])=><span className="guide-answer-text" key={href}>{label}<ArrowUpRight size={16}/></span>)}</div>}
  </dialog>
 </>;
}
export default function Footer(){
 const [settings,setSettings]=useState({});
 useEffect(()=>{
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),5000);
  fetch(`${import.meta.env.VITE_CMS_API_URL||'/api'}/site`,{signal:controller.signal}).then(response=>{if(!response.ok)throw Error('CMS unavailable');return response.json()}).then(data=>setSettings(data.settings||{})).catch(()=>{}).finally(()=>clearTimeout(timeout));
  return()=>{clearTimeout(timeout);controller.abort()};
 },[]);
 const email=settings.contact_email&&!/\.example$|example\.com/i.test(settings.contact_email)?settings.contact_email:'info@kemsorstudio.com';
 const phone=settings.contact_phone&&!/sample|00000/i.test(settings.contact_phone)?settings.contact_phone:'';
 const address=settings.contact_address&&!/sample|example/i.test(settings.contact_address)?settings.contact_address.replace(/\\n/g,'\n'):'';
 const submit=e=>{e.preventDefault();const email=new FormData(e.currentTarget).get('email');window.location.assign(page(`/join/?email=${encodeURIComponent(email)}`))};
 return <footer id="contact"><div className="footer-panel"><div className="footer-top wrap"><div><p className="footer-eyebrow">THE NEXT GREAT STORY</p><h2>LET’S MAKE A SCENE.</h2><p>From the first idea to the finished frame.<br/>Bring us your story. We’ll find the next step.</p><span className="button button-orange">Talk to the studio</span></div><form className="signup" onSubmit={submit}><label className="sr-only" htmlFor="signup-email">Your email</label><input type="email" id="signup-email" name="email" placeholder="Your Email" required autoComplete="email"/><button className="button button-orange" type="submit">Sign Up <ArrowUpRight size={22}/></button><p>Continue to Kemsor to create your account.</p></form></div>
  <div className="footer-compact wrap">
   <div className="footer-social-column"><h3>Social network</h3><div className="footer-socials" role="group" aria-label="Kemsor social media">{socialIcons.map(({name,width,height,path})=>{
    const graphic=<svg viewBox={`0 0 ${width} ${height}`} aria-hidden="true" focusable="false" fill="currentColor"><path d={path}/></svg>;
    return <span key={name} role="img" aria-label={name}>{graphic}</span>;
   })}</div></div>
   <div className="footer-contact-details"><h3>Email us</h3><span className="footer-contact-text">{email}</span>{phone&&<span className="footer-contact-text">{phone}</span>}{address&&<p className="footer-address">{address}</p>}</div>
   <div className="footer-updates"><nav aria-label="Footer navigation"><h3>Updates & information</h3>{[['Blog','/blog/'],['Press & media','/press-media/'],['Legal & privacy','/legal/']].map(([label,to])=><span className="footer-link-text" key={to}>{label}</span>)}</nav><StudioGuide/></div>
  </div>
  </div>
  <div className="footer-baseline wrap"><span>© {new Date().getFullYear()} {settings.footer_copyright||'Kemsor Studios'}</span></div>
 </footer>;
}
