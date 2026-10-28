import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { createPool, rows } from './db.js';
import { hashPassword } from './security.js';
const useMigrationCredentials=process.env.USE_MIGRATION_CREDENTIALS==='true';
const db=createPool({
  user:useMigrationCredentials ? process.env.DB_MIGRATION_USER : process.env.DB_USER,
  password:useMigrationCredentials ? process.env.DB_MIGRATION_PASSWORD : process.env.DB_PASSWORD
});
try{
  await rows(db,'CREATE TABLE IF NOT EXISTS cms_migrations (name VARCHAR(190) PRIMARY KEY, applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)');
  for(const name of (await readdir(new URL('../migrations/',import.meta.url))).filter(n=>/^\d.*\.sql$/.test(n)).sort()){
    if((await rows(db,'SELECT name FROM cms_migrations WHERE name=?',[name])).length)continue;
    const sql=await readFile(new URL(`../migrations/${name}`,import.meta.url),'utf8');
    for(const statement of sql.split(';').map(s=>s.trim()).filter(Boolean))await db.query(statement);
    await rows(db,'INSERT INTO cms_migrations(name) VALUES(?)',[name]);console.log(`Applied ${name}`);
  }
  let admin=(await rows(db,'SELECT id FROM cms_users WHERE role="admin" LIMIT 1'))[0];
  if(!admin){
    const password=randomBytes(18).toString('base64url');
    const result=await rows(db,'INSERT INTO cms_users(name,email,password_hash,role) VALUES(?,?,?,?)',['Kemsor Administrator','admin@kemsor.local',await hashPassword(password),'admin']);admin={id:result.insertId};
    await mkdir(new URL('../storage/',import.meta.url),{recursive:true});
    await writeFile(new URL('../storage/local-admin.txt',import.meta.url),`Local Kemsor CMS\nhttp://127.0.0.1:8100/admin\nEmail: admin@kemsor.local\nPassword: ${password}\n\nChange the password from the CMS after signing in. This file is ignored by Git.\n`,{mode:0o600});console.log('Local admin created. Credentials: backend/storage/local-admin.txt');
  }
  const entries=[];
  entries.push({type:'home',title:'Cinematic production.',slug:'home-hero',summary:'Creative vision. From idea to screen.',body:'',metadata:{}},{type:'home',title:'The script is just the beginning.',slug:'home-intro',summary:'Kemsor works with filmmakers, studios and production partners on films, series and documentaries.',body:'Some projects need a team from the first draft. Others need people on the ground, a hand through post, or a plan for release. We shape our role around the work.',metadata:{}});
  entries.push(
    {type:'career',title:'Sample opportunity: Production Coordinator',slug:'sample-production-coordinator',summary:'Dummy listing for preview only. This is not an active vacancy.',body:'Example responsibilities\nCoordinate schedules, maintain production documents and support communication between crew and production teams.\nExample requirements\nOrganisation, clear communication and familiarity with production workflows.\nApplications are not being accepted for this sample role.',metadata:{category:'Sample listing',role:'Project-based',location:'Mumbai (sample location)'}},
    {type:'career',title:'Sample opportunity: Assistant Video Editor',slug:'sample-assistant-video-editor',summary:'Dummy listing for preview only. This is not an active vacancy.',body:'Example responsibilities\nOrganise footage, prepare editing projects and support the post-production team with exports and version tracking.\nExample requirements\nFamiliarity with editing software, media organisation and attention to detail.\nApplications are not being accepted for this sample role.',metadata:{category:'Sample listing',role:'Project-based',location:'Mumbai (sample location)'}}
  );
  entries.push({type:'blog',title:'Test blog: From first idea to production plan',slug:'test-blog-production-plan',summary:'A sample post for previewing the Kemsor blog. Edit or archive this entry in Admin → Blog.',body:'This is a test blog post, created to preview the blog page and its filters. Replace it with a studio-approved article when ready.\n\nStart with the story\nWrite a short description of the idea, the intended audience and the format. Keep the first brief clear enough for every collaborator to understand.\n\nBuild the production plan\nBring the schedule, locations, cast, crew and budget into the same conversation. Record the decisions that affect the next stage.\n\nKeep the team aligned\nA useful production plan gives everyone a shared starting point and makes changes easy to track.',metadata:{category:'Production planning'}});
  entries.push(...['Frame Daily','Screenwire','Cinema Journal','Studio Post','The Film Edit','Motion Review'].map((title,index)=>({type:'media_partner',title,slug:`sample-media-partner-${index+1}`,summary:'Sample media partner. Replace before publishing the confirmed partner list.',body:'',metadata:{category:'sample'}})));
  for(const e of entries)await rows(db,'INSERT IGNORE INTO cms_entries(type,title,slug,summary,body,metadata,status,published_at,created_by,updated_by) VALUES(?,?,?,?,?,?,"published",UTC_TIMESTAMP(),?,?)',[e.type,e.title,e.slug,e.summary,e.body,JSON.stringify(e.metadata),admin.id,admin.id]);
  const config={contact_email:'contact@kemsor.example',contact_phone:'+91 00000 00000',contact_address:'Sample studio address\nMumbai, Maharashtra, India',contact_note:'Sample details. To be updated',map_location:'Mumbai, Maharashtra, India',map_caption:'Sample map: Mumbai city centre',footer_kicker:'THE NEXT GREAT STORY',footer_title:'Let’s make',footer_accent:'a scene.',footer_description:'For production enquiries and collaborations,\nget in touch with the studio.',footer_cta_label:'Talk to the studio',footer_copyright:'Kemsor Studios',footer_social_label:'Follow the frame',facebook:'',instagram:'',youtube:'',linkedin:'',enquiries_enabled:false,attachments_enabled:false,privacy_notice:'',consent_version:''};
  for(const [name,value]of Object.entries(config))await rows(db,'INSERT IGNORE INTO cms_settings(name,value) VALUES(?,?)',[name,JSON.stringify(value)]);
  await rows(db,'DELETE FROM cms_sessions WHERE expires_at<UTC_TIMESTAMP()');await rows(db,'DELETE FROM cms_rate_limits WHERE expires_at<UTC_TIMESTAMP()');
  console.log('Phase 1 database and seed content are ready. Existing content was preserved.');
}finally{await db.end();}
