import {test} from 'node:test';
import assert from 'node:assert/strict';
import {castingFields,castingToday} from '../src/casting-calls.js';
const base={production_id:'1',title:'Lead performers',summary:'Two roles',requirements:'Screen experience required.',location:'Dehradun',deadline:'2028-02-29',roles:'Lead | Hindi speaking\nSupporting | Screen experience',status:'draft',call_state:'open'};
test('Casting calls validate roles, dates and publication controls',()=>{
 const fields=castingFields(base);assert.equal(fields.production_id,1);assert.equal(fields.roles.length,2);assert.equal(fields.roles[0].eligibility,'Hindi speaking');
 for(const patch of [{production_id:'0'},{status:'other'},{call_state:'other'},{deadline:'2026-02-29'},{roles:'Missing eligibility'},{roles:'Name | '},{roles:'Name | a | b'},{title:''},{roles:Array(51).fill('Name | Experience').join('\n')}])assert.throws(()=>castingFields({...base,...patch}),{status:422});
});
test('Casting deadlines use India calendar boundaries',()=>{assert.equal(castingToday(new Date('2026-11-14T18:29:59Z')),'2026-11-14');assert.equal(castingToday(new Date('2026-11-14T18:30:00Z')),'2026-11-15');});
import {castingRoleKey} from '../src/casting-role.js';
import {auditionLinks} from '../src/casting-applications.js';
test('Role identities survive reordering and audition links reject executable or credentialed URLs',()=>{
 assert.equal(castingRoleKey(' Lead '),castingRoleKey('lead'));assert.throws(()=>castingFields({...base,roles:'Lead | First\nLEAD | Second'}),{status:422});
 assert.deepEqual(auditionLinks('https://example.com/reel\nhttps://example.com/reel'),['https://example.com/reel']);
 for(const links of ['javascript:alert(1)','http://example.com','https://user:password@example.com/reel',Array.from({length:6},(_,i)=>`https://example.com/${i}`).join('\n')])assert.throws(()=>auditionLinks(links),{status:422});
});
