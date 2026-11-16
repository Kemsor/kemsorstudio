ALTER TABLE cms_email_outbox ADD casting_application_id INT UNSIGNED NULL, ADD casting_event_id INT UNSIGNED NULL,
 ADD INDEX(casting_application_id),
 ADD FOREIGN KEY(casting_application_id) REFERENCES casting_applications(id) ON DELETE CASCADE,
 ADD FOREIGN KEY(casting_event_id) REFERENCES casting_application_events(id) ON DELETE CASCADE;
CREATE TABLE IF NOT EXISTS production_epk_grants (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 production_id INT UNSIGNED NOT NULL,
 token_hash CHAR(64) NOT NULL UNIQUE,
 label VARCHAR(200) NOT NULL,
 expires_at DATETIME NOT NULL,
 max_downloads INT UNSIGNED NOT NULL,
 downloads INT UNSIGNED NOT NULL DEFAULT 0,
 revoked_at DATETIME NULL,
 created_by INT UNSIGNED NULL,
 created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(production_id) REFERENCES cms_entries(id) ON DELETE CASCADE,
 FOREIGN KEY(created_by) REFERENCES cms_users(id) ON DELETE SET NULL
);
ALTER TABLE cms_media ADD private_epk BOOLEAN NOT NULL DEFAULT FALSE;
