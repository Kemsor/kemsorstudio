import {test} from 'node:test';
import assert from 'node:assert/strict';
import {confirmationHtml} from '../src/email-templates.js';
import {receipt,deliverReceipt} from '../src/mail.js';
import {sendEmail} from '../src/godaddy-email.js';

test('Enquiry and application templates preserve references and distinct next steps',()=>{
 for(const kind of ['enquiry','application']){
  const mail=receipt(kind,14,'Sam');
  const html=confirmationHtml({reference:mail.reference,body:mail.body});
  assert(html.includes(mail.reference));assert(html.includes('Hello Sam,'));
  assert(html.includes(kind==='application'?'APPLICATION RECEIVED':'ENQUIRY RECEIVED'));
  assert(html.includes(kind==='application'?'if your profile matches':'reply to this email'));
  assert(html.includes('https://kemsorstudio.com/'));assert(html.includes('mailto:info@kemsorstudio.com'));
 }
});
test('Recipient content is escaped and unsupported messages stay plain text',()=>{
 const mail=receipt('enquiry',1,'<img src=x onerror="alert(1)"> & Sam');
 const html=confirmationHtml({reference:mail.reference,body:mail.body});
 assert(!html.includes('<img src=x'));assert.equal((html.match(/<img /g)||[]).length,1);assert(html.includes('&lt;img'));assert(html.includes('&amp; Sam'));
 assert.equal(confirmationHtml({reference:'CAM-1',body:'Campaign content'}),undefined);
 assert.equal(confirmationHtml({reference:'KEM-1<script>',body:'Content'}),undefined);
});

test('Queued receipt reaches the gateway with both designed HTML and plain text',async()=>{
 const receiptCopy=receipt('enquiry',5,'Sam');
 let sent=false,markedSent=false;
 const db={execute:async(sql)=>{
  if(sql.startsWith('SELECT *'))return [[{id:5,receipt_key:receiptCopy.reference,recipient:'sam@example.test',subject:receiptCopy.subject,body:receiptCopy.body}],[]];
  if(sql.includes("SET status='sent'"))markedSent=true;
  return [{affectedRows:1},[]];
 }};
 const transport={sendMail:message=>sendEmail(message,async(url,options)=>{
  const payload=JSON.parse(options.body);
  assert.equal(payload.text,receiptCopy.body);
  assert(payload.html.includes('Thanks for starting a conversation.'));
  assert(payload.html.includes('kemsor-logo-email.png'));
  assert(payload.html.includes('KEM-000005'));
  sent=true;return {ok:true,json:async()=>({success:true,messageId:'html-test'})};
 })};
 assert.equal(await deliverReceipt(db,transport),true);
 assert(sent);assert(markedSent);
});
