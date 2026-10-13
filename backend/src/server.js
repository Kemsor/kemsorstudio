import { createPool } from './db.js';
import { createApp } from './app.js';
import { hashPassword, token } from './security.js';
const db=createPool();
await db.execute('SELECT 1');
const app=createApp(db,{dummyHash:await hashPassword(token())});
const port=Number(process.env.PORT || 8100), host=process.env.HOST || '127.0.0.1';
const server=app.listen(port,host,()=>console.log(`Kemsor CMS: http://${host}:${port}/admin`));
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>{server.close(async()=>{await db.end();process.exit(0);});});
