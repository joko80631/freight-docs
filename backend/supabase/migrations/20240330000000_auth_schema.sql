-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE,
    name TEXT NOT NULL,
    company_name TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (id)
);

-- Create loads table
CREATE TABLE IF NOT EXISTS loads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    load_number TEXT NOT NULL,
    carrier_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    delivery_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, load_number)
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    load_id UUID REFERENCES loads ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    file_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE loads ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Create policies for loads
CREATE POLICY "Users can view their own loads"
    ON loads FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own loads"
    ON loads FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own loads"
    ON loads FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own loads"
    ON loads FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for documents
CREATE POLICY "Users can view documents for their loads"
    ON documents FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM loads
            WHERE loads.id = documents.load_id
            AND loads.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create documents for their loads"
    ON documents FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM loads
            WHERE loads.id = documents.load_id
            AND loads.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update documents for their loads"
    ON documents FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM loads
            WHERE loads.id = documents.load_id
            AND loads.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete documents for their loads"
    ON documents FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM loads
            WHERE loads.id = documents.load_id
            AND loads.user_id = auth.uid()
        )
    );

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, name, company_name, email)
    VALUES (
        new.id,
        new.raw_user_meta_data->>'name',
        new.raw_user_meta_data->>'company_name',
        new.email
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 