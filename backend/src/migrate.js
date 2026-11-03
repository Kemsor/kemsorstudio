import {seedManagedContent} from './managed-content.js';
import {executeMigration} from './run-migration.js';
import {readFile,readdir} from 'node:fs/promises';
import {createPool,rows} from './db.js';
const privileged=process.argv.includes('--use-migration-credentials');
const db=createPool(privileged?{user:process.env.DB_MIGRATION_USER||'root',password:process.env.DB_MIGRATION_PASSWORD||''}:{});
try{
 await rows(db,'CREATE TABLE IF NOT EXISTS cms_migrations(name VARCHAR(190) PRIMARY KEY,applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)');
 for(const name of (await readdir(new URL('../migrations/',import.meta.url))).filter(name=>/^\d.*\.sql$/.test(name)).sort()){
  if((await rows(db,'SELECT name FROM cms_migrations WHERE name=?',[name])).length)continue;
  const sql=await readFile(new URL(`../migrations/${name}`,import.meta.url),'utf8');
  await executeMigration(db,sql);
  await rows(db,'INSERT INTO cms_migrations(name) VALUES(?)',[name]);console.log(`Applied ${name}`);
 }
 await seedManagedContent(db);
}finally{await db.end()}
