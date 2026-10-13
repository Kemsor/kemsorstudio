import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import mysql from 'mysql2/promise';
import request from 'supertest';
import { readFile, unlink } from 'node:fs/promises';
import { createApp } from '../src/app.js';
import { hashPassword, csrfValid } from '../src/security.js';
import { rows } from '../src/db.js';
let db, root, app, admin, editor, manager, csrfAdmin, csrfEditor, csrfManager;
const database=`kemsor_cms_test_${process.pid}`;
const options={host:process.env.DB_HOST || '127.0.0.1',socketPath:process.env.DB_SOCKET || undefined,user:process.env.DB_MIGRATION_USER || process.env.DB_USER || 'root',password:process.env.DB_MIGRATION_PASSWORD || '',timezone:'Z',dateStrings:true};
async function login(role){
 const agent=request.agent(app), token=(await agent.get('/api/csrf')).body.token;
 await agent.post('/admin/login').type('form').send({_csrf:token,email:`${role}@test.local`,password:'A-secure-test-password'}).expect(302);
 return [agent,(await agent.get('/api/csrf')).body.token];
}
before(async()=>{
 root=await mysql.createConnection(options);
 assert.match(database,/^kemsor_cms_test_\d+$/);
 await root.query(`CREATE DATABASE \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
 db=mysql.createPool({...options,database,connectionLimit:4});
 const sql=await readFile(new URL('../migrations/001_phase_one.sql',import.meta.url),'utf8');
 for(const statement of sql.split(';').map(s=>s.trim()).filter(Boolean))await db.query(statement);
 const notificationSql=await readFile(new URL('../migrations/002_notifications.sql',import.meta.url),'utf8');
 for(const statement of notificationSql.split(';').map(s=>s.trim()).filter(Boolean))await db.query(statement);
 const talentSql=await readFile(new URL('../migrations/003_talent_network.sql',import.meta.url),'utf8');
 for(const statement of talentSql.split(';').map(s=>s.trim()).filter(Boolean))await db.query(statement);
 for(const role of ['admin','editor','enquiry_manager'])await rows(db,'INSERT INTO cms_users(name,email,password_hash,role) VALUES(?,?,?,?)',[role,`${role}@test.local`,await hashPassword('A-secure-test-password'),role]);
 app=createApp(db,{cookieName:'kemsor.test',dummyHash:await hashPassword('dummy-test-password')});
 [admin,csrfAdmin]=await login('admin');[editor,csrfEditor]=await login('editor');[manager,csrfManager]=await login('enquiry_manager');
});
after(async()=>{if(db){const files=await rows(db,'SELECT filename FROM cms_media');for(const file of files)await unlink(new URL(`../storage/uploads/${file.filename}`,import.meta.url)).catch(()=>{});}await db?.end();if(root){assert.match(database,/^kemsor_cms_test_\d+$/);await root.query(`DROP DATABASE IF EXISTS \`${database}\``);await root.end();}});
test('CSRF comparison rejects missing or mismatched values',()=>{assert.equal(csrfValid('abc','abd'),false);assert.equal(csrfValid('abc',undefined),false);assert.equal(csrfValid('abc','abc'),true);});
test('Unauthenticated admin requests are redirected and mutations require CSRF',async()=>{
 await request(app).get('/admin/enquiries').expect(302).expect('Location','/admin/login');
 await admin.post('/admin/content/save').type('form').send({type:'news',title:'Bad mutation'}).expect(403);
});
test('All admin screens render, and role restrictions are enforced',async()=>{
 for(const url of ['/admin','/admin/content?type=blog','/admin/content/new?type=team','/admin/media','/admin/enquiries','/admin/settings','/admin/users','/admin/password','/admin/audit','/admin/notifications','/admin/talent','/admin/talent/enquiries','/admin/talent/projects'])await admin.get(url).expect(200);
 await editor.get('/admin/settings').expect(403);await editor.get('/admin/enquiries').expect(403);await manager.get('/admin/content').expect(403);
});
test('Drafts remain private, publishing reaches the API, and archiving removes them',async()=>{
 const item={_csrf:csrfEditor,type:'news',title:'<script>alert(1)</script>',slug:'test-draft',summary:'A draft',body:'Private draft',status:'draft'};
 await editor.post('/admin/content/save').type('form').send(item).expect(302);
 const entry=(await rows(db,'SELECT * FROM cms_entries WHERE slug=?',['test-draft']))[0];
 assert.equal((await request(app).get('/api/site')).body.entries.length,0);
 await editor.get(`/admin/content/${entry.id}`).expect(200).then(res=>assert.ok(res.text.includes('&lt;script&gt;')));
 await editor.post('/admin/content/save').type('form').send({...item,id:entry.id,status:'published'}).expect(302);
 const response=await request(app).get('/api/site').expect(200);assert.equal(response.body.entries[0].body,'Private draft');assert.equal(response.body.entries[0].created_by,undefined);
 await editor.post(`/admin/content/${entry.id}/archive`).type('form').send({_csrf:csrfEditor}).expect(302);
 assert.equal((await request(app).get('/api/site')).body.entries.length,0);
});
test('Invalid content slugs and duplicate slugs are rejected',async()=>{
 const item={_csrf:csrfEditor,type:'blog',title:'Example',slug:'../unsafe',status:'draft'};
 await editor.post('/admin/content/save').type('form').send(item).expect(422);
 await editor.post('/admin/content/save').type('form').send({...item,slug:'unique-slug'}).expect(302);
 await editor.post('/admin/content/save').type('form').send({...item,slug:'unique-slug'}).expect(422);
});
test('Settings require an approved notice to enable enquiries and validate social URLs',async()=>{
 await admin.post('/admin/settings').type('form').send({_csrf:csrfAdmin,enquiries_enabled:'on'}).expect(422);
 await admin.post('/admin/settings').type('form').send({_csrf:csrfAdmin,facebook:'https://evil.example/profile'}).expect(422);
 await admin.post('/admin/settings').type('form').send({_csrf:csrfAdmin,enquiries_enabled:'on',privacy_notice:'Synthetic test notice',consent_version:'test-v1',instagram:'https://www.instagram.com/test/'}).expect(302);
});
test('Enquiries require consent, record notice version, and support follow-up',async()=>{
 const guest=request.agent(app),token=(await guest.get('/api/csrf')).body.token;
 const enquiry={category:'business',name:'Synthetic Test',email:'synthetic@example.test',subject:'Test enquiry',message:'Test only',consent:false};
 await guest.post('/api/enquiries').set('X-CSRF-Token',token).send(enquiry).expect(422);
 const result=await guest.post('/api/enquiries').set('X-CSRF-Token',token).send({...enquiry,consent:true}).expect(201);assert.match(result.body.reference,/^KEM-\d{6}$/);
 const row=(await rows(db,'SELECT * FROM cms_enquiries'))[0];assert.equal(row.consent_version,'test-v1');assert.equal(row.status,'new');
 await manager.get(`/admin/enquiries/${row.id}`).expect(200);
 await manager.post(`/admin/enquiries/${row.id}`).type('form').send({_csrf:csrfManager,status:'contacted',note:'Followed up in test'}).expect(302);
 assert.equal((await rows(db,'SELECT status FROM cms_enquiries WHERE id=?',[row.id]))[0].status,'contacted');assert.equal((await rows(db,'SELECT COUNT(*) AS total FROM cms_enquiry_notes'))[0].total,1);
 const site=(await request(app).get('/api/site')).body;assert.equal(site.enquiries,undefined);
 await manager.post(`/admin/enquiries/${row.id}/delete`).type('form').send({_csrf:csrfManager}).expect(403);
 await admin.post(`/admin/enquiries/${row.id}/delete`).type('form').send({_csrf:csrfAdmin}).expect(302);
 assert.equal((await rows(db,'SELECT COUNT(*) AS total FROM cms_enquiry_notes'))[0].total,0);
});
test('Uploads reject active formats and forged image files',async()=>{
 await editor.post('/admin/media').field('_csrf',csrfEditor).field('alt','Bad image').attach('image',Buffer.from('<svg><script>bad</script></svg>'),{filename:'bad.svg',contentType:'image/svg+xml'}).expect(422);
 await editor.post('/admin/media').field('_csrf',csrfEditor).field('alt','Fake image').attach('image',Buffer.from('<html>not an image</html>'),{filename:'fake.png',contentType:'image/png'}).expect(422);
 assert.equal((await rows(db,'SELECT COUNT(*) AS total FROM cms_media'))[0].total,0);
});
test('Valid images are public while enquiry attachments require staff access',async()=>{
 const image=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a9ksAAAAASUVORK5CYII=','base64');
 await editor.post('/admin/media').field('_csrf',csrfEditor).field('alt','Synthetic test image').attach('image',image,{filename:'test.png',contentType:'image/png'}).expect(302);
 const media=(await rows(db,'SELECT * FROM cms_media'))[0];await request(app).get(`/media/${media.id}`).expect(200).expect('Content-Type',/image\/png/);
 await admin.post('/admin/settings').type('form').send({_csrf:csrfAdmin,enquiries_enabled:'on',attachments_enabled:'on',privacy_notice:'Synthetic test notice',consent_version:'test-v1'}).expect(302);
 const guest=request.agent(app),token=(await guest.get('/api/csrf')).body.token;
 await guest.post('/api/enquiries').set('X-CSRF-Token',token).field('category','general').field('name','Attachment Test').field('email','file@example.test').field('subject','Private file').field('message','Synthetic attachment').field('consent','true').attach('attachment',Buffer.from('%PDF-1.4\nSynthetic test\n%%EOF'),{filename:'private.pdf',contentType:'application/pdf'}).expect(201);
 const enquiry=(await rows(db,'SELECT * FROM cms_enquiries'))[0];
 await request(app).get(`/admin/enquiries/${enquiry.id}/attachment`).expect(302);
 await editor.get(`/admin/enquiries/${enquiry.id}/attachment`).expect(403);
 await manager.get(`/admin/enquiries/${enquiry.id}/attachment`).expect(200).expect('Content-Disposition',/attachment/);
 await admin.post(`/admin/enquiries/${enquiry.id}/delete`).type('form').send({_csrf:csrfAdmin}).expect(302);
});
test('Login throttles repeated invalid passwords',async()=>{
 const guest=request.agent(app),token=(await guest.get('/api/csrf')).body.token;
 for(let index=0;index<5;index++)await guest.post('/admin/login').type('form').send({_csrf:token,email:'absent@test.local',password:'wrong'}).expect(401);
 await guest.post('/admin/login').type('form').send({_csrf:token,email:'absent@test.local',password:'wrong'}).expect(429);
});
test('Dashboard cards and notification routes respect each role',async()=>{
 const adminDashboard=await admin.get('/admin').expect(200);assert.match(adminDashboard.text,/Big ideas/);assert.match(adminDashboard.text,/Recent content/);
 const editorDashboard=await editor.get('/admin').expect(200);assert.doesNotMatch(editorDashboard.text,/Latest conversations/);
 const managerDashboard=await manager.get('/admin').expect(200);assert.doesNotMatch(managerDashboard.text,/Recent content/);
 await admin.get('/admin/notifications').expect(200);await editor.get('/admin/notifications').expect(200);await manager.get('/admin/notifications').expect(200);
 const all=await admin.get('/admin/content?type=all&status=draft').expect(200);assert.match(all.text,/unique-slug/);
});
test('Notification reads persist per user and cannot mark inaccessible notifications',async()=>{
 const result=await rows(db,'INSERT INTO cms_enquiries(category,name,email,subject,message,consent_at,consent_version) VALUES(?,?,?,?,?,UTC_TIMESTAMP(),?)',['general','Notification Test','notification@example.test','Private notification subject','Synthetic only','test-v1']);
 const key=`enquiry:${result.insertId}`;
 const editorItems=(await editor.get('/admin/notifications.json').expect(200)).body.items;
 assert.ok(!editorItems.some(n=>n.key===key));
 await editor.post('/admin/notifications/read').type('form').send({_csrf:csrfEditor,key}).expect(404);
 let items=(await manager.get('/admin/notifications.json').expect(200)).body.items;assert.equal(items.find(n=>n.key===key).read,false);
 await manager.post('/admin/notifications/read').type('form').send({_csrf:csrfManager,key}).expect(302);
 items=(await manager.get('/admin/notifications.json')).body.items;assert.equal(items.find(n=>n.key===key).read,true);
 const adminItems=(await admin.get('/admin/notifications.json')).body.items;assert.equal(adminItems.find(n=>n.key===key).read,false);
 await admin.post('/admin/notifications/read').type('form').send({key:'all'}).expect(403);
 await admin.post('/admin/notifications/read').type('form').send({_csrf:csrfAdmin,key:'all'}).expect(302);
 assert.equal((await admin.get('/admin/notifications.json')).body.unread,0);
 await admin.post(`/admin/enquiries/${result.insertId}/delete`).type('form').send({_csrf:csrfAdmin}).expect(302);
});
test('Self-disable is rejected and disabled users lose access immediately',async()=>{
 const current=(await rows(db,'SELECT id FROM cms_users WHERE role="admin"'))[0];
 await admin.post(`/admin/users/${current.id}/toggle`).type('form').send({_csrf:csrfAdmin}).expect(422);
 const e=(await rows(db,'SELECT id FROM cms_users WHERE role="editor"'))[0];
 await admin.post(`/admin/users/${e.id}/toggle`).type('form').send({_csrf:csrfAdmin}).expect(302);
 await editor.get('/admin/content').expect(302);
});

