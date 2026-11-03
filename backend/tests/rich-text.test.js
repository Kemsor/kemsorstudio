import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseRichText,richTextHtml,richTextPlain,plainRichText,safeRichLink} from '../public/rich-text-core.js';

test('Formatted content preserves headings, lists and safe links while escaping text',()=>{
 const doc={version:1,type:'doc',children:[{type:'h2',children:[{type:'text',text:'1. Scope'}]},{type:'p',children:[{type:'strong',children:[{type:'text',text:'<script>alert(1)</script>'}]},{type:'a',href:'https://example.test/',children:[{type:'text',text:'Read more'}]}]},{type:'ul',children:[{type:'li',children:[{type:'text',text:'First'}]},{type:'li',children:[{type:'em',children:[{type:'text',text:'Second'}]}]}]}]};
 const html=richTextHtml(doc,{legalAnchors:true});
 assert.match(html,/<h2 id="privacy-section-1">1\. Scope<\/h2>/);
 assert.match(html,/<strong>&lt;script&gt;/);assert.ok(!html.includes('<script>'));
 assert.match(html,/<ul><li>First<\/li><li><em>Second<\/em><\/li><\/ul>/);
 assert.match(html,/rel="noopener noreferrer"/);
 assert.ok(richTextPlain(doc).includes('First\nSecond'));
 const normalized=parseRichText({...doc,onclick:'alert(1)'});assert.ok(!JSON.stringify(normalized).includes('onclick'));
});
test('Rich text rejects executable links, HTML nodes, excessive nesting and malformed documents',()=>{
 for(const href of ['javascript:alert(1)','data:text/html,test','//example.test','java\nscript:alert(1)','https://user:password@example.test/'])assert.equal(safeRichLink(href),null);
 for(const href of ['/contact/','#scope','mailto:info@example.test','https://example.test/'])assert.equal(safeRichLink(href),href);
 assert.throws(()=>parseRichText({version:1,type:'doc',children:[{type:'script',children:[]}]}));
 assert.throws(()=>parseRichText({version:1,type:'doc',children:[{type:'p',children:[{type:'a',href:'javascript:alert(1)',children:[]}]}]}));
 let nested={type:'text',text:'Nested'};for(let i=0;i<20;i++)nested={type:'strong',children:[nested]};
 assert.throws(()=>parseRichText({version:1,type:'doc',children:[{type:'p',children:[nested]}]}));
 assert.throws(()=>parseRichText('{broken'));
});
test('Existing plain text and numbered legal paragraphs survive editor initialization',()=>{
 const text='1. Scope\n\n1.1 First paragraph.\nSecond line.\n\n2. Contact\n\nCompany details';
 assert.equal(richTextPlain(plainRichText(text)),text);
 assert.ok(richTextHtml(plainRichText('<b>Literal text</b>')).includes('&lt;b&gt;Literal text&lt;/b&gt;'));
});
