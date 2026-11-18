// Real admin templates and assets, isolated activity fixtures; no live records changed.
import assert from 'node:assert/strict';
import express from 'express';
import ejs from 'ejs';
import {chromium} from 'playwright';
import {mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {adminIcon} from '../src/icons.js';
import {tableView} from '../src/admin-tables.js';
import {auditFilters,auditChangeRows} from '../src/audit-log.js';
const root=path.resolve(import.meta.dirname,'..'),app=express();app.use(express.static(path.join(root,'public')));
const staff=[{id:1,name:'Studio Administrator',active:1},{id:2,name:'Studio Editor',active:1}];
const records=Array.from({length:60},(_,i)=>({id:60-i,actor:i%2?'Studio Editor':'Studio Administrator',user_id:i%2?2:1,action:i%2?'save':'publish',actionLabel:i%2?'Saved':'Published',target_type:'content',target_id:String(i+1),recordTitle:`Content #${i+1}`,created_at:'2026-11-17 10:00:00',href:`/admin/content/${i+1}`,historyUrl:`/admin/content/${i+1}/revisions`,details:{changes:[{field:'Title',before:'Previous story title',after:'<script>New story</script>'},{field:'Body'}]}}));
app.get('/admin/audit',async(req,res,next)=>{try{
 const {filters}=auditFilters(req.query),filtered=records.filter(event=>(!filters.q||`${event.actor} ${event.action} ${event.target_id}`.toLowerCase().includes(filters.q.toLowerCase()))&&(!filters.actor||String(event.user_id)===filters.actor)&&(!filters.action||event.action===filters.action)&&(!filters.module||event.target_type===filters.module));
 const table=tableView(req,filtered.length,{time:'id'},'time',filters);
 res.send(await ejs.renderFile(path.join(root,'views/audit.ejs'),{title:'Activity check',user:{id:1,name:'Studio Administrator',role:'admin'},csrf:'fixture',notifications:[],unreadCount:0,saved:false,websiteUrl:'/',currentPath:req.path,currentType:'',adminIcon,filters,table,staff,actions:['publish','save'],modules:['content'],events:filtered.slice(table.offset,table.offset+table.limit).map(event=>({...event,changes:auditChangeRows(event.details)}))}));
}catch(e){next(e);}});
const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));
const screenshots=await mkdtemp(path.join(tmpdir(),'kemsor-audit-log-'));
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());const base=`http://127.0.0.1:${server.address().port}`;
 await page.goto(base+'/admin/audit');
 assert.equal(await page.locator('tbody tr').count(),25);await page.getByRole('link',{name:'Page 2',exact:true}).click();assert.equal(new URL(page.url()).searchParams.get('p'),'2');
 await page.getByLabel('Staff member',{exact:true}).selectOption('2');await page.getByLabel('Action',{exact:true}).selectOption('save');await page.getByRole('button',{name:'Apply filters',exact:true}).click();
 await page.waitForLoadState('load');assert.equal(await page.locator('tbody tr').count(),25);assert.match(await page.locator('main').innerText(),/30 matching events/);assert.equal(new URL(page.url()).searchParams.has('p'),false);
 await page.getByRole('link',{name:'Remove Action filter: save'}).click();assert.equal(new URL(page.url()).searchParams.get('actor'),'2');
 await page.getByRole('link',{name:'Clear filters',exact:true}).click();await page.locator('details.audit-change-details summary').first().focus();await page.keyboard.press('Enter');assert.equal(await page.locator('details.audit-change-details').first().getAttribute('open'),'');
 assert.match(await page.locator('details.audit-change-details').first().innerText(),/<script>New story<\/script>/);assert.equal(await page.locator('details.audit-change-details script').count(),0);
 for(const theme of ['light','dark'])for(const width of [1440,390]){
  await page.setViewportSize({width,height:1000});await page.evaluate(theme=>document.documentElement.dataset.adminTheme=theme,theme);await page.waitForTimeout(150);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  assert.equal(await page.getByRole('button',{name:'Apply filters',exact:true}).evaluate(n=>getComputedStyle(n).backgroundColor),'rgb(255, 255, 255)');
  const heights=await page.locator('.audit-filters input,.audit-filters select').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().height));assert.ok(heights.every(height=>height===34));
  await page.screenshot({path:path.join(screenshots,`audit-${theme}-${width}.png`),fullPage:true});
 }
 await page.getByLabel('Search',{exact:true}).fill('unmatched fixture');await page.getByRole('button',{name:'Apply filters',exact:true}).click();await page.getByRole('heading',{name:'No matching activity.'}).waitFor();assert.deepEqual(errors,[]);
 console.log('Passed: activity search, staff/action filters, filter removal, pagination, escaped and keyboard-accessible change details, empty results, white buttons and compact inputs, desktop/mobile light/dark layouts.');console.log('Screenshots:',screenshots);
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