test('Talent registration, review, directory privacy, enquiries and private projects work end to end',async()=>{
 async function post(agent,url,data){const csrf=(await agent.get('/api/csrf')).body.token;return agent.post(url).set('X-CSRF-Token',csrf).send(data);}
 const artist=request.agent(app),hirer=request.agent(app),other=request.agent(app);
 await post(artist,'/api/talent/register',{name:'Test Artist',email:'artist@example.test',password:'A-long-member-password',role:'admin',adult:true,consent:true}).then(r=>assert.equal(r.status,422));
 for(const [a,role,email]of [[artist,'artist','artist@example.test'],[hirer,'hirer','hirer@example.test'],[other,'hirer','other@example.test']])await post(a,'/api/talent/register',{name:`Test ${role}`,email,password:'A-long-member-password',role,adult:true,consent:true}).then(r=>assert.equal(r.status,201));
 const a=(await artist.get('/api/talent/session')).body.user,h=(await hirer.get('/api/talent/session')).body.user;
 await post(artist,'/api/talent/profile',{name:'Test Artist',profession:'Actor',city:'Mumbai',languages:'Hindi',skills:'Dance',bio:'Synthetic test profile',visible:true}).then(r=>assert.equal(r.status,200));
 assert.equal((await request(app).get('/api/talent')).body.people.length,0);
 await post(hirer,`/api/talent/shortlists/${a.id}`,{}).then(r=>assert.equal(r.status,403));
 const image=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a9ksAAAAASUVORK5CYII=','base64');
 const photoCsrf=(await artist.get('/api/csrf')).body.token;
 await artist.post('/api/talent/photo').set('X-CSRF-Token',photoCsrf).attach('image',image,{filename:'portrait.png',contentType:'image/png'}).expect(200);
 const photoId=(await artist.get('/api/talent/session')).body.user.image_id;
 await request(app).get(`/media/${photoId}`).expect(404);
 await artist.get(`/media/${photoId}`).expect(200);
 const review=await admin.get('/admin/talent').expect(200);
 const filtered=await admin.get('/admin/talent?q=artist%40example.test&role=artist&status=pending').expect(200);assert.match(filtered.text,/Test Artist/);assert.doesNotMatch(filtered.text,/hirer@example.test/);
 const alerts=(await admin.get('/admin/notifications.json')).body.items;assert.ok(alerts.some(n=>n.key.startsWith(`talent:${a.id}:`)));
 assert.ok(!(await manager.get('/admin/notifications.json')).body.items.some(n=>n.key.startsWith('talent:')));
 assert.match(review.text,/Test Artist/);
 for(const id of [a.id,h.id])await admin.post(`/admin/talent/${id}`).type('form').send({_csrf:csrfAdmin,status:'approved',contact_checked:'on'}).expect(302);
 await request(app).get(`/media/${photoId}`).expect(200);
 const directory=(await request(app).get('/api/talent?city=Mumbai')).body.people;assert.equal(directory.length,1);assert.equal(directory[0].email,undefined);assert.equal(directory[0].password_hash,undefined);
 await post(hirer,`/api/talent/shortlists/${a.id}`,{}).then(r=>assert.equal(r.status,200));
 assert.equal((await hirer.get('/api/talent/workspace')).body.saved[0].id,a.id);
 await post(hirer,'/api/talent/enquiries',{artistId:a.id,project:'Test production',message:'Synthetic enquiry'}).then(r=>assert.equal(r.status,201));
 const enquiry=(await artist.get('/api/talent/workspace')).body.enquiries[0];assert.equal(enquiry.project,'Test production');
 await post(other,`/api/talent/enquiries/${enquiry.id}`,{status:'interested'}).then(r=>assert.equal(r.status,404));
 await post(artist,`/api/talent/enquiries/${enquiry.id}`,{status:'interested'}).then(r=>assert.equal(r.status,200));
 await artist.get('/api/production/projects').expect(403);
 await post(artist,'/api/production/projects',{title:'Artist blocked'}).then(r=>assert.equal(r.status,403));
 const created=await post(hirer,'/api/production/projects',{title:'Private Test Film',budget:50000,currency:'INR',timeline:'10 days',script_text:'INT. ROOM - DAY'});assert.equal(created.status,201);const id=created.body.id;
 await other.get(`/api/production/projects/${id}`).expect(404);
 await artist.get(`/api/production/projects/${id}`).expect(403);
 await artist.get(`/api/production/projects/${id}/script`).expect(403);
 await post(artist,`/api/production/projects/${id}/plan`,{notes:'blocked'}).then(r=>assert.equal(r.status,403));
 await post(artist,`/api/production/projects/${id}/script`,{}).then(r=>assert.equal(r.status,403));
 await post(other,`/api/production/projects/${id}/plan`,{notes:'wrong owner'}).then(r=>assert.equal(r.status,404));
 await post(hirer,`/api/production/projects/${id}/plan`,{breakdown:'Scene 1: Room',notes:'Reviewed manually'}).then(r=>assert.equal(r.status,200));
 const project=(await hirer.get(`/api/production/projects/${id}`)).body;assert.equal(project.project.plan.breakdown,'Scene 1: Room');assert.equal(project.analysisAvailable,false);
 await post(artist,'/api/talent/logout',{}).then(r=>assert.equal(r.status,200));
 await artist.get('/api/production/projects').expect(401);
 await post(artist,'/api/talent/login',{email:'artist@example.test',password:'A-long-member-password'}).then(r=>assert.equal(r.status,200));
 assert.equal((await artist.get('/api/talent/session')).body.user.id,a.id);
 await admin.get('/admin/talent/enquiries').expect(200).then(r=>assert.match(r.text,/Test production/));
 await admin.get('/admin/talent/projects').expect(200).then(r=>{assert.match(r.text,/Private Test Film/);assert.doesNotMatch(r.text,/INT. ROOM - DAY/);});
 for(const path of ['/admin/talent','/admin/talent/enquiries','/admin/talent/projects'])await manager.get(path).expect(403);
 await admin.post('/admin/talent/999999').type('form').send({_csrf:csrfAdmin,status:'pending'}).expect(404);
 await admin.post(`/admin/talent/${a.id}`).type('form').send({_csrf:csrfAdmin,status:'suspended'}).expect(302);
 assert.equal((await artist.get('/api/talent/session')).body.user,null);
 await post(artist,'/api/talent/login',{email:'artist@example.test',password:'A-long-member-password'}).then(r=>assert.equal(r.status,401));
 const events=await rows(db,"SELECT action FROM cms_audit WHERE target_type='talent' AND target_id=?",[String(a.id)]);assert.ok(events.some(e=>e.action==='register'));assert.ok(events.some(e=>e.action==='member_login'));
 
});


