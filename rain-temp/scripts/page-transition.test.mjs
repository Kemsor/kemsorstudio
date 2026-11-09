import {test} from 'node:test';
import assert from 'node:assert/strict';
import {isPageNavigation,parseTransition} from '../src/page-transition.js';
const origin='https://kemsorstudio.com';
test('Only internal page changes use the transition',()=>{
 assert(isPageNavigation(origin+'/about/',origin+'/'));
 assert(isPageNavigation(origin+'/join/?type=professional',origin+'/join/'));
 for(const href of ['/#studio','https://example.com/','mailto:info@kemsorstudio.com','/api/export','/admin/login','/assets/film.mp4','/media/1/document.pdf'])assert.equal(isPageNavigation(href,origin+'/'),false,href);
});
test('Only a fresh matching navigation marker survives to the next page',()=>{
 const marker={from:origin+'/',to:origin+'/about/',startedAt:10000};
 const raw=JSON.stringify(marker),options={href:origin+'/about/',now:10500};
 assert.equal(parseTransition(raw,options).phase,'arriving');
 for(const navigationType of ['reload','back_forward'])assert.equal(parseTransition(raw,{...options,navigationType}),null);
 assert.equal(parseTransition(raw,{...options,href:origin+'/contact/'}),null);
 assert.equal(parseTransition(raw,{...options,now:30000}),null);
 assert.equal(parseTransition(raw,{...options,now:1}),null);
 for(const value of [null,'broken','{}'])assert.equal(parseTransition(value,options),null);
 assert.equal(parseTransition(JSON.stringify({...marker,from:'https://example.com/'}),options),null);
});
