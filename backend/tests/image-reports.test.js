import {test} from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {optimizeImage} from '../src/image-optimizer.js';
import {csvCell,reportFilters} from '../src/reports.js';

test('Images are oriented, resized and stripped of metadata without enlarging small originals',async()=>{
 const buffer=await sharp({create:{width:3200,height:1600,channels:3,background:'#ed9634'}}).jpeg().withMetadata({orientation:6}).toBuffer();
 const result=await optimizeImage({buffer,size:buffer.length,mimetype:'image/jpeg'}),metadata=await sharp(result.buffer).metadata();
 assert.equal(metadata.width,1200);assert.equal(metadata.height,2400);assert.equal(metadata.format,'webp');assert.equal(metadata.exif,undefined);assert.equal(metadata.orientation,undefined);assert.ok(result.size<buffer.length);
 const small=await sharp({create:{width:30,height:20,channels:4,background:{r:240,g:130,b:30,alpha:.3}}}).png().toBuffer();
 const output=await optimizeImage({buffer:small});const info=await sharp(output.buffer).metadata();assert.equal(info.width,30);assert.equal(info.height,20);assert.equal(info.hasAlpha,true);
 await assert.rejects(()=>optimizeImage({buffer:Buffer.from('<svg><script>bad()</script></svg>')}),{status:422});
});
test('Reports reject invalid dates/statuses and CSV neutralizes spreadsheet formulas',()=>{
 const config={table:'cms_enquiries',statuses:['new','qualified']};
 assert.deepEqual(reportFilters({from:'2026-10-01',to:'2026-10-31',status:'qualified',category:'brand',q:' Acme '},config),{from:'2026-10-01',to:'2026-10-31',status:'qualified',category:'brand',q:'Acme'});
 assert.throws(()=>reportFilters({from:'2026-02-31',to:'2026-10-31'},config));assert.throws(()=>reportFilters({from:'2026-11-01',to:'2026-10-31'},config));assert.throws(()=>reportFilters({status:'made_up'},config));
 assert.equal(csvCell('=1+1'),'"\'=1+1"');assert.equal(csvCell('  @SUM(A1)'),'"\'  @SUM(A1)"');assert.equal(csvCell('Studio "A"'),'"Studio ""A"""');
});
