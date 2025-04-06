-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables and functions
DO $$ 
BEGIN
    DROP TABLE IF EXISTS classification_history CASCADE;
    DROP TABLE IF EXISTS documents CASCADE;
    DROP TABLE IF EXISTS loads CASCADE;
    DROP TABLE IF EXISTS team_members CASCADE;
    DROP TABLE IF EXISTS teams CASCADE;
    DROP TABLE IF EXISTS profiles CASCADE;
    DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
    DROP FUNCTION IF EXISTS public.create_profile_for_user(UUID) CASCADE;
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
EXCEPTION
    WHEN undefined_object THEN
        NULL;
END $$;

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create teams table
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team_members table
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- Create loads table
CREATE TABLE IF NOT EXISTS public.loads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    load_number TEXT NOT NULL,
    carrier_name TEXT,
    broker_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_loads_team_id ON public.loads(team_id);
CREATE INDEX IF NOT EXISTS idx_loads_broker_id ON public.loads(broker_id);
CREATE INDEX IF NOT EXISTS idx_loads_load_number ON public.loads(load_number);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Service role can create profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Users can view teams they are members of" ON public.teams;
    DROP POLICY IF EXISTS "Users can create teams" ON public.teams;
    DROP POLICY IF EXISTS "Users can view team members of their teams" ON public.team_members;
    DROP POLICY IF EXISTS "Users can add members to their teams" ON public.team_members;
    DROP POLICY IF EXISTS "Users can view loads in their teams" ON public.loads;
    DROP POLICY IF EXISTS "Users can create loads in their teams" ON public.loads;
    DROP POLICY IF EXISTS "Users can update loads in their teams" ON public.loads;
    DROP POLICY IF EXISTS "Users can delete loads in their teams" ON public.loads;
EXCEPTION
    WHEN undefined_object THEN
        NULL;
END $$;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Service role can create profiles"
    ON public.profiles FOR INSERT
    WITH CHECK (true);

-- Teams policies
CREATE POLICY "Users can view teams they are members of"
    ON public.teams FOR SELECT
    USING (id IN (
        SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can create teams"
    ON public.teams FOR INSERT
    WITH CHECK (true);

-- Team members policies
CREATE POLICY "Users can view team members of their teams"
    ON public.team_members FOR SELECT
    USING (team_id IN (
        SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can add members to their teams"
    ON public.team_members FOR INSERT
    WITH CHECK (
        team_id IN (
            SELECT team_id FROM public.team_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Loads policies
CREATE POLICY "Users can view loads in their teams"
    ON public.loads FOR SELECT
    USING (team_id IN (
        SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can create loads in their teams"
    ON public.loads FOR INSERT
    WITH CHECK (team_id IN (
        SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can update loads in their teams"
    ON public.loads FOR UPDATE
    USING (team_id IN (
        SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can delete loads in their teams"
    ON public.loads FOR DELETE
    USING (team_id IN (
        SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    ));

-- Create function to create a profile for a user
CREATE OR REPLACE FUNCTION public.create_profile_for_user(user_id UUID)
RETURNS public.profiles AS $$
DECLARE
    v_user auth.users;
    v_profile public.profiles;
BEGIN
    -- Get user data
    SELECT * INTO v_user
    FROM auth.users
    WHERE id = user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found: %', user_id;
    END IF;

    -- Create profile
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        user_id,
        v_user.email,
        COALESCE(v_user.raw_user_meta_data->>'full_name', split_part(v_user.email, '@', 1))
    )
    RETURNING * INTO v_profile;

    RETURN v_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 