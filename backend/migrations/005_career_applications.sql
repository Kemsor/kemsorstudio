CREATE TABLE career_applications (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 career_id INT UNSIGNED NULL,
 career_title VARCHAR(200) NOT NULL,
 name VARCHAR(100) NOT NULL,
 email VARCHAR(254) NOT NULL,
 phone VARCHAR(40) NOT NULL,
 city VARCHAR(100) NOT NULL DEFAULT '',
 experience VARCHAR(200) NOT NULL DEFAULT '',
 message TEXT NOT NULL,
 resume_filename VARCHAR(255) NOT NULL,
 resume_name VARCHAR(255) NOT NULL,
 status ENUM('new','reviewing','shortlisted','rejected') NOT NULL DEFAULT 'new',
 consent_version VARCHAR(100) NOT NULL,
 consent_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(career_id) REFERENCES cms_entries(id) ON DELETE SET NULL,
 INDEX(status,created_at)
);
