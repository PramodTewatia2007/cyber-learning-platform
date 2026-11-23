/**
 * Optional Build-time Catalog Synchronization Script
 * Ingests all Google Drive folders and writes to src/data/catalog-cache.json
 * Run via: node scripts/sync-catalog.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FOLDER_SOURCES = [
  { slug: 'cybersecurity-fundamentals', folderId: '1Drf74G5L-CPzvikrW54Cuq6SawAcynva', title: 'Cybersecurity Basics – Foundation Notes' },
  { slug: 'learn-ethical-hacking', folderId: '1if6MCeBCj8sxWwJIKhtgwU0GBuBW8uLx', title: 'Learn Ethical Hacking from Scratch' },
  { slug: 'red-team-resources', folderId: '1uFt09G20WAskczk4Mk1U0OqW8N2COsZ5', title: 'Red Team Resources' },
  { slug: 'ceh-study-materials', folderId: '1Vgdtm5l9PEnHUU-g8caa3PjaZEMJltQ5', title: 'CEH Study Materials' },
  { slug: 'ceh-video-lectures', folderId: '1YdnlgS_1QRhXidJQHd2V3SpuO7G0Ywv7', title: 'CEH Video Lectures' },
  { slug: 'ceh-notes', folderId: '1bkMeKQ8PfYKrKmnl-evVj3h36caS9BIY', title: 'CEH Notes' },
  { slug: 'ceh-labs', folderId: '17aTgWGoJRaTC7TxstXEX-3zewVgy_YjS', title: 'CEH Labs' },
  { slug: 'ceh-practical-resources', folderId: '17aTgWGoJRaTC7TxstXEX-3zewVgy_YjS', title: 'CEH Practical Resources' },
  { slug: 'offsec-resources', folderId: '1ySTW2ZEuPPTqKD_-SPY9VHxb2wQeUb2D', title: 'OffSec Resources' },
  { slug: 'blue-team-kit', folderId: '1v4dQsqYe6ekjgaoImDuU0CcEJKymx1Vs', title: 'Blue Team Kit – Books' },
  { slug: 'soc-resources', folderId: '1bz7uOtUy7cO87tBNewnFzDy1nRgwO7Gl', title: 'SOC Resources' },
];

async function main() {
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
  console.log('[SyncCatalog] Starting Google Drive folder ingestion...');

  if (!apiKey || apiKey === 'your_google_drive_api_key_here') {
    console.log('[SyncCatalog] Notice: GOOGLE_DRIVE_API_KEY is not configured.');
    console.log('[SyncCatalog] The app is using the comprehensive offline fallback mock catalog.');
    return;
  }

  const outputDir = path.join(__dirname, '..', 'src', 'data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const catalog = {};

  for (const source of FOLDER_SOURCES) {
    console.log(`[SyncCatalog] Ingesting "${source.title}" (${source.folderId})...`);
    try {
      const query = encodeURIComponent(`'${source.folderId}' in parents and trashed = false`);
      const fields = encodeURIComponent('files(id,name,mimeType,size,modifiedTime)');
      const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&key=${apiKey}&pageSize=1000`);

      if (res.ok) {
        const json = await res.json();
        catalog[source.slug] = {
          courseSlug: source.slug,
          courseTitle: source.title,
          rootFolderId: source.folderId,
          files: json.files || [],
          syncedAt: new Date().toISOString(),
        };
        console.log(`[SyncCatalog] Successfully synced ${json.files?.length || 0} items for ${source.slug}`);
      } else {
        console.warn(`[SyncCatalog] Drive API returned ${res.status} for ${source.slug}`);
      }
    } catch (err) {
      console.error(`[SyncCatalog] Error syncing ${source.slug}:`, err.message);
    }
  }

  const outputPath = path.join(outputDir, 'catalog-cache.json');
  fs.writeFileSync(outputPath, JSON.stringify(catalog, null, 2));
  console.log(`[SyncCatalog] Completed. Cached data saved to: ${outputPath}`);
}

main().catch(console.error);
