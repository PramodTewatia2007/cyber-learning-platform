# Cybersecurity Academy LMS (Learning Platform)
## Operational Deployment & Google Drive Integration Guide

This is a full-stack Cybersecurity LMS built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Lucide Icons**.

> **CRITICAL ARCHITECTURAL GUARANTEE:**
> This platform **NEVER** redirects users to Google Drive or displays raw external Google Drive URLs. All videos, PDFs, ebooks, lab archives, markdown notes, and the GitHub Red Team Roadmap are ingested server-side and rendered directly inside the website's own native course player and document reader.

---

## 🚀 Quickstart (Running Immediately)

The platform comes with a **built-in high-fidelity offline/demo catalog** for all 6 tracks. You can launch and test the entire platform right now without an API key!

\`\`\`bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev

# 3. Open in your browser
http://localhost:3000
\`\`\`

---

## 🔑 2-Minute Google Drive API Setup (Live Ingestion)

To stream and sync your live Google Drive folders directly into the LMS:

### Step 1: Open Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g., `Cyber-LMS-Drive`).

### Step 2: Enable Google Drive API v3
1. In the search bar at the top, type **"Google Drive API"**.
2. Select **Google Drive API** under Marketplace / APIs & Services.
3. Click the blue **"Enable"** button.

### Step 3: Generate a Free API Key
1. In the left navigation menu, go to **APIs & Services** &gt; **Credentials**.
2. Click **"+ CREATE CREDENTIALS"** at the top &gt; Select **"API key"**.
3. Copy the generated API key (starts with `AIzaSy...`).
4. *(Optional Best Practice)* Under "API restrictions", restrict the key to **"Google Drive API"**.

### Step 4: Configure `.env.local`
Create a `.env.local` file in the project root:

\`\`\`bash
GOOGLE_DRIVE_API_KEY=AIzaSyYourActualApiKeyHere
\`\`\`

### Step 5: Ensure Your Google Drive Folders are Shared
Ensure each Google Drive folder is set to:
- **"Anyone with the link can view"** (Viewer permission)
This allows the Google Drive API v3 (`files.list`) to recursively index subfolders and stream media without requiring OAuth user logins.

---

## 🎯 6 Ingested Tracks & Exact Folder Mappings

Configured in \`src/config/sources.ts\`:

| Track | Course / Module Title | Source / Folder ID | Accent |
| :--- | :--- | :--- | :--- |
| **Track 1: Fundamentals** | Cybersecurity Basics – Foundation Notes | \`1Drf74G5L-CPzvikrW54Cuq6SawAcynva\` | Emerald (\`#10B981\`) |
| **Track 2: Red Team** | Learn Ethical Hacking from Scratch | \`1if6MCeBCj8sxWwJIKhtgwU0GBuBW8uLx\` | Crimson (\`#EF4444\`) |
| **Track 2: Red Team** | Red Team Roadmap (Interactive Guide) | [GitHub Raw MD](https://raw.githubusercontent.com/soheilsec/Red-Team-Roadmap/main/English.md) | Crimson (\`#EF4444\`) |
| **Track 2: Red Team** | Red Team Resources | \`1uFt09G20WAskczk4Mk1U0OqW8N2COsZ5\` | Crimson (\`#EF4444\`) |
| **Track 3: CEH Suite** | CEH Study Materials | \`1Vgdtm5l9PEnHUU-g8caa3PjaZEMJltQ5\` | Amber (\`#F59E0B\`) |
| **Track 3: CEH Suite** | CEH Video Lectures | \`1YdnlgS_1QRhXidJQHd2V3SpuO7G0Ywv7\` | Amber (\`#F59E0B\`) |
| **Track 3: CEH Suite** | CEH Notes | \`1bkMeKQ8PfYKrKmnl-evVj3h36caS9BIY\` | Amber (\`#F59E0B\`) |
| **Track 3: CEH Suite** | CEH Labs | \`17aTgWGoJRaTC7TxstXEX-3zewVgy_YjS\` | Amber (\`#F59E0B\`) |
| **Track 3: CEH Suite** | CEH Practical Resources | \`17aTgWGoJRaTC7TxstXEX-3zewVgy_YjS\` | Amber (\`#F59E0B\`) |
| **Track 4: OffSec** | OffSec Resources | \`1ySTW2ZEuPPTqKD_-SPY9VHxb2wQeUb2D\` | Crimson (\`#EF4444\`) |
| **Track 5: Blue Team** | Blue Team Kit – Books | \`1v4dQsqYe6ekjgaoImDuU0CcEJKymx1Vs\` | Cyan (\`#06B6D4\`) |
| **Track 6: SOC Operations**| SOC Resources | \`1bz7uOtUy7cO87tBNewnFzDy1nRgwO7Gl\` | Cyan (\`#06B6D4\`) |

---

## 🛠 Features & Native Viewers

1. **Custom Video Player (`VideoViewer`):**
   - Stream endpoint: \`/api/content/[fileId]\`
   - Play/pause, seek, volume, speed selector (0.75x to 2x), theater/fullscreen.
   - Zero Google Drive branding, zero popup windows.
2. **In-App PDF Reader (`PdfViewer`):**
   - Zoom in/out, fit-to-width, page scroll, and prominent "Mark Complete" toggle.
3. **Markdown & Document Reader (`MarkdownViewer`):**
   - Syntax-highlighted code blocks with 1-click "Copy Code" button.
   - Reading time estimation and structured tables.
4. **Lab Asset Cards (`LabViewer`):**
   - Terminal styling with file size, recommended hypervisor, and direct proxy download button (\`/api/download/[fileId]\`).
5. **Interactive Red Team Roadmap (`RoadmapViewer`):**
   - Fetched directly from GitHub with local ISR cache.
   - Interactive milestone checkboxes with overall completion percentage saved in \`localStorage\`.
   - Table of contents with instant scroll jumping.
6. **Global Search Modal (`SearchModal`):**
   - Trigger with \`Ctrl+K\` from any page to find lessons across all 6 tracks.
7. **Personal Study Notes Scratchpad (`LessonNotes`):**
   - Persistent per-lesson markdown notes saved in browser storage.
