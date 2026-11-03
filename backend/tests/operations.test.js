import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm,stat,utimes,symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {randomBytes} from 'node:crypto';
import {backupKey,encryptArchive,decryptArchive,createBackup,recoverBackup,remoteSettings} from '../src/backup.js';
import {retentionPolicy} from '../src/retention.js';

test('Retention requires explicit enablement, approved policy and valid periods',()=>{
 assert.equal(retentionPolicy({}).enabled,false);
 assert.throws(()=>retentionPolicy({RETENTION_ENABLED:'true'}));
 assert.throws(()=>retentionPolicy({RETENTION_ENQUIRY_DAYS:'-1'}));
 assert.throws(()=>retentionPolicy({RETENTION_ENQUIRY_DAYS:'12.5'}));
 assert.equal(retentionPolicy({RETENTION_ENQUIRY_DAYS:'180'}).enabled,false);
 assert.equal(retentionPolicy({RETENTION_ENABLED:'true',RETENTION_POLICY_VERSION:'approved-v1',RETENTION_APPLICATION_DAYS:'365'}).application,365);
});
test('Encryption rejects incorrect keys and tampered archives',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'kemsor-crypto-'));
 try{
  const key=randomBytes(32),plain=path.join(root,'plain'),encrypted=path.join(root,'encrypted'),restored=path.join(root,'restored');
  await writeFile(plain,'synthetic backup content');
  await encryptArchive(plain,encrypted,key);
  assert.equal((await stat(encrypted)).mode&0o777,0o600);
  await decryptArchive(encrypted,restored,key);
  assert.equal(await readFile(restored,'utf8'),'synthetic backup content');
  await assert.rejects(decryptArchive(encrypted,path.join(root,'wrong'),randomBytes(32)));
  const data=await readFile(encrypted);data[25]^=1;await writeFile(encrypted,data);
  await assert.rejects(decryptArchive(encrypted,path.join(root,'tampered'),key));
  await assert.rejects(stat(path.join(root,'tampered')));
  assert.throws(()=>backupKey('not-a-backup-key'));
 }finally{await rm(root,{recursive:true,force:true});}
});
test('SSH destination validation rejects shell injection and unsafe paths',()=>{
 assert.equal(remoteSettings({}),null);
 for(const dir of ['/','/backups/../secrets',"/backups';echo hacked"]){assert.throws(()=>remoteSettings({BACKUP_REMOTE_HOST:'owner@storage.example',BACKUP_REMOTE_DIR:dir}));}
 assert.throws(()=>remoteSettings({BACKUP_REMOTE_HOST:'-oProxyCommand=bad',BACKUP_REMOTE_DIR:'/backups'}));
 assert.equal(remoteSettings({BACKUP_REMOTE_HOST:'owner@storage.example',BACKUP_REMOTE_DIR:'/backups/kemsor/'}).directory,'/backups/kemsor');
});
test('Application backup recovers database and private files, excludes secrets and preserves minimum retention',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'kemsor-backup-test-'));
 try {
  await mkdir(path.join(root,'backend/src'),{recursive:true});await mkdir(path.join(root,'backend/storage/uploads'),{recursive:true});
  await writeFile(path.join(root,'backend/src/example.js'),'// synthetic source');
  await writeFile(path.join(root,'backend/storage/uploads/private.pdf'),'synthetic private file');
  await writeFile(path.join(root,'backend/.env'),'DO_NOT_BACK_UP=this-secret');
  const dump=path.join(root,'dump');
  await writeFile(dump,'#!/bin/sh\nprintf "CREATE TABLE synthetic (id INT);\\n"\n',{mode:0o700});
  const env={DB_NAME:'synthetic',DB_USER:'test',DB_PASSWORD:'synthetic-secret',BACKUP_DIR:path.join(root,'archives'),BACKUP_ENCRYPTION_KEY:randomBytes(32).toString('base64'),MYSQLDUMP_BIN:dump};
  const db={execute:async()=>[[{table:'synthetic'}]]};
  const old=path.join(env.BACKUP_DIR,'kemsor-application-old.ksb');await mkdir(env.BACKUP_DIR);await writeFile(old,'old');const date=new Date(Date.now()-31*86400000);await utimes(old,date,date);
  const recent=path.join(env.BACKUP_DIR,'kemsor-application-recent.ksb');await writeFile(recent,'recent');
  await assert.rejects(createBackup(db,{root,kind:'application',env:{...env,BACKUP_RETENTION_DAYS:'10'}}));
  const result=await createBackup(db,{root,kind:'application',env});
  assert.equal(result.offsite,false);assert.equal(result.pruned,1);
  await assert.rejects(stat(old));await stat(recent);
  const output=path.join(root,'restored');
  const manifest=await recoverBackup(path.join(env.BACKUP_DIR,result.archive),output,{env});
  assert.equal(manifest.kind,'application');assert.deepEqual(manifest.tables,['synthetic']);
  assert.equal(await readFile(path.join(output,'backend/storage/uploads/private.pdf'),'utf8'),'synthetic private file');
  await assert.rejects(stat(path.join(output,'backend/.env')));
  await assert.rejects(recoverBackup(path.join(env.BACKUP_DIR,result.archive),output,{env}));
  await symlink('/etc',path.join(root,'backend/src/unsafe'));
  await assert.rejects(createBackup(db,{root,kind:'application',env}));
 }finally{await rm(root,{recursive:true,force:true});}
});

test('Housekeeping removes abandoned private backup work while preserving recent work',async()=>{
 const {cleanupBackupWork}=await import('../src/backup.js');
 const root=await mkdtemp(path.join(tmpdir(),'kemsor-stale-work-'));
 try {
  const old=path.join(root,'.work-old001'),recent=path.join(root,'.work-new001');
  await mkdir(old);await writeFile(path.join(old,'database.sql'),'synthetic private dump');await mkdir(recent);
  const time=new Date(Date.now()-2*86400000);await utimes(old,time,time);
  assert.equal((await cleanupBackupWork({BACKUP_DIR:root})).cleaned,1);
  await assert.rejects(stat(old));await stat(recent);
 }finally{await rm(root,{recursive:true,force:true});}
});
