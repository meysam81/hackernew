-- HackerNew Database Schema
-- Run this in your Supabase SQL Editor

-- Users (extends Supabase auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  karma int default 0,
  email_digest boolean default false,
  created_at timestamptz default now()
);

-- Bookmarks
create table if not exists bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  story_id text not null,
  story_title text,
  story_url text,
  created_at timestamptz default now(),
  unique(user_id, story_id)
);

-- Reading history
create table if not exists read_stories (
  user_id uuid references profiles(id) on delete cascade not null,
  story_id text not null,
  read_at timestamptz default now(),
  primary key (user_id, story_id)
);

-- Create indexes for better performance
create index if not exists idx_bookmarks_user_id on bookmarks(user_id);
create index if not exists idx_bookmarks_created_at on bookmarks(created_at desc);
create index if not exists idx_read_stories_user_id on read_stories(user_id);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table bookmarks enable row level security;
alter table read_stories enable row level security;

-- RLS Policies for profiles
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using (true);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- RLS Policies for bookmarks
create policy "Users can view own bookmarks"
  on bookmarks for select
  using (auth.uid() = user_id);

create policy "Users can insert own bookmarks"
  on bookmarks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own bookmarks"
  on bookmarks for update
  using (auth.uid() = user_id);

create policy "Users can delete own bookmarks"
  on bookmarks for delete
  using (auth.uid() = user_id);

-- RLS Policies for read_stories
create policy "Users can view own read history"
  on read_stories for select
  using (auth.uid() = user_id);

create policy "Users can insert own read history"
  on read_stories for insert
  with check (auth.uid() = user_id);

create policy "Users can update own read history"
  on read_stories for update
  using (auth.uid() = user_id);

create policy "Users can delete own read history"
  on read_stories for delete
  using (auth.uid() = user_id);

-- Function to automatically create a profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'user_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on new user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
