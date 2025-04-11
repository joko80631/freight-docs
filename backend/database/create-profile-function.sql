-- Drop existing function
DROP FUNCTION IF EXISTS public.create_profile_for_user();

-- Create function to create a profile for a user
CREATE OR REPLACE FUNCTION public.create_profile_for_user(user_id UUID)
RETURNS VOID AS $$
DECLARE
    user_email TEXT;
    user_metadata JSONB;
BEGIN
    -- Get user data
    SELECT email, raw_user_meta_data INTO user_email, user_metadata
    FROM auth.users
    WHERE id = user_id;

    -- Create profile
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        user_id,
        user_email,
        COALESCE(user_metadata->>'full_name', split_part(user_email, '@', 1))
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 