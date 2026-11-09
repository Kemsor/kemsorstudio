import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {resolve} from 'node:path';
import {optimizedImage} from '../src/image-delivery.js';

const manifest=JSON.parse(await readFile(new URL('../src/optimized-images.json',import.meta.url),'utf8'));
test('Every responsive image points to real generated files',async()=>{
 assert(Object.keys(manifest).length>100);
 const urls=new Set();
 for(const image of Object.values(manifest)){
  assert(image.width>0&&image.height>0);
  urls.add(image.src);
  for(const candidate of image.srcSet.split(', ')){
   const [url,width]=candidate.split(' ');assert(/^\d+w$/.test(width));urls.add(url);
  }
 }
 for(const url of urls)assert((await stat(resolve(import.meta.dirname,'../public'+url))).size>0,url);
});
test('Only known local images change, including subdirectory deployment paths',()=>{
 const src=Object.keys(manifest)[0];
 assert.equal(optimizedImage(src,manifest).src,manifest[src].src);
 const image=optimizedImage('/demo/'+src.slice(1),manifest,'/demo/');
 assert(image.src.startsWith('/demo/assets/optimized/'));
 assert(image.srcSet.split(', ').every(candidate=>candidate.startsWith('/demo/assets/optimized/')));
 for(const src of ['https://example.com/image.webp','//example.com/image.webp','/media/123','/assets/image.webp?v=1',undefined])assert.equal(optimizedImage(src,manifest),null);
});
