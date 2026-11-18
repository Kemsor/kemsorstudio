ALTER TABLE cms_audit ADD COLUMN details JSON NULL;
CREATE INDEX cms_audit_created_id ON cms_audit(created_at,id);
CREATE INDEX cms_audit_actor_id ON cms_audit(user_id,id);
