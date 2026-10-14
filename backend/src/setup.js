import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { createPool, rows } from './db.js';
import { hashPassword } from './security.js';
import { notes } from '../../rain-temp/src/productionNotes.js';
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
  const entries=notes.map(n=>({type:'blog',title:n.title,slug:n.id,summary:n.summary,body:[n.introduction,...n.sections.map(([title,copy])=>`${title}\n${copy}`)].join('\n\n'),metadata:{category:n.category}}));
  entries.push({type:'home',title:'Cinematic production.',slug:'home-hero',summary:'Creative vision. From idea to screen.',body:'',metadata:{}},{type:'home',title:'The script is just the beginning.',slug:'home-intro',summary:'Kemsor works with filmmakers, studios and production partners on films, series and documentaries.',body:'Some projects need a team from the first draft. Others need people on the ground, a hand through post, or a plan for release. We shape our role around the work.',metadata:{}});
  for(const e of entries)await rows(db,'INSERT IGNORE INTO cms_entries(type,title,slug,summary,body,metadata,status,published_at,created_by,updated_by) VALUES(?,?,?,?,?,?,"published",UTC_TIMESTAMP(),?,?)',[e.type,e.title,e.slug,e.summary,e.body,JSON.stringify(e.metadata),admin.id,admin.id]);
  const config={facebook:'',instagram:'',youtube:'',enquiries_enabled:false,attachments_enabled:false,privacy_notice:'',consent_version:''};
  for(const [name,value]of Object.entries(config))await rows(db,'INSERT IGNORE INTO cms_settings(name,value) VALUES(?,?)',[name,JSON.stringify(value)]);
  await rows(db,'DELETE FROM cms_sessions WHERE expires_at<UTC_TIMESTAMP()');await rows(db,'DELETE FROM cms_rate_limits WHERE expires_at<UTC_TIMESTAMP()');
  console.log('Phase 1 database and seed content are ready. Existing content was preserved.');
}finally{await db.end();}
