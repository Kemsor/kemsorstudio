import {test} from 'node:test';
import assert from 'node:assert/strict';
import {heroSwipeDirection} from '../src/hero-swipe.js';
test('Horizontal mobile drags move forward and back',()=>{
 assert.equal(heroSwipeDirection(-110,8,390),1);
 assert.equal(heroSwipeDirection(110,8,390),-1);
 assert.equal(heroSwipeDirection(-100,0,1024),1);
});
test('Small movements and vertical or diagonal scrolls do not change slides',()=>{
 for(const [dx,dy] of [[15,0],[0,120],[50,100],[80,80],[-35,10]])assert.equal(heroSwipeDirection(dx,dy,390),0);
});
