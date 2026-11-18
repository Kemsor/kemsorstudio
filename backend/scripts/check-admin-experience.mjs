// Isolated browser fixtures exercise the real admin templates, styles and scripts.
// No production account, database or content is used.
import assert from 'node:assert/strict';
import express from 'express';
import multer from 'multer';
import ejs from 'ejs';
import {chromium} from 'playwright';
import {mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {tableView} from '../src/admin-tables.js';
import {adminIcon} from '../src/icons.js';
import {dashboardShortcuts,activityTarget,describeActivity} from '../src/dashboard-presentation.js';
import {canEdit,canEnquire} from '../src/security.js';

const backend=path.resolve(import.meta.dirname,'..');
const app=express();app.use(express.urlencoded({extended:false}));app.use(express.static(path.join(backend,'public')));
const locals={title:'Admin experience check',user:{id:1,name:'Test Editor',role:'admin'},csrf:'fixture-token',unreadCount:0,notifications:[],websiteUrl:'/',currentType:'blog',types:{blog:'Blog'},saved:false,adminIcon};
const entries=Array.from({length:80},(_,i)=>({id:i+1,type:'blog',title:`Studio story ${String(i+1).padStart(3,'0')}`,slug:`studio-${i+1}`,status:i%3?'draft':'published',updated_at:'2026-11-17 08:00:00'}));
const render=(name,data)=>ejs.renderFile(path.join(backend,'views',name+'.ejs'),{...locals,...data});
app.get('/admin/content',async(req,res,next)=>{try{
 const search=String(req.query.q||''),state=String(req.query.status||'');
 const filtered=entries.filter(entry=>(!search||entry.title.toLowerCase().includes(search.toLowerCase()))&&(!state||entry.status===state));
 const table=tableView(req,filtered.length,{title:'title',updated:'updated_at',status:'status'},'updated',{type:'blog',page:'',q:search,status:state});
 res.send(await render('content',{currentPath:req.path,type:'blog',pageFilter:'',search,state,table,entries:filtered.slice(table.offset,table.offset+table.limit),saved:req.query.saved==='1'}));
}catch(error){next(error);}});
app.get('/admin',async(req,res,next)=>{try{
 const role=['admin','editor','enquiry_manager'].includes(req.query.role)?req.query.role:'admin',user={id:1,name:'Test Editor',role};
 const publishing=canEdit(user),inbox=canEnquire(user),empty=req.query.empty==='1';
 const tasks=[...(inbox?[{label:'New enquiries',value:2,hint:'Ready for a first response',href:'/admin/enquiries?section=all&status=new',icon:'enquiries'},{label:'New career applications',value:1,hint:'Review candidates and respond',href:'/admin/applications?status=new',icon:'career'}]:[]),...(role==='admin'?[{label:'Profiles awaiting review',value:1,hint:'Check contact details and approve',href:'/admin/talent?status=pending',icon:'review'}]:[]),...(publishing?[{label:'Drafts in the making',value:3,hint:'Your next updates',href:'/admin/content?type=all&status=draft',icon:'blog'}]:[])].map(item=>({...item,value:empty?0:item.value}));
 const summaries=[...(publishing?[{label:'Published stories & content',value:empty?0:12,hint:'Published records',href:'/admin/content?type=all&status=published',tone:'violet',icon:'news'}]:[]),...(inbox?[{label:'Follow-ups in progress',value:empty?0:2,hint:'Keep the conversation moving',href:'/admin/enquiries?section=all&status=follow_up',tone:'mint',icon:'followup'}]:[])];
 const record={target_type:publishing?'content':'enquiry',target_id:'1',action:publishing?'save':'update',name:'Asha',created_at:'2026-11-17 08:00:00'};
 const activity=empty?[]:[describeActivity(record,user,activityTarget(record,user),'Studio production update')];
 const notifications=empty?[]:[{key:publishing?'draft:1':'enquiry:1',tone:publishing?'violet':'coral',title:publishing?'Draft awaiting publication':'New studio enquiry',text:'Studio production update',href:publishing?'/admin/content/1':'/admin/enquiries/1',date:'2026-11-17 08:00:00',active:true,read:false},{key:'draft:2',tone:'violet',title:'Completed update',text:'Already reviewed',href:'/admin/content/2',date:'2026-11-17 07:00:00',active:false,read:true}];
 const series=['Wed','Thu','Fri','Sat','Sun','Mon','Tue'].map((label,i)=>({label,total:empty?0:i+1}));
 res.send(await render('dashboard',{user,currentPath:'/admin',currentType:'',publishing,inbox,attentionTasks:tasks,attentionTotal:tasks.reduce((n,t)=>n+t.value,0),nextTask:tasks.find(t=>t.value)||null,shortcuts:dashboardShortcuts(user),metrics:[...tasks,...summaries],counts:empty?[]:[{type:'blog',status:'draft',total:3},{type:'blog',status:'published',total:12}],enquiryCounts:empty?[]:[{status:'new',total:2},{status:'assigned',total:1},{status:'accepted',total:1}],recentRegistrations:empty?[]:[{id:1,name:'Riya Shah',role:'artist',status:'pending',created_at:'2026-11-17 08:00:00'}],recentContent:empty?[]:[{...entries[0],editor:'Asha'}],recentEnquiries:empty?[]:[{id:1,name:'Asha',subject:'Production enquiry',category:'general',status:'new'}],categories:{general:'General'},activity,series,weeklyTotal:series.reduce((n,d)=>n+d.total,0),media:empty?0:12,notifications,unreadCount:notifications.filter(n=>!n.read).length}));
}catch(error){next(error);}});
app.get('/admin/experience-test',async(req,res,next)=>{try{res.send(await render('head',{currentPath:req.path})+`<h1>Save feedback check</h1><form method="post" action="/admin/experience-save"><input type="hidden" name="_csrf" value="fixture-token"><label>Title<input name="title" value="Original title" required minlength="3"></label><label>Response<select name="response"><option value="success">Success</option><option value="invalid">Invalid</option><option value="failure">Network failure</option><option value="redirect">Redirect</option></select></label><button class="admin-save" name="action" value="save">${adminIcon('check')}Save settings</button></form>`+await render('foot',{}));}catch(error){next(error);}});
app.get('/api/csrf',(_req,res)=>res.json({token:'fixture-token'}));
app.post('/admin/experience-save',multer().none(),(req,res)=>{
 if(req.body.response==='invalid')return res.status(422).json({error:'Use a different title.',fields:{title:'This title is already taken.'}});
 if(req.body.response==='failure')return req.socket.destroy();
 if(req.body.response==='redirect')return res.redirect('/admin/content?type=blog&saved=1');
 assert.equal(req.body.action,'save');assert.equal(req.body._csrf,'fixture-token');
 setTimeout(()=>res.json({message:'Your settings have been saved.'}),150);
});
const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));
const base=`http://127.0.0.1:${server.address().port}`;
const screenshots=await mkdtemp(path.join(tmpdir(),'kemsor-admin-experience-'));
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.route(/fonts\.(googleapis|gstatic)\.com/,route=>route.abort());
 const visit=async url=>{await page.goto(base+url);await page.locator('html[data-admin-theme]').waitFor();};
 await visit('/admin/content?type=blog&q=Studio&status=draft&p=2');
 assert.equal(await page.locator('.admin-active-filters a').count(),3);
 assert.equal(await page.locator('.table-pagination [aria-current=page]').textContent(),'2');
 await page.getByRole('link',{name:'Remove status filter: draft'}).click();
 assert.equal(new URL(page.url()).searchParams.get('q'),'Studio');assert.equal(new URL(page.url()).searchParams.get('p'),'1');assert.equal(new URL(page.url()).searchParams.has('status'),false);
 await page.getByRole('button',{name:'Save view',exact:true}).click();
 await page.getByRole('link',{name:'Clear filters',exact:true}).click();
 await page.getByRole('button',{name:'Load saved view',exact:true}).click();
 await page.waitForURL('**/admin/content?**q=Studio**');
 const bulk=page.locator('[data-bulk-submit]'),action=page.locator('#table-bulk-form select');
 await page.locator('[data-row-select]').first().check();assert.equal(await bulk.isDisabled(),true);
 await action.selectOption('archived');assert.equal(await bulk.isEnabled(),true);assert.equal(await bulk.textContent(),'Apply to 1 selected');
 assert.equal(await page.locator('tr.is-selected').count(),1);
 const confirm=page.waitForEvent('dialog');const apply=bulk.click();const dialog=await confirm;assert.match(dialog.message(),/Archive for 1 selected record/);await dialog.dismiss();await apply;
 await page.locator('[data-select-page]').check();assert.equal(await page.locator('tr.is-selected').count(),25);
 await page.locator('[data-row-select]').first().uncheck();assert.equal(await page.locator('[data-select-page]').evaluate(n=>n.indeterminate),true);
 await page.getByRole('button',{name:'Clear selection',exact:true}).click();assert.equal(await bulk.isDisabled(),true);
 const region=page.locator('.admin-data-table');await region.evaluate(n=>n.scrollTop=250);
 const sticky=await region.evaluate(n=>Math.abs(n.querySelector('th').getBoundingClientRect().top-n.getBoundingClientRect().top)<3);assert.equal(sticky,true);
 for(const theme of ['light','dark'])for(const width of [1440,390]){
  await page.setViewportSize({width,height:1000});await page.waitForFunction(()=>innerWidth>1039||document.querySelector('.cms-nav').getBoundingClientRect().right<=1);await page.evaluate(theme=>{document.documentElement.dataset.adminTheme=theme;},theme);
  const heights=await page.locator('.filters input:not([type=hidden]),.filters select,.table-view-controls select,.table-bulk-form select').evaluateAll(ns=>ns.map(n=>n.getBoundingClientRect().height));assert.ok(heights.every(h=>h===34));
  assert.equal(await page.locator('[data-load-table-view]').evaluate(n=>getComputedStyle(n).backgroundColor),'rgb(255, 255, 255)');
  assert.equal(await page.locator('[data-save-table-view]').evaluate(n=>getComputedStyle(n).backgroundColor),'rgb(0, 171, 132)');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.screenshot({path:path.join(screenshots,`table-${theme}-${width}.png`),fullPage:true});
 }
 await page.getByRole('button',{name:'Open navigation',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.admin-menu-toggle').getAttribute('aria-expanded')==='true');await page.keyboard.press('Escape');assert.equal(await page.locator('.admin-menu-toggle').getAttribute('aria-expanded'),'false');
 await page.setViewportSize({width:1440,height:1000});
 await visit('/admin/content?type=blog&q=unmatched');assert.equal(await page.locator('[data-select-page]').isDisabled(),true);await page.getByRole('link',{name:'Clear filters',exact:true}).click();await page.locator('[data-row-select]').first().waitFor();assert.equal(await page.locator('[data-row-select]').count(),25);
 await visit('/admin/experience-test');
 const title=page.getByLabel('Title',{exact:true}),response=page.locator('select[name="response"]'),save=page.getByRole('button',{name:'Save settings',exact:true});
 await title.fill('');await save.click();await page.locator('.admin-form-feedback[role=alert]').waitFor();assert.equal(await title.getAttribute('aria-invalid'),'true');
 await title.fill('Updated title');assert.equal(await page.locator('.admin-save-state').textContent(),'Unsaved changes');
 await response.selectOption('invalid');await save.click();await page.getByText('Use a different title.',{exact:true}).waitFor();assert.equal(await title.inputValue(),'Updated title');assert.equal(await title.getAttribute('aria-invalid'),'true');
 await title.fill('Corrected title');await response.selectOption('success');await save.click();await page.locator('.admin-form-feedback.is-success').waitFor();assert.equal(await page.locator('.admin-form-feedback').getAttribute('role'),'status');assert.equal(await page.locator('.admin-save-state').textContent(),'No unsaved changes');assert.equal(await save.locator('svg').count(),1);
 await response.selectOption('failure');await save.click();await page.getByText('Unable to connect. Your entries are still here; please try again.',{exact:true}).waitFor();assert.equal(await title.inputValue(),'Corrected title');assert.equal(await save.isEnabled(),true);
 await response.selectOption('success');await save.click();await page.locator('.admin-form-feedback.is-success').waitFor();
 await title.fill('Unsaved title');const leaving=page.waitForEvent('dialog');const navigation=page.goto(base+'/admin/content?type=blog').catch(()=>{});const warning=await leaving;assert.equal(warning.type(),'beforeunload');await warning.dismiss();await navigation;assert.ok(page.url().endsWith('/admin/experience-test'));
 await response.selectOption('redirect');await save.click();await page.waitForURL('**saved=1');await page.locator('.admin-saved-notice').waitFor();await page.getByRole('button',{name:'Dismiss save confirmation'}).click();assert.equal(await page.locator('.admin-saved-notice').count(),0);
 for(const role of ['admin','editor','enquiry_manager']){
  await visit('/admin?role='+role);
  assert.equal(await page.locator('.dashboard-attention-card').count(),role==='admin'?4:role==='editor'?1:2);
  assert.equal(await page.locator('.quick-create>a').count(),role==='admin'?5:role==='editor'?4:3);
  assert.equal(await page.locator('.activity-record-link').textContent(),'Studio production update');
  const updates=page.locator('.dashboard-aside .notification-items');assert.equal(await updates.locator('.notification-item').count(),1);assert.ok(!(await updates.textContent()).includes('Completed update'));
  assert.equal(await page.locator('.dashboard-work-grid').getByRole('heading',{name:'Recent content',exact:true}).count(),role==='enquiry_manager'?0:1);
  for(const theme of ['light','dark'])for(const width of [1440,390]){
   await page.setViewportSize({width,height:1000});await page.waitForFunction(()=>innerWidth>1039||document.querySelector('.cms-nav').getBoundingClientRect().right<=1);await page.evaluate(theme=>document.documentElement.dataset.adminTheme=theme,theme);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   await page.screenshot({path:path.join(screenshots,`dashboard-${role}-${theme}-${width}.png`),fullPage:true});
  }
  await visit('/admin?role='+role+'&empty=1');await page.getByText('You’re up to date. New work will appear here automatically.',{exact:true}).waitFor();assert.equal(await page.locator('.dashboard-attention-card.has-pending').count(),0);
 }
 assert.deepEqual(errors,[]);
 console.log('Passed: role-specific dashboard queues, activity links, unread-only updates, empty states, filter removal/reset, saved views, guarded bulk actions, row selection, sticky headings, pagination, compact fields, white/green buttons, mobile layout, validation, success/error feedback, unsaved changes and redirect confirmation.');
 console.log(`Screenshots: ${screenshots}`);
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
