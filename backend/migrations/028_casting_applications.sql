CREATE TABLE IF NOT EXISTS casting_application_settings (
 id TINYINT UNSIGNED PRIMARY KEY,
 enabled BOOLEAN NOT NULL DEFAULT FALSE,
 terms_version VARCHAR(100) NOT NULL DEFAULT '',
 terms TEXT NOT NULL,
 updated_by INT UNSIGNED NULL,
 updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 FOREIGN KEY(updated_by) REFERENCES cms_users(id) ON DELETE SET NULL
);
INSERT IGNORE INTO casting_application_settings(id,terms) VALUES(1,'');
CREATE TABLE IF NOT EXISTS casting_applications (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 call_id INT UNSIGNED NOT NULL,
 account_id INT UNSIGNED NOT NULL,
 role_key CHAR(64) NOT NULL,
 call_title VARCHAR(200) NOT NULL,
 role_name VARCHAR(160) NOT NULL,
 role_eligibility VARCHAR(500) NOT NULL,
 profile_snapshot JSON NOT NULL,
 message TEXT NOT NULL,
 audition_links JSON NOT NULL,
 terms_version VARCHAR(100) NOT NULL,
 terms_snapshot TEXT NOT NULL,
 consent_at DATETIME NOT NULL,
 status ENUM('submitted','reviewing','shortlisted','rejected') NOT NULL DEFAULT 'submitted',
 reviewer_note TEXT NOT NULL,
 updated_by INT UNSIGNED NULL,
 created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 UNIQUE KEY(call_id,account_id,role_key),
 INDEX(account_id,created_at),
 INDEX(status,created_at),
 FOREIGN KEY(call_id) REFERENCES casting_calls(id) ON DELETE RESTRICT,
 FOREIGN KEY(account_id) REFERENCES talent_accounts(id) ON DELETE CASCADE,
 FOREIGN KEY(updated_by) REFERENCES cms_users(id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS casting_application_events (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 application_id INT UNSIGNED NOT NULL,
 status VARCHAR(30) NOT NULL,
 note TEXT NOT NULL,
 user_id INT UNSIGNED NULL,
 created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(application_id) REFERENCES casting_applications(id) ON DELETE CASCADE,
 FOREIGN KEY(user_id) REFERENCES cms_users(id) ON DELETE SET NULL
);
