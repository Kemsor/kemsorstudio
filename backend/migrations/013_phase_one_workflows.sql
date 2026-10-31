ALTER TABLE cms_entries MODIFY type ENUM('news','blog','career','team','home','page','legal','media_partner','production','press_asset') NOT NULL;
ALTER TABLE cms_enquiries MODIFY category ENUM('business','partnerships','press','careers','production','copyright','general','creative','brand','distribution','financing','international','partner_registration') NOT NULL;
ALTER TABLE cms_enquiries MODIFY status ENUM('new','assigned','in_review','information_required','contacted','meeting_scheduled','qualified','accepted','converted','rejected','closed','spam') NOT NULL DEFAULT 'new';
ALTER TABLE cms_enquiries ADD priority ENUM('low','normal','high','urgent') NOT NULL DEFAULT 'normal', ADD tags VARCHAR(500) NOT NULL DEFAULT '', ADD source VARCHAR(200) NOT NULL DEFAULT 'website', ADD follow_up_at DATETIME NULL;
CREATE TABLE cms_enquiry_history (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, enquiry_id INT UNSIGNED NOT NULL, user_id INT UNSIGNED NULL,
 from_status VARCHAR(40) NULL, to_status VARCHAR(40) NOT NULL, assigned_to INT UNSIGNED NULL,
 created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(enquiry_id) REFERENCES cms_enquiries(id) ON DELETE CASCADE,
 FOREIGN KEY(user_id) REFERENCES cms_users(id) ON DELETE SET NULL
);
ALTER TABLE career_applications ADD portfolio_url VARCHAR(1000) NOT NULL DEFAULT '';
