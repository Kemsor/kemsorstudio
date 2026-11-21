// Browser workflow with isolated responses. Never writes real projects or submissions.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {filmDeskGoals,filmDeskMaterials,filmDeskTools} from '../../shared/filmdesk.js';
const projects=[],writes=[];let nextId=1;
const user={id:909,name:'FilmDesk Test Member',role:'artist',status:'approved',department:'',specialty:''};
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[];page.on('pageerror',error=>errors.push(error.message));page.on('dialog',dialog=>dialog.accept());
 await page.route('**/api/**',async route=>{
  const req=route.request(),url=new URL(req.url()),method=req.method();let data;
  if(method==='POST'){data=req.postDataJSON();writes.push({path:url.pathname,data});}
  const send=value=>route.fulfill({contentType:'application/json',body:JSON.stringify(value)});
  if(url.pathname==='/api/csrf')return send({token:'fixture-token'});
  if(url.pathname==='/api/talent/session')return send({user});
  if(url.pathname==='/api/site')return send({entries:[],siteModules:{},settings:{script_submissions_enabled:true,script_terms:'Approved fixture terms.',script_terms_version:'fd-fixture-v1'},legalDocuments:[]});
  const match=url.pathname.match(/^\/api\/production\/projects(?:\/(\d+)(?:\/(\w+))?)?$/);
  if(!match)return send({people:[],filters:{},saved:[],enquiries:[]});
  if(!match[1]){
   if(method==='GET')return send({projects});
   const project={...data,id:nextId++,budget:Number(data.budget||0),revision:1,reviewed_revision:null,plan:Object.fromEntries(filmDeskTools.map(([key])=>[key,''])),submissions:[]};projects.unshift(project);return send({id:project.id});
  }
  const project=projects.find(item=>item.id===Number(match[1]));assert.ok(project);
  if(!match[2])return send({project,submissions:project.submissions,analysisAvailable:false});
  if(match[2]==='plan'){assert.equal(data.revision,project.revision);for(const [key]of filmDeskTools)project.plan[key]=data[key]||'';project.revision++;project.reviewed_revision=null;return send({revision:project.revision});}
  if(match[2]==='review'){assert.equal(data.revision,project.revision);project.reviewed_revision=project.revision;return send({ok:true});}
  if(match[2]==='submit'){assert.deepEqual(data.sections,['story']);assert.equal(data.share_confirmed,true);project.submissions.unshift({id:55,project_revision:project.revision,status:'received',created_at:'2026-11-21 10:00:00'});return send({id:55,reference:'FD-55'});}
  return send({ok:true});
 });
 await page.goto('http://127.0.0.1:3007/filmdesk/');await page.getByRole('button',{name:'New workspace',exact:true}).waitFor();await page.waitForTimeout(3500);
 const reject=page.getByRole('button',{name:'Reject optional',exact:true});if(await reject.isVisible())await reject.click();
 for(let index=0;index<filmDeskGoals.length;index++){
  await page.getByRole('button',{name:'New workspace',exact:true}).click();
  await page.getByLabel('Department',{exact:true}).selectOption('Creative & Executive Leadership (Above-the-Line)');await page.getByLabel('Professional role',{exact:true}).selectOption('Director');await page.getByRole('button',{name:'Continue',exact:true}).click();
  await page.getByLabel(filmDeskGoals[index].label,{exact:true}).check();await page.getByRole('button',{name:'Continue',exact:true}).click();
  await page.getByLabel(filmDeskMaterials[index%filmDeskMaterials.length].label,{exact:true}).check();await page.getByRole('button',{name:'Continue',exact:true}).click();
  await page.getByLabel('Workspace title',{exact:true}).fill('FilmDesk fixture '+index);await page.getByLabel(filmDeskGoals[index].questions[0][1],{exact:true}).fill('A response for this goal');await page.getByRole('button',{name:'Continue',exact:true}).click();await page.getByLabel('Constraints to work within',{exact:true}).fill('Test constraints');await page.getByRole('checkbox',{name:/I have checked my goals/}).check();await page.getByRole('button',{name:'Create private workspace',exact:true}).click();
  await page.getByRole('heading',{name:'FilmDesk fixture '+index,exact:true}).waitFor();assert.equal(projects[0].onboarding.objective,filmDeskGoals[index].id);assert.equal(await page.getByRole('navigation',{name:'FilmDesk tools'}).getByRole('button').count(),10);
 }
 assert.equal(writes.some(item=>item.path.endsWith('/submit')),false,'Creating workspaces must not submit material.');
 await page.getByRole('button',{name:/^Story development/}).click();const editor=page.getByLabel('Story development',{exact:true});await editor.fill('A reviewed fixture story');await page.getByRole('button',{name:'Save private workspace',exact:true}).click();await page.getByText('Saved privately. Review this version before exporting or sharing.',{exact:true}).waitFor();
 await page.getByRole('button',{name:'Review saved version',exact:true}).click();await page.getByRole('checkbox',{name:/I reviewed this saved version/}).check();await page.getByRole('button',{name:'Approve this version',exact:true}).click();await page.getByRole('link',{name:'Download CSV',exact:true}).waitFor();
 await page.getByRole('button',{name:'Choose material to share',exact:true}).click();await page.getByRole('checkbox',{name:'Story development',exact:true}).check();await page.getByRole('checkbox',{name:/I accept the submission terms/}).check();await page.getByRole('button',{name:'Submit selected material to Kemsor',exact:true}).click();await page.getByText(/Reference FD-55/).waitFor();
 await page.getByRole('button',{name:'Build your plan',exact:true}).click();
 for(const width of [1440,390]){await page.setViewportSize({width,height:1000});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'No horizontal overflow');await page.screenshot({path:`/private/tmp/filmdesk-workspace-${width}.png`,fullPage:true});}
 assert.deepEqual(errors,[]);console.log('Passed: all six onboarding goals, material choices, optional script, role-based tool suggestions, save/review/selected submission flow, private creation and responsive workspace.');
}finally{await browser.close();}
