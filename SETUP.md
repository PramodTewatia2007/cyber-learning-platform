# Cybersecurity Academy LMS (Self-Owned Platform)
## Cloudflare R2 + YouTube Hybrid Architecture Guide

A production-grade, self-owned Cybersecurity Learning Management System (LMS) built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Lucide Icons**, and the **AWS SDK v3 for Cloudflare R2** (`@aws-sdk/client-s3`, `@aws-sdk/lib-storage`, `@aws-sdk/s3-request-presigner`).

> **CRITICAL ARCHITECTURAL GUARANTEE:**
> At runtime, this website makes **ZERO calls to Google Drive** and displays **ZERO external Google Drive links**.
> - **100% of PDFs, Books, Slides, Notes, Markdown, and Lab Archives** are migrated to your own **Cloudflare R2** bucket (10 GB free tier with \$0 egress fees).
> - **Video Lectures** are streamed seamlessly in the dual-engine course player via **Cloudflare R2** (for files under your size threshold) or mapped to **Unlisted YouTube videos / playlists** with custom controls, timestamp bookmarks, and zero distraction overlays.
> - **Red Team Operations Roadmap** is snapshotted locally (`content/red-team-roadmap.md`) with continuous GitHub sync and R2 backup.

---

## 🏗️ 100% Free-Tier Architecture Breakdown

| Component | Service | Free Tier Allowance | Purpose in LMS |
| :--- | :--- | :--- | :--- |
| **Object Storage** | Cloudflare R2 | **10 GB storage**, \$0 egress fees | PDFs, ebooks, lab archives, cheatsheets, slides, and small videos |
| **Video Streaming** | YouTube (Unlisted) | **Unlimited** 4K/1080p bandwidth | Long video courses (CEH lectures, practical tutorials) |
| **Web Hosting** | Vercel / Cloudflare Pages | **100 GB/month** bandwidth | Next.js App Router frontend, streaming media proxy, search |
| **Roadmap Engine** | GitHub Raw + Local ISR | Unlimited requests | Live Red Team Operations curriculum |

---

## 🚀 Quickstart (Launch in 60 Seconds)

The platform comes with a pre-indexed **starter catalog** covering all 6 tracks (128 lessons, 42 video lectures, 56 PDFs/books, and 18 lab archives). You can run and test the full application immediately:

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev

# 3. Open in your browser
http://localhost:3000
```

---

## 📦 Migration & Content Ownership Pipeline

The project includes four production-ready Node.js CLI scripts in `scripts/`:

```
scripts/
├── check-size.mjs         # Dry-run audit: compares Docs/Labs vs. Videos size vs. R2 10 GB fit
├── migrate-to-r2.mjs      # Cloud-to-cloud streaming uploader (Drive -> R2) with deduplication
├── import-yt-playlist.mjs # Auto-ingest YouTube playlists into src/config/youtube-videos.json
├── sync-roadmap.mjs       # Snapshots GitHub Red Team Roadmap to local Markdown & R2
└── build-catalog.mjs      # Scans R2 bucket + merges YouTube videos into src/data/catalog.json
```

### Step 1: Storage Split Audit (Dry Run)

Run `check-size.mjs` to recursively inspect all source folders via the Google Drive API without downloading anything:

```bash
npm run check-size
```

**Terminal Output Breakdown:**
- Calculates **Docs / Books / Labs size** (files destined for Cloudflare R2).
- Calculates **Videos size** (files eligible for YouTube mapping or R2).
- Compares total non-video storage against Cloudflare R2's 10 GB free tier.

---

### Step 2: Stream Files to Cloudflare R2

Configure your Cloudflare R2 credentials and Google Drive API key in `.env.local`:

```env
# Cloudflare R2 Credentials
R2_ACCOUNT_ID="your_account_id"
R2_ACCESS_KEY_ID="your_access_key_id"
R2_SECRET_ACCESS_KEY="your_secret_access_key"
R2_BUCKET_NAME="cyber-lms-library"

# Google Drive API Key (One-time migration only)
GOOGLE_DRIVE_API_KEY="AIzaSy..."
```

Run the cloud-to-cloud migration:

```bash
# Recommended: Migrate all documents, books, and labs while skipping large videos
npm run migrate -- --skip-videos

# Or migrate a single course:
npm run migrate -- --course=ceh-study-materials

