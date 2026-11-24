/**
 * Red Team Roadmap Snapshot & Backup CLI Script
 * Downloads the latest upstream roadmap markdown from GitHub and saves to content/red-team-roadmap.md
 * Optionally backs up to Cloudflare R2 at roadmaps/red-team-roadmap.md
 *
 * Usage:
 *   node scripts/sync-roadmap.mjs
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/soheilsec/Red-Team-Roadmap/main/English.md';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'cyber-lms-library';

async function main() {
  console.log('\n=============================================================================');
  console.log('   CYBERSECURITY LMS // RED TEAM ROADMAP SNAPSHOT & BACKUP');
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
    // Check fallback in src/data or content
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
    console.log(`💾 Saved owned copy to: ${targetPath}`);

    // If R2 credentials exist, upload backup to R2
    if (R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY) {
      console.log(`☁️ Uploading permanent backup copy to Cloudflare R2...`);
      try {
        const s3 = new S3Client({
          region: 'auto',
          endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
          credentials: {
            accessKeyId: R2_ACCESS_KEY_ID,
            secretAccessKey: R2_SECRET_ACCESS_KEY,
          },
        });

        await s3.send(new PutObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: 'roadmaps/red-team-roadmap.md',
          Body: markdown,
          ContentType: 'text/markdown; charset=utf-8',
        }));
        console.log(`✅ R2 backup completed at: roadmaps/red-team-roadmap.md`);
      } catch (r2Err) {
        console.warn(`⚠️ Could not upload R2 backup: ${r2Err.message}`);
      }
    }
  }

  console.log('\n✨ Roadmap snapshot complete.\n');
}

main().catch(console.error);
