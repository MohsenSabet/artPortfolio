-- Drop dependent objects
DROP TABLE IF EXISTS posts CASCADE;
DROP TYPE IF EXISTS post_privacy;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table
CREATE TABLE profiles (
  id           uuid         PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name   text,
  last_name    text,
  username     text UNIQUE,
  pronouns     text,
  email        text        UNIQUE NOT NULL,
  phone        text,
  avatar_url   text,
  bio          text,
  twitter      text,
  linkedin     text,
  instagram    text,
  mediums      text,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

-- Create posts privacy enum
drop type if exists post_privacy;
create type post_privacy as enum ('Public','Private','Unlisted');

-- Create posts table
CREATE TABLE posts (
  id           uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id    uuid           NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  title        text           NOT NULL,
  media_url    text           NOT NULL,
  category     text           NOT NULL,
  privacy      post_privacy   NOT NULL DEFAULT 'Public',
  include_date boolean        NOT NULL DEFAULT FALSE,
  date         date,
  include_time boolean        NOT NULL DEFAULT FALSE,
  time         time,
  featured     boolean        NOT NULL DEFAULT FALSE,
  description  text,
  created_at   timestamptz    DEFAULT now(),
  updated_at   timestamptz    DEFAULT now()
);

-- Index for posts by author
CREATE INDEX idx_posts_author_id ON posts(author_id);

-- ENABLE ROW LEVEL SECURITY AND POLICIES FOR profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- Allow any user (including unauthenticated) to read profiles
DROP POLICY IF EXISTS profiles_read ON profiles;
CREATE POLICY "profiles_read" ON profiles
  FOR SELECT
  TO public
  USING (true);
-- Allow the authenticated user to manage their own profile
CREATE POLICY "profiles_modify" ON profiles
  FOR ALL
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ENABLE ROW LEVEL SECURITY AND POLICIES FOR posts
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
-- Allow any user (including unauthenticated) to read posts
DROP POLICY IF EXISTS posts_read ON posts;
CREATE POLICY "posts_read" ON posts
  FOR SELECT
  TO public
  USING (true);
-- Allow the authenticated user to insert their own posts (revised to include USING)
DROP POLICY IF EXISTS posts_insert ON posts;
CREATE POLICY "posts_insert" ON posts
  FOR INSERT
  TO public
  WITH CHECK (author_id = auth.uid());
-- Allow the authenticated user to update their own posts
CREATE POLICY "posts_update" ON posts
  FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());
-- Allow the authenticated user to delete their own posts
CREATE POLICY "posts_delete" ON posts
  FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- Storage bucket policies for public 'posts' bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
-- Allow authenticated users to insert (upload) into 'posts' bucket
CREATE POLICY "posts_storage_insert" ON storage.objects
  FOR INSERT
  TO authenticated
  USING (bucket_id = 'posts');
-- Allow anyone (public) to select (download) from 'posts' bucket
CREATE POLICY "posts_storage_select" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'posts');

-- Automatically create a profile record when a new auth.user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, created_at, updated_at)
    VALUES (NEW.id, NEW.email, now(), now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auth_user_signed_up
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();