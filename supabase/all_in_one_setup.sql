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
drop policy if exists "Public can view basic profiles" on public.profiles;
create policy "Public can view basic profiles" on public.profiles
  for select using (true);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- Tracks Policies (Public Read, Admin Write)
drop policy if exists "Anyone can view tracks" on public.tracks;
create policy "Anyone can view tracks" on public.tracks
  for select using (true);

drop policy if exists "Admins can manage tracks" on public.tracks;
create policy "Admins can manage tracks" on public.tracks
  for all using (public.is_admin());

-- Courses Policies (Public Read Published, Admin Write)
drop policy if exists "Anyone can view published courses" on public.courses;
create policy "Anyone can view published courses" on public.courses
  for select using (is_published = true or public.is_admin());

drop policy if exists "Admins can manage courses" on public.courses;
create policy "Admins can manage courses" on public.courses
  for all using (public.is_admin());

-- Lessons Policies (Public Read, Admin Write)
drop policy if exists "Anyone can view lessons" on public.lessons;
create policy "Anyone can view lessons" on public.lessons
  for select using (
    exists (
      select 1 from public.courses
      where courses.id = lessons.course_id and (courses.is_published = true or public.is_admin())
    )
  );

drop policy if exists "Admins can manage lessons" on public.lessons;
create policy "Admins can manage lessons" on public.lessons
  for all using (public.is_admin());

-- User Progress Policies (Own Rows Only)
drop policy if exists "Users can view own progress" on public.user_progress;
create policy "Users can view own progress" on public.user_progress
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own progress" on public.user_progress;
create policy "Users can insert own progress" on public.user_progress
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own progress" on public.user_progress;
create policy "Users can update own progress" on public.user_progress
  for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own progress" on public.user_progress;
create policy "Users can delete own progress" on public.user_progress
  for delete using (auth.uid() = user_id);

-- Lesson Notes Policies (Own Rows Only)
drop policy if exists "Users can view own notes" on public.lesson_notes;
create policy "Users can view own notes" on public.lesson_notes
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own notes" on public.lesson_notes;
create policy "Users can insert own notes" on public.lesson_notes
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own notes" on public.lesson_notes;
create policy "Users can update own notes" on public.lesson_notes
  for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own notes" on public.lesson_notes;
create policy "Users can delete own notes" on public.lesson_notes
  for delete using (auth.uid() = user_id);

-- Broken Link Reports Policies (Anyone can report, Admin manages)
drop policy if exists "Anyone can create broken link report" on public.broken_link_reports;
create policy "Anyone can create broken link report" on public.broken_link_reports
  for insert with check (true);

drop policy if exists "Admins can view and manage reports" on public.broken_link_reports;
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
-- ==============================================================================
-- CYBERSECURITY LEARNING PLATFORM (LMS) - SEED DATA
-- ==============================================================================

-- Clean existing seed data
truncate table public.lessons cascade;
truncate table public.courses cascade;
truncate table public.tracks cascade;

-- 1. Insert 6 Canonical Tracks
insert into public.tracks (id, slug, title, accent_color, description, sort_order) values
('track-1-fundamentals', 'fundamentals', 'Cybersecurity Fundamentals', '#10B981', 'Core principles, networking architectures, threat modeling & security hygiene', 1),
('track-2-red-team', 'red-team', 'Red Team & Ethical Hacking', '#EF4444', 'Offensive security operations, adversary emulation, exploit development, and penetration testing', 2),
('track-3-ceh', 'ceh', 'EC-Council CEH Suite', '#F59E0B', 'Certified Ethical Hacker v12 complete study curriculum, official modules & video lectures', 3),
('track-4-offsec', 'offsec', 'Offensive Security (OffSec)', '#EF4444', 'Advanced penetration testing, OSCP preparation guides, and privilege escalation methodologies', 4),
('track-5-blue-team', 'blue-team', 'Blue Team Resources', '#06B6D4', 'Defensive security engineering, digital forensics, incident response, and threat hunting guides', 5),
('track-6-soc', 'soc', 'SOC (Security Operations Center)', '#06B6D4', 'SIEM log analysis, alert triage, incident containment runbooks, and SOC analyst playbooks', 6)
on conflict (id) do update set
  title = excluded.title,
  accent_color = excluded.accent_color,
  description = excluded.description,
  sort_order = excluded.sort_order;

