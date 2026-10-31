ALTER TABLE cms_users ADD mfa_secret TEXT NULL, ADD mfa_last_step BIGINT NOT NULL DEFAULT -1;
CREATE TABLE cms_mfa_recovery_codes (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,user_id INT UNSIGNED NOT NULL,code_hash CHAR(64) NOT NULL,
 FOREIGN KEY(user_id) REFERENCES cms_users(id) ON DELETE CASCADE,UNIQUE KEY(user_id,code_hash)
);
