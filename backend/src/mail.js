import nodemailer from 'nodemailer';
import { randomUUID } from 'node:crypto';
import { rows } from './db.js';

export function receipt(kind, id, name) {
  const reference=`${kind==='application'?'APP':'KEM'}-${String(id).padStart(6,'0')}`;
  const subject=kind==='application'?'We received your application':'We received your enquiry';
  const message=kind==='application'
    ? 'Thank you for your interest in working with Kemsor. We have received your application. Our team will review it and contact you if your profile matches the opportunity.'
    : 'Thank you for contacting Kemsor. We have received your enquiry. Our team will review your message and get back to you.';
  return {reference,subject:`${subject} | ${reference}`,body:`Hello ${name},\n\n${message}\n\nYour reference: ${reference}\n\nKemsor Studios`};
}

// Save the form and its receipt together. SMTP is deliberately outside this transaction.
export async function saveWithReceipt(db, kind, name, email, save) {
  const connection=await db.getConnection();
  try {
    await connection.beginTransaction();
    const result=await save(connection);
    const mail=receipt(kind,result.insertId,name);
    await rows(connection,'INSERT INTO cms_email_outbox(receipt_key,recipient,subject,body,available_at) VALUES(?,?,?,?,UTC_TIMESTAMP())',[mail.reference,email,mail.subject,mail.body]);
    await connection.commit();
    return mail.reference;
  } catch(error) {await connection.rollback();throw error;}
  finally {connection.release();}
}

export function smtpConfig(env=process.env) {
  if(env.SMTP_ENABLED!=='true')return null;
  const port=Number(env.SMTP_PORT || 465);
  if(!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASSWORD || ![465,587].includes(port))throw new Error('Set SMTP_HOST, SMTP_USER, SMTP_PASSWORD and SMTP_PORT (465 or 587).');
  return {host:env.SMTP_HOST,port,secure:port===465,requireTLS:port===587,
    auth:{user:env.SMTP_USER,pass:env.SMTP_PASSWORD},
    connectionTimeout:10000,greetingTimeout:10000,socketTimeout:20000,
    disableFileAccess:true,disableUrlAccess:true};
}

export async function deliverReceipt(db, transport, from) {
  await rows(db,"UPDATE cms_email_outbox SET status='failed',claim_token=NULL WHERE status='sending' AND attempts>=5 AND available_at<=UTC_TIMESTAMP()");
  const claim=randomUUID();
  // Atomic claim also allows another process to recover an interrupted delivery.
  const result=await rows(db,`UPDATE cms_email_outbox SET status='sending',claim_token=?,attempts=attempts+1,available_at=DATE_ADD(UTC_TIMESTAMP(),INTERVAL 5 MINUTE)
    WHERE attempts<5 AND available_at<=UTC_TIMESTAMP() AND status IN ('pending','sending') ORDER BY id LIMIT 1`,[claim]);
  if(!result.affectedRows)return false;
  const mail=(await rows(db,'SELECT * FROM cms_email_outbox WHERE claim_token=?',[claim]))[0];
  try {
    await transport.sendMail({from,to:mail.recipient,subject:mail.subject,text:mail.body});
    await rows(db,"UPDATE cms_email_outbox SET status='sent',sent_at=UTC_TIMESTAMP(),claim_token=NULL WHERE id=? AND claim_token=?",[mail.id,claim]);
  } catch {
    await rows(db,"UPDATE cms_email_outbox SET status=IF(attempts>=5,'failed','pending'),available_at=DATE_ADD(UTC_TIMESTAMP(),INTERVAL 5 MINUTE),claim_token=NULL WHERE id=? AND claim_token=?",[mail.id,claim]);
    console.warn(`Email receipt ${mail.id} deferred; attempt ${mail.attempts}.`);
  }
  return true;
}

export function startMailWorker(db, env=process.env) {
  const config=smtpConfig(env);
  if(!config){console.log('Email receipts are queued; SMTP delivery is disabled.');return async()=>{};}
  const transport=nodemailer.createTransport(config);
  let stopped=false, running=null;
  const tick=()=>{
    if(stopped || running)return;
    running=(async()=>{for(let i=0;i<10 && !stopped;i++)if(!await deliverReceipt(db,transport,`Kemsor Studios <${env.SMTP_USER}>`))break;})()
      .catch(()=>console.error('Email queue unavailable; delivery will retry.')).finally(()=>{running=null;});
  };
  const timer=setInterval(tick,5000);timer.unref();tick();
  return async()=>{stopped=true;clearInterval(timer);await running;transport.close();};
}