-- 2. Insert Canonical Courses
-- We use deterministic UUIDs for seed referencing
insert into public.courses (
  id, track_id, slug, title, description, source_type,
  gdrive_folder_id, youtube_playlist_id, markdown_url, recommended_step, is_published, sort_order
) values
-- Track 1
(
  'c0000001-0000-0000-0000-000000000001',
  'track-1-fundamentals',
  'cybersecurity-fundamentals',
  'Cybersecurity Basics – Foundation Notes',
  'Comprehensive foundation covering OSI models, TCP/IP handshakes, symmetric & asymmetric cryptography, attack vectors, and defensive controls.',
  'gdrive_folder',
  '1Drf74G5L-CPzvikrW54Cuq6SawAcynva',
  null,
  null,
  1,
  true,
  1
),
-- Track 2
(
  'c0000001-0000-0000-0000-000000000002',
  'track-2-red-team',
  'ethical-hacking-scratch',
  'Learn Ethical Hacking from Scratch',
  'Complete offensive hacking curriculum covering reconnaissance, scanning, Metasploit, web vulnerabilities, privilege escalation, and wireless exploitation.',
  'hybrid',
  '1if6MCeBCj8sxWwJIKhtgwU0GBuBW8uLx',
  null,
  null,
  2,
  true,
  2
),
(
  'c0000001-0000-0000-0000-000000000003',
  'track-2-red-team',
  'red-team-roadmap',
  'Red Team Roadmap',
  'Interactive offensive security curriculum and career roadmap tracking C2 frameworks, Active Directory dominance, and adversary emulation.',
  'markdown',
  null,
  null,
  'https://raw.githubusercontent.com/soheilsec/Red-Team-Roadmap/main/English.md',
  3,
  true,
  3
),
(
  'c0000001-0000-0000-0000-000000000004',
  'track-2-red-team',
  'red-team-resources',
  'Red Team Resources',
  'Deep-dive exploitation toolkits, post-exploitation scripts, Cobalt Strike profiles, and lateral movement tradecraft guides.',
  'gdrive_folder',
  '1uFt09G20WAskczk4Mk1U0OqW8N2COsZ5',
  null,
  null,
  5,
  true,
  4
),
-- Track 3
(
  'c0000001-0000-0000-0000-000000000005',
  'track-3-ceh',
  'ceh-study-materials',
  'CEH Study Materials',
  'Official EC-Council CEH v12 courseware volumes, exam blueprints, review guides, and theoretical certification notes.',
  'gdrive_folder',
  '1Vgdtm5l9PEnHUU-g8caa3PjaZEMJltQ5',
  null,
  null,
  4,
  true,
  5
),
(
  'c0000001-0000-0000-0000-000000000006',
  'track-3-ceh',
  'ceh-video-lectures',
  'CEH Video Lectures',
  'Full chapter-by-chapter video masterclasses covering scanning, system hacking, social engineering, web attacks, and cryptography.',
  'hybrid',
  '1YdnlgS_1QRhXidJQHd2V3SpuO7G0Ywv7',
  null,
  null,
  null,
  true,
  6
),
(
  'c0000001-0000-0000-0000-000000000007',
  'track-3-ceh',
  'ceh-notes',
  'CEH Notes',
  'High-yield quick reference sheets, exam cram notes, port references, and methodology cheat sheets for the CEH v12 ANSI exam.',
  'gdrive_folder',
  '1bkMeKQ8PfYKrKmnl-evVj3h36caS9BIY',
  null,
  null,
  null,
  true,
  7
),
(
  'c0000001-0000-0000-0000-000000000008',
  'track-3-ceh',
  'ceh-labs',
  'CEH Labs',
  'Hands-on lab exercises, vulnerable challenge setups, lab manuals, and practical scenarios for CEH Practical exam mastery.',
  'gdrive_folder',
  '17aTgWGoJRaTC7TxstXEX-3zewVgy_YjS',
  null,
  null,
  5,
  true,
  8
),
(
  'c0000001-0000-0000-0000-000000000009',
  'track-3-ceh',
  'ceh-practical-resources',
  'CEH Practical Resources',
  'Challenge machines, lab walkthrough scripts, tool installation scripts, and practical examination strategies.',
  'gdrive_folder',
  '17aTgWGoJRaTC7TxstXEX-3zewVgy_YjS',
  null,
  null,
  null,
  true,
  9
),
-- Track 4
(
  'c0000001-0000-0000-0000-000000000010',
  'track-4-offsec',
  'offsec-resources',
  'OffSec Resources',
  'Offensive Security penetration testing with Kali Linux (PWK), buffer overflow guides, and active directory exploitation manuals.',
  'gdrive_folder',
  '1ySTW2ZEuPPTqKD_-SPY9VHxb2wQeUb2D',
  null,
  null,
  6,
  true,
  10
),
-- Track 5
(
  'c0000001-0000-0000-0000-000000000011',
  'track-5-blue-team',
  'blue-team-books',
  'Blue Team Kit – Books',
  'Defensive architecture books, network security monitoring handbooks, and incident response playbooks for SOC analysts.',
  'gdrive_folder',
  '1v4dQsqYe6ekjgaoImDuU0CcEJKymx1Vs',
  null,
  null,
  7,
  true,
  11
),
-- Track 6
(
  'c0000001-0000-0000-0000-000000000012',
  'track-6-soc',
  'soc-resources',
  'SOC Resources',
  'Enterprise SOC architecture, Splunk/ELK query templates, alert triage matrices, and blue team defense guides.',
  'gdrive_folder',
  '1bz7uOtUy7cO87tBNewnFzDy1nRgwO7Gl',
  null,
  null,
  7,
  true,
  12
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  source_type = excluded.source_type,
  gdrive_folder_id = excluded.gdrive_folder_id,
  youtube_playlist_id = excluded.youtube_playlist_id,
  markdown_url = excluded.markdown_url,
  recommended_step = excluded.recommended_step,
  is_published = excluded.is_published,
  sort_order = excluded.sort_order;

-- 3. Pre-seed Sample Lessons for Hybrid Courses (YouTube + Drive files)
insert into public.lessons (
  course_id, module_name, title, lesson_type,
  youtube_video_id, gdrive_file_id, duration_text, sort_order
) values
-- Lessons for Learn Ethical Hacking from Scratch
(
  'c0000001-0000-0000-0000-000000000002',
  'Module 01: Information Gathering & Reconnaissance',
  '1.1 Passive Reconnaissance: OSINT, Shodan & Subfinder',
  'youtube_video',
  '3Kq1MIfTWCE',
  null,
  '38:40',
  1
),
(
  'c0000001-0000-0000-0000-000000000002',
  'Module 01: Information Gathering & Reconnaissance',
  '1.2 Active Reconnaissance: Nmap Scripting Engine (NSE)',
  'youtube_video',
  '4t4kBkMsDbQ',
  null,
  '44:15',
  2
),
-- Lessons for CEH Video Lectures
(
  'c0000001-0000-0000-0000-000000000006',
  'Section 1: Scanning & Enumeration',
  '01 - Scanning Networks: Three-Way Handshake & FIN Scans',
  'youtube_video',
  'WnNCNUjhqxE',
  null,
  '32:10',
  1
),
(
  'c0000001-0000-0000-0000-000000000006',
  'Section 1: Scanning & Enumeration',
  '02 - NetBIOS, SNMP, and LDAP Enumeration Tools',
  'youtube_video',
  'dQw4w9WgXcQ',
  null,
  '29:45',
  2
);
