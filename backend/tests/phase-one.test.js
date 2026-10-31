import {test} from 'node:test';
import assert from 'node:assert/strict';
import {totp,validStep,newSecret,sealSecret,openSecret,recoveryHash} from '../src/mfa.js';
import {workflowFields,statuses,categories} from '../src/enquiry-options.js';

test('TOTP follows RFC 6238 vectors and rejects replay and invalid codes',()=>{
 const secret='GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';
 assert.equal(totp(secret,1),'287082');
 assert.equal(validStep(secret,'287082',-1,59000),1);
 assert.equal(validStep(secret,'287082',1,59000),null);
 assert.equal(validStep(secret,'000000',-1,59000),null);
 assert.equal(validStep(secret,'123',-1,59000),null);
});
test('MFA secrets are authenticated and encrypted, and recovery codes normalize safely',()=>{
 process.env.SESSION_SECRET ||= 'test-only-session-secret-with-at-least-32-characters';
 const secret=newSecret(),sealed=sealSecret(secret);
 assert.match(secret,/^[A-Z2-7]{32}$/);assert.equal(openSecret(sealed),secret);assert.ok(!sealed.includes(secret));
 const pieces=sealed.split('.');pieces[1]=Buffer.alloc(16).toString('base64');assert.throws(()=>openSecret(pieces.join('.')));
 assert.equal(recoveryHash('ABCD-1234'),recoveryHash('abcd1234'));
});
test('Workflow preserves explicit states, validates priority and UTC follow-up',()=>{
 for(const state of ['assigned','information_required','meeting_scheduled','qualified','accepted','converted','rejected'])assert.ok(statuses.includes(state));
 for(const category of ['creative','brand','distribution','financing','international','partner_registration'])assert.ok(categories[category]);
 assert.deepEqual(workflowFields({priority:'high',tags:'OTT, India',source:'partner-page',follow_up_at:'2026-11-02T10:30'}),{priority:'high',tags:'OTT, India',source:'partner-page',followUp:'2026-11-02 10:30:00'});
 assert.throws(()=>workflowFields({follow_up_at:'2026-02-31T10:00'}));assert.throws(()=>workflowFields({priority:'invalid'}));assert.throws(()=>workflowFields({follow_up_at:'invalid'}));
});
