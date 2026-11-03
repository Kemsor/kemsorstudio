import mysql from 'mysql2/promise';
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFile,readdir,unlink,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {createApp} from '../src/app.js';
import {hashPassword} from '../src/security.js';
import {rows} from '../src/db.js';
import {seedManagedContent} from '../src/managed-content.js';
import imageSlots from '../../shared/site-image-slots.json' with {type:'json'};
import copy from '../../shared/site-copy-catalogue.json' with {type:'json'};
import {pageInfo,pageHref} from '../../rain-temp/src/pageInfo.js';
const database=`kemsor_browser_${process.pid}`,backend=path.resolve(import.meta.dirname,'..');
const options={host:process.env.DB_HOST||'127.0.0.1',socketPath:process.env.DB_SOCKET||undefined,user:process.env.DB_MIGRATION_USER||process.env.DB_USER||'root',password:process.env.DB_MIGRATION_PASSWORD||'',timezone:'Z',dateStrings:true};
let root,db,server,browser;
const errors=[],results=[],imageInventory={};let base;
try{
 root=await mysql.createConnection(options);await root.query(`CREATE DATABASE \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);db=mysql.createPool({...options,database,connectionLimit:5});
 for(const name of (await readdir(path.join(backend,'migrations'))).filter(n=>/^\d.*\.sql$/.test(n)).sort()){const sql=await readFile(path.join(backend,'migrations',name),'utf8');for(const statement of sql.split(';').map(s=>s.trim()).filter(Boolean))await db.query(statement);}
 await seedManagedContent(db);
 const password='Browser-isolated-password';for(const role of ['admin','editor','enquiry_manager'])await rows(db,'INSERT INTO cms_users(name,email,password_hash,role) VALUES(?,?,?,?)',[`Browser ${role}`,`${role}@browser.test`,await hashPassword(password),role]);
 const app=createApp(db,{cookieName:'kemsor.browser.isolated',dummyHash:await hashPassword('dummy'),frontendDirectory:path.resolve(backend,'../rain-temp/dist')});server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));base=`http://127.0.0.1:${server.address().port}`;
 browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--disable-background-networking']});
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 await context.addInitScript(()=>{localStorage.setItem('kemsor.cookie-preferences',JSON.stringify({version:2,necessary:true,externalMedia:false,savedAt:Date.now()}));});
 const page=await context.newPage();page.on('pageerror',error=>errors.push({url:page.url(),message:error.message}));
 const routes=[...new Set(Object.keys(pageInfo).filter(key=>key!=='news').map(pageHref))];
 for(const route of routes){const response=await page.goto(base+route,{waitUntil:'domcontentloaded'});assert.ok(response.status()<400,`${route}: HTTP ${response.status()}`);await page.locator('#main h1').first().waitFor({state:'attached',timeout:15000});await page.waitForTimeout(150);assert.ok((await page.locator('#main').innerText()).trim().length>40,`${route}: empty main`);const images=await page.locator('#main [data-media-original]').evaluateAll(nodes=>nodes.map(node=>({slot:node.dataset.mediaSlot||'undefined',original:node.dataset.mediaOriginal,value:node.tagName==='IMG'?{src:node.getAttribute('src'),srcSet:node.getAttribute('srcset')||'',alt:node.getAttribute('alt')||''}:null})));
 for(const image of images){const identity=image.original.split('?')[0].replace(/-(640|960|1600)(?=\.)/,'').replace(/\.(webp|avif|png|jpe?g)$/i,'');const key=`${route}|${image.slot}|${identity}`;imageInventory[key]={page:route,slot:image.slot,original:identity,value:image.value};}
 results.push({route,status:response.status()});if(results.length%10===0)console.log(`Public pages checked: ${results.length}/${routes.length}`);}
 await writeFile('/tmp/kemsor-site-image-inventory.json',JSON.stringify(imageInventory,null,2));
 assert.deepEqual(errors,[],'Public-page runtime errors');
 await page.goto(base+'/leadership/');await page.locator('.opening-loader').waitFor({state:'hidden',timeout:15000});await page.locator('.leadership-portrait img').waitFor();await page.waitForFunction(()=>document.querySelector('.leadership-portrait img')?.naturalWidth>0);assert.ok((await page.locator('.leadership-biography').innerText()).includes('Kemriya Saur'));assert.equal(await page.locator('.leadership-work-list li').count(),3);await page.screenshot({path:'/tmp/kemsor-leadership-desktop.png',fullPage:true});await page.setViewportSize({width:390,height:844});await page.screenshot({path:'/tmp/kemsor-leadership-mobile.png',fullPage:true});await page.setViewportSize({width:1440,height:1000});
 await page.goto(base+'/productions/');await page.locator('#slate-title').waitFor();await page.locator('.opening-loader').waitFor({state:'hidden',timeout:15000});await page.screenshot({path:'/tmp/kemsor-cms-qa-productions-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'/tmp/kemsor-cms-qa-productions-mobile.png',fullPage:true});await page.setViewportSize({width:1440,height:1000});
 async function login(role){const ctx=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});const tab=await ctx.newPage();tab.on('pageerror',error=>errors.push({url:tab.url(),message:error.message}));await tab.goto(base+'/admin/login');await tab.getByLabel('Email',{exact:true}).fill(`${role}@browser.test`);await tab.getByLabel('Password',{exact:true}).fill(password);await Promise.all([tab.waitForURL(base+'/admin'),tab.getByRole('button',{name:'Sign in',exact:true}).click()]);return {ctx,tab};}
 const admin=await login('admin');
 for(const theme of ['light','dark']){
  await admin.tab.goto(base+'/admin');await admin.tab.getByRole('switch',{name:'Dark theme'}).setChecked(theme==='dark');
  await admin.tab.waitForFunction(theme=>document.documentElement.dataset.adminTheme===theme,theme);
  assert.equal(await admin.tab.locator('.metric-card').first().evaluate(node=>getComputedStyle(node).backgroundImage),'none');
  assert.equal(await admin.tab.locator('.cms-nav').evaluate(node=>getComputedStyle(node).backgroundImage),'none');
  if(theme==='dark')assert.equal(await admin.tab.locator('.metric-card').first().evaluate(node=>getComputedStyle(node).backgroundColor),'rgb(45, 41, 54)');
  await admin.tab.screenshot({path:`/tmp/kemsor-cms-flat-${theme}.png`,fullPage:true});
  await admin.tab.goto(base+'/admin/content/new?type=news');assert.equal(await admin.tab.locator('html').getAttribute('data-admin-theme'),theme);
 }
 await admin.tab.setViewportSize({width:390,height:844});await admin.tab.goto(base+'/admin');await admin.tab.screenshot({path:'/tmp/kemsor-cms-flat-mobile.png',fullPage:false});await admin.tab.setViewportSize({width:1440,height:1000});
 for(const route of ['/admin/pages','/admin/site-content/edit?key=leadership','/admin/media','/admin/site-content','/admin/site-content/edit?key=videos','/admin/site-content/edit?key=navigation','/admin/manage/legal','/admin/manage/hero','/admin/reports','/admin/operations','/admin/news-campaigns']){const response=await admin.tab.goto(base+route);assert.equal(response.status(),200,route);}
 const key=copy.ProductionsPage.fields.find(field=>field.default==='Stories taking shape.').key;
 await admin.tab.goto(base+'/admin/site-content/edit?key=copy%3AProductionsPage');await admin.tab.locator(`[name="value:${key}"]`).fill('Studio stories · browser verified');
 await Promise.all([admin.tab.waitForResponse(r=>r.request().method()==='POST'&&r.url().includes('/admin/site-content/save')),admin.tab.getByRole('button',{name:'Save draft',exact:true}).click()]);await admin.tab.waitForURL(/saved=1/);
 await page.goto(base+'/productions/');assert.equal(await page.locator('#slate-title').innerText(),'Stories taking shape.');
 await admin.tab.goto(base+'/admin/site-content/edit?key=copy%3AProductionsPage');await Promise.all([admin.tab.waitForResponse(r=>r.request().method()==='POST'&&r.url().includes('/admin/site-content/save')),admin.tab.getByRole('button',{name:'Publish changes',exact:true}).click()]);await admin.tab.waitForURL(/saved=1/);
 await page.goto(base+'/productions/');await page.waitForFunction(()=>document.querySelector('#slate-title')?.textContent==='Studio stories · browser verified');
 const editor=await login('editor');assert.equal((await editor.tab.goto(base+'/admin/site-content')).status(),200);assert.equal((await editor.tab.goto(base+'/admin/site-content/edit?key=navigation')).status(),403);
 const manager=await login('enquiry_manager');assert.equal((await manager.tab.goto(base+'/admin/site-content')).status(),403);assert.equal((await manager.tab.goto(base+'/admin/enquiries')).status(),200);
 // Real upload UI, isolated database; no public content is published by this check.
 await admin.tab.goto(base+'/admin/content/new?type=news');const file=admin.tab.locator('input[type=file][name=image]');await file.setInputFiles({name:'browser-banner.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAEUlEQVQImWN4O83kPwgzwBgAYgIK2V6WzBUAAAAASUVORK5CYII=','base64')});await admin.tab.locator('[data-banner-alt]').fill('Browser upload fixture');await admin.tab.getByRole('button',{name:'Upload image',exact:true}).click();await admin.tab.getByText('Uploaded successfully. You can now save the rest of the form.',{exact:true}).waitFor();assert.ok(await admin.tab.locator('[name=image_id]').inputValue());assert.equal((await rows(db,"SELECT COUNT(*) AS n FROM cms_entries WHERE type='news'"))[0].n,0);
 const imageId=await admin.tab.locator('[name=image_id]').inputValue();
 const slot=Object.values(imageSlots).find(item=>item.page==='/productions/'&&item.value?.src);
 await admin.tab.goto(base+'/admin/site-content/edit?key='+encodeURIComponent('images:'+encodeURIComponent('/productions/')));
 await admin.tab.locator(`[name="value:${slot.id}.src"]`).fill(`/media/${imageId}`);
 await Promise.all([admin.tab.waitForResponse(r=>r.request().method()==='POST'&&r.url().includes('/admin/site-content/save')),admin.tab.getByRole('button',{name:'Publish changes',exact:true}).click()]);await admin.tab.waitForURL(/saved=1/);
 await page.goto(base+'/productions/');await page.locator(`#main img[src="/media/${imageId}"]`).first().waitFor({state:'attached'});
 await admin.tab.goto(base+'/admin/site-content/edit?key=navigation');
 await admin.tab.locator('[name="value:header.0.label"]').fill('Browse KEMSOR talent');await admin.tab.locator('[name="value:footer.0.links.0.label"]').fill('Studio journal');
 await Promise.all([admin.tab.waitForResponse(r=>r.request().method()==='POST'&&r.url().includes('/admin/site-content/save')),admin.tab.getByRole('button',{name:'Publish changes',exact:true}).click()]);await admin.tab.waitForURL(/saved=1/);
 await page.goto(base+'/productions/');await page.getByText('Studio journal',{exact:true}).waitFor();assert.ok((await page.locator('.creative-nav').textContent()).includes('Browse KEMSOR talent'));
 await admin.tab.goto(base+'/admin/site-content/edit?key=videos');await admin.tab.locator('[name="value:how-we-work.label"]').fill('Browser process film');
 await Promise.all([admin.tab.waitForResponse(r=>r.request().method()==='POST'&&r.url().includes('/admin/site-content/save')),admin.tab.getByRole('button',{name:'Publish changes',exact:true}).click()]);await admin.tab.waitForURL(/saved=1/);
 await page.goto(base+'/how-we-work/');await page.locator('video[aria-label="Browser process film"]').waitFor({state:'attached'});
 await admin.tab.goto(base+'/admin/site-content/edit?key=branding');await admin.tab.locator('[name="value:logo"]').fill(`/media/${imageId}`);
 await Promise.all([admin.tab.waitForResponse(r=>r.request().method()==='POST'&&r.url().includes('/admin/site-content/save')),admin.tab.getByRole('button',{name:'Publish changes',exact:true}).click()]);await admin.tab.waitForURL(/saved=1/);
 await page.goto(base+'/productions/');await page.locator(`.creative-header-brand img[src="/media/${imageId}"]`).waitFor({state:'attached'});
 await admin.tab.goto(base+'/admin/media');await admin.tab.locator('.library-card').first().waitFor();await admin.tab.waitForTimeout(150);
 assert.deepEqual(errors,[],'Browser runtime errors');
 await writeFile('/tmp/kemsor-cms-browser-results.json',JSON.stringify({publicPages:results,roles:['admin','editor','enquiry_manager'],checks:['draft stays private','published copy reaches frontend','navigation permissions','separate image upload completes before save','published image replacement','header and footer navigation','page video controls','website logo publishing'],errors},null,2));console.log(`Browser checks passed: ${results.length} public pages, 3 admin roles, draft/publish and upload flow. No emails sent.`);
}catch(error){
 console.error('Browser runtime errors:',JSON.stringify(errors.slice(0,8)));
 if(browser)for(const context of browser.contexts())for(const tab of context.pages())try{const feedback=await tab.locator('.admin-form-feedback').allTextContents();if(feedback.length)console.error('Form feedback:',JSON.stringify(feedback));}catch{}
 throw error;
}finally{
 await browser?.close();if(server)await new Promise(resolve=>server.close(resolve));
 if(db){for(const file of await rows(db,'SELECT filename FROM cms_media'))await unlink(path.join(backend,'storage/uploads',file.filename)).catch(()=>{});await db.end();}
 if(root){assert.match(database,/^kemsor_browser_\d+$/);await root.query(`DROP DATABASE IF EXISTS \`${database}\``);await root.end();}
}
