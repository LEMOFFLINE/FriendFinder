-- Update to use SHA256 hex hash instead of bcrypt
-- Update Test User Passwords
-- This script updates test users with properly hashed passwords
-- All test users will use password: "test123"
-- SHA256 hex hash: ecd71870d1963316a97e3ac3408c9835ad8cf0f3c1bc703527c30265534f75ae

UPDATE users SET password_hash = 'ecd71870d1963316a97e3ac3408c9835ad8cf0f3c1bc703527c30265534f75ae' 
WHERE email IN ('alice@test.com', 'bob@test.com', 'carol@test.com', 'david@test.com', 'emma@test.com');

SELECT 'Test user passwords updated!' as status;
SELECT email, name FROM users WHERE email LIKE '%@test.com';
