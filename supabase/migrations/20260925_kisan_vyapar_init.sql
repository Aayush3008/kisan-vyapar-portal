-- Kisan Vyapar Portal Database Schema
-- Complete PostgreSQL migration with 18 tables, triggers, sequences, and RLS policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sequences
CREATE SEQUENCE IF NOT EXISTS order_seq START WITH 10001 INCREMENT BY 1;

-- Updated at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    role TEXT CHECK (role IN ('farmer', 'buyer', 'admin')) DEFAULT 'buyer',
    avatar_url TEXT,
    district TEXT,
    state TEXT,
    pincode TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. FARMER_PROFILES
CREATE TABLE IF NOT EXISTS farmer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    farm_name TEXT NOT NULL,
    farm_description TEXT,
    farm_address TEXT,
    crops_grown TEXT[] DEFAULT '{}',
    is_verified BOOLEAN DEFAULT FALSE,
    verification_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CROP_LISTINGS
CREATE TABLE IF NOT EXISTS crop_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    variety TEXT NOT NULL,
    grade TEXT CHECK (grade IN ('Grade A', 'Grade B', 'Grade C', 'Organic Certified')) DEFAULT 'Grade A',
    description TEXT,
    unit TEXT CHECK (unit IN ('kg', 'quintal', 'tonne', 'crate', 'bag')) DEFAULT 'quintal',
    price_per_unit NUMERIC(10,2) NOT NULL,
    min_order_quantity INT DEFAULT 1,
    stock_quantity INT NOT NULL DEFAULT 0,
    reserved_quantity INT DEFAULT 0,
    harvest_date DATE NOT NULL,
    available_from DATE,
    available_until DATE,
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    pickup_available BOOLEAN DEFAULT TRUE,
    delivery_available BOOLEAN DEFAULT FALSE,
    delivery_fee_per_unit NUMERIC(10,2) DEFAULT 0,
    status TEXT CHECK (status IN ('draft', 'pending_approval', 'active', 'paused', 'sold_out', 'rejected')) DEFAULT 'pending_approval',
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_crop_listings_updated_at
BEFORE UPDATE ON crop_listings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. CROP_IMAGES
CREATE TABLE IF NOT EXISTS crop_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES crop_listings(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    alt_text TEXT
);

-- 6. ADDRESSES
CREATE TABLE IF NOT EXISTS addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    landmark TEXT,
    city TEXT NOT NULL,
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CART_ITEMS
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES crop_listings(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    delivery_choice TEXT CHECK (delivery_choice IN ('pickup', 'delivery')) DEFAULT 'pickup',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(buyer_id, listing_id)
);

-- 8. ORDERS
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    buyer_id UUID NOT NULL REFERENCES profiles(id),
    farmer_id UUID NOT NULL REFERENCES profiles(id),
    subtotal NUMERIC(10,2) NOT NULL,
    delivery_fee NUMERIC(10,2) DEFAULT 0,
    platform_fee NUMERIC(10,2) DEFAULT 0,
    discount_amount NUMERIC(10,2) DEFAULT 0,
    total_amount NUMERIC(10,2) NOT NULL,
    payment_method TEXT CHECK (payment_method IN ('cod', 'razorpay')) NOT NULL,
    payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')) DEFAULT 'pending',
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    fulfillment_status TEXT CHECK (fulfillment_status IN ('pending', 'accepted', 'packed', 'dispatched', 'delivered', 'cancelled', 'disputed')) DEFAULT 'pending',
    shipping_address JSONB NOT NULL,
    delivery_type TEXT NOT NULL,
    notes TEXT,
    placed_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    dispatched_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ
);

-- Order Number Trigger Function
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        NEW.order_number := 'ORD-KVP-' || LPAD(nextval('order_seq')::text, 5, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number_trigger
BEFORE INSERT ON orders
FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- 9. ORDER_ITEMS
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES crop_listings(id) ON DELETE SET NULL,
    crop_title TEXT NOT NULL,
    variety TEXT,
    unit TEXT NOT NULL,
    quantity INT NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    line_total NUMERIC(10,2) NOT NULL
);

