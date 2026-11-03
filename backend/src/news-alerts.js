import {Router} from 'express';
import {randomBytes,randomUUID,createHmac} from 'node:crypto';
import {rows,audit} from './db.js';
import {rateLimited,digest,token} from './security.js';
import {csvCell} from './reports.js';
const topics=['Productions','Festivals and Awards','Press Releases'];
const fail=(ok,message,status=422)=>{if(!ok)throw Object.assign(new Error(message),{status});};
const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const validToken=value=>typeof value==='string'&&/^[a-f0-9]{64}$/.test(value);
const acknowledgement={message:'Please check your inbox for a confirmation link. Your preferences will be activated after you confirm your email.'};
const page=(title,body)=>`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${escape(title)} | Kemsor Studios</title><link rel="stylesheet" href="/api/newsletter/styles.css"></head><body><main class="news-alert-confirm"><p>KEMSOR STUDIOS</p><h1>${escape(title)}</h1>${body}<p><a href="/press-media/">Back to the Newsroom</a> · <a href="/privacy-policy/">Privacy Policy</a></p></main></body></html>`;
async function queueMail(connection,email,subject,body){await rows(connection,'INSERT INTO cms_email_outbox(receipt_key,recipient,subject,body) VALUES(?,?,?,?)',[`NEWS-${randomUUID()}`,email,subject,body]);}
export function newsAlertsRouter(db) {
 const router=Router();
 router.get('/api/newsletter/styles.css',(req,res)=>res.sendFile(new URL('../public/news-alerts.css',import.meta.url).pathname));
 router.post('/api/newsletter/subscribe',async(req,res)=>{
  const b=req.body;
  fail(!b.website,'Please leave the website field empty.');
  fail(!await rateLimited(db,`news-subscribe:${req.ip}`,5,3600),'Please wait before requesting another confirmation.',429);
  const email=typeof b.email==='string'?b.email.trim().toLowerCase():'';
  fail(email.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),'Enter a valid email address.');
  fail(!await rateLimited(db,`news-email:${digest(email)}`,3,86400),'Please wait before requesting another confirmation.',429);
  fail(b.consent===true||b.consent==='true'||b.consent==='on','Agree to receive news before subscribing.');
  const requested=[...new Set(Array.isArray(b.topics)?b.topics:[b.topics])];
  fail(requested.length>0&&requested.every(value=>topics.includes(value)),'Choose at least one topic from the list.');
  const confirmation=randomBytes(32).toString('hex'),connection=await db.getConnection();
  try {
   await connection.beginTransaction();
   const existing=(await rows(connection,'SELECT id FROM cms_news_subscriptions WHERE email=? FOR UPDATE',[email]))[0];
   let id=existing?.id;
   if(!id)id=(await rows(connection,'INSERT INTO cms_news_subscriptions(email,topics,consent_version) VALUES(?, ?,"news-alerts-v1")',[email,'[]'])).insertId;
   await rows(connection,'UPDATE cms_news_subscriptions SET pending_topics=?,confirmation_hash=?,confirmation_expires_at=DATE_ADD(UTC_TIMESTAMP(),INTERVAL 48 HOUR),pending_consent_at=UTC_TIMESTAMP() WHERE id=?',[JSON.stringify(requested),digest(confirmation),id]);
   const url=new URL(`/api/newsletter/confirm?token=${confirmation}`,process.env.WEBSITE_URL||'http://127.0.0.1:3007').href;
   await queueMail(connection,email,'Confirm your KEMSOR news alerts',`You requested KEMSOR Studios news alerts for: ${requested.join(', ')}.\n\nConfirm your email within 48 hours:\n${url}\n\nIf you did not request this, ignore this email. You will not be subscribed by this request.\n\nKEMSOR Studios`);
   await connection.commit();res.status(202).json(acknowledgement);
  }catch(error){await connection.rollback();throw error;}finally{connection.release();}
 });
 for(const action of ['confirm','unsubscribe'])router.get(`/api/newsletter/${action}`,async(req,res)=>{
  res.set({'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'});
  const raw=req.query.token;fail(validToken(raw),'This link is invalid.',404);
  const field=action==='confirm'?'confirmation_hash':'unsubscribe_hash';
  const record=(await rows(db,`SELECT id FROM cms_news_subscriptions WHERE ${field}=?${action==='confirm'?' AND confirmation_expires_at>UTC_TIMESTAMP()':''}`,[digest(raw)]))[0];
  if(!record)return res.status(404).type('html').send(page('Link unavailable','<p>This link has expired or has already been used.</p>'));
  req.session.csrf ||= token();
  const title=action==='confirm'?'Confirm news alerts':'Unsubscribe from news alerts';
  res.type('html').send(page(title,`<p>${action==='confirm'?'Confirm that you want KEMSOR news by email on your selected topics.':'Confirm that you want to stop receiving KEMSOR news alerts.'}</p><form method="post" action="/api/newsletter/${action}"><input type="hidden" name="_csrf" value="${escape(req.session.csrf)}"><input type="hidden" name="token" value="${escape(raw)}"><button>${escape(title)}</button></form>`));
 });
 router.post('/api/newsletter/confirm',async(req,res)=>{
  fail(validToken(req.body.token),'This confirmation link is invalid.',404);
  const connection=await db.getConnection();
  try {
   await connection.beginTransaction();
   const record=(await rows(connection,'SELECT * FROM cms_news_subscriptions WHERE confirmation_hash=? AND confirmation_expires_at>UTC_TIMESTAMP() FOR UPDATE',[digest(req.body.token)]))[0];
   fail(record&&record.pending_topics,'This confirmation link has expired or has already been used.',404);
   const unsubscribe=createHmac('sha256',process.env.SESSION_SECRET).update(`news-unsubscribe:${record.id}:${record.email}`).digest('hex');
   await rows(connection,'UPDATE cms_news_subscriptions SET status="active",topics=pending_topics,pending_topics=NULL,confirmation_hash=NULL,confirmation_expires_at=NULL,unsubscribe_hash=?,consent_at=pending_consent_at,unsubscribed_at=NULL,consent_version="news-alerts-v1" WHERE id=?',[digest(unsubscribe),record.id]);
   const url=new URL(`/api/newsletter/unsubscribe?token=${unsubscribe}`,process.env.WEBSITE_URL||'http://127.0.0.1:3007').href;
   await queueMail(connection,record.email,'Your KEMSOR news preferences are confirmed',`Your email and topic preferences are confirmed.\n\nYou can unsubscribe at any time:\n${url}\n\nKEMSOR Studios`);
   await connection.commit();res.type('html').send(page('You’re subscribed','<p>Your email preferences are confirmed. A message with your unsubscribe link has been queued.</p>'));
  }catch(error){await connection.rollback();throw error;}finally{connection.release();}
 });
 router.post('/api/newsletter/unsubscribe',async(req,res)=>{
  fail(validToken(req.body.token),'This unsubscribe link is invalid.',404);
  const connection=await db.getConnection();
  try {
   await connection.beginTransaction();
   const record=(await rows(connection,'SELECT id,email FROM cms_news_subscriptions WHERE unsubscribe_hash=? FOR UPDATE',[digest(req.body.token)]))[0];
   fail(record,'This unsubscribe link is unavailable.',404);
   await rows(connection,'UPDATE cms_news_subscriptions SET status="unsubscribed",unsubscribed_at=UTC_TIMESTAMP(),confirmation_hash=NULL,pending_topics=NULL,confirmation_expires_at=NULL WHERE id=?',[record.id]);
   await rows(connection,"DELETE FROM cms_email_outbox WHERE recipient=? AND receipt_key LIKE 'NEWS-%' AND status IN ('pending','failed')",[record.email]);
   await connection.commit();
  }catch(error){await connection.rollback();throw error;}finally{connection.release();}
  res.type('html').send(page('You’re unsubscribed','<p>You will no longer receive KEMSOR news alerts unless you subscribe and confirm again.</p>'));
 });
 router.use('/admin/newsletter',(req,res,next)=>req.user?.role==='admin'?next():next(Object.assign(new Error('Administrator access required.'),{status:403})));
 router.get(['/admin/newsletter','/admin/newsletter/download.csv'],async(req,res)=>{
  const state=['pending','active','unsubscribed'].includes(req.query.status)?req.query.status:'';
  const subscriptions=await rows(db,'SELECT id,email,status,topics,consent_version,consent_at,unsubscribed_at,created_at FROM cms_news_subscriptions WHERE (?="" OR status=?) ORDER BY id DESC LIMIT 1000',[state,state]);
  if(req.path.endsWith('.csv')){
   // Only currently confirmed subscribers can enter a mailing export.
   const active=subscriptions.filter(row=>row.status==='active');
   const columns=['email','topics','consent_version','consent_at'];await audit(db,req.user,'export','news_subscriptions',active.length);
   return res.type('text/csv').attachment('kemsor-confirmed-news-subscribers.csv').send('\uFEFF'+[columns.map(csvCell).join(','),...active.map(row=>columns.map(column=>csvCell(row[column])).join(','))].join('\r\n'));
  }
  res.render('news-subscriptions',{subscriptions,state});
 });
 return router;
}
