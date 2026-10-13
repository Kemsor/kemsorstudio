import { mkdir, writeFile } from 'node:fs/promises';
import { createPool, rows } from './db.js';
const db=createPool();
try{
 const data={format:'kemsor-phase-one',version:1,exported_at:new Date().toISOString(),tables:{}};
 for(const table of ['cms_users','cms_entries','cms_media','cms_settings','cms_enquiries','cms_enquiry_notes','cms_audit','cms_notification_reads','talent_accounts','talent_shortlists','talent_enquiries','production_projects'])data.tables[table]=await rows(db,`SELECT * FROM ${table}`);
 await mkdir(new URL('../storage/exports/',import.meta.url),{recursive:true});
 const filename=`kemsor-${Date.now()}.json`;
 await writeFile(new URL(`../storage/exports/${filename}`,import.meta.url),JSON.stringify(data,null,2),{mode:0o600});
 console.log(`Export saved to backend/storage/exports/${filename}. Copy storage/uploads separately for media and attachments.`);
}finally{await db.end();}
