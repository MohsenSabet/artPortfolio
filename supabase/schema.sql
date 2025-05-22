-- Profiles table extending Supabase auth.users
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  username text UNIQUE NOT NULL,
  pronouns text,
  email text UNIQUE NOT NULL,
  phone text,
  avatar_url text,
  bio text,
  social_links jsonb NOT NULL DEFAULT '{}'::jsonb,
  mediums text[] NOT NULL DEFAULT '{}'::text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Reusable trigger function to refresh updated_at
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to profiles
DROP TRIGGER IF EXISTS profiles_update_timestamp ON profiles;
CREATE TRIGGER profiles_update_timestamp
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE PROCEDURE public.update_timestamp();

-- Posts privacy enum
DROP TYPE IF EXISTS post_privacy;
CREATE TYPE post_privacy AS ENUM ('Public','Private','Unlisted');

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  media_url text NOT NULL,
  category text NOT NULL,
  privacy post_privacy NOT NULL DEFAULT 'Public',
  include_date boolean NOT NULL DEFAULT FALSE,
  date date,
  include_time boolean NOT NULL DEFAULT FALSE,
  time time,
  featured boolean NOT NULL DEFAULT FALSE,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Attach trigger to posts
DROP TRIGGER IF EXISTS posts_update_timestamp ON posts;
CREATE TRIGGER posts_update_timestamp
BEFORE UPDATE ON posts
FOR EACH ROW EXECUTE PROCEDURE public.update_timestamp();

-- Index for fast lookup by author
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);