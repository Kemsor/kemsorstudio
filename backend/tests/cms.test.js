import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import mysql from 'mysql2/promise';
import request from 'supertest';
import { readFile, unlink, writeFile, mkdir } from 'node:fs/promises';
import { createApp } from '../src/app.js';
import {dashboard as buildDashboard} from '../src/dashboard.js';
import { recoverAdmin } from '../src/admin-recovery.js';
import { hashPassword, csrfValid } from '../src/security.js';
import { rows, createPool, settings, json } from '../src/db.js';
let db, root, app, admin, editor, manager, csrfAdmin, csrfEditor, csrfManager;
const database=`kemsor_cms_test_${process.pid}`;
const options={host:process.env.DB_HOST || '127.0.0.1',socketPath:process.env.DB_SOCKET || undefined,user:process.env.DB_MIGRATION_USER || process.env.DB_USER || 'root',password:process.env.DB_MIGRATION_PASSWORD || '',timezone:'Z',dateStrings:true};
// Sequential workflow tests load the latest save version; conflict tests below submit explicit stale/missing versions.
async function withContentVersion(payload){
 if(!payload?.id||Object.hasOwn(payload,'revision'))return payload;
 const record=(await rows(db,'SELECT revision FROM cms_entries WHERE id=?',[payload.id]))[0];
 return {...payload,revision:record?.revision};
}
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
 for(const name of ['013_phase_one_workflows.sql','014_admin_mfa.sql','015_submission_terms.sql','016_professional_registration.sql','017_operations.sql','018_managed_content.sql','020_careers_intake.sql','021_news_alerts.sql','022_site_modules_campaigns.sql','024_kpi_reporting.sql','027_casting_calls.sql','028_casting_applications.sql','029_production_people.sql','030_casting_mail_epk_access.sql','031_follow_up_workflow.sql','032_content_revision_safety.sql','033_audit_change_details.sql','034_blog_categories.sql','035_news_categories.sql','036_account_deletion.sql','037_filmdesk.sql']){
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
 await admin.post('/admin/content/save').type('form').send(await withContentVersion({type:'news',title:'Bad mutation'})).expect(403);
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
 await editor.post('/admin/content/save').type('form').send(await withContentVersion(item)).expect(302);
 const entry=(await rows(db,'SELECT * FROM cms_entries WHERE slug=?',['test-draft']))[0];
 assert.equal((await request(app).get('/api/site')).body.entries.length,0);
 await editor.get(`/admin/content/${entry.id}`).expect(200).then(res=>assert.ok(res.text.includes('&lt;script&gt;')));
 await editor.post('/admin/content/save').type('form').send(await withContentVersion({...item,id:entry.id,status:'published'})).expect(302);
 const response=await request(app).get('/api/site').expect(200);assert.equal(response.body.entries[0].body,'Private draft');assert.equal(response.body.entries[0].created_by,undefined);
 await editor.post(`/admin/content/${entry.id}/archive`).type('form').send({_csrf:csrfEditor,revision:(await rows(db,'SELECT revision FROM cms_entries WHERE id=?',[entry.id]))[0].revision}).expect(302);
 assert.equal((await request(app).get('/api/site')).body.entries.length,0);
});
test('Invalid content slugs and duplicate slugs are rejected',async()=>{
 const item={_csrf:csrfEditor,type:'blog',title:'Example',slug:'../unsafe',status:'draft'};
 await editor.post('/admin/content/save').type('form').send(await withContentVersion(item)).expect(422);
 await editor.post('/admin/content/save').type('form').send(await withContentVersion({...item,slug:'unique-slug'})).expect(302);
 await editor.post('/admin/content/save').type('form').send(await withContentVersion({...item,slug:'unique-slug'})).expect(422);
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
 assert.ok(receipt.body.includes('Enquiry type: Business'));assert.ok(receipt.body.includes(`Enquiry subject: ${enquiry.subject}`));assert.ok(receipt.subject.includes('Business'));
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
 const created=await rows(db,'INSERT INTO cms_users(name,email,password_hash,role) VALUES(?,?,?,?)',['Disable test editor','disable-editor@test.local',await hashPassword('A-secure-test-password'),'editor']);
 const [disabledEditor]=await login('disable-editor');
 const e={id:created.insertId};
 await admin.post(`/admin/users/${e.id}/toggle`).type('form').send({_csrf:csrfAdmin}).expect(302);
 await disabledEditor.get('/admin/content').expect(302);
 await editor.get('/admin/content').expect(200);
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
 await artist.get('/api/production/projects').expect(200);
 await post(artist,'/api/production/projects',{title:'Artist workspace'}).then(r=>assert.equal(r.status,201));
 const created=await post(hirer,'/api/production/projects',{title:'Private Test Film',budget:50000,currency:'INR',timeline:'10 days'});assert.equal(created.status,201);const id=created.body.id;
 await post(hirer,`/api/production/projects/${id}/script`,{}).then(r=>assert.equal(r.status,503));
 await other.get(`/api/production/projects/${id}`).expect(404);
 await artist.get(`/api/production/projects/${id}`).expect(404);
 await artist.get(`/api/production/projects/${id}/script`).expect(404);
 await post(artist,`/api/production/projects/${id}/plan`,{notes:'blocked'}).then(r=>assert.equal(r.status,404));
 await post(artist,`/api/production/projects/${id}/script`,{}).then(r=>assert.equal(r.status,503));
 await post(other,`/api/production/projects/${id}/plan`,{notes:'wrong owner'}).then(r=>assert.equal(r.status,404));
 await post(hirer,`/api/production/projects/${id}/plan`,{breakdown:'Scene 1: Room',notes:'Reviewed manually'}).then(r=>assert.equal(r.status,200));
 const project=(await hirer.get(`/api/production/projects/${id}`)).body;assert.equal(project.project.plan.breakdown,'Scene 1: Room');assert.equal(project.analysisAvailable,false);
 await post(artist,'/api/talent/logout',{}).then(r=>assert.equal(r.status,200));
 await artist.get('/api/production/projects').expect(401);
 await post(artist,'/api/talent/login',{email:'artist@example.test',password:'A-long-member-password'}).then(r=>assert.equal(r.status,200));
 assert.equal((await artist.get('/api/talent/session')).body.user.id,a.id);
 await admin.get('/admin/talent/enquiries').expect(200).then(r=>assert.match(r.text,/Test production/));
 await admin.get('/admin/talent/projects').expect(200).then(r=>{assert.doesNotMatch(r.text,/Private Test Film/);assert.doesNotMatch(r.text,/INT. ROOM - DAY/);});
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
  await admin.post('/admin/content/save').type('form').send(await withContentVersion({_csrf:csrfAdmin,type,title:`Module ${type}`,slug:`module-${type.replaceAll("_","-")}`,summary:'Module verification',body:'Test content',status:'published',page:type==='legal'?'legal':'about'})).expect(302);
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
  await admin.post('/admin/content/save').type('form').send(await withContentVersion(data)).expect(302);
  await admin.post('/admin/content/save').type('form').send(await withContentVersion(data)).expect(302);
  const items=await rows(db,'SELECT id,slug FROM cms_entries WHERE type=? AND title=? ORDER BY id',[type,data.title]);
  assert.deepEqual(items.map(item=>item.slug),['cafe-studio-new-story','cafe-studio-new-story-2']);
  await admin.post('/admin/content/save').type('form').send(await withContentVersion({...data,id:items[0].id,title:'Changed title'})).expect(302);
  assert.equal((await rows(db,'SELECT slug FROM cms_entries WHERE id=?',[items[0].id]))[0].slug,items[0].slug);
 }
 await admin.post('/admin/content/save').type('form').send(await withContentVersion({_csrf:csrfAdmin,type:'blog',title:'🎬',status:'draft'})).expect(302);
 assert.equal((await rows(db,'SELECT slug FROM cms_entries WHERE title=?',['🎬']))[0].slug,'content');
});

test('Dedicated blog editor uploads banners and cannot publish other content types',async()=>{
 const form=await admin.get('/admin/content/new?type=blog').expect(200);
 assert.match(form.text,/Upload banner/);assert.ok(form.text.includes('action="/admin/blog/save"'));
 assert.match(form.text,/data-blog-category-picker/);assert.ok(!form.text.includes('input name="category"'));
 for(const name of ['role','location','page','author'])assert.ok(!form.text.includes(`name="${name}"`));
 await admin.post('/admin/blog/save').type('form').send(await withContentVersion({_csrf:csrfAdmin,type:'news',title:'Wrong form',status:'draft'})).expect(422);
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
 await admin.post('/admin/career/save').type('form').send(await withContentVersion({_csrf:csrfAdmin,type:'blog',title:'Wrong content',status:'draft'})).expect(422);
 await admin.post('/admin/career/save').type('form').send(await withContentVersion({_csrf:csrfAdmin,type:'career',title:'Dedicated role',summary:'Role summary',body:'Responsibilities',role:'Freelance',location:'Remote',category:'Production',status:'draft',publish_action:'published'})).expect(302);
 const role=(await request(app).get('/api/site')).body.entries.find(entry=>entry.slug==='dedicated-role');assert.equal(role.type,'career');assert.equal(role.metadata.location,'Remote');assert.equal(role.metadata.page,undefined);
 const hub=await admin.get('/admin/pages').expect(200);assert.match(hub.text,/Website pages/);assert.match(hub.text,/Users & members/);assert.match(hub.text,/Enquiries & applications/);
 await manager.get('/admin/pages').expect(403);
 const pageForm=await admin.get('/admin/content/new?type=page&page=services').expect(200);assert.match(pageForm.text,/<option value="services" selected>/);
 await admin.get('/admin/content?type=page&page=services').expect(200);
 assert.match(hub.text,/page=how-we-work/);
 const workForm=await admin.get('/admin/content/new?type=page&page=how-we-work').expect(200);assert.match(workForm.text,/<option value="how-we-work" selected>/);
 await admin.post('/admin/content/save').type('form').send(await withContentVersion({_csrf:csrfAdmin,type:'page',title:'How We Work test section',body:'Additional client-approved content',page:'how-we-work',status:'draft'})).expect(302);
 const workList=await admin.get('/admin/content?type=page&page=how-we-work').expect(200);assert.match(workList.text,/How We Work test section/);
 const serviceList=await admin.get('/admin/content?type=page&page=services').expect(200);assert.ok(!(serviceList.text.match(/<tbody[\s\S]*?<\/tbody>/)?.[0]||'').includes('How We Work test section'));
 assert.match(hub.text,/page=india-production-services/);
 const indiaForm=await admin.get('/admin/content/new?type=page&page=india-production-services').expect(200);assert.match(indiaForm.text,/<option value="india-production-services" selected>/);
 await admin.post('/admin/content/save').type('form').send(await withContentVersion({_csrf:csrfAdmin,type:'page',title:'India Production Services test section',body:'Additional client-approved India content',page:'india-production-services',status:'draft'})).expect(302);
 const indiaList=await admin.get('/admin/content?type=page&page=india-production-services').expect(200);assert.match(indiaList.text,/India Production Services test section/);assert.ok(!(indiaList.text.match(/<tbody[\s\S]*?<\/tbody>/)?.[0]||'').includes('How We Work test section'));
 assert.match(hub.text,/page=feature-films/);
 const featureForm=await admin.get('/admin/content/new?type=page&page=feature-films').expect(200);assert.match(featureForm.text,/<option value="feature-films" selected>/);
 await admin.post('/admin/content/save').type('form').send(await withContentVersion({_csrf:csrfAdmin,type:'page',title:'Feature Films test section',body:'Additional client-approved feature content',page:'feature-films',status:'draft'})).expect(302);
 const featureList=await admin.get('/admin/content?type=page&page=feature-films').expect(200);assert.match(featureList.text,/Feature Films test section/);assert.ok(!(featureList.text.match(/<tbody[\s\S]*?<\/tbody>/)?.[0]||'').includes('India Production Services test section'));
 assert.match(hub.text,/page=short-films/);
 const shortForm=await admin.get('/admin/content/new?type=page&page=short-films').expect(200);assert.match(shortForm.text,/<option value="short-films" selected>/);
 await admin.post('/admin/content/save').type('form').send(await withContentVersion({_csrf:csrfAdmin,type:'page',title:'Short Films test section',body:'Additional client-approved short film content',page:'short-films',status:'draft'})).expect(302);
 const shortList=await admin.get('/admin/content?type=page&page=short-films').expect(200);assert.match(shortList.text,/Short Films test section/);assert.ok(!(shortList.text.match(/<tbody[\s\S]*?<\/tbody>/)?.[0]||'').includes('Feature Films test section'));
 assert.match(hub.text,/page=series-ott/);
 const seriesForm=await admin.get('/admin/content/new?type=page&page=series-ott').expect(200);assert.match(seriesForm.text,/<option value="series-ott" selected>/);
 await admin.post('/admin/content/save').type('form').send(await withContentVersion({_csrf:csrfAdmin,type:'page',title:'Series OTT test section',body:'Additional client-approved series content',page:'series-ott',status:'draft'})).expect(302);
 const seriesList=await admin.get('/admin/content?type=page&page=series-ott').expect(200);assert.match(seriesList.text,/Series OTT test section/);assert.ok(!(seriesList.text.match(/<tbody[\s\S]*?<\/tbody>/)?.[0]||'').includes('Short Films test section'));
 assert.match(hub.text,/page=documentaries/);
 const documentaryForm=await admin.get('/admin/content/new?type=page&page=documentaries').expect(200);assert.match(documentaryForm.text,/<option value="documentaries" selected>/);
 await admin.post('/admin/content/save').type('form').send(await withContentVersion({_csrf:csrfAdmin,type:'page',title:'Documentaries test section',body:'Additional client-approved documentary content',page:'documentaries',status:'draft'})).expect(302);
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
 const badTitle=await admin.post('/admin/blog/save').set('Accept','application/json').type('form').send(await withContentVersion({_csrf:csrfAdmin,type:'blog',title:'',summary:'Keep this summary',body:'Keep my draft body',status:'draft'})).expect(422);
 assert.ok(badTitle.body.fields.title);
 const image=await admin.post('/admin/blog/save').set('Accept','application/json').field('_csrf',csrfAdmin).field('type','blog').field('title','Failed upload should not save').field('body','Preserved body').field('status','draft').field('banner_alt','Banner').attach('image',Buffer.from('<html>fake</html>'),{filename:'bad.png',contentType:'image/png'}).expect(422);
 assert.ok(image.body.fields.image);assert.equal((await rows(db,'SELECT id FROM cms_entries WHERE title=?',['Failed upload should not save'])).length,0);
 await admin.post('/admin/blog/save').set('Accept','application/json').type('form').send(await withContentVersion({_csrf:csrfAdmin,type:'blog',title:'Enhanced save',body:'Saved draft',status:'draft'})).expect(302).expect('Location','/admin/content?type=blog&saved=1');
});

test('Publishing previews remain private and draft actions do not publish',async()=>{
 await admin.post('/admin/blog/save').type('form').send(await withContentVersion({_csrf:csrfAdmin,type:'blog',title:'Private preview',body:'<script>not executable</script>',status:'published',publish_action:'draft'})).expect(302);
 const entry=(await rows(db,'SELECT id,status FROM cms_entries WHERE title=?',['Private preview']))[0];assert.equal(entry.status,'draft');
 await request(app).get(`/admin/content/${entry.id}/preview`).expect(302);
 await manager.get(`/admin/content/${entry.id}/preview`).expect(403);
 const preview=await admin.get(`/admin/content/${entry.id}/preview`).expect(200);assert.match(preview.text,/&lt;script&gt;not executable&lt;\/script&gt;/);assert.match(preview.text,/Private publishing preview/);
 assert.ok(!(await request(app).get('/api/site')).body.entries.some(item=>item.id===entry.id));
 const editor=await admin.get(`/admin/content/${entry.id}`).expect(200);assert.match(editor.text,/Preview changes/);assert.match(editor.text,/Save selected status/);
 await admin.post('/admin/blog/save').type('form').send(await withContentVersion({_csrf:csrfAdmin,type:'blog',id:entry.id,title:'Private preview',status:'draft',publish_action:'published'})).expect(302);
 assert.equal((await rows(db,'SELECT status FROM cms_entries WHERE id=?',[entry.id]))[0].status,'published');
});

