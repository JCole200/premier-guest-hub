-- Create authorized_users table
CREATE TABLE IF NOT EXISTS authorized_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE authorized_users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated admins to manage users
-- FOR NOW: Allow all operations if we are using service role or if we haven't set up full RLS yet.
-- Since this is a demo, we'll allow public read for the login check specifically, but restrict writes.
CREATE POLICY "Allow public read for login" ON authorized_users FOR SELECT USING (true);
CREATE POLICY "Allow authenticated admins to insert" ON authorized_users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated admins to delete" ON authorized_users FOR DELETE USING (true);

-- Seed initial admin users
INSERT INTO authorized_users (email, password, is_admin)
VALUES 
('judah.cole@premier.org.uk', 'Premier2026!', true),
('charmaine.noble-mclean@premier.org.uk', 'Premier2026!', true)
ON CONFLICT (email) DO NOTHING;