# Or migrate documents AND videos smaller than 50 MB:
npm run migrate -- --video-max-mb=50
```

**Key Pipeline Features:**
1. **Zero Local Disk Usage:** Files stream directly from Google Drive into Cloudflare R2 via `@aws-sdk/lib-storage` multipart upload.
2. **Smart Deduplication:** Automatically recognizes duplicate folder IDs (e.g., CEH Labs and Practical Resources sharing `17aTgWGoJRaTC7TxstXEX-3zewVgy_YjS`) and uploads them only once to `<track-slug>/<course-slug>/...`.
3. **Automatic Export:** Google Docs, Slides, and Sheets are automatically exported as high-fidelity `.pdf` documents during migration.
4. **Idempotent & Resumable:** Checks existing R2 object keys and file sizes with `HeadObjectCommand` before streaming. Re-running skips already uploaded files.
5. **Pending YouTube Staging:** Any skipped video is automatically appended to `src/config/youtube-videos.json` with its title, module hierarchy, and original file size.

---

### Step 3: Map Video Lectures to YouTube

For large video files that you upload as **Unlisted** videos on your own YouTube channel:

#### Option A: Auto-Import Entire Playlist
If you uploaded a course module to an Unlisted YouTube Playlist, run:

```bash
npm run import-yt-playlist -- --playlist=PLrAXtmErZgOdP_8GztsuKi9nrraNbJYp4 --course=ceh-video-lectures
```
*Requires `YOUTUBE_API_KEY` in `.env.local`.*

#### Option B: Edit `src/config/youtube-videos.json`
Manually paste your unlisted YouTube video IDs:

```json
[
  {
    "courseSlug": "ceh-video-lectures",
    "modulePath": "Module 01 - Introduction to Ethical Hacking",
    "title": "01 - Course Overview & Objectives",
    "youtubeId": "dQw4w9WgXcQ",
    "duration": "14:22"
  }
]
```

---

### Step 4: Snapshot the Red Team Roadmap

Snapshot the latest offensive security curriculum from upstream GitHub:

```bash
npm run sync-roadmap
```
- Saves to `content/red-team-roadmap.md` for fast, offline-first server rendering.
- Uploads a backup snapshot to your Cloudflare R2 bucket.

---

### Step 5: Build Optimized Catalog & Deploy

Compile all R2 objects, YouTube mappings, and the roadmap into the production catalog:

```bash
npm run build-catalog
```

This generates `src/data/catalog.json` with pre-computed file counts, byte sizes, and module trees so client page loads are instantaneous (< 10 ms).

```bash
# Test production build locally
npm run build
npm run start
```

---

## 🎯 Configured Tracks & Sources

Defined in `src/config/sources.mjs` (shared across Next.js and CLI scripts):

| Track | Course Slug | Source Type | Accent Color |
| :--- | :--- | :--- | :--- |
| **Track 1: Fundamentals** | `cybersecurity-fundamentals` | R2 Cloud Storage | Emerald (`#10B981`) |
| **Track 2: Red Team** | `ethical-hacking-scratch` | R2 Cloud Storage | Crimson (`#EF4444`) |
| **Track 2: Red Team** | `red-team-roadmap` | Local Markdown + R2 | Crimson (`#EF4444`) |
| **Track 2: Red Team** | `red-team-resources` | R2 Cloud Storage | Crimson (`#EF4444`) |
| **Track 3: CEH Suite** | `ceh-study-materials` | R2 Cloud Storage | Amber (`#F59E0B`) |
| **Track 3: CEH Suite** | `ceh-video-lectures` | Hybrid (R2 / YouTube) | Amber (`#F59E0B`) |
| **Track 3: CEH Suite** | `ceh-notes` | R2 Cloud Storage | Amber (`#F59E0B`) |
| **Track 3: CEH Suite** | `ceh-labs-practical` | R2 Cloud Storage (Deduplicated) | Amber (`#F59E0B`) |
| **Track 4: OffSec** | `offsec-resources` | R2 Cloud Storage | Crimson (`#EF4444`) |
| **Track 5: Blue Team** | `blue-team-books` | R2 Cloud Storage | Cyan (`#06B6D4`) |
| **Track 6: SOC Operations**| `soc-resources` | R2 Cloud Storage | Cyan (`#06B6D4`) |

---

## 🖥️ In-App Viewers & User Experience

1. **Dual-Engine Video Player (`VideoPlayer.tsx`):**
   - Seamlessly plays both **R2-hosted direct video streams** (with custom HTML5 controls and byte-range seeking) and **Privacy-enhanced YouTube streams** (`youtube-nocookie.com`).
   - Remembers resume timestamps in `localStorage`.
   - Auto-marks lessons as complete when playback finishes.
   - Shows "Pending Uploads" drawer for videos waiting for YouTube IDs.
2. **In-App PDF Reader (`PdfViewer.tsx`):**
   - Full-height view with zoom in/out, page scroll, and direct download from R2.
3. **Interactive Red Team Roadmap (`RoadmapViewer.tsx`):**
   - High-fidelity markdown reader with syntax-highlighted code blocks, copy buttons, and persistent milestone completion checkboxes.
4. **Lab Asset Cards (`LabViewer.tsx`):**
   - Cyber-terminal aesthetic displaying VM image file size, MD5 checksum, recommended hypervisor, and direct download buttons.
5. **Instant Global Search (`SearchModal.tsx`):**
   - Press `Ctrl+K` from any screen to search across all courses, modules, lessons, PDFs, and videos.

---

## 🤖 Zero-Bandwidth GitHub Action Migration

To migrate gigabytes of data from Google Drive into Cloudflare R2 without using any of your own computer's bandwidth, use the pre-built GitHub Actions workflow in `.github/workflows/migrate-library.yml`:

1. Push your repository to GitHub.
2. Add the following repository secrets under **Settings > Secrets and variables > Actions**:
   - `R2_ACCOUNT_ID`
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`
   - `R2_BUCKET_NAME`
   - `GOOGLE_DRIVE_API_KEY`
3. Go to the **Actions** tab in GitHub > select **"Migrate Drive Library to Cloudflare R2"** > click **Run workflow**.
4. Choose optional flags:
   - `skip_videos`: `true` (recommended)
   - `course_slug`: leave empty for all courses, or specify a slug
   - `video_max_mb`: upload threshold for videos
5. The cloud runner executes the migration with GitHub's multi-gigabit connection and commits the updated catalog back to your repository.

---

## 🔒 Security & Data Privacy

- **No Public API Key Exposure:** R2 API tokens and Google Drive API keys remain server-side in Node scripts and `/api/media/[...key]`.
- **Presigned URLs:** Private R2 buckets are accessed via time-limited presigned URLs (`@aws-sdk/s3-request-presigner`) or proxied streaming.
- **Privacy Mode YouTube:** Video embeds use `https://www.youtube-nocookie.com` to prevent third-party tracking.
