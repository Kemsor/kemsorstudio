import nodemailer from 'nodemailer';
import { randomUUID } from 'node:crypto';
import { rows } from './db.js';
import { gatewayTransport } from './godaddy-email.js';

const mailProvider=env=>env.EMAIL_TRANSPORT || (env.NODE_ENV==='production'?'godaddy':'smtp');

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

// Support's cPanel relay settings, deliberately limited to loopback.
// Hosted support must confirm availability; this does not select it automatically.
export function relayConfig() {
  return {host:'localhost',port:25,secure:false,ignoreTLS:true,
    connectionTimeout:10000,greetingTimeout:10000,socketTimeout:20000,
    disableFileAccess:true,disableUrlAccess:true};
}

function createMailTransport(configuration,env) {
  if(configuration.provider==='godaddy')return gatewayTransport();
  return nodemailer.createTransport(configuration.provider==='relay'?relayConfig():smtpConfig(env));
}

// Provider errors may contain credentials or message data. Keep only known codes.
export function mailError(error) {
  const descriptions={EAUTH:'Mailbox authentication failed. Check the SMTP username and password in this environment.',
    ETIMEDOUT:'The SMTP connection timed out. Check outbound SMTP access and the configured port.',
    ECONNECTION:'The app could not connect to the SMTP server.',ECONNREFUSED:'The SMTP server refused the connection.',
    ECONNRESET:'The SMTP connection was interrupted.',ESOCKET:'The SMTP socket or TLS connection failed.',
    ETLS:'The SMTP TLS handshake failed.',EDNS:'The SMTP hostname could not be resolved.',
    ENOTFOUND:'The SMTP hostname could not be resolved.',EENVELOPE:'The mail server rejected the sender or recipient.',
    EMESSAGE:'The mail server rejected the message.',EPROTOCOL:'The SMTP server returned an unexpected response.',
    GATEWAY_CONNECTION:'The GoDaddy email gateway could not be reached inside this app container.',
    GATEWAY_TIMEOUT:'The GoDaddy email gateway did not respond before the deadline.',
    GATEWAY_REJECTED:'The GoDaddy email gateway rejected the message. Check the app email service and sending limits.',
    GATEWAY_RESPONSE:'The GoDaddy email gateway did not return a message identifier.'};
  const code=Object.hasOwn(descriptions,error?.code)?error.code:'SMTP_ERROR';
  const original=Object.hasOwn(descriptions,error?.originalCode)?error.originalCode:null;
  const response=Number(error?.responseCode);
  return `${code}${original&&original!==code?`/${original}`:''}${Number.isInteger(response)&&response>=400&&response<=599?` (${response})`:''}: ${descriptions[original || code] || 'Email delivery failed. Check the mail service configuration.'}`;
}

export function mailConfiguration(env=process.env) {
  try {
    const provider=mailProvider(env);
    if(env.EMAIL_ENABLED==='false')return {enabled:false,provider,host:'',port:'',message:'Confirmation email delivery is disabled by EMAIL_ENABLED.'};
    if(provider==='godaddy')return {enabled:true,provider,host:'GoDaddy built-in email gateway',port:2525,username:'sxqc7mdcy1@airoapp.ai; replies go to info@kemsorstudio.com',
      message:'Confirmation emails use the GoDaddy app gateway. External SMTP settings are not used.'};
    if(provider==='relay')return {enabled:true,provider,host:'localhost',port:25,username:'info@kemsorstudio.com',
      message:'Testing the relay settings supplied by GoDaddy support: localhost:25, SMTP authentication off, SSL/TLS off. The sender is info@kemsorstudio.com.'};
    if(provider!=='smtp')return {enabled:false,provider,host:'',port:'',message:'Choose EMAIL_TRANSPORT=godaddy, smtp, or relay.'};
    const config=smtpConfig(env);
    return {enabled:!!config,provider,host:config?.host || '',port:config?.port || '',username:config?.auth.user || '',
      message:config?'SMTP delivery is enabled. Check the connection below.':'SMTP delivery is disabled in this environment. Set SMTP_ENABLED=true in its GoDaddy secrets.'};
  }catch{return {enabled:false,host:'',port:'',message:'SMTP configuration is incomplete. Check SMTP_HOST, SMTP_USER, SMTP_PASSWORD and SMTP_PORT in this environment.'};}
}

