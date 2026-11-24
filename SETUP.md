# Cybersecurity Learning Platform (LMS)
## 3-Layer Architecture Setup Guide: Google Drive + YouTube + Supabase

A production-grade, 100% free-tier ready Cybersecurity Learning Management System (LMS) built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Lucide Icons**, and **Supabase** (`@supabase/supabase-js` + `@supabase/ssr`).

---

## 🏛️ Core 3-Layer Architecture

```
                    ┌────────────────────────────────────────────────────────┐
                    │               CYBER ACADEMY LMS (Next.js)              │
                    │               100% Free Tier Architecture              │
                    └───────┬───────────────────┬────────────────────┬───────┘
                            │                   │                    │
        ┌───────────────────┴───┐   ┌───────────┴───────────┐   ┌────┴──────────────────┐
        │     Google Drive      │   │   YouTube (Unlisted)  │   │       Supabase        │
        │  (Documents & Labs)   │   │    (Video Lectures)   │   │   (Database & Auth)   │
        ├───────────────────────┤   ├───────────────────────┤   ├───────────────────────┤
        │ • Native PDF preview  │   │ • Cinema-mode player  │   │ • User profiles & RLS │
        │ • Alt=media Markdown  │   │ • Privacy-enhanced    │   │ • Course CMS & stats  │
        │ • Direct Lab download │   │ • Auto-mark complete  │   │ • Study notes & marks │
        │ • Zero-config embed   │   │ • Bulk playlist tool  │   │ • Link report tickets │
        └───────────────────────┘   └───────────────────────┘   └───────────────────────┘
```

1. **Google Drive (Documents, Books, Notes, Slides & Labs):**
   - Zero outbound Google Drive redirects. All files render natively in-app.
   - Server-side Drive API v3 recursive fetcher with Next.js ISR caching (`revalidate: 3600`).
   - Native dark embedded viewers for PDFs, Slides, Docs, Images, and Markdown.
   - High-speed direct proxy downloads for lab virtual machines and archives (`.zip`, `.ova`, `.iso`).
   - **Zero-Config Fallback:** If `GOOGLE_DRIVE_API_KEY` is not yet configured, Google Drive's built-in folder embed view renders cleanly inside a dark container so every course is immediately accessible.
2. **YouTube (Video Lectures & Unlisted Playlists):**
   - Privacy-enhanced YouTube IFrame player (`youtube-nocookie.com/embed/{id}`) with custom controls, auto-mark complete upon ending, and auto-advance toggle.
   - Admin bulk playlist importer UI (`/admin`) that scrapes all video titles, durations, and IDs in one click.
3. **Supabase (Database, Authentication & Admin CMS):**
   - PostgreSQL schema with Row Level Security (RLS) policies.
   - Automated user profile creation trigger on signup.
   - Cloud progress and study notes sync across devices.
   - Role-based access control protecting the Admin CMS at `/admin`.

---

## 🚀 4-Step Quickstart Guide

