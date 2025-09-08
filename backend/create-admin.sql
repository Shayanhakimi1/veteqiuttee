-- Create admin user
INSERT INTO admins (id, email, password, firstName, lastName, role, isActive, createdAt, updatedAt)
VALUES (
  'admin_default_001',
  '09302467932',
  '$2b$12$LQv3c1yqBwEHXk.JHNPOWOvz/BNHb9dma0RYKifnqrwJGKLHDxYvG',
  'مدیر',
  'سیستم', 
  'ADMIN',
  1,
  datetime('now'),
  datetime('now')
);

-- Check if admin was created
SELECT * FROM admins WHERE email = '09302467932';