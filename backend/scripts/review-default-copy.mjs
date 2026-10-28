// Explicit maintenance command. Only unchanged public default copy is updated.
// It does not rewrite client-authored CMS posts, legal notices or submissions.
import { createPool, rows, json } from '../src/db.js';

const changes = [
  ['footer_social_label', 'Follow us', 'Follow the frame'],
  ['footer_description', 'From the first idea to the finished frame.\nBring us your story — we’ll find the next step.', 'From the first idea to the finished frame.\nBring us your story. We’ll find the next step.'],
  ['contact_note', 'Sample details — to be updated', 'Sample details. To be updated'],
];
const db = createPool();
const connection = await db.getConnection();
try {
  await connection.beginTransaction();
  let updated = 0;
  for (const [name, before, after] of changes) {
    const [setting] = await rows(connection, 'SELECT value FROM cms_settings WHERE name=? FOR UPDATE', [name]);
    if (setting && json(setting.value) === before) {
      await rows(connection, 'UPDATE cms_settings SET value=? WHERE name=?', [JSON.stringify(after), name]);
      updated++;
    }
  }
  const result = await rows(connection, 'UPDATE cms_entries SET summary=? WHERE type=? AND summary=?', [
    'Sample media partner. Replace before publishing the confirmed partner list.',
    'media_partner', 'Sample media partner — replace before publishing the real partner list.',
  ]);
  updated += result.affectedRows;
  if (updated) await rows(connection, 'INSERT INTO cms_audit(user_id,action,target_type,target_id) VALUES(NULL,?,?,?)', ['copy_review', 'public_default_copy', String(updated)]);
  await connection.commit();
  console.log(`Reviewed default copy: ${updated} local records updated.`);
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  connection.release();
  await db.end();
}
