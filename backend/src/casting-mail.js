import {rows} from './db.js';
import {defaultSiteUrl,siteOrigin} from '../../rain-temp/src/seo.js';
export function castingMail(application,account,status,eventId){
 const reference=`CAST-${String(application.id).padStart(6,'0')}`;
 const received=status==='submitted';
 if(!received&&!['shortlisted','rejected'].includes(status))return null;
 const headline=received?'Casting application received':status==='shortlisted'?'Your casting application has been shortlisted':'Update on your casting application';
 const copy=received?'Thank you for applying. Your application has been received by the casting team.':status==='shortlisted'?'Your application has been shortlisted. The casting team will contact you if further information or an audition is required. This is not a final casting confirmation.':'Thank you for your interest. Your application has not been selected for this role. We appreciate the time you took to apply.';
 return {key:received?`${reference}-RECEIVED`:`${reference}-${status.toUpperCase()}-${eventId}`,subject:`${headline} | ${reference}`,body:`Hello ${account.name},\n\n${copy}\n\nCasting call: ${application.call_title}\nRole: ${application.role_name}\nReference: ${reference}\n\nTrack your application:\n${siteOrigin(process.env.SITE_URL||defaultSiteUrl)}/profile/#applications\n\nKemsor Studios`};
}
export async function queueCastingMail(connection,application,account,status,eventId=null){
 const mail=castingMail(application,account,status,eventId);if(!mail)return;
 await rows(connection,'INSERT INTO cms_email_outbox(receipt_key,recipient,subject,body,available_at,casting_application_id,casting_event_id) VALUES(?,?,?,?,UTC_TIMESTAMP(),?,?)',[mail.key,account.email,mail.subject,mail.body,application.id,eventId]);
}
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function castingMailHtml(mail){if(!/^CAST-\d+-(?:RECEIVED|(?:SHORTLISTED|REJECTED)-\d+)$/.test(mail.receipt_key))return undefined;return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f2e8d7;color:#251c12;font:16px/1.7 Arial,sans-serif"><main style="max-width:600px;margin:32px auto;background:white;padding:32px;border-radius:20px"><p style="color:#976124;letter-spacing:2px;font-weight:bold">KEMSOR STUDIOS</p><h1 style="font:28px/1.3 Georgia,serif">${escape(mail.subject.split(' | ')[0])}</h1>${mail.body.split(/\n\s*\n/).map(paragraph=>`<p>${escape(paragraph).replaceAll('\n','<br>')}</p>`).join('')}</main></body></html>`;}