test('Dedicated news editor handles banners, previews, and publishing without unrelated fields',async()=>{
 const form=await admin.get('/admin/content/new?type=news').expect(200);assert.ok(form.text.includes('action="/admin/news/save"'));assert.match(form.text,/Upload banner/);assert.match(form.text,/Preview changes/);
 assert.match(form.text,/data-blog-category-picker/);assert.ok(!form.text.includes('select name="category"'));
 for(const name of ['role','location','page','author'])assert.ok(!form.text.includes(`name="${name}"`));
 await admin.post('/admin/news/save').type('form').send(await withContentVersion({_csrf:csrfAdmin,type:'career',title:'Wrong form',status:'draft'})).expect(422);
 const image=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAEUlEQVQImWN4O83kPwgzwBgAYgIK2V6WzBUAAAAASUVORK5CYII=','base64');
 await admin.post('/admin/news/save').field('_csrf',csrfAdmin).field('type','news').field('title','Studio news banner').field('body','News text').field('status','published').field('publish_action','draft').field('banner_alt','News banner description').attach('image',image,{filename:'news-banner.png',contentType:'image/png'}).expect(302);
 const draft=(await rows(db,'SELECT id,slug,image_id,status FROM cms_entries WHERE title=?',['Studio news banner']))[0];assert.equal(draft.status,'draft');assert.ok(draft.image_id);
 assert.ok(!(await request(app).get('/api/site')).body.entries.some(e=>e.id===draft.id));
 const edit=await admin.get(`/admin/content/${draft.id}`).expect(200);assert.match(edit.text,/Edit news post/);assert.match(edit.text,/Current news banner/);
 await admin.post('/admin/news/save').type('form').send(await withContentVersion({_csrf:csrfAdmin,type:'news',id:draft.id,title:'Updated news title',body:'Published news text',image_id:draft.image_id,status:'draft',publish_action:'published'})).expect(302);
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
 await rows(db,'INSERT INTO cms_users(name,email,password_hash,role) VALUES(?,?,?,?)',['Recovery test admin','admin-recovery@test.local',await hashPassword('A-secure-test-password'),'admin']);
 const [admin]=await login('admin-recovery');
 assert.equal(await recoverAdmin(db,{}),false);
 await assert.rejects(recoverAdmin(db,{ADMIN_RESET_EMAIL:'admin-recovery@test.local'}),/requires/);
 const env={ADMIN_RESET_EMAIL:'manager@test.local',ADMIN_RESET_PASSWORD:'Recovery-test-password-2026',ADMIN_RESET_ID:'test_recovery_request_0001'};
 await assert.rejects(recoverAdmin(db,env),/administrator/);
 await assert.rejects(recoverAdmin(db,{...env,ADMIN_RESET_EMAIL:'admin-recovery@test.local',ADMIN_RESET_PASSWORD:'short'}),/16–128/);
 await admin.get('/admin').expect(200);
 assert.equal(await recoverAdmin(db,{...env,ADMIN_RESET_EMAIL:'admin-recovery@test.local'}),true);
 await admin.get('/admin').expect(302);
 const recovered=request.agent(app),token=(await recovered.get('/api/csrf')).body.token;
 await recovered.post('/admin/login').type('form').send({_csrf:token,email:'admin-recovery@test.local',password:env.ADMIN_RESET_PASSWORD}).expect(302);
 const original=(await rows(db,'SELECT password_hash FROM cms_users WHERE email="admin-recovery@test.local"'))[0].password_hash;
 assert.equal(await recoverAdmin(db,{...env,ADMIN_RESET_EMAIL:'admin-recovery@test.local',ADMIN_RESET_PASSWORD:'Different-test-password-2026'}),false);
 assert.equal((await rows(db,'SELECT password_hash FROM cms_users WHERE email="admin-recovery@test.local"'))[0].password_hash,original);
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
 await editor.post('/admin/content/save').type('form').send(await withContentVersion({...project,production_stage:'invalid'})).expect(422);
 await editor.post('/admin/content/save').type('form').send(await withContentVersion(project)).expect(302);
 const row=(await rows(db,'SELECT id FROM cms_entries WHERE type="production" AND title="Synthetic project"'))[0];
 assert.ok(!(await request(app).get('/api/site')).body.entries.some(entry=>entry.id===row.id));
 await editor.post('/admin/content/save').type('form').send(await withContentVersion({...project,id:row.id,status:'published'})).expect(302);
 const published=(await request(app).get('/api/site')).body.entries.find(entry=>entry.id===row.id);assert.equal(published.metadata.production_stage,'in_development');
 const asset={_csrf:csrfEditor,type:'press_asset',title:'Synthetic press profile',status:'published',asset_url:'javascript:alert(1)',usage:'Editorial use only'};
 await editor.post('/admin/content/save').type('form').send(await withContentVersion(asset)).expect(422);
 await editor.post('/admin/content/save').type('form').send(await withContentVersion({...asset,asset_url:'https://example.test/profile.pdf'})).expect(302);
 assert.ok((await request(app).get('/api/site')).body.entries.some(entry=>entry.type==='press_asset'&&entry.metadata.usage==='Editorial use only'));
});

test('Extended follow-up tracks statuses, assignments, priority and exports only to staff',async()=>{
 const created=await rows(db,'INSERT INTO cms_enquiries(category,name,email,subject,message,consent_at,consent_version) VALUES(?,?,?,?,?,UTC_TIMESTAMP(),?)',['financing','=Synthetic','followup@example.test','Workflow test','Test only','test-v1']);
 const id=created.insertId,user=(await rows(db,'SELECT id FROM cms_users WHERE email=?',['enquiry_manager@test.local']))[0];
 await manager.post(`/admin/enquiries/${id}`).type('form').send({_csrf:csrfManager,status:'assigned'}).expect(422);
 for(const status of ['assigned','information_required','meeting_scheduled','qualified','converted','closed'])await manager.post(`/admin/enquiries/${id}`).type('form').send({_csrf:csrfManager,status,assigned_to:user.id,priority:'high',tags:'Test pipeline',source:'partner-page',follow_up_at:'2026-11-02T10:30',note:'Synthetic follow-up'}).expect(302);
 const enquiry=(await rows(db,'SELECT * FROM cms_enquiries WHERE id=?',[id]))[0];assert.equal(enquiry.priority,'high');assert.equal(enquiry.follow_up_at,'2026-11-02 10:30:00');
 assert.equal((await rows(db,'SELECT COUNT(*) AS total FROM cms_enquiry_history WHERE enquiry_id=?',[id]))[0].total,6);
 await editor.get('/admin/enquiries/export.csv').expect(403);await request(app).get('/admin/enquiries/export.csv').expect(302);
 const csv=await manager.get('/admin/enquiries/export.csv?section=other&category=financing&q=Test%20pipeline').expect(200);assert.match(csv.text,/'=Synthetic/);assert.match(csv.text,/partner-page/);
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
 await editor.post('/admin/blog/save').type('form').send(await withContentVersion(fields)).expect(302);
 const saved=(await rows(db,'SELECT * FROM cms_entries WHERE title="Synthetic formatted article"'))[0];
 assert.ok(saved.body.includes('Formatted heading'));assert.ok(!saved.body.includes('fallback should be replaced'));
 assert.deepEqual(JSON.parse(saved.metadata).rich_text,rich);
 const edit=await editor.get(`/admin/content/${saved.id}`).expect(200);assert.match(edit.text,/data-rich-editor/);
 const preview=await editor.get(`/admin/content/${saved.id}/preview`).expect(200);assert.match(preview.text,/<strong>Bold text<\/strong>/);assert.match(preview.text,/<ol><li>First item/);
 assert.ok(!(await request(app).get('/api/site')).body.entries.some(entry=>entry.id===saved.id));
 await editor.post('/admin/blog/save').type('form').send(await withContentVersion({...fields,id:saved.id,status:'published'})).expect(302);
 const published=(await request(app).get('/api/site')).body.entries.find(entry=>entry.id===saved.id);assert.deepEqual(published.metadata.rich_text,rich);
 const unsafe={version:1,type:'doc',children:[{type:'p',children:[{type:'a',href:'javascript:alert(1)',children:[{type:'text',text:'Bad'}]}]}]};
 await editor.post('/admin/blog/save').type('form').send(await withContentVersion({...fields,id:saved.id,rich_text:JSON.stringify(unsafe)})).expect(422);
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
 const productionCategory=await editor.post('/admin/news-categories').type('form').send({_csrf:csrf,name:'Productions'}).expect(201);
 const pressCategory=await editor.post('/admin/news-categories').type('form').send({_csrf:csrf,name:'Press Releases'}).expect(201);
 const pressCategoryId=pressCategory.body.category.id;
 const fields={_csrf:csrf,type:'news',title:'Synthetic featured news',summary:'Synthetic only',body:'Synthetic studio update',status:'published',category_ids:String(productionCategory.body.category.id),categories_present:'1',featured:'on'};
 await editor.post('/admin/news/save').type('form').send(await withContentVersion(fields)).expect(302);
 const news=(await rows(db,'SELECT * FROM cms_entries WHERE title="Synthetic featured news"'))[0];
 const published=(await request(app).get('/api/site')).body.entries.find(entry=>entry.id===news.id);assert.equal(published.metadata.category,'Productions');assert.equal(published.metadata.featured,true);assert.ok(published.updated_at);
 await editor.post('/admin/news/save').type('form').send(await withContentVersion({...fields,id:news.id,category_ids:String(pressCategoryId),featured:''})).expect(422);
 await editor.post('/admin/news/save').type('form').send(await withContentVersion({...fields,id:news.id,category_ids:String(pressCategoryId),status:'draft',featured:''})).expect(302);
 await editor.post('/admin/news/save').type('form').send(await withContentVersion({...fields,id:news.id,category_ids:String(pressCategoryId),pdf_url:'javascript:alert(1)'})).expect(422);
 await editor.post('/admin/news/save').type('form').send(await withContentVersion({...fields,id:news.id,category_ids:String(pressCategoryId),pdf_url:'https://example.test/release.pdf',featured:''})).expect(302);
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
 await editor.post('/admin/news/save').type('form').send(await withContentVersion({_csrf:editorCsrf,type:'news',title:'Staged media post',status:'draft',image_id:uploaded.body.id})).expect(302);
 assert.equal((await rows(db,'SELECT image_id FROM cms_entries WHERE title=?',['Staged media post']))[0].image_id,uploaded.body.id);
 await admin.post('/admin/media/upload').set('Accept','application/json').field('_csrf',csrf).field('kind','video').field('alt','Invalid video').attach('image',Buffer.from('not a video'),{filename:'bad.mp4',contentType:'video/mp4'}).expect(422);
 const video=await readFile(new URL('../../rain-temp/public/assets/motion-films/period-intrigue-preview.mp4',import.meta.url));
 await editor.post('/admin/media/upload').set('Accept','application/json').field('_csrf',editorCsrf).field('kind','video').field('alt','Editor video').attach('image',video,{filename:'clip.mp4',contentType:'video/mp4'}).expect(201);
 const clip=await admin.post('/admin/media/upload').set('Accept','application/json').field('_csrf',csrf).field('kind','video').field('alt','Hero clip').attach('image',video,{filename:'clip.mp4',contentType:'video/mp4'}).expect(201);
 assert.match(clip.body.url,/\/video\.mp4$/);
 await request(app).get(clip.body.url).set('Range','bytes=0-99').expect(206).expect('Content-Type',/video\/mp4/);
 await admin.post('/admin/news/save').type('form').send(await withContentVersion({_csrf:csrf,type:'news',title:'Video is not a banner',status:'draft',image_id:clip.body.id})).expect(422);
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
  await editor.post('/admin/content/save').type('form').send(await withContentVersion({...fields,image_id:''})).expect(422);
  await editor.post('/admin/content/save').type('form').send(await withContentVersion({...fields,video_caption:''})).expect(422);
  await editor.post('/admin/content/save').type('form').send(await withContentVersion({...fields,video_url:'javascript:alert(1)'})).expect(422);
  await editor.post('/admin/content/save').type('form').send(await withContentVersion(fields)).expect(302);
  const record=(await rows(db,'SELECT id FROM cms_entries WHERE title=?',[fields.title]))[0];
  assert.ok(!(await request(app).get('/api/site')).body.entries.some(e=>e.id===record.id));
  const preview=await editor.get(`/admin/content/${record.id}/preview`).expect(200);assert.ok(preview.text.includes(video_url));
  await editor.post('/admin/content/save').type('form').send(await withContentVersion({...fields,id:record.id,status:'published'})).expect(302);
  const entry=(await request(app).get('/api/site')).body.entries.find(e=>e.id===record.id);assert.equal(entry.metadata.video_url,video_url);assert.equal(entry.metadata.video_caption,'Official trailer');assert.ok(entry.image_url);
 }
 const production={_csrf:csrf,type:'production',title:'Video production fixture',status:'published',production_stage:'released',format:'Feature Films',video_url,image_id:image.id,video_caption:'Official teaser'};
 await editor.post('/admin/content/save').type('form').send(await withContentVersion(production)).expect(302);
 await editor.post(`/admin/media/${video.id}/delete`).type('form').send({_csrf:csrf}).expect(409);
 await editor.post('/admin/content/save').type('form').send(await withContentVersion({...production,type:'page',page:'about'})).expect(422);
 await editor.post('/admin/content/save').type('form').send(await withContentVersion({...production,video_url:'/media/999999/video.mp4'})).expect(422);
 await editor.post('/admin/content/save').type('form').send(await withContentVersion({...production,title:'Image-only production fixture',video_url:'',video_caption:''})).expect(302);
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
  await editor.post('/admin/content/save').type('form').send(await withContentVersion({_csrf:csrf,type:'page',page:page.key,title:`Registry audit ${page.key}`,body:'Synthetic page content',status:'published'})).expect(302);
  const list=await editor.get(`/admin/content?type=page&page=${page.key}`).expect(200);assert.ok(list.text.includes(`Registry audit ${page.key}`));
 }
 const publicEntries=(await request(app).get('/api/site')).body.entries;
 for(const page of pages)assert.ok(publicEntries.some(entry=>entry.type==='page'&&entry.metadata.page===page.key&&entry.title===`Registry audit ${page.key}`));
 assert.match(controls.text,/Additional published page sections/);
 await editor.post('/admin/content/save').type('form').send(await withContentVersion({_csrf:csrf,type:'page',page:'not-a-page',title:'Invalid target',status:'published'})).expect(422);
 for(const home_slot of ['hero','section']){
  await editor.post('/admin/content/save').type('form').send(await withContentVersion({_csrf:csrf,type:'home',title:`Homepage audit ${home_slot}`,home_slot,status:'published'})).expect(302);
  assert.ok((await request(app).get('/api/site')).body.entries.some(entry=>entry.title===`Homepage audit ${home_slot}`&&entry.metadata.home_slot===home_slot));
 }
 const savedCategory=await editor.post('/admin/blog-categories').type('form').send({_csrf:csrf,name:'Post-production'}).expect(201);
 await editor.post('/admin/blog/save').type('form').send(await withContentVersion({_csrf:csrf,type:'blog',title:'Category audit blog',category_ids:String(savedCategory.body.category.id),categories_present:'1',status:'published'})).expect(302);
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
 await editor.post('/admin/content/save').type('form').send(await withContentVersion({_csrf:csrf,type:'press_asset',title:'Uploaded fact sheet',asset_url:pdf.body.url,usage:'Editorial use',status:'published'})).expect(302);
 const pressCategory=(await editor.post('/admin/news-categories').type('form').send({_csrf:csrf,name:'Press Releases'})).body.category;
 await editor.post('/admin/news/save').type('form').send(await withContentVersion({_csrf:csrf,type:'news',title:'Uploaded PDF press release',category_ids:String(pressCategory.id),categories_present:'1',pdf_url:pdf.body.url,status:'published'})).expect(302);
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
 await admin.post('/admin/content/save').type('form').send(await withContentVersion({_csrf:csrf,type:'legal',title:'Wrong publishing path',status:'published',page:'legal'})).expect(422);
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


test('Contact inbox separates source pages and shares Contact form category options',async()=>{
 const fixtures=[['Contact brand fixture','brand','/contact/?category=brand'],['Contact press fixture','press','/contact/'],['Partner contact fixture','production','/contact/?partner=filmmakers'],['Other source fixture','brand','/partner-with-us/'],['Legacy source fixture','general','website']];
 const ids=[];
 try{
  for(const [subject,category,source] of fixtures)ids.push((await rows(db,'INSERT INTO cms_enquiries(category,name,email,subject,message,consent_at,consent_version,source) VALUES(?,?,?,?,?,UTC_TIMESTAMP(),?,?)',[category,'Inbox fixture','inbox@test.local',subject,'Synthetic only','test',source])).insertId);
  const inbox=await manager.get('/admin/enquiries?q=fixture').expect(200);
  const inboxRows=inbox.text.slice(inbox.text.indexOf('<tbody>'),inbox.text.indexOf('</tbody>'));
  for(const subject of ['Contact brand fixture','Contact press fixture','Partner contact fixture'])assert.ok(inboxRows.includes(subject));
  for(const subject of ['Other source fixture','Legacy source fixture'])assert.ok(!inboxRows.includes(subject));
  const categories=JSON.parse(await readFile(new URL('../../shared/enquiry-categories.json',import.meta.url),'utf8'));
  for(const key of Object.keys(categories))assert.ok(inbox.text.includes(`value="${key}"`));
  const filtered=await manager.get('/admin/enquiries?category=brand&q=fixture').expect(200);
  filtered.text=filtered.text.slice(filtered.text.indexOf('<tbody>'),filtered.text.indexOf('</tbody>'));
  assert.ok(filtered.text.includes('Contact brand fixture'));assert.ok(!filtered.text.includes('Contact press fixture'));assert.ok(!filtered.text.includes('Other source fixture'));
  const other=await manager.get('/admin/enquiries?section=other&q=fixture').expect(200);
  other.text=other.text.slice(other.text.indexOf('<tbody>'),other.text.indexOf('</tbody>'));
  assert.ok(other.text.includes('Other source fixture'));assert.ok(other.text.includes('Legacy source fixture'));assert.ok(!other.text.includes('Contact brand fixture'));
  const csv=await manager.get('/admin/enquiries/export.csv?category=brand&q=fixture').expect(200);
  assert.ok(csv.text.includes('Contact brand fixture'));assert.ok(!csv.text.includes('Other source fixture'));
  const otherCsv=await manager.get('/admin/enquiries/export.csv?section=other&category=brand&q=fixture').expect(200);
  assert.ok(otherCsv.text.includes('Other source fixture'));assert.ok(!otherCsv.text.includes('Contact brand fixture'));
 }finally{for(const id of ids)await rows(db,'DELETE FROM cms_enquiries WHERE id=?',[id]);}
});

test('Staff email replies use stored recipients, deduplicate submissions, and keep delivery history',async()=>{
 const {randomUUID}=await import('node:crypto');
 const {deliverReceipt}=await import('../src/mail.js');
 const {deletePersonalRecord}=await import('../src/retention.js');
 const enquiryId=(await rows(db,'INSERT INTO cms_enquiries(category,name,email,subject,message,consent_at,consent_version) VALUES("general","Reply sender","reply@test.local","Reply fixture","Private original",UTC_TIMESTAMP(),"test")')).insertId;
 const applicationId=(await rows(db,'INSERT INTO career_applications(career_title,name,email,phone,message,resume_filename,resume_name,consent_version) VALUES("Reply role","Applicant","app-reply@test.local","123","Application message","","","test")')).insertId;
 const senderId=(await rows(db,'INSERT INTO talent_accounts(name,email,password_hash,role) VALUES("Hirer","hirer-reply@test.local","unused","hirer")')).insertId;
 const artistId=(await rows(db,'INSERT INTO talent_accounts(name,email,password_hash,role) VALUES("Artist","artist-reply@test.local","unused","artist")')).insertId;
 const talentId=(await rows(db,'INSERT INTO talent_enquiries(sender_id,artist_id,project,message) VALUES(?,?,"Reply project","Talent message")',[senderId,artistId])).insertId;
 const prefixes=[`KEM-${String(enquiryId).padStart(6,'0')}`,`APP-${String(applicationId).padStart(6,'0')}`,`TAL-${String(talentId).padStart(6,'0')}`];
 try{
  const url=`/admin/replies/enquiry/${enquiryId}`;
  await request(app).get(url).expect(302);await editor.get(url).expect(403);
  const form=await manager.get(url).expect(200);assert.match(form.text,/reply@test.local/);assert.match(form.text,/No replies yet/);
  const replyToken=form.text.match(/name="reply_token" value="([^"]+)"/)[1];
  const payload={_csrf:csrfManager,reply_token:replyToken,subject:'Re: Reply fixture',message:'Hello, we can discuss your project.',recipient:'attacker@test.local'};
  await manager.post(url).type('form').send({...payload,_csrf:'bad'}).expect(403);
  await manager.post(url).type('form').send({...payload,message:' '}).expect(422);
  await manager.post(url).type('form').send({...payload,subject:'Bad\r\nBcc: attacker@test.local'}).expect(422);
  await manager.post(url).type('form').send(payload).expect(303);
  await manager.post(url).type('form').send(payload).expect(303);
  const queued=await rows(db,'SELECT * FROM cms_email_outbox WHERE receipt_key LIKE ?',[`${prefixes[0]}-REPLY-%`]);assert.equal(queued.length,1);assert.equal(queued[0].recipient,'reply@test.local');assert.equal(queued[0].status,'pending');
  await manager.post(url).type('form').send({...payload,message:'Changed duplicate'}).expect(409);
  // Only exercise synthetic mail through a supplied transport; no external email is sent.
  await rows(db,"UPDATE cms_email_outbox SET available_at=DATE_ADD(UTC_TIMESTAMP(),INTERVAL 1 DAY) WHERE id<>?",[queued[0].id]);
  let sent;await deliverReceipt(db,{sendMail:async mail=>{sent=mail;return {messageId:'synthetic-reply-id',accepted:[mail.to]};}},'studio@test.local');
  assert.equal(sent.to,'reply@test.local');assert.equal(sent.text,payload.message);
  const history=await manager.get(url).expect(200);assert.match(history.text,/Hello, we can discuss/);assert.match(history.text,/>Sent</);
  await manager.get(`/admin/replies/application/${applicationId}`).expect(200);
  await manager.post(`/admin/replies/application/${applicationId}`).type('form').send({...payload,reply_token:randomUUID()}).expect(303);
  await manager.get(`/admin/replies/talent/${talentId}`).expect(403);
  await admin.get(`/admin/replies/talent/${talentId}`).expect(200);
  await admin.post(`/admin/replies/talent/${talentId}`).type('form').send({...payload,_csrf:csrfAdmin,reply_token:randomUUID()}).expect(303);
  const talentMail=(await rows(db,'SELECT recipient FROM cms_email_outbox WHERE receipt_key LIKE ?',[`${prefixes[2]}-REPLY-%`]))[0];assert.equal(talentMail.recipient,'hirer-reply@test.local');
  await manager.get('/admin/replies/enquiry/999999999').expect(404);
  await deletePersonalRecord(db,'enquiry',enquiryId,{user:{id:1}});
  assert.equal((await rows(db,'SELECT id FROM cms_email_outbox WHERE receipt_key LIKE ?',[`${prefixes[0]}-REPLY-%`])).length,0);
 }finally{
  for(const prefix of prefixes)await rows(db,'DELETE FROM cms_email_outbox WHERE receipt_key LIKE ?',[`${prefix}-REPLY-%`]);
  await rows(db,'DELETE FROM cms_enquiries WHERE id=?',[enquiryId]);await rows(db,'DELETE FROM career_applications WHERE id=?',[applicationId]);
  await rows(db,'DELETE FROM talent_accounts WHERE id IN (?,?)',[senderId,artistId]);
 }
});

