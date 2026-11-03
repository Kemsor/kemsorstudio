ALTER TABLE cms_enquiries ADD retention_hold BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE career_applications ADD retention_hold BOOLEAN NOT NULL DEFAULT FALSE, ADD updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
CREATE TABLE cms_file_deletions (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 area ENUM('uploads','career-resumes') NOT NULL,
 filename VARCHAR(255) NOT NULL,
 attempts INT UNSIGNED NOT NULL DEFAULT 0,
 created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE KEY(area,filename)
);
CREATE TABLE cms_operations_runs (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 job VARCHAR(40) NOT NULL,
 status ENUM('running','success','failed') NOT NULL,
 summary JSON NULL,
 started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 finished_at DATETIME NULL,
 INDEX(job,status,finished_at)
);
CREATE TABLE cms_data_deletions (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 resource ENUM('enquiry','application') NOT NULL,
 source_id INT UNSIGNED NOT NULL,
 source_created_at DATETIME NOT NULL,
 deleted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 policy_version VARCHAR(100) NOT NULL,
 UNIQUE KEY(resource,source_id,source_created_at)
);
