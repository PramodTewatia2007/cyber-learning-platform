import driveDataRaw from '@/data/drive_assets.json';
import videoDataRaw from '@/data/video_links.json';
import youtubeLinksRaw from '@/data/youtube_links.json';
import {
  UnifiedLesson,
  LessonVideoItem,
  LessonPdfItem,
  LessonNoteItem,
  LessonLabItem,
  TrackMeta
} from '@/types';

type RawItem = {
  category?: string;
  course?: string;
  subfolder?: string;
  title: string;
  filename?: string;
  type?: string;
  file_id: string;
  view_url?: string;
  embed_url?: string;
  download_url?: string;
  size_mb?: number;
  duration_min?: number;
  content?: string;
};

type NestedData = Record<string, Record<string, Record<string, RawItem[]>>>;

const driveData = driveDataRaw as unknown as NestedData;
const videoData = videoDataRaw as unknown as NestedData;
const youtubeLinks = (youtubeLinksRaw || {}) as Record<string, string>;

export const CANONICAL_TRACK_CONFIGS = [
  {
    id: 'fundamentals',
    title: 'Cybersecurity Fundamentals',
    accent: '#10B981',
    description: 'Core concepts, SecOps fundamentals, incident response, network architecture, and defense.'
  },
  {
    id: 'ethical-hacking',
    title: 'Learn Ethical Hacking from Scratch',
    accent: '#EF4444',
    description: 'Comprehensive offensive security, network penetration, web app exploitation, and post-exploitation.'
  },
  {
    id: 'red-team-roadmap',
    title: 'Red Team Roadmap',
    accent: '#F97316',
    description: 'Interactive career curriculum and offensive security roadmap tracking C2 frameworks and adversary emulation.'
  },
  {
    id: 'ceh',
    title: 'EC-Council CEH',
    accent: '#F59E0B',
    description: 'Official Certified Ethical Hacker v13 theory, practical labs, scanning, and attack methodologies.'
  },
  {
    id: 'red-team-resources',
    title: 'Red Team Resources',
    accent: '#EC4899',
    description: 'Advanced adversary operations, Active Directory dominance, lateral movement, and persistence.'
  },
  {
    id: 'offsec',
    title: 'OffSec PEN-200',
    accent: '#8B5CF6',
    description: 'Offensive Security PWK curriculum, buffer overflow, client-side attacks, and challenge labs.'
  },
  {
    id: 'blue-team-soc',
    title: 'Blue Team & SOC',
    accent: '#06B6D4',
    description: 'Defensive playbooks, Splunk queries, memory forensics, SIEM architecture, and alert triage.'
  }
];