test('Production record fields persist through editing and keep working titles private',async()=>{
 const form=await editor.get('/admin/content/new?type=production').expect(200);
 for(const name of ['working_title','genres','language','release_date','cast_credits_rows','crew_credits_rows'])assert.ok(form.text.includes(`name="${name}"`));
 const values={_csrf:csrfEditor,type:'production',title:'Production record fixture',summary:'A concise logline',body:'An approved production synopsis.',production_stage:'in_development',format:'Feature film',language:'Hindi, English',genres:'Drama, Thriller',working_title:'CONFIDENTIAL WORKING TITLE',cast_credits:'Actor <One> | Lead\nActor Two',crew_credits:'Crew One | Director',year:'2028',release_date:'2028-02-29',status:'draft'};
 await editor.post('/admin/content/save').type('form').send(await withContentVersion({...values,release_date:'2026-02-29'})).expect(422);
 await manager.post('/admin/content/save').type('form').send(await withContentVersion({...values,_csrf:csrfManager})).expect(403);
 await editor.post('/admin/content/save').type('form').send(await withContentVersion(values)).expect(302);
 const record=(await rows(db,'SELECT * FROM cms_entries WHERE type="production" AND title=?',[values.title]))[0];assert.ok(record);
 try{
  const metadata=JSON.parse(record.metadata);assert.equal(metadata.working_title,values.working_title);assert.deepEqual(metadata.genres,['Drama','Thriller']);assert.deepEqual(metadata.languages,['Hindi','English']);assert.equal(metadata.release_date,'2028-02-29');
  assert.ok(!(await request(app).get('/api/site')).body.entries.some(entry=>entry.id===record.id));
  const preview=await editor.get(`/admin/content/${record.id}/preview`).expect(200);assert.ok(preview.text.includes('CONFIDENTIAL WORKING TITLE'));assert.ok(preview.text.includes('2028-02-29'));
  await editor.post('/admin/content/save').type('form').send(await withContentVersion({...values,id:record.id,status:'published'})).expect(302);
  const published=(await request(app).get('/api/site')).body.entries.find(entry=>entry.id===record.id);assert.ok(published);assert.equal(published.metadata.working_title,undefined);assert.deepEqual(published.metadata.genres,['Drama','Thriller']);assert.equal(published.summary,values.summary);assert.equal(published.body,values.body);
  assert.deepEqual(published.metadata.cast_credits,[{name:'Actor <One>',role:'Lead'},{name:'Actor Two',role:''}]);
  const detail=await request(app).get(`/productions/${record.slug}/`).expect(200);assert.match(detail.text,/Actor &lt;One&gt;/);assert.match(detail.text,/Crew One/);
  const {working_title,genres,release_date,cast_credits,crew_credits,...legacy}=values;
  await editor.post('/admin/content/save').type('form').send(await withContentVersion({...legacy,id:record.id,production_stage:'in_production',status:'draft'})).expect(302);
  const updated=(await rows(db,'SELECT * FROM cms_entries WHERE id=?',[record.id]))[0];assert.equal(updated.slug,record.slug);assert.equal(JSON.parse(updated.metadata).working_title,values.working_title);assert.equal(JSON.parse(updated.metadata).release_date,'2028-02-29');
  const edit=await editor.get(`/admin/content/${record.id}`).expect(200);assert.ok(edit.text.includes('Drama, Thriller'));assert.ok(edit.text.includes('CONFIDENTIAL WORKING TITLE'));
 }finally{await rows(db,'DELETE FROM cms_entries WHERE id=?',[record.id]);}
});

test('Individual production pages expose published records only, render escaped content and update the sitemap',async()=>{
 const metadata={production_stage:'in_production',format:'Feature film',genres:['Drama'],languages:['Hindi'],language:'Hindi',working_title:'PRIVATE UNANNOUNCED NAME',release_date:'2028-02-29'};
 const id=(await rows(db,'INSERT INTO cms_entries(type,title,slug,summary,body,metadata,status) VALUES("production",?,?,?,?,?,"draft")',['Public <film>','detail-page-fixture','A story </script><script>alert(1)</script>','Approved synopsis',JSON.stringify(metadata)])).insertId;
 try{
  const url='/productions/detail-page-fixture/';
  await request(app).get(url).expect(404);
  await rows(db,'UPDATE cms_entries SET status="published",published_at=DATE_ADD(UTC_TIMESTAMP(),INTERVAL 1 DAY) WHERE id=?',[id]);await request(app).get(url).expect(404);
  await rows(db,'UPDATE cms_entries SET published_at=UTC_TIMESTAMP() WHERE id=?',[id]);
  await request(app).get(url.slice(0,-1)).expect(301).expect('Location',url);
  const response=await request(app).get(url).expect(200).expect('Cache-Control','no-store');
  assert.match(response.text,/<body data-page="production-detail">/);assert.match(response.text,/<h1>Public &lt;film&gt;<\/h1>/);assert.match(response.text,/Approved synopsis/);assert.ok(!response.text.includes('PRIVATE UNANNOUNCED NAME'));assert.ok(!response.text.includes('</script><script>alert(1)</script>'));
  const bootstrap=JSON.parse(response.text.match(/id="production-record" type="application\/json">([\s\S]*?)<\/script>/)[1]);assert.equal(bootstrap.title,'Public <film>');assert.equal(bootstrap.metadata.working_title,undefined);
  assert.match(response.text,/<link rel="canonical" href="https?:[^" ]+\/productions\/detail-page-fixture\/">/);
  const schema=JSON.parse(response.text.match(/id="site-structured-data">([\s\S]*?)<\/script>/)[1]);assert.ok(schema['@graph'].some(item=>item['@type']==='Movie'&&item.name==='Public <film>'));
  await request(app).get('/sitemap.xml').expect(200).then(r=>assert.ok(r.text.includes(url)));
  await rows(db,'UPDATE cms_entries SET status="archived" WHERE id=?',[id]);await request(app).get(url).expect(404);await request(app).get('/sitemap.xml').expect(200).then(r=>assert.ok(!r.text.includes(url)));
  await request(app).get('/productions/unknown-production/').expect(404);
 }finally{await rows(db,'DELETE FROM cms_entries WHERE id=?',[id]);}
});

test('Production galleries persist studio images, render safely and protect images in use',async()=>{
 const image=(await rows(db,'INSERT INTO cms_media(filename,original_name,mime,size,alt) VALUES("gallery-fixture.webp","Gallery fixture","image/webp",1,"Library alt")')).insertId;
 const document=(await rows(db,'INSERT INTO cms_media(filename,original_name,mime,size,alt) VALUES("gallery-fixture.pdf","Document fixture","application/pdf",1,"")')).insertId;
 const gallery=[{media_id:image,kind:'behind_the_scenes',alt:'Crew <on set>',caption:'Day one <script>alert(1)</script>'}];
 const values={_csrf:csrfEditor,type:'production',title:'Gallery production fixture',production_stage:'in_production',status:'draft',gallery:JSON.stringify(gallery)};
 let id;
 try{
  await editor.post('/admin/content/save').type('form').send(await withContentVersion({...values,gallery:JSON.stringify([{...gallery[0],media_id:document}])})).expect(422);
  await editor.post('/admin/content/save').type('form').send(await withContentVersion({...values,gallery:JSON.stringify([{...gallery[0],media_id:999999999}])})).expect(422);
  await manager.post('/admin/content/save').type('form').send(await withContentVersion({...values,_csrf:csrfManager})).expect(403);
  await editor.post('/admin/content/save').type('form').send(await withContentVersion(values)).expect(302);
  const entry=(await rows(db,'SELECT * FROM cms_entries WHERE title=?',[values.title]))[0];id=entry.id;
  assert.deepEqual(JSON.parse(entry.metadata).gallery,gallery);
  const preview=await editor.get(`/admin/content/${id}/preview`).expect(200);assert.match(preview.text,/Crew &lt;on set&gt;/);
  await request(app).get(`/productions/${entry.slug}/`).expect(404);
  await editor.post(`/admin/media/${image}/delete`).type('form').send({_csrf:csrfEditor}).expect(409);
  await editor.post('/admin/content/save').type('form').send(await withContentVersion({...values,id,status:'published'})).expect(302);
  const page=await request(app).get(`/productions/${entry.slug}/`).expect(200);assert.match(page.text,/class="production-gallery"/);assert.ok(page.text.includes(`src="/media/${image}"`));assert.match(page.text,/Crew &lt;on set&gt;/);assert.ok(!page.text.includes('<script>alert(1)</script>'));
  const {gallery:omitted,...legacy}=values;await editor.post('/admin/content/save').type('form').send(await withContentVersion({...legacy,id})).expect(302);
  assert.deepEqual(JSON.parse((await rows(db,'SELECT metadata FROM cms_entries WHERE id=?',[id]))[0].metadata).gallery,gallery);
  await editor.post('/admin/content/save').type('form').send(await withContentVersion({...values,id,gallery:'[]'})).expect(302);
  await editor.post(`/admin/media/${image}/delete`).type('form').send({_csrf:csrfEditor}).expect(409);
 }finally{
  if(id)await rows(db,'DELETE FROM cms_entries WHERE id=?',[id]);await rows(db,'DELETE FROM cms_media WHERE id IN (?,?)',[image,document]);
 }
});

test('Production press kits upload, replace and remove with published-only download access',async()=>{
 const pdf=Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF');
 const upload=async name=>(await editor.post('/admin/media/upload').set('Accept','application/json').field('_csrf',csrfEditor).field('kind','document').field('alt','Approved production press kit').attach('image',pdf,{filename:name,contentType:'application/pdf'}).expect(201)).body;
 await editor.post('/admin/media/upload').set('Accept','application/json').field('_csrf',csrfEditor).field('kind','document').field('alt','Invalid EPK').attach('image',Buffer.from('invalid'),{filename:'invalid.pdf',contentType:'application/pdf'}).expect(422);
 const first=await upload('first-kit.pdf'),replacement=await upload('replacement-kit.pdf');
 const values={_csrf:csrfEditor,type:'production',title:'EPK production fixture',production_stage:'in_production',status:'draft',epk_url:first.url};
 let id;
 try{
  await editor.post('/admin/content/save').type('form').send(await withContentVersion({...values,epk_url:'/media/99999999/document.pdf'})).expect(422);
  await manager.post('/admin/content/save').type('form').send(await withContentVersion({...values,_csrf:csrfManager})).expect(403);
  await editor.post('/admin/content/save').type('form').send(await withContentVersion(values)).expect(302);
  const record=(await rows(db,'SELECT * FROM cms_entries WHERE title=?',[values.title]))[0];id=record.id;const url=`/productions/${record.slug}/press-kit.pdf`;
  await request(app).get(url).expect(404);
  await editor.get(`/admin/content/${id}`).expect(200).then(r=>assert.match(r.text,/data-document-upload/));
  await editor.get(`/admin/content/${id}/preview`).expect(200).then(r=>assert.match(r.text,/Preview press kit PDF/));
  await editor.post(`/admin/media/${first.id}/delete`).type('form').send({_csrf:csrfEditor}).expect(409);
  await editor.post('/admin/content/save').type('form').send(await withContentVersion({...values,id,status:'published'})).expect(302);
  await request(app).get(`/productions/${record.slug}/`).expect(200).then(r=>assert.ok(r.text.includes(`href="${url}" download`)));
  await request(app).get(url).expect(200).expect('Content-Type',/application\/pdf/).expect('Content-Disposition',`attachment; filename="${record.slug}-press-kit.pdf"`).expect('Cache-Control','no-store').then(r=>assert.deepEqual(r.body,pdf));
  const {epk_url,...legacy}=values;await editor.post('/admin/content/save').type('form').send(await withContentVersion({...legacy,id,status:'published'})).expect(302);assert.equal(JSON.parse((await rows(db,'SELECT metadata FROM cms_entries WHERE id=?',[id]))[0].metadata).epk_url,first.url);
  await rows(db,'UPDATE cms_entries SET published_at=DATE_ADD(UTC_TIMESTAMP(),INTERVAL 1 DAY) WHERE id=?',[id]);await request(app).get(url).expect(404);
  await editor.post('/admin/content/save').type('form').send(await withContentVersion({...values,id,status:'published',epk_url:replacement.url})).expect(302);
  assert.equal(JSON.parse((await rows(db,'SELECT metadata FROM cms_entries WHERE id=?',[id]))[0].metadata).epk_url,replacement.url);
  await editor.post(`/admin/media/${first.id}/delete`).type('form').send({_csrf:csrfEditor}).expect(409);
  await rows(db,'UPDATE cms_entries SET published_at=UTC_TIMESTAMP(),status="published" WHERE id=?',[id]);await request(app).get(url).expect(200);
  await rows(db,'UPDATE cms_entries SET status="archived" WHERE id=?',[id]);await request(app).get(url).expect(404);
  await editor.post('/admin/content/save').type('form').send(await withContentVersion({...values,id,status:'published',epk_url:''})).expect(302);
  await request(app).get(url).expect(404);await request(app).get(`/productions/${record.slug}/`).expect(200).then(r=>assert.ok(!r.text.includes('Download press kit')));
 }finally{if(id)await rows(db,'DELETE FROM cms_entries WHERE id=?',[id]);}
});

