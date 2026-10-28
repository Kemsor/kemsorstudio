import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import mysql from 'mysql2/promise';
import request from 'supertest';
import { readFile, unlink } from 'node:fs/promises';
import { createApp } from '../src/app.js';
import { recoverAdmin } from '../src/admin-recovery.js';
import { hashPassword, csrfValid } from '../src/security.js';
import { rows, createPool, settings } from '../src/db.js';
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
 const partnerSql=await readFile(new URL('../migrations/004_media_partners.sql',import.meta.url),'utf8');
 for(const statement of partnerSql.split(';').map(s=>s.trim()).filter(Boolean))await db.query(statement);
 const applicationsSql=await readFile(new URL('../migrations/005_career_applications.sql',import.meta.url),'utf8');
 for(const statement of applicationsSql.split(';').map(s=>s.trim()).filter(Boolean))await db.query(statement);
 const recruitmentSql=await readFile(new URL('../migrations/006_recruitment_tools.sql',import.meta.url),'utf8');
 for(const statement of recruitmentSql.split(';').map(s=>s.trim()).filter(Boolean))await db.query(statement);
 const historySql=await readFile(new URL('../migrations/007_notification_history.sql',import.meta.url),'utf8');
 for(const statement of historySql.split(';').map(s=>s.trim()).filter(Boolean))await db.query(statement);
 const diagnosticsSql=await readFile(new URL('../migrations/010_email_delivery_diagnostics.sql',import.meta.url),'utf8');
 const mailSql=await readFile(new URL('../migrations/009_email_outbox.sql',import.meta.url),'utf8');
 for(const statement of mailSql.split(';').map(s=>s.trim()).filter(Boolean))await db.query(statement);
 for(const statement of diagnosticsSql.split(';').map(s=>s.trim()).filter(Boolean))await db.query(statement);
 const trackingSql=await readFile(new URL('../migrations/011_email_message_tracking.sql',import.meta.url),'utf8');
 for(const statement of trackingSql.split(';').map(s=>s.trim()).filter(Boolean))await db.query(statement);
 for(const role of ['admin','editor','enquiry_manager'])await rows(db,'INSERT INTO cms_users(name,email,password_hash,role) VALUES(?,?,?,?)',[role,`${role}@test.local`,await hashPassword('A-secure-test-password'),role]);
 app=createApp(db,{cookieName:'kemsor.test',dummyHash:await hashPassword('dummy-test-password'),smtpEnvironment:{SMTP_ENABLED:'true',SMTP_HOST:'smtp.example.test',SMTP_USER:'test@example.test',SMTP_PASSWORD:'synthetic-secret'},mailTransport:{verify:async()=>true}});
 [admin,csrfAdmin]=await login('admin');[editor,csrfEditor]=await login('editor');[manager,csrfManager]=await login('enquiry_manager');
});
after(async()=>{if(db){const resumes=await rows(db,'SELECT resume_filename FROM career_applications');for(const file of resumes)await unlink(new URL(`../storage/career-resumes/${file.resume_filename}`,import.meta.url)).catch(()=>{});const files=await rows(db,'SELECT filename FROM cms_media');for(const file of files)await unlink(new URL(`../storage/uploads/${file.filename}`,import.meta.url)).catch(()=>{});}await db?.end();if(root){assert.match(database,/^kemsor_cms_test_\d+$/);await root.query(`DROP DATABASE IF EXISTS \`${database}\``);await root.end();}});
test('CSRF comparison rejects missing or mismatched values',()=>{assert.equal(csrfValid('abc','abd'),false);assert.equal(csrfValid('abc',undefined),false);assert.equal(csrfValid('abc','abc'),true);});
test('Footer copy migration replaces old defaults and preserves custom content',async()=>{
 const sql=await readFile(new URL('../migrations/012_footer_enquiry_copy.sql',import.meta.url),'utf8');
 const updated='For production enquiries and collaborations,\nget in touch with the studio.';
 for(const value of [
  'From the first idea to the finished frame.\nBring us your story. We’ll find the next step.',
  'From the first idea to the finished frame.\nBring us your story — we’ll find the next step.',
  'Studio-approved custom footer copy',
 ]){
  await rows(db,'INSERT INTO cms_settings(name,value) VALUES(?,?) ON DUPLICATE KEY UPDATE value=VALUES(value)',['footer_description',JSON.stringify(value)]);
  for(const statement of sql.split(';').map(s=>s.trim()).filter(Boolean))await db.query(statement);
  const config=await settings(db);
  assert.equal(config.footer_description,value.startsWith('From the first idea')?updated:value);
 }
 await rows(db,'DELETE FROM cms_settings WHERE name=?',['footer_description']);
});
test('Unauthenticated admin requests are redirected and mutations require CSRF',async()=>{
 await request(app).get('/admin/enquiries').expect(302).expect('Location','/admin/login');
 await admin.post('/admin/content/save').type('form').send({type:'news',title:'Bad mutation'}).expect(403);
});
test('All admin screens render, and role restrictions are enforced',async()=>{
 for(const url of ['/admin','/admin/content?type=blog','/admin/content/new?type=team','/admin/media','/admin/enquiries','/admin/settings','/admin/users','/admin/profile','/admin/password','/admin/audit','/admin/notifications','/admin/talent','/admin/talent/enquiries','/admin/talent/projects'])await admin.get(url).expect(200);
 await editor.get('/admin/settings').expect(403);await editor.get('/admin/enquiries').expect(403);await manager.get('/admin/content').expect(403);
});
test('My profile shows only the signed-in account for every CMS role',async()=>{
 await request(app).get('/admin/profile').expect(302).expect('Location','/admin/login');
 for(const [agent,email,label] of [[admin,'admin@test.local','Administrator'],[editor,'editor@test.local','Editor'],[manager,'enquiry_manager@test.local','Enquiry manager']]){
  const page=await agent.get('/admin/profile?userId=999').expect(200);
  assert.match(page.text,new RegExp(email));assert.ok(page.text.includes(label));
  assert.match(page.text,/Member since/);assert.match(page.text,/name="confirm"/);
  for(const other of ['admin@test.local','editor@test.local','enquiry_manager@test.local'].filter(value=>value!==email))assert.ok(!page.text.includes(other));
  assert.ok(!page.text.includes('scrypt:'));assert.ok(!page.text.includes('A-secure-test-password'));
 }
});