### Step 1: Create a Free Supabase Project
1. Visit [supabase.com/dashboard](https://supabase.com/dashboard) and create a free project.
2. In your Supabase dashboard, go to **Settings** &gt; **API**.
3. Copy your **Project URL** and **anon public API key**.

---

### Step 2: Apply SQL Schema & Seed Data
1. In your Supabase dashboard, navigate to the **SQL Editor** in the left sidebar.
2. Click **"+ New Query"**.
3. Open [`supabase/schema.sql`](supabase/schema.sql) in this repository, paste the entire contents into the SQL Editor, and click **Run**.
4. Open [`supabase/seed.sql`](supabase/seed.sql) in this repository, paste its contents into the SQL Editor, and click **Run**.

*This creates all 7 tables, sets up Row Level Security policies, creates the automatic profile trigger, and pre-populates all 6 tracks, 12 courses, and the 7-step learning path.*

---

### Step 3: Elevate Yourself to Admin
In the Supabase SQL Editor, run this one-line command replacing with your actual email address:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

*This unlocks the protected **Admin Command Center** at `/admin`.*

---

### Step 4: Configure Environment Variables & Launch
Create `.env.local` in the project root:

```env
# 1. Supabase Credentials
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOi..."

# 2. Google Drive API Key (Optional for full Drive folder recursion)
GOOGLE_DRIVE_API_KEY=""

# 3. YouTube API Key (Optional for bulk playlist import)
YOUTUBE_API_KEY=""
```

Run the application:

```bash
# Install dependencies
npm install

# Run local development server
npm run dev

# Open in your browser
http://localhost:3000
```

---

## 🎯 6 Canonical Tracks & Exact Folder Mappings

| Track | Course Slug | Source Type | Drive Folder ID / Source | Recommended Step |
| :--- | :--- | :--- | :--- | :--- |
| **Track 1: Fundamentals** | `cybersecurity-fundamentals` | `gdrive_folder` | `1Drf74G5L-CPzvikrW54Cuq6SawAcynva` | Step 1 |
| **Track 2: Red Team** | `ethical-hacking-scratch` | `hybrid` | `1if6MCeBCj8sxWwJIKhtgwU0GBuBW8uLx` | Step 2 |
| **Track 2: Red Team** | `red-team-roadmap` | `markdown` | [GitHub Raw Markdown](https://raw.githubusercontent.com/soheilsec/Red-Team-Roadmap/main/English.md) | Step 3 |
| **Track 2: Red Team** | `red-team-resources` | `gdrive_folder` | `1uFt09G20WAskczk4Mk1U0OqW8N2COsZ5` | Step 5 |
| **Track 3: CEH Suite** | `ceh-study-materials` | `gdrive_folder` | `1Vgdtm5l9PEnHUU-g8caa3PjaZEMJltQ5` | Step 4 |
| **Track 3: CEH Suite** | `ceh-video-lectures` | `hybrid` | `1YdnlgS_1QRhXidJQHd2V3SpuO7G0Ywv7` | — |
| **Track 3: CEH Suite** | `ceh-notes` | `gdrive_folder` | `1bkMeKQ8PfYKrKmnl-evVj3h36caS9BIY` | — |
| **Track 3: CEH Suite** | `ceh-labs` | `gdrive_folder` | `17aTgWGoJRaTC7TxstXEX-3zewVgy_YjS` | Step 5 |
| **Track 3: CEH Suite** | `ceh-practical-resources`| `gdrive_folder` | `17aTgWGoJRaTC7TxstXEX-3zewVgy_YjS` | — |
| **Track 4: OffSec** | `offsec-resources` | `gdrive_folder` | `1ySTW2ZEuPPTqKD_-SPY9VHxb2wQeUb2D` | Step 6 |
| **Track 5: Blue Team** | `blue-team-books` | `gdrive_folder` | `1v4dQsqYe6ekjgaoImDuU0CcEJKymx1Vs` | Step 7 |
| **Track 6: SOC Operations**| `soc-resources` | `gdrive_folder` | `1bz7uOtUy7cO87tBNewnFzDy1nRgwO7Gl` | Step 7 |

---

## 🛠️ Key Platform Features

1. **Smart Link Parser Form (`/admin`):**
   - Paste ANY standard Google Drive folder or file URL or YouTube video/playlist URL.
   - Automatically detects the resource type and extracts the ID without manual copying.
   - Choose a course and module name, and publish live immediately.
2. **Bulk YouTube Playlist Importer (`/admin`):**
   - Paste a YouTube playlist link, preview all video titles and IDs, and import them in one click into Supabase.
3. **Seamless Guest + Logged-In Flow:**
   - Guests can browse, read documents, watch lectures, and track completion progress in `localStorage`.
   - Signing up automatically syncs any existing `localStorage` progress into Supabase `user_progress`.
4. **My Study Notes & Bookmarks:**
   - Every lesson includes a collapsible study notes drawer with syntax-highlighting scratchpad and 1-click bookmarking.
5. **Broken Link Reporting:**
   - Learners can report broken Drive or YouTube links directly from the lesson viewer. Admins can view and resolve reports inside `/admin`.

---

## 🌐 Free Deployment to Vercel

```bash
# 1. Push code to GitHub
git add .
git commit -m "feat: complete full-stack 3-layer cybersecurity LMS"
git push origin master

# 2. Deploy to Vercel
# Import repository at vercel.com and add your environment variables:
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
# GOOGLE_DRIVE_API_KEY (optional)
# YOUTUBE_API_KEY (optional)
```