export async function verifyMailConnection(env=process.env, suppliedTransport) {
  let transport;
  try {
    const state=mailConfiguration(env);
    if(!state.enabled)return {ok:false,message:state.message};
    transport=suppliedTransport || createMailTransport(state,env);
    await transport.verify();
    if(state.provider==='godaddy')return {ok:true,message:'The GoDaddy email gateway is reachable. No email was sent. A form confirmation is still needed to verify acceptance and inbox delivery.'};
    if(state.provider==='relay')return {ok:true,message:'The localhost:25 SMTP relay is reachable and accepts a connection without authentication or TLS. No email was sent. A form confirmation must still verify that info@kemsorstudio.com is accepted as sender and reaches the inbox.'};
    return {ok:true,message:'SMTP connection and authentication succeeded. No email was sent. This does not confirm inbox delivery.'};
  }catch(error){return {ok:false,message:mailError(error)};}
  finally{if(!suppliedTransport)transport?.close();}
}

export async function deliverReceipt(db, transport, from) {
  await rows(db,"UPDATE cms_email_outbox SET status='failed',claim_token=NULL,last_error='Delivery was interrupted during its final attempt.' WHERE status='sending' AND attempts>=5 AND available_at<=UTC_TIMESTAMP()");
  const claim=randomUUID();
  // Atomic claim also allows another process to recover an interrupted delivery.
  const result=await rows(db,`UPDATE cms_email_outbox SET status='sending',claim_token=?,attempts=attempts+1,available_at=DATE_ADD(UTC_TIMESTAMP(),INTERVAL 5 MINUTE)
    WHERE attempts<5 AND available_at<=UTC_TIMESTAMP() AND status IN ('pending','sending') ORDER BY id LIMIT 1`,[claim]);
  if(!result.affectedRows)return false;
  const mail=(await rows(db,'SELECT * FROM cms_email_outbox WHERE claim_token=?',[claim]))[0];
  try {
    const result=await transport.sendMail({from,to:mail.recipient,subject:mail.subject,text:mail.body});
    if(result?.rejected?.length && !result.accepted?.length)throw Object.assign(new Error('Recipient rejected'),{code:'EENVELOPE'});
    const messageId=typeof result?.messageId==='string'?result.messageId.slice(0,255):null;
    await rows(db,"UPDATE cms_email_outbox SET status='sent',sent_at=UTC_TIMESTAMP(),claim_token=NULL,last_error=NULL,provider_message_id=? WHERE id=? AND claim_token=?",[messageId,mail.id,claim]);
    console.info('Email service accepted confirmation:',JSON.stringify({reference:mail.receipt_key,messageId}));
  } catch(error) {
    const reason=mailError(error);
    await rows(db,"UPDATE cms_email_outbox SET status=IF(attempts>=5,'failed','pending'),available_at=DATE_ADD(UTC_TIMESTAMP(),INTERVAL 5 MINUTE),claim_token=NULL,last_error=? WHERE id=? AND claim_token=?",[reason,mail.id,claim]);
    console.warn(`Email receipt ${mail.id} deferred; attempt ${mail.attempts}. ${reason}`);
  }
  return true;
}

export function startMailWorker(db, env=process.env) {
  const configuration=mailConfiguration(env);
  if(!configuration.enabled){console.log(`Email receipts are queued. ${configuration.message}`);return async()=>{};}
  const transport=createMailTransport(configuration,env);
  const verification=verifyMailConnection(env,transport).then(result=>console.log(`Email startup check: ${result.message}`));
  let stopped=false, running=null;
  const tick=()=>{
    if(stopped || running)return;
    const from=configuration.provider==='relay'?'Kemsor Studios <info@kemsorstudio.com>':configuration.provider==='smtp'?`Kemsor Studios <${env.SMTP_USER}>`:undefined;
    running=(async()=>{for(let i=0;i<10 && !stopped;i++)if(!await deliverReceipt(db,transport,from))break;})()
      .catch(()=>console.error('Email queue unavailable; delivery will retry.')).finally(()=>{running=null;});
  };
  const timer=setInterval(tick,5000);timer.unref();tick();
  return async()=>{stopped=true;clearInterval(timer);await Promise.all([running,verification]);transport.close();};
}
