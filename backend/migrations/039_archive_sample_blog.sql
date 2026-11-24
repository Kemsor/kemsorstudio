UPDATE cms_entries
SET status='archived'
WHERE type='blog'
  AND slug='test-blog-production-plan'
  AND title='Test blog: From first idea to production plan'
  AND status='published';
