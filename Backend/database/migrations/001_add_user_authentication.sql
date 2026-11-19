-- Add authentication fields without deleting or recreating existing users.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Existing users remain in the table with NULL email/password_hash.
-- A user must complete signup with a unique email to use password login.
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_lower_idx
  ON users (LOWER(email))
  WHERE email IS NOT NULL;
