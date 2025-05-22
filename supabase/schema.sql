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
  author_id    uuid           NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
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