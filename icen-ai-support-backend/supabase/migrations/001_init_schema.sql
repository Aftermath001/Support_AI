-- Enable required extensions
create extension if not exists pgcrypto;

-- Users table
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  name text,
  role text,
  created_at timestamptz default now()
);

-- Chats table
create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  message text,
  sender text check (sender in ('user','ai','system')),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- FAQs table
create table if not exists public.faqs (
  id serial primary key,
  question text,
  answer text,
  tags text[],
  created_at timestamptz default now()
);

-- Feedback table
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid references public.chats(id) on delete cascade,
  rating int check (rating>=1 and rating<=5),
  comment text,
  created_at timestamptz default now()
);

-- Indices
create index if not exists idx_chats_user_created on public.chats (user_id, created_at desc);
