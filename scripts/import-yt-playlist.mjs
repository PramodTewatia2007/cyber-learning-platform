/**
 * Bulk Unlisted YouTube Playlist Importer CLI Script
 * Ingests an entire Unlisted YouTube playlist and writes/merges entries into src/config/youtube-videos.json
 *
 * Usage:
 *   node scripts/import-yt-playlist.mjs --playlist=<PLAYLIST_ID> --course=<course-slug> [--module="Module Name"]
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const playlistArg = args.find(a => a.startsWith('--playlist='));
const courseArg = args.find(a => a.startsWith('--course='));
const moduleArg = args.find(a => a.startsWith('--module='));

const playlistId = playlistArg ? playlistArg.split('=')[1] : null;
const courseSlug = courseArg ? courseArg.split('=')[1] : null;
const moduleName = moduleArg ? moduleArg.split('=')[1] : 'Video Lectures';

const API_KEY = process.env.YOUTUBE_API_KEY || process.env.GOOGLE_DRIVE_API_KEY;

function loadYouTubeMapping() {
  const ytPath = path.join(__dirname, '..', 'src', 'config', 'youtube-videos.json');
  try {
    if (fs.existsSync(ytPath)) {
      return JSON.parse(fs.readFileSync(ytPath, 'utf8'));
    }
  } catch (e) {
    // Fall back to empty array
  }
  return [];
}

function saveYouTubeMapping(entries) {
  const ytPath = path.join(__dirname, '..', 'src', 'config', 'youtube-videos.json');
  fs.writeFileSync(ytPath, JSON.stringify(entries, null, 2), 'utf8');
}

async function fetchPlaylistVideos(youtube, playlistId) {
  const videos = [];
  let nextPageToken = null;

  do {
    const res = await youtube.playlistItems.list({
      part: 'snippet,contentDetails',
      playlistId,
      maxResults: 50,
      pageToken: nextPageToken,
    });

    const items = res.data.items || [];
    for (const item of items) {
      const snippet = item.snippet;
      const videoId = snippet.resourceId?.videoId;
      if (!videoId) continue;

      const title = snippet.title;
      // Skip deleted or private placeholders
      if (title === 'Private video' || title === 'Deleted video') continue;

      const thumbnail =
        snippet.thumbnails?.maxres?.url ||
        snippet.thumbnails?.high?.url ||
        snippet.thumbnails?.medium?.url ||
        `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

      videos.push({
        youtubeId: videoId,
        title: title.trim(),
        thumbnailUrl: thumbnail,
      });
    }

    nextPageToken = res.data.nextPageToken;
  } while (nextPageToken);

  return videos;
}

async function main() {
  console.log('\n=============================================================================');
  console.log('   CYBERSECURITY LMS // BULK UNLISTED YOUTUBE PLAYLIST IMPORTER');
  console.log('=============================================================================\n');

  if (!playlistId || !courseSlug) {
    console.log('📖 Usage:');
    console.log('   node scripts/import-yt-playlist.mjs --playlist=<PLAYLIST_ID> --course=<course-slug> [--module="Module Name"]\n');
    console.log('Example:');
    console.log('   node scripts/import-yt-playlist.mjs --playlist=PLrAXtmErZgOdP_8GztsuKi9vnCAUWWx4e --course=ethical-hacking-scratch --module="Module 01: Recon"\n');
    process.exit(1);
  }

  if (!API_KEY) {
    console.error('❌ ERROR: Missing API key. Please provide YOUTUBE_API_KEY or GOOGLE_DRIVE_API_KEY in .env.local.');
    process.exit(1);
  }

  console.log(`Connecting to YouTube Data API v3...`);
  console.log(` • Target Playlist ID: ${playlistId}`);
  console.log(` • Assigning to Course: ${courseSlug}`);
  console.log(` • Module Name:         ${moduleName}\n`);

  const youtube = google.youtube({ version: 'v3', auth: API_KEY });

  let ytVideos = [];
  try {
    ytVideos = await fetchPlaylistVideos(youtube, playlistId);
    console.log(`✅ Successfully retrieved ${ytVideos.length} videos from playlist!`);
  } catch (err) {
    console.error(`❌ Failed to fetch playlist: ${err.message}`);
    process.exit(1);
  }

  const existingEntries = loadYouTubeMapping();
  let updatedCount = 0;
  let addedCount = 0;

  for (const ytVid of ytVideos) {
    // Attempt to match with existing pending entry by title similarity or filename
    const cleanYtTitle = ytVid.title.toLowerCase().replace(/[^\w\s]/g, '');
    let matched = existingEntries.find(e => {
      if (e.courseSlug !== courseSlug) return false;
      const cleanEntryTitle = e.title.toLowerCase().replace(/[^\w\s]/g, '');
      return cleanYtTitle.includes(cleanEntryTitle) || cleanEntryTitle.includes(cleanYtTitle);
    });

    if (matched) {
      matched.youtubeId = ytVid.youtubeId;
      matched.thumbnailUrl = ytVid.thumbnailUrl;
      updatedCount++;
      console.log(`  🔗 [Matched & Linked] "${matched.title}" -> YouTube ID: ${ytVid.youtubeId}`);
    } else {
      // Append as new lesson in this module
      existingEntries.push({
        courseSlug,
        modulePath: moduleName,
        title: ytVid.title,
        originalFilename: `${ytVid.title.replace(/[^\w\s.-]/g, '_')}.mp4`,
        originalSizeMB: 0,
        youtubeId: ytVid.youtubeId,
        thumbnailUrl: ytVid.thumbnailUrl,
        addedAt: new Date().toISOString(),
      });
      addedCount++;
      console.log(`  ➕ [New Video Ingested] "${ytVid.title}" -> YouTube ID: ${ytVid.youtubeId}`);
    }
  }

  saveYouTubeMapping(existingEntries);

  console.log('\n=============================================================================');
  console.log('🎉 PLAYLIST IMPORT COMPLETE:');
  console.log(`   • Existing Entries Matched & Linked: ${updatedCount}`);
  console.log(`   • New YouTube Lessons Added:         ${addedCount}`);
  console.log(`   • Total Videos in youtube-videos.json: ${existingEntries.length}`);
  console.log('=============================================================================\n');
}

main().catch(console.error);
