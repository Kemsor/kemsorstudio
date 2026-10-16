CREATE TABLE career_application_notes (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 application_id INT UNSIGNED NOT NULL,
 user_id INT UNSIGNED NULL,
 note TEXT NOT NULL,
 created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(application_id) REFERENCES career_applications(id) ON DELETE CASCADE,
 FOREIGN KEY(user_id) REFERENCES cms_users(id) ON DELETE SET NULL,
 INDEX(application_id,created_at)
);
CREATE TABLE career_application_history (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 application_id INT UNSIGNED NOT NULL,
 user_id INT UNSIGNED NULL,
 from_status VARCHAR(30) NOT NULL,
 to_status VARCHAR(30) NOT NULL,
 created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(application_id) REFERENCES career_applications(id) ON DELETE CASCADE,
 FOREIGN KEY(user_id) REFERENCES cms_users(id) ON DELETE SET NULL,
 INDEX(application_id,created_at)
);
CREATE INDEX career_applicant_email ON career_applications(email);
