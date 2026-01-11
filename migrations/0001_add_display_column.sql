-- Add display column to transactions table
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS display text DEFAULT 'yes' NOT NULL;

-- Add conflict_flag column to transactions table
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS conflict_flag boolean DEFAULT false NOT NULL;
