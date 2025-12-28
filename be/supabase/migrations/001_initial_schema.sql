-- ============================================
-- ChatGPT Clone Database Schema
-- ============================================

-- Note: Using gen_random_uuid() which is built into PostgreSQL 13+
-- No extension required for UUID generation

-- ============================================
-- PROFILES TABLE
-- Stores additional user data linked to auth.users
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON public.profiles(deleted_at) WHERE deleted_at IS NULL;

-- ============================================
-- CHATS TABLE
-- Stores chat sessions for each user
-- ============================================
CREATE TABLE IF NOT EXISTS public.chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'New Chat',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON public.chats(user_id);
CREATE INDEX IF NOT EXISTS idx_chats_created_at ON public.chats(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chats_deleted_at ON public.chats(deleted_at) WHERE deleted_at IS NULL;

-- ============================================
-- MESSAGES TABLE
-- Stores individual messages within chats
-- ============================================
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    model_id TEXT DEFAULT NULL,
    model_name TEXT DEFAULT NULL,
    tokens_used INTEGER DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON public.messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_deleted_at ON public.messages(deleted_at) WHERE deleted_at IS NULL;

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- Automatically updates the updated_at column
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_chats_updated_at ON public.chats;
CREATE TRIGGER set_chats_updated_at
    BEFORE UPDATE ON public.chats
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_messages_updated_at ON public.messages;
CREATE TRIGGER set_messages_updated_at
    BEFORE UPDATE ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Service role can insert profiles (for registration)
CREATE POLICY "Service role can insert profiles"
    ON public.profiles
    FOR INSERT
    WITH CHECK (true);

-- ============================================
-- CHATS POLICIES
-- ============================================

-- Users can read their own chats
CREATE POLICY "Users can read own chats"
    ON public.chats
    FOR SELECT
    USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Users can create their own chats
CREATE POLICY "Users can create own chats"
    ON public.chats
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own chats
CREATE POLICY "Users can update own chats"
    ON public.chats
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete (soft delete) their own chats
CREATE POLICY "Users can delete own chats"
    ON public.chats
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- MESSAGES POLICIES
-- ============================================

-- Users can read messages from their own chats
CREATE POLICY "Users can read own chat messages"
    ON public.messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.chats
            WHERE chats.id = messages.chat_id
            AND chats.user_id = auth.uid()
            AND chats.deleted_at IS NULL
        )
        AND deleted_at IS NULL
    );

-- Users can create messages in their own chats
CREATE POLICY "Users can create messages in own chats"
    ON public.messages
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.chats
            WHERE chats.id = messages.chat_id
            AND chats.user_id = auth.uid()
            AND chats.deleted_at IS NULL
        )
    );

-- Users can update messages in their own chats
CREATE POLICY "Users can update messages in own chats"
    ON public.messages
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.chats
            WHERE chats.id = messages.chat_id
            AND chats.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.chats
            WHERE chats.id = messages.chat_id
            AND chats.user_id = auth.uid()
        )
    );

-- Users can delete messages in their own chats
CREATE POLICY "Users can delete messages in own chats"
    ON public.messages
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.chats
            WHERE chats.id = messages.chat_id
            AND chats.user_id = auth.uid()
        )
    );

-- ============================================
-- FUNCTION: Create profile on user signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
        NEW.email,
        'user'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

