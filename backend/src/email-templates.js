const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

// Render stored receipt copy at delivery time, so queued receipts need no migration.
export function confirmationHtml({reference,body}) {
 if(!/^(KEM|APP)-\d+$/.test(reference||''))return undefined;
 const application=reference.startsWith('APP-');
 const title=application?'Your application is with us.':'Thanks for starting a conversation.';
 const label=application?'APPLICATION RECEIVED':'ENQUIRY RECEIVED';
 const next=application?'Our team will review your application and contact you if your profile matches the opportunity.':'Our team will review your enquiry and get back to you. You can reply to this email if there is anything you would like to add.';
 const paragraphs=String(body).split(/\n\s*\n/).filter(part=>part.trim()!=='Kemsor Studios'&&!part.startsWith('Your reference:')).map(part=>`<p style="margin:0 0 20px;font:15px/1.8 Arial,Helvetica,sans-serif;color:#505050;overflow-wrap:anywhere">${escapeHtml(part).replace(/\n/g,'<br>')}</p>`).join('');
 return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${label==='APPLICATION RECEIVED'?'Application':'Enquiry'} confirmation | Kemsor Studios</title></head>
<body style="margin:0;padding:0;background:#f1edff;color:#282828">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${application?'Your application':'Your enquiry'} is with our team. Your reference is ${escapeHtml(reference)}.</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f1edff"><tr><td align="center" style="padding:32px 12px">
<!--[if mso]><table role="presentation" width="600"><tr><td><![endif]-->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background:#ffffff;border-radius:28px;overflow:hidden">
<tr><td style="padding:24px 28px 14px"><a href="https://kemsorstudio.com/" style="text-decoration:none"><img src="https://kemsorstudio.com/assets/kemsor-logo-email.png" width="64" height="58" alt="Kemsor Studios" style="display:block;width:64px;height:58px;object-fit:contain;border:0"></a></td></tr>
<tr><td style="padding:8px 28px 0;background:#ffffff"><p style="margin:0 0 14px;font:10px/1.5 Arial,Helvetica,sans-serif;letter-spacing:1.3px;color:#146658"><span style="display:inline-block;padding:6px 11px;background:#dcf7eb;border-radius:999px">&#10003; &nbsp; ${label}</span></p><h1 style="margin:0;font:normal 23px/1.35 Georgia,'Times New Roman',serif;color:#282828">${title}</h1></td></tr>
<tr><td style="padding:24px 28px 0">${paragraphs}</td></tr>
<tr><td style="padding:0 28px 24px"><p style="margin:0;font:11px/1.7 Arial,Helvetica,sans-serif;color:#757575">Your reference &nbsp; <span style="color:#505050;font-weight:600">${escapeHtml(reference)}</span></p></td></tr>
<tr><td style="padding:0 28px 32px"><h2 style="margin:0 0 10px;font:600 14px Arial,Helvetica,sans-serif,'Times New Roman',serif;color:#282828">What happens next</h2><p style="margin:0 0 26px;font:14px/1.8 Arial,Helvetica,sans-serif;color:#505050">${next}</p><table role="presentation" cellspacing="0" cellpadding="0"><tr><td bgcolor="#ffd36b" style="border-radius:999px"><a href="https://kemsorstudio.com/" style="display:inline-block;padding:12px 22px;border:1px solid #ffd36b;border-radius:999px;color:#282828;text-decoration:none;font:13px/1.5 Arial,Helvetica,sans-serif;mso-padding-alt:0">Explore the studio &#8599;</a></td></tr></table></td></tr>
<tr><td style="padding:24px 28px;background:#f7f5ff;border-radius:22px"><p style="margin:0 0 10px;font:16px Georgia,'Times New Roman',serif;color:#282828">Story. Craft. Cinema.</p><p style="margin:0;font:12px/1.9 Arial,Helvetica,sans-serif;color:#686868">Kemsor Studios<br><a href="mailto:info@kemsorstudio.com" style="color:#505050">info@kemsorstudio.com</a><br>This confirmation follows your ${application?'application':'enquiry'} to Kemsor Studios.</p></td></tr>
</table><!--[if mso]></td></tr></table><![endif]-->
</td></tr></table></body></html>`;
}
