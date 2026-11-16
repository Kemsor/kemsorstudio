import {test} from 'node:test';
import assert from 'node:assert/strict';
import {castingMail,castingMailHtml} from '../src/casting-mail.js';
test('Casting messages include the application reference without private notes or final-casting promises',()=>{
 const application={id:12,call_title:'Film <title>',role_name:'Lead',reviewer_note:'PRIVATE NOTE'},account={name:'Artist',email:'artist@example.test'};
 const receipt=castingMail(application,account,'submitted');assert.equal(receipt.key,'CAST-000012-RECEIVED');assert.match(receipt.body,/profile\/#applications/);assert.ok(!receipt.body.includes('PRIVATE NOTE'));
 const shortlist=castingMail(application,account,'shortlisted',42);assert.equal(shortlist.key,'CAST-000012-SHORTLISTED-42');assert.match(shortlist.body,/not a final casting confirmation/);
 assert.equal(castingMail(application,account,'reviewing',43),null);const html=castingMailHtml({receipt_key:receipt.key,subject:receipt.subject,body:receipt.body});assert.match(html,/&lt;title&gt;/);assert.ok(!html.includes('PRIVATE NOTE'));
});
