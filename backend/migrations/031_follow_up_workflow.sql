ALTER TABLE cms_enquiries ADD next_action VARCHAR(500) NOT NULL DEFAULT '';
ALTER TABLE cms_enquiry_history ADD changes JSON NULL;
CREATE INDEX enquiry_follow_up_queue ON cms_enquiries(assigned_to,status,follow_up_at);
ALTER TABLE career_applications ADD assigned_to INT UNSIGNED NULL, ADD priority ENUM('low','normal','high','urgent') NOT NULL DEFAULT 'normal', ADD follow_up_at DATETIME NULL, ADD next_action VARCHAR(500) NOT NULL DEFAULT '', ADD CONSTRAINT career_application_assignee FOREIGN KEY(assigned_to) REFERENCES cms_users(id) ON DELETE SET NULL;
ALTER TABLE career_application_history ADD changes JSON NULL;
CREATE INDEX application_follow_up_queue ON career_applications(assigned_to,status,follow_up_at);
