import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import express from 'express';
import request from 'supertest';
import {website,websiteNotFound} from '../src/website.js';

test('Unified hosting serves website pages while preserving API and admin routes',async()=>{
 const directory=await mkdtemp(path.join(tmpdir(),'kemsor-website-'));
 try{
  await writeFile(path.join(directory,'index.html'),'<h1>Studio</h1>');
  await mkdir(path.join(directory,'press-media'));
  await writeFile(path.join(directory,'press-media/index.html'),'<h1>Press & Media</h1>');
  await mkdir(path.join(directory,'api'));
  await writeFile(path.join(directory,'api/site'), 'must not shadow the API');
  const app=express();app.use(website(directory));
  app.get('/api/site',(req,res)=>res.json({entries:[]}));
  app.get('/admin/login',(req,res)=>res.send('CMS login'));
  await request(app).get('/').expect(200).expect('Cache-Control','no-cache');
  await request(app).get('/press-media/').expect(200).then(r=>assert.match(r.text,/Press & Media/));
  await request(app).get('/api/site').expect(200,{entries:[]});
  await request(app).get('/admin/login').expect(200,'CMS login');
  await request(app).get('/.env').expect(404);
  await request(app).get('/missing-page/').expect(404);
 }finally{await rm(directory,{recursive:true,force:true});}
});

test('Public missing pages use the themed document with a genuine 404 status',async()=>{
 const directory=await mkdtemp(path.join(tmpdir(),'kemsor-404-'));
 try{
  await writeFile(path.join(directory,'index.html'),'<h1>Studio</h1>');
  await writeFile(path.join(directory,'404.html'),'<h1>Scene not found</h1><a href="/">Return home</a>');
  const app=express();app.use(website(directory));
  app.get('/api/check',(req,res)=>res.json({ok:true}));
  app.get('/admin/login',(req,res)=>res.send('CMS login'));
  app.use(websiteNotFound(directory));app.use((req,res)=>res.status(404).send('Original fallback'));
  for(const url of ['/missing-page/','/missing/nested/path/','/missing-page/?from=old-link']){
   await request(app).get(url).set('Accept','text/html').expect(404).expect('X-Robots-Tag','noindex, follow').expect('Cache-Control','no-cache').then(res=>assert.match(res.text,/Scene not found/));
  }
  await request(app).head('/missing-page/').expect(404).then(res=>assert.equal(res.text,undefined));
  for(const url of ['/api/missing','/admin/missing','/media/missing','/assets/missing.webp'])await request(app).get(url).expect(404,'Original fallback');
  await request(app).get('/missing-page/').set('Accept','application/json').expect(404,'Original fallback');
  await request(app).post('/missing-page/').expect(404,'Original fallback');
  await request(app).get('/api/check').expect(200,{ok:true});
  await request(app).get('/admin/login').expect(200,'CMS login');
 }finally{await rm(directory,{recursive:true,force:true});}
});
