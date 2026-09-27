-- ==============================================================================
-- Kisan Vyapar Portal — Auth & App Users RLS Policies Fix
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- 
-- Why this is needed:
-- If your app connects to Supabase using the Anon Key (or if Service Role Key
-- was not passed into the environment), Row Level Security (RLS) locks down
-- the 'app_users' and 'app_otps' tables, causing login queries to return 0 rows
-- even when the user exists in the database.
-- ==============================================================================

-- 1. Ensure table structure exists
CREATE TABLE IF NOT EXISTS app_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK (role IN ('farmer', 'buyer', 'admin')) DEFAULT 'buyer',
    avatar_url TEXT,
    district TEXT DEFAULT 'Meerut',
    state TEXT DEFAULT 'Uttar Pradesh',
    pincode TEXT DEFAULT '250002',
    farm_name TEXT,
    farm_description TEXT,
    crops_grown TEXT[] DEFAULT '{}',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: Remove strict unique constraint on phone if previously added to allow canonical normalization
ALTER TABLE IF EXISTS app_users DROP CONSTRAINT IF EXISTS app_users_phone_key;

-- 2. Allow SELECT and INSERT on app_users so authentication works with both service role key and anon key
ALTER TABLE IF EXISTS app_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read app users" ON app_users;
CREATE POLICY "Allow read app users" ON app_users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert app users" ON app_users;
CREATE POLICY "Allow insert app users" ON app_users FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update app users" ON app_users;
CREATE POLICY "Allow update app users" ON app_users FOR UPDATE USING (true);

-- 3. Allow full access on app_otps so phone verification codes can be saved and verified
ALTER TABLE IF EXISTS app_otps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow manage app otps" ON app_otps;
CREATE POLICY "Allow manage app otps" ON app_otps FOR ALL USING (true);

-- 4. Create helpful search indexes on phone and email
CREATE INDEX IF NOT EXISTS idx_app_users_phone_trgm ON app_users(phone);
CREATE INDEX IF NOT EXISTS idx_app_users_email ON app_users(email);
