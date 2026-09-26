-- ============================================================
-- Kisan Vyapar Portal — Standalone App Tables
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- These tables do NOT depend on Supabase Auth (auth.users)
-- They support the app's custom phone+password authentication
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── 1. APP USERS (Custom Auth) ────────────────────────────
-- Stores all registered users with hashed passwords
CREATE TABLE IF NOT EXISTS app_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
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

-- Auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_app_users_updated_at
BEFORE UPDATE ON app_users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── 2. OTP STORE ──────────────────────────────────────────
-- Stores OTPs for phone verification (replaces /tmp file storage)
CREATE TABLE IF NOT EXISTS app_otps (
    phone TEXT PRIMARY KEY,
    otp TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 3. APP CROP LISTINGS ──────────────────────────────────
-- Stores farmer-created crop listings (shared across all devices)
CREATE TABLE IF NOT EXISTS app_crop_listings (
    id TEXT PRIMARY KEY,
    farmer_id TEXT NOT NULL,
    farmer_name TEXT DEFAULT 'Unknown Farmer',
    farm_name TEXT DEFAULT 'Farm',
    farmer_rating NUMERIC(3,1) DEFAULT 5.0,
    farmer_verified BOOLEAN DEFAULT TRUE,
    category_id TEXT DEFAULT 'cat-grains',
    category_name TEXT DEFAULT 'Grains & Cereals',
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    variety TEXT DEFAULT 'Certified Hybrid',
    grade TEXT DEFAULT 'Grade A',
    description TEXT,
    unit TEXT DEFAULT 'quintal',
    price_per_unit NUMERIC(12,2) NOT NULL,
    discount_percentage NUMERIC(5,2) DEFAULT 0,
    discount_price_per_unit NUMERIC(12,2),
    market_price_per_unit NUMERIC(12,2),
    distance_km INT DEFAULT 10,
    min_order_quantity INT DEFAULT 1,
    stock_quantity INT DEFAULT 100,
    reserved_quantity INT DEFAULT 0,
    harvest_date TEXT,
    district TEXT DEFAULT 'Meerut',
    state TEXT DEFAULT 'Uttar Pradesh',
    pickup_available BOOLEAN DEFAULT TRUE,
    delivery_available BOOLEAN DEFAULT TRUE,
    delivery_fee_per_unit NUMERIC(10,2) DEFAULT 120,
    soil_type TEXT DEFAULT 'Alluvial Loam',
    farming_method TEXT DEFAULT 'Natural Organic',
    status TEXT DEFAULT 'active',
    primary_image TEXT,
    images TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_app_crop_listings_updated_at
BEFORE UPDATE ON app_crop_listings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── Row Level Security ────────────────────────────────────
-- We use the service role key server-side, so RLS is bypassed.
-- But enable it + add open policies for safety if anon key is ever used.

ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_crop_listings ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (it bypasses RLS by default)
-- These SELECT policies allow the anon key to read public data if needed
CREATE POLICY "Allow public read of active crop listings"
    ON app_crop_listings FOR SELECT USING (status = 'active');

CREATE POLICY "Allow public read of user profiles"
    ON app_users FOR SELECT USING (true);

-- ─── Indexes for Performance ───────────────────────────────
CREATE INDEX IF NOT EXISTS idx_app_users_phone ON app_users(phone);
CREATE INDEX IF NOT EXISTS idx_app_users_email ON app_users(email);
CREATE INDEX IF NOT EXISTS idx_app_crop_listings_farmer_id ON app_crop_listings(farmer_id);
CREATE INDEX IF NOT EXISTS idx_app_crop_listings_status ON app_crop_listings(status);
CREATE INDEX IF NOT EXISTS idx_app_crop_listings_district ON app_crop_listings(district);
