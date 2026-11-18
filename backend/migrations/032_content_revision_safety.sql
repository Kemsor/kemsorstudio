ALTER TABLE cms_entries ADD revision INT UNSIGNED NOT NULL DEFAULT 1;
CREATE TABLE cms_entry_revisions (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 content_id INT UNSIGNED NOT NULL,
 revision INT UNSIGNED NOT NULL,
 action VARCHAR(40) NOT NULL,
 snapshot JSON NOT NULL,
 created_by INT UNSIGNED NULL,
 created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE KEY entry_revision(content_id,revision),
 FOREIGN KEY(content_id) REFERENCES cms_entries(id) ON DELETE CASCADE,
 FOREIGN KEY(created_by) REFERENCES cms_users(id) ON DELETE SET NULL
);
INSERT INTO cms_entry_revisions(content_id,revision,action,snapshot,created_by)
 SELECT id,revision,'initial-state',JSON_OBJECT('type',type,'title',title,'slug',slug,'summary',summary,'body',body,'image_id',image_id,'metadata',JSON_EXTRACT(metadata,'$'),'status',status,'published_at',DATE_FORMAT(published_at,'%Y-%m-%d %H:%i:%s')),COALESCE(updated_by,created_by) FROM cms_entries WHERE type<>'legal';
