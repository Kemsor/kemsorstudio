// Shared admin accessibility checks against isolated fixtures, without changing live data.
import assert from 'node:assert/strict';
import express from 'express';
import ejs from 'ejs';
import {chromium} from 'playwright';
import {mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {adminIcon} from '../src/icons.js';
const root=path.resolve(import.meta.dirname,'..'),app=express();app.use(express.static(path.join(root,'public')));
app.get('/admin/accessibility-check',async(req,res,next)=>{try{
 const locals={title:'Accessibility check',user:{id:1,name:'Studio Administrator',role:'admin'},csrf:'fixture-token',notifications:[],unreadCount:0,saved:false,websiteUrl:'/',currentPath:req.path,currentType:'',adminIcon};
 const head=await ejs.renderFile(path.join(root,'views/head.ejs'),locals),foot=await ejs.renderFile(path.join(root,'views/foot.ejs'),locals);
 res.send(head+`<h1>Admin accessibility.</h1><p>Keyboard, forms and mobile tables.</p><div class="field-grid"><label>Review status<select name="status"><option>New</option><option>Reviewed</option></select><small>Choose a stage.</small></label><label>Search<input type="search"></label></div><div class="table-wrap"><table style="min-width:1600px"><thead><tr><th>Name</th><th>Action</th><th>Location</th><th>Long record reference</th></tr></thead><tbody><tr><td>Studio story</td><td><a href="#forms">Edit story</a></td><td>Mumbai</td><td>${'Long-reference-'.repeat(20)}</td></tr></tbody></table></div><section id="forms"><h2>Staff forms</h2>${[1,2].map(i=>`<form method="post" action="/admin/save-${i}"><label>Title ${i}<input name="title" required></label><button class="admin-save">Save form ${i}</button></form>`).join('')}</section>`+foot);
}catch(e){next(e);}});
const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));
const screenshots=await mkdtemp(path.join(tmpdir(),'kemsor-admin-accessibility-'));
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
 await page.goto(`http://127.0.0.1:${server.address().port}/admin/accessibility-check`);await page.locator('.admin-accessible-table').waitFor();
 await page.keyboard.press('Tab');assert.equal(await page.locator('.admin-skip-link').evaluate(n=>n===document.activeElement),true);assert.ok(await page.locator('.admin-skip-link').evaluate(n=>n.getBoundingClientRect().top>=0));await page.keyboard.press('Enter');assert.equal(await page.locator('#main').evaluate(n=>n===document.activeElement),true);
 assert.equal(await page.getByRole('combobox',{name:'Review status',exact:true}).count(),1);
 assert.equal(await page.locator('thead th[scope=col]').count(),4);
 const region=page.locator('.admin-accessible-table');await page.waitForFunction(()=>document.querySelector('.admin-accessible-table').getAttribute('tabindex')==='0');await region.focus();assert.equal(await region.getAttribute('tabindex'),'0');assert.ok(await region.getAttribute('aria-describedby'));
 await page.keyboard.press('ArrowRight');await page.waitForFunction(()=>document.querySelector('.admin-accessible-table').scrollLeft>0);
 const outline=await region.evaluate(n=>({style:getComputedStyle(n).outlineStyle,width:getComputedStyle(n).outlineWidth}));assert.equal(outline.style,'solid');assert.equal(outline.width,'3px');
 const contrast=await page.locator('input[type=search]').evaluate(n=>{const luminance=color=>{const channels=color.match(/\d+/g).slice(0,3).map(value=>{const x=Number(value)/255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;});return channels[0]*.2126+channels[1]*.7152+channels[2]*.0722;};const style=getComputedStyle(n),background=luminance(style.backgroundColor);const ratio=color=>{const value=luminance(color);return (Math.max(value,background)+.05)/(Math.min(value,background)+.05);};return {text:ratio(style.color),border:ratio(style.borderTopColor)};});assert.ok(contrast.text>=4.5);assert.ok(contrast.border>=3);

 for(const theme of ['light','dark'])for(const width of [1440,768,390,320]){
  await page.setViewportSize({width,height:1000});await page.evaluate(theme=>document.documentElement.dataset.adminTheme=theme,theme);await page.waitForTimeout(200);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${theme} ${width}`);
  if(width<700)assert.equal(await page.locator('input[type=search]').evaluate(n=>getComputedStyle(n).fontSize),'16px');
  await page.screenshot({path:path.join(screenshots,`accessibility-${theme}-${width}.png`),fullPage:true});
 }
 await page.setViewportSize({width:390,height:1000});await page.getByRole('button',{name:'Open navigation',exact:true}).click();assert.equal(await page.locator('main').evaluate(n=>n.inert),true);
 await page.keyboard.press('Shift+Tab');assert.equal(await page.locator('.admin-menu-toggle').evaluate(n=>n===document.activeElement),true);
 await page.keyboard.press('Tab');assert.equal(await page.locator('.cms-nav').evaluate(n=>n.contains(document.activeElement)),true);await page.keyboard.press('Escape');assert.equal(await page.locator('.admin-menu-toggle').evaluate(n=>n===document.activeElement),true);assert.equal(await page.locator('main').evaluate(n=>n.inert),false);
 await page.emulateMedia({reducedMotion:'reduce'});const duration=await page.locator('.cms-nav').evaluate(n=>getComputedStyle(n).transitionDuration);assert.ok(duration.split(',').every(value=>parseFloat(value)<=.001));
 await page.getByRole('button',{name:'Save form 1',exact:true}).click();await page.locator('form').filter({has:page.getByRole('button',{name:'Save form 1',exact:true})}).locator('.admin-field-error').waitFor();
 await page.getByRole('button',{name:'Save form 2',exact:true}).click();await page.locator('form').filter({has:page.getByRole('button',{name:'Save form 2',exact:true})}).locator('.admin-field-error').waitFor();
 const notes=await page.locator('[data-form-field-error]').evaluateAll(nodes=>nodes.map(n=>n.id));assert.equal(notes.length,2);assert.equal(new Set(notes).size,2);
 for(const field of await page.locator('input[name=title]').all()){const id=await field.getAttribute('aria-describedby');assert.equal(await page.locator('#'+id).count(),1);}
 await page.getByLabel('Title 1',{exact:true}).fill('Corrected title');assert.equal(await page.locator('[data-form-field-error]').count(),1);assert.equal(await page.getByLabel('Title 2',{exact:true}).getAttribute('aria-invalid'),'true');assert.deepEqual(errors,[]);
 console.log('Passed: skip link, keyboard table scrolling and hints, explicit select names, header scope, visible focus, mobile navigation trapping and Escape, 320px reflow, 16px mobile inputs, reduced motion, and unique linked errors across forms; light/dark layouts.');console.log('Screenshots:',screenshots);
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
