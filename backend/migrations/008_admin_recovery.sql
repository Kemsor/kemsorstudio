-- One-time owner-requested recovery of the existing hosted administrator.
-- Never contains a plaintext password. Normal migration tracking prevents reapplication.
START TRANSACTION;
UPDATE cms_users SET password_hash='scrypt:2d52b0e2d46e346f884d1bf1138a700e:11193b1d9035afea904d48554daa940ed7442c5faa6efab6991d3e50abb301b106e59f6afdd17c1c91b42de7da13ce9979a7e97336166939445721475c8fb6c0' WHERE email='admin@kemsor.local' AND role='admin' AND active=1;
DELETE FROM cms_sessions WHERE JSON_UNQUOTE(JSON_EXTRACT(data,'$.userId')) IN (SELECT CAST(id AS CHAR) FROM cms_users WHERE email='admin@kemsor.local' AND role='admin' AND active=1);
INSERT INTO cms_audit(user_id,action,target_type,target_id) SELECT id,'deployment_recovery','user',CAST(id AS CHAR) FROM cms_users WHERE email='admin@kemsor.local' AND role='admin' AND active=1;
COMMIT;
