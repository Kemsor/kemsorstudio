import {spawn} from 'node:child_process';
import {createReadStream,createWriteStream} from 'node:fs';
import {mkdir,mkdtemp,writeFile,readFile,appendFile,rename,rm,stat,readdir,lstat,chmod} from 'node:fs/promises';
import {createCipheriv,createDecipheriv,createHash,randomBytes,randomUUID} from 'node:crypto';
import {pipeline} from 'node:stream/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {rows} from './db.js';

export const applicationRoot=fileURLToPath(new URL('../../',import.meta.url));
const magic=Buffer.from('KEMSORBK1');
const publicPaths=['backend/public','rain-temp/public','rain-temp/dist'];
const included=['package.json','package-lock.json','shared','backend/src','backend/views','backend/public','backend/migrations','backend/package.json','backend/package-lock.json','backend/storage/uploads','backend/storage/career-resumes','rain-temp/src','rain-temp/public','rain-temp/dist','rain-temp/package.json','rain-temp/package-lock.json','rain-temp/vite.config.js','rain-temp/seo-plugin.js','rain-temp/sitemap-plugin.js'];
export function backupKey(value) {
 const key=Buffer.from(value||'','base64');
 if(key.length!==32)throw new Error('BACKUP_ENCRYPTION_KEY must contain a base64-encoded 32-byte key');
 return key;
}
export async function runCommand(binary,args,{input,output,timeout=300000}={}) {
 const child=spawn(binary,args,{stdio:['pipe','pipe','ignore']});
 let timer;
 const exited=new Promise((resolve,reject)=>{
  child.once('error',reject);
  child.once('close',(code,signal)=>code===0?resolve():reject(new Error(`${path.basename(binary)} failed (${signal||code})`)));
  timer=setTimeout(()=>child.kill('SIGKILL'),timeout);timer.unref();
 });
 try {
  if(!input)child.stdin.end();
  let collected='';
  const stream=output||async function*(source){for await(const chunk of source){collected+=chunk;if(collected.length>16*1024*1024)throw new Error('Command output exceeds limit');}};
  const tasks=[exited,pipeline(child.stdout,stream)];
  if(input)tasks.push(pipeline(input,child.stdin));
  await Promise.all(tasks);return collected;
 }catch(error){child.kill('SIGKILL');await exited.catch(()=>{});throw error;}finally{clearTimeout(timer);}
}
const quoteOption=value=>'"'+String(value||'').replace(/\\/g,'\\\\').replace(/"/g,'\\"').replace(/\n/g,'\\n').replace(/\r/g,'\\r')+'"';
export async function databaseOptions(directory,env) {
 if(!/^[a-zA-Z0-9_]+$/.test(env.DB_NAME||''))throw new Error('Set a valid DB_NAME for backups');
 const filename=path.join(directory,'database.cnf');
 const content=['[client]',`user=${quoteOption(env.DB_BACKUP_USER||env.DB_USER)}`,`password=${quoteOption(env.DB_BACKUP_USER?(env.DB_BACKUP_PASSWORD||''):(env.DB_PASSWORD||''))}`,`host=${quoteOption(env.DB_HOST||'127.0.0.1')}`,`port=${Number(env.DB_PORT)||3306}`,...(env.DB_SOCKET?[`socket=${quoteOption(env.DB_SOCKET)}`]:[])].join('\n');
 await writeFile(filename,content,{mode:0o600});return filename;
}
export async function sha256(filename) {const hash=createHash('sha256');for await(const chunk of createReadStream(filename))hash.update(chunk);return hash.digest('hex');}
export async function encryptArchive(source,destination,key) {
 const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv);
 await writeFile(destination,Buffer.concat([magic,iv]),{mode:0o600});
 await pipeline(createReadStream(source),cipher,createWriteStream(destination,{flags:'a',mode:0o600}));
 await appendFile(destination,cipher.getAuthTag());
}
export async function decryptArchive(source,destination,key) {
 const size=(await stat(source)).size;
 if(size<magic.length+12+16)throw new Error('Invalid backup archive');
 const handle=await import('node:fs/promises').then(fs=>fs.open(source,'r'));
 let header,tag;
 try {header=Buffer.alloc(magic.length+12);tag=Buffer.alloc(16);await handle.read(header,0,header.length,0);await handle.read(tag,0,16,size-16);}finally{await handle.close();}
 if(!header.subarray(0,magic.length).equals(magic))throw new Error('Unsupported backup format');
 const decipher=createDecipheriv('aes-256-gcm',key,header.subarray(magic.length));decipher.setAuthTag(tag);
 try {await pipeline(createReadStream(source,{start:header.length,end:size-17}),decipher,createWriteStream(destination,{flags:'wx',mode:0o600}));}
 catch(error){await rm(destination,{force:true});throw error;}
}
async function assertSafeTree(target) {
 const info=await lstat(target);
 if(info.isSymbolicLink()||(!info.isFile()&&!info.isDirectory()))throw new Error('Application backup contains an unsupported file type');
 if(info.isDirectory())for(const file of await readdir(target)){
  if(/[\r\n]/.test(file)||file==='.env'||file.startsWith('.env.'))throw new Error('Unexpected secret or filename in application backup');
  await assertSafeTree(path.join(target,file));
 }
}
export function remoteSettings(env) {
 if(!env.BACKUP_REMOTE_HOST&&!env.BACKUP_REMOTE_DIR)return null;
 const host=env.BACKUP_REMOTE_HOST||'',directory=env.BACKUP_REMOTE_DIR||'',port=Number(env.BACKUP_REMOTE_PORT||22);
 if(!/^[a-zA-Z0-9][a-zA-Z0-9_.@-]*$/.test(host)||!/^\/[a-zA-Z0-9_./-]+$/.test(directory)||directory.split('/').includes('..')||directory==='/'||!Number.isInteger(port)||port<1||port>65535)throw new Error('Invalid backup SSH destination');
 return {host,directory:directory.replace(/\/$/,''),port};
}
export async function copyOffsite(filename,env) {
 const remote=remoteSettings(env);if(!remote)return false;
 const identity=env.BACKUP_SSH_KEY?['-i',env.BACKUP_SSH_KEY]:[];
 const sshArgs=['-o','BatchMode=yes','-o','StrictHostKeyChecking=yes','-o','ConnectTimeout=20',...identity,'-p',String(remote.port),remote.host];
 await runCommand(env.SSH_BIN||'ssh',[...sshArgs,`mkdir -p -- '${remote.directory}' && chmod 700 -- '${remote.directory}'`]);
 const basename=path.basename(filename),destination=`${remote.directory}/${basename}`;
 await runCommand(env.SCP_BIN||'scp',['-B','-o','StrictHostKeyChecking=yes','-o','ConnectTimeout=20',...identity,'-P',String(remote.port),filename,`${remote.host}:${destination}`]);
 const checksum=await runCommand(env.SSH_BIN||'ssh',[...sshArgs,`chmod 600 -- '${destination}' && sha256sum -- '${destination}'`]);
 if(checksum.split(/\s/)[0]!==await sha256(filename))throw new Error('Off-site backup checksum mismatch');
 return true;
}
export async function createBackup(db,{kind='database',env=process.env,root=applicationRoot}={}) {
 if(!['database','application'].includes(kind))throw new Error('Unknown backup kind');
 const days=Number(env.BACKUP_RETENTION_DAYS||30);
 if(!Number.isInteger(days)||days<30)throw new Error('Backup retention must be at least 30 days');
 remoteSettings(env);
 const key=backupKey(env.BACKUP_ENCRYPTION_KEY),destination=path.resolve(env.BACKUP_DIR||path.join(root,'backend/storage/backups'));
 if(publicPaths.some(folder=>destination===path.join(root,folder)||destination.startsWith(path.join(root,folder)+path.sep)))throw new Error('Backups must be outside public directories');
 await mkdir(destination,{recursive:true,mode:0o700});await chmod(destination,0o700);
 const work=await mkdtemp(path.join(destination,'.work-'));await chmod(work,0o700);
 const filename=path.join(destination,`kemsor-${kind}-${new Date().toISOString().replace(/[:.]/g,'-')}-${randomUUID()}.ksb`);
 try {
  const options=await databaseOptions(work,env);
  await runCommand(env.MYSQLDUMP_BIN||'mysqldump',[`--defaults-extra-file=${options}`,'--single-transaction','--quick','--hex-blob','--skip-lock-tables','--no-tablespaces',env.DB_NAME],{output:createWriteStream(path.join(work,'database.sql'),{mode:0o600})});
  if(!(await stat(path.join(work,'database.sql'))).size)throw new Error('Database dump is empty');
  const tables=(await rows(db,'SHOW TABLES')).map(row=>Object.values(row)[0]).sort();
  const files=[];
  if(kind==='application')for(const relative of included){try{await assertSafeTree(path.join(root,relative));files.push(relative);}catch(error){if(error.code!=='ENOENT')throw error;}}
  const manifest={format:'kemsor-backup',version:1,kind,createdAt:new Date().toISOString(),database:env.DB_NAME,tables,files,databaseSha256:await sha256(path.join(work,'database.sql'))};
  await writeFile(path.join(work,'manifest.json'),JSON.stringify(manifest,null,2),{mode:0o600});
  const compressed=path.join(work,'snapshot.tar.gz');
  await runCommand(env.TAR_BIN||'tar',['-czf',compressed,'-C',work,'database.sql','manifest.json',...(files.length?['-C',root,...files]:[])]);
  await encryptArchive(compressed,filename+'.partial',key);
  await rename(filename+'.partial',filename);
  const checksum=await sha256(filename);
  const offsite=await copyOffsite(filename,env);
  // Retention prunes only this kind, after the new archive and any configured remote copy succeed.
  if(offsite) {
   const remote=remoteSettings(env),identity=env.BACKUP_SSH_KEY?['-i',env.BACKUP_SSH_KEY]:[];
   await runCommand(env.SSH_BIN||'ssh',['-o','BatchMode=yes','-o','StrictHostKeyChecking=yes',...identity,'-p',String(remote.port),remote.host,`find '${remote.directory}' -maxdepth 1 -type f -name 'kemsor-${kind}-*.ksb' -mtime +${days} ! -name '${path.basename(filename)}' -delete`]);
  }
  let pruned=0;
  for(const file of await readdir(destination))if(file.startsWith(`kemsor-${kind}-`)&&file.endsWith('.ksb')){
   const candidate=path.join(destination,file);
   if(candidate!==filename&&(await stat(candidate)).mtimeMs<Date.now()-days*86400000){await rm(candidate);pruned++;}
  }
  return {kind,archive:path.basename(filename),sha256:checksum,bytes:(await stat(filename)).size,offsite,pruned};
 }finally{await rm(work,{recursive:true,force:true});await rm(filename+'.partial',{force:true});}
}
export async function recoverBackup(source,output,{env=process.env}={}) {
 output=path.resolve(output);
 if(publicPaths.some(folder=>output===path.join(applicationRoot,folder)||output.startsWith(path.join(applicationRoot,folder)+path.sep)))throw new Error('Recovery output must be outside public directories');
 const key=backupKey(env.BACKUP_ENCRYPTION_KEY),work=await mkdtemp(path.join(tmpdir(),'kemsor-recovery-'));
 await chmod(work,0o700);
 try {
  const compressed=path.join(work,'snapshot.tar.gz');await decryptArchive(source,compressed,key);
  const listing=await runCommand(env.TAR_BIN||'tar',['-tzf',compressed]);
  for(const entry of listing.trim().split('\n'))if(entry.startsWith('/')||entry.split('/').includes('..')||!['database.sql','manifest.json',...included].some(prefix=>entry===prefix||entry.startsWith(prefix+'/')))throw new Error('Unsafe backup archive path');
  const types=await runCommand(env.TAR_BIN||'tar',['-tvzf',compressed]);
  if(types.split('\n').filter(Boolean).some(line=>!['-','d'].includes(line[0])))throw new Error('Backup contains links or unsupported entries');
  // Recovery always targets a new directory; it never overwrites the running app.
  await mkdir(output,{mode:0o700});
  try {
   await runCommand(env.TAR_BIN||'tar',['-xzf',compressed,'--no-same-owner','--no-same-permissions','-C',output]);
   const manifest=JSON.parse(await readFile(path.join(output,'manifest.json'),'utf8'));
   if(manifest.format!=='kemsor-backup'||manifest.version!==1||await sha256(path.join(output,'database.sql'))!==manifest.databaseSha256)throw new Error('Recovered backup failed validation');
   return manifest;
  }catch(error){await rm(output,{recursive:true,force:true});throw error;}
 }finally{await rm(work,{recursive:true,force:true});}
}

export async function cleanupBackupWork(env=process.env) {
 const directory=path.resolve(env.BACKUP_DIR||path.join(applicationRoot,'backend/storage/backups'));
 if(publicPaths.some(folder=>directory===path.join(applicationRoot,folder)||directory.startsWith(path.join(applicationRoot,folder)+path.sep)))throw new Error('Backup work must be outside public directories');
 let cleaned=0,files;
 try {files=await readdir(directory);}catch(error){if(error.code==='ENOENT')return {cleaned};throw error;}
 for(const file of files)if(/^\.work-[a-zA-Z0-9]{6}$/.test(file)) {
  const target=path.join(directory,file),info=await lstat(target);
  if(info.isDirectory()&&info.mtimeMs<Date.now()-86400000){await rm(target,{recursive:true,force:true});cleaned++;}
 }
 return {cleaned};
}