test('Profile password change validates input, rotates the session, and signs out other sessions',async()=>{
 await rows(db,'INSERT INTO cms_users(name,email,password_hash,role) VALUES(?,?,?,?)',['Profile user','profile-user@test.local',await hashPassword('A-secure-test-password'),'editor']);
 const [account,csrf]=await login('profile-user');
 const [otherSession]=await login('profile-user');
 const newPassword='A-new-test-password-2026';
 const payload={_csrf:csrf,current:'A-secure-test-password',password:newPassword,confirm:newPassword};
 await account.post('/admin/password').type('form').send({...payload,_csrf:'invalid'}).expect(403);
 await account.post('/admin/password').type('form').send({...payload,current:'Wrong-password'}).expect(422);
 await account.post('/admin/password').type('form').send({...payload,confirm:'Different-password'}).expect(422);
 await account.post('/admin/password').type('form').send({...payload,password:'short',confirm:'short'}).expect(422);
 await account.post('/admin/password').type('form').send(payload).expect(302).expect('Location','/admin/profile?saved=1#password');
 await account.get('/admin/profile').expect(200);
 await otherSession.get('/admin/profile').expect(302).expect('Location','/admin/login');
 const fresh=(await account.get('/api/csrf')).body.token;assert.notEqual(fresh,csrf);
 const guest=request.agent(app),token=(await guest.get('/api/csrf')).body.token;
 await guest.post('/admin/login').type('form').send({_csrf:token,email:'profile-user@test.local',password:'A-secure-test-password'}).expect(401);
 await guest.post('/admin/login').type('form').send({_csrf:token,email:'profile-user@test.local',password:newPassword}).expect(302);
 const events=await rows(db,"SELECT id FROM cms_audit WHERE action='change_password' AND user_id=(SELECT id FROM cms_users WHERE email=?)",['profile-user@test.local']);assert.equal(events.length,1);
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
 const receipt=(await rows(db,'SELECT * FROM cms_email_outbox WHERE receipt_key=?',[result.body.reference]))[0];assert.equal(receipt.recipient,enquiry.email);assert.equal(receipt.status,'pending');assert.ok(receipt.body.includes('get back to you'));
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
 const adminDashboard=await admin.get('/admin').expect(200);assert.match(adminDashboard.text,/Manage your studio/);assert.match(adminDashboard.text,/Recent content/);
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
 await manager.post('/admin/notifications/read').set('Accept','application/json').type('form').send({_csrf:csrfManager,key}).expect(200).then(response=>assert.equal(response.body.ok,true));
 items=(await manager.get('/admin/notifications.json')).body.items;assert.equal(items.find(n=>n.key===key).read,true);
 const adminItems=(await admin.get('/admin/notifications.json')).body.items;assert.equal(adminItems.find(n=>n.key===key).read,false);
 await admin.post('/admin/notifications/read').type('form').send({key:'all'}).expect(403);
 await admin.post('/admin/notifications/read').type('form').send({_csrf:csrfAdmin,key:'all'}).expect(302);
 assert.equal((await admin.get('/admin/notifications.json')).body.unread,0);
 const readPage=await manager.get('/admin/notifications?view=read&kind=enquiry').expect(200);assert.match(readPage.text,/notification-inbox-row is-read/);
 const unreadPage=await manager.get('/admin/notifications?view=unread&kind=enquiry').expect(200);assert.ok(!unreadPage.text.includes('notification-inbox-row is-read'));
 await manager.get('/admin/notifications?view=unread&kind=application').expect(200);
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
 for(const type of ['news','blog','career','team','home','page','legal','media_partner']){
  await admin.get(`/admin/content?type=${type}`).expect(200);
  await admin.get(`/admin/content/new?type=${type}`).expect(200);
  await admin.post('/admin/content/save').type('form').send({_csrf:csrfAdmin,type,title:`Module ${type}`,slug:`module-${type.replaceAll("_","-")}`,summary:'Module verification',body:'Test content',status:'published',page:type==='legal'?'legal':'about'}).expect(302);
  const entry=(await request(app).get('/api/site')).body.entries.find(e=>e.slug===`module-${type.replaceAll("_","-")}`);assert.ok(entry);assert.equal(entry.type,type);
 }
});

test('Registration pagination reaches records beyond the old 200 limit',async()=>{
 const hash=await hashPassword('Pagination-test-password');
 for(let i=0;i<205;i++)await rows(db,'INSERT INTO talent_accounts(name,email,password_hash,role) VALUES(?,?,?,?)',[`Pagination ${i}`,`page${i}@example.test`,hash,i%2?'hirer':'artist']);
 const first=await admin.get('/admin/talent?q=Pagination').expect(200);assert.match(first.text,/205 matching registrations/);assert.doesNotMatch(first.text,/page0@example.test/);
 const last=await admin.get('/admin/talent?q=Pagination&page=9').expect(200);assert.match(last.text,/page0@example.test/);
 const past=await admin.get('/admin/talent?q=Pagination&page=999').expect(200);assert.match(past.text,/Page 9 of 9/);
});

test('Blog deletion requires publishing access and CSRF, and removes the public post',async()=>{
 const result=await rows(db,'INSERT INTO cms_entries(type,title,slug,summary,body,metadata,status,published_at) VALUES("blog","Delete test","delete-blog-test","Summary","Body",?,"published",UTC_TIMESTAMP())',[JSON.stringify({})]);
 const id=result.insertId;
 await admin.post(`/admin/content/${id}/delete`).expect(403);
 await manager.post(`/admin/content/${id}/delete`).type('form').send({_csrf:csrfManager}).expect(403);
 await admin.post(`/admin/content/${id}/delete`).type('form').send({_csrf:csrfAdmin}).expect(302);
 assert.equal((await rows(db,'SELECT id FROM cms_entries WHERE id=?',[id])).length,0);
 assert.ok(!(await request(app).get('/api/site')).body.entries.some(entry=>entry.id===id));
 await admin.post(`/admin/content/${id}/delete`).type('form').send({_csrf:csrfAdmin}).expect(404);
 const nonBlog=await rows(db,'INSERT INTO cms_entries(type,title,slug,summary,body,metadata) VALUES("news","Retain news","retain-news-test","Summary","Body",?)',[JSON.stringify({})]);
 await admin.post(`/admin/content/${nonBlog.insertId}/delete`).type('form').send({_csrf:csrfAdmin}).expect(422);
 assert.equal((await rows(db,'SELECT id FROM cms_entries WHERE id=?',[nonBlog.insertId])).length,1);
});

