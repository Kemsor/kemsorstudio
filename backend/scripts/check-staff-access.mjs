// Isolated real-template checks; no live accounts or permissions are changed.
import assert from 'node:assert/strict';
import express from 'express';
import ejs from 'ejs';
import {chromium} from 'playwright';
import {mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {adminIcon} from '../src/icons.js';
import {staffRoles,permissionGuide} from '../src/staff-access.js';
const root=path.resolve(import.meta.dirname,'..'),app=express();app.use(express.static(path.join(root,'public')));
const users=[{id:1,name:'Studio Administrator',email:'admin@example.test',role:'admin',active:1},{id:2,name:'Studio Editor',email:'editor@example.test',role:'editor',active:1},{id:3,name:'Enquiry Manager',email:'manager@example.test',role:'enquiry_manager',active:0}];
app.get(['/admin/users','/admin/permissions','/admin/restricted'],async(req,res,next)=>{try{
 const role=Object.hasOwn(staffRoles,req.query.role)?req.query.role:'admin',user={...users[0],role};
 const template=req.path.endsWith('users')?'users':req.path.endsWith('restricted')?'error':'permissions';
 res.send(await ejs.renderFile(path.join(root,'views',template+'.ejs'),{title:'Staff access check',user,users,staffRoles,permissionGuide,csrf:'fixture',notifications:[],unreadCount:0,saved:false,websiteUrl:'/',currentPath:req.path,currentType:'',adminIcon,status:403,message:'Administrator access required.'}));
}catch(e){next(e);}});
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
 assert.deepEqual(errors,[]);console.log('Passed: staff role forms, self-access explanation, permission guides for all roles, restricted-action recovery, white controls, green save buttons and responsive light/dark layouts.');console.log('Screenshots:',screenshots);
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
