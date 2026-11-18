import {test} from 'node:test';
import assert from 'node:assert/strict';
import {auditFilters,contentAuditDetails,auditChangeRows} from '../src/audit-log.js';
test('Audit filters bind search and IDs, cover the entire final UTC day and reject invalid ranges',()=>{
 const result=auditFilters({q:"' OR 1=1 --",actor:'12',module:'content',action:'publish',from:'2026-01-01',to:'2026-01-31'});
 assert.ok(!result.where.includes('OR 1=1'));assert.ok(result.values.includes(12));assert.match(result.where,/DATE_ADD/);assert.equal(result.values.at(-1),'2026-01-31');
 for(const query of [{from:'2026-02-30'},{from:'2026-03-01',to:'2026-02-01'},{actor:'1 OR 1=1'},{q:['a','b']},{to:'yesterday'}])assert.throws(()=>auditFilters(query),error=>error.status===422);
});
test('Content change details keep precise public field changes without copying private body or credentials',()=>{
 const before={title:'Old',slug:'story',status:'draft',image_id:null,body:'private body',summary:'private summary',metadata:'{}'};
 const after={...before,title:'New',status:'published',body:'updated private body',metadata:'{"rich_text":"text"}',revision:4,password:'secret'};
 const details=contentAuditDetails(before,after),encoded=JSON.stringify(details);
 assert.ok(!encoded.includes('private body'));assert.ok(!encoded.includes('secret'));assert.ok(!encoded.includes('rich_text'));assert.equal(details.revision,4);
 assert.deepEqual(details.changes.find(change=>change.field==='Title'),{field:'Title',before:'Old',after:'New'});
 assert.ok(auditChangeRows(JSON.stringify(details)).some(change=>change.field==='Body'&&!change.hasValues));
 assert.deepEqual(auditChangeRows(null),[]);assert.deepEqual(auditChangeRows('broken'),[]);
});
