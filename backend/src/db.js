import mysql from 'mysql2/promise';
// Keep native MySQL JSON as encoded text, matching MariaDB and our explicit decoder.
export function createPool(overrides = {}) {
  return mysql.createPool({ host: process.env.DB_HOST || '127.0.0.1', port: Number(process.env.DB_PORT || 3306), socketPath: process.env.DB_SOCKET || undefined, user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || '', database: process.env.DB_NAME || 'kemsor', connectionLimit: 8, timezone: 'Z', charset: 'utf8mb4', dateStrings: true, jsonStrings: true, multipleStatements: false, ...overrides });
}
export const rows = async (db, sql, values = []) => (await db.execute(sql, values))[0];
export const json = value => typeof value === 'string' ? JSON.parse(value) : value;
export async function settings(db) {
  return Object.fromEntries((await rows(db, 'SELECT name,value FROM cms_settings')).map(row => [row.name, json(row.value)]));
}
export async function audit(db, user, action, type, id) {
  await rows(db, 'INSERT INTO cms_audit(user_id,action,target_type,target_id) VALUES(?,?,?,?)', [user?.id || null, action, type, String(id)]);
}
