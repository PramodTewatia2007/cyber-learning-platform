import driveAssetsRaw from '../data/drive_assets.json';
import videoLinksRaw from '../data/video_links.json';
import { CatalogCourse, CourseModule, CourseStats, FileType, LessonItem, SearchResultItem, TrackConfig } from '../types';

// Types for raw inputs
interface RawDriveItem {
  category: string;
  course: string;
  subfolder: string;
  title: string;
  filename: string;
  type: string;
  file_id: string;
  view_url: string;
  embed_url: string;
  download_url: string;
  content?: string;
}

interface RawVideoItem {
  title: string;
  filename: string;
  size_mb?: number;
  duration_min?: number;
  file_id: string;
  view_url: string;
  embed_url: string;
}

type NestedDriveData = Record<string, Record<string, Record<string, RawDriveItem[]>>>;
type NestedVideoData = Record<string, Record<string, Record<string, RawVideoItem[]>>>;

const driveData = driveAssetsRaw as unknown as NestedDriveData;
const videoData = videoLinksRaw as unknown as NestedVideoData;

/**
 * Strips leading @ECS-, @Ecs-, or @Ecs prefixes and trims whitespace
 */
export function cleanDisplayTitle(title: string): string {
  if (!title) return '';
  return title
    .replace(/^@ecs[-_\s]*/i, '')
    .trim();
}

/**
 * Filter out junk files containing 'Followformore' (case-insensitive)
 */
export function isJunkFile(item: { filename?: string; title?: string }): boolean {
  const filename = item.filename || '';
  const title = item.title || '';
  return /followformore/i.test(filename) || /followformore/i.test(title);
}

/**
 * Natural numeric sorting for modules and lessons (e.g. 1, 2, 10)
 */
