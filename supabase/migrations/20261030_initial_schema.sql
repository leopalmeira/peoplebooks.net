-- ==============================================================================
-- PeopleBooks.net — Supabase PostgreSQL Schema & Security Policies (RLS)
-- Master Migration: 20261030_initial_schema.sql
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS & ROLES
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    role VARCHAR(50) NOT NULL DEFAULT 'reader' CHECK (role IN ('visitor', 'reader', 'participant', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('reader', 'participant', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- 2. VOLUMES
CREATE TABLE IF NOT EXISTS volumes (
    id VARCHAR(50) PRIMARY KEY, -- e.g. '01', '02', '03'
    slug VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    description TEXT,
    theme VARCHAR(100),
    stories_count INTEGER DEFAULT 0,
    amazon_url TEXT,
    cover_image_url TEXT,
    status VARCHAR(50) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    price_cents INTEGER DEFAULT 1900, -- minor units (cents / centavos)
    currency VARCHAR(10) DEFAULT 'USD',
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. PARTICIPANTS
CREATE TABLE IF NOT EXISTS participants (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'juliana', 'gabriel', 'emma'
    slug VARCHAR(100) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    primary_volume_id VARCHAR(50) REFERENCES volumes(id),
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    number VARCHAR(10) NOT NULL, -- e.g. '001', '002'
    country VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    languages TEXT[] DEFAULT ARRAY['pt-BR'],
    profession VARCHAR(150),
    age INTEGER,
    tag VARCHAR(100), -- Category/Theme
    quote TEXT NOT NULL,
    title TEXT NOT NULL,
    bio TEXT NOT NULL,
    full_story TEXT,
    avatar_url TEXT,
    spread_image_url TEXT, -- 2-page book spread preview
    initials VARCHAR(10),
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Association between volumes and participants (many-to-many allowed by Rule 2: A person can appear in more than one volume)
CREATE TABLE IF NOT EXISTS volume_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    volume_id VARCHAR(50) NOT NULL REFERENCES volumes(id) ON DELETE CASCADE,
    participant_id VARCHAR(50) NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    page_start INTEGER,
    page_end INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(volume_id, participant_id)
);

-- 4. PARTICIPANT APPLICATIONS & CONSENTS
CREATE TABLE IF NOT EXISTS participant_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    public_name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    languages TEXT[],
    profession VARCHAR(150),
    is_adult BOOLEAN NOT NULL DEFAULT TRUE,
    story_summary TEXT NOT NULL,
    interests TEXT,
    motivation TEXT,
    conversation_availability VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
    reviewer_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS participant_consents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_id VARCHAR(50) NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    consent_version VARCHAR(50) NOT NULL,
    editorial_release BOOLEAN NOT NULL DEFAULT TRUE,
    digital_profile_release BOOLEAN NOT NULL DEFAULT TRUE,
    ip_address VARCHAR(100),
    signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. VOLUME ENTITLEMENTS & PURCHASE VERIFICATION
CREATE TABLE IF NOT EXISTS volume_entitlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    volume_id VARCHAR(50) NOT NULL REFERENCES volumes(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'rejected', 'revoked', 'expired')),
    verification_method VARCHAR(50) NOT NULL CHECK (verification_method IN ('mock', 'manual', 'amazon_kdp', 'direct_purchase')),
    verification_reference VARCHAR(255),
    verified_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, volume_id)
);

CREATE TABLE IF NOT EXISTS purchase_verification_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    volume_id VARCHAR(50) NOT NULL REFERENCES volumes(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL DEFAULT 'manual' CHECK (provider IN ('mock', 'manual', 'amazon_kdp')),
    order_number VARCHAR(100),
    receipt_data JSONB,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
    notes TEXT,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_verification_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES purchase_verification_requests(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. STORIES & DIARY POSTS (THE LIVING DIARY)
CREATE TABLE IF NOT EXISTS stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_id VARCHAR(50) NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    visibility VARCHAR(50) DEFAULT 'public' CHECK (visibility IN ('public', 'volume_readers', 'paid_content')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS diary_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_id VARCHAR(50) NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    volume_id VARCHAR(50) REFERENCES volumes(id),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    visibility VARCHAR(50) NOT NULL DEFAULT 'volume_readers' CHECK (visibility IN ('public_preview', 'volume_readers', 'paid_content', 'private_draft')),
    location VARCHAR(150),
    tags TEXT[],
    likes_count INTEGER DEFAULT 0,
    media_urls TEXT[],
    is_pinned BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS media_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_id VARCHAR(50) NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    title VARCHAR(255),
    asset_type VARCHAR(50) NOT NULL CHECK (asset_type IN ('image', 'video', 'document')),
    storage_path TEXT NOT NULL,
    is_private BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. FOLLOWS & FEED
CREATE TABLE IF NOT EXISTS follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    participant_id VARCHAR(50) NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_user_id, participant_id)
);

-- 8. CONVERSATIONS & PRIVATE CHAT
CREATE TABLE IF NOT EXISTS conversation_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reader_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    participant_id VARCHAR(50) NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    intro_message TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(reader_id, participant_id)
);

CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reader_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    participant_id VARCHAR(50) NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(reader_id, participant_id)
);

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. PAID CONTENT, PURCHASES & FINANCIAL LEDGER
CREATE TABLE IF NOT EXISTS paid_contents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_id VARCHAR(50) NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    volume_id VARCHAR(50) REFERENCES volumes(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('gallery', 'video', 'chapter', 'story_doc')),
    price_minor_units INTEGER NOT NULL CHECK (price_minor_units > 0), -- e.g. 500 = $5.00 or R$5,00
    currency VARCHAR(10) NOT NULL DEFAULT 'BRL',
    preview_url TEXT,
    file_vault_path TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    paid_content_id UUID NOT NULL REFERENCES paid_contents(id) ON DELETE CASCADE,
    amount_paid_minor_units INTEGER NOT NULL,
    currency VARCHAR(10) NOT NULL,
    platform_fee_minor_units INTEGER NOT NULL, -- 20%
    author_net_minor_units INTEGER NOT NULL,   -- 80%
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'refunded', 'disputed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS financial_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_id VARCHAR(50) NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('sale', 'payout', 'refund', 'adjustment')),
    amount_minor_units INTEGER NOT NULL,
    balance_after_minor_units INTEGER NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'BRL',
    reference_id UUID,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payout_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_id VARCHAR(50) NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    amount_minor_units INTEGER NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'BRL',
    pix_key_or_bank_details TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- 10. MODERATION, AUDIT LOGS & SETTINGS
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reported_entity_type VARCHAR(50) NOT NULL CHECK (reported_entity_type IN ('participant', 'diary_post', 'message', 'user')),
    reported_entity_id VARCHAR(255) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'resolved', 'dismissed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS moderation_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_user_id UUID NOT NULL REFERENCES users(id),
    target_type VARCHAR(50) NOT NULL,
    target_id VARCHAR(255) NOT NULL,
    action_taken VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    ip_address VARCHAR(100),
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_participants_slug ON participants(slug);
CREATE INDEX IF NOT EXISTS idx_participants_volume ON participants(primary_volume_id);
CREATE INDEX IF NOT EXISTS idx_diary_posts_participant ON diary_posts(participant_id);
CREATE INDEX IF NOT EXISTS idx_diary_posts_volume ON diary_posts(volume_id);
CREATE INDEX IF NOT EXISTS idx_entitlements_user_volume ON volume_entitlements(user_id, volume_id, status);
CREATE INDEX IF NOT EXISTS idx_follows_user ON follows(follower_user_id);
CREATE INDEX IF NOT EXISTS idx_follows_participant ON follows(participant_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user ON content_purchases(user_id, paid_content_id);

