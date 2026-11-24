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
