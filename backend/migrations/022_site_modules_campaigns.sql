CREATE TABLE cms_site_modules (
 module_key VARCHAR(190) PRIMARY KEY,
 draft JSON NOT NULL,
 published JSON NULL,
 revision INT UNSIGNED NOT NULL DEFAULT 1,
 updated_by INT UNSIGNED NULL,
 updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 FOREIGN KEY(updated_by) REFERENCES cms_users(id) ON DELETE SET NULL
);
CREATE TABLE cms_site_module_revisions (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 module_key VARCHAR(190) NOT NULL,
 revision INT UNSIGNED NOT NULL,
 snapshot JSON NOT NULL,
 action VARCHAR(30) NOT NULL,
 created_by INT UNSIGNED NULL,
 created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE KEY(module_key,revision),
 FOREIGN KEY(module_key) REFERENCES cms_site_modules(module_key) ON DELETE CASCADE,
 FOREIGN KEY(created_by) REFERENCES cms_users(id) ON DELETE SET NULL
);
CREATE TABLE cms_news_campaigns (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 news_id INT UNSIGNED NOT NULL,
 subject VARCHAR(200) NOT NULL,
 message TEXT NOT NULL,
 topics JSON NOT NULL,
 status ENUM('draft','queued','cancelled') NOT NULL DEFAULT 'draft',
 created_by INT UNSIGNED NULL,
 created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 queued_at DATETIME NULL,
 FOREIGN KEY(news_id) REFERENCES cms_entries(id),
 FOREIGN KEY(created_by) REFERENCES cms_users(id) ON DELETE SET NULL
);
ALTER TABLE cms_email_outbox ADD COLUMN campaign_id INT UNSIGNED NULL, ADD COLUMN subscription_id INT UNSIGNED NULL;
ALTER TABLE cms_email_outbox MODIFY status ENUM('pending','sending','sent','failed','cancelled') NOT NULL DEFAULT 'pending';
