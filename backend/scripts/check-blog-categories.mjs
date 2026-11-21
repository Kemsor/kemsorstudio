// The real blog editor, popup, previews and assets with isolated category fixtures.
import assert from 'node:assert/strict';
import express from 'express';
import multer from 'multer';
import ejs from 'ejs';
import {chromium} from 'playwright';
import {mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {adminIcon} from '../src/icons.js';
const root=path.resolve(import.meta.dirname,'..'),app=express(),categories=[],newsCategories=[],saved=[];let categoryPosts=0;
app.use(express.static(path.join(root,'public')));app.use(express.urlencoded({extended:false}));
app.get('/admin/category-check',async(req,res,next)=>{try{
 const type=req.query.type==='news'?'news':'blog';
 res.send(await ejs.renderFile(path.join(root,'views',type+'-edit.ejs'),{title:'Blog categories check',user:{id:1,name:'Studio Editor',role:'editor'},csrf:'fixture',unreadCount:0,notifications:[],saved:false,websiteUrl:'/',currentPath:'/admin/content/new',currentType:type,adminIcon,entry:{type,title:'',body:'',summary:'',metadata:{},status:'draft'},blogCategories:type==='news'?newsCategories:categories,media:[]}));
}catch(e){next(e);}});
for(const [type,catalog] of [['blog',categories],['news',newsCategories]]){
 const base=`/admin/${type}-categories`;
 app.get(base,(req,res)=>res.json({categories:catalog}));
 const create=(req,res)=>{categoryPosts++;assert.equal(req.body._csrf,'fixture');const name=req.body.name;if(name==='Fixture error')return res.status(422).json({error:'Use a different category name.'});let category=catalog.find(c=>c.name.toLowerCase()===name.toLowerCase());const existing=!!category;if(!category){category={id:catalog.length+1,name};catalog.push(category);}if(req.path.endsWith('/manage'))return res.redirect(base+'/manage?saved=1');res.status(existing?200:201).json({category,existing});};
 app.post(base,multer().none(),create);app.post(base+'/manage',multer().none(),create);
 app.get(base+'/manage',async(req,res,next)=>{try{res.send(await ejs.renderFile(path.join(root,'views/publishing-categories.ejs'),{title:'Category management',user:{id:1,name:'Studio Editor',role:'editor'},csrf:'fixture',unreadCount:0,notifications:[],saved:false,websiteUrl:'/',currentPath:req.path,currentType:type,adminIcon,categoryType:type,categoryLabel:type==='blog'?'Blog':'News',categoryBase:base,search:'',categoryRows:catalog.map(category=>({...category,uses:saved.filter(post=>post.type===type&&[post.category_ids].flat().includes(String(category.id))).length}))}));}catch(error){next(error);}});
 app.post(base+'/:id/delete',multer().none(),(req,res)=>{const index=catalog.findIndex(category=>String(category.id)===req.params.id);assert.ok(index>=0);catalog.splice(index,1);res.redirect(base+'/manage?saved=1');});
 app.post(`/admin/${type}/save`,multer().none(),(req,res)=>{saved.push(req.body);res.json({ok:true,message:'Blog fixture saved.'});});
}
const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));
const screenshots=await mkdtemp(path.join(tmpdir(),'kemsor-blog-categories-'));
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
 await page.goto(`http://127.0.0.1:${server.address().port}/admin/category-check`);
 const opener=page.getByRole('button',{name:'Create category',exact:true}),dialog=page.getByRole('dialog',{name:'Create blog category',exact:true});
 await page.locator('[data-blog-category-picker]>summary').click();await page.getByText('No categories saved yet. Create your first category using the button above.',{exact:true}).waitFor();assert.equal(await page.locator('input[name=category]').count(),0);
 await page.getByLabel('Blog title',{exact:true}).fill('My unsaved studio story');await page.getByRole('textbox',{name:'Content',exact:true}).fill('Unsaved formatted story content');
 await opener.click();await dialog.getByLabel('Category name',{exact:true}).fill('  ');await dialog.getByRole('button',{name:'Save category',exact:true}).click();await page.getByText('Enter a category name.',{exact:true}).waitFor();assert.equal(categoryPosts,0);
 await dialog.getByLabel('Category name',{exact:true}).fill('Fixture error');await dialog.getByRole('button',{name:'Save category',exact:true}).click();await page.getByText('Use a different category name.',{exact:true}).waitFor();assert.equal(await dialog.getByLabel('Category name',{exact:true}).inputValue(),'Fixture error');
 await dialog.getByLabel('Category name',{exact:true}).fill('Behind the scenes');await dialog.getByRole('button',{name:'Save category',exact:true}).click();await dialog.waitFor({state:'hidden'});
 assert.equal(saved.length,0);assert.equal(await page.getByLabel('Blog title',{exact:true}).inputValue(),'My unsaved studio story');assert.equal(await page.getByRole('textbox',{name:'Content',exact:true}).innerText(),'Unsaved formatted story content');assert.equal(await page.getByRole('checkbox',{name:'Behind the scenes',exact:true}).isChecked(),true);assert.equal(await opener.evaluate(n=>n===document.activeElement),true);
 await opener.click();await dialog.getByLabel('Category name',{exact:true}).fill('Production guides');await dialog.getByRole('button',{name:'Save category',exact:true}).click();await dialog.waitFor({state:'hidden'});assert.equal(await page.locator('input[name=category_ids]:checked').count(),2);
 await opener.click();await dialog.getByLabel('Category name',{exact:true}).fill('BEHIND THE SCENES');await dialog.getByRole('button',{name:'Save category',exact:true}).click();await dialog.waitFor({state:'hidden'});assert.equal(await page.locator('input[name=category_ids]').count(),2);assert.equal(categories.length,2);
 await opener.click();await dialog.getByLabel('Category name',{exact:true}).fill('Cancelled category');await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});assert.equal(categories.length,2);
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:1000});await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await opener.click();assert.equal(await dialog.getByRole('button',{name:'Save category',exact:true}).evaluate(n=>getComputedStyle(n).backgroundColor),'rgb(0, 171, 132)');assert.equal(await dialog.getByRole('button',{name:'Save category',exact:true}).evaluate(n=>getComputedStyle(n).color),'rgb(255, 255, 255)');
  await page.screenshot({path:path.join(screenshots,`category-dialog-${width}.png`),fullPage:true});await dialog.getByRole('button',{name:'Cancel',exact:true}).click();
 }
 await page.setViewportSize({width:1440,height:1000});await page.locator('[data-preview-content]').click();const preview=page.getByRole('dialog',{name:'Unsaved publishing preview'});await preview.waitFor();assert.match(await preview.locator('iframe').getAttribute('srcdoc'),/Behind the scenes · Production guides/);await preview.getByRole('button',{name:'Close preview'}).click();
 await page.getByRole('button',{name:'Save draft',exact:true}).click();await page.getByText('Blog fixture saved.',{exact:true}).waitFor();assert.equal(saved.length,1);assert.deepEqual(saved[0].category_ids,['1','2']);assert.equal(saved[0].category,undefined);assert.equal(saved[0].categories_present,'1');assert.deepEqual(errors,[]);
 const base=`http://127.0.0.1:${server.address().port}`;
 for(const type of ['blog','news']){
  await page.goto(base+`/admin/${type}-categories/manage`);await page.getByLabel('Category name',{exact:true}).fill(`Unused ${type} category`);await page.getByRole('button',{name:'Save category',exact:true}).click();await page.waitForLoadState('load');
  const row=page.getByRole('row').filter({hasText:`Unused ${type} category`});await row.waitFor();
  for(const width of [1440,390]){await page.setViewportSize({width,height:1000});await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:path.join(screenshots,`${type}-category-management-${width}.png`),fullPage:true});}
  page.once('dialog',confirm=>confirm.accept());await row.getByRole('button',{name:'Delete',exact:true}).click();await page.waitForLoadState('load');await page.waitForFunction(text=>!document.querySelector('tbody').textContent.includes(text),`Unused ${type} category`);
 }
 await page.goto(base+'/admin/category-check?type=news');assert.equal(await page.locator('select[name=category]').count(),0);await page.locator('[data-blog-category-picker]>summary').click();await page.getByRole('button',{name:'Create category',exact:true}).click();
 const newsDialog=page.getByRole('dialog',{name:'Create news category',exact:true});await newsDialog.getByLabel('Category name',{exact:true}).fill('Custom news category');await newsDialog.getByRole('button',{name:'Save category',exact:true}).click();await newsDialog.waitFor({state:'hidden'});assert.equal(await page.getByRole('checkbox',{name:'Custom news category'}).isChecked(),true);assert.ok(!categories.some(category=>category.name==='Custom news category'));
 await page.getByLabel('News title',{exact:true}).fill('My unsaved news story');await page.getByRole('button',{name:'Save draft',exact:true}).click();await page.getByText('Blog fixture saved.',{exact:true}).waitFor();assert.equal(saved.at(-1).type,'news');assert.ok(saved.at(-1).category_ids);assert.deepEqual(errors,[]);
 console.log('Passed: empty catalog, checkbox-only saved selections, popup validation/error/retry, creation and duplicate reuse without saving the blog, unsaved content preserved, Cancel/Escape focus, multiple categories in preview and save, green/white Save button, 320px mobile layout, separate blog/news management pages, protected-use messaging, and confirmed category deletion.');console.log('Screenshots:',screenshots);
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
