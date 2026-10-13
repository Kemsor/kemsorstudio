import { randomBytes, scrypt as callbackScrypt, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import session from 'express-session';
import { rows } from './db.js';
const scrypt = promisify(callbackScrypt);
export const token = () => randomBytes(32).toString('hex');
export const digest = value => createHash('sha256').update(value).digest('hex');
export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = await scrypt(password, salt, 64);
  return `scrypt:${salt}:${hash.toString('hex')}`;
}
export async function verifyPassword(password, stored) {
  const [,salt,encoded] = (stored || '').split(':');
  if (!salt || !encoded) return false;
  const expected = Buffer.from(encoded, 'hex');
  const actual = await scrypt(password, salt, 64);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
export const canEdit = user => ['admin','editor'].includes(user?.role);
export const canEnquire = user => ['admin','enquiry_manager'].includes(user?.role);
export function csrfValid(expected, received) {
  if (typeof expected !== 'string' || typeof received !== 'string') return false;
  const a = Buffer.from(expected), b = Buffer.from(received);
  return a.length === b.length && timingSafeEqual(a,b);
}
export class MysqlSessionStore extends session.Store {
  constructor(db) { super(); this.db = db; }
  get(sid, callback) { rows(this.db, 'SELECT data FROM cms_sessions WHERE id=? AND expires_at>UTC_TIMESTAMP()', [digest(sid)]).then(result => callback(null, result[0] ? JSON.parse(result[0].data) : null)).catch(callback); }
  set(sid, value, callback = () => {}) { const expiry = new Date(value.cookie.expires || Date.now() + 3600000); rows(this.db, 'INSERT INTO cms_sessions(id,data,expires_at) VALUES(?,?,?) ON DUPLICATE KEY UPDATE data=VALUES(data),expires_at=VALUES(expires_at)', [digest(sid), JSON.stringify(value), expiry]).then(() => callback()).catch(callback); }
  destroy(sid, callback = () => {}) { rows(this.db, 'DELETE FROM cms_sessions WHERE id=?', [digest(sid)]).then(() => callback()).catch(callback); }
  touch(sid, value, callback = () => {}) { rows(this.db, 'UPDATE cms_sessions SET expires_at=? WHERE id=?', [new Date(value.cookie.expires || Date.now() + 3600000), digest(sid)]).then(() => callback()).catch(callback); }
}
export async function rateLimited(db, key, maximum, windowSeconds) {
  const id = digest(key);
  await rows(db, 'INSERT INTO cms_rate_limits(id,attempts,expires_at) VALUES(?,1,DATE_ADD(UTC_TIMESTAMP(),INTERVAL ? SECOND)) ON DUPLICATE KEY UPDATE attempts=IF(expires_at<=UTC_TIMESTAMP(),1,attempts+1),expires_at=IF(expires_at<=UTC_TIMESTAMP(),DATE_ADD(UTC_TIMESTAMP(),INTERVAL ? SECOND),expires_at)', [id, windowSeconds, windowSeconds]);
  const result = await rows(db, 'SELECT attempts FROM cms_rate_limits WHERE id=?', [id]);
  return result[0].attempts > maximum;
}
