-- Add password_hash column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_hash TEXT;
-- We are choosing Option 1: force password reset for existing users.
-- We will NOT migrate plaintext passwords.
-- New logins will require a password that matches the hash in password_hash.
-- Since old users only have 'password' (plaintext), they will fail login and need a reset
-- (or admin can help, or we can just say "all demo users are reset").