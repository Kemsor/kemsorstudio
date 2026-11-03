CREATE TABLE cms_news_subscriptions (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 email VARCHAR(254) NOT NULL UNIQUE,
 status ENUM('pending','active','unsubscribed') NOT NULL DEFAULT 'pending',
 topics JSON NOT NULL,
 pending_topics JSON NULL,
 confirmation_hash CHAR(64) NULL,
 unsubscribe_hash CHAR(64) NULL,
 confirmation_expires_at DATETIME NULL,
 consent_version VARCHAR(100) NOT NULL,
 consent_at DATETIME NULL,
 pending_consent_at DATETIME NULL,
 unsubscribed_at DATETIME NULL,
 created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 INDEX(status,created_at)
);
