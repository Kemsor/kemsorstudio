// Isolated real-template checks; no live accounts or permissions are changed.
import assert from 'node:assert/strict';
import express from 'express';
import multer from 'multer';
import ejs from 'ejs';
import {chromium} from 'playwright';
import {mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {adminIcon} from '../src/icons.js';
import {staffRoles,permissionGuide} from '../src/staff-access.js';
const root=path.resolve(import.meta.dirname,'..'),app=express();app.use(express.static(path.join(root,'public')));
const users=[{id:1,name:'Studio Administrator',email:'admin@example.test',role:'admin',active:1,is_default_admin:1},{id:2,name:'Studio Editor',email:'editor@example.test',role:'editor',active:1},{id:3,name:'Enquiry Manager',email:'manager@example.test',role:'enquiry_manager',active:0}];
app.get(['/admin/users','/admin/permissions','/admin/restricted'],async(req,res,next)=>{try{
 const role=Object.hasOwn(staffRoles,req.query.role)?req.query.role:'admin',user={...users[0],role};
 const template=req.path.endsWith('users')?'users':req.path.endsWith('restricted')?'error':'permissions';
 res.send(await ejs.renderFile(path.join(root,'views',template+'.ejs'),{title:'Staff access check',user,users,staffRoles,permissionGuide,csrf:'fixture',notifications:[],unreadCount:0,saved:false,websiteUrl:'/',currentPath:req.path,currentType:'',adminIcon,status:403,message:'Administrator access required.'}));
}catch(e){next(e);}});
app.post('/admin/users/:id/delete',multer().none(),(req,res)=>{assert.notEqual(req.params.id,'1');assert.equal(req.body.confirm_delete,'delete');const index=users.findIndex(user=>String(user.id)===req.params.id);assert.ok(index>0);users.splice(index,1);res.redirect('/admin/users?saved=1');});
let memberDeleted=false;const member={id:10,name:'Fixture member',email:'member@example.test',role:'artist',status:'pending',created_at:'2026-11-19 08:00:00',department:'',specialty:'',city:'Mumbai',profession:'Actor',bio:'Fixture profile',skills:'',languages:'',credits:'',visible:0,image_id:null,contact_checked:0,showreel:''};
app.get('/admin/talent/10',async(req,res,next)=>{if(memberDeleted)return res.sendStatus(404);try{res.send(await ejs.renderFile(path.join(root,'views/talent-detail.ejs'),{title:'Member check',user:users[0],csrf:'fixture',notifications:[],unreadCount:0,saved:false,websiteUrl:'/',currentPath:req.path,currentType:'',adminIcon,account:member}));}catch(error){next(error);}});
app.post('/admin/talent/10/delete',multer().none(),(req,res)=>{assert.equal(req.body.confirm_delete,'delete');assert.equal(req.body.previous_email,member.email);assert.equal(req.body.previous_status,member.status);memberDeleted=true;res.redirect('/admin/talent');});
app.get('/admin/talent',(req,res)=>res.send('<h1>Members</h1>'));
const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));
const screenshots=await mkdtemp(path.join(tmpdir(),'kemsor-staff-access-'));
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
 const base=`http://127.0.0.1:${server.address().port}`;
 for(const url of ['/admin/users','/admin/permissions','/admin/permissions?role=editor','/admin/permissions?role=enquiry_manager','/admin/restricted?role=editor']){
  await page.goto(base+url);
  for(const theme of ['light','dark'])for(const width of [1440,390]){
   await page.setViewportSize({width,height:1000});await page.evaluate(theme=>{document.documentElement.dataset.adminTheme=theme;},theme);
   await page.waitForTimeout(150);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${url} ${theme} ${width}`);
   if(url==='/admin/users'){
    assert.equal(await page.locator('.staff-access-form').count(),2);
    assert.equal(await page.getByRole('button',{name:'Save access',exact:true}).first().evaluate(n=>getComputedStyle(n).backgroundColor),'rgb(0, 171, 132)');
    assert.equal(await page.locator('.staff-access-form select').first().evaluate(n=>getComputedStyle(n).backgroundColor),'rgb(255, 255, 255)');
   }
   await page.screenshot({path:path.join(screenshots,`${url.replace(/[^a-z0-9]/gi,'-')}-${theme}-${width}.png`),fullPage:true});
  }
  if(url.includes('restricted'))assert.equal(await page.getByRole('link',{name:'View role permissions'}).count(),1);
 }
 await page.setViewportSize({width:1440,height:1000});await page.goto(base+'/admin/users');assert.equal(await page.locator('form[action="/admin/users/1/delete"]').count(),0);assert.equal(await page.getByText('Default administrator',{exact:true}).count(),1);
 const row=page.locator('tbody tr').filter({hasText:'Studio Editor'});await row.locator('summary').click();const staffDelete=row.locator('.account-delete-form');await staffDelete.getByRole('button',{name:'Delete user permanently'}).click();await staffDelete.locator('.admin-form-feedback').waitFor();assert.equal(users.length,3);
 await staffDelete.getByRole('checkbox').check();assert.equal(await staffDelete.getByRole('button',{name:'Delete user permanently'}).evaluate(n=>getComputedStyle(n).backgroundColor),'rgb(220, 38, 38)');await page.screenshot({path:path.join(screenshots,'staff-delete-confirmation.png'),fullPage:true});await staffDelete.getByRole('button',{name:'Delete user permanently'}).click();await page.waitForFunction(()=>!document.querySelector('tbody').textContent.includes('Studio Editor'));assert.equal(users.length,2);assert.equal(users[0].is_default_admin,1);
 await page.goto(base+'/admin/talent/10');const memberDelete=page.locator('.account-delete-form');await memberDelete.getByRole('button',{name:'Delete member permanently'}).click();await memberDelete.locator('.admin-form-feedback').waitFor();assert.equal(memberDeleted,false);await memberDelete.getByRole('checkbox').check();
 for(const width of [1440,390]){await page.setViewportSize({width,height:1000});await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:path.join(screenshots,`member-delete-${width}.png`),fullPage:true});}
 await memberDelete.getByRole('button',{name:'Delete member permanently'}).click();await page.getByRole('heading',{name:'Members',exact:true}).waitFor();assert.equal(memberDeleted,true);
 assert.deepEqual(errors,[]);console.log('Passed: staff role forms, self-access explanation, permission guides for all roles, restricted-action recovery, white controls, green save buttons and responsive light/dark layouts, protected default administrator, confirmed staff deletion and member deletion.');console.log('Screenshots:',screenshots);
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
