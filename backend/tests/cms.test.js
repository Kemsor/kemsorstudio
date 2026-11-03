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
 for(const name of ['013_phase_one_workflows.sql','014_admin_mfa.sql','015_submission_terms.sql','016_professional_registration.sql','017_operations.sql','018_managed_content.sql','020_careers_intake.sql','021_news_alerts.sql','022_site_modules_campaigns.sql','024_kpi_reporting.sql']){
  const sql=await readFile(new URL(`../migrations/${name}`,import.meta.url),'utf8');
  for(const statement of sql.split(';').map(s=>s.trim()).filter(Boolean))await db.query(statement);
 }
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
 const image=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAEUlEQVQImWN4O83kPwgzwBgAYgIK2V6WzBUAAAAASUVORK5CYII=','base64');
 await editor.post('/admin/media').field('_csrf',csrfEditor).field('alt','Synthetic test image').attach('image',image,{filename:'test.png',contentType:'image/png'}).expect(302);
 const media=(await rows(db,'SELECT * FROM cms_media'))[0];await request(app).get(`/media/${media.id}`).expect(200).expect('Content-Type',/image\/webp/);
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
 for(const [a,role,email]of [[artist,'artist','artist@example.test'],[hirer,'hirer','hirer@example.test'],[other,'hirer','other@example.test']])await post(a,'/api/talent/register',{name:`Test ${role}`,email,password:'A-long-member-password',role,...(role==='hirer'?{department:'Creative & Executive Leadership (Above-the-Line)',specialty:'Director'}:{}),adult:true,consent:true}).then(r=>assert.equal(r.status,201));
 const a=(await artist.get('/api/talent/session')).body.user,h=(await hirer.get('/api/talent/session')).body.user;
 assert.equal(h.department,'Creative & Executive Leadership (Above-the-Line)');assert.equal(h.specialty,'Director');assert.equal(h.profession,'Director');
 await post(request.agent(app),'/api/talent/register',{name:'Invalid professional',email:'invalid-role@example.test',password:'A-long-member-password',role:'hirer',department:'Camera Department',specialty:'Producer',adult:true,consent:true}).then(r=>assert.equal(r.status,422));
 await post(hirer,'/api/talent/profile',{name:h.name,department:'Camera Department',specialty:'Producer'}).then(r=>assert.equal(r.status,422));
 await post(artist,'/api/talent/profile',{name:'Test Artist',profession:'Actor',city:'Mumbai',languages:'Hindi',skills:'Dance',bio:'Synthetic test profile',visible:true}).then(r=>assert.equal(r.status,200));
 assert.equal((await request(app).get('/api/talent')).body.people.length,0);
 await post(hirer,`/api/talent/shortlists/${a.id}`,{}).then(r=>assert.equal(r.status,403));
 const image=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAEUlEQVQImWN4O83kPwgzwBgAYgIK2V6WzBUAAAAASUVORK5CYII=','base64');
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
 const directoryResult=(await request(app).get('/api/talent?city=Mumbai')).body;assert.ok(directoryResult.filters.city.includes('Mumbai'));assert.ok(directoryResult.filters.profession.includes('Actor'));assert.ok(directoryResult.filters.language.includes('Hindi'));const directory=directoryResult.people;assert.equal(directory.length,1);assert.equal(directory[0].email,undefined);assert.equal(directory[0].password_hash,undefined);
 await post(hirer,`/api/talent/shortlists/${a.id}`,{}).then(r=>assert.equal(r.status,200));
 assert.equal((await hirer.get('/api/talent/workspace')).body.saved[0].id,a.id);
 await post(hirer,'/api/talent/enquiries',{artistId:a.id,project:'Test production',message:'Synthetic enquiry'}).then(r=>assert.equal(r.status,201));
 const enquiry=(await artist.get('/api/talent/workspace')).body.enquiries[0];assert.equal(enquiry.project,'Test production');
 await post(other,`/api/talent/enquiries/${enquiry.id}`,{status:'interested'}).then(r=>assert.equal(r.status,404));
 await post(artist,`/api/talent/enquiries/${enquiry.id}`,{status:'interested'}).then(r=>assert.equal(r.status,200));
 await artist.get('/api/production/projects').expect(403);
 await post(artist,'/api/production/projects',{title:'Artist blocked'}).then(r=>assert.equal(r.status,403));
 const created=await post(hirer,'/api/production/projects',{title:'Private Test Film',budget:50000,currency:'INR',timeline:'10 days'});assert.equal(created.status,201);const id=created.body.id;
 await post(hirer,`/api/production/projects/${id}/script`,{}).then(r=>assert.equal(r.status,503));
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
 for(const type of ['news','blog','career','team','home','page','media_partner']){
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
 for(const type of ['blog','career','news','team','home','page','media_partner']){
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
 assert.match(form.text,/name="category"/);
 for(const name of ['role','location','page','author'])assert.ok(!form.text.includes(`name="${name}"`));
 await admin.post('/admin/blog/save').type('form').send({_csrf:csrfAdmin,type:'news',title:'Wrong form',status:'draft'}).expect(422);
 const image=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAEUlEQVQImWN4O83kPwgzwBgAYgIK2V6WzBUAAAAASUVORK5CYII=','base64');
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
 const pageForm=await admin.get('/admin/content/new?type=page&page=services').expect(200);assert.match(pageForm.text,/<option value="services" selected>/);
 await admin.get('/admin/content?type=page&page=services').expect(200);
 assert.match(hub.text,/page=how-we-work/);
 const workForm=await admin.get('/admin/content/new?type=page&page=how-we-work').expect(200);assert.match(workForm.text,/<option value="how-we-work" selected>/);
 await admin.post('/admin/content/save').type('form').send({_csrf:csrfAdmin,type:'page',title:'How We Work test section',body:'Additional client-approved content',page:'how-we-work',status:'draft'}).expect(302);
 const workList=await admin.get('/admin/content?type=page&page=how-we-work').expect(200);assert.match(workList.text,/How We Work test section/);
 const serviceList=await admin.get('/admin/content?type=page&page=services').expect(200);assert.ok(!(serviceList.text.match(/<tbody[\s\S]*?<\/tbody>/)?.[0]||'').includes('How We Work test section'));
 assert.match(hub.text,/page=india-production-services/);
 const indiaForm=await admin.get('/admin/content/new?type=page&page=india-production-services').expect(200);assert.match(indiaForm.text,/<option value="india-production-services" selected>/);
 await admin.post('/admin/content/save').type('form').send({_csrf:csrfAdmin,type:'page',title:'India Production Services test section',body:'Additional client-approved India content',page:'india-production-services',status:'draft'}).expect(302);
 const indiaList=await admin.get('/admin/content?type=page&page=india-production-services').expect(200);assert.match(indiaList.text,/India Production Services test section/);assert.ok(!(indiaList.text.match(/<tbody[\s\S]*?<\/tbody>/)?.[0]||'').includes('How We Work test section'));
 assert.match(hub.text,/page=feature-films/);
 const featureForm=await admin.get('/admin/content/new?type=page&page=feature-films').expect(200);assert.match(featureForm.text,/<option value="feature-films" selected>/);
 await admin.post('/admin/content/save').type('form').send({_csrf:csrfAdmin,type:'page',title:'Feature Films test section',body:'Additional client-approved feature content',page:'feature-films',status:'draft'}).expect(302);
 const featureList=await admin.get('/admin/content?type=page&page=feature-films').expect(200);assert.match(featureList.text,/Feature Films test section/);assert.ok(!(featureList.text.match(/<tbody[\s\S]*?<\/tbody>/)?.[0]||'').includes('India Production Services test section'));
 assert.match(hub.text,/page=short-films/);
 const shortForm=await admin.get('/admin/content/new?type=page&page=short-films').expect(200);assert.match(shortForm.text,/<option value="short-films" selected>/);
 await admin.post('/admin/content/save').type('form').send({_csrf:csrfAdmin,type:'page',title:'Short Films test section',body:'Additional client-approved short film content',page:'short-films',status:'draft'}).expect(302);
 const shortList=await admin.get('/admin/content?type=page&page=short-films').expect(200);assert.match(shortList.text,/Short Films test section/);assert.ok(!(shortList.text.match(/<tbody[\s\S]*?<\/tbody>/)?.[0]||'').includes('Feature Films test section'));
 assert.match(hub.text,/page=series-ott/);
 const seriesForm=await admin.get('/admin/content/new?type=page&page=series-ott').expect(200);assert.match(seriesForm.text,/<option value="series-ott" selected>/);
 await admin.post('/admin/content/save').type('form').send({_csrf:csrfAdmin,type:'page',title:'Series OTT test section',body:'Additional client-approved series content',page:'series-ott',status:'draft'}).expect(302);
 const seriesList=await admin.get('/admin/content?type=page&page=series-ott').expect(200);assert.match(seriesList.text,/Series OTT test section/);assert.ok(!(seriesList.text.match(/<tbody[\s\S]*?<\/tbody>/)?.[0]||'').includes('Short Films test section'));
 assert.match(hub.text,/page=documentaries/);
 const documentaryForm=await admin.get('/admin/content/new?type=page&page=documentaries').expect(200);assert.match(documentaryForm.text,/<option value="documentaries" selected>/);
 await admin.post('/admin/content/save').type('form').send({_csrf:csrfAdmin,type:'page',title:'Documentaries test section',body:'Additional client-approved documentary content',page:'documentaries',status:'draft'}).expect(302);
 const documentaryList=await admin.get('/admin/content?type=page&page=documentaries').expect(200);assert.match(documentaryList.text,/Documentaries test section/);assert.ok(!(documentaryList.text.match(/<tbody[\s\S]*?<\/tbody>/)?.[0]||'').includes('Series OTT test section'));
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
 assert.match(form.text,/name="category"/);
 for(const name of ['role','location','page','author'])assert.ok(!form.text.includes(`name="${name}"`));
 await admin.post('/admin/news/save').type('form').send({_csrf:csrfAdmin,type:'career',title:'Wrong form',status:'draft'}).expect(422);
 const image=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAEUlEQVQImWN4O83kPwgzwBgAYgIK2V6WzBUAAAAASUVORK5CYII=','base64');
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
 const image=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAEUlEQVQImWN4O83kPwgzwBgAYgIK2V6WzBUAAAAASUVORK5CYII=','base64');
 await admin.post('/admin/media').field('_csrf',csrfAdmin).field('alt','Library unique description').attach('image',image,{filename:'library-unique.png',contentType:'image/png'}).expect(302);
 const media=(await rows(db,'SELECT * FROM cms_media WHERE original_name="library-unique.png"'))[0];
 const page=await admin.get('/admin/media?q=Library%20unique&format=image%2Fwebp&usage=unused').expect(200);assert.match(page.text,/library-unique.png/);assert.match(page.text,/data-image-preview/);
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

test('Staff sign in with a password and old MFA links return to login',async()=>{
 await rows(db,'INSERT INTO cms_users(name,email,password_hash,role) VALUES(?,?,?,?)',['Password login','password-login@test.local',await hashPassword('A-secure-test-password'),'editor']);
 const guest=request.agent(app);
 await guest.get('/admin/mfa').expect(302).expect('Location','/admin/login');
 const csrf=(await guest.get('/api/csrf')).body.token;
 await guest.post('/admin/login').type('form').send({_csrf:csrf,email:'password-login@test.local',password:'wrong'}).expect(401);
 await guest.get('/admin').expect(302).expect('Location','/admin/login');
 await guest.post('/admin/login').type('form').send({_csrf:csrf,email:'password-login@test.local',password:'A-secure-test-password'}).expect(302).expect('Location','/admin');
 await guest.get('/admin').expect(200);
 await guest.get('/admin/mfa').expect(302).expect('Location','/admin');
});

test('Production drafts stay private and approved production stages and press resources publish',async()=>{
 await rows(db,'INSERT INTO cms_users(name,email,password_hash,role) VALUES(?,?,?,?)',['Publishing editor','publishing-editor@test.local',await hashPassword('A-secure-test-password'),'editor']);
 const [editor,csrfEditor]=await login('publishing-editor');
 for(const type of ['production','press_asset'])await editor.get(`/admin/content/new?type=${type}`).expect(200);
 const project={_csrf:csrfEditor,type:'production',title:'Synthetic project',summary:'Test announcement',body:'Test only',status:'draft',production_stage:'in_development',format:'Feature film',language:'English'};
 await editor.post('/admin/content/save').type('form').send({...project,production_stage:'invalid'}).expect(422);
 await editor.post('/admin/content/save').type('form').send(project).expect(302);
 const row=(await rows(db,'SELECT id FROM cms_entries WHERE type="production" AND title="Synthetic project"'))[0];
 assert.ok(!(await request(app).get('/api/site')).body.entries.some(entry=>entry.id===row.id));
 await editor.post('/admin/content/save').type('form').send({...project,id:row.id,status:'published'}).expect(302);
 const published=(await request(app).get('/api/site')).body.entries.find(entry=>entry.id===row.id);assert.equal(published.metadata.production_stage,'in_development');
 const asset={_csrf:csrfEditor,type:'press_asset',title:'Synthetic press profile',status:'published',asset_url:'javascript:alert(1)',usage:'Editorial use only'};
 await editor.post('/admin/content/save').type('form').send(asset).expect(422);
 await editor.post('/admin/content/save').type('form').send({...asset,asset_url:'https://example.test/profile.pdf'}).expect(302);
 assert.ok((await request(app).get('/api/site')).body.entries.some(entry=>entry.type==='press_asset'&&entry.metadata.usage==='Editorial use only'));
});

test('Extended follow-up tracks statuses, assignments, priority and exports only to staff',async()=>{
 const created=await rows(db,'INSERT INTO cms_enquiries(category,name,email,subject,message,consent_at,consent_version) VALUES(?,?,?,?,?,UTC_TIMESTAMP(),?)',['financing','=Synthetic','followup@example.test','Workflow test','Test only','test-v1']);
 const id=created.insertId,user=(await rows(db,'SELECT id FROM cms_users WHERE email=?',['enquiry_manager@test.local']))[0];
 await manager.post(`/admin/enquiries/${id}`).type('form').send({_csrf:csrfManager,status:'assigned'}).expect(422);
 for(const status of ['assigned','information_required','meeting_scheduled','qualified','converted','closed'])await manager.post(`/admin/enquiries/${id}`).type('form').send({_csrf:csrfManager,status,assigned_to:user.id,priority:'high',tags:'Test pipeline',source:'partner-page',follow_up_at:'2026-11-02T10:30',note:'Synthetic follow-up'}).expect(302);
 const enquiry=(await rows(db,'SELECT * FROM cms_enquiries WHERE id=?',[id]))[0];assert.equal(enquiry.priority,'high');assert.equal(enquiry.follow_up_at,'2026-11-02 10:30:00');
 assert.equal((await rows(db,'SELECT COUNT(*) AS total FROM cms_enquiry_history WHERE enquiry_id=?',[id]))[0].total,6);
 const [editor]=await login('publishing-editor');
 await editor.get('/admin/enquiries/export.csv').expect(403);await request(app).get('/admin/enquiries/export.csv').expect(302);
 const csv=await manager.get('/admin/enquiries/export.csv?category=financing&q=Test%20pipeline').expect(200);assert.match(csv.text,/'=Synthetic/);assert.match(csv.text,/partner-page/);
});

test('Admin accepts large original images and serves smaller, optimized WebP images',async()=>{
 await rows(db,'INSERT INTO cms_users(name,email,password_hash,role) VALUES(?,?,?,?)',['Upload admin','upload-admin@test.local',await hashPassword('A-secure-test-password'),'admin']);
 const [admin,csrfAdmin]=await login('upload-admin');
 const {default:sharp}=await import('sharp');const {randomBytes}=await import('node:crypto');
 const original=await sharp(randomBytes(2700*900*3),{raw:{width:2700,height:900,channels:3}}).png().toBuffer();assert.ok(original.length>5*1024*1024);
 await admin.post('/admin/media').field('_csrf',csrfAdmin).field('alt','Large source photo').attach('image',original,{filename:'large-photo.png',contentType:'image/png'}).expect(302);
 const saved=(await rows(db,'SELECT * FROM cms_media WHERE original_name="large-photo.png"'))[0];assert.equal(saved.mime,'image/webp');assert.ok(saved.size<original.length);
 const response=await request(app).get(`/media/${saved.id}`).expect(200),metadata=await sharp(response.body).metadata();assert.equal(metadata.width,2400);assert.equal(metadata.height,800);
});

test('CMS reports filter records, download complete CSV and respect role boundaries',async()=>{
 await rows(db,'INSERT INTO cms_enquiries(category,name,email,subject,message,status,consent_at,consent_version,created_at) VALUES(?,?,?,?,?,?,UTC_TIMESTAMP(),?,?)',['brand','=Report','report@example.test','Report fixture','Synthetic only','qualified','test','2026-10-02 23:59:59']);
 await rows(db,'INSERT INTO cms_enquiries(category,name,email,subject,message,status,consent_at,consent_version,created_at) VALUES(?,?,?,?,?,?,UTC_TIMESTAMP(),?,?)',['brand','Outside range','outside@example.test','Report fixture','Synthetic only','qualified','test','2026-10-03 00:00:00']);
 const query='type=enquiries&from=2026-10-02&to=2026-10-02&category=brand&status=qualified&q=Report%20fixture';
 const page=await manager.get(`/admin/reports?${query}`).expect(200);assert.match(page.text,/report@example.test/);assert.ok(!page.text.includes('outside@example.test'));assert.match(page.text,/Download CSV/);
 const csv=await manager.get(`/admin/reports/download.csv?${query}`).expect(200).expect('Content-Type',/text\/csv/);assert.match(csv.text,/'=Report/);assert.ok(!csv.text.includes('outside@example.test'));
 await request(app).get('/admin/reports').expect(302);await manager.get('/admin/reports?type=activity').expect(403);await manager.get('/admin/reports?type=content').expect(403);
 await rows(db,'INSERT INTO cms_users(name,email,password_hash,role) VALUES(?,?,?,?)',['Report editor','report-editor@test.local',await hashPassword('A-secure-test-password'),'editor']);const [reportEditor]=await login('report-editor');
 await reportEditor.get('/admin/reports?type=content').expect(200);await reportEditor.get('/admin/reports/download.csv?type=enquiries').expect(403);
 await manager.get('/admin/reports?from=2026-02-31').expect(422);await manager.get('/admin/reports?type=unknown').expect(403);
 const [reportAdmin]=await login('upload-admin');await reportAdmin.get('/admin/reports?type=activity').expect(200);
});

test('Operations dashboard and retention holds are administrator-only and CSRF-protected',async()=>{
 const [admin,csrfAdmin]=await login('upload-admin'),[manager,csrfManager]=await login('enquiry_manager');
 await manager.get('/admin/operations').expect(403);
 await admin.get('/admin/operations').expect(200).then(response=>assert.match(response.text,/Automatic deletion/));
 const id=(await rows(db,'INSERT INTO cms_enquiries(category,name,email,subject,message,consent_at,consent_version) VALUES("general","Retention hold test","hold@example.test","Test","Synthetic",UTC_TIMESTAMP(),"test")')).insertId;
 await admin.post(`/admin/operations/enquiry/${id}/hold`).type('form').send({retention_hold:'true'}).expect(403);
 await manager.post(`/admin/operations/enquiry/${id}/hold`).type('form').send({_csrf:csrfManager,retention_hold:'true'}).expect(403);
 await admin.post(`/admin/operations/enquiry/${id}/hold`).type('form').send({_csrf:csrfAdmin,retention_hold:'true'}).expect(302);
 await admin.post(`/admin/enquiries/${id}/delete`).type('form').send({_csrf:csrfAdmin}).expect(409);
 await admin.post(`/admin/operations/enquiry/${id}/hold`).type('form').send({_csrf:csrfAdmin,retention_hold:'false'}).expect(302);
 await admin.post(`/admin/enquiries/${id}/delete`).type('form').send({_csrf:csrfAdmin}).expect(302);
});

test('Retention previews are non-destructive; apply excludes held and active records and erases related data',async()=>{
 const {retentionPolicy,runRetention,processFileDeletions}=await import('../src/retention.js');
 const {mkdtemp,mkdir,writeFile,stat,rm}=await import('node:fs/promises');
 const {tmpdir}=await import('node:os');const path=await import('node:path');
 const root=await mkdtemp(path.join(tmpdir(),'kemsor-retention-'));
 try {
  await mkdir(path.join(root,'uploads'));await mkdir(path.join(root,'career-resumes'));
  const insert=async(status,hold=0)=>{
   const id=(await rows(db,'INSERT INTO cms_enquiries(category,name,email,subject,message,status,retention_hold,consent_at,consent_version,attachment_filename) VALUES("general","Synthetic retention","retention@example.test","Synthetic","Test",?,?,UTC_TIMESTAMP(),"test","retention-only-test.pdf")',[status,hold])).insertId;
   await rows(db,'UPDATE cms_enquiries SET updated_at=DATE_SUB(UTC_TIMESTAMP(),INTERVAL 400 DAY) WHERE id=?',[id]);return id;
  };
  const closed=await insert('closed'),held=await insert('closed',1),active=await insert('in_review');
  await rows(db,'INSERT INTO cms_enquiry_notes(enquiry_id,note) VALUES(?,"Synthetic private note")',[closed]);
  const receipt=`KEM-${String(closed).padStart(6,'0')}`;
  await rows(db,'INSERT INTO cms_email_outbox(receipt_key,recipient,subject,body,status) VALUES(?,"retention@example.test","Synthetic","Synthetic","sent")',[receipt]);
  await writeFile(path.join(root,'uploads/retention-only-test.pdf'),'synthetic');
  const policy=retentionPolicy({RETENTION_ENABLED:'true',RETENTION_POLICY_VERSION:'synthetic-approved-policy',RETENTION_ENQUIRY_DAYS:'365',RETENTION_APPLICATION_DAYS:'365'});
  const preview=await runRetention(db,policy);
  assert.ok(preview.candidates.enquiry>=1);assert.equal((await rows(db,'SELECT id FROM cms_enquiries WHERE id=?',[closed])).length,1);
  await assert.rejects(runRetention(db,{...policy,enabled:false},{apply:true}));
  const result=await runRetention(db,policy,{apply:true});assert.ok(result.deleted.enquiry>=1);
  assert.equal((await rows(db,'SELECT id FROM cms_enquiries WHERE id=?',[closed])).length,0);
  assert.equal((await rows(db,'SELECT id FROM cms_enquiry_notes WHERE enquiry_id=?',[closed])).length,0);
  assert.equal((await rows(db,'SELECT id FROM cms_email_outbox WHERE receipt_key=?',[receipt])).length,0);
  assert.equal((await rows(db,'SELECT id FROM cms_enquiries WHERE id IN (?,?)',[held,active])).length,2);
  assert.equal((await rows(db,'SELECT id FROM cms_data_deletions WHERE resource="enquiry" AND source_id=?',[closed])).length,1);
  await processFileDeletions(db,root);await assert.rejects(stat(path.join(root,'uploads/retention-only-test.pdf')));
  const application=(await rows(db,'INSERT INTO career_applications(career_title,name,email,phone,message,resume_filename,resume_name,status,consent_version,consent_at) VALUES("Synthetic","Synthetic","resume@example.test","123","Test","retention-only-test.pdf","test.pdf","rejected","test",UTC_TIMESTAMP())')).insertId;
  await rows(db,'UPDATE career_applications SET updated_at=DATE_SUB(UTC_TIMESTAMP(),INTERVAL 400 DAY) WHERE id=?',[application]);
  await rows(db,'INSERT INTO career_application_notes(application_id,note) VALUES(?,"Synthetic note")',[application]);
  await writeFile(path.join(root,'career-resumes/retention-only-test.pdf'),'synthetic');
  const applications=await runRetention(db,policy,{apply:true});assert.equal(applications.deleted.application,1);
  await processFileDeletions(db,root);await assert.rejects(stat(path.join(root,'career-resumes/retention-only-test.pdf')));
  assert.equal((await rows(db,'SELECT id FROM career_application_notes WHERE application_id=?',[application])).length,0);
 } finally {await rm(root,{recursive:true,force:true});}
});

test('Housekeeping removes expired state, preserves live sessions and retries queued files',async()=>{
 const [admin]=await login('upload-admin');
 const {housekeeping,operation}=await import('../src/operations.js');
 await rows(db,'INSERT INTO cms_sessions(id,data,expires_at) VALUES(?,"{}",DATE_SUB(UTC_TIMESTAMP(),INTERVAL 1 DAY))',['e'.repeat(64)]);
 await rows(db,'INSERT INTO cms_rate_limits(id,attempts,expires_at) VALUES(?,1,DATE_SUB(UTC_TIMESTAMP(),INTERVAL 1 DAY))',['f'.repeat(64)]);
 const result=await operation(db,'housekeeping-test',()=>housekeeping(db));
 assert.ok(result.expiredSessions>=1);assert.ok(result.expiredRateLimits>=1);
 await admin.get('/admin').expect(200);
 assert.equal((await rows(db,'SELECT status FROM cms_operations_runs WHERE job="housekeeping-test" ORDER BY id DESC LIMIT 1'))[0].status,'success');
 const connection=await db.getConnection();
 try {
  await rows(connection,'SELECT GET_LOCK("kemsor-operations",0)');
  const skipped=await operation(db,'housekeeping-test',async()=>{throw new Error('Must not run concurrently');});
  assert.equal(skipped.skipped,'another-operation-is-running');
 } finally {await rows(connection,'SELECT RELEASE_LOCK("kemsor-operations")');connection.release();}
});

test('A real encrypted database backup passes a disposable MySQL recovery drill',async context=>{
 const {existsSync}=await import('node:fs');
 const dump=process.env.MYSQLDUMP_BIN||'/Applications/XAMPP/xamppfiles/bin/mysqldump';
 const mysql=process.env.MYSQL_BIN||'/Applications/XAMPP/xamppfiles/bin/mysql';
 if(!existsSync(dump)||!existsSync(mysql)){context.skip('Configure MYSQLDUMP_BIN and MYSQL_BIN to run the database recovery drill');return;}
 const {createBackup}=await import('../src/backup.js');
 const {mkdtemp,rm}=await import('node:fs/promises');
 const {tmpdir}=await import('node:os');const path=await import('node:path');
 const {randomBytes}=await import('node:crypto');
 const {promisify}=await import('node:util');const {execFile}=await import('node:child_process');
 const directory=await mkdtemp(path.join(tmpdir(),'kemsor-real-backup-'));
 const env={...process.env,DB_NAME:database,DB_USER:options.user,DB_PASSWORD:options.password,DB_BACKUP_USER:options.user,DB_BACKUP_PASSWORD:options.password,MYSQLDUMP_BIN:dump,MYSQL_BIN:mysql,BACKUP_DIR:directory,BACKUP_REMOTE_HOST:'',BACKUP_REMOTE_DIR:'',BACKUP_ENCRYPTION_KEY:randomBytes(32).toString('base64')};
 try {
  const restoredId=(await rows(db,'INSERT INTO cms_enquiries(category,name,email,subject,message,consent_at,consent_version) VALUES("general","Recovery erasure","recover@example.test","Synthetic","Synthetic",UTC_TIMESTAMP(),"test")')).insertId;
  const backup=await createBackup(db,{env});assert.ok(backup.bytes>100);
  const {deletePersonalRecord}=await import('../src/retention.js');
  await deletePersonalRecord(db,'enquiry',restoredId);

  const {stdout}=await promisify(execFile)(process.execPath,[new URL('../src/operations-cli.js',import.meta.url).pathname,'drill',path.join(directory,backup.archive)],{env,timeout:60000});
  const result=JSON.parse(stdout);assert.equal(result.verified,true);assert.equal(result.disposableDatabaseRemoved,true);assert.equal(result.deletionsReapplied,1);assert.ok(result.tableCount>10);
  assert.ok((await rows(db,'SELECT COUNT(*) AS total FROM cms_users'))[0].total>0);
 }finally{await rm(directory,{recursive:true,force:true});}
});

test('Legal management preserves original policy, isolates drafts, publishes pages and restores revisions safely',async()=>{
 const {seedManagedContent}=await import('../src/managed-content.js');
 const [admin,csrf]=await login('upload-admin'),[editor,editorCsrf]=await login('publishing-editor');
 await seedManagedContent(db);
 const original=(await rows(db,'SELECT * FROM cms_managed_content WHERE kind="legal" AND slug="privacy-policy"'))[0];
 const policy=JSON.parse(original.published);
 const supplied=JSON.parse(await readFile(new URL('../../rain-temp/src/pages/privacy-policy-content.json',import.meta.url),'utf8'));
 assert.deepEqual(policy.sections,supplied.sections);assert.deepEqual(policy.closing,supplied.closing);
 await editor.get('/admin/manage/legal').expect(403);
 await admin.get('/admin/manage/legal').expect(200);
 await admin.get(`/admin/manage/legal/${original.id}`).expect(200);
 await admin.get(`/admin/manage/legal/${original.id}/preview`).expect(200);
 const fields={...policy,closing:policy.closing.join('\n\n'),footer:'on',id:original.id,slug:original.slug,revision:original.revision,title:'Synthetic draft policy',_csrf:csrf,action:'draft'};
 await editor.post('/admin/manage/legal/save').type('form').send({...fields,_csrf:editorCsrf}).expect(403);
 await admin.post('/admin/manage/legal/save').type('form').send({...fields,_csrf:''}).expect(403);
 await admin.post('/admin/manage/legal/save').type('form').send(fields).expect(302);
 let saved=(await rows(db,'SELECT * FROM cms_managed_content WHERE id=?',[original.id]))[0];
 assert.equal(JSON.parse(saved.draft).title,'Synthetic draft policy');assert.equal(JSON.parse(saved.published).title,'Privacy Policy');
 await seedManagedContent(db);assert.equal(JSON.parse((await rows(db,'SELECT draft FROM cms_managed_content WHERE id=?',[original.id]))[0].draft).title,'Synthetic draft policy');
 await admin.post('/admin/manage/legal/save').type('form').send({...fields,action:'publish',revision:original.revision}).expect(409);
 await admin.post('/admin/manage/legal/save').type('form').send({...fields,action:'publish',revision:saved.revision}).expect(302);
 saved=(await rows(db,'SELECT * FROM cms_managed_content WHERE id=?',[original.id]))[0];
 const revision=(await rows(db,'SELECT id FROM cms_managed_revisions WHERE content_id=? AND revision=1',[original.id]))[0];
 await admin.post(`/admin/manage/legal/${original.id}/restore`).type('form').send({_csrf:csrf,revision:saved.revision,snapshot_id:revision.id}).expect(302);
 saved=(await rows(db,'SELECT * FROM cms_managed_content WHERE id=?',[original.id]))[0];
 assert.equal(JSON.parse(saved.draft).title,'Privacy Policy');assert.equal(JSON.parse(saved.published).title,'Synthetic draft policy');
 const document={_csrf:csrf,slug:'synthetic-terms',title:'Synthetic terms',description:'Synthetic policy for testing',content:'1. Scope\n\n1.1 Synthetic only.',closing:'',version:'test-v1',effectiveDate:'2026-11-01',position:'2',action:'draft',footer:'on'};
 await admin.post('/admin/manage/legal/save').type('form').send(document).expect(302);
 await request(app).get('/legal/synthetic-terms/').expect(404);
 assert.ok(!(await request(app).get('/api/site')).body.legalDocuments.some(item=>item.slug==='synthetic-terms'));
 const record=(await rows(db,'SELECT * FROM cms_managed_content WHERE kind="legal" AND slug="synthetic-terms"'))[0];
 await admin.post('/admin/manage/legal/save').type('form').send({...document,id:record.id,revision:record.revision,action:'publish'}).expect(302);
 await request(app).get('/legal/synthetic-terms/').expect(200).then(response=>{assert.match(response.text,/<title>Synthetic terms \| Kemsor Studios<\/title>/);assert.match(response.text,/https:\/\/app.kemsorstudio.com\/legal\/synthetic-terms\//);});
 assert.ok((await request(app).get('/api/site')).body.legalDocuments.some(item=>item.slug==='synthetic-terms'&&item.footer));
 await request(app).get('/sitemap.xml').expect(200).then(response=>assert.match(response.text,/legal\/synthetic-terms\//));
 await admin.post('/admin/manage/legal/save').type('form').send({...document,id:record.id,revision:record.revision+1,action:'unpublish'}).expect(302);
 await request(app).get('/legal/synthetic-terms/').expect(404);
 await request(app).get('/sitemap.xml').expect(200).then(response=>assert.ok(!response.text.includes('legal/synthetic-terms/')));
});

test('Hero management preserves five videos and exposes only published slides and order',async()=>{
 // Reset only this isolated fixture's login counters after the preceding authentication tests.
 await rows(db,'DELETE FROM cms_rate_limits');
 const {seedManagedContent}=await import('../src/managed-content.js');
 const [admin,csrf]=await login('upload-admin');
 await seedManagedContent(db);
 const originals=JSON.parse(await readFile(new URL('../../shared/hero-slides.json',import.meta.url),'utf8'));
 let feed=(await request(app).get('/api/site')).body;
 assert.equal(feed.heroSlides.length,5);assert.deepEqual(feed.heroSlides.map(slide=>slide.src),originals.map(slide=>slide.src));
 const record=(await rows(db,'SELECT * FROM cms_managed_content WHERE kind="hero" ORDER BY id LIMIT 1'))[0];
 const fields={...JSON.parse(record.draft),_csrf:csrf,id:record.id,slug:record.slug,revision:record.revision,label:'Synthetic hero draft',position:'9',duration:'7',action:'draft'};
 await admin.get('/admin/manage/hero').expect(200);
 await admin.get(`/admin/manage/hero/${record.id}`).expect(200);
 await admin.post('/admin/manage/hero/save').type('form').send({...fields,src:'javascript:alert(1)'}).expect(422);
 await admin.post('/admin/manage/hero/save').type('form').send(fields).expect(302);
 feed=(await request(app).get('/api/site')).body;assert.equal(feed.heroSlides[0].label,originals[0].label);
 await admin.post('/admin/manage/hero/save').type('form').send({...fields,revision:record.revision+1,action:'publish'}).expect(302);
 feed=(await request(app).get('/api/site')).body;assert.equal(feed.heroSlides.at(-1).label,'Synthetic hero draft');assert.equal(feed.heroSlides.at(-1).duration,7);
 assert.ok(feed.heroSlides.at(-1).posterSrcSet.includes('1600w'));
 await admin.post('/admin/manage/hero/save').type('form').send({...fields,revision:record.revision+2,action:'unpublish'}).expect(302);
 feed=(await request(app).get('/api/site')).body;assert.equal(feed.heroSlides.length,4);assert.ok(!feed.heroSlides.some(slide=>slide.id===record.id));
 await request(app).get(`/admin/manage/hero/${record.id}/preview`).expect(302);
 await admin.get(`/admin/manage/hero/${record.id}/preview`).expect(200);
});

test('Report centre separates report types, paginates and protects member and production reports',async()=>{
 await rows(db,'DELETE FROM cms_rate_limits');
 const [admin]=await login('upload-admin'),[manager]=await login('enquiry_manager'),[editor]=await login('publishing-editor');
 const hub=await admin.get('/admin/reports').expect(200);assert.match(hub.text,/Choose a report/);
 for(const type of ['enquiries','applications','content','activity','registrations','talent','projects']){
  assert.ok(hub.text.includes(`/admin/reports/${type}`));
  const page=await admin.get(`/admin/reports/${type}`).expect(200);assert.match(page.text,/Download CSV/);
  assert.ok(page.text.includes(`/admin/reports/${type}/download.csv`));
  const csv=await admin.get(`/admin/reports/${type}/download.csv`).expect(200).expect('Content-Type',/text\/csv/);
  assert.ok(!csv.text.split('\n')[0].includes('password_hash'));
  if(type==='projects')for(const privateField of ['script_text','script_filename','plan'])assert.ok(!csv.text.split('\n')[0].includes(`"${privateField}"`));
 }
 const managerHub=await manager.get('/admin/reports').expect(200);
 assert.ok(!managerHub.text.includes('/admin/reports/registrations'));assert.ok(!managerHub.text.includes('/admin/reports/projects'));
 for(const type of ['registrations','talent','projects','activity','content'])await manager.get(`/admin/reports/${type}`).expect(403);
 await editor.get('/admin/reports/content').expect(200);
 for(const type of ['enquiries','applications','registrations','projects'])await editor.get(`/admin/reports/${type}/download.csv`).expect(403);
 await admin.get('/admin/reports/unknown').expect(403);
 await admin.get('/admin/reports/enquiries?from=2026-02-31').expect(422);
 const [range]=await rows(db,'SELECT DATE(MIN(created_at)) AS first_day,DATE(MAX(created_at)) AS last_day FROM talent_accounts');
 const paged=await admin.get(`/admin/reports/registrations?per_page=25&p=2&from=${range.first_day}&to=${range.last_day}`).expect(200);assert.match(paged.text,/Report pages/);assert.match(paged.text,/Page 2 of/);
});

test('Publishing editor saves structured formatting, derives plain text and keeps unsafe markup inert',async()=>{
 await rows(db,'DELETE FROM cms_rate_limits');
 const [editor,csrf]=await login('publishing-editor');
 const rich={version:1,type:'doc',children:[{type:'h2',children:[{type:'text',text:'Formatted heading'}]},{type:'p',children:[{type:'strong',children:[{type:'text',text:'Bold text'}]},{type:'text',text:' and '},{type:'a',href:'https://example.test/read',children:[{type:'text',text:'Read more'}]}]},{type:'ol',children:[{type:'li',children:[{type:'text',text:'First item'}]},{type:'li',children:[{type:'text',text:'Second item'}]}]}]};
 const fields={_csrf:csrf,type:'blog',title:'Synthetic formatted article',summary:'Rich text test',body:'This fallback should be replaced',status:'draft',rich_text:JSON.stringify(rich)};
 await editor.post('/admin/blog/save').type('form').send(fields).expect(302);
 const saved=(await rows(db,'SELECT * FROM cms_entries WHERE title="Synthetic formatted article"'))[0];
 assert.ok(saved.body.includes('Formatted heading'));assert.ok(!saved.body.includes('fallback should be replaced'));
 assert.deepEqual(JSON.parse(saved.metadata).rich_text,rich);
 const edit=await editor.get(`/admin/content/${saved.id}`).expect(200);assert.match(edit.text,/data-rich-editor/);
 const preview=await editor.get(`/admin/content/${saved.id}/preview`).expect(200);assert.match(preview.text,/<strong>Bold text<\/strong>/);assert.match(preview.text,/<ol><li>First item/);
 assert.ok(!(await request(app).get('/api/site')).body.entries.some(entry=>entry.id===saved.id));
 await editor.post('/admin/blog/save').type('form').send({...fields,id:saved.id,status:'published'}).expect(302);
 const published=(await request(app).get('/api/site')).body.entries.find(entry=>entry.id===saved.id);assert.deepEqual(published.metadata.rich_text,rich);
 const unsafe={version:1,type:'doc',children:[{type:'p',children:[{type:'a',href:'javascript:alert(1)',children:[{type:'text',text:'Bad'}]}]}]};
 await editor.post('/admin/blog/save').type('form').send({...fields,id:saved.id,rich_text:JSON.stringify(unsafe)}).expect(422);
 assert.deepEqual(JSON.parse((await rows(db,'SELECT metadata FROM cms_entries WHERE id=?',[saved.id]))[0].metadata).rich_text,rich);
});

test('Managed legal content supports formatting without losing numbered sections or revision controls',async()=>{
 await rows(db,'DELETE FROM cms_rate_limits');const [admin,csrf]=await login('upload-admin');
 const rich={version:1,type:'doc',children:[{type:'h2',children:[{type:'text',text:'1. Scope'}]},{type:'p',children:[{type:'text',text:'1.1 '},{type:'strong',children:[{type:'text',text:'Approved emphasis'}]}]}]};
 const fields={_csrf:csrf,slug:'synthetic-formatted-policy',title:'Synthetic formatted policy',content:'Ignored fallback',version:'test-v1',position:'3',action:'draft',rich_text:JSON.stringify(rich)};
 await admin.post('/admin/manage/legal/save').type('form').send(fields).expect(302);
 const record=(await rows(db,'SELECT * FROM cms_managed_content WHERE slug="synthetic-formatted-policy"'))[0],draft=JSON.parse(record.draft);
 assert.equal(draft.sections[0].title,'Scope');assert.equal(draft.sections[0].paragraphs[0],'1.1 Approved emphasis');assert.deepEqual(draft.richText,rich);assert.equal(record.published,null);
 await admin.get(`/admin/manage/legal/${record.id}/preview`).expect(200).then(response=>assert.match(response.text,/<strong>Approved emphasis<\/strong>/));
 await admin.post('/admin/manage/legal/save').type('form').send({...fields,id:record.id,revision:record.revision,action:'publish'}).expect(302);
 const published=(await request(app).get('/api/site')).body.legalDocuments.find(document=>document.slug===fields.slug);assert.deepEqual(published.richText,rich);
});

test('General and internship applications accept private CVs without an open vacancy and validate team and consent',async()=>{
 await rows(db,'DELETE FROM cms_rate_limits');
 const guest=request.agent(app),csrf=(await guest.get('/api/csrf')).body.token;
 const send=(kind,{team='Production',consent='true',cv=Buffer.from('%PDF-1.4\nSynthetic application CV')}={})=>guest.post(`/api/careers/${kind}/applications`).set('X-CSRF-Token',csrf).field('name','Synthetic general applicant').field('email',`${kind}@example.test`).field('phone','1234567890').field('city','Dehradun').field('experience','2').field('role_title',kind==='internship'?'Development intern':'Production assistant').field('team',team).field('consent',consent).attach('attachment',cv,{filename:'synthetic-cv.pdf',contentType:'application/pdf'});
 const general=await send('general').expect(201);assert.match(general.body.reference,/^APP-/);
 const record=(await rows(db,'SELECT * FROM career_applications WHERE email="general@example.test"'))[0];
 assert.equal(record.career_id,null);assert.equal(record.application_type,'general');assert.equal(record.team,'Production');assert.equal(record.consent_version,'career-application-v2');assert.match(record.career_title,/Production assistant/);
 await send('internship',{team:'Development and Writing'}).expect(201);
 const internship=(await rows(db,'SELECT * FROM career_applications WHERE email="internship@example.test"'))[0];assert.equal(internship.application_type,'internship');assert.match(internship.career_title,/Development intern/);
 await send('general',{team:'Unknown team'}).expect(422);
 await send('general',{consent:'false'}).expect(422);
 await send('general',{cv:Buffer.from('not a PDF')}).expect(422);
 const feed=await request(app).get('/api/site').expect(200);assert.ok(!JSON.stringify(feed.body).includes('general@example.test'));
 const [admin]=await login('upload-admin');
 await admin.get(`/admin/applications/${record.id}`).expect(200).then(response=>{assert.match(response.text,/Production assistant/);assert.match(response.text,/Application type/);});
 const roles=await rows(db,'SELECT title,status FROM cms_entries WHERE type="career" AND slug IN ("development-executive","production-coordinator")');assert.equal(roles.length,2);assert.ok(roles.every(role=>role.status==='draft'));
});

test('News categories, lead stories and release PDFs are editable without publishing placeholders',async()=>{
 await rows(db,'DELETE FROM cms_rate_limits');const [editor,csrf]=await login('publishing-editor');
 const fields={_csrf:csrf,type:'news',title:'Synthetic featured news',summary:'Synthetic only',body:'Synthetic studio update',status:'published',category:'Productions',featured:'on'};
 await editor.post('/admin/news/save').type('form').send(fields).expect(302);
 const news=(await rows(db,'SELECT * FROM cms_entries WHERE title="Synthetic featured news"'))[0];
 const published=(await request(app).get('/api/site')).body.entries.find(entry=>entry.id===news.id);assert.equal(published.metadata.category,'Productions');assert.equal(published.metadata.featured,true);assert.ok(published.updated_at);
 await editor.post('/admin/news/save').type('form').send({...fields,id:news.id,category:'Press Releases',featured:''}).expect(422);
 await editor.post('/admin/news/save').type('form').send({...fields,id:news.id,category:'Press Releases',status:'draft',featured:''}).expect(302);
 await editor.post('/admin/news/save').type('form').send({...fields,id:news.id,category:'Press Releases',pdf_url:'javascript:alert(1)'}).expect(422);
 await editor.post('/admin/news/save').type('form').send({...fields,id:news.id,category:'Press Releases',pdf_url:'https://example.test/release.pdf',featured:''}).expect(302);
 const release=(await request(app).get('/api/site')).body.entries.find(entry=>entry.id===news.id);assert.equal(release.metadata.pdf_url,'https://example.test/release.pdf');
});

test('News alerts require email confirmation, retain verified preferences, and unsubscribe only on POST',async()=>{
 await rows(db,'DELETE FROM cms_rate_limits');
 const guest=request.agent(app),csrf=(await guest.get('/api/csrf')).body.token;
 const subscribe=topics=>guest.post('/api/newsletter/subscribe').set('X-CSRF-Token',csrf).send({email:'alerts@example.test',topics,consent:true});
 await subscribe(['Productions']).expect(202);
 let record=(await rows(db,'SELECT * FROM cms_news_subscriptions WHERE email="alerts@example.test"'))[0];assert.equal(record.status,'pending');assert.deepEqual(JSON.parse(record.topics),[]);
 const confirmation=(await rows(db,'SELECT body FROM cms_email_outbox WHERE recipient="alerts@example.test" ORDER BY id DESC LIMIT 1'))[0].body.match(/token=([a-f0-9]{64})/)[1];
 assert.notEqual(record.confirmation_hash,confirmation);
 await guest.get(`/api/newsletter/confirm?token=${confirmation}`).expect(200);
 assert.equal((await rows(db,'SELECT status FROM cms_news_subscriptions WHERE id=?',[record.id]))[0].status,'pending');
 await guest.post('/api/newsletter/confirm').type('form').send({token:confirmation}).expect(403);
 await guest.post('/api/newsletter/confirm').type('form').send({_csrf:csrf,token:confirmation}).expect(200);
 record=(await rows(db,'SELECT * FROM cms_news_subscriptions WHERE id=?',[record.id]))[0];assert.equal(record.status,'active');assert.deepEqual(JSON.parse(record.topics),['Productions']);assert.ok(record.consent_at);
 await guest.post('/api/newsletter/confirm').type('form').send({_csrf:csrf,token:confirmation}).expect(404);
 const unsubscribe=(await rows(db,'SELECT body FROM cms_email_outbox WHERE recipient="alerts@example.test" ORDER BY id DESC LIMIT 1'))[0].body.match(/token=([a-f0-9]{64})/)[1];
 await subscribe(['Press Releases']).expect(202);
 assert.deepEqual(JSON.parse((await rows(db,'SELECT topics FROM cms_news_subscriptions WHERE id=?',[record.id]))[0].topics),['Productions']);
 await guest.get(`/api/newsletter/unsubscribe?token=${unsubscribe}`).expect(200);
 assert.equal((await rows(db,'SELECT status FROM cms_news_subscriptions WHERE id=?',[record.id]))[0].status,'active');
 await guest.post('/api/newsletter/unsubscribe').type('form').send({_csrf:csrf,token:unsubscribe}).expect(200);
 assert.equal((await rows(db,'SELECT status FROM cms_news_subscriptions WHERE id=?',[record.id]))[0].status,'unsubscribed');
 await guest.post('/api/newsletter/unsubscribe').type('form').send({_csrf:csrf,token:unsubscribe}).expect(200);
 const feed=await request(app).get('/api/site').expect(200);assert.ok(!JSON.stringify(feed.body).includes('alerts@example.test'));
 const [admin]=await login('upload-admin'),[manager]=await login('enquiry_manager');
 await manager.get('/admin/newsletter').expect(403);await admin.get('/admin/newsletter').expect(200);
 await admin.get('/admin/newsletter/download.csv').expect(200).then(response=>assert.ok(!response.text.includes('alerts@example.test')));
 await request(app).get('/api/newsletter/styles.css').expect(200);
});

test('Separate media uploads persist before content save and support MP4 range playback',async()=>{
 await rows(db,'DELETE FROM cms_rate_limits');
 const [admin,csrf]=await login('upload-admin'),[manager,managerCsrf]=await login('enquiry_manager'),[editor,editorCsrf]=await login('publishing-editor');
 const image=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAEUlEQVQImWN4O83kPwgzwBgAYgIK2V6WzBUAAAAASUVORK5CYII=','base64');
 await admin.post('/admin/media/upload').set('Accept','application/json').attach('image',image,{filename:'stage.png',contentType:'image/png'}).expect(403);
 await manager.post('/admin/media/upload').set('Accept','application/json').field('_csrf',managerCsrf).attach('image',image,{filename:'stage.png',contentType:'image/png'}).expect(403);
 const before=Number((await rows(db,'SELECT COUNT(*) AS n FROM cms_entries'))[0].n);
 const uploaded=await editor.post('/admin/media/upload').set('Accept','application/json').field('_csrf',editorCsrf).field('alt','Staged banner').attach('image',image,{filename:'stage.png',contentType:'image/png'}).expect(201);
 assert.equal(uploaded.body.mime,'image/webp');assert.equal(Number((await rows(db,'SELECT COUNT(*) AS n FROM cms_entries'))[0].n),before);
 await request(app).get(uploaded.body.url).expect(200).expect('Content-Type',/image\/webp/);
 await editor.post('/admin/news/save').type('form').send({_csrf:editorCsrf,type:'news',title:'Staged media post',status:'draft',image_id:uploaded.body.id}).expect(302);
 assert.equal((await rows(db,'SELECT image_id FROM cms_entries WHERE title=?',['Staged media post']))[0].image_id,uploaded.body.id);
 await admin.post('/admin/media/upload').set('Accept','application/json').field('_csrf',csrf).field('kind','video').field('alt','Invalid video').attach('image',Buffer.from('not a video'),{filename:'bad.mp4',contentType:'video/mp4'}).expect(422);
 const video=await readFile(new URL('../../rain-temp/public/assets/motion-films/period-intrigue-preview.mp4',import.meta.url));
 await editor.post('/admin/media/upload').set('Accept','application/json').field('_csrf',editorCsrf).field('kind','video').field('alt','Editor video').attach('image',video,{filename:'clip.mp4',contentType:'video/mp4'}).expect(201);
 const clip=await admin.post('/admin/media/upload').set('Accept','application/json').field('_csrf',csrf).field('kind','video').field('alt','Hero clip').attach('image',video,{filename:'clip.mp4',contentType:'video/mp4'}).expect(201);
 assert.match(clip.body.url,/\/video\.mp4$/);
 await request(app).get(clip.body.url).set('Range','bytes=0-99').expect(206).expect('Content-Type',/video\/mp4/);
 await admin.post('/admin/news/save').type('form').send({_csrf:csrf,type:'news',title:'Video is not a banner',status:'draft',image_id:clip.body.id}).expect(422);
 const form=await admin.get('/admin/content/new?type=news').expect(200);assert.ok(!form.text.includes(`value="${clip.body.id}"`));assert.match(form.text,/media-upload\.js/);
});

test('Format pages and productions publish optional videos with a poster and caption',async()=>{
 await rows(db,'DELETE FROM cms_rate_limits');
 const [editor,csrf]=await login('publishing-editor');
 const video=(await rows(db,'SELECT id FROM cms_media WHERE mime="video/mp4" ORDER BY id DESC LIMIT 1'))[0];
 const image=(await rows(db,'SELECT id FROM cms_media WHERE mime="image/webp" ORDER BY id DESC LIMIT 1'))[0];
 const video_url=`/media/${video.id}/video.mp4`;
 for(const page of ['feature-films','series-ott','documentaries','productions']){
  const form=await editor.get(`/admin/content/new?type=page&page=${page}`).expect(200);assert.match(form.text,/data-content-video/);
  const fields={_csrf:csrf,type:'page',page,title:`Video section ${page}`,status:'draft',video_url,image_id:image.id,video_caption:'Official trailer'};
  await editor.post('/admin/content/save').type('form').send({...fields,image_id:''}).expect(422);
  await editor.post('/admin/content/save').type('form').send({...fields,video_caption:''}).expect(422);
  await editor.post('/admin/content/save').type('form').send({...fields,video_url:'javascript:alert(1)'}).expect(422);
  await editor.post('/admin/content/save').type('form').send(fields).expect(302);
  const record=(await rows(db,'SELECT id FROM cms_entries WHERE title=?',[fields.title]))[0];
  assert.ok(!(await request(app).get('/api/site')).body.entries.some(e=>e.id===record.id));
  const preview=await editor.get(`/admin/content/${record.id}/preview`).expect(200);assert.ok(preview.text.includes(video_url));
  await editor.post('/admin/content/save').type('form').send({...fields,id:record.id,status:'published'}).expect(302);
  const entry=(await request(app).get('/api/site')).body.entries.find(e=>e.id===record.id);assert.equal(entry.metadata.video_url,video_url);assert.equal(entry.metadata.video_caption,'Official trailer');assert.ok(entry.image_url);
 }
 const production={_csrf:csrf,type:'production',title:'Video production fixture',status:'published',production_stage:'released',format:'Feature Films',video_url,image_id:image.id,video_caption:'Official teaser'};
 await editor.post('/admin/content/save').type('form').send(production).expect(302);
 await editor.post(`/admin/media/${video.id}/delete`).type('form').send({_csrf:csrf}).expect(409);
 await editor.post('/admin/content/save').type('form').send({...production,type:'page',page:'about'}).expect(422);
 await editor.post('/admin/content/save').type('form').send({...production,video_url:'/media/999999/video.mp4'}).expect(422);
 await editor.post('/admin/content/save').type('form').send({...production,title:'Image-only production fixture',video_url:'',video_caption:''}).expect(302);
});

test('CMS page controls cover the shared frontend page registry and preserve homepage and blog placements',async()=>{
 await rows(db,'DELETE FROM cms_rate_limits');
 const [editor,csrf]=await login('publishing-editor');
 const pages=JSON.parse(await readFile(new URL('../../shared/content-pages.json',import.meta.url),'utf8'));
 const {pageInfo}=await import('../../rain-temp/src/pageInfo.js');
 const controls=await editor.get('/admin/pages').expect(200);
 for(const page of pages){
  assert.ok(pageInfo[page.key],`Frontend page missing for ${page.key}`);
  const edit=await editor.get(`/admin/content/new?type=page&page=${page.key}`).expect(200);
  assert.ok(edit.text.includes(`value="${page.key}" selected`),`Missing page option ${page.key}`);
  await editor.post('/admin/content/save').type('form').send({_csrf:csrf,type:'page',page:page.key,title:`Registry audit ${page.key}`,body:'Synthetic page content',status:'published'}).expect(302);
  const list=await editor.get(`/admin/content?type=page&page=${page.key}`).expect(200);assert.ok(list.text.includes(`Registry audit ${page.key}`));
 }
 const publicEntries=(await request(app).get('/api/site')).body.entries;
 for(const page of pages)assert.ok(publicEntries.some(entry=>entry.type==='page'&&entry.metadata.page===page.key&&entry.title===`Registry audit ${page.key}`));
 assert.match(controls.text,/Additional published page sections/);
 await editor.post('/admin/content/save').type('form').send({_csrf:csrf,type:'page',page:'not-a-page',title:'Invalid target',status:'published'}).expect(422);
 for(const home_slot of ['hero','section']){
  await editor.post('/admin/content/save').type('form').send({_csrf:csrf,type:'home',title:`Homepage audit ${home_slot}`,home_slot,status:'published'}).expect(302);
  assert.ok((await request(app).get('/api/site')).body.entries.some(entry=>entry.title===`Homepage audit ${home_slot}`&&entry.metadata.home_slot===home_slot));
 }
 await editor.post('/admin/blog/save').type('form').send({_csrf:csrf,type:'blog',title:'Category audit blog',category:'Post-production',status:'published'}).expect(302);
 assert.equal((await request(app).get('/api/site')).body.entries.find(entry=>entry.title==='Category audit blog').metadata.category,'Post-production');
});

test('Public contact settings resolve to consistent links and fall back to approved defaults',async()=>{
 const {getStudioContacts,studioEmail,studioPhone}=await import('../../rain-temp/src/studioContact.js');
 const custom=getStudioContacts({contact_email:'studio@example.test',contact_phone:'+91 (123) 456-7890'});assert.equal(custom.email,'studio@example.test');assert.equal(custom.phone,'+91 (123) 456-7890');assert.equal(custom.phoneHref,'tel:+911234567890');
 assert.equal(getStudioContacts({contact_email:'bad',contact_phone:'sample'}).email,studioEmail);
 assert.equal(getStudioContacts().phone,studioPhone);
 await rows(db,'DELETE FROM cms_rate_limits');const [freshAdmin]=await login('upload-admin');
 const header=await freshAdmin.get('/admin/pages').expect(200);assert.ok(!header.text.includes('href="/admin/content?type=legal"'));
 assert.match(header.text,/\/admin\/manage\/legal/);
});

test('Existing website content supports private drafts, optimistic publishing, defaults and restoration',async()=>{
 await rows(db,'DELETE FROM cms_rate_limits');const [admin,csrf]=await login('upload-admin'),[editor,editorCsrf]=await login('publishing-editor'),[manager]=await login('enquiry_manager');
 const {siteModuleCatalogue}=await import('../src/site-modules.js');const key='copy:ProductionsPage',module=siteModuleCatalogue.get(key),field=module.fields.find(f=>f.default.includes('Stories taking shape'))||module.fields[0];
 const body={_csrf:editorCsrf,module_key:key,revision:0,action:'draft'};for(const item of module.fields)body[`value:${item.key}`]=item.default;
 body[`value:${field.key}`]='An edited studio heading';
 await manager.get('/admin/site-content').expect(403);await editor.get('/admin/site-content').expect(200);await editor.get('/admin/site-content/edit?key=navigation').expect(403);
 await editor.post('/admin/site-content/save').type('form').send(body).expect(302);
 assert.ok(!(await request(app).get('/api/site')).body.siteModules[key]);
 const multipart=editor.post('/admin/site-content/save');for(const [name,value]of Object.entries({...body,revision:1,action:'publish'}))multipart.field(name,String(value));await multipart.expect(302);
 let feed=(await request(app).get('/api/site')).body;assert.equal(feed.siteModules[key][field.key],'An edited studio heading');
 await editor.post('/admin/site-content/save').type('form').send({...body,revision:1,action:'publish'}).expect(409);
 const runtime=await import('../../rain-temp/src/siteContent.js');runtime.setSiteModules(feed.siteModules);assert.equal(runtime.cmsText('ProductionsPage',field.key,field.default),'An edited studio heading');const values=runtime.cmsData(()=>[runtime.cmsText('ProductionsPage',field.key,field.default)]);assert.deepEqual([...values],['An edited studio heading']);
 await editor.post('/admin/site-content/save').type('form').send({...body,revision:2,action:'reset'}).expect(302);feed=(await request(app).get('/api/site')).body;runtime.setSiteModules(feed.siteModules);assert.equal(values[0],field.default);
 await editor.post('/admin/site-content/save').type('form').send({...body,revision:3,action:'restore',restore_revision:2}).expect(302);const restored=(await rows(db,'SELECT draft,published FROM cms_site_modules WHERE module_key=?',[key]))[0];assert.equal(JSON.parse(restored.draft)[field.key],'An edited studio heading');assert.equal(restored.published,null);
 const navBody={_csrf:csrf,module_key:'navigation',revision:0,action:'draft'};for(const f of siteModuleCatalogue.get('navigation').fields)if(f.type==='boolean')navBody[`value:${f.key}`]='on';else navBody[`value:${f.key}`]=f.default;
 navBody['value:header.0.href']='javascript:alert(1)';await admin.post('/admin/site-content/save').type('form').send(navBody).expect(422);
});

test('CMS uploads PDF resources and subtitle tracks with validated media routes',async()=>{
 await rows(db,'DELETE FROM cms_rate_limits');const [editor,csrf]=await login('publishing-editor');
 const pdf=await editor.post('/admin/media/upload').set('Accept','application/json').field('_csrf',csrf).field('kind','document').field('alt','Press fact sheet').attach('image',Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF'),{filename:'facts.pdf',contentType:'application/pdf'}).expect(201);
 await request(app).get(pdf.body.url).expect(200).expect('Content-Type',/application\/pdf/);await request(app).get(`/media/${pdf.body.id}/video.mp4`).expect(404);
 const subtitle=await editor.post('/admin/media/upload').set('Accept','application/json').field('_csrf',csrf).field('kind','captions').field('alt','English subtitles').attach('image',Buffer.from('WEBVTT\n\n00:00.000 --> 00:02.000\nWelcome to the studio.\n'),{filename:'english.vtt',contentType:'text/vtt'}).expect(201);
 await request(app).get(subtitle.body.url).expect(200).expect('Content-Type',/text\/vtt/);
 await editor.post('/admin/media/upload').set('Accept','application/json').field('_csrf',csrf).field('kind','captions').field('alt','Bad captions').attach('image',Buffer.from('<script>bad</script>'),{filename:'bad.vtt',contentType:'text/vtt'}).expect(422);
 await editor.post('/admin/content/save').type('form').send({_csrf:csrf,type:'press_asset',title:'Uploaded fact sheet',asset_url:pdf.body.url,usage:'Editorial use',status:'published'}).expect(302);
 await editor.post('/admin/news/save').type('form').send({_csrf:csrf,type:'news',title:'Uploaded PDF press release',category:'Press Releases',pdf_url:pdf.body.url,status:'published'}).expect(302);
});

test('News campaigns queue only confirmed topical subscribers and recheck consent before delivery',async()=>{
 await rows(db,'DELETE FROM cms_rate_limits');const [admin,csrf]=await login('upload-admin'),[editor]=await login('publishing-editor');
 const {createHmac}=await import('node:crypto');const {digest}=await import('../src/security.js');const {deliverReceipt}=await import('../src/mail.js');
 await rows(db,"UPDATE cms_email_outbox SET available_at=DATE_ADD(UTC_TIMESTAMP(),INTERVAL 1 DAY) WHERE status IN ('pending','sending')");
 const result=await rows(db,"INSERT INTO cms_news_subscriptions(email,status,topics,consent_version,consent_at) VALUES('campaign-fixture@example.test','active',?, 'test',UTC_TIMESTAMP())",[JSON.stringify(['Productions'])]);const subId=result.insertId;const token=createHmac('sha256',process.env.SESSION_SECRET).update(`news-unsubscribe:${subId}:campaign-fixture@example.test`).digest('hex');await rows(db,'UPDATE cms_news_subscriptions SET unsubscribe_hash=? WHERE id=?',[digest(token),subId]);
 const story=(await rows(db,"SELECT id FROM cms_entries WHERE type='news' AND status='published' AND published_at<=UTC_TIMESTAMP() LIMIT 1"))[0];
 await editor.get('/admin/news-campaigns').expect(403);
 await admin.post('/admin/news-campaigns').type('form').send({_csrf:csrf,news_id:story.id,subject:'Synthetic campaign',message:'Studio announcement for the isolated test only.',topics:'Productions'}).expect(302);
 const campaign=(await rows(db,"SELECT id FROM cms_news_campaigns WHERE subject='Synthetic campaign'"))[0];
 assert.equal((await rows(db,'SELECT COUNT(*) AS n FROM cms_email_outbox WHERE campaign_id=?',[campaign.id]))[0].n,0);
 await admin.get(`/admin/news-campaigns/${campaign.id}`).expect(200);await admin.post(`/admin/news-campaigns/${campaign.id}/queue`).type('form').send({_csrf:csrf}).expect(422);
 await admin.post(`/admin/news-campaigns/${campaign.id}/queue`).type('form').send({_csrf:csrf,confirm:'queue'}).expect(302);await admin.post(`/admin/news-campaigns/${campaign.id}/queue`).type('form').send({_csrf:csrf,confirm:'queue'}).expect(409);
 const emails=await rows(db,'SELECT * FROM cms_email_outbox WHERE campaign_id=?',[campaign.id]);assert.equal(emails.length,1);assert.match(emails[0].body,/unsubscribe\?token=/);
 await rows(db,"UPDATE cms_news_subscriptions SET status='unsubscribed' WHERE id=?",[subId]);let sent=0;await deliverReceipt(db,{sendMail:async()=>{sent++;return {accepted:['synthetic'],messageId:'test'}}},'studio@example.test');assert.equal(sent,0);assert.equal((await rows(db,'SELECT status FROM cms_email_outbox WHERE id=?',[emails[0].id]))[0].status,'cancelled');
});

test('Published-content pagination reaches every record without admitting later insertions',async()=>{
 for(let i=0;i<335;i++)await rows(db,"INSERT INTO cms_entries(type,title,slug,summary,body,metadata,status,published_at) VALUES('page',?,?,'','',?,'published',UTC_TIMESTAMP())",[`Pagination content ${i}`,`pagination-content-${i}`,JSON.stringify({page:'about'})]);
 const expected=Number((await rows(db,"SELECT COUNT(*) AS n FROM cms_entries WHERE type<>'legal' AND status='published' AND published_at<=UTC_TIMESTAMP()"))[0].n);
 const first=(await request(app).get('/api/site').expect(200)).body;assert.equal(first.entries.length,300);assert.ok(first.nextCursor);
 await rows(db,"INSERT INTO cms_entries(type,title,slug,summary,body,metadata,status,published_at) VALUES('page','Inserted later','inserted-later','','','{}','published',UTC_TIMESTAMP())");
 const records=[...first.entries];let cursor=first.nextCursor;while(cursor){const page=(await request(app).get('/api/site').query({cursor}).expect(200)).body;records.push(...page.entries);cursor=page.nextCursor;}
 assert.equal(records.length,expected);assert.equal(new Set(records.map(e=>e.id)).size,expected);assert.ok(!records.some(e=>e.slug==='inserted-later'));
 await request(app).get('/api/site?cursor=invalid').expect(422);
});

test('Legacy legal entry controls delegate to the managed editor and reject disconnected writes',async()=>{
 await rows(db,'DELETE FROM cms_rate_limits');const [admin,csrf]=await login('upload-admin'),[editor]=await login('publishing-editor');
 const inserted=await rows(db,"INSERT INTO cms_entries(type,title,slug,summary,body,metadata,status,published_at) VALUES('legal','Preserved legacy legal record','preserved-legacy-legal-record','','','{}','published',UTC_TIMESTAMP())");
 await admin.get('/admin/content?type=legal').expect(302).expect('Location','/admin/manage/legal');await admin.get('/admin/content/new?type=legal').expect(302);
 await admin.get(`/admin/content/${inserted.insertId}`).expect(302);await editor.get(`/admin/content/${inserted.insertId}`).expect(403);
 await admin.post('/admin/content/save').type('form').send({_csrf:csrf,type:'legal',title:'Wrong publishing path',status:'published',page:'legal'}).expect(422);
 await admin.post(`/admin/content/${inserted.insertId}/archive`).type('form').send({_csrf:csrf}).expect(422);
 await admin.post('/admin/tables/content/bulk').type('form').send({_csrf:csrf,ids:[inserted.insertId],status:'archived'}).expect(422);
 const published=(await request(app).get('/api/site')).body;assert.ok(!published.entries.some(entry=>entry.id===inserted.insertId));
});

test('Media library lists video, PDF and subtitle assets with format filters and protected usage',async()=>{
 await rows(db,'DELETE FROM cms_rate_limits');const [admin]=await login('upload-admin');
 const all=await admin.get('/admin/media').expect(200);assert.match(all.text,/Media library/);assert.match(all.text,/clip\.mp4/);assert.match(all.text,/facts\.pdf/);assert.match(all.text,/english\.vtt/);
 const pdf=await admin.get('/admin/media?format=application%2Fpdf').expect(200);assert.match(pdf.text,/facts\.pdf/);assert.ok(!pdf.text.includes('clip.mp4'));
 const used=await admin.get('/admin/media?format=application%2Fpdf&usage=used').expect(200);assert.match(used.text,/facts\.pdf/);
});

test('Leadership portrait and supplied founder content have dedicated draft and publishing controls',async()=>{
 await rows(db,'DELETE FROM cms_rate_limits');const [editor,csrf]=await login('publishing-editor');const {siteModuleCatalogue}=await import('../src/site-modules.js');const module=siteModuleCatalogue.get('leadership');assert.ok(module);
 const defaults=JSON.parse(await readFile(new URL('../../shared/leadership-content.json',import.meta.url),'utf8'));assert.equal(defaults.name,'Dev Raturi');assert.equal(defaults.screenWork.length,3);assert.ok(defaults.paragraphs.some(text=>text.includes('December 2026')));
 const form=await editor.get('/admin/site-content/edit?key=leadership').expect(200);assert.match(form.text,/Portrait image/);assert.match(form.text,/data-image-url/);
 const body={_csrf:csrf,module_key:'leadership',revision:0,action:'draft'};for(const field of module.fields)body[`value:${field.key}`]=field.default;
 body['value:quote']='Synthetic private quote';await editor.post('/admin/site-content/save').type('form').send(body).expect(302);assert.ok(!(await request(app).get('/api/site')).body.siteModules.leadership);
 await editor.post('/admin/site-content/save').type('form').send({...body,revision:1,action:'publish'}).expect(302);assert.equal((await request(app).get('/api/site')).body.siteModules.leadership.quote,'Synthetic private quote');
});

test('KPI workspace enforces roles, provenance, stale writes and business-outcome evidence',async()=>{
 for(const [key,role] of [['kpi-admin','admin'],['kpi-editor','editor'],['kpi-manager','enquiry_manager']])await rows(db,'INSERT INTO cms_users(name,email,password_hash,role) VALUES(?,?,?,?)',[key,`${key}@test.local`,await hashPassword('A-secure-test-password'),role]);
 const [admin,csrfAdmin]=await login('kpi-admin'),[editor]=await login('kpi-editor'),[manager,csrfManager]=await login('kpi-manager');
 const {buildScorecard,periodFor}=await import('../src/kpi.js');
 for(const url of ['/admin/kpi','/admin/kpi/settings','/admin/kpi/export.csv'])await request(app).get(url).expect(302);
 await editor.get('/admin/kpi').expect(403);await editor.get('/admin/kpi/export.csv').expect(403);
 await manager.get('/admin/kpi/settings').expect(403);
 await admin.post('/admin/kpi/settings').type('form').send({version:'1'}).expect(403);
 const setting={_csrf:csrfAdmin,version:'1',categories:['business','production'],amberPercent:'80','weekly:leads':'3','weekly:converted':'1','weekly:conversion_rate':'30','weekly:sessions':'100','weekly:operation_failures':'0'};
 await manager.post('/admin/kpi/settings').type('form').send({...setting,_csrf:csrfManager}).expect(403);
 await admin.post('/admin/kpi/settings').type('form').send(setting).expect(302);
 await admin.post('/admin/kpi/settings').type('form').send(setting).expect(409);
 const ids=[];
 const add=async(category,status,at)=>{const r=await rows(db,'INSERT INTO cms_enquiries(category,name,email,subject,message,status,consent_at,consent_version,created_at,source) VALUES(?,?,?,?,?,?,UTC_TIMESTAMP(),?,?,?)',[category,'KPI synthetic person','kpi-person@test.local','KPI fixture','Synthetic test enquiry',status,'test',at,'=source-formula']);ids.push(r.insertId);return r.insertId;};
 const first=await add('business','closed','2025-01-06 00:00:00');
 const second=await add('production','converted','2025-01-12 23:59:59');
 await add('business','spam','2025-01-08 10:00:00');await add('careers','converted','2025-01-08 10:00:00');
 await add('business','new','2025-01-13 00:00:00');
 for(const [id,to,when]of [[first,'qualified','2025-01-07 10:00:00'],[first,'closed','2025-01-08 10:00:00'],[second,'converted','2025-01-12 23:59:59'],[first,'converted','2025-01-13 00:00:00']])await rows(db,'INSERT INTO cms_enquiry_history(enquiry_id,to_status,created_at) VALUES(?,?,?)',[id,to,when]);
 const previous=await add('business','converted','2024-12-30 10:00:00');
 await rows(db,"INSERT INTO cms_enquiry_history(enquiry_id,to_status,created_at) VALUES(?,'converted','2024-12-31 10:00:00')",[previous]);
 const period=periodFor('weekly','2025-01-08');let card=await buildScorecard(db,period);
 const metric=key=>card.metrics.find(m=>m.key===key);
 assert.equal(metric('leads').actual,2);assert.equal(metric('qualified').actual,2);assert.equal(metric('converted').actual,1);assert.equal(metric('conversion_rate').actual,50);assert.equal(metric('converted').previous,1);assert.equal(metric('sessions').actual,null);assert.equal(metric('search_ctr').actual,null);
 const input={_csrf:csrfAdmin,cadence:'weekly',date:'2025-01-08',version:'0',sessions:'100',engaged_sessions:'60',organic_sessions:'20',tracked_enquiries:'5',ga4_reference:'=GA4 export 2025-01-06',ga4_filters:'Property 123, UTC, successful enquiry event, all traffic',ga4_extracted_on:'2025-01-14',search_clicks:'5',search_impressions:'100',gsc_reference:'GSC exact week export',gsc_filters:'KEMSOR domain, web search, all devices, source timezone',gsc_extracted_on:'2025-01-14',executive:'Two business enquiries; one converted milestone.',observations:'Outcomes reviewed independently from traffic.',root_causes:'Cohort evidence reviewed.',seo_review:'Five search clicks from the referenced export.',technical_review:'No uptime or security certification inferred.'};
 await manager.post('/admin/kpi/inputs').type('form').send({...input,_csrf:csrfManager}).expect(403);
 await admin.post('/admin/kpi/inputs').type('form').send({...input,ga4_reference:''}).expect(422);
 await admin.post('/admin/kpi/inputs').type('form').send(input).expect(302);
 await admin.post('/admin/kpi/inputs').type('form').send(input).expect(409);
 card=await buildScorecard(db,period);assert.equal(metric('engagement_rate').actual,60);assert.equal(metric('search_ctr').actual,5);
 await manager.get('/admin/kpi?cadence=weekly&date=2025-01-08').expect(200).expect(/Target vs actual/);
 for(const cadence of ['monthly','quarterly'])await admin.get(`/admin/kpi?cadence=${cadence}&date=2025-01-08`).expect(200);
 await admin.get('/admin/kpi?date=2025-02-30').expect(422);
 const owner=(await rows(db,"SELECT id FROM cms_users WHERE email='kpi-manager@test.local'"))[0].id;
 await manager.post('/admin/kpi/actions').type('form').send({_csrf:csrfManager,cadence:'weekly',date:period.start,title:'Improve qualified lead conversion',metric_key:'converted',owner_id:String(owner),due_date:'2025-01-20',expected_outcome:'Convert one additional qualified lead.'}).expect(302);
 const action=(await rows(db,'SELECT * FROM cms_kpi_actions ORDER BY id DESC LIMIT 1'))[0];
 await manager.post(`/admin/kpi/actions/${action.id}`).type('form').send({_csrf:csrfManager,version:'1',status:'done',evidence:''}).expect(422);
 await manager.post(`/admin/kpi/actions/${action.id}`).type('form').send({_csrf:csrfManager,version:'1',status:'in_progress',evidence:'Review started.'}).expect(302);
 await manager.post(`/admin/kpi/actions/${action.id}`).type('form').send({_csrf:csrfManager,version:'1',status:'done',evidence:'Recorded conversion reviewed.'}).expect(409);
 const create={_csrf:csrfManager,cadence:'weekly',date:period.start,configuration_version:'2',input_version:'1'};
 await manager.post('/admin/kpi/snapshots').type('form').send({...create,input_version:'0'}).expect(409);
 const response=await manager.post('/admin/kpi/snapshots').type('form').send(create).expect(302);
 const reportUrl=response.headers.location.split('?')[0],id=reportUrl.split('/').at(-1);
 await admin.get(reportUrl).expect(200).expect(/frozen/);
 const summary=await admin.get(reportUrl+'?view=summary').expect(200);assert.match(summary.text,/kpi-summary-view/);
 await manager.post(reportUrl+'/approve').type('form').send({_csrf:csrfManager,confirm:'approve'}).expect(403);
 await admin.post(reportUrl+'/approve').type('form').send({_csrf:csrfAdmin,confirm:'approve'}).expect(302);
 await admin.post(reportUrl+'/approve').type('form').send({_csrf:csrfAdmin,confirm:'approve'}).expect(409);
 const csv=await manager.get('/admin/kpi/export.csv?report='+id).expect(200).expect('Content-Type',/text\/csv/);
 assert.match(csv.text,/'=GA4 export/);assert.ok(!csv.text.includes('kpi-person@test.local'));assert.match(csv.text,/Approved/);assert.match(csv.text,/Review started/);
 const original=(await rows(db,'SELECT snapshot FROM cms_kpi_reports WHERE id=?',[id]))[0].snapshot;
 await admin.post('/admin/kpi/inputs').type('form').send({...input,version:'1',sessions:'200'}).expect(302);
 for(const enquiry of ids)await rows(db,'DELETE FROM cms_enquiries WHERE id=?',[enquiry]);
 const after=(await rows(db,'SELECT snapshot FROM cms_kpi_reports WHERE id=?',[id]))[0].snapshot;
 assert.deepEqual(after,original);const frozen=typeof after==='string'?JSON.parse(after):after;assert.equal(frozen.metrics.find(m=>m.key==='sessions').actual,100);assert.equal(frozen.metrics.find(m=>m.key==='leads').actual,2);
 const live=await buildScorecard(db,period);assert.equal(live.metrics.find(m=>m.key==='leads').actual,0);assert.equal(live.metrics.find(m=>m.key==='conversion_rate').actual,null);
});
test('KPI approval rejects incomplete commentary and provisional period snapshots',async()=>{
 const [admin,csrfAdmin]=await login('kpi-admin');
 const period={_csrf:csrfAdmin,cadence:'weekly',date:'2025-02-03',configuration_version:'2',input_version:'0'};
 const create=await admin.post('/admin/kpi/snapshots').type('form').send(period).expect(302);
 await admin.post(create.headers.location.split('?')[0]+'/approve').type('form').send({_csrf:csrfAdmin,confirm:'approve'}).expect(422);
 const current=await admin.post('/admin/kpi/snapshots').type('form').send({...period,date:new Date().toISOString().slice(0,10)}).expect(302);
 await admin.post(current.headers.location.split('?')[0]+'/approve').type('form').send({_csrf:csrfAdmin,confirm:'approve'}).expect(422);
});

test('Scheduled KPI drafts are opt-in, deduplicated and never auto-approved',async()=>{
 const {generateDueReports}=await import('../src/kpi-worker.js');
 assert.deepEqual(await generateDueReports(db,'2025-03-10'),[]);
 const setting=(await rows(db,'SELECT configuration FROM cms_kpi_settings WHERE id=1'))[0];
 const config=typeof setting.configuration==='string'?JSON.parse(setting.configuration):setting.configuration;
 await rows(db,'UPDATE cms_kpi_settings SET configuration=? WHERE id=1',[JSON.stringify({...config,automaticDrafts:true})]);
 const generated=await generateDueReports(db,'2025-03-10');assert.equal(generated.length,3);
 assert.deepEqual(await generateDueReports(db,'2025-03-10'),[]);
 const reports=await rows(db,'SELECT * FROM cms_kpi_reports WHERE automatic_key IS NOT NULL');
 assert.deepEqual(new Set(reports.map(r=>r.cadence)),new Set(['weekly','monthly','quarterly']));
 for(const report of reports){assert.equal(report.approved_at,null);const snapshot=typeof report.snapshot==='string'?JSON.parse(report.snapshot):report.snapshot;assert.equal(snapshot.origin,'scheduled');assert.equal(snapshot.period.inProgress,false);}
 await rows(db,'UPDATE cms_kpi_settings SET configuration=? WHERE id=1',[JSON.stringify({...config,automaticDrafts:false})]);
 assert.deepEqual(await generateDueReports(db,'2025-04-01'),[]);
});

test('Editorial copy migration preserves legal wording, custom copy, CMS keys and revision history',async()=>{
 const {executeMigration}=await import('../src/run-migration.js');
 const updates=JSON.parse(await readFile(new URL('../../shared/editorial-copy-updates.json',import.meta.url),'utf8'));
 const before='Bring us your story — at any stage.',after=updates[before];
 const original={headline:before,custom:'Studio-approved custom copy',url:'/productions/'};
 await rows(db,'INSERT INTO cms_site_modules(module_key,draft,published,revision) VALUES(?,?,?,1)',['copy-review-fixture',JSON.stringify(original),JSON.stringify(original)]);
 const hero=(await rows(db,"INSERT INTO cms_managed_content(kind,slug,draft,published) VALUES('hero','copy-review-hero',?,?)",[JSON.stringify({title:before}),JSON.stringify({title:before})])).insertId;
 const legal=(await rows(db,"INSERT INTO cms_managed_content(kind,slug,draft,published) VALUES('legal','copy-review-legal',?,?)",[JSON.stringify({title:'Terms',content:before}),JSON.stringify({title:'Terms',content:before})])).insertId;
 const article=(await rows(db,"INSERT INTO cms_entries(type,title,slug,summary,body,metadata,status) VALUES('blog',?,'copy-review-story',?,?,?,'published')",[before,before,`First paragraph.\n\n${before}`,JSON.stringify({rich_text:{type:'doc',content:[{type:'paragraph',content:[{type:'text',text:before}]}]}})])).insertId;
 await rows(db,'INSERT INTO cms_settings(name,value) VALUES(?,?) ON DUPLICATE KEY UPDATE value=VALUES(value)',['footer_description',JSON.stringify('From the first idea to the finished frame.\r\nBring us your story — we’ll find the next step.')]);
 await executeMigration(db,await readFile(new URL('../migrations/025_editorial_copy_review.sql',import.meta.url),'utf8'));
 const decode=v=>typeof v==='string'?JSON.parse(v):v;
 const module=(await rows(db,"SELECT * FROM cms_site_modules WHERE module_key='copy-review-fixture'"))[0];assert.equal(module.revision,2);assert.deepEqual(decode(module.published),{...original,headline:after});
 const history=await rows(db,"SELECT * FROM cms_site_module_revisions WHERE module_key='copy-review-fixture' ORDER BY revision");assert.equal(history.length,2);assert.equal(decode(history[0].snapshot).published.headline,before);assert.equal(decode(history[1].snapshot).published.headline,after);
 const h=(await rows(db,'SELECT * FROM cms_managed_content WHERE id=?',[hero]))[0];assert.equal(h.revision,2);assert.equal(decode(h.published).title,after);
 assert.equal(decode((await rows(db,'SELECT published FROM cms_managed_content WHERE id=?',[legal]))[0].published).content,before);
 const entry=(await rows(db,'SELECT * FROM cms_entries WHERE id=?',[article]))[0];assert.equal(entry.title,after);assert.match(entry.body,/Bring us your story at any stage\./);assert.equal(decode(entry.metadata).rich_text.content[0].content[0].text,after);
 assert.equal((await settings(db)).footer_description,'For production enquiries and collaborations,\nget in touch with the studio.');
 // A deployment retry does not rewrite matching custom values or add duplicate revisions.
 await executeMigration(db,await readFile(new URL('../migrations/025_editorial_copy_review.sql',import.meta.url),'utf8'));
 assert.equal((await rows(db,"SELECT revision FROM cms_site_modules WHERE module_key='copy-review-fixture'"))[0].revision,2);
});

test('Client contact correction separates landline, calls and WhatsApp, and remains CMS editable',async()=>{
 const {executeMigration}=await import('../src/run-migration.js');
 await executeMigration(db,await readFile(new URL('../migrations/026_client_contact_details.sql',import.meta.url),'utf8'));
 const values=(await request(app).get('/api/site').expect(200)).body.settings;
 assert.equal(values.contact_phone,'8679997765');assert.equal(values.contact_landline,'0135-4097742');assert.equal(values.contact_whatsapp,'8679997761');assert.equal(values.contact_website,'https://www.kemsorstudios.com');assert.match(values.contact_address,/Indraprasth Colony/);assert.match(values.contact_address,/248001/);assert.equal(values.map_location,values.contact_address);
 const [account,csrf]=await login('kpi-admin');
 const form=await account.get('/admin/settings').expect(200);assert.match(form.text,/Mobile \(calls only\)/);assert.match(form.text,/WhatsApp only/);
 for(const update of [{contact_landline:'javascript:alert(1)'},{contact_whatsapp:'https://example.test'},{contact_website:'javascript:alert(1)'},{contact_website:'https://user:secret@example.test/'}])await account.post('/admin/settings').type('form').send({_csrf:csrf,...update}).expect(422);
 const response=await account.post('/admin/settings').field('_csrf',csrf).field('contact_phone','8679997765').field('contact_landline','0135-4097742').field('contact_whatsapp','8679997761').field('contact_website','https://www.kemsorstudios.com').field('contact_address',values.contact_address).field('contact_note','').field('map_location',values.contact_address).field('map_caption','Nathanpur, Dehradun').field('footer_kicker','Studio').field('footer_title','Talk to').field('footer_accent','KEMSOR').field('footer_description','Contact our team.').field('footer_cta_label','Contact').field('footer_copyright','KEMSOR').field('footer_social_label','Follow us').field('facebook','').field('instagram','').field('youtube','').field('linkedin','').field('script_terms','').field('script_terms_version','').field('privacy_notice','').field('consent_version','').field('contact_email','info@kemsorstudio.com').field('extra1','').field('extra2','').field('extra3','').expect(302);
 assert.equal(response.headers.location,'/admin/settings?saved=1');
 const saved=(await request(app).get('/api/site')).body.settings;assert.equal(saved.contact_landline,'0135-4097742');assert.equal(saved.contact_whatsapp,'8679997761');
 const {getStudioContacts,internationalPhone}=await import('../../rain-temp/src/studioContact.js');
 const contacts=getStudioContacts(saved);assert.equal(contacts.phoneHref,'tel:+918679997765');assert.equal(contacts.landlineHref,'tel:+911354097742');assert.equal(contacts.whatsappHref,'https://wa.me/918679997761');assert.equal(contacts.websiteLabel,'www.kemsorstudios.com');assert.equal(internationalPhone('+44 20 7946 0018'),'+442079460018');
 assert.equal(getStudioContacts({contact_whatsapp:'',contact_landline:'',contact_website:''}).whatsappHref,'');
});