test('Slugs generate from titles, handle duplicates, and remain stable on edits',async()=>{
 for(const type of ['blog','career','news','team','home','page','legal','media_partner']){
  const data={_csrf:csrfAdmin,type,title:'Café & Studio: New Story!',status:'draft',page:'about'};
  await admin.post('/admin/content/save').type('form').send(data).expect(302);
  await admin.post('/admin/content/save').type('form').send(data).expect(302);
  const items=await rows(db,'SELECT id,slug FROM cms_entries WHERE type=? AND title=? ORDER BY id',[type,data.title]);
  assert.deepEqual(items.map(item=>item.slug),['cafe-studio-new-story','cafe-studio-new-story-2']);
  await admin.post('/admin/content/save').type('form').send({...data,id:items[0].id,title:'Changed title'}).expect(302);
  assert.equal((await rows(db,'SELECT slug FROM cms_entries WHERE id=?',[items[0].id]))[0].slug,items[0].slug);
 }
 await admin.post('/admin/content/save').type('form').send({_csrf:csrfAdmin,type:'blog',title:'🎬',status:'draft'}).expect(302);
 assert.equal((await rows(db,'SELECT slug FROM cms_entries WHERE title=?',['🎬']))[0].slug,'content');
});

test('Dedicated blog editor uploads banners and cannot publish other content types',async()=>{
 const form=await admin.get('/admin/content/new?type=blog').expect(200);
 assert.match(form.text,/Upload banner/);assert.ok(form.text.includes('action="/admin/blog/save"'));
 for(const name of ['category','role','location','page','author'])assert.ok(!form.text.includes(`name="${name}"`));
 await admin.post('/admin/blog/save').type('form').send({_csrf:csrfAdmin,type:'news',title:'Wrong form',status:'draft'}).expect(422);
 const image=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a9ksAAAAASUVORK5CYII=','base64');
 await admin.post('/admin/blog/save').field('_csrf',csrfAdmin).field('type','blog').field('title','Banner upload post').field('body','Blog body').field('status','published').field('banner_alt','Test banner description').attach('image',image,{filename:'blog-banner.png',contentType:'image/png'}).expect(302);
 const post=(await request(app).get('/api/site')).body.entries.find(entry=>entry.slug==='banner-upload-post');
 assert.ok(post.image_url);assert.equal(post.image_alt,'Test banner description');assert.equal(post.type,'blog');
 await request(app).get(post.image_url).expect(200);
 await admin.post('/admin/blog/save').field('_csrf',csrfAdmin).field('type','blog').field('title','Invalid banner post').field('status','draft').field('banner_alt','Bad banner').attach('image',Buffer.from('<html>fake</html>'),{filename:'fake.png',contentType:'image/png'}).expect(422);
});

test('Career editor is dedicated and page management respects publishing permissions',async()=>{
 const form=await admin.get('/admin/content/new?type=career').expect(200);
 assert.ok(form.text.includes('action="/admin/career/save"'));assert.ok(form.text.includes('Role details'));
 for(const name of ['page','author','image_id'])assert.ok(!form.text.includes(`name="${name}"`));
 await admin.post('/admin/career/save').type('form').send({_csrf:csrfAdmin,type:'blog',title:'Wrong content',status:'draft'}).expect(422);
 await admin.post('/admin/career/save').type('form').send({_csrf:csrfAdmin,type:'career',title:'Dedicated role',summary:'Role summary',body:'Responsibilities',role:'Freelance',location:'Remote',category:'Production',status:'draft',publish_action:'published'}).expect(302);
 const role=(await request(app).get('/api/site')).body.entries.find(entry=>entry.slug==='dedicated-role');assert.equal(role.type,'career');assert.equal(role.metadata.location,'Remote');assert.equal(role.metadata.page,undefined);
 const hub=await admin.get('/admin/pages').expect(200);assert.match(hub.text,/Website pages/);assert.match(hub.text,/USERS & MEMBERS/);assert.match(hub.text,/ENQUIRIES/);
 await manager.get('/admin/pages').expect(403);
 const pageForm=await admin.get('/admin/content/new?type=page&page=services').expect(200);assert.match(pageForm.text,/<option selected>services/);
 await admin.get('/admin/content?type=page&page=services').expect(200);
 assert.match(hub.text,/page=how-we-work/);
 const workForm=await admin.get('/admin/content/new?type=page&page=how-we-work').expect(200);assert.match(workForm.text,/<option selected>how-we-work/);
 await admin.post('/admin/content/save').type('form').send({_csrf:csrfAdmin,type:'page',title:'How We Work test section',body:'Additional client-approved content',page:'how-we-work',status:'draft'}).expect(302);
 const workList=await admin.get('/admin/content?type=page&page=how-we-work').expect(200);assert.match(workList.text,/How We Work test section/);
 const serviceList=await admin.get('/admin/content?type=page&page=services').expect(200);assert.ok(!serviceList.text.includes('How We Work test section'));
 assert.match(hub.text,/page=india-production-services/);
 const indiaForm=await admin.get('/admin/content/new?type=page&page=india-production-services').expect(200);assert.match(indiaForm.text,/<option selected>india-production-services/);
 await admin.post('/admin/content/save').type('form').send({_csrf:csrfAdmin,type:'page',title:'India Production Services test section',body:'Additional client-approved India content',page:'india-production-services',status:'draft'}).expect(302);
 const indiaList=await admin.get('/admin/content?type=page&page=india-production-services').expect(200);assert.match(indiaList.text,/India Production Services test section/);assert.ok(!indiaList.text.includes('How We Work test section'));
 assert.match(hub.text,/page=feature-films/);
 const featureForm=await admin.get('/admin/content/new?type=page&page=feature-films').expect(200);assert.match(featureForm.text,/<option selected>feature-films/);
 await admin.post('/admin/content/save').type('form').send({_csrf:csrfAdmin,type:'page',title:'Feature Films test section',body:'Additional client-approved feature content',page:'feature-films',status:'draft'}).expect(302);
 const featureList=await admin.get('/admin/content?type=page&page=feature-films').expect(200);assert.match(featureList.text,/Feature Films test section/);assert.ok(!featureList.text.includes('India Production Services test section'));
 assert.match(hub.text,/page=short-films/);
 const shortForm=await admin.get('/admin/content/new?type=page&page=short-films').expect(200);assert.match(shortForm.text,/<option selected>short-films/);
 await admin.post('/admin/content/save').type('form').send({_csrf:csrfAdmin,type:'page',title:'Short Films test section',body:'Additional client-approved short film content',page:'short-films',status:'draft'}).expect(302);
 const shortList=await admin.get('/admin/content?type=page&page=short-films').expect(200);assert.match(shortList.text,/Short Films test section/);assert.ok(!shortList.text.includes('Feature Films test section'));
 assert.match(hub.text,/page=series-ott/);
 const seriesForm=await admin.get('/admin/content/new?type=page&page=series-ott').expect(200);assert.match(seriesForm.text,/<option selected>series-ott/);
 await admin.post('/admin/content/save').type('form').send({_csrf:csrfAdmin,type:'page',title:'Series OTT test section',body:'Additional client-approved series content',page:'series-ott',status:'draft'}).expect(302);
 const seriesList=await admin.get('/admin/content?type=page&page=series-ott').expect(200);assert.match(seriesList.text,/Series OTT test section/);assert.ok(!seriesList.text.includes('Short Films test section'));
 assert.match(hub.text,/page=documentaries/);
 const documentaryForm=await admin.get('/admin/content/new?type=page&page=documentaries').expect(200);assert.match(documentaryForm.text,/<option selected>documentaries/);
 await admin.post('/admin/content/save').type('form').send({_csrf:csrfAdmin,type:'page',title:'Documentaries test section',body:'Additional client-approved documentary content',page:'documentaries',status:'draft'}).expect(302);
 const documentaryList=await admin.get('/admin/content?type=page&page=documentaries').expect(200);assert.match(documentaryList.text,/Documentaries test section/);assert.ok(!documentaryList.text.includes('Series OTT test section'));
});

