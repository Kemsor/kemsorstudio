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
