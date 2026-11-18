// Real header assets and isolated notification endpoints; no live accounts or messages.
import assert from 'node:assert/strict';
import express from 'express';
import multer from 'multer';
import ejs from 'ejs';
import {chromium} from 'playwright';
import {mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {adminIcon} from '../src/icons.js';
const root=path.resolve(import.meta.dirname,'..'),app=express();app.use(express.static(path.join(root,'public')));
const items=Array.from({length:7},(_,i)=>({key:`enquiry:${i+1}`,title:i%2?'Career application received':'New production enquiry',text:`Studio update ${i+1}: a new collaboration is ready for your review.`,date:'2026-11-18 08:30:00',href:`/admin/enquiries/${i+1}`,tone:'coral',read:i>3}));
app.get('/admin/header-check',async(req,res,next)=>{try{
 const locals={title:'Header check',user:{id:1,name:'Studio Administrator',role:'admin'},csrf:'fixture',notifications:items,unreadCount:items.filter(n=>!n.read).length,saved:false,websiteUrl:'https://example.test/',currentPath:'/admin',currentType:'',adminIcon};
 res.send(await ejs.renderFile(path.join(root,'views/head.ejs'),locals)+'<h1>Studio overview.</h1><p>Review your latest studio updates.</p>'+await ejs.renderFile(path.join(root,'views/foot.ejs'),locals));
}catch(e){next(e);}});
app.get('/admin/notifications.json',(req,res)=>res.json({items,unread:items.filter(n=>!n.read).length}));
app.post('/admin/notifications/read',multer().none(),(req,res)=>{if(req.body._csrf!=='fixture')return res.sendStatus(403);for(const item of items)if(req.body.key==='all'||req.body.key===item.key)item.read=true;res.json({ok:true});});
const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));
const screenshots=await mkdtemp(path.join(tmpdir(),'kemsor-admin-header-'));
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
 await page.goto(`http://127.0.0.1:${server.address().port}/admin/header-check`);
 assert.equal(await page.locator('.admin-theme-control').count(),0);assert.equal(await page.getByRole('link',{name:'My profile',exact:true}).count(),1);
 const summary=page.locator('.notification-dropdown>summary'),popover=page.getByRole('region',{name:'Recent notifications'});
 await summary.click();await page.waitForFunction(()=>document.querySelector('.notification-items .notification-item'));
 assert.equal(await page.locator('.notification-dropdown .notification-item').count(),4);assert.equal(await page.locator('.notification-read,[data-unread-only],.notification-close').count(),0);assert.equal(await popover.getByRole('button').count(),1);assert.equal(await popover.getByRole('link',{name:'View all notifications'}).count(),1);
 for(const width of [1440,768,390,320]){
  await page.setViewportSize({width,height:800});await page.waitForTimeout(200);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`header at ${width}`);
  const box=await popover.boundingBox();assert.ok(box.x>=0&&box.x+box.width<=width+1&&box.y+box.height<=800,`popover at ${width}`);
  await page.screenshot({path:path.join(screenshots,`header-notifications-${width}.png`),fullPage:true});
 }
 await page.route('**/admin/notifications/read',route=>route.fulfill({status:503,contentType:'application/json',body:'{"error":"Fixture failure"}'}));
 await page.getByRole('button',{name:'Mark all as read',exact:true}).click();await page.getByText('Could not mark the update as read. Please try again.',{exact:true}).waitFor();assert.equal(items.filter(n=>!n.read).length,4);assert.equal(await page.locator('.notification-mark-all').isEnabled(),true);await page.unroute('**/admin/notifications/read');
 await page.getByRole('button',{name:'Mark all as read',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.notification-mark-all').disabled&&document.querySelectorAll('.notification-dropdown .notification-item.is-read').length===4);
 assert.equal(await page.locator('.notification-dropdown [data-notification-count]').isVisible(),false);assert.equal(await page.locator('.notification-dropdown .notification-item.is-unread').count(),0);
 assert.equal(await page.locator('.notification-dropdown .notification-item.is-read .notification-indicator').first().evaluate(n=>getComputedStyle(n).backgroundColor),'rgb(0, 171, 132)');assert.equal(await page.locator('.notification-dropdown .notification-item.is-read .notification-indicator').first().evaluate(n=>getComputedStyle(n).color),'rgb(255, 255, 255)');
 await page.keyboard.press('Escape');assert.equal(await summary.evaluate(n=>n===document.activeElement),true);assert.equal(await popover.isVisible(),false);
 await summary.press('Enter');await page.keyboard.press('Escape');assert.equal(await summary.evaluate(n=>n===document.activeElement),true);assert.equal(await popover.isVisible(),false);
 await summary.click();await page.locator('.cms-header').click({position:{x:2,y:2}});assert.equal(await popover.isVisible(),false);items.splice(0);await summary.click();await page.getByText('No notifications yet.',{exact:true}).waitFor();assert.deepEqual(errors,[]);
 console.log('Passed: compact dropdown with only mark-all and view-all actions, four-item preview, responsive header/popover, retry after failure, read-all updates, green icons with white foreground, empty states, Escape focus and outside click.');console.log('Screenshots:',screenshots);
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
