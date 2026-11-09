import {test} from 'node:test';
import assert from 'node:assert/strict';
import {memberTab,profileReadiness,matchingItems} from '../src/member-workspace.js';
test('Workspace links restore valid tabs and respect artist permissions',()=>{
 assert.equal(memberTab('#profile','artist'),'profile');assert.equal(memberTab('#messages','hirer'),'messages');
 assert.equal(memberTab('#saved','artist'),'overview');assert.equal(memberTab('#saved','hirer'),'saved');
 assert.equal(memberTab('#unknown','artist'),'overview');
});
test('Profile readiness reflects the account role and ignores whitespace-only fields',()=>{
 const base={name:'Sam',city:'Mumbai',bio:'Hello',skills:'Camera',languages:'Hindi',credits:'Short film',image_id:12,availability:'Available',showreel:'https://example.com'};
 assert.equal(profileReadiness({...base,role:'artist',profession:'Camera operator'}).percent,100);
 assert.equal(profileReadiness({...base,role:'hirer',department:'1',specialty:'Producer'}).percent,100);
 assert.equal(profileReadiness({...base,role:'hirer',department:'1',specialty:''}).percent,90);
 assert.equal(profileReadiness({...base,role:'artist',profession:'  '}).checks.find(item=>item.key==='craft').complete,false);
 assert.equal(profileReadiness(null).percent,0);
});
test('Search matches names, disciplines and conversations without changing stored records',()=>{
 const items=[{name:'Aarav',city:'Mumbai',project:'Monsoon'},{name:'Mira',city:'Delhi',project:'Morning light'}];
 assert.deepEqual(matchingItems(items,' mUmBaI ',['name','city']),[items[0]]);
 assert.deepEqual(matchingItems(items,'morning',['project']),[items[1]]);
 assert.equal(matchingItems(items,'',['name']),items);
 assert.deepEqual(matchingItems(items,'missing',['name']),[]);
});
