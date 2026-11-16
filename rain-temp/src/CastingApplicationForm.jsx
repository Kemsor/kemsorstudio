import React,{useState} from 'react';
import {useMember} from './MemberSession';
import {api} from './talent-api';
export default function CastingApplicationForm({call,settings}){
 const {user,loading}=useMember();const [busy,setBusy]=useState(false),[error,setError]=useState(''),[success,setSuccess]=useState('');
 async function submit(event){event.preventDefault();const fields=Object.fromEntries(new FormData(event.currentTarget));setBusy(true);setError('');try{const response=await api(`/api/casting-calls/${call.id}/applications`,{...fields,consent:fields.consent==='on',terms_version:settings.version});setSuccess(response.message);}catch(error){setError(error.message);}finally{setBusy(false);}}
 if(call.state!=='open')return null;
 if(!settings?.enabled)return <p className="casting-board-note">Online applications will open soon.</p>;
 if(loading)return <p role="status">Checking your account…</p>;
 if(!user)return <p><a href="/login/">Sign in</a> with a talent account to apply. <a href="/join/">Join the talent network</a>.</p>;
 if(user.role!=='artist')return <p>Applications are available to talent accounts.</p>;
 if(success)return <div role="status"><p>{success}</p><a href="/profile/#applications">My applications</a></div>;
 return <details className="casting-apply"><summary>Apply for a role</summary><form onSubmit={submit}><p>Your current talent profile will be included with this application. <a href="/profile/#profile">Review your profile</a>.</p><label>Role<select name="role_key" required><option value="">Choose a role</option>{call.roles.map(role=><option key={role.id} value={role.id}>{role.name}</option>)}</select></label><label>Message to the casting team<textarea name="message" rows="4" required maxLength="4000"/></label><label>Audition / portfolio links (optional)<textarea name="audition_links" rows="3" maxLength="8000" placeholder="https://…"/><small>Up to five HTTPS links, one per line. Ensure the casting team can access them.</small></label><details><summary>Casting application terms · {settings.version}</summary><p className="casting-requirements">{settings.terms}</p></details><label className="casting-consent"><input type="checkbox" name="consent" required/> I accept these casting application terms and agree to share my profile and audition links with the studio for this application.</label>{error&&<p role="alert">{error}</p>}<button type="submit" disabled={busy}>{busy?'Submitting…':'Submit application'}</button></form></details>;
}