export function naturalSort(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

/**
 * Normalized key used to match .srt subtitles with video files in the same subfolder
 */
export function normalizeForSubtitleMatch(str: string): string {
  if (!str) return '';
  return cleanDisplayTitle(str)
    .replace(/\.[^/.]+$/, '') // strip file extension
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Assigns standardized FileType based on item attributes
 */
export function classifyLessonType(item: { type?: string; filename?: string }, isVideo: boolean): FileType {
  if (isVideo) return 'video';
  const type = (item.type || '').toLowerCase();
  const filename = (item.filename || '').toLowerCase();

  if (type === 'pdf' || filename.endsWith('.pdf')) return 'pdf';
  if (type === 'markdown' || filename.endsWith('.md')) return 'markdown';
  if (type === 'lab_download' || /\.(zip|ova|iso|vmdk|tar\.gz|7z)$/i.test(filename)) return 'lab';
  return 'note';
}

interface CourseDefinition {
  slug: string;
  title: string;
  category: string;
  courseName: string;
  description: string;
  recommendedStep: number;
}

interface TrackDefinition {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  accent: string;
  icon: string;
  step: number;
  courses: CourseDefinition[];
}

/**
 * 7 Tracks ordered strictly by Recommended Learning Order
 */
const TRACK_DEFINITIONS: TrackDefinition[] = [
  {
    id: 'track-1-fundamentals',
    slug: 'fundamentals',
    title: 'Cybersecurity Fundamentals',
    subtitle: 'Core principles, networking architectures, threat modeling & security hygiene',
    accent: '#10B981',
    icon: 'Shield',
    step: 1,
    courses: [
      {
        slug: 'cybersecurity-fundamentals',
        title: 'Cybersecurity Basics – Foundation Notes',
        category: '3. Cybersecurity Fundamentals',
        courseName: 'Cybersecurity Basics - Foundation Notes',
        description: 'Comprehensive foundation covering OSI models, TCP/IP handshakes, symmetric & asymmetric cryptography, attack vectors, and defensive controls.',
        recommendedStep: 1,
      },
    ],
  },
  {
    id: 'track-2-ethical-hacking',
    slug: 'ethical-hacking',
    title: 'Learn Ethical Hacking from Scratch',
    subtitle: 'Offensive security operations, adversary emulation, exploit development, and penetration testing',
    accent: '#EF4444',
    icon: 'Terminal',
    step: 2,
    courses: [
      {
        slug: 'ethical-hacking-scratch',
        title: 'Learn Ethical Hacking from Scratch',
        category: '1. Red Team & Ethical Hacking',
        courseName: 'Learn Ethical Hacking from Scratch',
        description: 'Complete hands-on ethical hacking course with video masterclasses, labs, and matched subtitles.',
        recommendedStep: 2,
      },
    ],
  },
  {
    id: 'track-3-roadmap',
    slug: 'roadmap',
    title: 'Red Team Operations Roadmap',
    subtitle: 'Interactive offensive security curriculum and career roadmap tracking C2 frameworks, Active Directory dominance, and adversary emulation',
    accent: '#F87171',
    icon: 'Flame',
    step: 3,
    courses: [
      {
        slug: 'red-team-roadmap',
        title: 'Red Team Roadmap',
        category: '1. Red Team & Ethical Hacking',
        courseName: 'Root',
        description: 'Comprehensive offensive security roadmap with interactive milestones, frameworks, and job skill breakdowns.',
        recommendedStep: 3,
      },
    ],
  },
  {
    id: 'track-4-ceh',
    slug: 'ceh',
    title: 'EC-Council CEH Resources',
    subtitle: 'Certified Ethical Hacker complete study curriculum: official study materials, practical labs, notes, and video lectures',
    accent: '#F59E0B',
    icon: 'Award',
    step: 4,
    courses: [
      {
        slug: 'ceh-study-materials',
        title: 'CEH Study Materials',
        category: '2. EC-Council CEH Resources',
        courseName: 'CEH Study Materials',
        description: 'Official candidate study guides, module breakdown books, exam objectives, and theoretical deep dives.',
        recommendedStep: 4,
      },
      {
        slug: 'ceh-labs',
        title: 'CEH Labs & Practical Resources',
        category: '2. EC-Council CEH Resources',
        courseName: 'Labs & Practical Resources',
        description: 'Hands-on lab exercises, vulnerable challenge setups, lab manuals, and practical scenarios.',
        recommendedStep: 4,
      },
      {
        slug: 'ceh-notes',
        title: 'CEH Notes',
        category: '2. EC-Council CEH Resources',
        courseName: 'Notes',
        description: 'High-yield quick reference sheets, exam cram notes, port references, and methodology cheat sheets.',
        recommendedStep: 4,
      },
      {
        slug: 'ceh-video-lectures',
        title: 'CEH Video Lectures',
        category: '2. EC-Council CEH Resources',
        courseName: 'Video Lectures',
        description: 'Full chapter-by-chapter video masterclasses covering scanning, system hacking, social engineering, web attacks, and cryptography.',
        recommendedStep: 4,
      },
    ],
  },
  {
    id: 'track-5-red-team',
    slug: 'red-team-resources',
    title: 'Red Team Resources',
    subtitle: 'Curated toolkits, adversary emulation cheat sheets, payload delivery techniques, and red team playbooks',
    accent: '#DC2626',
    icon: 'Terminal',
    step: 5,
    courses: [
      {
        slug: 'red-team-resources',
        title: 'Red Team Resources',
        category: '1. Red Team & Ethical Hacking',
        courseName: 'Red Team Resources',
        description: 'Deep-dive exploitation toolkits, post-exploitation scripts, Cobalt Strike profiles, and lateral movement tradecraft guides.',
        recommendedStep: 5,
      },
    ],
  },
  {
    id: 'track-6-offsec',
    slug: 'offsec',
    title: 'Offensive Security (OffSec)',
    subtitle: 'Advanced penetration testing, OSCP preparation guides, buffer overflow manuals, and privilege escalation methodologies',
    accent: '#8B5CF6',
    icon: 'Flame',
    step: 6,
    courses: [
      {
        slug: 'offsec-resources',
        title: 'OffSec Resources',
        category: '6. Offensive Security (OffSec)',
        courseName: 'OffSec Resources',
        description: 'Offensive Security penetration testing with Kali Linux (PWK), buffer overflow guides, and active directory exploitation manuals.',
        recommendedStep: 6,
      },
    ],
  },
  {
    id: 'track-7-blue-team-soc',
    slug: 'blue-team-soc',
    title: 'Blue Team & SOC Resources',
    subtitle: 'Defensive engineering, network security monitoring handbooks, SIEM log analysis, and SOC analyst playbooks',
    accent: '#06B6D4',
    icon: 'Shield',
    step: 7,
    courses: [
      {
        slug: 'blue-team-books',
        title: 'Blue Team Kit – Books',
        category: '4. Blue Team Resources',
        courseName: 'Blue Team Kit - Books',
        description: 'Defensive architecture books, network security monitoring handbooks, and incident response playbooks for SOC analysts.',
        recommendedStep: 7,
      },
      {
        slug: 'soc-resources',
        title: 'SOC Resources',
        category: '5. SOC (Security Operations Center)',
        courseName: 'SOC Resources',
        description: 'Enterprise SOC architecture, Splunk/ELK query templates, alert triage matrices, and blue team defense guides.',
        recommendedStep: 7,
      },
    ],
  },
];

/**
 * Merges video_links.json and drive_assets.json for a given course
 */
function compileModulesForCourse(category: string, courseName: string, courseSlug: string): CourseModule[] {
  const driveSubfolders = driveData[category]?.[courseName] || {};
  const videoSubfolders = videoData[category]?.[courseName] || {};

  const allSubfolderNames = Array.from(
    new Set([...Object.keys(driveSubfolders), ...Object.keys(videoSubfolders)])
  ).sort(naturalSort);

  const modules: CourseModule[] = [];

  for (let idx = 0; idx < allSubfolderNames.length; idx++) {
    const subName = allSubfolderNames[idx];

    const rawDriveItems = (driveSubfolders[subName] || []).filter((item) => !isJunkFile(item));
    const rawVideoItems = (videoSubfolders[subName] || []).filter((item) => !isJunkFile(item));

    // 1. Build .srt subtitle map for this module (do NOT show as standalone lesson)
    const srtMap = new Map<string, string>();
    for (const d of rawDriveItems) {
      if (
        (d.filename && d.filename.toLowerCase().endsWith('.srt')) ||
        (d.type === 'document' && /\.srt$/i.test(d.filename || ''))
      ) {
        const key = normalizeForSubtitleMatch(d.title || d.filename);
        if (key) {
          srtMap.set(key, d.download_url || d.view_url);
        }
      }
    }

    const mergedLessons: LessonItem[] = [];

    // 2. Process video items from video_links.json
    for (const v of rawVideoItems) {
      const matchKey = normalizeForSubtitleMatch(v.title || v.filename);
      const subtitleUrl = srtMap.get(matchKey);
      const displayTitle = cleanDisplayTitle(v.title || v.filename);

      mergedLessons.push({
        id: v.file_id,
        fileId: v.file_id,
        name: v.filename || v.title,
        title: displayTitle,
        displayTitle,
        moduleName: cleanDisplayTitle(subName),
        fileType: 'video',
        source: 'gdrive',
        view_url: v.view_url,
        embed_url: v.embed_url,
        download_url: v.view_url,
        downloadUrl: v.view_url,
        previewUrl: v.embed_url,
        size_mb: typeof v.size_mb === 'number' ? v.size_mb : undefined,
        formattedSize: typeof v.size_mb === 'number' ? `${v.size_mb} MB` : undefined,
        duration_min: typeof v.duration_min === 'number' && v.duration_min > 0 ? v.duration_min : undefined,
        duration: typeof v.duration_min === 'number' && v.duration_min > 0 ? `${v.duration_min} min` : undefined,
        subtitleUrl,
      });
    }

    // 3. Process drive items (skip .srt files)
    for (const d of rawDriveItems) {
      if (d.filename && d.filename.toLowerCase().endsWith('.srt')) continue;

      const fType = classifyLessonType(d, false);
      const displayTitle = cleanDisplayTitle(d.title || d.filename);

      mergedLessons.push({
        id: d.file_id,
        fileId: d.file_id,
        name: d.filename || d.title,
        title: displayTitle,
        displayTitle,
        moduleName: cleanDisplayTitle(subName),
        fileType: fType,
        source: fType === 'markdown' ? 'markdown' : 'gdrive',
        view_url: d.view_url,
        embed_url: d.embed_url,
        download_url: d.download_url || d.view_url,
        downloadUrl: d.download_url || d.view_url,
        previewUrl: d.embed_url,
        content: d.content || undefined,
      });
    }

    // Sort lessons within module naturally by displayTitle
    mergedLessons.sort((a, b) => naturalSort(a.displayTitle || a.title, b.displayTitle || b.title));

    modules.push({
      id: `mod-${courseSlug}-${idx + 1}`,
      name: cleanDisplayTitle(subName),
      order: idx + 1,
      lessons: mergedLessons,
    });
  }

  return modules;
}

// In-memory compiled cache
let cachedCatalog: {
  tracks: TrackConfig[];
  courses: Record<string, CatalogCourse>;
} | null = null;

function computeCatalog() {
  if (cachedCatalog) return cachedCatalog;

  const coursesMap: Record<string, CatalogCourse> = {};
  const tracksList: TrackConfig[] = [];

  for (const trackDef of TRACK_DEFINITIONS) {
    const trackCourses: CatalogCourse[] = [];

    for (const courseDef of trackDef.courses) {
      const modules = compileModulesForCourse(courseDef.category, courseDef.courseName, courseDef.slug);

      let videoCount = 0;
      let pdfCount = 0;
      let labCount = 0;
      let docCount = 0;

      modules.forEach((mod) => {
        mod.lessons.forEach((l) => {
          if (l.fileType === 'video') videoCount++;
          else if (l.fileType === 'pdf') pdfCount++;
          else if (l.fileType === 'lab') labCount++;
          else docCount++;
        });
      });

      const totalLessons = videoCount + pdfCount + labCount + docCount;

      const stats: CourseStats = {
        videos: videoCount,
        pdfs: pdfCount,
        labs: labCount,
        docs: docCount,
      };

      const courseObj: CatalogCourse = {
        id: `course-${courseDef.slug}`,
        slug: courseDef.slug,
        title: courseDef.title,
        trackId: trackDef.id,
        trackTitle: trackDef.title,
        trackAccent: trackDef.accent,
        description: courseDef.description,
        accentColor: trackDef.accent,
        sourceType: 'gdrive_folder',
        recommendedStep: courseDef.recommendedStep,
        isPublished: true,
        isRoadmap: courseDef.slug === 'red-team-roadmap',
        modules,
        rootLessons: [],
        stats,
        totalLessons,
      };

      coursesMap[courseDef.slug] = courseObj;

      // Handle aliases (e.g. ceh-labs-practical -> ceh-labs)
      if (courseDef.slug === 'ceh-labs') {
        coursesMap['ceh-labs-practical'] = {
          ...courseObj,
          slug: 'ceh-labs-practical',
        };
      }

      trackCourses.push(courseObj);
    }

    tracksList.push({
      id: trackDef.id,
      slug: trackDef.slug,
      title: trackDef.title,
      subtitle: trackDef.subtitle,
      accent: trackDef.accent,
      accentBg: `${trackDef.accent}15`,
      borderAccent: `${trackDef.accent}30`,
      icon: trackDef.icon,
      courses: trackCourses,
    });
  }

  cachedCatalog = {
    tracks: tracksList,
    courses: coursesMap,
  };

  return cachedCatalog;
}

export function getUnifiedCatalog() {
  return computeCatalog();
}

export function getAllTracks(): TrackConfig[] {
  return computeCatalog().tracks;
}

export function getAllCourses(): CatalogCourse[] {
  return Object.values(computeCatalog().courses);
}

export function getCourseBySlug(slug: string): CatalogCourse | undefined {
  return computeCatalog().courses[slug];
}

export function searchCatalog(query: string): SearchResultItem[] {
  const q = (query || '').trim().toLowerCase();
  if (!q) return [];

  const catalog = computeCatalog();
  const results: SearchResultItem[] = [];

  for (const course of Object.values(catalog.courses)) {
    if (course.title.toLowerCase().includes(q) || course.description.toLowerCase().includes(q)) {
      results.push({
        id: `course-${course.slug}`,
        title: course.title,
        type: 'course',
        courseSlug: course.slug,
        courseTitle: course.title,
        trackTitle: course.trackTitle,
        accent: course.trackAccent,
        snippet: course.description,
      });
    }

    for (const mod of course.modules) {
      for (const lesson of mod.lessons) {
        if (lesson.title.toLowerCase().includes(q) || lesson.name.toLowerCase().includes(q)) {
          results.push({
            id: lesson.id,
            title: lesson.title,
            type: 'lesson',
            fileType: lesson.fileType,
            source: lesson.source,
            courseSlug: course.slug,
            courseTitle: course.title,
            trackTitle: course.trackTitle,
            accent: course.trackAccent,
            snippet: `${lesson.fileType.toUpperCase()} • ${lesson.moduleName}`,
          });
        }
      }
    }
  }

  return results.slice(0, 30);
}