test('Career applications submit privately and are reviewed by enquiry staff',async()=>{
 const career=await rows(db,'INSERT INTO cms_entries(type,title,slug,summary,body,metadata,status,published_at) VALUES("career","Application role","application-role","Summary","Details",?,"published",UTC_TIMESTAMP())',[JSON.stringify({})]);
 const guest=request.agent(app),csrf=(await guest.get('/api/csrf')).body.token;
 const send=()=>guest.post(`/api/careers/${career.insertId}/applications`).set('X-CSRF-Token',csrf).field('name','Test applicant').field('email','applicant@example.test').field('phone','1234567890').field('city','Mumbai').field('experience','Two years').field('message','Test application').field('consent','true');
 const response=await send().attach('attachment',Buffer.from('%PDF-1.4 Test resume'),{filename:'resume.pdf',contentType:'application/pdf'}).expect(201);assert.match(response.body.reference,/APP-/);
 const application=(await rows(db,'SELECT * FROM career_applications WHERE email=?',['applicant@example.test']))[0];
 await guest.get(`/admin/applications/${application.id}/resume`).expect(302);
 await admin.get(`/admin/applications/${application.id}`).expect(200).then(r=>assert.match(r.text,/Test applicant/));
 await manager.get(`/admin/applications/${application.id}/resume`).expect(200).expect('Content-Disposition',/attachment/);
 await manager.post(`/admin/applications/${application.id}`).type('form').send({_csrf:csrfManager,status:'shortlisted'}).expect(302);
 assert.equal((await rows(db,'SELECT status FROM career_applications WHERE id=?',[application.id]))[0].status,'shortlisted');
 const publicSite=await request(app).get('/api/site');assert.ok(!publicSite.text.includes('applicant@example.test'));assert.ok(!publicSite.text.includes(application.resume_filename));
 await send().attach('attachment',Buffer.from('<script>bad</script>'),{filename:'fake.pdf',contentType:'application/pdf'}).expect(422);
 await rows(db,'UPDATE cms_entries SET status="archived" WHERE id=?',[career.insertId]);await send().expect(404);
});
test('Member lists filter roles and detail pages never expose password hashes',async()=>{
 const accounts=await rows(db,'SELECT id,role,name FROM talent_accounts ORDER BY id LIMIT 2');
 for(const role of ['artist','hirer'])await admin.get(`/admin/talent?role=${role}`).expect(200).then(r=>assert.match(r.text,/View/));
 for(const account of accounts)await admin.get(`/admin/talent/${account.id}`).expect(200).then(r=>{assert.ok(r.text.includes(account.name));assert.ok(!r.text.includes('scrypt:'));});
 await manager.get(`/admin/talent/${accounts[0].id}`).expect(403);
});

test('Enhanced admin forms return field errors without saving invalid content',async()=>{
 const form=await admin.get('/admin/content/new?type=blog').expect(200);assert.match(form.text,/admin-ui.css/);
 const badTitle=await admin.post('/admin/blog/save').set('Accept','application/json').type('form').send({_csrf:csrfAdmin,type:'blog',title:'',summary:'Keep this summary',body:'Keep my draft body',status:'draft'}).expect(422);
 assert.ok(badTitle.body.fields.title);
 const image=await admin.post('/admin/blog/save').set('Accept','application/json').field('_csrf',csrfAdmin).field('type','blog').field('title','Failed upload should not save').field('body','Preserved body').field('status','draft').field('banner_alt','Banner').attach('image',Buffer.from('<html>fake</html>'),{filename:'bad.png',contentType:'image/png'}).expect(422);
 assert.ok(image.body.fields.image);assert.equal((await rows(db,'SELECT id FROM cms_entries WHERE title=?',['Failed upload should not save'])).length,0);
 await admin.post('/admin/blog/save').set('Accept','application/json').type('form').send({_csrf:csrfAdmin,type:'blog',title:'Enhanced save',body:'Saved draft',status:'draft'}).expect(302).expect('Location','/admin/content?type=blog&saved=1');
});

