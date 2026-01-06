-- Remove legacy plaintext password column
-- This is safe after the code has been updated to use password_hash exclusively.
ALTER TABLE users DROP COLUMN IF EXISTS password;