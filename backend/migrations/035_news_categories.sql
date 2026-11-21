CREATE TABLE cms_news_categories (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL,
 created_by INT UNSIGNED NULL,
 created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE KEY news_category_name(name),
 FOREIGN KEY(created_by) REFERENCES cms_users(id) ON DELETE SET NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
INSERT IGNORE INTO cms_news_categories(name)
SELECT DISTINCT TRIM(JSON_UNQUOTE(JSON_EXTRACT(metadata,'$.category')))
FROM cms_entries WHERE type='news'
AND JSON_TYPE(JSON_EXTRACT(metadata,'$.category'))='STRING'
AND CHAR_LENGTH(TRIM(JSON_UNQUOTE(JSON_EXTRACT(metadata,'$.category')))) BETWEEN 1 AND 100;
