import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHeaderScroll} from '../src/header-scroll.js';

test('Header ignores small reversals and finishes hiding before reappearing',()=>{
 const update=createHeaderScroll(300);
 assert.equal(update(390,1000),true);
 assert.equal(update(325,1100),true);
 assert.equal(update(330,1500),true);
 for(const y of [327,332,326,329])assert.equal(update(y,1600),true);
 assert.equal(update(265,1700),false);
 assert.equal(update(370,1750),false);
});
test('Near-top hysteresis prevents repeated toggles at the old 240px boundary',()=>{
 const update=createHeaderScroll(200);
 for(const y of [245,235,249,238,270])assert.equal(update(y,1000),false);
 assert.equal(update(360,1500),true);
 assert.equal(update(238,1600),true);
 assert.equal(update(90,1700),false);
});
test('An open menu or keyboard focus keeps the header visible',()=>{
 const update=createHeaderScroll(300);
 assert.equal(update(400,1000),true);
 assert.equal(update(410,1100,true),false);
 assert.equal(update(600,2000,true),false);
});