test('Publishing previews remain private and draft actions do not publish',async()=>{
 await admin.post('/admin/blog/save').type('form').send({_csrf:csrfAdmin,type:'blog',title:'Private preview',body:'<script>not executable</script>',status:'published',publish_action:'draft'}).expect(302);
 const entry=(await rows(db,'SELECT id,status FROM cms_entries WHERE title=?',['Private preview']))[0];assert.equal(entry.status,'draft');
 await request(app).get(`/admin/content/${entry.id}/preview`).expect(302);
 await manager.get(`/admin/content/${entry.id}/preview`).expect(403);
 const preview=await admin.get(`/admin/content/${entry.id}/preview`).expect(200);assert.match(preview.text,/&lt;script&gt;not executable&lt;\/script&gt;/);assert.match(preview.text,/Private publishing preview/);
 assert.ok(!(await request(app).get('/api/site')).body.entries.some(item=>item.id===entry.id));
 const editor=await admin.get(`/admin/content/${entry.id}`).expect(200);assert.match(editor.text,/Preview changes/);assert.match(editor.text,/Save selected status/);
 await admin.post('/admin/blog/save').type('form').send({_csrf:csrfAdmin,type:'blog',id:entry.id,title:'Private preview',status:'draft',publish_action:'published'}).expect(302);
 assert.equal((await rows(db,'SELECT status FROM cms_entries WHERE id=?',[entry.id]))[0].status,'published');
});

test('Dedicated news editor handles banners, previews, and publishing without unrelated fields',async()=>{
 const form=await admin.get('/admin/content/new?type=news').expect(200);assert.ok(form.text.includes('action="/admin/news/save"'));assert.match(form.text,/Upload banner/);assert.match(form.text,/Preview changes/);
 for(const name of ['category','role','location','page','author'])assert.ok(!form.text.includes(`name="${name}"`));
 await admin.post('/admin/news/save').type('form').send({_csrf:csrfAdmin,type:'career',title:'Wrong form',status:'draft'}).expect(422);
 const image=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a9ksAAAAASUVORK5CYII=','base64');
 await admin.post('/admin/news/save').field('_csrf',csrfAdmin).field('type','news').field('title','Studio news banner').field('body','News text').field('status','published').field('publish_action','draft').field('banner_alt','News banner description').attach('image',image,{filename:'news-banner.png',contentType:'image/png'}).expect(302);
 const draft=(await rows(db,'SELECT id,slug,image_id,status FROM cms_entries WHERE title=?',['Studio news banner']))[0];assert.equal(draft.status,'draft');assert.ok(draft.image_id);
 assert.ok(!(await request(app).get('/api/site')).body.entries.some(e=>e.id===draft.id));
 const edit=await admin.get(`/admin/content/${draft.id}`).expect(200);assert.match(edit.text,/Edit news post/);assert.match(edit.text,/Current news banner/);
 await admin.post('/admin/news/save').type('form').send({_csrf:csrfAdmin,type:'news',id:draft.id,title:'Updated news title',body:'Published news text',image_id:draft.image_id,status:'draft',publish_action:'published'}).expect(302);
 const published=(await request(app).get('/api/site')).body.entries.find(e=>e.id===draft.id);assert.equal(published.slug,draft.slug);assert.equal(published.image_alt,'News banner description');assert.ok(published.image_url);
 await admin.get(`/admin/content/${draft.id}/preview`).expect(200);
 await admin.post('/admin/news/save').set('Accept','application/json').field('_csrf',csrfAdmin).field('type','news').field('title','Invalid news upload').field('status','draft').field('banner_alt','Bad file').attach('image',Buffer.from('fake'),{filename:'fake.png',contentType:'image/png'}).expect(422).then(r=>assert.ok(r.body.fields.image));
});

