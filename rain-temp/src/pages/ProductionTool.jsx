import PageBreadcrumbs from '../PageBreadcrumbs';
import SiteIcon from '../SiteIcon';
import StudioImage from '../StudioImage';
import {useCms} from '../CmsContent';
import React,{useEffect,useState} from 'react';
import {api,siteLink,publicPreview,previewMessage} from '../talent-api';
import {useMember} from '../MemberSession';
import {filmDeskGoals,filmDeskMaterials,filmDeskTools} from '../../../shared/filmdesk';
import FilmDeskOnboarding from './FilmDeskOnboarding';
import './filmdesk.css';

export default function ProductionTool(){
 const {settings}=useCms(),{user,loading}=useMember();
 const [projects,setProjects]=useState([]),[project,setProject]=useState(null),[submissions,setSubmissions]=useState([]),[active,setActive]=useState('story'),[error,setError]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[dirty,setDirty]=useState(false),[mode,setMode]=useState('list'),[approved,setApproved]=useState(false),[shareSections,setShareSections]=useState([]),[includeScript,setIncludeScript]=useState(false);
 const [listedUser,setListedUser]=useState(null);
 const hasUnsaved=dirty||mode==='setup';
 useEffect(()=>{const warn=event=>{if(hasUnsaved){event.preventDefault();event.returnValue='';}};addEventListener('beforeunload',warn);return()=>removeEventListener('beforeunload',warn);},[hasUnsaved]);
 const list=async()=>setProjects((await api('/api/production/projects')).projects);
 useEffect(()=>{
  if(!user?.id)return;
  const id=user.id;
  let cancelled=false;
  api('/api/production/projects')
   .then(result=>{if(!cancelled)setProjects(result.projects);})
   .catch(reason=>{if(!cancelled)setError(reason.message);})
   .finally(()=>{if(!cancelled)setListedUser(id);});
  return()=>{cancelled=true;};
 },[user?.id]);
 const act=async action=>{if(busy)return;setBusy(true);setError('');setMessage('');try{await action();}catch(reason){setError(reason.message);}finally{setBusy(false);}};
 const load=async(id)=>{const result=await api(`/api/production/projects/${id}`);setProject(result.project);setSubmissions(result.submissions||[]);setDirty(false);setApproved(false);setShareSections([]);setIncludeScript(false);setMode('edit');const goal=filmDeskGoals.find(item=>item.id===result.project.onboarding?.objective);setActive(goal?.tools[0]||'story');};
 const leave=()=>!hasUnsaved||window.confirm('Leave these unsaved changes? Your last saved version is kept.');
 const open=id=>{if(leave())act(()=>load(id));};
 const start=()=>{if(leave()){setProject(null);setMode('setup');setError('');setMessage('');}};
 const create=data=>act(async()=>{if(project){await api(`/api/production/projects/${project.id}/setup`,{...data,revision:project.revision});await load(project.id);}else{const result=await api('/api/production/projects',data);await load(result.id);}await list();setMessage('Your private workspace is ready. Nothing has been submitted to Kemsor.');});
 const save=()=>act(async()=>{const result=await api(`/api/production/projects/${project.id}/plan`,{...project.plan,revision:project.revision});setProject({...project,revision:result.revision,reviewed_revision:null,reviewed_at:null});setDirty(false);setMessage('Saved privately. Review this version before exporting or sharing.');await list();});
 const upload=event=>{event.preventDefault();const form=event.currentTarget;act(async()=>{await api(`/api/production/projects/${project.id}/script`,new FormData(form));await load(project.id);setMessage('Document stored privately. It has not been submitted to Kemsor.');form.reset();await list();});};
 const review=()=>act(async()=>{await api(`/api/production/projects/${project.id}/review`,{revision:project.revision,approved});await load(project.id);setMode('next');setMessage('This saved version is reviewed. Choose what happens next.');});
 const submit=event=>{event.preventDefault();act(async()=>{const result=await api(`/api/production/projects/${project.id}/submit`,{revision:project.revision,sections:shareSections,include_script:includeScript,terms_accepted:true,terms_version:settings.script_terms_version,share_confirmed:true});await load(project.id);setMode('next');setMessage(`Kemsor has received your selected material. Reference ${result.reference}. Track the studio review below.`);});};
 const goal=filmDeskGoals.find(item=>item.id===project?.onboarding?.objective),tool=filmDeskTools.find(([key])=>key===active),reviewed=project&&project.reviewed_revision===project.revision&&!dirty,nonempty=filmDeskTools.filter(([key])=>project?.plan?.[key]?.trim());
 return <div className={user ? "filmdesk-page fd-member" : "filmdesk-page"}>
  <PageBreadcrumbs page="script-to-production"/>
  <div className="fd-main">
   {user ? <header className="fd-member-header">
    <div>
     <h1 id="fd-title">FilmDesk</h1>
     <p><SiteIcon name="lock" size={16}/> Private production workspace</p>
    </div>
    <a className="fd-profile-link" href={siteLink('profile')}>My profile <SiteIcon name="arrow" size={16}/></a>
   </header> : !loading && <section className="fd-intro" aria-labelledby="fd-title">
    <div className="fd-intro-copy">
     <p className="fd-eyebrow">Private production workspace</p>
     <h1 id="fd-title">FilmDesk</h1>
     <p className="fd-intro-title">From first idea to production plan.</p>
     <p className="fd-intro-description">Develop your story, organise the work across departments, and review what’s ready to share.</p>
     <div className="fd-actions fd-intro-actions">
      <a className="fd-primary" href={siteLink('login')}>Sign in to FilmDesk <SiteIcon name="arrow" size={18}/></a>
      <a className="fd-profile-link" href={siteLink('join')}>Create an account</a>
     </div>
    </div>
    <div className="fd-intro-image">
     <StudioImage src="/assets/supplied/page-refresh/creative-project-planning-960.webp" alt="" width="960" height="640" fetchPriority="high"/>
    </div>
   </section>}
   {publicPreview&&<p role="status">{previewMessage}</p>}{error&&<p className="fd-notice fd-error" role="alert">{error}</p>}{message&&<p className="fd-notice" role="status">{message}</p>}
   {loading?<p role="status">Opening FilmDesk…</p>:!user?<section className="fd-public-guide" aria-labelledby="fd-guide-title">
    <div className="fd-guide-heading">
     <h2 id="fd-guide-title">How FilmDesk works</h2>
     <p><SiteIcon name="lock" size={17}/> A script is optional. Your work stays private until you choose to share it.</p>
    </div>
    <ol className="fd-public-flow" role="list">
     <li><SiteIcon name="people"/><h3>Choose your role</h3><p>Start with your department and what you want to achieve.</p></li>
     <li><SiteIcon name="script"/><h3>Set your brief</h3><p>Bring an idea, a draft, or the material you already have.</p></li>
     <li><SiteIcon name="film"/><h3>Build your plan</h3><p>Work through the tools that fit your project.</p></li>
     <li><SiteIcon name="check"/><h3>Review and export</h3><p>Save privately, export, or select material to share with Kemsor.</p></li>
    </ol>
   </section>:<>
    <div className="fd-project-bar">
     <h2>Your workspaces</h2>
     <button className="fd-primary" disabled={busy||mode==='setup'} onClick={start}>New workspace</button>
    </div>
    {listedUser!==user.id && <p role="status">Loading workspaces…</p>}
    {projects.length>0 && <ul className="fd-project-list">
     {projects.map(item=><li key={item.id}>
      <button disabled={busy} onClick={()=>open(item.id)} aria-pressed={project?.id===item.id}>
       <strong>{item.title}</strong>
       <small>Version {item.revision} · {item.reviewed_revision===item.revision?'Reviewed':'Working draft'}</small>
      </button>
     </li>)}
    </ul>}
    {mode==='setup'?<section className="fd-panel fd-setup-panel"><FilmDeskOnboarding key={project?.id||'new'} initial={project} user={user} onComplete={create} busy={busy} onCancel={()=>{if(leave())setMode(project?'edit':'list');}}/></section>:!project?
     listedUser===user.id && !error && <section className="fd-panel fd-empty">
      <SiteIcon name={projects.length?'film':'script'} size={24}/>
      <h2>{projects.length?'Choose a workspace':'Start a private workspace'}</h2>
      <p>{projects.length?'Select a saved project above to continue working.':'Set your role and goal, build your plan, and decide what to export or share.'}</p>
     </section>
     :<section className="fd-workspace" aria-label="Personalised workspace">
     <div className="fd-workspace-heading"><div><p className="fd-eyebrow">{reviewed?'REVIEWED VERSION':'PRIVATE WORKING DRAFT'} · VERSION {project.revision}{dirty?' · UNSAVED CHANGES':''}</p><h2>{project.title}</h2><p>{goal?.label||'Production planning'}{project.onboarding?.professional_role?` · ${project.onboarding.professional_role}`:''}</p></div><button disabled={busy} onClick={()=>{if(leave()){setMode('setup');setDirty(false);}}}>Edit setup</button></div>
     <details className="fd-brief"><summary>Your confirmed brief</summary><dl className="fd-summary"><div><dt>Department</dt><dd>{project.onboarding?.department||'Not yet selected'}</dd></div><div><dt>Starting material</dt><dd>{filmDeskMaterials.find(item=>item.id===project.onboarding?.material)?.label||'Not specified'}</dd></div><div><dt>Constraints</dt><dd>{project.onboarding?.constraints||'Not yet recorded'}</dd></div><div><dt>Assumptions</dt><dd>{project.onboarding?.assumptions||'Not yet recorded'}</dd></div>{Object.entries(project.onboarding?.answers||{}).filter(([,value])=>value).map(([key,value])=><div key={key}><dt>{goal?.questions.find(([id])=>id===key)?.[1]||'Material notes'}</dt><dd>{value}</dd></div>)}</dl></details>
     <div className="fd-mode-tabs" role="group" aria-label="Workspace stages">{[['edit','Build your plan'],['review','Review & approve'],['next','Save, export & submit']].map(([key,label])=><button key={key} aria-pressed={mode===key} disabled={busy} onClick={()=>{setMode(key);setApproved(false);}}>{label}</button>)}</div>
     {mode==='edit'&&<><div className="fd-editor"><nav aria-label="FilmDesk tools">{filmDeskTools.map(([key,label])=><button disabled={busy} key={key} onClick={()=>setActive(key)} aria-pressed={active===key}>{label}{goal?.tools.includes(key)&&<small>Suggested for your goal</small>}</button>)}</nav><div className="fd-editor-content"><p className="fd-help">All tools stay accessible. Your brief suggests where to start.</p><label>{tool?.[1]}<textarea rows="12" maxLength={8000} disabled={busy} value={project.plan[active]||''} onChange={event=>{setProject({...project,plan:{...project.plan,[active]:event.target.value}});setDirty(true);}} placeholder={tool?.[2]}/></label><p className="fd-help">{tool?.[2]}</p>{active==='cast'&&<a href={siteLink('find-talent')} target="_blank" rel="noopener">Browse Kemsor talent in a new tab</a>}<div className="fd-actions"><button className="fd-primary" disabled={busy||!dirty||publicPreview} onClick={save}>{busy?'Saving…':'Save private workspace'}</button><button disabled={busy||dirty||!nonempty.length} onClick={()=>setMode('review')}>Review saved version</button></div></div></div>
      <details className="fd-panel fd-upload"><summary>Attach material privately · a script is optional</summary><p>PDF, DOCX or TXT, up to 5 MB. Footage stays with you; add edit notes or private reference links to your plan.</p>{project.script_name&&<p>Attached: <a href={`/api/production/projects/${project.id}/script`}>{project.script_name}</a></p>}<form onSubmit={upload}><fieldset disabled={busy||dirty}><input type="hidden" name="revision" value={project.revision}/><label>Document<input type="file" name="attachment" accept=".pdf,.docx,.txt" required/></label><label className="fd-check"><input type="checkbox" name="private_upload_consent" value="true" required/><span>I have permission to store this material in my private workspace. This is not a studio submission.</span></label><button disabled={busy||dirty}>Save private attachment</button></fieldset></form>{dirty&&<p>Save your plan before attaching a document.</p>}</details>
      <aside className="fd-integrations"><h3>Research and assistance</h3><p><strong>GPT assistance:</strong> not connected yet. Your material is not sent to an AI provider.</p><p><strong>Licensed IMDb research:</strong> not connected yet. Add verified source links and credits manually.</p><p><strong>Your confirmed records:</strong> keep rates, availability and project facts in Confirmed records & references.</p></aside></>}
     {mode==='review'&&<div className="fd-panel"><h3>Review, edit and approve</h3>{dirty?<p>Save your changes before reviewing this version.</p>:<><p>Read each completed section. Check sources, costs, dates and availability; separate assumptions from confirmed facts.</p>{nonempty.length?nonempty.map(([key,label])=><article className="fd-review-section" key={key}><h4>{label}</h4><p>{project.plan[key]}</p><button disabled={busy} onClick={()=>{setActive(key);setMode('edit');}}>Edit {label.toLowerCase()}</button></article>):<p>Add a working plan before approving.</p>}<label className="fd-check"><input type="checkbox" checked={approved} onChange={event=>setApproved(event.target.checked)}/><span>I reviewed this saved version, including its constraints and assumptions.</span></label><button className="fd-primary" disabled={busy||!approved||!nonempty.length} onClick={review}>Approve this version</button></>}</div>}
     {mode==='next'&&<div className="fd-panel"><h3>What next?</h3><p>Saving and exporting keep the workspace private. Studio submission is a separate choice.</p><div className="fd-next-grid"><article><h4>Save private workspace</h4><p>Continue refining your project whenever you are ready.</p><button disabled={busy} onClick={()=>setMode('edit')}>Continue editing</button></article><article><h4>Export working documents</h4><p>Download the saved version you have reviewed.</p>{reviewed?<div className="fd-actions"><a className="fd-primary" href={`/api/production/projects/${project.id}/export`}>Download CSV</a><button onClick={()=>window.print()}>Print / save PDF</button></div>:<button disabled={busy||dirty} onClick={()=>setMode('review')}>Review before exporting</button>}</article><article><h4>Explicitly submit to Kemsor</h4><p>You choose exactly which reviewed material the studio receives.</p><button disabled={busy||!reviewed} onClick={()=>setMode('submit')}>Choose material to share</button></article></div>{!reviewed&&<p className="fd-help">Review and approve the latest saved version to export or share. Further edits require a fresh review.</p>}</div>}
     {mode==='submit'&&<form className="fd-panel" onSubmit={submit}><h3>Choose what Kemsor receives</h3><p>Only the title and selected material below will be shared as a snapshot of version {project.revision}. The rest of your workspace remains private.</p><fieldset disabled={busy||!reviewed}>{nonempty.map(([key,label])=><label className="fd-check" key={key}><input type="checkbox" checked={shareSections.includes(key)} onChange={event=>setShareSections(previous=>event.target.checked?[...previous,key]:previous.filter(value=>value!==key))}/><span>{label}</span></label>)}{project.script_name&&<label className="fd-check"><input type="checkbox" checked={includeScript} onChange={event=>setIncludeScript(event.target.checked)}/><span>Attached document: {project.script_name}</span></label>}<details><summary>Review studio submission terms · {settings.script_terms_version||'Not published'}</summary><p className="fd-preline">{settings.script_terms||'Studio-approved submission terms have not been published.'}</p></details><label className="fd-check"><input type="checkbox" required/><span>I accept the submission terms and confirm I want to share only this selected material with Kemsor.</span></label>{!settings.script_submissions_enabled&&<p>Studio submissions are not open yet. You can continue saving and exporting privately.</p>}<div className="fd-actions"><button className="fd-primary" disabled={busy||!reviewed||!settings.script_submissions_enabled||!settings.script_terms_version||!settings.script_terms||(!shareSections.length&&!includeScript)}>Submit selected material to Kemsor</button><button type="button" onClick={()=>setMode('next')}>Cancel</button></div></fieldset></form>}
     {submissions.length>0&&<section className="fd-panel"><h3>Studio acknowledgement & tracking</h3>{submissions.map(item=><article className="fd-submission" key={item.id}><strong>FD-{item.id} · Version {item.project_revision}</strong><span>{item.status} · {item.created_at} UTC</span>{item.studio_note&&<p>{item.studio_note}</p>}</article>)}</section>}
     <article className="fd-print"><h1>FilmDesk · {project.title}</h1><p>Goal: {goal?.label||project.goals}</p><p>Constraints: {project.onboarding?.constraints||'Not recorded'}</p><p>Assumptions: {project.onboarding?.assumptions||'Not recorded'}</p><p>Reviewed version {project.revision}. Working documents; costs and availability must be confirmed.</p>{filmDeskTools.map(([key,label])=>project.plan[key]&&<section key={key}><h2>{label}</h2><p>{project.plan[key]}</p></section>)}</article>
    </section>}
   </>}
  </div>
 </div>;
}