export function cleanDisplayTitle(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/^@ecs-?\s*/i, '')
    .replace(/\.(mp4|pdf|html|md|txt|zip|ova|iso|js|sh)$/i, '')
    .replace(/^CEHv13\s*-\s*/i, '')
    .replace(/^CEHv13\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeTitle(raw: string): string {
  return cleanDisplayTitle(raw).toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function isJunkFile(filenameOrTitle: string): boolean {
  if (!filenameOrTitle) return true;
  return /followformore/i.test(filenameOrTitle) || /\.srt$/i.test(filenameOrTitle);
}

function extractCehModuleNum(title: string): number | null {
  const m = title.match(/Module\s*0?(\d+)/i);
  return m ? parseInt(m[1], 10) : null;
}

function extractNumberInfo(title: string): { major: number; sub: number; isSub: boolean } | null {
  const mSub = title.match(/^0?(\d+)\.(\d+)/);
  if (mSub) {
    return {
      major: parseInt(mSub[1], 10),
      sub: parseFloat(`${mSub[1]}.${mSub[2]}`),
      isSub: true
    };
  }
  const mMaj = title.match(/^0?(\d+)[.\s-]+/);
  if (mMaj) {
    const num = parseInt(mMaj[1], 10);
    return { major: num, sub: num, isSub: false };
  }
  const mMod = title.match(/Module\s*0?(\d+)/i);
  if (mMod) {
    const num = parseInt(mMod[1], 10);
    return { major: num, sub: num, isSub: false };
  }
  return null;
}

function computeYoutubeRedirectUrl(
  video: RawItem,
  lessonTitle: string,
  trackTitle: string,
  attachedNotes: RawItem[]
): string {
  // 1. Exact match in youtube_links.json
  if (video.file_id && youtubeLinks[video.file_id]) {
    return youtubeLinks[video.file_id];
  }
  const cleanVTitle = cleanDisplayTitle(video.title);
  if (cleanVTitle && youtubeLinks[cleanVTitle]) {
    return youtubeLinks[cleanVTitle];
  }
  if (lessonTitle && youtubeLinks[lessonTitle]) {
    return youtubeLinks[lessonTitle];
  }

  // 2. Direct YouTube link from any attached note content
  for (const note of attachedNotes) {
    if (note.content) {
      const match = note.content.match(
        /https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=[\w-]+|youtu\.be\/[\w-]+[^\s]*)/i
      );
      if (match) {
        return match[0];
      }
    }
  }

  // 3. Fallback: YouTube Search Redirect
  const searchKeywords = `${cleanVTitle || lessonTitle} ${trackTitle}`.trim();
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(searchKeywords)}`;
}

let cachedLessons: UnifiedLesson[] | null = null;

export function buildAllLessons(): UnifiedLesson[] {
  if (cachedLessons) return cachedLessons;

  const allLessons: UnifiedLesson[] = [];
  let globalOrder = 1;

  // --------------------------------------------------------------------------
  // TRACK 1: Cybersecurity Fundamentals
  // --------------------------------------------------------------------------
  const fundCategory = '3. Cybersecurity Fundamentals';
  const fundCourse = 'Cybersecurity Basics - Foundation Notes';
  const fundDrive = driveData[fundCategory]?.[fundCourse] || {};
  const fundVideos = videoData[fundCategory]?.[fundCourse] || {};

  const fundSubfolders = Array.from(
    new Set([...Object.keys(fundDrive), ...Object.keys(fundVideos)])
  ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  for (const sub of fundSubfolders) {
    const vids = fundVideos[sub] || [];
    const docs = fundDrive[sub] || [];
    const merged = mergeModuleItems(
      vids,
      docs,
      'fundamentals',
      'Cybersecurity Fundamentals',
      '#10B981',
      fundCourse,
      sub,
      globalOrder
    );
    allLessons.push(...merged);
    globalOrder += merged.length;
  }

  // --------------------------------------------------------------------------
  // TRACK 2: Learn Ethical Hacking from Scratch
  // --------------------------------------------------------------------------
  const ehCategory = '1. Red Team & Ethical Hacking';
  const ehCourse = 'Learn Ethical Hacking from Scratch';
  const ehDrive = driveData[ehCategory]?.[ehCourse] || {};
  const ehVideos = videoData[ehCategory]?.[ehCourse] || {};

  const ehSubfolders = Array.from(
    new Set([...Object.keys(ehDrive), ...Object.keys(ehVideos)])
  ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  for (const sub of ehSubfolders) {
    const vids = ehVideos[sub] || [];
    const docs = ehDrive[sub] || [];
    const merged = mergeModuleItems(
      vids,
      docs,
      'ethical-hacking',
      'Learn Ethical Hacking from Scratch',
      '#EF4444',
      ehCourse,
      sub,
      globalOrder
    );
    allLessons.push(...merged);
    globalOrder += merged.length;
  }

  // --------------------------------------------------------------------------
  // TRACK 3: Red Team Roadmap
  // --------------------------------------------------------------------------
  const roadmapRoot = driveData['1. Red Team & Ethical Hacking']?.['Root']?.['Root'] || [];
  const roadmapDoc = roadmapRoot.find(
    (d) => d.title.includes('Roadmap') || (d.filename && d.filename.includes('Roadmap'))
  );

  if (roadmapDoc) {
    allLessons.push({
      id: roadmapDoc.file_id || 'red-team-roadmap',
      trackId: 'red-team-roadmap',
      track: 'Red Team Roadmap',
      trackAccent: '#F97316',
      course: 'Red Team Roadmap',
      title: 'Red Team Operations Roadmap',
      order: globalOrder++,
      videos: [],
      pdfs: [],
      notes: [
        {
          file_id: roadmapDoc.file_id,
          title: roadmapDoc.title,
          clean_title: cleanDisplayTitle(roadmapDoc.title),
          filename: roadmapDoc.filename,
          content: roadmapDoc.content,
          type: 'markdown',
          view_url: roadmapDoc.view_url,
          embed_url: roadmapDoc.embed_url,
          download_url: roadmapDoc.download_url
        }
      ],
      labs: []
    });
  }

  // --------------------------------------------------------------------------
  // TRACK 4: EC-Council CEH
  // --------------------------------------------------------------------------
  const cehCategory = '2. EC-Council CEH Resources';
  const cehVideos = videoData[cehCategory]?.['CEH Study Materials'] || {};
  const cehPdfs = driveData[cehCategory]?.['Video Lectures']?.['Root'] || [];
  const cehNotes = driveData[cehCategory]?.['Notes']?.['Root'] || [];

  // Match Module 00 through Module 20
  for (let i = 0; i <= 20; i++) {
    const modStr = (i < 10 ? '0' : '') + i;

    const matchedPdf = cehPdfs.find((p) => extractCehModuleNum(p.title) === i);
    const matchedNotes = cehNotes.filter(
      (n) => extractCehModuleNum(n.title) === i && !isJunkFile(n.title)
    );
    const matchedVideos: RawItem[] = [];

    for (const folder of Object.keys(cehVideos)) {
      for (const v of cehVideos[folder]) {
        const vMod = extractCehModuleNum(v.title);
        const folderMod = extractCehModuleNum(folder);
        if (vMod === i || (folderMod === i && vMod === null)) {
          if (!isJunkFile(v.title)) {
            matchedVideos.push(v);
          }
        }
      }
    }

    if (matchedPdf || matchedNotes.length > 0 || matchedVideos.length > 0) {
      const primaryTitle = matchedPdf
        ? matchedPdf.title
        : matchedVideos[0]
        ? matchedVideos[0].title
        : matchedNotes[0]
        ? matchedNotes[0].title
        : `Module ${modStr}`;

      const cleanTitle = cleanDisplayTitle(primaryTitle);
      const primaryId =
        matchedVideos[0]?.file_id ||
        matchedPdf?.file_id ||
        matchedNotes[0]?.file_id ||
        `ceh-mod-${modStr}`;

      const lessonNotes = matchedNotes.map((n) => ({
        file_id: n.file_id,
        title: n.title,
        clean_title: cleanDisplayTitle(n.title),
        filename: n.filename,
        content: n.content,
        type: n.type,
        view_url: n.view_url,
        embed_url: n.embed_url,
        download_url: n.download_url
      }));

      const lessonVideos = matchedVideos.map((v) => ({
        file_id: v.file_id,
        title: v.title,
        clean_title: cleanDisplayTitle(v.title),
        filename: v.filename,
        size_mb: v.size_mb,
        duration_min: v.duration_min,
        embed_url: v.embed_url,
        view_url: v.view_url,
        download_url: v.download_url,
        youtubeRedirectUrl: computeYoutubeRedirectUrl(
          v,
          cleanTitle,
          'EC-Council CEH',
          matchedNotes
        )
      }));

      const lessonPdfs: LessonPdfItem[] = matchedPdf
        ? [
            {
              file_id: matchedPdf.file_id,
              title: matchedPdf.title,
              clean_title: cleanDisplayTitle(matchedPdf.title),
              filename: matchedPdf.filename,
              size_mb: matchedPdf.size_mb,
              view_url: matchedPdf.view_url,
              embed_url: matchedPdf.embed_url,
              download_url: matchedPdf.download_url
            }
          ]
        : [];

      const lessonLabs: LessonLabItem[] = [];
      const nonLabNotes: LessonNoteItem[] = [];

      for (const n of lessonNotes) {
        if (n.type === 'lab_download' || (n.filename && /\.(zip|ova|iso)$/i.test(n.filename))) {
          lessonLabs.push({
            file_id: n.file_id,
            title: n.title,
            clean_title: n.clean_title,
            filename: n.filename,
            type: n.type,
            view_url: n.view_url,
            download_url: n.download_url
          });
        } else {
          nonLabNotes.push(n);
        }
      }

      allLessons.push({
        id: primaryId,
        trackId: 'ceh',
        track: 'EC-Council CEH',
        trackAccent: '#F59E0B',
        course: 'CEH Study Materials',
        subfolder: `Module ${modStr}`,
        title: cleanTitle,
        order: globalOrder++,
        videos: lessonVideos,
        pdfs: lessonPdfs,
        notes: nonLabNotes,
        labs: lessonLabs
      });
    }
  }

  // Standalone CEH items (Appendix, Lab Manual, CEHv13 ISO)
  const standaloneCehPdfs = cehPdfs.filter((p) => !/Module\s*\d+/i.test(p.title));
  for (const p of standaloneCehPdfs) {
    if (isJunkFile(p.title)) continue;
    allLessons.push({
      id: p.file_id,
      trackId: 'ceh',
      track: 'EC-Council CEH',
      trackAccent: '#F59E0B',
      course: 'Video Lectures',
      title: cleanDisplayTitle(p.title),
      order: globalOrder++,
      videos: [],
      pdfs: [
        {
          file_id: p.file_id,
          title: p.title,
          clean_title: cleanDisplayTitle(p.title),
          filename: p.filename,
          size_mb: p.size_mb,
          view_url: p.view_url,
          embed_url: p.embed_url,
          download_url: p.download_url
        }
      ],
      notes: [],
      labs: []
    });
  }

  const standaloneCehNotes = cehNotes.filter((n) => !/Module\s*\d+/i.test(n.title));
  for (const n of standaloneCehNotes) {
    if (isJunkFile(n.title)) continue;
    const isLab = n.type === 'lab_download' || (n.filename && /\.(zip|ova|iso)$/i.test(n.filename));
    allLessons.push({
      id: n.file_id,
      trackId: 'ceh',
      track: 'EC-Council CEH',
      trackAccent: '#F59E0B',
      course: 'Notes',
      title: cleanDisplayTitle(n.title),
      order: globalOrder++,
      videos: [],
      pdfs: [],
      notes: isLab
        ? []
        : [
            {
              file_id: n.file_id,
              title: n.title,
              clean_title: cleanDisplayTitle(n.title),
              filename: n.filename,
              content: n.content,
              type: n.type,
              view_url: n.view_url,
              embed_url: n.embed_url,
              download_url: n.download_url
            }
          ],
      labs: isLab
        ? [
            {
              file_id: n.file_id,
              title: n.title,
              clean_title: cleanDisplayTitle(n.title),
              filename: n.filename,
              type: n.type,
              view_url: n.view_url,
              download_url: n.download_url
            }
          ]
        : []
    });
  }

  // CEH Practical Course
  const cehPracticalCourse = 'Labs & Practical Resources';
  const practicalDrive = driveData[cehCategory]?.[cehPracticalCourse] || {};
  const practicalVideos = videoData[cehCategory]?.[cehPracticalCourse] || {};
  const practicalSubs = Array.from(
    new Set([...Object.keys(practicalDrive), ...Object.keys(practicalVideos)])
  ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  for (const sub of practicalSubs) {
    const vids = practicalVideos[sub] || [];
    const docs = practicalDrive[sub] || [];
    const merged = mergeModuleItems(
      vids,
      docs,
      'ceh',
      'EC-Council CEH',
      '#F59E0B',
      cehPracticalCourse,
      sub,
      globalOrder
    );
    allLessons.push(...merged);
    globalOrder += merged.length;
  }

  // --------------------------------------------------------------------------
  // TRACK 5: Red Team Resources
  // --------------------------------------------------------------------------
  const rtCourse = 'Red Team Resources';
  const rtDrive = driveData['1. Red Team & Ethical Hacking']?.[rtCourse] || {};
  const rtVideos = videoData['1. Red Team & Ethical Hacking']?.[rtCourse] || {};

  const rtSubs = Array.from(
    new Set([...Object.keys(rtDrive), ...Object.keys(rtVideos)])
  ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  for (const sub of rtSubs) {
    const vids = rtVideos[sub] || [];
    const docs = rtDrive[sub] || [];
    const merged = mergeModuleItems(
      vids,
      docs,
      'red-team-resources',
      'Red Team Resources',
      '#EC4899',
      rtCourse,
      sub,
      globalOrder
    );
    allLessons.push(...merged);
    globalOrder += merged.length;
  }

  // --------------------------------------------------------------------------
  // TRACK 6: OffSec PEN-200
  // --------------------------------------------------------------------------
  const offCategory = '6. Offensive Security (OffSec)';
  const offCourse = 'OffSec Resources';
  const offDrive = driveData[offCategory]?.[offCourse] || {};
  const offVideos = videoData[offCategory]?.[offCourse] || {};

  const offSubs = Array.from(
    new Set([...Object.keys(offDrive), ...Object.keys(offVideos)])
  ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  for (const sub of offSubs) {
    const vids = offVideos[sub] || [];
    const docs = offDrive[sub] || [];
    const merged = mergeModuleItems(
      vids,
      docs,
      'offsec',
      'OffSec PEN-200',
      '#8B5CF6',
      offCourse,
      sub,
      globalOrder
    );
    allLessons.push(...merged);
    globalOrder += merged.length;
  }

  // --------------------------------------------------------------------------
  // TRACK 7: Blue Team & SOC
  // --------------------------------------------------------------------------
  // Blue Team Books
  const blueBooks = driveData['4. Blue Team Resources']?.['Blue Team Kit - Books']?.['Root'] || [];
  for (const b of blueBooks) {
    if (isJunkFile(b.title)) continue;
    allLessons.push({
      id: b.file_id,
      trackId: 'blue-team-soc',
      track: 'Blue Team & SOC',
      trackAccent: '#06B6D4',
      course: 'Blue Team Kit - Books',
      title: cleanDisplayTitle(b.title),
      order: globalOrder++,
      videos: [],
      pdfs: [
        {
          file_id: b.file_id,
          title: b.title,
          clean_title: cleanDisplayTitle(b.title),
          filename: b.filename,
          size_mb: b.size_mb,
          view_url: b.view_url,
          embed_url: b.embed_url,
          download_url: b.download_url
        }
      ],
      notes: [],
      labs: []
    });
  }

  // SOC Resources
  const socCategory = '5. SOC (Security Operations Center)';
  const socCourse = 'SOC Resources';
  const socDrive = driveData[socCategory]?.[socCourse] || {};
  const socVideos = videoData[socCategory]?.[socCourse] || {};

  const socSubs = Array.from(
    new Set([...Object.keys(socDrive), ...Object.keys(socVideos)])
  ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  for (const sub of socSubs) {
    const vids = socVideos[sub] || [];
    const docs = socDrive[sub] || [];
    const merged = mergeModuleItems(
      vids,
      docs,
      'blue-team-soc',
      'Blue Team & SOC',
      '#06B6D4',
      socCourse,
      sub,
      globalOrder
    );
    allLessons.push(...merged);
    globalOrder += merged.length;
  }

  cachedLessons = allLessons;
  return allLessons;
}

function mergeModuleItems(
  vids: RawItem[],
  docs: RawItem[],
  trackId: string,
  trackTitle: string,
  trackAccent: string,
  courseName: string,
  subfolderName: string,
  startOrder: number
): UnifiedLesson[] {
  const lessons: UnifiedLesson[] = [];
  const lessonByNorm = new Map<string, UnifiedLesson>();
  const lessonByMajor = new Map<number, UnifiedLesson>();

  // Collect any .srt subtitle files in this folder to attach to videos
  const subtitleMap = new Map<string, string>();
  for (const d of docs) {
    if (d.filename && d.filename.endsWith('.srt') && d.download_url) {
      subtitleMap.set(normalizeTitle(d.title || d.filename), d.download_url);
    }
  }

  // 1. Process all videos as prime lesson anchors
  let localOrder = startOrder;
  for (const v of vids) {
    if (isJunkFile(v.title || v.filename || '')) continue;
    const cTitle = cleanDisplayTitle(v.title);
    const nTitle = normalizeTitle(v.title);
    const num = extractNumberInfo(cTitle);

    const videoItem: LessonVideoItem = {
      file_id: v.file_id,
      title: v.title,
      clean_title: cTitle,
      filename: v.filename,
      size_mb: v.size_mb,
      duration_min: v.duration_min,
      embed_url: v.embed_url,
      view_url: v.view_url,
      download_url: v.download_url,
      youtubeRedirectUrl: computeYoutubeRedirectUrl(v, cTitle, trackTitle, []),
      subtitleUrl: subtitleMap.get(nTitle)
    };

    const lesson: UnifiedLesson = {
      id: v.file_id,
      trackId,
      track: trackTitle,
      trackAccent,
      course: courseName,
      subfolder: subfolderName,
      title: cTitle,
      order: localOrder++,
      videos: [videoItem],
      pdfs: [],
      notes: [],
      labs: []
    };

    lessons.push(lesson);
    lessonByNorm.set(nTitle, lesson);
    if (num && !num.isSub && !lessonByMajor.has(num.major)) {
      lessonByMajor.set(num.major, lesson);
    }
  }

  // 2. Process documents
  for (const d of docs) {
    if (isJunkFile(d.title || d.filename || '')) continue;
    const cTitle = cleanDisplayTitle(d.title || d.filename || '');
    const nTitle = normalizeTitle(d.title || d.filename || '');
    const num = extractNumberInfo(cTitle);

    const isPdf = d.type === 'pdf' || (d.filename && d.filename.endsWith('.pdf'));
    const isLab =
      d.type === 'lab_download' || (d.filename && /\.(zip|ova|iso)$/i.test(d.filename));

    // A. Check exact normalized match
    let target = lessonByNorm.get(nTitle);

    // B. Check numbered sub-resource match (e.g. 1.2 The lab -> major 1)
    if (!target && num && (num.isSub || lessonByMajor.has(num.major))) {
      target = lessonByMajor.get(num.major);
    }

    if (target) {
      if (isPdf) {
        target.pdfs.push({
          file_id: d.file_id,
          title: d.title,
          clean_title: cTitle,
          filename: d.filename,
          size_mb: d.size_mb,
          view_url: d.view_url,
          embed_url: d.embed_url,
          download_url: d.download_url
        });
      } else if (isLab) {
        target.labs.push({
          file_id: d.file_id,
          title: d.title,
          clean_title: cTitle,
          filename: d.filename,
          type: d.type,
          size_mb: d.size_mb,
          view_url: d.view_url,
          download_url: d.download_url
        });
      } else {
        const noteItem: LessonNoteItem = {
          file_id: d.file_id,
          title: d.title,
          clean_title: cTitle,
          filename: d.filename,
          content: d.content,
          is_url: Boolean(d.content && /^https?:\/\/[^\s\r\n]+$/.test(d.content.trim())),
          type: d.type,
          view_url: d.view_url,
          embed_url: d.embed_url,
          download_url: d.download_url
        };
        target.notes.push(noteItem);

        // Update video youtube redirect if note contains youtube link
        for (const v of target.videos) {
          v.youtubeRedirectUrl = computeYoutubeRedirectUrl(
            { file_id: v.file_id, title: v.title },
            target.title,
            trackTitle,
            target.notes
          );
        }
      }
      continue;
    }

    // C. Standalone item
    const standaloneLesson: UnifiedLesson = {
      id: d.file_id,
      trackId,
      track: trackTitle,
      trackAccent,
      course: courseName,
      subfolder: subfolderName,
      title: cTitle,
      order: localOrder++,
      videos: [],
      pdfs: isPdf
        ? [
            {
              file_id: d.file_id,
              title: d.title,
              clean_title: cTitle,
              filename: d.filename,
              size_mb: d.size_mb,
              view_url: d.view_url,
              embed_url: d.embed_url,
              download_url: d.download_url
            }
          ]
        : [],
      notes:
        !isPdf && !isLab
          ? [
              {
                file_id: d.file_id,
                title: d.title,
                clean_title: cTitle,
                filename: d.filename,
                content: d.content,
                is_url: Boolean(d.content && /^https?:\/\/[^\s\r\n]+$/.test(d.content.trim())),
                type: d.type,
                view_url: d.view_url,
                embed_url: d.embed_url,
                download_url: d.download_url
              }
            ]
          : [],
      labs: isLab
        ? [
            {
              file_id: d.file_id,
              title: d.title,
              clean_title: cTitle,
              filename: d.filename,
              type: d.type,
              size_mb: d.size_mb,
              view_url: d.view_url,
              download_url: d.download_url
            }
          ]
        : []
    };

    lessons.push(standaloneLesson);
    lessonByNorm.set(nTitle, standaloneLesson);
    if (num && !num.isSub && !lessonByMajor.has(num.major)) {
      lessonByMajor.set(num.major, standaloneLesson);
    }
  }

  return lessons;
}

export function getAllLessons(): UnifiedLesson[] {
  return buildAllLessons();
}

export function getLessonsByTrack(trackId: string): UnifiedLesson[] {
  const all = buildAllLessons();
  if (!trackId || trackId === 'all') return all;
  return all.filter((l) => l.trackId === trackId);
}

export function getLessonById(id: string): UnifiedLesson | undefined {
  const all = buildAllLessons();
  return all.find((l) => l.id === id);
}

export function getAllTracks(): TrackMeta[] {
  const all = buildAllLessons();
  return CANONICAL_TRACK_CONFIGS.map((cfg) => {
    const count = all.filter((l) => l.trackId === cfg.id).length;
    return {
      id: cfg.id,
      title: cfg.title,
      accent: cfg.accent,
      description: cfg.description,
      lessonCount: count
    };
  });
}

export function getLessonStats(): {
  totalLessons: number;
  totalVideos: number;
  totalPdfs: number;
  totalNotes: number;
  totalLabs: number;
} {
  const all = buildAllLessons();
  let totalVideos = 0;
  let totalPdfs = 0;
  let totalNotes = 0;
  let totalLabs = 0;

  for (const l of all) {
    totalVideos += l.videos.length;
    totalPdfs += l.pdfs.length;
    totalNotes += l.notes.length;
    totalLabs += l.labs.length;
  }

  return {
    totalLessons: all.length,
    totalVideos,
    totalPdfs,
    totalNotes,
    totalLabs
  };
}