-- 10. ORDER_TIMELINE
CREATE TABLE IF NOT EXISTS order_timeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    note TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    listing_id UUID REFERENCES crop_listings(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES profiles(id),
    farmer_id UUID NOT NULL REFERENCES profiles(id),
    rating INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    review_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. RESOURCES
CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    topic TEXT CHECK (topic IN ('soil_types', 'plant_diseases', 'pest_management', 'crop_management', 'sustainable_farming')) NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    thumbnail_url TEXT,
    read_time TEXT DEFAULT '5 min read',
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. COMMUNITY_POSTS
CREATE TABLE IF NOT EXISTS community_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    image_url TEXT,
    status TEXT CHECK (status IN ('active', 'flagged', 'removed')) DEFAULT 'active',
    upvotes INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. COMMUNITY_REPLIES
CREATE TABLE IF NOT EXISTS community_replies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    status TEXT CHECK (status IN ('active', 'flagged', 'removed')) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. CONTENT_REPORTS
CREATE TABLE IF NOT EXISTS content_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES profiles(id),
    entity_type TEXT CHECK (entity_type IN ('listing', 'post', 'reply')) NOT NULL,
    entity_id UUID NOT NULL,
    reason TEXT NOT NULL,
    status TEXT CHECK (status IN ('pending', 'reviewed', 'dismissed')) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. COUPONS
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    discount_percent NUMERIC(5,2) DEFAULT 0,
    discount_fixed NUMERIC(10,2) DEFAULT 0,
    min_order_amount NUMERIC(10,2) DEFAULT 0,
    times_used INT DEFAULT 0,
    max_uses INT DEFAULT 100,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMPTZ
);

-- 17. SITE_SETTINGS
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_name TEXT DEFAULT 'Kisan Vyapar Portal',
    tagline TEXT DEFAULT 'Connecting Indian Farmers Directly to Wholesale & Retail Buyers',
    contact_email TEXT DEFAULT 'support@kisanvyapar.in',
    phone TEXT DEFAULT '+91 1800 200 4567',
    currency_code TEXT DEFAULT 'INR',
    currency_symbol TEXT DEFAULT '₹',
    announcement_text TEXT DEFAULT 'Empowering farmers with zero-middlemen trading across India.'
);

-- 18. AUDIT_LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    entity_name TEXT NOT NULL,
    entity_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Atomic Stock Reservation Function
CREATE OR REPLACE FUNCTION reserve_crop_stock(
    p_listing_id UUID,
    p_quantity INT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_stock INT;
BEGIN
    SELECT stock_quantity INTO v_stock
    FROM crop_listings
    WHERE id = p_listing_id
    FOR UPDATE;

    IF v_stock IS NULL OR v_stock < p_quantity THEN
        RETURN FALSE;
    END IF;

    UPDATE crop_listings
    SET stock_quantity = stock_quantity - p_quantity,
        reserved_quantity = reserved_quantity + p_quantity,
        status = CASE WHEN stock_quantity - p_quantity <= 0 THEN 'sold_out' ELSE status END
    WHERE id = p_listing_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public read for display names and avatars"
    ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE USING (auth.uid() = id);

-- Crop Listings Policies
CREATE POLICY "Public read active crop listings"
    ON crop_listings FOR SELECT USING (status = 'active');
CREATE POLICY "Farmers can manage own listings"
    ON crop_listings FOR ALL USING (auth.uid() = farmer_id);

-- Orders Policies
CREATE POLICY "Buyers can view own orders"
    ON orders FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "Farmers can view incoming orders"
    ON orders FOR SELECT USING (auth.uid() = farmer_id);

-- Cart Items Policies
CREATE POLICY "Buyers can manage own cart"
    ON cart_items FOR ALL USING (auth.uid() = buyer_id);

-- Community Policies
CREATE POLICY "Public read active forum posts"
    ON community_posts FOR SELECT USING (status = 'active');
CREATE POLICY "Authenticated users can create posts"
    ON community_posts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authors can update own posts"
    ON community_posts FOR UPDATE USING (auth.uid() = author_id);

-- Resources Policies
CREATE POLICY "Public read published resources"
    ON resources FOR SELECT USING (is_published = true);

-- Storage buckets setup scripts (Run in Supabase Storage setup):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('crop-images', 'crop-images', true) ON CONFLICT DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('farmer-documents', 'farmer-documents', false) ON CONFLICT DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('community-uploads', 'community-uploads', true) ON CONFLICT DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('site-assets', 'site-assets', true) ON CONFLICT DO NOTHING;