test('Admin tables sort and paginate filtered records while bulk actions stay permission-checked and atomic',async()=>{
 const ids=[];for(let i=0;i<30;i++){const r=await rows(db,'INSERT INTO cms_entries(type,title,slug,summary,body,metadata,status) VALUES("news",?,?,"","",?,"draft")',[`Table item ${String(i).padStart(2,'0')}`,`table-item-${i}`,JSON.stringify({})]);ids.push(r.insertId);}
 const first=await admin.get('/admin/content?type=news&q=Table%20item&sort=title&dir=asc').expect(200);assert.match(first.text,/Showing 1–25 of 30/);assert.match(first.text,/Table item 00/);assert.ok(!first.text.split('<tbody>')[1].split('</tbody>')[0].includes('Table item 29'));
 const second=await admin.get('/admin/content?type=news&q=Table%20item&sort=title&dir=asc&p=2').expect(200);assert.match(second.text,/Table item 29/);assert.match(second.text,/Showing 26–30 of 30/);
 const descending=await admin.get('/admin/content?type=news&q=Table%20item&sort=title&dir=desc&per_page=50').expect(200);assert.match(descending.text,/Showing 1–30 of 30/);const sortedBody=descending.text.split('<tbody>')[1].split('</tbody>')[0];assert.ok(sortedBody.indexOf('Table item 29')<sortedBody.indexOf('Table item 00'));
 await admin.get('/admin/content?sort=title%3BDROP%20TABLE%20cms_entries&dir=unsafe&per_page=999').expect(200);
 await manager.post('/admin/tables/content/bulk').type('form').send({_csrf:csrfManager,ids:[ids[0]],status:'archived'}).expect(403);
 await admin.post('/admin/tables/content/bulk').type('form').send({ids:[ids[0]],status:'archived'}).expect(403);
 await admin.post('/admin/tables/content/bulk').type('form').send({_csrf:csrfAdmin,ids:[ids[0],999999999],status:'archived'}).expect(422);
 assert.equal((await rows(db,'SELECT status FROM cms_entries WHERE id=?',[ids[0]]))[0].status,'draft');
 await admin.post('/admin/tables/content/bulk').type('form').send({_csrf:csrfAdmin,ids:ids.slice(0,2),status:'archived',return_to:'/admin/content?type=news&q=Table%20item'}).expect(302);
 assert.equal((await rows(db,'SELECT COUNT(*) AS total FROM cms_entries WHERE id IN (?,?) AND status="archived"',ids.slice(0,2)))[0].total,2);
 await admin.post('/admin/tables/content/bulk').type('form').send({_csrf:csrfAdmin,ids:[ids[2]],status:'published'}).expect(422);
 await admin.post('/admin/tables/content/bulk').type('form').send({_csrf:csrfAdmin,ids:[ids[2]],status:'draft',return_to:'https://example.com/'}).expect(422);
 const application=(await rows(db,'SELECT id FROM career_applications LIMIT 1'))[0];await manager.post('/admin/tables/applications/bulk').type('form').send({_csrf:csrfManager,ids:[application.id],status:'reviewing'}).expect(302);
 const enquiryInsert=await rows(db,'INSERT INTO cms_enquiries(category,name,email,subject,message,consent_at,consent_version) VALUES("general","Bulk enquiry","bulk@example.test","Bulk test","Test message",UTC_TIMESTAMP(),"test")');const enquiry={id:enquiryInsert.insertId};await manager.post('/admin/tables/enquiries/bulk').type('form').send({_csrf:csrfManager,ids:[enquiry.id],status:'closed'}).expect(302);
 const member=(await rows(db,'SELECT id FROM talent_accounts LIMIT 1'))[0];await admin.post('/admin/tables/members/bulk').type('form').send({_csrf:csrfAdmin,ids:[member.id],status:'approved'}).expect(422);
 await admin.post('/admin/tables/members/bulk').type('form').send({_csrf:csrfAdmin,ids:[member.id],status:'pending'}).expect(302);
 for(const url of ['/admin/enquiries?sort=name&dir=asc','/admin/applications?sort=opportunity&dir=asc','/admin/talent?sort=name&dir=asc'])await admin.get(url).expect(200);
});

test('Recruitment notes, history and PDF previews stay private and record status changes',async()=>{
 const application=(await rows(db,'SELECT * FROM career_applications LIMIT 1'))[0];
 await manager.post(`/admin/applications/${application.id}`).type('form').send({_csrf:csrfManager,status:'shortlisted',note:'<script>Private interview feedback</script>'}).expect(302);
 assert.equal((await rows(db,'SELECT note FROM career_application_notes WHERE application_id=?',[application.id]))[0].note,'<script>Private interview feedback</script>');
 let history=await rows(db,'SELECT * FROM career_application_history WHERE application_id=? ORDER BY id DESC',[application.id]);assert.equal(history[0].to_status,'shortlisted');
 const count=history.length;await manager.post(`/admin/applications/${application.id}`).type('form').send({_csrf:csrfManager,status:'shortlisted',note:'Second note'}).expect(302);
 assert.equal((await rows(db,'SELECT id FROM career_application_history WHERE application_id=?',[application.id])).length,count);
 const page=await admin.get(`/admin/applications/${application.id}`).expect(200);assert.match(page.text,/&lt;script&gt;Private interview feedback&lt;\/script&gt;/);assert.match(page.text,/Applicant history/);
 await request(app).get(`/admin/applications/${application.id}/resume/preview`).expect(302);
 await manager.get(`/admin/applications/${application.id}/resume/preview`).expect(200).expect('Content-Type',/application\/pdf/).expect('Content-Disposition',/inline/).expect('X-Frame-Options','SAMEORIGIN').expect('Cache-Control','private, no-store');
 const site=await request(app).get('/api/site');assert.ok(!site.text.includes('Private interview feedback'));
 await manager.post('/admin/tables/applications/bulk').type('form').send({_csrf:csrfManager,ids:[application.id],status:'reviewing'}).expect(302);
 history=await rows(db,'SELECT * FROM career_application_history WHERE application_id=? ORDER BY id DESC',[application.id]);assert.equal(history[0].from_status,'shortlisted');assert.equal(history[0].to_status,'reviewing');
});

test('Contact, map and footer settings are editable, validated and publicly available',async()=>{
 const data={_csrf:csrfAdmin,contact_email:'studio@example.test',contact_phone:'+91 12345 67890',contact_address:'Studio building\nMumbai',contact_note:'',map_location:'Mumbai studio address',map_caption:'Visit our studio',footer_kicker:'WORK WITH US',footer_title:'Make your',footer_accent:'next film.',footer_description:'A studio conversation.\nA shared starting point.',footer_cta_label:'Get in touch',footer_copyright:'Kemsor Studios',footer_social_label:'Connect',privacy_notice:'Enquiry privacy notice',consent_version:'test-v1',enquiries_enabled:'on'};
 await admin.post('/admin/settings').type('form').send(data).expect(302);
 const site=(await request(app).get('/api/site')).body;assert.equal(site.settings.contact_email,data.contact_email);assert.equal(site.settings.contact_address,data.contact_address);assert.equal(site.settings.map_location,data.map_location);assert.equal(site.settings.footer_title,data.footer_title);assert.equal(site.settings.contact_note,'');
 const form=await admin.get('/admin/settings').expect(200);assert.match(form.text,/Footer content/);assert.match(form.text,/Location map/);
 await manager.post('/admin/settings').type('form').send({...data,_csrf:csrfManager}).expect(403);
 await admin.post('/admin/settings').set('Accept','application/json').type('form').send({...data,contact_email:'invalid'}).expect(422).then(r=>assert.ok(r.body.fields.contact_email));
 await admin.post('/admin/settings').type('form').send({...data,contact_phone:'<script>'}).expect(422);
 assert.equal((await request(app).get('/api/site')).body.settings.contact_phone,data.contact_phone);
 await admin.post('/admin/settings').type('form').send({...data,map_location:''}).expect(302);assert.equal((await request(app).get('/api/site')).body.settings.map_location,'');
});

 test('Notification history persists and category preferences are private to each account',async()=>{
 const result=await rows(db,'INSERT INTO cms_enquiries(category,name,email,subject,message,consent_at,consent_version) VALUES("general","History test","history@example.test","History enquiry","Test only",UTC_TIMESTAMP(),"test")');
 const key=`enquiry:${result.insertId}`;
 let feed=(await manager.get('/admin/notifications.json').expect(200)).body;
 assert.equal(feed.items.find(item=>item.key===key).active,true);
 await manager.post('/admin/notifications/preferences').type('form').send({_csrf:csrfManager,pref_application:'on',pref_talent:'on'}).expect(302);
 feed=(await manager.get('/admin/notifications.json')).body;
 assert.ok(!feed.items.some(item=>item.key===key));
 assert.ok((await admin.get('/admin/notifications.json')).body.items.some(item=>item.key===key));
 await rows(db,'UPDATE cms_enquiries SET status="closed" WHERE id=?',[result.insertId]);
 const history=await manager.get('/admin/notifications?view=history&kind=enquiry').expect(200);
 assert.match(history.text,/History enquiry/);assert.match(history.text,/Completed/);
 await manager.post('/admin/notifications/preferences').type('form').send({_csrf:csrfManager,pref_enquiry:'on',pref_application:'on'}).expect(302);
 const item=(await manager.get('/admin/notifications.json')).body.items.find(item=>item.key===key);
 assert.equal(item.active,false);assert.equal(item.read,true);
 const prefs=await rows(db,'SELECT category FROM cms_notification_preferences WHERE user_id=(SELECT id FROM cms_users WHERE email=?)',['manager@example.test']);
 assert.ok(!prefs.some(item=>item.category==='talent'));
 });

