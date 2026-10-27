import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sendEmail} from '../src/godaddy-email.js';
import {mailConfiguration,verifyMailConnection,mailError} from '../src/mail.js';

test('GoDaddy uses its gateway without SMTP credentials',async()=>{
 const env={EMAIL_TRANSPORT:'godaddy',SMTP_ENABLED:'true',SMTP_PASSWORD:'unused-secret'};
 const config=mailConfiguration(env);assert.equal(config.provider,'godaddy');assert.equal(config.enabled,true);
 assert.equal(mailConfiguration({NODE_ENV:'production'}).provider,'godaddy');
 assert.equal(mailConfiguration({...env,EMAIL_ENABLED:'false'}).enabled,false);
 const result=await verifyMailConnection(env,{verify:async()=>true});
 assert.equal(result.ok,true);assert.match(result.message,/reachable/);assert(!result.message.includes('authentication succeeded'));
});

test('Gateway keeps the known platform sender while ignoring caller-supplied From addresses',async()=>{
 let payload;
 const result=await sendEmail({to:'submitter@example.test',subject:'Your reference',text:'Receipt',from:'attacker@example.test'},async(url,options)=>{
  assert.equal(url,'http://127.0.0.1:2525/api/email/send');
  assert(options.signal instanceof AbortSignal);assert.equal(options.method,'POST');
  payload=JSON.parse(options.body);return {ok:true,json:async()=>({success:true,messageId:'test-message-1'})};
 });
 assert.deepEqual(payload.to,['submitter@example.test']);assert.equal(payload.from,'sxqc7mdcy1@airoapp.ai');
 assert.equal(payload.replyTo,'info@kemsorstudio.com');assert.equal(result.messageId,'test-message-1');
});

test('Gateway rejection, invalid bodies and timeout remain failures with safe diagnostics',async()=>{
 const input={to:'submitter@example.test',subject:'Reference',text:'Receipt'};
 await assert.rejects(sendEmail(input,async()=>({ok:false,status:429,json:async()=>({success:false,error:'private-provider-details'})})),e=>e.code==='GATEWAY_REJECTED' && !mailError(e).includes('private-provider-details'));
 await assert.rejects(sendEmail(input,async()=>({ok:true,status:200,json:async()=>({success:true})})),e=>e.code==='GATEWAY_RESPONSE');
 await assert.rejects(sendEmail(input,async()=>({ok:true,status:200,json:async()=>{throw new SyntaxError('bad body');}})),e=>e.code==='GATEWAY_CONNECTION');
 await assert.rejects(sendEmail(input,async()=>({ok:true,status:200,json:async()=>{throw Object.assign(new Error(),{name:'TimeoutError'});}})),e=>e.code==='GATEWAY_TIMEOUT');
});