test('Every publishing module saves and publishes through the shared editor',async()=>{
 for(const type of ['news','blog','career','team','home','page','legal']){
  await admin.get(`/admin/content?type=${type}`).expect(200);
  await admin.get(`/admin/content/new?type=${type}`).expect(200);
  await admin.post('/admin/content/save').type('form').send({_csrf:csrfAdmin,type,title:`Module ${type}`,slug:`module-${type}`,summary:'Module verification',body:'Test content',status:'published',page:type==='legal'?'legal':'about'}).expect(302);
  const entry=(await request(app).get('/api/site')).body.entries.find(e=>e.slug===`module-${type}`);assert.ok(entry);assert.equal(entry.type,type);
 }
});

test('Registration pagination reaches records beyond the old 200 limit',async()=>{
 const hash=await hashPassword('Pagination-test-password');
 for(let i=0;i<205;i++)await rows(db,'INSERT INTO talent_accounts(name,email,password_hash,role) VALUES(?,?,?,?)',[`Pagination ${i}`,`page${i}@example.test`,hash,i%2?'hirer':'artist']);
 const first=await admin.get('/admin/talent?q=Pagination').expect(200);assert.match(first.text,/205 matching registrations/);assert.doesNotMatch(first.text,/page0@example.test/);
 const last=await admin.get('/admin/talent?q=Pagination&page=9').expect(200);assert.match(last.text,/page0@example.test/);
 const past=await admin.get('/admin/talent?q=Pagination&page=999').expect(200);assert.match(past.text,/Page 9 of 9/);
});
