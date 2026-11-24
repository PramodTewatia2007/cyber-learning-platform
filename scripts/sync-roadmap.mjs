/**
 * Red Team Roadmap Snapshot Script
 * Downloads the latest upstream roadmap markdown from GitHub and saves to content/red-team-roadmap.md
 *
 * Usage:
 *   node scripts/sync-roadmap.mjs
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/soheilsec/Red-Team-Roadmap/main/English.md';

async function main() {
  console.log('\n=============================================================================');
  console.log('   CYBERSECURITY LMS // RED TEAM ROADMAP SNAPSHOT');
  console.log('=============================================================================\n');

  const contentDir = path.join(__dirname, '..', 'content');
  if (!fs.existsSync(contentDir)) {
    fs.mkdirSync(contentDir, { recursive: true });
  }

  const targetPath = path.join(contentDir, 'red-team-roadmap.md');
  let markdown = '';

  console.log(`Fetching latest roadmap from ${GITHUB_RAW_URL}...`);
  try {
    const res = await fetch(GITHUB_RAW_URL, { signal: AbortSignal.timeout(10000) });
    if (res.ok) {
      markdown = await res.text();
      console.log(`✅ Successfully fetched live roadmap (${(markdown.length / 1024).toFixed(1)} KB)`);
    } else {
      console.warn(`⚠️ Upstream returned ${res.status}. Checking local fallback...`);
    }
  } catch (err) {
    console.warn(`⚠️ Fetch failed (${err.message}). Checking local fallback...`);
  }

  if (!markdown || markdown.trim() === '') {
    const fallbackSrc = path.join(__dirname, '..', 'src', 'data', 'red-team-roadmap-fallback.md');
    if (fs.existsSync(fallbackSrc)) {
      markdown = fs.readFileSync(fallbackSrc, 'utf8');
      console.log(`ℹ️ Loaded local fallback snapshot (${(markdown.length / 1024).toFixed(1)} KB)`);
    } else if (fs.existsSync(targetPath)) {
      markdown = fs.readFileSync(targetPath, 'utf8');
      console.log(`ℹ️ Preserving existing content/red-team-roadmap.md`);
    }
  }

  if (markdown) {
    fs.writeFileSync(targetPath, markdown, 'utf8');
    console.log(`💾 Saved local copy to: ${targetPath}`);
  }

  console.log('\n✅ Roadmap sync finished.\n');
}

main().catch((err) => {
  console.error('Fatal error during roadmap sync:', err);
  process.exit(1);
});