test('Image library searches, filters, previews and protects referenced images',async()=>{
 const image=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a9ksAAAAASUVORK5CYII=','base64');
 await admin.post('/admin/media').field('_csrf',csrfAdmin).field('alt','Library unique description').attach('image',image,{filename:'library-unique.png',contentType:'image/png'}).expect(302);
 const media=(await rows(db,'SELECT * FROM cms_media WHERE original_name="library-unique.png"'))[0];
 const page=await admin.get('/admin/media?q=Library%20unique&format=image%2Fpng&usage=unused').expect(200);assert.match(page.text,/library-unique.png/);assert.match(page.text,/data-image-preview/);
 const absent=await admin.get('/admin/media?q=Library%20unique&format=image%2Fjpeg').expect(200);assert.ok(!absent.text.includes('library-unique.png'));
 await manager.post(`/admin/media/${media.id}/delete`).type('form').send({_csrf:csrfManager}).expect(403);
 await admin.post(`/admin/media/${media.id}/delete`).type('form').send({}).expect(403);
 const entry=await rows(db,'INSERT INTO cms_entries(type,title,slug,summary,body,metadata,status,image_id) VALUES("blog","Library reference","library-reference","","",?,"draft",?)',['{}',media.id]);
 await admin.post(`/admin/media/${media.id}/delete`).type('form').send({_csrf:csrfAdmin}).expect(409);
 const used=await admin.get('/admin/media?q=Library%20unique&usage=used').expect(200);assert.match(used.text,/In use/);assert.ok(!used.text.includes(`/admin/media/${media.id}/delete`));
 const editorPage=await admin.get(`/admin/content/${entry.insertId}`).expect(200);assert.match(editorPage.text,/data-library-banner/);assert.match(editorPage.text,/data-selected-preview/);
 await rows(db,'DELETE FROM cms_entries WHERE id=?',[entry.insertId]);
 await admin.post(`/admin/media/${media.id}/delete`).type('form').send({_csrf:csrfAdmin}).expect(302);
 assert.equal((await rows(db,'SELECT id FROM cms_media WHERE id=?',[media.id])).length,0);
 await request(app).get(`/media/${media.id}`).expect(404);
});

test('Receipt delivery retries SMTP failures without losing the saved submission',async()=>{
 const {saveWithReceipt,deliverReceipt}=await import('../src/mail.js');
 await rows(db,'DELETE FROM cms_email_outbox');
 const ref=await saveWithReceipt(db,'enquiry','Queue Test','queue@example.test',async()=>({insertId:999999}));
 await assert.rejects(()=>saveWithReceipt(db,'enquiry','Queue Test','queue@example.test',async()=>({insertId:999999})));
 assert.equal((await rows(db,'SELECT COUNT(*) AS total FROM cms_email_outbox'))[0].total,1);
 await deliverReceipt(db,{sendMail:async()=>{throw Object.assign(new Error('Synthetic SMTP outage contains a secret'),{code:'EAUTH',responseCode:535});}},'sender@example.test');
 let mail=(await rows(db,'SELECT * FROM cms_email_outbox WHERE receipt_key=?',[ref]))[0];
 assert.equal(mail.status,'pending');assert.equal(mail.attempts,1);assert.match(mail.last_error,/EAUTH \(535\)/);assert(!mail.last_error.includes('secret'));
 await rows(db,'UPDATE cms_email_outbox SET available_at=UTC_TIMESTAMP() WHERE id=?',[mail.id]);
 const sent=[];
 await deliverReceipt(db,{sendMail:async message=>{sent.push(message);return {messageId:'test-gateway-receipt-123'};}},'sender@example.test');
 mail=(await rows(db,'SELECT * FROM cms_email_outbox WHERE id=?',[mail.id]))[0];
 assert.equal(mail.status,'sent');assert.equal(mail.last_error,null);assert.equal(mail.provider_message_id,'test-gateway-receipt-123');assert.equal(sent.length,1);assert.equal(sent[0].to,'queue@example.test');
 assert.equal(await deliverReceipt(db,{sendMail:async()=>assert.fail('Already sent')},'sender@example.test'),false);
});