test('Casting calls link to productions, enforce staff access and keep drafts private',async()=>{
 const production=(await rows(db,'INSERT INTO cms_entries(type,title,slug,summary,body,metadata,status) VALUES("production","Casting test production","casting-test-production","","","{}","draft")')).insertId;
 const values={_csrf:csrfEditor,production_id:production,title:'Casting fixture',summary:'Approved call',requirements:'Relevant experience.',location:'Dehradun',deadline:'2099-12-31',roles:'Lead | Hindi speaking\nSupporting | Screen experience',call_state:'open',status:'draft'};let id;
 try{
  await request(app).get('/admin/casting').expect(302);await manager.get('/admin/casting').expect(403);await editor.get('/admin/casting/new').expect(200);
  await editor.post('/admin/casting/save').type('form').send({...values,_csrf:'bad'}).expect(403);await manager.post('/admin/casting/save').type('form').send({...values,_csrf:csrfManager}).expect(403);
  await editor.post('/admin/casting/save').type('form').send({...values,status:'published'}).expect(422);await editor.post('/admin/casting/save').type('form').send({...values,deadline:'2026-02-29'}).expect(422);
  await editor.post('/admin/casting/save').type('form').send(values).expect(303);id=(await rows(db,'SELECT id FROM casting_calls WHERE title=?',[values.title]))[0].id;
  let calls=(await request(app).get('/api/casting-calls').expect(200)).body.calls;assert.ok(!calls.some(call=>call.id===id));await editor.get(`/admin/casting/${id}`).expect(200);await editor.get('/admin/casting?status=draft').expect(200).then(r=>assert.match(r.text,/Casting fixture/));
  await rows(db,'UPDATE cms_entries SET status="published",published_at=UTC_TIMESTAMP() WHERE id=?',[production]);
  await editor.post('/admin/casting/save').type('form').send({...values,id,status:'published'}).expect(303);
  calls=(await request(app).get('/api/casting-calls')).body.calls;let call=calls.find(call=>call.id===id);assert.equal(call.state,'open');assert.equal(call.roles.length,2);assert.equal(call.production_slug,'casting-test-production');
  await editor.post('/admin/casting/save').type('form').send({...values,id,status:'published',call_state:'closed'}).expect(303);assert.equal((await request(app).get('/api/casting-calls')).body.calls.find(call=>call.id===id).state,'closed');
  await editor.post('/admin/casting/save').type('form').send({...values,id,status:'published',deadline:'2020-01-01'}).expect(303);assert.equal((await request(app).get('/api/casting-calls')).body.calls.find(call=>call.id===id).state,'closed');
  await rows(db,'UPDATE cms_entries SET status="archived" WHERE id=?',[production]);assert.ok(!(await request(app).get('/api/casting-calls')).body.calls.some(call=>call.id===id));
  await editor.post('/admin/casting/save').type('form').send({...values,id,status:'archived'}).expect(303);
  await editor.get('/admin/casting/99999999').expect(404);
 }finally{if(id)await rows(db,'DELETE FROM casting_calls WHERE id=?',[id]);await rows(db,'DELETE FROM cms_entries WHERE id=?',[production]);}
});

test('Talent casting applications enforce consent, role identity, duplicates, privacy and review tracking',async()=>{
 const {castingRoleKey}=await import('../src/casting-role.js');
 const production=(await rows(db,'INSERT INTO cms_entries(type,title,slug,summary,body,metadata,status,published_at) VALUES("production","Applications fixture","applications-fixture","","","{}","published",UTC_TIMESTAMP())')).insertId;
 const roles=[{name:'Lead',eligibility:'Hindi speaking'},{name:'Supporting',eligibility:'Experienced'}];
 const call=(await rows(db,'INSERT INTO casting_calls(production_id,title,summary,requirements,location,deadline,roles,status,published_at) VALUES(?,"Application fixture call","Summary","Details","Dehradun","2099-12-31",?,"published",UTC_TIMESTAMP())',[production,JSON.stringify(roles)])).insertId;
 const accounts=[];let applicationId;
 const original=(await rows(db,'SELECT * FROM casting_application_settings WHERE id=1'))[0];
 try{
  for(const [name,role] of [['Casting artist','artist'],['Other artist','artist'],['Casting hirer','hirer']])accounts.push((await rows(db,'INSERT INTO talent_accounts(name,email,password_hash,role,bio) VALUES(?,?,?,?,"Original biography")',[name,name.replaceAll(' ','').toLowerCase()+'@test.local',await hashPassword('A-secure-test-password'),role])).insertId);
  const agents=[];for(const id of accounts){const email=(await rows(db,'SELECT email FROM talent_accounts WHERE id=?',[id]))[0].email;const agent=request.agent(app);let csrf=(await agent.get('/api/csrf')).body.token;await agent.post('/api/talent/login').set('X-CSRF-Token',csrf).send({email,password:'A-secure-test-password'}).expect(200);csrf=(await agent.get('/api/csrf')).body.token;agents.push({agent,csrf});}
  const {agent:artist,csrf}=agents[0],payload={role_key:castingRoleKey('Lead'),message:'Please consider my application.',audition_links:'https://example.test/audition',consent:true,terms_version:'casting-test-v1'},url=`/api/casting-calls/${call}/applications`;
  await artist.post(url).set('X-CSRF-Token',csrf).send(payload).expect(403);
  await editor.post('/admin/casting-application-settings').type('form').send({_csrf:csrfEditor}).expect(403);
  await admin.post('/admin/casting-application-settings').type('form').send({_csrf:csrfAdmin,enabled:'on',terms:'Synthetic test terms',terms_version:'casting-test-v1'}).expect(422);
  await admin.post('/admin/casting-application-settings').type('form').send({_csrf:csrfAdmin,enabled:'on',approved:'on',terms:'Synthetic test terms',terms_version:'casting-test-v1'}).expect(303);
  await request(app).post(url).send(payload).expect(403);await request(app).get('/api/casting-applications').expect(401);
  await agents[2].agent.post(url).set('X-CSRF-Token',agents[2].csrf).send(payload).expect(401);
  await artist.post(url).set('X-CSRF-Token','bad').send(payload).expect(403);await artist.post(url).set('X-CSRF-Token',csrf).send({...payload,consent:false}).expect(422);await artist.post(url).set('X-CSRF-Token',csrf).send({...payload,terms_version:'outdated'}).expect(422);
  await artist.post(url).set('X-CSRF-Token',csrf).send({...payload,audition_links:'javascript:alert(1)'}).expect(422);
  const submitted=await artist.post(url).set('X-CSRF-Token',csrf).send(payload).expect(201);applicationId=submitted.body.id;
  await artist.post(url).set('X-CSRF-Token',csrf).send(payload).expect(409);
  await rows(db,'UPDATE casting_calls SET roles=? WHERE id=?',[JSON.stringify([...roles].reverse()),call]);await artist.post(url).set('X-CSRF-Token',csrf).send(payload).expect(409);
  await rows(db,'UPDATE talent_accounts SET bio="Updated biography" WHERE id=?',[accounts[0]]);
  await manager.get('/admin/casting-applications').expect(403);await editor.get('/admin/casting-applications').expect(200);await editor.get(`/admin/casting-applications/${applicationId}`).expect(200).then(r=>assert.match(r.text,/Original biography/));
  await editor.post(`/admin/casting-applications/${applicationId}`).type('form').send({_csrf:csrfEditor,expected_status:'submitted',status:'shortlisted',note:'PRIVATE REVIEWER NOTE'}).expect(303);
  await editor.post(`/admin/casting-applications/${applicationId}`).type('form').send({_csrf:csrfEditor,expected_status:'submitted',status:'rejected',note:''}).expect(409);
  const mine=await artist.get('/api/casting-applications').expect(200);assert.equal(mine.body.applications[0].status,'shortlisted');assert.ok(!JSON.stringify(mine.body).includes('PRIVATE REVIEWER NOTE'));
  assert.equal((await agents[1].agent.get('/api/casting-applications')).body.applications.length,0);
  let notices=await rows(db,'SELECT * FROM cms_email_outbox WHERE casting_application_id=? ORDER BY id',[applicationId]);assert.equal(notices.length,2);assert.match(notices[0].receipt_key,/RECEIVED$/);assert.ok(notices.every(mail=>!mail.body.includes('PRIVATE REVIEWER NOTE')));
  await editor.post(`/admin/casting-applications/${applicationId}`).type('form').send({_csrf:csrfEditor,expected_status:'shortlisted',status:'shortlisted',note:'Private amended note'}).expect(303);assert.equal((await rows(db,'SELECT id FROM cms_email_outbox WHERE casting_application_id=?',[applicationId])).length,2);
  await editor.post(`/admin/casting-applications/${applicationId}`).type('form').send({_csrf:csrfEditor,expected_status:'shortlisted',status:'rejected',note:'PRIVATE REJECTION REASON'}).expect(303);
  await rows(db,'UPDATE cms_email_outbox SET available_at=DATE_ADD(UTC_TIMESTAMP(),INTERVAL 1 DAY) WHERE casting_application_id IS NULL OR casting_application_id<>?',[applicationId]);
  const {deliverReceipt}=await import('../src/mail.js');const delivered=[];const transport={sendMail:async mail=>{delivered.push(mail);return {messageId:'synthetic-casting-id',accepted:[mail.to]};}};
  await deliverReceipt(db,transport,'studio@example.test');await deliverReceipt(db,transport,'studio@example.test');
  notices=await rows(db,'SELECT * FROM cms_email_outbox WHERE casting_application_id=? ORDER BY id',[applicationId]);assert.equal(notices[0].status,'sent');assert.equal(notices[1].status,'cancelled');assert.equal(delivered.length,1);assert.match(delivered[0].html,/KEMSOR STUDIOS/);
  await deliverReceipt(db,{sendMail:async()=>{throw Object.assign(new Error('Synthetic failure'),{code:'ETIMEDOUT'});}},'studio@example.test');
  const rejection=(await rows(db,'SELECT * FROM cms_email_outbox WHERE casting_application_id=? ORDER BY id DESC LIMIT 1',[applicationId]))[0];await rows(db,'UPDATE cms_email_outbox SET status="failed",attempts=5 WHERE id=?',[rejection.id]);
  await editor.post(`/admin/casting-applications/${applicationId}/emails/${rejection.id}/retry`).type('form').send({_csrf:csrfEditor}).expect(303);await deliverReceipt(db,transport,'studio@example.test');assert.equal(delivered.length,2);assert.ok(delivered.every(mail=>!mail.text.includes('PRIVATE')));assert.match(delivered[1].subject,/Update on your casting application/);
  await editor.post(`/admin/casting-applications/${applicationId}`).type('form').send({_csrf:csrfEditor,expected_status:'rejected',status:'submitted',note:'Reopened'}).expect(303);assert.equal((await rows(db,'SELECT id FROM cms_email_outbox WHERE casting_application_id=?',[applicationId])).length,3);

  const second={...payload,role_key:castingRoleKey('Supporting')};await rows(db,'UPDATE casting_calls SET call_state="closed" WHERE id=?',[call]);await artist.post(url).set('X-CSRF-Token',csrf).send(second).expect(409);
  await rows(db,'UPDATE casting_calls SET call_state="open",deadline="2020-01-01" WHERE id=?',[call]);await artist.post(url).set('X-CSRF-Token',csrf).send(second).expect(409);
  await rows(db,'UPDATE casting_calls SET deadline="2099-12-31",status="draft" WHERE id=?',[call]);await artist.post(url).set('X-CSRF-Token',csrf).send(second).expect(404);
  await admin.get('/admin/casting-application-settings').expect(200);
 }finally{
  await rows(db,'UPDATE casting_application_settings SET enabled=?,terms=?,terms_version=?,updated_by=? WHERE id=1',[original.enabled,original.terms,original.terms_version,original.updated_by]);
  await rows(db,'DELETE FROM casting_applications WHERE call_id=?',[call]);await rows(db,'DELETE FROM casting_calls WHERE id=?',[call]);await rows(db,'DELETE FROM cms_entries WHERE id=?',[production]);for(const id of accounts)await rows(db,'DELETE FROM talent_accounts WHERE id=?',[id]);
 }
});

test('Four production extensions publish safe rights, linked biographies, typed media and event history',async()=>{
 const image=(await rows(db,'INSERT INTO cms_media(filename,original_name,mime,size,alt) VALUES("extension-poster.webp","Official poster","image/webp",1,"Official artwork")')).insertId;
 const video=(await rows(db,'INSERT INTO cms_media(filename,original_name,mime,size,alt) VALUES("extension-trailer.mp4","Official trailer","video/mp4",1,"Trailer")')).insertId;
 let personId,productionId;const personValues={_csrf:csrfEditor,name:'Extension biography fixture',profession:'Filmmaker',biography:'PRIVATE BIO UNTIL PUBLISHED',image_id:image,website:'https://example.test/filmmaker',status:'draft'};
 try{
  await manager.get('/admin/people').expect(403);await editor.get('/admin/people/new').expect(200);await manager.post('/admin/people/save').type('form').send({...personValues,_csrf:csrfManager}).expect(403);
  await editor.post('/admin/people/save').type('form').send(personValues).expect(303);let person=(await rows(db,'SELECT * FROM production_people WHERE name=?',[personValues.name]))[0];personId=person.id;await request(app).get(`/people/${person.slug}/`).expect(404);
  const values={_csrf:csrfEditor,type:'production',title:'Four extensions fixture',production_stage:'released',status:'published',rights_holder:'Studio rights holder',rights_summary:'Approved rights statement',rights_status:'partially_available',rights_territories:'India',rights_notes:'SECRET CONTRACT TERMS',cast_credits_rows:JSON.stringify([{name:'Credited filmmaker',role:'Lead',person_id:personId}]),contributor_credits_rows:JSON.stringify([{name:'Credited researcher',role:'Research',person_id:personId}]),platform_links:JSON.stringify([{kind:'watch',label:'Official platform',url:'https://example.test/watch',territories:'India'}]),production_media:JSON.stringify([{type:'poster',title:'Official poster',url:`/media/${image}`,alt:'Poster <artwork>'},{type:'trailer',title:'Official trailer',url:`/media/${video}/video.mp4`},{type:'teaser',title:'Teaser',url:'https://example.test/teaser.mp4'},{type:'song',title:'Theme song',url:'https://example.test/theme.mp3'},{type:'behind_the_scenes',title:'Making the film',url:`/media/${video}/video.mp4`}]),awards:JSON.stringify([{event:'Example Film Festival',category:'Feature film',outcome:'official_selection',year:'2026',source_url:'https://example.test/selection'}]),screenings:JSON.stringify([{event:'World premiere',type:'premiere',date:'2026-11-01',venue:'Example Theatre',city:'Dehradun',country:'India',source_url:'https://example.test/premiere'}])};
  await editor.post('/admin/content/save').type('form').send(await withContentVersion({...values,production_media:JSON.stringify([{type:'poster',title:'Wrong format',url:`/media/${video}`,alt:'Poster'}])})).expect(422);
  await editor.post('/admin/content/save').type('form').send(await withContentVersion(values)).expect(302);const entry=(await rows(db,'SELECT * FROM cms_entries WHERE title=?',[values.title]))[0];productionId=entry.id;
  let page=await request(app).get(`/productions/${entry.slug}/`).expect(200);assert.match(page.text,/Studio rights holder/);assert.match(page.text,/Official platform/);assert.match(page.text,/Example Film Festival/);assert.match(page.text,/World premiere/);assert.match(page.text,/Theme song/);assert.ok(!page.text.includes('SECRET CONTRACT TERMS'));assert.ok(!page.text.includes('PRIVATE BIO UNTIL PUBLISHED'));assert.ok(!page.text.includes(`href="/people/${person.slug}/"`));
  const feed=(await request(app).get('/api/site')).body.entries.find(item=>item.id===productionId);assert.equal(feed.metadata.rights_notes,undefined);
  await editor.get(`/admin/content/${productionId}/preview`).expect(200).then(r=>assert.match(r.text,/SECRET CONTRACT TERMS/));
  await editor.get(`/admin/content/${productionId}`).expect(200).then(r=>{assert.match(r.text,/data-production-collection/);assert.match(r.text,/contributor_credits_rows/);});
  await editor.post('/admin/people/save').type('form').send({...personValues,id:personId,status:'published'}).expect(303);
  page=await request(app).get(`/productions/${entry.slug}/`).expect(200);assert.ok(page.text.includes(`href="/people/${person.slug}/"`));
  await request(app).get(`/people/${person.slug}`).expect(301).expect('Location',`/people/${person.slug}/`);await request(app).get(`/people/${person.slug}/`).expect(200).then(r=>{assert.match(r.text,/PRIVATE BIO UNTIL PUBLISHED/);assert.ok(r.text.includes(`/productions/${entry.slug}/`));assert.match(r.text,/data-page="person-detail"/);});
  await request(app).get('/sitemap.xml').expect(200).then(r=>assert.ok(r.text.includes(`/people/${person.slug}/`)));
  await editor.post(`/admin/media/${image}/delete`).type('form').send({_csrf:csrfEditor}).expect(409);await editor.post(`/admin/media/${video}/delete`).type('form').send({_csrf:csrfEditor}).expect(409);
  await editor.post('/admin/people/save').type('form').send({...personValues,id:personId,name:'Updated public name',status:'archived'}).expect(303);assert.equal((await rows(db,'SELECT slug FROM production_people WHERE id=?',[personId]))[0].slug,person.slug);await request(app).get(`/people/${person.slug}/`).expect(404);await request(app).get(`/productions/${entry.slug}/`).expect(200).then(r=>assert.ok(!r.text.includes(`href="/people/${person.slug}/"`)));
  const legacy={_csrf:csrfEditor,id:productionId,type:'production',title:values.title,production_stage:'released',status:'published'};await editor.post('/admin/content/save').type('form').send(await withContentVersion(legacy)).expect(302);const saved=JSON.parse((await rows(db,'SELECT metadata FROM cms_entries WHERE id=?',[productionId]))[0].metadata);assert.equal(saved.cast_credits[0].person_id,personId);assert.equal(saved.awards.length,1);assert.equal(saved.production_media.length,5);assert.equal(saved.rights_notes,values.rights_notes);
 }finally{if(productionId)await rows(db,'DELETE FROM cms_entries WHERE id=?',[productionId]);if(personId)await rows(db,'DELETE FROM production_people WHERE id=?',[personId]);await rows(db,'DELETE FROM cms_media WHERE id IN (?,?)',[image,video]);}
});

