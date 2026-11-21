// Real publishing/media templates and scripts, served with fixture data. No database writes.
import assert from 'node:assert/strict';
import careerOptions from '../../shared/career-editor-options.json' with {type:'json'};
import express from 'express';
import multer from 'multer';
import ejs from 'ejs';
import {chromium} from 'playwright';
import {mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {adminIcon} from '../src/icons.js';
import {richTextHtml,richTextPlain} from '../public/rich-text-core.js';
const backend=path.resolve(import.meta.dirname,'..'),app=express(),posts=[];
app.use((req,res,next)=>{res.set('Content-Security-Policy',"default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'self'");if(req.method==='POST')posts.push(req.path);next();});
app.use(express.static(path.join(backend,'public')));app.use(express.urlencoded({extended:false}));
const locals={title:'Publishing tools check',user:{id:1,name:'Test Editor',role:'editor'},csrf:'fixture-token',unreadCount:0,notifications:[],websiteUrl:'/',currentType:'blog',types:{blog:'Blog',news:'Newsroom',career:'Career opportunity'},saved:false,adminIcon,richTextHtml,careerOptions};
const rich={version:1,type:'doc',children:[{type:'h2',children:[{type:'text',text:'A formatted heading'}]},{type:'p',children:[{type:'strong',children:[{type:'text',text:'Bold text'}]},{type:'text',text:' and '},{type:'em',children:[{type:'text',text:'italic text'}]}]},{type:'ul',children:[{type:'li',children:[{type:'text',text:'First item'}]}]},{type:'p',children:[{type:'a',href:'https://example.com/read-more',children:[{type:'text',text:'Example link'}]}]}]};
const media=[{id:1,original_name:'sunrise.webp',mime:'image/webp',alt:'Sunrise over the film set',size:2048,url:'/media/1',uses:1,content_uses:1,people_uses:0,website_uses:0,revision_uses:0},{id:2,original_name:'portrait.webp',mime:'image/webp',alt:'',size:1024,url:'/media/2',uses:0,content_uses:0,people_uses:0,website_uses:0,revision_uses:0},{id:3,original_name:'trailer.mp4',mime:'video/mp4',alt:'Production trailer',size:2097152,url:'/media/3/video.mp4',uses:1,content_uses:1,people_uses:0,website_uses:0,revision_uses:0},{id:4,original_name:'press-release.pdf',mime:'application/pdf',alt:'Approved release',size:1024,url:'/media/4/document.pdf',uses:0,content_uses:0,people_uses:0,website_uses:0,revision_uses:0}];
const imageFiles=()=>media.filter(file=>file.mime.startsWith('image/'));
const entry=type=>({id:1,type,title:'An unsaved <story>',summary:'A summary for readers.',body:richTextPlain(rich),image_id:1,status:'draft',metadata:{rich_text:rich,category:type==='news'?'General':'Studio notes',role:'',location:''}});
const render=(name,data)=>ejs.renderFile(path.join(backend,'views',name+'.ejs'),{...locals,...data});
app.get('/admin/content/new',async(req,res,next)=>{try{const type=['blog','news','career','production'].includes(req.query.type)?req.query.type:'blog';res.send(await render(type==='production'?'edit':type+'-edit',{currentPath:'/admin/content/new',currentType:type,entry:entry(type),blogCategories:type==='news'?[{id:1,name:'General',selected:true},{id:2,name:'Press Releases'}]:[],media:imageFiles()}));}catch(error){next(error);}});
app.get('/admin/content/1/preview',async(req,res,next)=>{try{res.send(await render('content-preview',{currentPath:req.path,entry:entry('blog'),image:{alt:media[0].alt}}));}catch(error){next(error);}});
app.get('/admin/media/images.json',(_req,res)=>res.json({images:imageFiles()}));
app.get('/admin/media',async(req,res,next)=>{try{const kind=req.query.kind||'',search=req.query.q||'',format=req.query.format||'',usage=req.query.usage||'';const files=media.filter(file=>(!kind||(kind==='image'?file.mime.startsWith('image/'):file.mime===({video:'video/mp4',document:'application/pdf',captions:'text/vtt'})[kind]))&&(!format||file.mime===format)&&(!search||`${file.original_name} ${file.alt}`.toLowerCase().includes(search.toLowerCase()))&&(!usage||(usage==='used'?file.uses>0:!file.uses)));res.send(await render('media',{currentPath:req.path,media:files,search,format,usage,kind,saved:req.query.saved==='1'}));}catch(error){next(error);}});
app.post('/admin/media/:id/description',multer().none(),(req,res)=>{const file=media.find(file=>file.id===Number(req.params.id));file.alt=req.body.alt;res.redirect('/admin/media?saved=1');});
app.get('/api/csrf',(_req,res)=>res.json({token:'fixture-token'}));
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAEUlEQVQImWN4O83kPwgzwBgAYgIK2V6WzBUAAAAASUVORK5CYII=','base64');
app.get('/media/:id',(_req,res)=>res.type('png').send(png));
app.post('/admin/media/upload',multer().any(),(_req,res)=>res.status(201).json({id:55,name:'new-image.png',alt:'New uploaded image',url:'/media/55'}));
const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));const base=`http://127.0.0.1:${server.address().port}`;
const screenshots=await mkdtemp(path.join(tmpdir(),'kemsor-publishing-tools-'));let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',error=>errors.push(error.message));page.on('dialog',dialog=>dialog.accept());
 for(const type of ['blog','news','production']){
  await page.goto(base+'/admin/content/new?type='+type);await page.locator('.media-upload-stage').first().waitFor();
  assert.equal(await page.getByRole('button',{name:'Choose image',exact:true}).count(),0);assert.equal(await page.locator('select[name=image_id]').isVisible(),false);
  const stage=page.locator('[data-media-for=image_id]');if(type==='production')await stage.evaluate(n=>window.adminRevealField(n));
  const file=type==='production'?stage.locator('input[type=file]'):page.locator('input[type=file][name=image]');
  await file.setInputFiles({name:'new-image.png',mimeType:'image/png',buffer:png});
  if(type==='production')await stage.locator('input[type=text]').fill('New uploaded image');else await page.locator('[data-banner-alt]').fill('New uploaded image');
  await stage.getByRole('button',{name:'Upload image',exact:true}).click();await stage.getByText('Uploaded successfully. You can now save the rest of the form.',{exact:true}).waitFor();assert.equal(await page.locator('select[name=image_id]').inputValue(),'55');
  if(type==='production'){
   await page.locator('[data-production-section=media]>summary').click();await page.locator('[data-gallery-add]').click();const row=page.locator('[data-gallery-rows]>fieldset');await row.locator('.media-upload-stage').waitFor();assert.equal(await row.locator('[data-gallery-field=media_id]').isVisible(),false);await row.locator('input[type=file]').setInputFiles({name:'gallery.png',mimeType:'image/png',buffer:png});await row.locator('.media-upload-stage input[type=text]').fill('Gallery image');await row.locator('[data-gallery-field=alt]').fill('Gallery image');await row.getByRole('button',{name:'Upload image',exact:true}).click();await row.getByText('Uploaded successfully. You can now save the rest of the form.',{exact:true}).waitFor();assert.equal(JSON.parse(await page.locator('[data-gallery-value]').inputValue())[0].media_id,'55');
   const collection=page.locator('[data-production-collection]').filter({has:page.locator('[name=production_media]')});await collection.locator('[data-collection-add]').click();await collection.locator('.media-upload-stage').first().waitFor();assert.equal(await collection.locator('[data-record-asset]').count(),0);assert.equal(await collection.getByRole('button',{name:'Upload image',exact:true}).count(),1);assert.equal(await collection.getByRole('button',{name:'Upload video',exact:true}).count(),1);
  }
 }
 assert.deepEqual(errors,[]);console.log('Passed: no library selectors, direct blog/news/production uploads, gallery uploads serialize, and dynamic production records have upload controls.');
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
