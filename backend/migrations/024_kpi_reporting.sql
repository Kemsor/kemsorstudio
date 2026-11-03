ALTER TABLE cms_enquiries ADD INDEX kpi_period(created_at,category,status);
ALTER TABLE cms_enquiry_history ADD INDEX kpi_milestone(enquiry_id,created_at,to_status);
ALTER TABLE cms_operations_runs ADD INDEX kpi_period(started_at,status);
CREATE TABLE cms_kpi_settings (
 id TINYINT UNSIGNED PRIMARY KEY,
 version INT UNSIGNED NOT NULL DEFAULT 1,
 configuration JSON NOT NULL,
 updated_by INT UNSIGNED NULL,
 updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 FOREIGN KEY(updated_by) REFERENCES cms_users(id) ON DELETE SET NULL
);
INSERT INTO cms_kpi_settings(id,configuration) VALUES(1,'{}');
CREATE TABLE cms_kpi_inputs (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 cadence ENUM('weekly','monthly','quarterly') NOT NULL,
 period_start DATE NOT NULL,
 version INT UNSIGNED NOT NULL DEFAULT 1,
 payload JSON NOT NULL,
 updated_by INT UNSIGNED NULL,
 updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 UNIQUE KEY period(cadence,period_start),
 FOREIGN KEY(updated_by) REFERENCES cms_users(id) ON DELETE SET NULL
);
CREATE TABLE cms_kpi_reports (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 automatic_key VARCHAR(80) NULL UNIQUE,
 cadence ENUM('weekly','monthly','quarterly') NOT NULL,
 period_start DATE NOT NULL,
 period_end DATE NOT NULL,
 snapshot JSON NOT NULL,
 created_by INT UNSIGNED NULL,
 approved_by INT UNSIGNED NULL,
 created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 approved_at DATETIME NULL,
 INDEX period(cadence,period_start),
 FOREIGN KEY(created_by) REFERENCES cms_users(id) ON DELETE SET NULL,
 FOREIGN KEY(approved_by) REFERENCES cms_users(id) ON DELETE SET NULL
);
CREATE TABLE cms_kpi_actions (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 cadence ENUM('weekly','monthly','quarterly') NOT NULL,
 period_start DATE NOT NULL,
 metric_key VARCHAR(80) NOT NULL,
 title VARCHAR(200) NOT NULL,
 owner_id INT UNSIGNED NOT NULL,
 due_date DATE NOT NULL,
 expected_outcome TEXT NOT NULL,
 status ENUM('open','in_progress','done','cancelled') NOT NULL DEFAULT 'open',
 evidence TEXT NOT NULL,
 version INT UNSIGNED NOT NULL DEFAULT 1,
 created_by INT UNSIGNED NULL,
 created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 INDEX period(cadence,period_start),
 FOREIGN KEY(owner_id) REFERENCES cms_users(id),
 FOREIGN KEY(created_by) REFERENCES cms_users(id) ON DELETE SET NULL
);
