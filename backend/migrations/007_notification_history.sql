CREATE TABLE cms_notification_history (
 user_id INT UNSIGNED NOT NULL,
 notification_key VARCHAR(190) NOT NULL,
 category VARCHAR(30) NOT NULL,
 source_id INT UNSIGNED NULL,
 tone VARCHAR(20) NOT NULL,
 title VARCHAR(200) NOT NULL,
 text TEXT NOT NULL,
 href VARCHAR(500) NOT NULL,
 event_date DATETIME NULL,
 active BOOLEAN NOT NULL DEFAULT TRUE,
 first_seen_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY(user_id,notification_key),
 FOREIGN KEY(user_id) REFERENCES cms_users(id) ON DELETE CASCADE,
 INDEX(user_id,active,first_seen_at)
);
CREATE TABLE cms_notification_preferences (
 user_id INT UNSIGNED NOT NULL,
 category VARCHAR(30) NOT NULL,
 enabled BOOLEAN NOT NULL DEFAULT TRUE,
 PRIMARY KEY(user_id,category),
 FOREIGN KEY(user_id) REFERENCES cms_users(id) ON DELETE CASCADE
);
