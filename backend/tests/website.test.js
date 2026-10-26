import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import express from 'express';
import request from 'supertest';
import {website} from '../src/website.js';

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
