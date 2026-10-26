CREATE TABLE IF NOT EXISTS cms_email_outbox (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 receipt_key VARCHAR(100) NOT NULL UNIQUE,
 recipient VARCHAR(254) NOT NULL,
 subject VARCHAR(255) NOT NULL,
 body TEXT NOT NULL,
 status ENUM('pending','sending','sent','failed') NOT NULL DEFAULT 'pending',
 attempts INT NOT NULL DEFAULT 0,
 available_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 claim_token VARCHAR(36) NULL,
 sent_at DATETIME NULL,
 created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 INDEX email_delivery (status,available_at)
);
