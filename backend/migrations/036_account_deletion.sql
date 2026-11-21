ALTER TABLE cms_users ADD is_default_admin BOOLEAN NOT NULL DEFAULT FALSE;
UPDATE cms_users SET is_default_admin=TRUE WHERE id=(SELECT default_id FROM (SELECT id AS default_id FROM cms_users WHERE role='admin' ORDER BY id LIMIT 1) initial_admin);
