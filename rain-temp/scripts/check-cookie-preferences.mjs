import assert from 'node:assert/strict';
import { createServer } from 'vite';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createPreferences, parsePreferences, preferenceLifetime, preferenceVersion, readPreferences } from '../src/cookiePreferences.js';

const now=Date.now();
assert.equal(parsePreferences(null,now),null);
assert.equal(parsePreferences('{bad',now),null);
for(const record of [{}, {version:0,externalMedia:true,savedAt:now},{version:preferenceVersion,externalMedia:'true',savedAt:now},{version:preferenceVersion,externalMedia:true,savedAt:now+1000}])assert.equal(parsePreferences(JSON.stringify(record),now),null);
const accepted=createPreferences(true,now);
assert.equal(parsePreferences(JSON.stringify(accepted),now+preferenceLifetime-1).externalMedia,true);
assert.equal(parsePreferences(JSON.stringify(accepted),now+preferenceLifetime),null);
assert.equal(createPreferences(false,now).externalMedia,false);
assert.equal(createPreferences('yes',now).externalMedia,false);
assert.equal(readPreferences({getItem(){throw new Error('Storage blocked');}},now),null);

const server=await createServer({root:new URL('../',import.meta.url).pathname,configFile:false,server:{middlewareMode:true,hmr:false,watch:null},appType:'custom'});
try {
 const {CookieConsentProvider,ConsentMap,CookiePreferences}=await server.ssrLoadModule('/src/CookieConsent.jsx');
 const src='https://maps.google.com/maps?q=Dehradun&output=embed';
 const render=raw=>{
  globalThis.window={localStorage:{getItem(){return raw;}}};
  return renderToStaticMarkup(React.createElement(CookieConsentProvider,null,React.createElement(React.Fragment,null,React.createElement(ConsentMap,{src,title:'Studio map'}),React.createElement(CookiePreferences))));
 };
 for(const raw of [null,JSON.stringify(createPreferences(false)),JSON.stringify({...accepted,savedAt:now-preferenceLifetime})]) {
  const html=render(raw);
  assert.ok(!html.includes('<iframe'), 'No iframe before consent, after rejection or expiry');
  assert.ok(!html.includes('src="https://maps.google.com'), 'No Google Maps request URL before consent');
  assert.ok(html.includes('Manage map preferences'));
 }
 const allowed=render(JSON.stringify(createPreferences(true)));
 assert.ok(allowed.includes('<iframe'));
 assert.ok(allowed.includes('src="https://maps.google.com'));
 assert.ok(!allowed.includes('class="cookie-banner"'));
 const rejected=render(JSON.stringify(createPreferences(false)));
 assert.ok(!rejected.includes('class="cookie-banner"'), 'Rejection is remembered without asking again');
 assert.ok(render(null).includes('class="cookie-banner"'));
 console.log('Cookie checks passed: opt-in map loading, rejection, expiry, invalid records, stored choices and unavailable storage.');
} finally {delete globalThis.window;await server.close();}
