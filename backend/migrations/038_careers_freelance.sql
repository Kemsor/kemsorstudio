ALTER TABLE career_applications MODIFY application_type ENUM('role','general','internship','freelance') NOT NULL DEFAULT 'role';
