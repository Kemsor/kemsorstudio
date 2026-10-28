import SiteIcon from './SiteIcon';
import React, { useId, useState } from 'react';

export default function ProjectBriefForm() {
  const id=useId();
  const [downloaded,setDownloaded]=useState(false);
  const submit=event=>{
    event.preventDefault();
    const form=new FormData(event.currentTarget);
    const text=['KEMSOR STUDIOS: PROJECT BRIEF','',`Project: ${String(form.get('project')).trim()}`,`Name: ${String(form.get('name')).trim()}`,`Email: ${form.get('email')}`,`Format: ${form.get('format')}`,`Current stage: ${form.get('stage')}`,`Language / locations: ${String(form.get('location')).trim()}`,'','THE STORY / SUPPORT NEEDED',String(form.get('story')).trim(),'','Prepared locally. This brief has not been sent to Kemsor Studios.'].join('\n');
    const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));
    const link=document.createElement('a');
    link.href=url; link.download='kemsor-project-brief.txt'; document.body.append(link); link.click(); link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    setDownloaded(true);
  };
  return <form className="project-form page-brief-form" onSubmit={submit} onChange={()=>setDownloaded(false)} aria-labelledby={`${id}-title`}>
    <div className="form-header"><h3 id={`${id}-title`}>The first few details.</h3><p>Download a copy to keep for your production conversation. This form does not send an enquiry.</p></div>
    <div className="form-fields">
      <label>Project / working title<input name="project" required maxLength="150" autoComplete="off"/></label>
      <label>Your name<input name="name" required maxLength="100" autoComplete="name"/></label>
      <label>Email<input name="email" type="email" required maxLength="254" autoComplete="email"/></label>
      <label>Project format<select name="format"><option>Feature film</option><option>Series / OTT</option><option>Documentary</option><option>Short film</option><option>International co-production</option><option>Another format</option></select></label>
      <label>Current stage<select name="stage"><option>Idea / development</option><option>Financing</option><option>Pre-production</option><option>Production</option><option>Post-production</option><option>Release</option></select></label>
      <label>Language / locations<input name="location" maxLength="300" autoComplete="off" placeholder="If known"/></label>
      <label className="story-field">The story, the starting point, the support you need<textarea name="story" rows="5" required maxLength="6000"/></label>
    </div>
    <button type="submit" className="creative-cta"><span>Download your brief</span><span className="cta-arrow" aria-hidden="true"><SiteIcon name="arrow-down" size={16} /></span></button>
    {downloaded&&<p className="download-status" role="status">Your brief is ready. The download has started; nothing has been sent to the studio.</p>}
  </form>;
}
