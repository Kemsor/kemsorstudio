// Isolated fixtures use the real lists, detail pages, reply page, styles and scripts.
import assert from 'node:assert/strict';
import express from 'express';
import multer from 'multer';
import ejs from 'ejs';
import {chromium} from 'playwright';
import {mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import nodePath from 'node:path';
import {adminIcon} from '../src/icons.js';
import {tableView} from '../src/admin-tables.js';
import {workflowFilters,workflowDetails,workflowChanges,workflowRecordUrl,workflowReturn,followUpState,followUpOrder,recordTimeline} from '../src/follow-up.js';
import {statuses} from '../src/enquiry-options.js';
const backend=nodePath.resolve(import.meta.dirname,'..'),app=express(),user={id:10,name:'Asha Reviewer',role:'enquiry_manager'},users=[{...user,active:1},{id:11,name:'Riya Manager',active:1}];
const stamp=date=>date.toISOString().slice(0,19).replace('T',' '),now=new Date(),past=stamp(new Date(now-2*86400000)),future=stamp(new Date(+now+2*86400000));
const baseRecord={name:'Workflow producer',email:'workflow@example.test',status:'new',assigned_to:10,assigned_name:'Asha Reviewer',priority:'high',next_action:'Arrange a production call',follow_up_at:past,created_at:past,consent_at:past,consent_version:'test',message:'A production enquiry for staff review.',source:'/contact/',category:'general',organisation:'Studio',retention_hold:0};
const records={enquiry:[{...baseRecord,id:201,subject:'Workflow enquiry'},{...baseRecord,id:202,name:'Workflow new producer',subject:'Workflow upcoming enquiry',assigned_to:null,assigned_name:null,follow_up_at:future}],application:[{...baseRecord,id:301,name:'Workflow applicant',career_title:'Production coordinator',phone:'1234567890',city:'Mumbai',experience:'Two years',resume_name:'resume.pdf',portfolio_url:'',application_type:'role',team:'Production'},{...baseRecord,id:302,name:'Workflow upcoming applicant',career_title:'Editor',phone:'1234567890',resume_name:'resume.pdf',assigned_to:null,assigned_name:null,follow_up_at:future}]};
const histories={enquiry:[],application:[]},notes={enquiry:[],application:[]};
const locals={title:'Workflow check',user,csrf:'fixture-token',unreadCount:0,notifications:[],websiteUrl:'/',currentType:'',types:{blog:'Blog'},saved:false,adminIcon,workflowRecordUrl,followUpState,categories:{general:'General enquiry'},statuses};
const render=(name,data)=>ejs.renderFile(nodePath.join(backend,'views',name+'.ejs'),{...locals,...data});
app.use(express.static(nodePath.join(backend,'public')));app.use(express.urlencoded({extended:false}));
for(const resource of ['enquiry','application']){
 const base='/admin/'+(resource==='enquiry'?'enquiries':'applications');
 app.get(base,async(req,res,next)=>{try{
  const workflow=workflowFilters(req.query,user.id,resource),state=req.query.status||'',search=req.query.q||'',section='all',category='';
  const scope=records[resource].filter(record=>(!search||record.name.toLowerCase().includes(search.toLowerCase()))&&(!state||record.status===state)&&(!workflow.owner||(workflow.owner==='me'?record.assigned_to===user.id:!record.assigned_to))&&(!workflow.priority||workflow.priority===record.priority));
  const filtered=scope.filter(record=>!workflow.due||(workflow.due==='overdue'?followUpState(record,resource).key==='overdue':workflow.due==='upcoming'?followUpState(record,resource).key==='upcoming':!record.follow_up_at));
  const table=tableView(req,filtered.length,{name:'name',subject:'subject',category:'category',status:'status',received:'created_at',opportunity:'career_title',follow_up:followUpOrder(resource)},'follow_up',{...(resource==='enquiry'?{section,category}:{}),status:state,q:search,owner:workflow.owner,priority:workflow.priority,due:workflow.due},'asc');
  const summary={overdue:scope.filter(record=>followUpState(record,resource).key==='overdue').length,upcoming:scope.filter(record=>followUpState(record,resource).key==='upcoming').length};
  res.send(await render(resource==='enquiry'?'enquiries':'applications',{currentPath:base,workflow,summary,table,section,state,search,category,enquiries:filtered,applications:filtered,states:['new','reviewing','shortlisted','rejected'],page:table.page,total:filtered.length}));
 }catch(error){next(error);}});
 app.get(base+'/:id',async(req,res,next)=>{try{
  const record=records[resource].find(record=>record.id===Number(req.params.id));if(!record)return res.sendStatus(404);
  const fake={execute:async()=>[[{id:800,subject:'A sent reply',body:'We have received the brief.',status:'sent',created_at:past,sent_at:past,staff_name:'Asha Reviewer'},{id:801,subject:'A failed reply',body:'An update on your enquiry.',status:'failed',created_at:past,sent_at:null,staff_name:'Riya Manager'}]]};
  const timeline=await recordTimeline(fake,resource,record,notes[resource],histories[resource],users);
  const returnTo=req.query.return_to?workflowReturn(req.query.return_to,resource):'';
  res.send(await render(resource==='enquiry'?'enquiry':'application',{currentPath:base,enquiry:record,application:record,notes:notes[resource],history:histories[resource],users,timeline,returnTo,back:workflowReturn(returnTo,resource),followUp:followUpState(record,resource),related:[record],states:['new','reviewing','shortlisted','rejected'],saved:req.query.saved==='1'}));
 }catch(error){next(error);}});
 app.post(base+'/:id',multer().none(),(req,res)=>{
  const record=records[resource].find(record=>record.id===Number(req.params.id)),details=workflowDetails(req.body,record),changes=workflowChanges(record,details),from_status=record.status;
  Object.assign(record,{assigned_to:details.assigned,assigned_name:users.find(person=>person.id===details.assigned)?.name,priority:details.priority,next_action:details.nextAction,follow_up_at:details.followUp,status:req.body.status});
  histories[resource].push({id:900,from_status,to_status:record.status,created_at:stamp(new Date()),staff_name:user.name,name:user.name,changes});if(req.body.note)notes[resource].push({id:901,note:req.body.note,created_at:stamp(new Date()),name:user.name});
  res.redirect(workflowRecordUrl(resource,record.id,req.body.return_to,true));
 });
}
app.get('/admin/replies/:kind/:id',async(req,res)=>{const {kind,id}=req.params,record=records[kind].find(record=>record.id===Number(id)),returnTo=workflowReturn(req.query.return_to,kind);res.send(await render('enquiry-reply',{currentPath:req.path,record:{...record,subject:record.subject||record.career_title},reference:'TEST-'+id,kind,replies:[],replyToken:'fixture',queued:false,configuration:{enabled:false,message:'Sending disabled in the fixture.'},returnTo,back:workflowRecordUrl(kind,id,returnTo)}));});
app.get('/api/csrf',(_req,res)=>res.json({token:'fixture-token'}));
const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));const base=`http://127.0.0.1:${server.address().port}`,screenshots=await mkdtemp(nodePath.join(tmpdir(),'kemsor-follow-up-'));let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',error=>errors.push(error.message));await page.route(/fonts\.(googleapis|gstatic)\.com/,route=>route.abort());
 for(const resource of ['enquiry','application']){
  const path='/admin/'+(resource==='enquiry'?'enquiries':'applications'),start=path+'?'+(resource==='enquiry'?'section=all&':'')+'q=Workflow&owner=me&due=overdue';
  await page.goto(base+start);await page.locator('.admin-data-table').waitFor();assert.equal(await page.locator('[data-row-select]').count(),1);assert.equal(await page.locator('.workflow-date-cell .due-overdue').count(),1);assert.equal(await page.locator('.workflow-owner-cell>strong').textContent(),'Asha Reviewer');
  const controls=await page.locator('.filters input:not([type=hidden]),.filters select').evaluateAll(nodes=>nodes.map(node=>node.getBoundingClientRect().height));assert.ok(controls.every(height=>height===34));
  for(const width of [1440,390]){await page.setViewportSize({width,height:1000});await page.waitForFunction(()=>innerWidth>1039||document.querySelector('.cms-nav').getBoundingClientRect().right<=1);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:nodePath.join(screenshots,`${resource}-list-${width}.png`),fullPage:true});}
  await page.setViewportSize({width:1440,height:1000});await page.locator('.workflow-table tbody a').last().click();await page.getByRole('heading',{name:'Activity timeline',exact:true}).waitFor();const detailPath=new URL(page.url()).pathname,context=new URL(page.url()).searchParams.get('return_to');assert.equal(new URL(context,'http://local').searchParams.get('owner'),'me');assert.equal(new URL(context,'http://local').searchParams.get('due'),'overdue');
  await page.locator('.workflow-timeline').getByText('Sent',{exact:true}).waitFor();await page.locator('.workflow-timeline').getByText('Failed',{exact:true}).waitFor();
  for(const width of [1440,390]){await page.setViewportSize({width,height:1000});await page.waitForFunction(()=>innerWidth>1039||document.querySelector('.cms-nav').getBoundingClientRect().right<=1);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:nodePath.join(screenshots,`${resource}-detail-${width}.png`),fullPage:true});}
  await page.setViewportSize({width:1440,height:1000});await page.locator('select[name=assigned_to]').selectOption('11');await page.locator('select[name=priority]').selectOption('urgent');await page.locator('input[name=next_action]').fill('Confirm the shoot date');await page.locator('input[name=follow_up_at]').fill('2099-01-02T10:00');await page.locator('textarea[name=note]').fill('Follow-up browser check');await page.locator('select[name=status]').selectOption(resource==='enquiry'?'in_review':'reviewing');
  await page.getByRole('button',{name:resource==='enquiry'?'Save follow-up':'Save review',exact:true}).click();await page.waitForURL(url=>url.pathname===detailPath&&url.searchParams.get('saved')==='1');assert.equal(new URL(page.url()).searchParams.get('return_to'),context);await page.locator('.workflow-timeline').getByText('Follow-up browser check',{exact:true}).waitFor();assert.equal(await page.locator('.workflow-record-summary').getByText('Riya Manager',{exact:true}).count(),1);
  await page.getByRole('link',{name:'Reply by email',exact:true}).click();await page.getByRole('heading',{name:'Reply by email',exact:true}).waitFor();assert.equal(new URL(page.url()).searchParams.get('return_to'),context);await page.getByRole('link',{name:'Back to record',exact:true}).click();await page.getByRole('link',{name:resource==='enquiry'?'Back to enquiries':'Back to applications',exact:true}).click();await page.waitForURL(url=>url.pathname===path);assert.equal(new URL(page.url()).searchParams.get('owner'),'me');assert.equal(new URL(page.url()).searchParams.get('due'),'overdue');assert.equal(new URL(page.url()).searchParams.get('q'),'Workflow');
 }
 assert.deepEqual(errors,[]);console.log('Passed: ownership/date filters, compact inputs, due labels, timeline delivery states, assignments, priorities, next actions, saved list context, reply round trips and responsive layouts.');console.log(`Screenshots: ${screenshots}`);
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
