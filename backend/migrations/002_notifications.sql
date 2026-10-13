CREATE TABLE IF NOT EXISTS cms_notification_reads (
 user_id INT UNSIGNED NOT NULL,
 notification_key VARCHAR(190) NOT NULL,
 read_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY(user_id,notification_key),
 FOREIGN KEY(user_id) REFERENCES cms_users(id) ON DELETE CASCADE
);
