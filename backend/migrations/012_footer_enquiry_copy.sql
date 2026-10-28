-- Replace only the previous default copy. Preserve custom CMS descriptions.
UPDATE cms_settings
SET value = JSON_QUOTE('For production enquiries and collaborations,
get in touch with the studio.')
WHERE name = 'footer_description'
AND JSON_UNQUOTE(value) IN (
  'From the first idea to the finished frame.
Bring us your story. We’ll find the next step.',
  'From the first idea to the finished frame.
Bring us your story — we’ll find the next step.'
);
