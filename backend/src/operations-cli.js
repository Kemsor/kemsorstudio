import {createPool,rows} from './db.js';
import {housekeeping,operation} from './operations.js';
import {retentionPolicy,runRetention,reconcileDeletions,processFileDeletions} from './retention.js';
import {createBackup,recoverBackup,databaseOptions,runCommand} from './backup.js';
import {mkdtemp,rm} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import path from 'node:path';
import {tmpdir} from 'node:os';

const [command,...args]=process.argv.slice(2);
if(command==='recover') {
 if(!args[0]||!args[1])throw new Error('Usage: operations-cli.js recover <encrypted-archive> <new-output-directory>');
 const manifest=await recoverBackup(path.resolve(args[0]),path.resolve(args[1]));
 console.log(JSON.stringify({recovered:true,kind:manifest.kind,createdAt:manifest.createdAt,output:path.resolve(args[1]),databaseImported:false}));
} else {
 const db=createPool();
 try {
  let result;
  if(command==='housekeeping')result=await operation(db,'housekeeping',()=>housekeeping(db));
  else if(command==='retention')result=await operation(db,'retention',()=>runRetention(db,retentionPolicy(),{apply:args.includes('--apply')}));
  else if(command==='backup')result=await operation(db,`backup-${args[0]||'database'}`,()=>createBackup(db,{kind:args[0]||'database'}));
  else if(command==='status')result=await rows(db,'SELECT * FROM cms_operations_runs ORDER BY id DESC LIMIT 20');
  else if(command==='drill') {
   if(!args[0])throw new Error('Usage: operations-cli.js drill <encrypted-archive>');
   result=await operation(db,'recovery-drill',async()=>{
    const work=await mkdtemp(path.join(tmpdir(),'kemsor-drill-')),output=path.join(work,'recovered');
    const target=`kemsor_restore_${Date.now()}`;
    const admin=createPool({user:process.env.DB_MIGRATION_USER||process.env.DB_USER,password:process.env.DB_MIGRATION_PASSWORD??process.env.DB_PASSWORD});
    let created=false;
    try {
     const manifest=await recoverBackup(path.resolve(args[0]),output);
     await rows(admin,`CREATE DATABASE \`${target}\` CHARACTER SET utf8mb4`);created=true;
     const cnf=await databaseOptions(work,{...process.env,DB_NAME:target,DB_BACKUP_USER:process.env.DB_MIGRATION_USER||process.env.DB_USER,DB_BACKUP_PASSWORD:process.env.DB_MIGRATION_PASSWORD??process.env.DB_PASSWORD});
     await runCommand(process.env.MYSQL_BIN||'mysql',[`--defaults-extra-file=${cnf}`,target],{input:createReadStream(path.join(output,'database.sql'))});
     const tables=(await rows(admin,'SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA=?',[target])).map(row=>row.TABLE_NAME).sort();
     if(JSON.stringify(tables)!==JSON.stringify(manifest.tables))throw new Error('Restored table inventory differs from backup');
     // Reapply the current deletion ledger so an older snapshot does not resurrect erased records.
     const deletions=await rows(db,'SELECT resource,source_id,source_created_at FROM cms_data_deletions');
     const restored=createPool({user:process.env.DB_MIGRATION_USER||process.env.DB_USER,password:process.env.DB_MIGRATION_PASSWORD??process.env.DB_PASSWORD,database:target});
     let erased;
     try {
      erased=await reconcileDeletions(restored,deletions);
      if(manifest.kind==='application')await processFileDeletions(restored,path.join(output,'backend/storage'));
     }finally{await restored.end();}
     return {verified:true,kind:manifest.kind,tableCount:tables.length,deletionsReapplied:erased,disposableDatabaseRemoved:true};
    }finally{
     try{if(created)await rows(admin,`DROP DATABASE \`${target}\``);}finally{await admin.end();await rm(work,{recursive:true,force:true});}
    }
   });
  } else throw new Error('Choose housekeeping, retention [--apply], backup [database|application], recover, drill or status');
  console.log(JSON.stringify(result,null,2));
 }finally{await db.end();}
}