test('Structured EPKs enforce private grants, PDF protection, expiry, revocation and atomic download limits',async()=>{
 const pdf=Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF');
 const uploaded=(await editor.post('/admin/media/upload').set('Accept','application/json').field('_csrf',csrfEditor).field('kind','document').field('epk_private','true').field('alt','Controlled EPK').attach('image',pdf,{filename:'controlled-kit.pdf',contentType:'application/pdf'}).expect(201)).body;
 await request(app).get(uploaded.url).expect(404);await editor.get(uploaded.url).expect(200);
 const people=[];let id;
 try{
  for(const [name,status]of [['Public EPK biography','published'],['HIDDEN DRAFT BIOGRAPHY','draft']])people.push((await rows(db,'INSERT INTO production_people(slug,name,biography,status,published_at) VALUES(?,?,?,?,UTC_TIMESTAMP())',[name.toLowerCase().replaceAll(' ','-'),name,name+' text',status])).insertId);
  const values={_csrf:csrfEditor,type:'production',title:'Controlled structured EPK fixture',production_stage:'released',status:'published',body:'Public synopsis',rights_notes:'PRIVATE CONTRACT',epk_url:uploaded.url,epk_mode:'link_only',epk_structured:'yes',epk_intro:'PRIVATE KIT INTRODUCTION',epk_people:JSON.stringify(people.map(person_id=>({person_id}))),epk_statements:JSON.stringify([{title:'Director statement',author:'Director',body:'A statement about the film.'}])};
  await editor.post('/admin/content/save').type('form').send(await withContentVersion(values)).expect(302);const entry=(await rows(db,'SELECT * FROM cms_entries WHERE title=?',[values.title]))[0];id=entry.id;
  for(const suffix of ['press-kit/','press-kit.pdf','press-kit.html'])await request(app).get(`/productions/${entry.slug}/${suffix}`).expect(404);
  await request(app).get(`/media/${uploaded.id}`).expect(404);
  const feed=(await request(app).get('/api/site')).body.entries.find(item=>item.id===id);assert.equal(feed.metadata.epk_url,undefined);assert.equal(feed.metadata.epk_intro,undefined);assert.equal(feed.metadata.epk_statements,undefined);
  await editor.get(`/admin/production-epks/${id}/preview`).expect(200).then(r=>{assert.match(r.text,/Director statement/);assert.match(r.text,/Public EPK biography/);assert.ok(!r.text.includes('HIDDEN DRAFT BIOGRAPHY'));assert.ok(!r.text.includes('PRIVATE CONTRACT'));});
  await manager.get(`/admin/production-epks/${id}`).expect(403);await editor.get(`/admin/production-epks/${id}`).expect(200);
  const grant=async(max=2)=>{const response=await editor.post(`/admin/production-epks/${id}/grants`).type('form').send({_csrf:csrfEditor,label:'Test press team',days:7,max_downloads:max}).expect(200);const token=response.text.match(/\/press-access\/([A-Za-z0-9_-]{43})\//)[1];return {token,url:`/press-access/${token}/`};};
  const first=await grant(1);await request(app).get(first.url).expect(200).expect('Referrer-Policy','no-referrer');await request(app).head(first.url+'press-kit.pdf').expect(200);
  const results=await Promise.all([request(app).get(first.url+'press-kit.pdf'),request(app).get(first.url+'press-kit.pdf')]);assert.deepEqual(results.map(r=>r.status).sort(),[200,404]);
  const saved=(await rows(db,'SELECT * FROM production_epk_grants WHERE production_id=? ORDER BY id LIMIT 1',[id]))[0];assert.equal(saved.downloads,1);assert.notEqual(saved.token_hash,first.token);await request(app).get(first.url).expect(404);
  const second=await grant();await request(app).get(second.url+'press-kit.html').expect(200).expect('Content-Disposition',/attachment/).then(r=>{assert.match(r.text,/Director statement/);assert.ok(!r.text.includes(second.token));});
  const secondId=(await rows(db,'SELECT id FROM production_epk_grants WHERE production_id=? ORDER BY id DESC LIMIT 1',[id]))[0].id;await editor.post(`/admin/production-epks/${id}/grants/${secondId}/revoke`).type('form').send({_csrf:csrfEditor}).expect(303);await request(app).get(second.url).expect(404);
  const expired=await grant();await rows(db,'UPDATE production_epk_grants SET expires_at=DATE_SUB(UTC_TIMESTAMP(),INTERVAL 1 DAY) WHERE production_id=?',[id]);await request(app).get(expired.url).expect(404);
  const active=await grant();await rows(db,'UPDATE cms_entries SET status="archived" WHERE id=?',[id]);await request(app).get(active.url).expect(404);
  await editor.post('/admin/content/save').type('form').send(await withContentVersion({...values,id,epk_mode:'public'})).expect(302);await request(app).get(`/productions/${entry.slug}/press-kit/`).expect(200);await request(app).get(`/productions/${entry.slug}/press-kit.html`).expect(200).expect('Content-Disposition',/attachment/);await request(app).get(`/productions/${entry.slug}/press-kit.pdf`).expect(200);await request(app).get(uploaded.url).expect(404);
  await editor.post('/admin/content/save').type('form').send(await withContentVersion({...values,id,epk_mode:'disabled'})).expect(302);await request(app).get(`/productions/${entry.slug}/press-kit/`).expect(404);await request(app).get(active.url).expect(404);
 }finally{if(id)await rows(db,'DELETE FROM cms_entries WHERE id=?',[id]);for(const person of people)await rows(db,'DELETE FROM production_people WHERE id=?',[person]);}
});


test('Dashboard review queues match their destination lists, exports and role permissions',async()=>{
 const staff=(await rows(db,'SELECT id,name,role FROM cms_users WHERE email=?',['admin@test.local']))[0];
 const enquiryIds=[];let contentId,memberId,applicationId;
 try{
  for(const [name,status,source] of [['Dashboard contact new','new','/contact/'],['Dashboard partner new','new','/partner/'],['Dashboard assigned','assigned','/partner/'],['Dashboard accepted','accepted','/contact/'],['Dashboard closed','closed','/contact/']]){
   const result=await rows(db,'INSERT INTO cms_enquiries(category,name,email,subject,message,status,source,consent_at,consent_version) VALUES("general",?,"dashboard@example.test","Dashboard scope check","Synthetic test",?,?,UTC_TIMESTAMP(),"test")',[name,status,source]);enquiryIds.push(result.insertId);
  }
  contentId=(await rows(db,'INSERT INTO cms_entries(type,title,slug,summary,body,metadata,status) VALUES("blog","Dashboard linked <story>","dashboard-scope-story","","","{}","draft")')).insertId;
  memberId=(await rows(db,'INSERT INTO talent_accounts(email,password_hash,name,role,status) VALUES("dashboard-member@example.test","test-only","Dashboard pending member","artist","pending")')).insertId;
  applicationId=(await rows(db,'INSERT INTO career_applications(career_title,name,email,phone,message,resume_filename,resume_name,consent_version) VALUES("Dashboard role","Dashboard applicant","dashboard-applicant@example.test","1234567890","Synthetic test","dashboard-fixture.pdf","fixture.pdf","test")')).insertId;
  await rows(db,'INSERT INTO cms_audit(user_id,action,target_type,target_id) VALUES(?,"save","content",?)',[staff.id,String(contentId)]);
  const data=await buildDashboard(db,staff);
  const newCount=Number((await rows(db,'SELECT COUNT(*) AS total FROM cms_enquiries WHERE status="new"'))[0].total);
  assert.equal(data.attentionTasks.find(item=>item.label==='New enquiries').value,newCount);
  assert.equal(data.attentionTasks.find(item=>item.label==='New enquiries').href,'/admin/enquiries?section=all&status=new');
  assert.equal(data.activity[0].recordTitle,'Dashboard linked <story>');assert.equal(data.activity[0].href,`/admin/content/${contentId}`);
  const list=await manager.get('/admin/enquiries?section=all&status=new&q=Dashboard').expect(200);assert.match(list.text,/Dashboard contact new/);assert.match(list.text,/Dashboard partner new/);assert.ok(!list.text.includes('Dashboard closed'));
  const follow=await manager.get('/admin/enquiries?section=all&status=follow_up&q=Dashboard').expect(200);assert.match(follow.text,/Dashboard assigned/);assert.match(follow.text,/Dashboard accepted/);assert.ok(!follow.text.includes('Dashboard contact new'));assert.ok(!follow.text.includes('Dashboard closed'));
  const csv=await manager.get('/admin/enquiries/export.csv?section=all&status=follow_up&q=Dashboard').expect(200);assert.match(csv.text,/Dashboard assigned/);assert.match(csv.text,/Dashboard accepted/);assert.ok(!csv.text.includes('Dashboard closed'));
  const html=await admin.get('/admin').expect(200);assert.match(html.text,/Dashboard linked &lt;story&gt;/);assert.match(html.text,/dashboard-attention-grid/);
  await admin.post('/admin/notifications/read').type('form').send({_csrf:csrfAdmin,key:'all'}).expect(302);
  assert.equal((await buildDashboard(db,staff)).attentionTotal,data.attentionTotal);
  const editorUser=(await rows(db,'SELECT id,role FROM cms_users WHERE email="editor@test.local"'))[0];const editorData=await buildDashboard(db,editorUser);assert.deepEqual(editorData.attentionTasks.map(task=>task.label),['Drafts in the making']);
  const managerUser=(await rows(db,'SELECT id,role FROM cms_users WHERE email="enquiry_manager@test.local"'))[0];const managerData=await buildDashboard(db,managerUser);assert.deepEqual(managerData.attentionTasks.map(task=>task.label),['New enquiries','New career applications']);
 }finally{
  for(const id of enquiryIds)await rows(db,'DELETE FROM cms_enquiries WHERE id=?',[id]);
  if(contentId)await rows(db,'DELETE FROM cms_entries WHERE id=?',[contentId]);if(memberId)await rows(db,'DELETE FROM talent_accounts WHERE id=?',[memberId]);if(applicationId)await rows(db,'DELETE FROM career_applications WHERE id=?',[applicationId]);
 }
});

test('Media type filters, gallery and portrait usage, and descriptions stay accurate and protected',async()=>{
 const ids=[];let entryId,personId;
 try{
  for(const [name,mime] of [['media-check.webp','image/webp'],['media-check.mp4','video/mp4'],['media-check.pdf','application/pdf'],['media-check.vtt','text/vtt']])ids.push((await rows(db,'INSERT INTO cms_media(filename,original_name,mime,size,alt) VALUES(?,?,?,?,?)',[name,name,mime,1024,'Media scope fixture'])).insertId);
  entryId=(await rows(db,'INSERT INTO cms_entries(type,title,slug,summary,body,metadata,status) VALUES("production","Media gallery test","media-gallery-check","","",?,"draft")',[JSON.stringify({gallery:[{media_id:ids[0],kind:'still',alt:'Gallery scene',caption:''}]})])).insertId;
  personId=(await rows(db,'INSERT INTO production_people(slug,name,biography,image_id) VALUES("media-check-person","Media check person","Test biography",?)',[ids[0]])).insertId;
  const used=await editor.get('/admin/media?kind=image&usage=used&q=media-check').expect(200);assert.match(used.text,/media-check.webp/);assert.match(used.text,/1 content record/);assert.match(used.text,/1 person profile/);assert.ok(!used.text.includes('data-confirm="Permanently delete this unused file?"'));
  const unused=await editor.get('/admin/media?kind=image&usage=unused&q=media-check').expect(200);assert.ok(!unused.text.includes('data-media-id="'+ids[0]+'"'));
  for(const [index,kind] of [[1,'video'],[2,'document'],[3,'captions']]){const page=await editor.get(`/admin/media?kind=${kind}&q=media-check`).expect(200);assert.ok(page.text.includes('data-media-id="'+ids[index]+'"'));assert.ok(!page.text.includes('data-media-id="'+ids[0]+'"'));}
  await manager.post(`/admin/media/${ids[0]}/description`).type('form').send({_csrf:csrfManager,alt:'Not allowed'}).expect(403);
  await editor.post(`/admin/media/${ids[0]}/description`).type('form').send({alt:'Missing CSRF'}).expect(403);
  await editor.post(`/admin/media/${ids[0]}/description`).type('form').send({_csrf:csrfEditor,alt:''}).expect(422);
  await editor.post(`/admin/media/${ids[0]}/description`).type('form').send({_csrf:csrfEditor,alt:'Sunlight over the production set'}).expect(302);
  assert.equal((await rows(db,'SELECT alt FROM cms_media WHERE id=?',[ids[0]]))[0].alt,'Sunlight over the production set');
  const selector=await editor.get('/admin/content/new?type=blog').expect(200);assert.match(selector.text,/data-media-alt="Sunlight over the production set"/);
  const portraitSelector=await editor.get('/admin/people/new').expect(200);assert.match(portraitSelector.text,/data-media-alt="Sunlight over the production set"/);
  const images=await editor.get('/admin/media/images.json').expect(200);assert.equal(images.body.images.find(image=>image.id===ids[0]).alt,'Sunlight over the production set');assert.ok(images.body.images.every(image=>!['password_hash','email'].some(key=>key in image)));await manager.get('/admin/media/images.json').expect(403);
 }finally{
  if(personId)await rows(db,'DELETE FROM production_people WHERE id=?',[personId]);if(entryId)await rows(db,'DELETE FROM cms_entries WHERE id=?',[entryId]);for(const id of ids)await rows(db,'DELETE FROM cms_media WHERE id=?',[id]);
 }
});

test('Enquiry and application follow-up queues preserve filters, validate owners and keep unified history',async()=>{
 const staff=(await rows(db,'SELECT id FROM cms_users WHERE email="enquiry_manager@test.local"'))[0],publisher=(await rows(db,'SELECT id FROM cms_users WHERE email="editor@test.local"'))[0];
 const enquiryIds=[],applicationIds=[];
 try{
  for(const [name,status,owner,days] of [['Followup test overdue','new',staff.id,-2],['Followup test upcoming','new',null,2],['Followup test closed','closed',staff.id,-3]])enquiryIds.push((await rows(db,'INSERT INTO cms_enquiries(category,name,email,subject,message,status,assigned_to,source,priority,next_action,follow_up_at,consent_at,consent_version) VALUES("general",?,"followup@example.test","Followup test enquiry","Synthetic test",?,?,"/contact/","high","Call the producer",DATE_ADD(UTC_TIMESTAMP(),INTERVAL ? DAY),UTC_TIMESTAMP(),"test")',[name,status,owner,days])).insertId);
  for(const [name,status,owner,days] of [['Followup test candidate overdue','new',staff.id,-2],['Followup test candidate upcoming','new',null,2],['Followup test candidate rejected','rejected',staff.id,-3]])applicationIds.push((await rows(db,'INSERT INTO career_applications(career_title,name,email,phone,message,resume_filename,resume_name,consent_version,status,assigned_to,priority,next_action,follow_up_at) VALUES("Followup test role",?,"workflow@example.test","1234567890","Test only","workflow-fixture.pdf","fixture.pdf","test",?,?,"high","Review the portfolio",DATE_ADD(UTC_TIMESTAMP(),INTERVAL ? DAY))',[name,status,owner,days])).insertId);
  const list='/admin/enquiries?section=all&q=Followup%20test&owner=me&priority=high&due=overdue&per_page=25&p=1';
  const overdue=await manager.get(list).expect(200);assert.ok(overdue.text.includes('name="ids" value="'+enquiryIds[0]+'"'));assert.ok(!overdue.text.includes('name="ids" value="'+enquiryIds[1]+'"'));assert.ok(!overdue.text.includes('name="ids" value="'+enquiryIds[2]+'"'));assert.match(overdue.text,/Call the producer/);assert.match(overdue.text,/Overdue/);
  const upcoming=await manager.get('/admin/enquiries?section=all&q=Followup%20test&due=upcoming&owner=unassigned').expect(200);assert.ok(upcoming.text.includes('name="ids" value="'+enquiryIds[1]+'"'));
  const csv=await manager.get('/admin/enquiries/export.csv?section=all&q=Followup%20test&owner=me&priority=high&due=overdue').expect(200);assert.match(csv.text,/Followup test overdue/);assert.ok(!csv.text.includes('Followup test closed'));assert.match(csv.text,/next_action/);
  const appList='/admin/applications?q=Followup%20test&owner=me&due=overdue';const apps=await manager.get(appList).expect(200);assert.ok(apps.text.includes('name="ids" value="'+applicationIds[0]+'"'));assert.ok(!apps.text.includes('name="ids" value="'+applicationIds[2]+'"'));assert.match(apps.text,/Review the portfolio/);
  for(const [resource,id,returnTo] of [['enquiry',enquiryIds[0],list],['application',applicationIds[0],appList]]){
   const base=resource==='enquiry'?'/admin/enquiries':'/admin/applications';
   const payload={_csrf:csrfManager,status:resource==='enquiry'?'in_review':'reviewing',assigned_to:staff.id,priority:'urgent',next_action:'Arrange a production call',follow_up_at:'2099-01-02T10:00',note:'Private workflow note',return_to:returnTo};
   await manager.post(`${base}/${id}`).type('form').send({...payload,assigned_to:publisher.id}).expect(422);
   const save=await manager.post(`${base}/${id}`).type('form').send(payload).expect(302);const target=new URL(save.headers.location,'http://local');assert.equal(target.searchParams.get('return_to'),returnTo);assert.equal(target.searchParams.get('saved'),'1');
   const detail=await manager.get(save.headers.location).expect(200);assert.match(detail.text,/Activity timeline/);assert.match(detail.text,/Private workflow note/);assert.match(detail.text,/Arrange a production call/);assert.match(detail.text,/Owner/);assert.match(detail.text,/Follow-up updated|Status updated/);
   const stored=(await rows(db,`SELECT assigned_to,priority,next_action,follow_up_at FROM ${resource==='enquiry'?'cms_enquiries':'career_applications'} WHERE id=?`,[id]))[0];assert.equal(stored.assigned_to,staff.id);assert.equal(stored.priority,'urgent');assert.equal(stored.follow_up_at,'2099-01-02 10:00:00');
   await manager.post(`${base}/${id}`).type('form').send({_csrf:csrfManager,status:payload.status,note:'Note-only update'}).expect(302);assert.equal((await rows(db,`SELECT next_action FROM ${resource==='enquiry'?'cms_enquiries':'career_applications'} WHERE id=?`,[id]))[0].next_action,payload.next_action);
   const reply=await manager.get(`/admin/replies/${resource}/${id}?return_to=${encodeURIComponent(returnTo)}`).expect(200);assert.ok(reply.text.includes('return_to='));
   await editor.get(`${base}/${id}`).expect(403);
  }
  const prefix=`KEM-${String(enquiryIds[0]).padStart(6,'0')}-REPLY-`;
  for(const [key,status]of [['sent','sent'],['failed','failed']])await rows(db,'INSERT INTO cms_email_outbox(receipt_key,recipient,subject,body,status,sent_at) VALUES(?,"followup@example.test",?,"Reply body <script> is escaped",?,IF(?="sent",UTC_TIMESTAMP(),NULL))',[prefix+key,'Workflow '+key+' reply',status,status]);
  const timeline=await manager.get(`/admin/enquiries/${enquiryIds[0]}`).expect(200);assert.match(timeline.text,/Workflow sent reply/);assert.match(timeline.text,/Workflow failed reply/);assert.match(timeline.text,/>Sent</);assert.match(timeline.text,/>Failed</);assert.match(timeline.text,/Reply body &lt;script&gt; is escaped/);
  const unsafe=await manager.get(`/admin/enquiries/${enquiryIds[0]}?return_to=${encodeURIComponent('https://evil.test/')}`).expect(200);assert.ok(!unsafe.text.includes('href="https://evil.test/"'));
 }finally{
  for(const id of enquiryIds){await rows(db,'DELETE FROM cms_email_outbox WHERE receipt_key LIKE ?',[`KEM-${String(id).padStart(6,'0')}-REPLY-%`]);await rows(db,'DELETE FROM cms_enquiries WHERE id=?',[id]);}for(const id of applicationIds)await rows(db,'DELETE FROM career_applications WHERE id=?',[id]);
 }
});

test('Content revisions prevent stale saves, preserve history and restore earlier content only as a draft',async()=>{
 let id,imageId,otherId,legalId;const csrf=csrfEditor;
 try{
  imageId=(await rows(db,'INSERT INTO cms_media(filename,original_name,mime,size,alt) VALUES("revision-fixture.webp","Revision fixture","image/webp",1,"A production scene")')).insertId;
  const original={_csrf:csrf,type:'blog',title:'Revision safety original',summary:'Original summary',body:'Original <script> text stays escaped',image_id:imageId,status:'draft'};
  await editor.post('/admin/blog/save').type('form').send(original).expect(302);id=(await rows(db,'SELECT id FROM cms_entries WHERE slug="revision-safety-original"'))[0].id;
  const edit=await editor.get(`/admin/content/${id}`).expect(200);assert.match(edit.text,/name="revision" value="1"/);assert.match(edit.text,/Last edited/);
  await admin.post('/admin/blog/save').type('form').send({...original,_csrf:csrfAdmin,id,revision:1,title:'A newer saved title',body:'Newer content',status:'published'}).expect(302);
  const before=(await rows(db,'SELECT * FROM cms_entries WHERE id=?',[id]))[0];assert.equal(before.revision,2);
  const stale=await editor.post('/admin/blog/save').set('Accept','application/json').type('form').send({...original,id,revision:1,title:'Stale title'}).expect(409);assert.equal(stale.body.code,'CONTENT_CONFLICT');assert.equal(stale.body.conflict.revision,2);
  await editor.post('/admin/blog/save').type('form').send({...original,id,title:'Missing version'}).expect(409);
  const after=(await rows(db,'SELECT * FROM cms_entries WHERE id=?',[id]))[0];assert.deepEqual(after,before);
  const mediaBefore=(await rows(db,'SELECT COUNT(*) AS n FROM cms_media'))[0].n;
  await editor.post('/admin/blog/save').field('_csrf',csrf).field('type','blog').field('id',String(id)).field('revision','1').field('title','Stale upload').field('status','draft').field('banner_alt','A scene').attach('image',Buffer.from('not-decoded-because-stale'),{filename:'stale.png',contentType:'image/png'}).expect(409);
  assert.equal((await rows(db,'SELECT COUNT(*) AS n FROM cms_media'))[0].n,mediaBefore);
  const race=await Promise.all([editor.post('/admin/blog/save').type('form').send({...original,id,revision:2,title:'Race one'}),admin.post('/admin/blog/save').type('form').send({...original,_csrf:csrfAdmin,id,revision:2,title:'Race two'})]);assert.deepEqual(race.map(response=>response.status).sort(),[302,409]);assert.equal((await rows(db,'SELECT revision FROM cms_entries WHERE id=?',[id]))[0].revision,3);
  await editor.post('/admin/blog/save').type('form').send({...original,id,revision:3,title:'Latest published title',image_id:'',status:'published'}).expect(302);
  const first=(await rows(db,'SELECT id FROM cms_entry_revisions WHERE content_id=? AND revision=1',[id]))[0];
  const history=await editor.get(`/admin/content/${id}/revisions?version=1`).expect(200);assert.match(history.text,/Revision safety original/);assert.match(history.text,/Latest published title/);assert.match(history.text,/Original &lt;script&gt; text stays escaped/);assert.match(history.text,/hide this currently published item/);
  await editor.post(`/admin/media/${imageId}/delete`).type('form').send({_csrf:csrf}).expect(409);
  await editor.post('/admin/blog/save').type('form').send({...original,title:'Another revision record',image_id:''}).expect(302);otherId=(await rows(db,'SELECT id FROM cms_entries WHERE slug="another-revision-record"'))[0].id;const otherSnapshot=(await rows(db,'SELECT id FROM cms_entry_revisions WHERE content_id=?',[otherId]))[0].id;
  const restore={_csrf:csrf,revision:4,snapshot_id:first.id,confirm_restore:'draft'};
  await editor.post(`/admin/content/${id}/revisions/restore`).type('form').send({...restore,snapshot_id:otherSnapshot}).expect(404);
  await editor.post(`/admin/content/${id}/revisions/restore`).type('form').send({...restore,revision:3}).expect(409);
  await editor.post(`/admin/content/${id}/revisions/restore`).type('form').send({...restore,confirm_restore:''}).expect(422);
  await editor.post(`/admin/content/${id}/revisions/restore`).type('form').send({revision:4,snapshot_id:first.id,confirm_restore:'draft'}).expect(403);
  await manager.get(`/admin/content/${id}/revisions`).expect(403);await manager.get(`/admin/content/${id}/version`).expect(403);
  await editor.post(`/admin/content/${id}/revisions/restore`).type('form').send(restore).expect(302);
  const restored=(await rows(db,'SELECT * FROM cms_entries WHERE id=?',[id]))[0];assert.equal(restored.revision,5);assert.equal(restored.title,original.title);assert.equal(restored.status,'draft');assert.equal(restored.published_at,null);assert.equal(restored.slug,'revision-safety-original');assert.equal(restored.image_id,imageId);
  assert.ok(!(await request(app).get('/api/site')).body.entries.some(entry=>entry.id===id));assert.equal((await rows(db,'SELECT COUNT(*) AS n FROM cms_entry_revisions WHERE content_id=?',[id]))[0].n,5);
  await editor.post(`/admin/content/${id}/archive`).type('form').send({_csrf:csrf,revision:4}).expect(409);await editor.post(`/admin/content/${id}/archive`).type('form').send({_csrf:csrf,revision:5}).expect(302);
  await editor.post('/admin/tables/content/bulk').type('form').send({_csrf:csrf,ids:[id],status:'draft'}).expect(302);assert.equal((await rows(db,'SELECT revision FROM cms_entries WHERE id=?',[id]))[0].revision,7);
  await editor.post('/admin/blog/save').type('form').send({...original,id,revision:6}).expect(409);
  const version=await editor.get(`/admin/content/${id}/version`).expect(200);assert.equal(version.body.revision,7);assert.ok(!('email' in version.body));
  legalId=(await rows(db,'INSERT INTO cms_entries(type,title,slug,summary,body,metadata,status) VALUES("legal","Private legal revision test","private-legal-revision-test","","","{}","draft")')).insertId;await editor.get(`/admin/content/${legalId}/revisions`).expect(403);await admin.get(`/admin/content/${legalId}/version`).expect(403);
 }finally{for(const entryId of [id,otherId,legalId].filter(Boolean))await rows(db,'DELETE FROM cms_entries WHERE id=?',[entryId]);if(imageId)await rows(db,'DELETE FROM cms_media WHERE id=?',[imageId]);}
});

test('Staff permissions reject direct reads, writes and exports outside each role',async()=>{
 const adminOnly=['/admin/users','/admin/settings','/admin/talent','/admin/talent/enquiries','/admin/talent/projects','/admin/manage/legal','/admin/manage/hero','/admin/operations','/admin/email','/admin/audit','/admin/news-campaigns','/admin/newsletter','/admin/casting-application-settings','/admin/reports/activity','/admin/reports/registrations/download.csv'];
 for(const [agent,csrf] of [[editor,csrfEditor],[manager,csrfManager]]){
  for(const url of adminOnly)await agent.get(url).expect(403);
  for(const url of ['/admin/users','/admin/users/1/access','/admin/users/1/toggle','/admin/settings','/admin/talent/1','/admin/enquiries/1/delete','/admin/kpi/settings','/admin/kpi/reports/1/approve','/admin/news-campaigns','/admin/news-campaigns/1/queue','/admin/tables/members/bulk'])await agent.post(url).type('form').send({_csrf:csrf}).expect(403);
 }
 for(const url of ['/admin/content','/admin/content/new','/admin/content/1','/admin/content/1/version','/admin/content/1/revisions','/admin/media','/admin/site-content','/admin/people','/admin/casting','/admin/casting-applications','/admin/production-epks/1','/admin/reports/content'])await manager.get(url).expect(403);
 for(const url of ['/admin/content/save','/admin/content/1/delete','/admin/content/1/revisions/restore','/admin/media','/admin/media/1/delete','/admin/site-content/save','/admin/casting/save','/admin/tables/content/bulk'])await manager.post(url).type('form').send({_csrf:csrfManager}).expect(403);
 for(const url of ['/admin/enquiries','/admin/enquiries/1','/admin/applications','/admin/applications/1/resume','/admin/replies/enquiry/1','/admin/kpi','/admin/reports/enquiries','/admin/reports/applications'])await editor.get(url).expect(403);
 for(const url of ['/admin/enquiries/1','/admin/applications/1','/admin/replies/enquiry/1','/admin/tables/enquiries/bulk','/admin/tables/applications/bulk'])await editor.post(url).type('form').send({_csrf:csrfEditor}).expect(403);
 for(const [agent,label] of [[admin,'Administrator'],[editor,'Editor'],[manager,'Enquiry manager']]){
  const guide=await agent.get('/admin/permissions').expect(200);assert.ok(guide.text.includes(`Your role: ${label}`));assert.match(guide.text,/Staff permissions by role/);assert.ok(!guide.text.includes('password_hash'));
 }
 const denied=await editor.get('/admin/users').expect(403);assert.match(denied.text,/This action is restricted/);assert.match(denied.text,/View role permissions/);assert.match(denied.text,/CMS navigation/);
 await request(app).get('/admin/permissions').expect(302).expect('Location','/admin/login');
});

test('Staff access changes are administrator-only, reject stale forms and revoke every affected session',async()=>{
 const result=await rows(db,'INSERT INTO cms_users(name,email,password_hash,role) VALUES(?,?,?,?)',['Access test','access-test@test.local',await hashPassword('A-secure-test-password'),'editor']);
 const id=result.insertId;
 const [first,firstCsrf]=await login('access-test'),[second]=await login('access-test');
 const url=`/admin/users/${id}/access`;
 const initial={_csrf:csrfAdmin,previous_role:'editor',previous_active:'1',role:'enquiry_manager',active:'1'};
 await admin.post(url).type('form').send({...initial,_csrf:'bad'}).expect(403);
 await first.post(url).type('form').send({...initial,_csrf:firstCsrf,role:'admin'}).expect(403);
 await admin.post(url).type('form').send({...initial,role:'owner'}).expect(422);
 await admin.post(url).type('form').send({...initial,active:'yes'}).expect(422);
 await admin.post(url).type('form').send({...initial,previous_role:undefined}).expect(409);
 await admin.post(url).type('form').send(initial).expect(302);
 await first.get('/admin/content').expect(302).expect('Location','/admin/login');await second.get('/admin/enquiries').expect(302);
 let [fresh]=await login('access-test');await fresh.get('/admin/content').expect(403);await fresh.get('/admin/enquiries').expect(200);
 await admin.post(url).type('form').send({...initial,role:'admin'}).expect(409);
 assert.equal((await rows(db,'SELECT role FROM cms_users WHERE id=?',[id]))[0].role,'enquiry_manager');
 await admin.post(url).type('form').send({...initial,previous_role:'enquiry_manager',active:'0'}).expect(302);
 await fresh.get('/admin/enquiries').expect(302);
 await admin.post(url).type('form').send({...initial,previous_role:'enquiry_manager',previous_active:'0'}).expect(302);
 await fresh.get('/admin/enquiries').expect(302); // Reenabling access must never revive an old session.
 [fresh]=await login('access-test');await fresh.get('/admin/enquiries').expect(200);
 const own=(await rows(db,"SELECT id FROM cms_users WHERE email='admin@test.local'"))[0];
 await admin.post(`/admin/users/${own.id}/access`).type('form').send({...initial,previous_role:'admin',role:'editor'}).expect(422);
 await admin.post('/admin/users/99999999/access').type('form').send(initial).expect(404);
 const events=await rows(db,"SELECT action FROM cms_audit WHERE target_type='user' AND target_id=? AND action LIKE 'access_%'",[id]);assert.equal(events.length,3);
 await rows(db,"DELETE FROM cms_sessions WHERE JSON_EXTRACT(data,'$.userId')=?",[id]);await rows(db,'DELETE FROM cms_users WHERE id=?',[id]);
});

test('Activity log filters staff, actions, modules and UTC dates with stable pagination and recorded change details',async()=>{
 const actor=(await rows(db,"SELECT id FROM cms_users WHERE email='admin@test.local'"))[0].id;
 const inserted=[];
 try{
  for(let i=0;i<32;i++)inserted.push((await rows(db,'INSERT INTO cms_audit(user_id,action,target_type,target_id,created_at,details) VALUES(?,?,?,?,?,?)',[i%2?null:actor,'audit_fixture','content',String(90000+i),i===31?'2026-05-03 00:00:00':'2026-05-02 23:59:59',i===0?JSON.stringify({changes:[{field:'Title',before:'<script>old</script>',after:'Unique audit title'},{field:'Body'}]}):null])).insertId);
  const base='/admin/audit?action=audit_fixture&module=content&from=2026-05-02&to=2026-05-02';
  const first=await admin.get(base).expect(200);assert.match(first.text,/31 matching events/);assert.match(first.text,/Page 1 of 2/);assert.ok(!first.text.includes('content / 90031'));
  const second=await admin.get(base+'&p=2').expect(200);assert.match(second.text,/Page 2 of 2/);assert.match(second.text,/Unique audit title/);assert.ok(!second.text.includes('<script>old</script>'));assert.ok(second.text.includes('&lt;script&gt;old&lt;/script&gt;'));assert.match(second.text,/text is not copied/);
  const search=await admin.get(base+'&q=Unique%20audit%20title').expect(200);assert.match(search.text,/1 matching event/);
  const byStaff=await admin.get(base+`&actor=${actor}`).expect(200);assert.match(byStaff.text,/16 matching events/);
  const noStaff=await admin.get(base+'&actor=system').expect(200);assert.match(noStaff.text,/15 matching events/);assert.match(noStaff.text,/System \/ member \/ unavailable/);
  const empty=await admin.get(base+'&q=missing-fixture-value').expect(200);assert.match(empty.text,/No matching activity/);
  for(const query of ['from=2026-02-30','from=2026-06-01&to=2026-05-01','actor=invalid'])await admin.get('/admin/audit?'+query).expect(422);
  const contentResult=await admin.post('/admin/content/save').type('form').send({_csrf:csrfAdmin,type:'blog',title:'Audit tracked draft',slug:'audit-tracked-draft',summary:'Public summary',body:'Body not copied',status:'draft'}).expect(302);
  const content=(await rows(db,"SELECT * FROM cms_entries WHERE slug='audit-tracked-draft'"))[0];
  const audit=(await rows(db,"SELECT details FROM cms_audit WHERE target_type='content' AND target_id=? ORDER BY id DESC LIMIT 1",[content.id]))[0];
  const encoded=typeof audit.details==='string'?audit.details:JSON.stringify(audit.details);assert.match(encoded,/Audit tracked draft/);assert.ok(!encoded.includes('Body not copied'));assert.match(encoded,/Publishing status/);
  await rows(db,'DELETE FROM cms_entries WHERE id=?',[content.id]);
 }finally{for(const id of inserted)await rows(db,'DELETE FROM cms_audit WHERE id=?',[id]);}
});

test('Blog categories are created separately, reused safely and selected only from the saved catalog',async()=>{
 await request(app).get('/admin/blog-categories').expect(302);
 await manager.get('/admin/blog-categories').expect(403);await manager.post('/admin/blog-categories').type('form').send({_csrf:csrfManager,name:'No access'}).expect(403);
 await editor.post('/admin/blog-categories').type('form').send({name:'No CSRF'}).expect(403);
 for(const name of ['', '   ', 'x'.repeat(101)])await editor.post('/admin/blog-categories').type('form').send({_csrf:csrfEditor,name}).expect(422);
 const count=Number((await rows(db,'SELECT COUNT(*) AS total FROM cms_entries'))[0].total);
 const created=await editor.post('/admin/blog-categories').type('form').send({_csrf:csrfEditor,name:'  Behind   the scenes  '}).expect(201),id=created.body.category.id;
 assert.equal(created.body.category.name,'Behind the scenes');assert.equal(Number((await rows(db,'SELECT COUNT(*) AS total FROM cms_entries'))[0].total),count);
 const duplicate=await admin.post('/admin/blog-categories').type('form').send({_csrf:csrfAdmin,name:'BEHIND THE SCENES'}).expect(200);assert.equal(duplicate.body.category.id,id);assert.equal(duplicate.body.existing,true);
 const concurrent=await Promise.all([editor,admin].map((agent,index)=>agent.post('/admin/blog-categories').type('form').send({_csrf:index?csrfAdmin:csrfEditor,name:'Studio perspectives'})));assert.deepEqual(concurrent.map(result=>result.status).sort(),[200,201]);
 const other=concurrent[0].body.category.id;assert.equal(other,concurrent[1].body.category.id);
 const special=await editor.post('/admin/blog-categories').type('form').send({_csrf:csrfEditor,name:'<script>Category</script>'}).expect(201);
 const page=await editor.get('/admin/content/new?type=blog').expect(200);assert.match(page.text,/data-blog-category-picker/);assert.ok(page.text.includes('&lt;script&gt;Category&lt;/script&gt;'));assert.ok(!page.text.includes('input name="category"'));
 const payload={_csrf:csrfEditor,type:'blog',title:'Saved category workflow',body:'Category test body',status:'draft',categories_present:'1'};
 await editor.post('/admin/blog/save').type('form').send({...payload,category:'Random category'}).expect(422);
 await editor.post('/admin/blog/save').type('form').send({...payload,category_ids:'999999999'}).expect(422);
 await editor.post('/admin/blog/save').type('form').send({...payload,category_ids:[String(id),String(other),String(id)]}).expect(302);
 let entry=(await rows(db,"SELECT * FROM cms_entries WHERE slug='saved-category-workflow'"))[0],metadata=typeof entry.metadata==='string'?JSON.parse(entry.metadata):entry.metadata;
 assert.deepEqual(metadata.categories,['Behind the scenes','Studio perspectives']);assert.deepEqual(metadata.category_ids,[id,other]);assert.equal(metadata.category,'Behind the scenes');assert.equal(entry.status,'draft');
 const edit=await editor.get(`/admin/content/${entry.id}`).expect(200);assert.ok(edit.text.includes(`value="${id}" data-category-name="Behind the scenes" checked`));
 await editor.post('/admin/blog/save').type('form').send({...payload,id:entry.id,revision:entry.revision,status:'published',category_ids:[String(id),String(other)]}).expect(302);
 const published=(await request(app).get('/api/site')).body.entries.find(item=>item.id===entry.id);assert.deepEqual(published.metadata.categories,['Behind the scenes','Studio perspectives']);
 entry=(await rows(db,'SELECT * FROM cms_entries WHERE id=?',[entry.id]))[0];
 await editor.post('/admin/blog/save').type('form').send({...payload,id:entry.id,revision:entry.revision}).expect(302);
 entry=(await rows(db,'SELECT * FROM cms_entries WHERE id=?',[entry.id]))[0];metadata=typeof entry.metadata==='string'?JSON.parse(entry.metadata):entry.metadata;assert.deepEqual(metadata.categories,[]);assert.equal(metadata.category,'');
 const catalog=await editor.get('/admin/blog-categories').expect(200);assert.ok(catalog.body.categories.some(category=>category.id===id));assert.ok(!catalog.text.includes('created_by'));
 await rows(db,'DELETE FROM cms_entries WHERE id=?',[entry.id]);await rows(db,'DELETE FROM cms_blog_categories WHERE id IN (?,?,?)',[id,other,special.body.category.id]);
});

test('Blog and news category management protects used categories and deletes unused categories without changing posts',async()=>{
 for(const type of ['blog','news']){
  const base=`/admin/${type}-categories`;
  await manager.get(base+'/manage').expect(403);await manager.post(base+'/123/delete').type('form').send({_csrf:csrfManager}).expect(403);
  await editor.get(base+'/manage').expect(200);
  await editor.post(base+'/manage').type('form').send({_csrf:csrfEditor,name:`Managed ${type} category`}).expect(302);
  const category=(await editor.get(base)).body.categories.find(item=>item.name===`Managed ${type} category`);
  await editor.post(`${base}/${category.id}/delete`).type('form').send({}).expect(403);
  const payload={_csrf:csrfEditor,type,title:`Managed ${type} category post`,status:'draft',categories_present:'1',category_ids:String(category.id)};
  await editor.post(`/admin/${type}/save`).type('form').send(payload).expect(302);
  let entry=(await rows(db,'SELECT * FROM cms_entries WHERE type=? AND title=?',[type,payload.title]))[0];
  await editor.post(`${base}/${category.id}/delete`).type('form').send({_csrf:csrfEditor}).expect(409);
  const page=await editor.get(base+'/manage?q=Managed').expect(200);assert.match(page.text,/In use/);assert.match(page.text,/Remove this category/);
  assert.equal((await rows(db,'SELECT revision FROM cms_entries WHERE id=?',[entry.id]))[0].revision,entry.revision);
  await editor.post(`/admin/${type}/save`).type('form').send({...payload,id:entry.id,revision:entry.revision,category_ids:undefined}).expect(302);
  entry=(await rows(db,'SELECT * FROM cms_entries WHERE id=?',[entry.id]))[0];
  await editor.post(`${base}/${category.id}/delete`).type('form').send({_csrf:csrfEditor}).expect(302);
  assert.ok(!(await editor.get(base)).body.categories.some(item=>item.id===category.id));
  await editor.post(`/admin/${type}/save`).type('form').send({...payload,id:entry.id,revision:entry.revision}).expect(422);
  assert.equal((await rows(db,'SELECT revision FROM cms_entries WHERE id=?',[entry.id]))[0].revision,entry.revision);
  await editor.post(`${base}/${category.id}/delete`).type('form').send({_csrf:csrfEditor}).expect(404);
  await rows(db,'DELETE FROM cms_entries WHERE id=?',[entry.id]);
 }
});

test('News checkbox categories stay separate from blogs and require a PDF when any selection is a press release',async()=>{
 const add=async(type,name)=>(await editor.post(`/admin/${type}-categories`).type('form').send({_csrf:csrfEditor,name})).body.category;
 const general=await add('news','Announcements'),press=await add('news','Press Releases'),blogOnly=await add('blog','Only in blog taxonomy');
 assert.ok(!(await editor.get('/admin/news-categories')).body.categories.some(item=>item.name===blogOnly.name));
 const form=await editor.get('/admin/content/new?type=news').expect(200);assert.match(form.text,/Create news category/);assert.match(form.text,/news-categories\/manage/);assert.ok(!form.text.includes('select name="category"'));
 const payload={_csrf:csrfEditor,type:'news',title:'Multi-category press release',status:'published',categories_present:'1',category_ids:[String(general.id),String(press.id)]};
 await editor.post('/admin/news/save').type('form').send({...payload,category:'Free text'}).expect(422);
 await editor.post('/admin/news/save').type('form').send(payload).expect(422);
 await editor.post('/admin/news/save').type('form').send({...payload,pdf_url:'https://example.test/approved.pdf'}).expect(302);
 const entry=(await rows(db,"SELECT * FROM cms_entries WHERE title='Multi-category press release'"))[0],publicEntry=(await request(app).get('/api/site')).body.entries.find(item=>item.id===entry.id);
 assert.equal(publicEntry.metadata.category,'Announcements');assert.deepEqual(publicEntry.metadata.categories,['Announcements','Press Releases']);
 await editor.post(`/admin/news-categories/${press.id}/delete`).type('form').send({_csrf:csrfEditor}).expect(409);
 await rows(db,'DELETE FROM cms_entries WHERE id=?',[entry.id]);await editor.post(`/admin/news-categories/${general.id}/delete`).type('form').send({_csrf:csrfEditor}).expect(302);await editor.post(`/admin/blog-categories/${blogOnly.id}/delete`).type('form').send({_csrf:csrfEditor}).expect(302);
});

test('Concurrent category deletion and post save cannot leave a selected category missing',async()=>{
 const category=(await editor.post('/admin/blog-categories').type('form').send({_csrf:csrfEditor,name:'Concurrent taxonomy fixture'})).body.category;
 const payload={_csrf:csrfEditor,type:'blog',title:'Concurrent taxonomy post',status:'draft',categories_present:'1'};
 await editor.post('/admin/blog/save').type('form').send(payload).expect(302);
 const entry=(await rows(db,"SELECT * FROM cms_entries WHERE title='Concurrent taxonomy post'"))[0];
 const [save,remove]=await Promise.all([
  editor.post('/admin/blog/save').type('form').send({...payload,id:entry.id,revision:entry.revision,category_ids:String(category.id)}),
  admin.post(`/admin/blog-categories/${category.id}/delete`).type('form').send({_csrf:csrfAdmin}),
 ]);
 assert.ok((save.status===302&&remove.status===409)||(save.status===422&&remove.status===302),`Unexpected outcomes: ${save.status}/${remove.status}`);
 const current=(await rows(db,'SELECT metadata FROM cms_entries WHERE id=?',[entry.id]))[0],metadata=typeof current.metadata==='string'?JSON.parse(current.metadata):current.metadata;
 if(metadata.category_ids.includes(category.id))assert.equal((await rows(db,'SELECT id FROM cms_blog_categories WHERE id=?',[category.id])).length,1);
 await rows(db,'DELETE FROM cms_entries WHERE id=?',[entry.id]);await rows(db,'DELETE FROM cms_blog_categories WHERE id=?',[category.id]);
});

test('Career opportunities select employment and work arrangement separately and preserve legacy labels safely',async()=>{
 const page=await editor.get('/admin/content/new?type=career').expect(200);assert.match(page.text,/<select name="role">/);assert.match(page.text,/<select name="work_arrangement">/);assert.ok(!page.text.includes('<input name="role"'));
 for(const label of ['Full-time','Part-time','Freelance','Contract','Project-based','Temporary','Internship','Apprenticeship','Consultancy','On-site','Hybrid','Remote'])assert.ok(page.text.includes(`>${label}</option>`));
 const payload={_csrf:csrfEditor,type:'career',title:'Structured career type fixture',status:'published',role:'Full-time',work_arrangement:'Hybrid',location:'Mumbai'};
 await editor.post('/admin/career/save').type('form').send({...payload,role:'Hybrid'}).expect(422);
 await editor.post('/admin/career/save').type('form').send({...payload,work_arrangement:'Freelance'}).expect(422);
 await editor.post('/admin/career/save').type('form').send(payload).expect(302);
 let entry=(await rows(db,"SELECT * FROM cms_entries WHERE title='Structured career type fixture'"))[0];
 const published=(await request(app).get('/api/site')).body.entries.find(item=>item.id===entry.id);assert.equal(published.metadata.role,'Full-time');assert.equal(published.metadata.work_arrangement,'Hybrid');assert.equal(published.metadata.location,'Mumbai');
 const edit=await editor.get(`/admin/content/${entry.id}`).expect(200);assert.ok(edit.text.includes('value="Full-time" selected'));assert.ok(edit.text.includes('value="Hybrid" selected'));
 const preview=await editor.get(`/admin/content/${entry.id}/preview`).expect(200);assert.match(preview.text,/Full-time · Hybrid · Mumbai/);
 await editor.post('/admin/career/save').type('form').send({...payload,id:entry.id,revision:entry.revision,role:'Part-time',work_arrangement:'Remote'}).expect(302);
 entry=(await rows(db,'SELECT * FROM cms_entries WHERE id=?',[entry.id]))[0];
 const legacy=JSON.stringify({role:'Older studio engagement',work_arrangement:'On-site'});await rows(db,'UPDATE cms_entries SET metadata=? WHERE id=?',[legacy,entry.id]);
 const oldEdit=await editor.get(`/admin/content/${entry.id}`).expect(200);assert.match(oldEdit.text,/Older studio engagement \(existing value\)/);
 await editor.post('/admin/career/save').type('form').send({...payload,id:entry.id,revision:entry.revision,role:'Older studio engagement'}).expect(302);
 await rows(db,'DELETE FROM cms_entries WHERE id=?',[entry.id]);
});

test('Staff deletion protects the default admin, revokes sessions, transfers assignments and retains content and audit history',async()=>{
 const defaultAdmin=(await rows(db,"SELECT id,is_default_admin FROM cms_users WHERE email='admin@test.local'"))[0];assert.equal(defaultAdmin.is_default_admin,1);
 const makeUser=async(name,role)=>(await rows(db,'INSERT INTO cms_users(name,email,password_hash,role) VALUES(?,?,?,?)',[name,`${name}@test.local`,await hashPassword('A-secure-test-password'),role])).insertId;
 const otherAdminId=await makeUser('delete-other-admin','admin'),[otherAdmin,otherCsrf]=await login('delete-other-admin');
 const protectedPayload={_csrf:otherCsrf,confirm_delete:'delete',previous_role:'admin',previous_active:'1'};
 await otherAdmin.post(`/admin/users/${defaultAdmin.id}/delete`).type('form').send(protectedPayload).expect(403);
 await otherAdmin.post(`/admin/users/${defaultAdmin.id}/access`).type('form').send({...protectedPayload,role:'editor',active:'0'}).expect(422);
 const id=await makeUser('delete-staff-manager','enquiry_manager'),[account]=await login('delete-staff-manager'),[second]=await login('delete-staff-manager');
 const url=`/admin/users/${id}/delete`,payload={_csrf:csrfAdmin,confirm_delete:'delete',previous_role:'enquiry_manager',previous_active:'1'};
 await editor.post(url).type('form').send({...payload,_csrf:csrfEditor}).expect(403);await manager.post(url).type('form').send({...payload,_csrf:csrfManager}).expect(403);
 await admin.post(url).type('form').send({...payload,_csrf:undefined}).expect(403);await admin.post(url).type('form').send({...payload,confirm_delete:undefined}).expect(422);await admin.post(url).type('form').send({...payload,previous_role:'editor'}).expect(409);
 const content=(await rows(db,"INSERT INTO cms_entries(type,title,slug,summary,body,metadata,status,created_by,updated_by) VALUES('blog','Retained author content','retained-author-content','','','{}','draft',?,?)",[id,id])).insertId;
 const enquiry=(await rows(db,"INSERT INTO cms_enquiries(category,name,email,subject,message,consent_at,consent_version,assigned_to) VALUES('general','Staff assignment','assignment@example.test','Fixture','Fixture',UTC_TIMESTAMP(),'test',?)",[id])).insertId;
 const assignedApplication=(await rows(db,"INSERT INTO career_applications(career_title,name,email,phone,message,resume_filename,resume_name,consent_version,assigned_to) VALUES('Fixture role','Assigned applicant','assigned@example.test','123','Fixture','assignment-fixture.pdf','resume.pdf','v1',?)",[id])).insertId;
 const action=(await rows(db,"INSERT INTO cms_kpi_actions(cadence,period_start,metric_key,title,owner_id,due_date,expected_outcome,evidence) VALUES('weekly','2026-11-16','enquiries','Retained action',?,'2026-12-01','Review fixture','')",[id])).insertId;
 const event=(await rows(db,"INSERT INTO cms_audit(user_id,action,target_type,target_id) VALUES(?,'update','content',?)",[id,String(content)])).insertId;
 const page=await admin.get('/admin/users').expect(200);assert.ok(!page.text.includes(`action="/admin/users/${defaultAdmin.id}/delete"`));assert.ok(page.text.includes(`action="/admin/users/${id}/delete"`));
 await admin.post(url).type('form').send(payload).expect(302);
 assert.equal((await rows(db,'SELECT id FROM cms_users WHERE id=?',[id])).length,0);await account.get('/admin').expect(302).expect('Location','/admin/login');await second.get('/admin').expect(302);
 assert.equal((await rows(db,'SELECT assigned_to FROM cms_enquiries WHERE id=?',[enquiry]))[0].assigned_to,defaultAdmin.id);assert.equal((await rows(db,'SELECT owner_id FROM cms_kpi_actions WHERE id=?',[action]))[0].owner_id,defaultAdmin.id);
 assert.equal((await rows(db,'SELECT assigned_to FROM career_applications WHERE id=?',[assignedApplication]))[0].assigned_to,defaultAdmin.id);
 const retained=(await rows(db,'SELECT created_by,updated_by FROM cms_entries WHERE id=?',[content]))[0];assert.equal(retained.created_by,null);assert.equal(retained.updated_by,null);assert.equal((await rows(db,'SELECT user_id FROM cms_audit WHERE id=?',[event]))[0].user_id,null);
 await admin.post(url).type('form').send(payload).expect(404);
 // A non-default administrator may delete their own account, with another admin retained.
 await otherAdmin.post(`/admin/users/${otherAdminId}/delete`).set('Accept','application/json').type('form').send(protectedPayload).expect(200).then(result=>assert.equal(result.body.redirect,'/admin/login?deleted=1'));await otherAdmin.get('/admin').expect(302);
 await rows(db,'DELETE FROM career_applications WHERE id=?',[assignedApplication]);await rows(db,'DELETE FROM cms_kpi_actions WHERE id=?',[action]);await rows(db,'DELETE FROM cms_enquiries WHERE id=?',[enquiry]);await rows(db,'DELETE FROM cms_entries WHERE id=?',[content]);
});

test('Member deletion removes linked records, sessions and private files while preserving other accounts and blocking in-flight mail',async()=>{
 const makeMember=async(name,role)=>(await rows(db,"INSERT INTO talent_accounts(email,password_hash,name,role,status,bio,credits) VALUES(?,?,?,?,'pending','','')",[`${name}@example.test`,await hashPassword('A-long-member-password'),name,role])).insertId;
 const artist=await makeMember('delete-artist','artist'),hirer=await makeMember('delete-hirer','hirer');
 const loginMember=async email=>{const agent=request.agent(app),csrf=(await agent.get('/api/csrf')).body.token;await agent.post('/api/talent/login').set('X-CSRF-Token',csrf).send({email,password:'A-long-member-password'}).expect(200);return agent;};
 const artistSession=await loginMember('delete-artist@example.test'),hirerSession=await loginMember('delete-hirer@example.test');
 const staffId=(await rows(db,"SELECT id FROM cms_users WHERE email='admin@test.local'"))[0].id;await rows(db,"UPDATE cms_sessions SET data=JSON_SET(data,'$.memberId',?) WHERE JSON_EXTRACT(data,'$.userId')=?",[artist,staffId]);assert.equal((await admin.get('/api/talent/session')).body.user.id,artist);
 const portraitName=`delete-member-${process.pid}.png`,scriptName=`delete-script-${process.pid}.txt`,folder=new URL('../storage/uploads/',import.meta.url);await mkdir(folder,{recursive:true});await writeFile(new URL(portraitName,folder),'Private portrait fixture');await writeFile(new URL(scriptName,folder),'Private script fixture');
 const portrait=(await rows(db,"INSERT INTO cms_media(filename,original_name,mime,size,alt) VALUES(?,?,'image/png',24,'Private member portrait')",[portraitName,portraitName])).insertId;await rows(db,'UPDATE talent_accounts SET image_id=? WHERE id=?',[portrait,artist]);
 const project=(await rows(db,"INSERT INTO production_projects(account_id,title,plan,script_filename,script_name) VALUES(?,'Private deletion project','{}',?,'script.txt')",[hirer,scriptName])).insertId;
 await rows(db,'INSERT INTO talent_shortlists(account_id,artist_id) VALUES(?,?)',[hirer,artist]);await rows(db,"INSERT INTO talent_enquiries(sender_id,artist_id,project,message) VALUES(?,?,'Fixture','Private message')",[hirer,artist]);
 const production=(await rows(db,"INSERT INTO cms_entries(type,title,slug,summary,body,metadata,status) VALUES('production','Deletion casting parent','deletion-casting-parent','','','{}','draft')")).insertId;
 const call=(await rows(db,"INSERT INTO casting_calls(production_id,title,summary,requirements,location,deadline,roles) VALUES(?,'Deletion call','','','Mumbai','2099-12-31','[]')",[production])).insertId;
 const application=(await rows(db,"INSERT INTO casting_applications(call_id,account_id,role_key,call_title,role_name,role_eligibility,profile_snapshot,message,audition_links,terms_version,terms_snapshot,consent_at,reviewer_note) VALUES(?,?,?,'Deletion call','Role','Eligibility','{}','Message','[]','v1','Terms',UTC_TIMESTAMP(),'')",[call,artist,'a'.repeat(64)])).insertId;
 const mail=(await rows(db,"INSERT INTO cms_email_outbox(receipt_key,recipient,subject,body,status,available_at,casting_application_id) VALUES(?,'delete-artist@example.test','Fixture','Fixture','sending',UTC_TIMESTAMP(),?)",[`CAST-${String(application).padStart(6,'0')}-RECEIVED`,application])).insertId;
 const artistPayload={_csrf:csrfAdmin,confirm_delete:'delete',previous_email:'delete-artist@example.test',previous_status:'pending'};
 await editor.post(`/admin/talent/${artist}/delete`).type('form').send({...artistPayload,_csrf:csrfEditor}).expect(403);await manager.post(`/admin/talent/${artist}/delete`).type('form').send({...artistPayload,_csrf:csrfManager}).expect(403);
 await admin.post(`/admin/talent/${artist}/delete`).type('form').send({...artistPayload,_csrf:undefined}).expect(403);await admin.post(`/admin/talent/${artist}/delete`).type('form').send({...artistPayload,confirm_delete:undefined}).expect(422);await admin.post(`/admin/talent/${artist}/delete`).type('form').send({...artistPayload,previous_status:'approved'}).expect(409);
 await admin.post(`/admin/talent/${artist}/delete`).type('form').send(artistPayload).expect(409);assert.equal((await rows(db,'SELECT id FROM talent_accounts WHERE id=?',[artist])).length,1);await readFile(new URL(portraitName,folder));
 await rows(db,"UPDATE cms_email_outbox SET status='pending' WHERE id=?",[mail]);await admin.post(`/admin/talent/${artist}/delete`).type('form').send(artistPayload).expect(302);
 assert.equal((await artistSession.get('/api/talent/session')).body.user,null);assert.equal((await admin.get('/api/talent/session')).body.user,null);await admin.get('/admin/users').expect(200);assert.equal((await rows(db,'SELECT id FROM casting_applications WHERE id=?',[application])).length,0);assert.equal((await rows(db,'SELECT id FROM cms_email_outbox WHERE id=?',[mail])).length,0);assert.equal((await rows(db,'SELECT id FROM cms_media WHERE id=?',[portrait])).length,0);await assert.rejects(()=>readFile(new URL(portraitName,folder)),error=>error.code==='ENOENT');
 assert.equal((await rows(db,'SELECT * FROM talent_shortlists WHERE artist_id=?',[artist])).length,0);assert.equal((await rows(db,'SELECT id FROM talent_enquiries WHERE artist_id=?',[artist])).length,0);assert.equal((await rows(db,'SELECT id FROM talent_accounts WHERE id=?',[hirer])).length,1);await readFile(new URL(scriptName,folder));
 await admin.post(`/admin/talent/${hirer}/delete`).type('form').send({_csrf:csrfAdmin,confirm_delete:'delete',previous_email:'delete-hirer@example.test',previous_status:'pending'}).expect(302);
 assert.equal((await hirerSession.get('/api/talent/session')).body.user,null);assert.equal((await rows(db,'SELECT id FROM production_projects WHERE id=?',[project])).length,0);await assert.rejects(()=>readFile(new URL(scriptName,folder)),error=>error.code==='ENOENT');
 await rows(db,'DELETE FROM casting_calls WHERE id=?',[call]);await rows(db,'DELETE FROM cms_entries WHERE id=?',[production]);
});

test('Deleting a member keeps portrait media shared with CMS content',async()=>{
 const id=(await rows(db,"INSERT INTO talent_accounts(email,password_hash,name,role,status,bio,credits) VALUES('delete-shared-portrait@example.test',?,'Shared portrait member','artist','pending','','')",[await hashPassword('A-long-member-password')])).insertId;
 const filename=`shared-member-${process.pid}.png`,file=new URL(`../storage/uploads/${filename}`,import.meta.url);await writeFile(file,'Shared media fixture');
 const media=(await rows(db,"INSERT INTO cms_media(filename,original_name,mime,size,alt) VALUES(?,?,'image/png',20,'Shared media')",[filename,filename])).insertId;await rows(db,'UPDATE talent_accounts SET image_id=? WHERE id=?',[media,id]);
 const entry=(await rows(db,"INSERT INTO cms_entries(type,title,slug,summary,body,metadata,image_id) VALUES('blog','Shared portrait reference','shared-portrait-reference','','','{}',?)",[media])).insertId;
 await admin.post(`/admin/talent/${id}/delete`).type('form').send({_csrf:csrfAdmin,confirm_delete:'delete',previous_email:'delete-shared-portrait@example.test',previous_status:'pending'}).expect(302);
 assert.equal((await rows(db,'SELECT id FROM talent_accounts WHERE id=?',[id])).length,0);assert.equal((await rows(db,'SELECT id FROM cms_media WHERE id=?',[media])).length,1);await readFile(file);
 await rows(db,'DELETE FROM cms_entries WHERE id=?',[entry]);await rows(db,'DELETE FROM cms_media WHERE id=?',[media]);await unlink(file);
});

test('FilmDesk follows role/goal/material setup, private review, exports and explicit selected submissions',async()=>{
 async function post(agent,url,data){const csrf=(await agent.get('/api/csrf')).body.token;return agent.post(url).set('X-CSRF-Token',csrf).send(data);}
 const owner=request.agent(app),outsider=request.agent(app);
 await post(owner,'/api/talent/register',{name:'FilmDesk Owner',email:'filmdesk-owner@example.test',password:'A-long-member-password',role:'artist',adult:true,consent:true}).then(r=>assert.equal(r.status,201));
 await post(outsider,'/api/talent/register',{name:'Other Desk',email:'filmdesk-other@example.test',password:'A-long-member-password',role:'artist',adult:true,consent:true}).then(r=>assert.equal(r.status,201));
 const department='Creative & Executive Leadership (Above-the-Line)';
 const onboarding={department,professional_role:'Director',objective:'story',material:'scratch',answers:{story_seed:'A journey through the hills',audience:'Festival viewers',development_need:'A treatment'},constraints:'Small cast',assumptions:'All dates provisional',confirmed:true};
 await post(owner,'/api/production/projects',{title:'Invalid role',onboarding:{...onboarding,professional_role:'Imaginary role'}}).then(r=>assert.equal(r.status,422));
 await post(owner,'/api/production/projects',{title:'Unconfirmed brief',onboarding:{...onboarding,confirmed:false}}).then(r=>assert.equal(r.status,422));
 const created=await post(owner,'/api/production/projects',{title:'FilmDesk private test',onboarding});assert.equal(created.status,201);const id=created.body.id;
 const member=(await owner.get('/api/talent/session')).body.user;
 const config=await owner.get('/api/production/config').expect(200);assert.equal(config.body.assistanceAvailable,false);assert.equal(config.body.imdbAvailable,false);
 await outsider.get(`/api/production/projects/${id}`).expect(404);await outsider.get(`/api/production/projects/${id}/script`).expect(404);
 await post(outsider,`/api/production/projects/${id}/plan`,{revision:1,story:'Wrong owner'}).then(r=>assert.equal(r.status,404));
 await owner.get(`/api/production/projects/${id}/export`).expect(409);
 await post(owner,`/api/production/projects/${id}/review`,{revision:1,approved:true}).then(r=>assert.equal(r.status,422));
 await post(owner,`/api/production/projects/${id}/plan`,{revision:1,story:'A reviewed story',pitch:'=SUM(1,2)',notes:'PRIVATE NOTES NOT SHARED'}).then(r=>{assert.equal(r.status,200);assert.equal(r.body.revision,2);});
 await post(owner,`/api/production/projects/${id}/plan`,{revision:1,story:'Stale tab'}).then(r=>assert.equal(r.status,409));
 const uploadToken=(await owner.get('/api/csrf')).body.token;
 const upload=await owner.post(`/api/production/projects/${id}/script`).field('_csrf',uploadToken).field('private_upload_consent','true').field('revision','2').attach('attachment',Buffer.from('Private text material'),{filename:'private-story.txt',contentType:'text/plain'});assert.equal(upload.status,200);assert.equal(upload.body.revision,3);
 await owner.get(`/api/production/projects/${id}/script`).expect(200).then(r=>assert.equal(r.text,'Private text material'));
 await admin.get('/admin/filmdesk').expect(200).then(r=>assert.doesNotMatch(r.text,/FilmDesk private test/));
 await admin.get('/admin/reports/projects?from=2000-01-01&to=2099-01-01').expect(200).then(r=>assert.doesNotMatch(r.text,/FilmDesk private test/));
 await post(owner,`/api/production/projects/${id}/review`,{revision:3,approved:true}).then(r=>assert.equal(r.status,200));
 await owner.get(`/api/production/projects/${id}/export`).expect(200).then(r=>{assert.match(r.text,/A reviewed story/);assert.ok(r.text.includes("'=SUM(1,2)"));});
 const names=['script_submissions_enabled','script_terms','script_terms_version'];const old=await rows(db,'SELECT name,value FROM cms_settings WHERE name IN (?,?,?)',names);
 try{
  for(const [name,value]of Object.entries({script_submissions_enabled:true,script_terms:'Synthetic approved FilmDesk test terms',script_terms_version:'fd-test-1'}))await rows(db,'INSERT INTO cms_settings(name,value) VALUES(?,?) ON DUPLICATE KEY UPDATE value=VALUES(value)',[name,JSON.stringify(value)]);
  const payload={revision:3,sections:['story'],include_script:true,terms_accepted:true,terms_version:'fd-test-1',share_confirmed:true};
  await post(owner,`/api/production/projects/${id}/submit`,{...payload,share_confirmed:false}).then(r=>assert.equal(r.status,422));
  await post(owner,`/api/production/projects/${id}/submit`,{...payload,terms_version:'old'}).then(r=>assert.equal(r.status,422));
  const submitted=await post(owner,`/api/production/projects/${id}/submit`,payload);assert.equal(submitted.status,201);assert.match(submitted.body.reference,/^FD-/);
  const sid=submitted.body.id,record=(await rows(db,'SELECT * FROM filmdesk_submissions WHERE id=?',[sid]))[0],snapshot=json(record.snapshot);assert.deepEqual(Object.keys(snapshot.plan),['story']);assert.equal(snapshot.plan.story,'A reviewed story');
  await admin.get(`/admin/filmdesk/${sid}`).expect(200).then(r=>{assert.match(r.text,/A reviewed story/);assert.doesNotMatch(r.text,/PRIVATE NOTES NOT SHARED/);});
  await editor.get(`/admin/filmdesk/${sid}`).expect(403);
  await admin.get(`/admin/filmdesk/${sid}/document`).expect(200).then(r=>assert.equal(r.text,'Private text material'));
  await post(owner,`/api/production/projects/${id}/submit`,payload).then(r=>assert.equal(r.status,409));
  await admin.post(`/admin/filmdesk/${sid}`).type('form').send({_csrf:csrfAdmin,status:'reviewing',studio_note:'We received your selected story.'}).expect(302);
  await owner.get(`/api/production/projects/${id}`).expect(200).then(r=>{assert.equal(r.body.submissions[0].status,'reviewing');assert.equal(r.body.submissions[0].studio_note,'We received your selected story.');assert.equal(r.body.project.script_filename,undefined);});
  await post(owner,`/api/production/projects/${id}/plan`,{revision:3,story:'New private edit'}).then(r=>assert.equal(r.status,200));
  await owner.get(`/api/production/projects/${id}/export`).expect(409);
  await admin.get(`/admin/filmdesk/${sid}`).expect(200).then(r=>{assert.match(r.text,/A reviewed story/);assert.doesNotMatch(r.text,/New private edit/);});
  const replacementToken=(await owner.get('/api/csrf')).body.token;
  await owner.post(`/api/production/projects/${id}/script`).field('_csrf',replacementToken).field('private_upload_consent','true').field('revision','4').attach('attachment',Buffer.from('Replacement private document'),{filename:'replacement.txt',contentType:'text/plain'}).expect(200);
  await admin.get(`/admin/filmdesk/${sid}/document`).expect(200).then(r=>assert.equal(r.text,'Private text material'));
  await post(owner,`/api/production/projects/${id}/setup`,{revision:5,title:'Updated private workspace',budget:'25000',currency:'INR',timeline:'Dates to confirm',onboarding:{...onboarding,constraints:'Updated constraints'}}).then(r=>{assert.equal(r.status,200);assert.equal(r.body.revision,6);});
  await owner.get(`/api/production/projects/${id}`).expect(200).then(r=>{assert.equal(r.body.project.title,'Updated private workspace');assert.equal(Number(r.body.project.budget),25000);assert.equal(r.body.project.onboarding.constraints,'Updated constraints');assert.equal(r.body.project.reviewed_revision,null);});
  await post(owner,`/api/production/projects/${id}/setup`,{revision:5,onboarding}).then(r=>assert.equal(r.status,409));
 }finally{
  await rows(db,'DELETE FROM cms_settings WHERE name IN (?,?,?)',names);for(const row of old)await rows(db,'INSERT INTO cms_settings(name,value) VALUES(?,?)',[row.name,row.value]);
  await admin.post(`/admin/talent/${member.id}/delete`).type('form').send({_csrf:csrfAdmin,confirm_delete:'delete',previous_email:member.email,previous_status:member.status}).expect(302);
 }
});
