-- ==============================================================================
-- CYBERSECURITY LEARNING PLATFORM (LMS) - SUPABASE SCHEMA
-- ==============================================================================

-- 1. Profiles (Linked to auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  role text not null check (role in ('student', 'admin')) default 'student',
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 2. Tracks
create table if not exists public.tracks (
  id text primary key,
  slug text unique not null,
  title text not null,
  accent_color text not null default '#10B981',
  description text,
  sort_order integer default 0 not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 3. Courses
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  track_id text references public.tracks(id) on delete set null,
  slug text unique not null,
  title text not null,
  description text,
  source_type text not null check (source_type in ('gdrive_folder', 'youtube_playlist', 'hybrid', 'markdown')),
  gdrive_folder_id text,
  youtube_playlist_id text,
  markdown_url text,
  recommended_step integer check (recommended_step between 1 and 7),
  is_published boolean default true not null,
  sort_order integer default 0 not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 4. Lessons (Custom YouTube lectures & Drive files attached by Admins)
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade not null,
  module_name text not null default 'Core Modules',
  title text not null,
  lesson_type text not null check (lesson_type in ('youtube_video', 'gdrive_file', 'markdown')),
  youtube_video_id text,
  gdrive_file_id text,
  duration_text text,
  sort_order integer default 0 not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 5. User Progress (Synced across devices)
create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  course_slug text not null,
  item_key text not null,
  completed boolean default false not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,
  unique (user_id, item_key)
);

-- 6. Lesson Notes & Bookmarks
create table if not exists public.lesson_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  item_key text not null,
  content text default '' not null,
  is_bookmarked boolean default false not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,
  unique (user_id, item_key)
);

-- 7. Broken Link Reports
create table if not exists public.broken_link_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  course_slug text not null,
  item_title text not null,
  details text,
  status text not null check (status in ('open', 'resolved')) default 'open',
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.tracks enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.user_progress enable row level security;
alter table public.lesson_notes enable row level security;
alter table public.broken_link_reports enable row level security;

-- Admin check helper
create or replace function public.is_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Profiles Policies
create policy "Public can view basic profiles" on public.profiles
  for select using (true);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- Tracks Policies (Public Read, Admin Write)
create policy "Anyone can view tracks" on public.tracks
  for select using (true);

create policy "Admins can manage tracks" on public.tracks
  for all using (public.is_admin());

-- Courses Policies (Public Read Published, Admin Write)
create policy "Anyone can view published courses" on public.courses
  for select using (is_published = true or public.is_admin());

create policy "Admins can manage courses" on public.courses
  for all using (public.is_admin());

-- Lessons Policies (Public Read, Admin Write)
create policy "Anyone can view lessons" on public.lessons
  for select using (
    exists (
      select 1 from public.courses
      where courses.id = lessons.course_id and (courses.is_published = true or public.is_admin())
    )
  );

create policy "Admins can manage lessons" on public.lessons
  for all using (public.is_admin());

-- User Progress Policies (Own Rows Only)
create policy "Users can view own progress" on public.user_progress
  for select using (auth.uid() = user_id);

create policy "Users can insert own progress" on public.user_progress
  for insert with check (auth.uid() = user_id);

create policy "Users can update own progress" on public.user_progress
  for update using (auth.uid() = user_id);

create policy "Users can delete own progress" on public.user_progress
  for delete using (auth.uid() = user_id);

-- Lesson Notes Policies (Own Rows Only)
create policy "Users can view own notes" on public.lesson_notes
  for select using (auth.uid() = user_id);

create policy "Users can insert own notes" on public.lesson_notes
  for insert with check (auth.uid() = user_id);

create policy "Users can update own notes" on public.lesson_notes
  for update using (auth.uid() = user_id);

create policy "Users can delete own notes" on public.lesson_notes
  for delete using (auth.uid() = user_id);

-- Broken Link Reports Policies (Anyone can report, Admin manages)
create policy "Anyone can create broken link report" on public.broken_link_reports
  for insert with check (true);

create policy "Admins can view and manage reports" on public.broken_link_reports
  for all using (public.is_admin());

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- ==============================================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'student'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists and recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
