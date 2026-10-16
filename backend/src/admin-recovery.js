import { createHash } from 'node:crypto';
import { rows, audit } from './db.js';
import { hashPassword } from './security.js';

// Hosting-account recovery. Never expose this operation as a public HTTP route.
export async function recoverAdmin(db, env = process.env) {
  const email=env.ADMIN_RESET_EMAIL?.trim().toLowerCase();
  const password=env.ADMIN_RESET_PASSWORD;
  const requestId=env.ADMIN_RESET_ID;
  if(!email&&!password&&!requestId)return false;
  if(!email||!password||!requestId)throw new Error('Admin recovery requires ADMIN_RESET_EMAIL, ADMIN_RESET_PASSWORD and ADMIN_RESET_ID.');
  if(password.length<16||password.length>128)throw new Error('ADMIN_RESET_PASSWORD must contain 16–128 characters.');
  if(!/^[a-zA-Z0-9_-]{16,100}$/.test(requestId))throw new Error('ADMIN_RESET_ID must contain 16–100 letters, numbers, underscores or hyphens.');
  const key='admin_recovery_'+createHash('sha256').update(requestId).digest('hex');
  const connection=await db.getConnection();
  try {
    await connection.beginTransaction();
    // The unique settings key makes recovery single-use, including concurrent starts.
    const claimed=await rows(connection,'INSERT IGNORE INTO cms_settings(name,value) VALUES(?,?)',[key,'true']);
    if(!claimed.affectedRows){await connection.commit();return false;}
    const user=(await rows(connection,'SELECT id,role,active FROM cms_users WHERE email=? FOR UPDATE',[email]))[0];
    if(!user||user.role!=='admin'||!user.active)throw new Error('Admin recovery requires an existing active administrator email.');
    await rows(connection,'UPDATE cms_users SET password_hash=? WHERE id=?',[await hashPassword(password),user.id]);
    await rows(connection,"DELETE FROM cms_sessions WHERE JSON_EXTRACT(data,'$.userId')=?",[user.id]);
    await audit(connection,user,'recover_password','user',user.id);
    await connection.commit();
    console.log('Admin password recovery completed. Remove ADMIN_RESET_EMAIL, ADMIN_RESET_PASSWORD and ADMIN_RESET_ID from hosting secrets.');
    return true;
  } catch(error){await connection.rollback();throw error;}finally{connection.release();}
}
