import { test } from 'node:test';
import assert from 'node:assert/strict';
import { receipt, smtpConfig } from '../src/mail.js';

test('Receipt copy confirms receipt without copying private form content',()=>{
 const enquiry=receipt('enquiry',12,'Sam');
 assert.equal(enquiry.reference,'KEM-000012');
 assert.match(enquiry.body,/get back to you/);
 assert.match(receipt('application',3,'Alex').body,/if your profile matches/);
});
test('SMTP is opt-in and enforces encrypted supported ports',()=>{
 assert.equal(smtpConfig({}),null);
 const env={SMTP_ENABLED:'true',SMTP_HOST:'smtp.example.test',SMTP_USER:'mail@example.test',SMTP_PASSWORD:'test-only'};
 assert.equal(smtpConfig(env).secure,true);
 assert.equal(smtpConfig({...env,SMTP_PORT:'587'}).requireTLS,true);
 assert.throws(()=>smtpConfig({...env,SMTP_PORT:'80'}));
 assert.throws(()=>smtpConfig({...env,SMTP_PASSWORD:''}));
});

test('SMTP diagnostics redact provider responses and credentials',async()=>{
 const {mailError,mailConfiguration,verifyMailConnection}=await import('../src/mail.js');
 const env={SMTP_ENABLED:'true',SMTP_HOST:'smtp.example.test',SMTP_USER:'test@example.test',SMTP_PASSWORD:'private-test-password'};
 assert(!JSON.stringify(mailConfiguration(env)).includes(env.SMTP_PASSWORD));
 const result=await verifyMailConnection(env,{verify:async()=>{throw Object.assign(new Error('private-test-password'),{code:'EAUTH',responseCode:535,response:'password and private provider response'});}});
 assert.equal(result.ok,false);assert.match(result.message,/EAUTH \(535\)/);assert(!result.message.includes('password and private'));
 assert(!mailError({code:'malicious secret',message:'private-test-password'}).includes('private-test-password'));
 assert.equal((await verifyMailConnection({}, {verify:async()=>assert.fail('Disabled SMTP must not connect')})).ok,false);
 assert.equal((await verifyMailConnection(env,{verify:async()=>true})).ok,true);
});

test('Support relay mode uses localhost:25 with no authentication or TLS',async()=>{
 const {relayConfig,mailConfiguration,verifyMailConnection,mailError}=await import('../src/mail.js');
 const config=relayConfig();assert.equal(config.host,'localhost');assert.equal(config.port,25);
 assert.equal(config.secure,false);assert.equal(config.ignoreTLS,true);assert.equal(config.auth,undefined);
 const env={EMAIL_TRANSPORT:'relay',SMTP_HOST:'smtp.example.test',SMTP_USER:'ignored',SMTP_PASSWORD:'unused-private-password'};
 const state=mailConfiguration(env);assert.equal(state.enabled,true);assert.equal(state.username,'info@kemsorstudio.com');
 assert(!JSON.stringify(state).includes(env.SMTP_PASSWORD));
 const verified=await verifyMailConnection(env,{verify:async()=>true});assert.equal(verified.ok,true);assert.match(verified.message,/without authentication or TLS/);
 const rejected=await verifyMailConnection(env,{verify:async()=>{throw Object.assign(new Error('private error'),{code:'ESOCKET',originalCode:'ECONNREFUSED'});}});
 assert.equal(rejected.ok,false);assert.match(rejected.message,/ESOCKET\/ECONNREFUSED/);assert(!rejected.message.includes('private error'));
 assert(!mailError({code:'ESOCKET',originalCode:'private-secret'}).includes('private-secret'));
});