test('Email diagnostics and retries are admin-only, CSRF protected and keep secrets private',async()=>{
 await rows(db,'INSERT INTO cms_users(name,email,password_hash,role) VALUES(?,?,?,?)',['Email test editor','email-editor@test.local',await hashPassword('A-secure-test-password'),'editor']);
 const [limited,limitedCsrf]=await login('email-editor');
 await request(app).get('/admin/email').expect(302);
 await limited.get('/admin/email').expect(403);await manager.get('/admin/email').expect(403);
 await admin.post('/admin/email/verify').expect(403);
 const verification=await admin.post('/admin/email/verify').set('Accept','application/json').send({_csrf:csrfAdmin}).expect(200);
 assert.equal(verification.body.redirect,'/admin/email');
 const page=await admin.get('/admin/email').expect(200);
 assert.match(page.text,/connection and authentication succeeded/);assert.match(page.text,/test-gateway-receipt-123/);assert.match(page.text,/queue@example.test/);assert(!page.text.includes('synthetic-secret'));
 await limited.post('/admin/email/verify-relay').send({_csrf:limitedCsrf}).expect(403);
 await admin.post('/admin/email/verify-relay').expect(403);
 const countBefore=(await rows(db,'SELECT COUNT(*) AS total FROM cms_email_outbox'))[0].total;
 await admin.post('/admin/email/verify-relay').set('Accept','application/json').send({_csrf:csrfAdmin}).expect(200);
 const relayPage=await admin.get('/admin/email').expect(200);
 assert.match(relayPage.text,/Support relay test/);assert.match(relayPage.text,/localhost:25 SMTP relay is reachable/);
 assert.match(relayPage.text,/SMTP delivery is enabled/);
 assert.equal((await rows(db,'SELECT COUNT(*) AS total FROM cms_email_outbox'))[0].total,countBefore);
 const mail=(await rows(db,'SELECT id FROM cms_email_outbox ORDER BY id DESC LIMIT 1'))[0];
 await admin.post(`/admin/email/${mail.id}/retry`).send({_csrf:csrfAdmin}).expect(422);
 await rows(db,"UPDATE cms_email_outbox SET status='failed',attempts=5 WHERE id=?",[mail.id]);
 await limited.post(`/admin/email/${mail.id}/retry`).send({_csrf:limitedCsrf}).expect(403);
 await admin.post(`/admin/email/${mail.id}/retry`).send({_csrf:csrfAdmin}).expect(303);
 assert.equal((await rows(db,'SELECT status FROM cms_email_outbox WHERE id=?',[mail.id]))[0].status,'pending');
 const publicFeed=await request(app).get('/api/site');assert(!JSON.stringify(publicFeed.body).includes('synthetic-secret'));assert.equal(publicFeed.body.deliveries,undefined);
});

test('Hosted admin recovery is single-use, revokes sessions and rejects non-admin targets',async()=>{
 assert.equal(await recoverAdmin(db,{}),false);
 await assert.rejects(recoverAdmin(db,{ADMIN_RESET_EMAIL:'admin@test.local'}),/requires/);
 const env={ADMIN_RESET_EMAIL:'manager@test.local',ADMIN_RESET_PASSWORD:'Recovery-test-password-2026',ADMIN_RESET_ID:'test_recovery_request_0001'};
 await assert.rejects(recoverAdmin(db,env),/administrator/);
 await assert.rejects(recoverAdmin(db,{...env,ADMIN_RESET_EMAIL:'admin@test.local',ADMIN_RESET_PASSWORD:'short'}),/16–128/);
 await admin.get('/admin').expect(200);
 assert.equal(await recoverAdmin(db,{...env,ADMIN_RESET_EMAIL:'admin@test.local'}),true);
 await admin.get('/admin').expect(302);
 const recovered=request.agent(app),token=(await recovered.get('/api/csrf')).body.token;
 await recovered.post('/admin/login').type('form').send({_csrf:token,email:'admin@test.local',password:env.ADMIN_RESET_PASSWORD}).expect(302);
 const original=(await rows(db,'SELECT password_hash FROM cms_users WHERE email="admin@test.local"'))[0].password_hash;
 assert.equal(await recoverAdmin(db,{...env,ADMIN_RESET_EMAIL:'admin@test.local',ADMIN_RESET_PASSWORD:'Different-test-password-2026'}),false);
 assert.equal((await rows(db,'SELECT password_hash FROM cms_users WHERE email="admin@test.local"'))[0].password_hash,original);
 const log=await rows(db,'SELECT * FROM cms_audit WHERE action="recover_password"');assert.equal(log.length,1);
});

test('Deployment recovery migration targets only the existing active bootstrap administrator',async()=>{
 const original=await hashPassword('Original-migration-password');
 const result=await rows(db,'INSERT INTO cms_users(name,email,password_hash,role) VALUES("Recovery admin","admin@kemsor.local",?,"admin")',[original]);
 const other=(await rows(db,'SELECT password_hash FROM cms_users WHERE email="admin@test.local"'))[0].password_hash;
 await rows(db,'INSERT INTO cms_sessions(id,data,expires_at) VALUES(?,?,DATE_ADD(UTC_TIMESTAMP(),INTERVAL 1 HOUR))',['a'.repeat(64),JSON.stringify({userId:result.insertId})]);
 const sql=await readFile(new URL('../migrations/008_admin_recovery.sql',import.meta.url),'utf8');
 for(const statement of sql.split(';').map(s=>s.trim()).filter(Boolean))await db.query(statement);
 const updated=(await rows(db,'SELECT password_hash FROM cms_users WHERE id=?',[result.insertId]))[0].password_hash;
 assert.notEqual(updated,original);assert.match(updated,/^scrypt:/);
 assert.equal((await rows(db,'SELECT password_hash FROM cms_users WHERE email="admin@test.local"'))[0].password_hash,other);
 assert.equal((await rows(db,'SELECT id FROM cms_sessions WHERE id=?',['a'.repeat(64)])).length,0);
});

test('MySQL JSON string settings are decoded once, including empty strings and booleans',async()=>{
 const pool=createPool({host:'127.0.0.1'});
 assert.equal(pool.pool.config.connectionConfig.jsonStrings,true);await pool.end();
 const fake={execute:async()=>[[{name:'facebook',value:'""'},{name:'contact_note',value:'"Sample details"'},{name:'enquiries_enabled',value:'false'}]]};
 const config=await settings(fake);assert.equal(config.facebook,'');assert.equal(config.contact_note,'Sample details');assert.equal(config.enquiries_enabled,false);
});
