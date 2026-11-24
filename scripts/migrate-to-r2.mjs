/**
 * Smart Hybrid Cloud-to-Cloud Migrator CLI Script
 * Streams files directly from Google Drive into Cloudflare R2 (S3-compatible)
 * Zero local disk usage via @aws-sdk/lib-storage Upload stream
 *
 * Usage:
 *   node scripts/migrate-to-r2.mjs [--skip-videos] [--video-max-mb=50] [--course=slug] [--dry-run]
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { SOURCE_TRACKS, ALL_SOURCE_COURSES } from '../src/config/sources.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse CLI flags
const args = process.argv.slice(2);
const skipVideos = args.includes('--skip-videos') || !args.some(a => a.startsWith('--video-max-mb=') || a === '--include-all-videos');
const dryRun = args.includes('--dry-run');

const courseArg = args.find(a => a.startsWith('--course='));
const targetCourseSlug = courseArg ? courseArg.split('=')[1] : null;

const videoMaxMbArg = args.find(a => a.startsWith('--video-max-mb='));
const videoMaxMB = videoMaxMbArg ? parseFloat(videoMaxMbArg.split('=')[1]) : 0;

// Env configuration
const DRIVE_API_KEY = process.env.GOOGLE_DRIVE_API_KEY;
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'cyber-lms-library';

function isVideo(mimeType, filename) {
  const m = (mimeType || '').toLowerCase();
  const f = (filename || '').toLowerCase();
  return (
    m.startsWith('video/') ||
    f.endsWith('.mp4') ||
    f.endsWith('.mkv') ||
    f.endsWith('.webm') ||
    f.endsWith('.mov') ||
    f.endsWith('.avi')
  );
}

function sanitizeName(name) {
  return name.replace(/[\\:*?"<>|]/g, '_').trim();
}

function getR2Client() {
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    return null;
  }
  return new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
}

function loadYouTubeMapping() {
  const ytPath = path.join(__dirname, '..', 'src', 'config', 'youtube-videos.json');
  try {
    if (fs.existsSync(ytPath)) {
      return JSON.parse(fs.readFileSync(ytPath, 'utf8'));
    }
  } catch (e) {
    console.warn('Could not read existing youtube-videos.json, creating new.');
  }
  return [];
}

function saveYouTubeMapping(entries) {
  const ytPath = path.join(__dirname, '..', 'src', 'config', 'youtube-videos.json');
  fs.writeFileSync(ytPath, JSON.stringify(entries, null, 2), 'utf8');
}

async function checkObjectExistsInR2(s3, bucket, key, expectedSize) {
  try {
    const head = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    if (expectedSize && head.ContentLength === expectedSize) {
      return true; // Already exists with matching size
    }
    return head.ContentLength > 0;
  } catch (err) {
    if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
      return false;
    }
    return false;
  }
}

async function fetchFolderTree(drive, folderId, currentPath = '') {
  const results = [];
  let pageToken = null;

  do {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'nextPageToken, files(id, name, mimeType, size)',
      pageSize: 1000,
      pageToken,
    });

    const items = res.data.files || [];
    for (const item of items) {
      if (item.mimeType === 'application/vnd.google-apps.folder') {
        const nextPath = currentPath ? `${currentPath}/${sanitizeName(item.name)}` : sanitizeName(item.name);
        const subItems = await fetchFolderTree(drive, item.id, nextPath);
        results.push(...subItems);
      } else {
        results.push({
          ...item,
          folderPath: currentPath,
        });
      }
    }
    pageToken = res.data.nextPageToken;
  } while (pageToken);

  return results;
}

async function streamUploadToR2(s3, drive, file, r2Key, retries = 3) {
  let stream;
  let contentType = file.mimeType || 'application/octet-stream';
  let finalKey = r2Key;

  // Handle Google Workspace doc exports
  if (file.mimeType === 'application/vnd.google-apps.document') {
    contentType = 'application/pdf';
    finalKey = finalKey.replace(/\.[^.]+$/, '') + '.pdf';
    const res = await drive.files.export({ fileId: file.id, mimeType: 'application/pdf' }, { responseType: 'stream' });
    stream = res.data;
  } else if (file.mimeType === 'application/vnd.google-apps.presentation') {
    contentType = 'application/pdf';
    finalKey = finalKey.replace(/\.[^.]+$/, '') + '.pdf';
    const res = await drive.files.export({ fileId: file.id, mimeType: 'application/pdf' }, { responseType: 'stream' });
    stream = res.data;
  } else if (file.mimeType === 'application/vnd.google-apps.spreadsheet') {
    contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    finalKey = finalKey.replace(/\.[^.]+$/, '') + '.xlsx';
    const res = await drive.files.export({ fileId: file.id, mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }, { responseType: 'stream' });
    stream = res.data;
  } else {
    const res = await drive.files.get({ fileId: file.id, alt: 'media' }, { responseType: 'stream' });
    stream = res.data;
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const parallelUpload = new Upload({
        client: s3,
        params: {
          Bucket: R2_BUCKET_NAME,
          Key: finalKey,
          Body: stream,
          ContentType: contentType,
        },
        queueSize: 4,
        partSize: 10 * 1024 * 1024, // 10MB parts
      });

      await parallelUpload.done();
      return { success: true, key: finalKey };
    } catch (err) {
      if (attempt === retries) throw err;
      const backoffMs = Math.pow(2, attempt) * 1000;
      console.warn(`    ⚠️ Upload error (${err.message}). Retrying in ${backoffMs}ms...`);
      await new Promise(r => setTimeout(r, backoffMs));
    }
  }
}

async function main() {
  console.log('\n=============================================================================');
  console.log('   CYBERSECURITY LMS // CLOUD-TO-CLOUD R2 MIGRATION PIPELINE');
  console.log('=============================================================================\n');

  if (!DRIVE_API_KEY) {
    console.error('❌ ERROR: Missing GOOGLE_DRIVE_API_KEY. Please provide in .env.local.');
    process.exit(1);
  }

  const s3 = getR2Client();
  if (!s3 && !dryRun) {
    console.error('❌ ERROR: Missing Cloudflare R2 credentials (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY).');
    console.log('   Please configure in .env.local or run with --dry-run to simulate.');
    process.exit(1);
  }

  console.log(`Configured Settings:`);
  console.log(` • Mode: ${dryRun ? 'DRY-RUN (Simulation)' : 'LIVE CLOUD-TO-CLOUD STREAM'}`);
  console.log(` • Target Course: ${targetCourseSlug || 'ALL COURSES'}`);
  console.log(` • Skip Video Files: ${skipVideos ? 'YES (PDFs, Notes, Labs only)' : 'NO'}`);
  if (videoMaxMB > 0) console.log(` • Video Size Threshold: <= ${videoMaxMB} MB`);
  console.log(` • Destination Bucket: ${R2_BUCKET_NAME}\n`);

  const drive = google.drive({ version: 'v3', auth: DRIVE_API_KEY });
  const youtubeEntries = loadYouTubeMapping();
  const errors = [];

  // Track deduplicated folders (e.g. CEH Labs and Practical Resources)
  const sharedFolders = new Map(); // folderId -> R2 prefix where it was already uploaded

  let totalUploaded = 0;
  let totalSkipped = 0;
  let totalRoutedToYT = 0;

  for (const track of SOURCE_TRACKS) {
    for (const course of track.courses) {
      if (course.sourceType !== 'drive_folder' || !course.driveFolderId) continue;
      if (targetCourseSlug && course.slug !== targetCourseSlug) continue;

      console.log(`\n📂 Processing: [${track.title}] > ${course.title} (${course.slug})`);

      // Check smart deduplication
      if (sharedFolders.has(course.driveFolderId)) {
        const existingPrefix = sharedFolders.get(course.driveFolderId);
        console.log(`  ℹ️  DEDUPLICATION DETECTED: Shares source folder ID (${course.driveFolderId}) with ${existingPrefix}.`);
        console.log(`      Assets already uploaded; catalog manifest will alias to existing R2 keys.`);
        continue;
      }

      sharedFolders.set(course.driveFolderId, `${track.id}/${course.slug}`);

      console.log(`  🔍 Scanning Google Drive folder structure...`);
      let files = [];
      try {
        files = await fetchFolderTree(drive, course.driveFolderId);
        console.log(`  Found ${files.length} items in course hierarchy.`);
      } catch (err) {
        console.error(`  ❌ Failed to scan folder: ${err.message}`);
        errors.push({ course: course.slug, folderId: course.driveFolderId, error: err.message });
        continue;
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const sizeBytes = parseInt(file.size || '0', 10);
        const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(1);
        const isVid = isVideo(file.mimeType, file.name);

        const nestedPath = file.folderPath ? `${file.folderPath}/${sanitizeName(file.name)}` : sanitizeName(file.name);
        const r2Key = `${track.id}/${course.slug}/${nestedPath}`;

        // Check if video should be routed to YouTube mapping
        if (isVid && (skipVideos || (videoMaxMB > 0 && parseFloat(sizeMB) > videoMaxMB))) {
          totalRoutedToYT++;
          // Check if already in youtube-videos.json
          const existing = youtubeEntries.find(
            e => e.courseSlug === course.slug && (e.originalFilename === file.name || e.title === file.name)
          );

          if (!existing) {
            youtubeEntries.push({
              courseSlug: course.slug,
              modulePath: file.folderPath || 'Main Lectures',
              title: file.name.replace(/\.[^.]+$/, '').replace(/^[0-9]+[_\s.-]*/, ''),
              originalFilename: file.name,
              originalSizeMB: parseFloat(sizeMB),
              youtubeId: '',
              addedAt: new Date().toISOString(),
            });
            console.log(`  🎬 [Route to YouTube] ${file.name} (${sizeMB} MB) -> logged in youtube-videos.json`);
          } else {
            console.log(`  🎬 [Existing YouTube Entry] ${file.name} (ID: ${existing.youtubeId || 'Pending'})`);
          }
          continue;
        }

        // Idempotency: check if exists in R2
        if (!dryRun) {
          const exists = await checkObjectExistsInR2(s3, R2_BUCKET_NAME, r2Key, sizeBytes);
          if (exists) {
            totalSkipped++;
            process.stdout.write(`  ⏩ [Already in R2] ${file.name}\r`);
            continue;
          }
        }

        // Perform Cloud-to-Cloud Upload
        console.log(`  ⬆️  [${i + 1}/${files.length}] Uploading: ${file.name} (${sizeMB} MB)...`);

        if (dryRun) {
          totalUploaded++;
          continue;
        }

        try {
          await streamUploadToR2(s3, drive, file, r2Key);
          totalUploaded++;
          console.log(`     ✅ Completed: ${r2Key}`);
        } catch (uploadErr) {
          console.error(`     ❌ Error uploading ${file.name}: ${uploadErr.message}`);
          errors.push({ fileId: file.id, fileName: file.name, r2Key, error: uploadErr.message });
        }
      }
    }
  }

  // Save updated YouTube mappings (preserving filled IDs)
  saveYouTubeMapping(youtubeEntries);

  if (errors.length > 0) {
    const errorLogPath = path.join(__dirname, '..', 'migration-errors.json');
    fs.writeFileSync(errorLogPath, JSON.stringify(errors, null, 2), 'utf8');
    console.log(`\n⚠️  Encountered ${errors.length} errors during migration. Logged to ${errorLogPath}`);
  }

  console.log('\n=============================================================================');
  console.log('🎉 MIGRATION PIPELINE SUMMARY:');
  console.log(`   • Newly Uploaded to R2:         ${totalUploaded}`);
  console.log(`   • Skipped (Already in R2):      ${totalSkipped}`);
  console.log(`   • Routed to YouTube Config:     ${totalRoutedToYT}`);
  console.log(`   • Total YouTube Mappings Saved: ${youtubeEntries.length}`);
  console.log('=============================================================================\n');
}

main().catch(console.error);
