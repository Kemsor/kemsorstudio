import {test} from 'node:test';
import assert from 'node:assert/strict';
import {managedFields,managedUrl,legalSections} from '../src/managed-content.js';

test('Managed content rejects unsafe media, invalid timing and impossible policy dates',()=>{
 for(const value of ['javascript:alert(1)','//external.example/video.mp4','video.mp4','https://user:pass@example.test/video.mp4'])assert.throws(()=>managedUrl(value,{video:true}));
 assert.equal(managedUrl('/assets/hero.mp4',{video:true}),'/assets/hero.mp4');
 assert.equal(managedUrl('https://cdn.example.test/hero.mp4',{video:true}),'https://cdn.example.test/hero.mp4');
 const hero={label:'Test',src:'/assets/hero.mp4',poster:'/assets/poster.webp',duration:'5',position:'1'};
 assert.throws(()=>managedFields('hero',{...hero,duration:'100'}));
 assert.throws(()=>managedFields('hero',{...hero,buttonLabel:'Test'}));
 assert.equal(managedFields('hero',hero).duration,5);
 const legal={title:'Test',content:'1. Scope\n\n1.1 Test',version:'v1',effectiveDate:'2026-11-01'};
 for(const date of ['2026-02-31','2026-99-99'])assert.throws(()=>managedFields('legal',{...legal,effectiveDate:date}));
 assert.equal(managedFields('legal',legal).sections[0].paragraphs[0],'1.1 Test');
});
test('Legal section parsing preserves paragraph numbering and line breaks',()=>{
 const sections=legalSections('1. Scope\n\n1.1 First paragraph.\n\n1.2 Second paragraph.\n\n2. Contact\n\nCompany\nAddress\nEmail');
 assert.equal(sections.length,2);assert.equal(sections[0].paragraphs.length,2);
 assert.equal(sections[1].paragraphs[0],'Company\nAddress\nEmail');
});
