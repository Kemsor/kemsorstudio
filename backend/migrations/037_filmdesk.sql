ALTER TABLE production_projects ADD onboarding JSON NULL, ADD revision INT UNSIGNED NOT NULL DEFAULT 1, ADD reviewed_revision INT UNSIGNED NULL, ADD reviewed_at DATETIME NULL;
CREATE TABLE filmdesk_submissions (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 project_id INT UNSIGNED NOT NULL,
 account_id INT UNSIGNED NOT NULL,
 project_revision INT UNSIGNED NOT NULL,
 title VARCHAR(200) NOT NULL,
 snapshot JSON NOT NULL,
 script_filename VARCHAR(100) NULL,
 script_name VARCHAR(255) NULL,
 terms_version VARCHAR(100) NOT NULL,
 terms_text TEXT NOT NULL,
 status ENUM('received','reviewing','responded','closed') NOT NULL DEFAULT 'received',
 studio_note TEXT NULL,
 created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 UNIQUE KEY unique_project_revision(project_id,project_revision),
 FOREIGN KEY(project_id) REFERENCES production_projects(id) ON DELETE CASCADE,
 FOREIGN KEY(account_id) REFERENCES talent_accounts(id) ON DELETE CASCADE
);
