import React, { useEffect, useRef, useState } from 'react';
import { cmsApi, useCms } from './CmsContent';
import { TaskLoader } from './Loading';
const categories = { business: 'Business', partnerships: 'Partnerships / co-production / distribution / brands', press: 'Press & media', careers: 'Careers / work with us', production: 'Production / service partners', copyright: 'Copyright / anti-piracy', general: 'General / other' };
export default function EnquiryForm() {
  const { settings, connected } = useCms();
  const request = useRef(null);
  const mounted = useRef(true);
  const [busy, setBusy] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => () => { mounted.current = false; request.current?.abort(); }, []);
  useEffect(() => {
    if (!busy) { setShowLoader(false); return; }
    const timer = setTimeout(() => setShowLoader(true), 300);
    return () => clearTimeout(timer);
  }, [busy]);
  const submit = async event => {
    event.preventDefault(); if (busy) return;
    const form = event.currentTarget, data = new FormData(form);
    setBusy(true); setProgress(0); setResult(null); setError('');
    try {
      const csrf = await fetch(`${cmsApi}/csrf`, { credentials: 'same-origin', signal: AbortSignal.timeout(10000) });
      if (!csrf.ok) throw new Error('Could not prepare the enquiry. Please try again.');
      const { token } = await csrf.json(); if (!mounted.current) return;
      setProgress(10);
      const response = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest(); request.current = xhr;
        xhr.open('POST', `${cmsApi}/enquiries`); xhr.setRequestHeader('X-CSRF-Token', token); xhr.timeout = 30000;
        xhr.upload.onprogress = event => { if (event.lengthComputable && mounted.current) setProgress(10 + Math.round(event.loaded / event.total * 70)); };
        xhr.upload.onload = () => { if (mounted.current) setProgress(90); };
        xhr.onload = () => { let value; try { value = JSON.parse(xhr.responseText); } catch { reject(new Error('The enquiry service is unavailable. Please try again.')); return; } if (xhr.status >= 200 && xhr.status < 300) resolve(value); else reject(new Error(value.error || 'Could not send your enquiry.')); };
        xhr.onerror = () => reject(new Error('Could not connect. Please check your connection and try again.'));
        xhr.ontimeout = () => reject(new Error('The request timed out. Check with the studio before sending again.'));
        xhr.onabort = () => reject(new Error('Sending was cancelled.'));
        xhr.send(data);
      });
      if (!mounted.current) return;
      setProgress(100); setResult(response); form.reset();
    } catch (reason) { if (mounted.current) setError(reason.message); }
    finally { request.current = null; if (mounted.current) setBusy(false); }
  };
  return <section className="page-section page-split" id="send-enquiry">
    <div className="page-copy"><p className="page-eyebrow">CONTACT / THE STUDIO INBOX</p><h2>A conversation<br />starts here.</h2><p>Choose the kind of enquiry and tell the studio what you need. Keep the downloadable project brief above for your own records.</p></div>
    {!connected || !settings.enquiries_enabled ? <div className="page-copy"><p>Studio enquiries will open here when the contact workspace is ready.</p></div> : <form className="project-form page-brief-form cms-enquiry-form" onSubmit={submit} aria-label="Send a studio enquiry">
      <div className="form-fields">
        <label>Enquiry category<select name="category" required>{Object.entries(categories).map(([key,label]) => <option key={key} value={key}>{label}</option>)}</select></label>
        <label>Your name<input name="name" required maxLength="100" autoComplete="name" /></label>
        <label>Email<input type="email" name="email" required maxLength="254" autoComplete="email" /></label>
        <label>Organisation<input name="organisation" maxLength="150" autoComplete="organization" /></label>
        <label className="story-field">Subject<input name="subject" required maxLength="200" /></label>
        <label className="story-field">Your enquiry<textarea name="message" rows="6" required maxLength="8000" /></label>
        {settings.attachments_enabled && <label className="story-field">Optional attachment<input name="attachment" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" /><span>PDF, JPEG, PNG or WebP. Maximum 5 MB.</span></label>}
      </div>
      <label className="enquiry-honeypot" aria-hidden="true">Website<input name="website" tabIndex="-1" autoComplete="off" /></label>
      <p className="cms-enquiry-notice">{settings.privacy_notice}</p>
      <label className="check"><input type="checkbox" name="consent" value="true" required />I agree to my details being used for this enquiry as described above.</label>
      <button type="submit" className="creative-cta" disabled={busy}><span>{busy ? 'Sending enquiry…' : 'Send enquiry'}</span><span aria-hidden="true">→</span></button>
      {showLoader && <TaskLoader progress={progress} label="Sending your enquiry" />}
      {result && <p className="cms-enquiry-status" role="status">100% complete. {result.message} Your reference is {result.reference}.</p>}
      {error && <p className="cms-enquiry-status" role="alert">{error}</p>}
    </form>}
  </section>;
}
