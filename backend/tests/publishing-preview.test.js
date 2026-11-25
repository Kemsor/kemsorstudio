import test from 'node:test';
import assert from 'node:assert/strict';
import {previewBody,publishingChecks} from '../public/publishing-preview-model.js';
test('Preview preserves safe rich headings, emphasis, lists and links',()=>{
 const rich_text=JSON.stringify({version:1,type:'doc',children:[{type:'h2',children:[{type:'text',text:'Heading'}]},{type:'p',children:[{type:'strong',children:[{type:'text',text:'Bold'}]},{type:'a',href:'https://example.com/path',children:[{type:'text',text:'Visit'}]}]},{type:'ul',children:[{type:'li',children:[{type:'text',text:'Item'}]}]}]});
 const html=previewBody({rich_text,body:'Heading\nBoldVisit\nItem'});assert.match(html,/<h2>Heading<\/h2>/);assert.match(html,/<strong>Bold<\/strong>/);assert.match(html,/<ul><li>Item/);assert.match(html,/href="https:\/\/example.com\/path"/);
});
test('Plain text is escaped and unsafe rich links are rejected',()=>{
 assert.ok(previewBody({body:'<script>alert(1)</script>'}).includes('&lt;script&gt;'));assert.ok(!previewBody({body:'<script>alert(1)</script>'}).includes('<script>'));
 assert.throws(()=>previewBody({rich_text:JSON.stringify({version:1,type:'doc',children:[{type:'p',children:[{type:'a',href:'javascript:alert(1)',children:[]}]}]})}),/valid link/);
});
test('Readiness distinguishes missing details from optional improvements',()=>{
 const values={title:'Story',body:'Details',summary:'Summary',status:'draft',type:'blog'};
 assert.deepEqual(publishingChecks(values),[]);
 const checks=publishingChecks({...values,title:''},{hasImage:true,imageAlt:'',pendingUpload:true});assert.ok(checks.some(check=>check.field==='title'&&check.level==='required'));assert.ok(checks.some(check=>check.field==='image_id'&&check.level!=='required'));assert.ok(checks.some(check=>check.field==='image'));
 const press=publishingChecks({...values,type:'news',category:'Press Releases'});assert.ok(press.some(check=>check.field==='pdf_url'));
 const career=publishingChecks({...values,type:'career'});assert.ok(career.some(check=>check.field==='role'));assert.ok(career.some(check=>check.field==='location'));
 const video=publishingChecks({...values,video_url:'/media/2/video.mp4'});assert.ok(video.some(check=>check.field==='image_id'));assert.ok(video.some(check=>check.field==='video_caption'));
});
