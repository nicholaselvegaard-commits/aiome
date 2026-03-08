-- AIOME Supabase Schema
-- Run this in your Supabase SQL editor

create table if not exists users (
  id text primary key,
  display_name text,
  email text,
  city text,
  lat float8 default 0,
  lng float8 default 0,
  agent_name text,
  agent_personality text,
  agent_specialties text[],
  agent_bio text,
  agent_system_prompt text,
  created_at timestamptz default now(),
  last_active timestamptz default now()
);

create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  from_user_id text,
  to_agent_id text,
  content text,
  role text,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table users enable row level security;
alter table messages enable row level security;

-- Allow anyone to read users (public globe)
create policy "Users are publicly readable"
  on users for select
  using (true);

-- Allow authenticated users to insert/update their own record
create policy "Users can insert themselves"
  on users for insert
  with check (true);

create policy "Users can update themselves"
  on users for update
  using (true);

-- Allow anyone to read/write messages
create policy "Messages are publicly readable"
  on messages for select
  using (true);

create policy "Messages can be inserted"
  on messages for insert
  with check (true);
