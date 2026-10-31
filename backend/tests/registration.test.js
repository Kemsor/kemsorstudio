import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import mysql from 'mysql2/promise';
import request from 'supertest';
import {readFile,readdir} from 'node:fs/promises';
import departments from '../../shared/professional-roles.json' with {type:'json'};
import {createApp} from '../src/app.js';
import {rows} from '../src/db.js';
import {hashPassword} from '../src/security.js';
import {newSecret,sealSecret,totp} from '../src/mfa.js';
let connection,db,app,admin,adminCsrf,ipIndex=1;
const database=`kemsor_registration_test_${process.pid}`;
const options={host:process.env.DB_HOST||'127.0.0.1',socketPath:process.env.DB_SOCKET||undefined,user:process.env.DB_MIGRATION_USER||'root',password:process.env.DB_MIGRATION_PASSWORD||'',timezone:'Z',dateStrings:true};
const password='Registration-test-password-2026!';
function client(){const agent=request.agent(app),ip=`192.0.2.${ipIndex++}`;return {agent,ip};}
async function post(client,path,body){const csrf=await client.agent.get('/api/csrf').set('X-Forwarded-For',client.ip);return client.agent.post(path).set('X-Forwarded-For',client.ip).set('X-CSRF-Token',csrf.body.token).send(body);}
const body=(email,extra={})=>({name:'Registration test member',email,password,role:'artist',adult:true,consent:true,...extra});
before(async()=>{
 connection=await mysql.createConnection(options);await connection.query(`CREATE DATABASE \`${database}\``);db=mysql.createPool({...options,database});
 for(const name of (await readdir(new URL('../migrations/',import.meta.url))).filter(v=>/^\d.*\.sql$/.test(v)).sort()){
  const sql=await readFile(new URL(`../migrations/${name}`,import.meta.url),'utf8');for(const statement of sql.split(';').map(v=>v.trim()).filter(Boolean))await db.query(statement);
 }
 // Distinct test clients exercise the real per-IP limiter without changing production settings.
 app=createApp(db,{cookieName:'registration.test',dummyHash:await hashPassword('dummy-registration-password')});app.set('trust proxy','loopback');
 const secret=newSecret();await rows(db,'INSERT INTO cms_users(name,email,password_hash,role,mfa_secret) VALUES(?,?,?,?,?)',['Registration admin','registration-admin@example.test',await hashPassword(password),'admin',sealSecret(secret)]);
 admin=request.agent(app);const token=(await admin.get('/api/csrf')).body.token;await admin.post('/admin/login').type('form').send({_csrf:token,email:'registration-admin@example.test',password}).expect(302);
 adminCsrf=(await admin.get('/api/csrf')).body.token;
});
after(async()=>{await db?.end();if(connection){assert.match(database,/^kemsor_registration_test_\d+$/);await connection.query(`DROP DATABASE IF EXISTS \`${database}\``);await connection.end();}});
test('Artists can register, edit their profile, log out/in and appear only after consent and admin approval',async()=>{
 const account=client();await post(account,'/api/talent/register',body('ARTIST-REGISTRATION@example.test')).then(res=>assert.equal(res.status,201));
 const user=(await account.agent.get('/api/talent/session')).body.user;assert.equal(user.email,'artist-registration@example.test');assert.equal(user.role,'artist');assert.equal(user.status,'pending');assert.equal(user.visible,0);assert.equal(user.password_hash,undefined);
 await account.agent.get('/api/talent/workspace').expect(200);
 await post(account,'/api/talent/profile',{name:'Artist registration fixture',profession:'Actor',city:'Dehradun',languages:'Hindi, English',skills:'Acting',bio:'Isolated automated test',visible:true}).then(res=>assert.equal(res.status,200));
 assert.equal((await request(app).get('/api/talent')).body.people.length,0);
 const review=await admin.get(`/admin/talent/${user.id}`).expect(200);assert.match(review.text,/Artist registration fixture/);
 await admin.post(`/admin/talent/${user.id}`).type('form').send({_csrf:adminCsrf,status:'approved',contact_checked:'on'}).expect(302);
 const listing=(await request(app).get('/api/talent?city=Dehradun&profession=Actor&language=Hindi')).body;assert.equal(listing.people[0].id,user.id);assert.equal(listing.people[0].email,undefined);
 await post(account,'/api/talent/logout',{}).then(res=>assert.equal(res.status,200));assert.equal((await account.agent.get('/api/talent/session')).body.user,null);
 await post(account,'/api/talent/login',{email:'artist-registration@example.test',password}).then(res=>assert.equal(res.status,200));assert.equal((await account.agent.get('/api/talent/session')).body.user.id,user.id);
 await post(account,'/api/talent/profile',{name:'Artist registration fixture',visible:false}).then(res=>assert.equal(res.status,200));assert.equal((await request(app).get('/api/talent')).body.people.length,0);
});
test('All 42 filmmaking roles across all eight departments register, retain their specialty and receive a workspace',async()=>{
 let count=0;
 for(const department of departments)for(const role of department.roles){
  const account=client(),email=`professional-${++count}@example.test`;
  const response=await post(account,'/api/talent/register',body(email,{role:'hirer',department:department.name,specialty:role.name}));assert.equal(response.status,201,`${role.name}: ${JSON.stringify(response.body)}`);
  let user=(await account.agent.get('/api/talent/session')).body.user;assert.equal(user.department,department.name);assert.equal(user.specialty,role.name);assert.equal(user.profession,role.name);assert.equal(user.status,'pending');
  await account.agent.get('/api/talent/workspace').expect(200);await account.agent.get('/api/talent').expect(200);
  await post(account,'/api/talent/profile',{name:user.name,department:department.name,specialty:role.name,organisation:'Test studio',bio:'Test professional profile'}).then(res=>assert.equal(res.status,200,role.name));
  await post(account,'/api/talent/logout',{}).then(res=>assert.equal(res.status,200));await post(account,'/api/talent/login',{email,password}).then(res=>assert.equal(res.status,200,role.name));
  user=(await account.agent.get('/api/talent/session')).body.user;assert.equal(user.specialty,role.name);
  const review=await admin.get(`/admin/talent/${user.id}`).expect(200);assert.ok(review.text.includes(department.name.replaceAll('&','&amp;')));assert.ok(review.text.includes(role.name.replaceAll('&','&amp;').replaceAll(' / ',' / ')));
 }
 assert.equal(departments.length,8);assert.equal(count,42);
 const dashboard=await admin.get('/admin').expect(200);assert.match(dashboard.text,/All registrations/);assert.match(dashboard.text,/43/);
 const list=await admin.get('/admin/talent?role=hirer&per_page=100').expect(200);assert.match(list.text,/42 matching registrations/);
});
test('Registration rejects invalid roles, mismatched specialties, missing consent, duplicates and forged submissions',async()=>{
 const invalid=[{role:'admin'},{consent:false},{adult:false},{password:'short'},{role:'hirer'},{role:'hirer',department:'Camera Department',specialty:'Producer'},{role:'artist',department:departments[0].name,specialty:'Director'}];
 for(let index=0;index<invalid.length;index++)await post(client(),'/api/talent/register',body(`invalid-${index}@example.test`,invalid[index])).then(res=>assert.equal(res.status,422));
 const duplicate=await post(client(),'/api/talent/register',body('artist-registration@example.test'));assert.equal(duplicate.status,422);
 await request(app).post('/api/talent/register').send(body('forged@example.test')).expect(403);
 const account=client();await post(account,'/api/talent/login',{email:'professional-1@example.test',password}).then(res=>assert.equal(res.status,200));
 await post(account,'/api/talent/profile',{name:'Test',department:'',specialty:''}).then(res=>assert.equal(res.status,422));
 await post(account,'/api/talent/profile',{name:'Test',department:'Camera Department',specialty:'Producer'}).then(res=>assert.equal(res.status,422));
 await post(account,'/api/talent/login',{email:'professional-1@example.test',password:'wrong-password'}).then(res=>assert.equal(res.status,401));
});
test('Registrations retain the five-per-hour limit and studio approval requirements',async()=>{
 const account=client();for(let index=0;index<5;index++)await post(account,'/api/talent/register',body(`limited-${index}@example.test`,{consent:false})).then(res=>assert.equal(res.status,422));
 await post(account,'/api/talent/register',body('limited-final@example.test')).then(res=>assert.equal(res.status,429));
 const professional=client();await post(professional,'/api/talent/login',{email:'professional-1@example.test',password}).then(res=>assert.equal(res.status,200));
 await post(professional,'/api/talent/enquiries',{artistId:1,project:'Test',message:'Test'}).then(res=>assert.equal(res.status,403));
});
