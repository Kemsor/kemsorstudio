INSERT INTO cms_settings(name,value) VALUES
 ('facebook','"https://www.facebook.com/kemsorstudio"'),
 ('instagram','"https://www.instagram.com/kemsorstudio/"')
ON DUPLICATE KEY UPDATE value=VALUES(value);
