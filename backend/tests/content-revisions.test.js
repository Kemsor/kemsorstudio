import test from 'node:test';
import assert from 'node:assert/strict';
import {requireEntryRevision,entrySnapshot,revisionComparison,revisionBody} from '../src/content-revisions.js';
test('Saved versions are checked independently of timestamps and never accept a missing version',()=>{
 const record={id:12,revision:4,updated_at:'2026-11-17 10:00:00'};assert.doesNotThrow(()=>requireEntryRevision(record,'4'));
 for(const token of [undefined,'',0,3,5,'bad'])assert.throws(()=>requireEntryRevision(record,token),error=>error.status===409&&error.code==='CONTENT_CONFLICT'&&error.conflict.editorUrl==='/admin/content/12');
});
test('Snapshots retain publishing fields without staff credentials or unrelated attributes',()=>{
 const snapshot=entrySnapshot({id:1,type:'blog',title:'A story',slug:'a-story',summary:'Summary',body:'Body',image_id:8,metadata:'{"category":"Notes"}',status:'published',password_hash:'private'});
 assert.equal(snapshot.metadata.category,'Notes');assert.equal(snapshot.image_id,8);assert.ok(!('password_hash' in snapshot));assert.ok(!('id' in snapshot));
});
test('Comparison identifies formatting changes and displays structured details without raw HTML execution',()=>{
 const first={title:'Story',slug:'story',summary:'Summary',body:'Same words',image_id:null,status:'draft',metadata:{category:'Notes'}};
 const second={...first,metadata:{category:'Notes',rich_text:{version:1,type:'doc',children:[{type:'p',children:[{type:'strong',children:[{type:'text',text:'Same words'}]}]}]},gallery:[{media_id:1,caption:'Scene'}]}};
 const fields=revisionComparison(first,second);assert.equal(fields.find(field=>field.key==='title').changed,false);assert.equal(fields.find(field=>field.key==='body').changed,true);assert.ok(fields.find(field=>field.key==='metadata:gallery').after.includes('Caption: Scene'));
 assert.match(revisionBody(second),/<strong>Same words/);assert.ok(revisionBody({...first,body:'<script>alert(1)</script>'}).includes('&lt;script&gt;'));
});
