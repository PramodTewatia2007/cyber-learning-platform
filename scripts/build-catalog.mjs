/**
 * Unified Catalog Compiler CLI Script
 * Combines:
 * 1. Cloudflare R2 bucket objects (ListObjectsV2)
 * 2. Unlisted YouTube videos (youtube-videos.json)
 * 3. Local Red Team Roadmap Markdown (content/red-team-roadmap.md)
 * Into a single manifest: src/data/catalog.json
 *
 * Usage:
 *   node scripts/build-catalog.mjs
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { SOURCE_TRACKS, ALL_SOURCE_COURSES } from '../src/config/sources.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'cyber-lms-library';
const SHOW_PENDING_VIDEOS = process.env.SHOW_PENDING_VIDEOS === 'true' || process.env.NODE_ENV === 'development';

function formatSize(bytes) {
  if (!bytes || isNaN(bytes)) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function classifyFileType(filename) {
  const f = (filename || '').toLowerCase();
  if (f.endsWith('.mp4') || f.endsWith('.mkv') || f.endsWith('.webm') || f.endsWith('.mov') || f.endsWith('.avi')) {
    return 'video';
  }
  if (f.endsWith('.pdf')) {
    return 'pdf';
  }
  if (f.endsWith('.md') || f.endsWith('.markdown')) {
    return 'markdown';
  }
  if (
    f.endsWith('.zip') || f.endsWith('.ova') || f.endsWith('.iso') ||
    f.endsWith('.vmdk') || f.endsWith('.tar.gz') || f.endsWith('.7z') ||
    f.endsWith('.pcap') || f.endsWith('.pcapng')
  ) {
    return 'lab';
  }
  if (f.endsWith('.docx') || f.endsWith('.doc') || f.endsWith('.txt') || f.endsWith('.rtf')) {
    return 'document';
  }
  if (f.endsWith('.pptx') || f.endsWith('.ppt')) {
    return 'presentation';
  }
  if (f.endsWith('.xlsx') || f.endsWith('.csv')) {
    return 'spreadsheet';
  }
  return 'document';
}

function cleanTitle(filename) {
  return filename
    .replace(/\.[^.]+$/, '')
    .replace(/^([0-9]+[_\s.-]*)+/, '')
    .replace(/[_-]/g, ' ')
    .trim();
}

async function listAllR2Objects(s3, bucket) {
  const objects = [];
  let continuationToken = null;

  try {
    do {
      const res = await s3.send(new ListObjectsV2Command({
        Bucket: bucket,
        ContinuationToken: continuationToken,
      }));

      if (res.Contents) {
        objects.push(...res.Contents);
      }
      continuationToken = res.NextContinuationToken;
    } while (continuationToken);
  } catch (err) {
    console.warn(`⚠️ Could not list R2 bucket (${err.message}). Using local catalog builder.`);
  }

  return objects;
}

function loadYouTubeMapping() {
  const ytPath = path.join(__dirname, '..', 'src', 'config', 'youtube-videos.json');
  try {
    if (fs.existsSync(ytPath)) {
      return JSON.parse(fs.readFileSync(ytPath, 'utf8'));
    }
  } catch (e) {
    // ignore
  }
  return [];
}

async function main() {
  console.log('\n=============================================================================');
  console.log('   CYBERSECURITY LMS // UNIFIED CATALOG COMPILER');
  console.log('=============================================================================\n');

  let r2Objects = [];
  if (R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY) {
    console.log(`Connecting to Cloudflare R2 bucket "${R2_BUCKET_NAME}"...`);
    const s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });
    r2Objects = await listAllR2Objects(s3, R2_BUCKET_NAME);
    console.log(`✅ Discovered ${r2Objects.length} objects in Cloudflare R2.`);
  } else {
    console.log(`ℹ️ No Cloudflare R2 credentials provided. Compiling catalog with pre-configured starter library.`);
  }

  const ytVideos = loadYouTubeMapping();
  console.log(`Loaded ${ytVideos.length} YouTube mappings.`);

  // Build course structure
  const coursesMap = {};
  const tracksList = [];

  let grandTotalLessons = 0;
  let grandTotalVideos = 0;
  let grandTotalPdfs = 0;
  let grandTotalLabs = 0;
  let grandTotalDocs = 0;
  let grandTotalBytes = 0;

  for (const track of SOURCE_TRACKS) {
    const trackCourses = [];

    for (const courseConfig of track.courses) {
      const courseSlug = courseConfig.slug;
      const isRoadmap = courseConfig.slug === 'red-team-roadmap';

      const modulesMap = new Map(); // moduleName -> { id, name, lessons: [] }
      const rootLessons = [];

      let courseVideos = 0;
      let coursePdfs = 0;
      let courseLabs = 0;
      let courseDocs = 0;
      let courseBytes = 0;
      let pendingVideos = 0;

      // 1. Process R2 Objects matching this track and course prefix
      // Objects are stored as: <track-id>/<course-slug>/<module-path>/<filename>
      const prefix = `${track.id}/${courseSlug}/`;
      const courseR2Objects = r2Objects.filter(o => o.Key.startsWith(prefix));

      for (const obj of courseR2Objects) {
        const relativeKey = obj.Key.substring(prefix.length);
        const parts = relativeKey.split('/');
        const filename = parts.pop();
        const moduleName = parts.length > 0 ? parts.join(' / ') : null;

        const fileType = classifyFileType(filename);
        const size = obj.Size || 0;
        courseBytes += size;

        if (fileType === 'video') courseVideos++;
        else if (fileType === 'pdf') coursePdfs++;
        else if (fileType === 'lab') courseLabs++;
        else courseDocs++;

        const lesson = {
          id: `r2-${Buffer.from(obj.Key).toString('hex').substring(0, 16)}`,
          name: filename,
          title: cleanTitle(filename),
          fileType,
          source: 'r2',
          r2Key: obj.Key,
          size,
          formattedSize: formatSize(size),
          modifiedTime: obj.LastModified ? obj.LastModified.toISOString() : undefined,
        };

        if (moduleName) {
          if (!modulesMap.has(moduleName)) {
            modulesMap.set(moduleName, {
              id: `mod-${Buffer.from(moduleName).toString('hex').substring(0, 12)}`,
              name: moduleName,
              lessons: [],
            });
          }
          modulesMap.get(moduleName).lessons.push(lesson);
        } else {
          rootLessons.push(lesson);
        }
      }

      // 2. Process YouTube Videos for this course
      const courseYTVideos = ytVideos.filter(v => v.courseSlug === courseSlug);
      for (const yt of courseYTVideos) {
        const hasId = Boolean(yt.youtubeId && yt.youtubeId.trim() !== '');

        if (!hasId) {
          pendingVideos++;
          if (!SHOW_PENDING_VIDEOS) continue; // Skip unmapped videos in strict production
        }

        courseVideos++;
        const lesson = {
          id: `yt-${yt.youtubeId || Buffer.from(yt.title).toString('hex').substring(0, 12)}`,
          name: yt.originalFilename || `${yt.title}.mp4`,
          title: yt.title,
          fileType: 'video',
          source: 'youtube',
          youtubeId: yt.youtubeId,
          youtubeThumbnail: yt.thumbnailUrl,
          duration: yt.duration || '25:00',
          isPendingUpload: !hasId,
        };

        const moduleName = yt.modulePath || 'Video Lectures';
        if (!modulesMap.has(moduleName)) {
          modulesMap.set(moduleName, {
            id: `mod-${Buffer.from(moduleName).toString('hex').substring(0, 12)}`,
            name: moduleName,
            lessons: [],
          });
        }
        modulesMap.get(moduleName).lessons.push(lesson);
      }

      // 3. Process Red Team Roadmap (Local Markdown snapshot)
      if (isRoadmap) {
        courseDocs++;
        rootLessons.push({
          id: 'roadmap-guide',
          name: 'Red Team Career & Operations Roadmap.md',
          title: 'Red Team Career & Operations Roadmap (Interactive)',
          fileType: 'markdown',
          source: 'local_markdown',
          description: 'Live interactive roadmap tracking every offensive security milestone with native progress persistence.',
        });
      }

      // Convert modules map to sorted array
      const modules = Array.from(modulesMap.values()).map((m, idx) => {
        // Sort lessons inside module
        m.lessons.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
        return {
          ...m,
          order: idx + 1,
        };
      });

      const totalLessons = rootLessons.length + modules.reduce((acc, m) => acc + m.lessons.length, 0);

      const catalogCourse = {
        slug: courseSlug,
        title: courseConfig.title,
        trackId: track.id,
        trackTitle: track.title,
        trackAccent: track.accent,
        description: courseConfig.description,
        accentColor: courseConfig.accentColor,
        recommendedStep: courseConfig.recommendedStep,
        tags: courseConfig.tags,
        driveFolderId: courseConfig.driveFolderId,
        r2Prefix: prefix,
        isRoadmap,
        modules,
        rootLessons,
        stats: {
          videos: courseVideos,
          pdfs: coursePdfs,
          labs: courseLabs,
          docs: courseDocs,
          totalSize: courseBytes,
          formattedTotalSize: formatSize(courseBytes),
        },
        totalLessons,
        pendingVideoCount: pendingVideos,
      };

      coursesMap[courseSlug] = catalogCourse;
      trackCourses.push(catalogCourse);

      grandTotalLessons += totalLessons;
      grandTotalVideos += courseVideos;
      grandTotalPdfs += coursePdfs;
      grandTotalLabs += courseLabs;
      grandTotalDocs += courseDocs;
      grandTotalBytes += courseBytes;
    }

    tracksList.push({
      ...track,
      courses: trackCourses,
    });
  }

  // If no R2 objects were found because R2 has not been migrated yet,
  // load the rich starter catalog so the frontend renders all PDFs and labs immediately!
  if (r2Objects.length === 0) {
    console.log('ℹ️ Generating rich starter catalog from offline library seed...');
    const starterSeed = JSON.parse(fs.readFileSync(path.join(__dirname, 'starter-catalog-seed.json'), 'utf8'));
    writeManifest(starterSeed);
    return;
  }

  const manifest = {
    version: '2.0.0',
    generatedAt: new Date().toISOString(),
    totalTracks: tracksList.length,
    totalCourses: ALL_SOURCE_COURSES.length,
    totalLessons: grandTotalLessons,
    totalVideos: grandTotalVideos,
    totalPdfs: grandTotalPdfs,
    totalLabs: grandTotalLabs,
    totalDocs: grandTotalDocs,
    totalSizeBytes: grandTotalBytes,
    formattedTotalSize: formatSize(grandTotalBytes),
    tracks: tracksList,
    courses: coursesMap,
  };

  writeManifest(manifest);
}

function writeManifest(manifest) {
  const outputPath = path.join(__dirname, '..', 'src', 'data', 'catalog.json');
  fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`\n=============================================================================`);
  console.log(`🎉 UNIFIED CATALOG COMPILED SUCCESSFULLY!`);
  console.log(`   • Total Tracks:         ${manifest.totalTracks}`);
  console.log(`   • Total Courses:        ${manifest.totalCourses}`);
  console.log(`   • Total Lessons:        ${manifest.totalLessons}`);
  console.log(`   • Total Videos:         ${manifest.totalVideos}`);
  console.log(`   • Total PDFs & Books:   ${manifest.totalPdfs}`);
  console.log(`   • Total Lab Files:      ${manifest.totalLabs}`);
  console.log(`   • Output Manifest:      ${outputPath}`);
  console.log(`=============================================================================\n`);
}

function generateStarterCatalog(tracksList, coursesMap) {
  // Rich pre-populated starter dataset covering all courses with R2 + YouTube mappings
  const starterData = JSON.parse(fs.readFileSync(path.join(__dirname, 'starter-catalog-seed.json'), 'utf8'));
  return starterData;
}

main().catch(console.error);
