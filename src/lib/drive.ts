import { CourseTree, CourseModule, DriveFile, FileType, CourseStats } from '@/types';
import { MOCK_CATALOG } from '@/lib/mockData';
import { ALL_COURSES, getCourseBySlug } from '@/config/sources';

interface GoogleDriveApiFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  webViewLink?: string;
  iconLink?: string;
}

interface GoogleDriveListResponse {
  files?: GoogleDriveApiFile[];
  nextPageToken?: string;
  error?: {
    code: number;
    message: string;
    errors?: Array<{ message: string; reason: string }>;
  };
}

// In-memory cache for folder trees to minimize API hits
const memoryCache = new Map<string, { data: CourseTree; expiresAt: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export function isDriveConfigured(): boolean {
  const key = process.env.GOOGLE_DRIVE_API_KEY;
  return Boolean(key && key.trim() !== '' && key !== 'your_google_drive_api_key_here');
}

export function formatFileSize(bytes?: number): string {
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

export function classifyFileType(mimeType: string, filename: string): FileType {
  const lowerMime = (mimeType || '').toLowerCase();
  const lowerName = (filename || '').toLowerCase();

  // Video
  if (
    lowerMime.startsWith('video/') ||
    lowerName.endsWith('.mp4') ||
    lowerName.endsWith('.mkv') ||
    lowerName.endsWith('.webm') ||
    lowerName.endsWith('.mov') ||
    lowerName.endsWith('.avi')
  ) {
    return 'video';
  }

  // PDF
  if (lowerMime === 'application/pdf' || lowerName.endsWith('.pdf')) {
    return 'pdf';
  }

  // Markdown
  if (
    lowerMime === 'text/markdown' ||
    lowerMime === 'text/x-markdown' ||
    lowerName.endsWith('.md') ||
    lowerName.endsWith('.markdown')
  ) {
    return 'markdown';
  }

  // Labs / Archives / Virtual Machines
  if (
    lowerName.endsWith('.zip') ||
    lowerName.endsWith('.ova') ||
    lowerName.endsWith('.iso') ||
    lowerName.endsWith('.vmdk') ||
    lowerName.endsWith('.tar.gz') ||
    lowerName.endsWith('.tgz') ||
    lowerName.endsWith('.7z') ||
    lowerName.endsWith('.rar') ||
    lowerName.endsWith('.pcap') ||
    lowerName.endsWith('.pcapng')
  ) {
    return 'lab';
  }

  // Presentations
  if (
    lowerMime === 'application/vnd.google-apps.presentation' ||
    lowerName.endsWith('.pptx') ||
    lowerName.endsWith('.ppt')
  ) {
    return 'presentation';
  }

  // Spreadsheets
  if (
    lowerMime === 'application/vnd.google-apps.spreadsheet' ||
    lowerName.endsWith('.xlsx') ||
    lowerName.endsWith('.xls') ||
    lowerName.endsWith('.csv')
  ) {
    return 'spreadsheet';
  }

  // Documents
  if (
    lowerMime === 'application/vnd.google-apps.document' ||
    lowerMime === 'text/plain' ||
    lowerName.endsWith('.docx') ||
    lowerName.endsWith('.doc') ||
    lowerName.endsWith('.txt') ||
    lowerName.endsWith('.rtf')
  ) {
    return 'document';
  }

  // Images
  if (lowerMime.startsWith('image/')) {
    return 'image';
  }

  // Audio
  if (lowerMime.startsWith('audio/')) {
    return 'audio';
  }

  return 'document';
}

function normalizeDriveFile(raw: GoogleDriveApiFile): DriveFile {
  const sizeNum = raw.size ? parseInt(raw.size, 10) : undefined;
  return {
    id: raw.id,
    name: raw.name,
    mimeType: raw.mimeType,
    size: sizeNum,
    formattedSize: formatFileSize(sizeNum),
    modifiedTime: raw.modifiedTime,
    fileType: classifyFileType(raw.mimeType, raw.name),
    iconLink: raw.iconLink,
  };
}

async function fetchGoogleDriveFolder(folderId: string, apiKey: string): Promise<GoogleDriveApiFile[]> {
  const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
  const fields = encodeURIComponent('files(id,name,mimeType,size,modifiedTime,webViewLink,iconLink)');
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&key=${apiKey}&pageSize=1000&orderBy=folder,name`;

  const res = await fetch(url, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Google Drive API returned status ${res.status}: ${errorText}`);
  }

  const json: GoogleDriveListResponse = await res.json();
  if (json.error) {
    throw new Error(`Google Drive API error ${json.error.code}: ${json.error.message}`);
  }

  return json.files || [];
}

async function buildFolderTreeRecursive(
  folderId: string,
  apiKey: string,
  depth = 0,
  maxDepth = 3
): Promise<{ files: DriveFile[]; submodules: CourseModule[] }> {
  if (depth > maxDepth) {
    return { files: [], submodules: [] };
  }

  const items = await fetchGoogleDriveFolder(folderId, apiKey);
  const files: DriveFile[] = [];
  const submodules: CourseModule[] = [];

  for (const item of items) {
    if (item.mimeType === 'application/vnd.google-apps.folder') {
      const children = await buildFolderTreeRecursive(item.id, apiKey, depth + 1, maxDepth);
      submodules.push({
        id: item.id,
        name: item.name,
        folderId: item.id,
        files: children.files,
        submodules: children.submodules,
      });
    } else {
      files.push(normalizeDriveFile(item));
    }
  }

  return { files, submodules };
}

function calculateTreeStats(modules: CourseModule[], rootFiles: DriveFile[]): CourseStats {
  const stats: CourseStats = {
    videos: 0,
    pdfs: 0,
    labs: 0,
    docs: 0,
    others: 0,
  };

  const countFile = (file: DriveFile) => {
    switch (file.fileType) {
      case 'video':
        stats.videos++;
        break;
      case 'pdf':
        stats.pdfs++;
        break;
      case 'lab':
      case 'archive':
        stats.labs++;
        break;
      case 'document':
      case 'markdown':
      case 'presentation':
      case 'spreadsheet':
        stats.docs++;
        break;
      default:
        stats.others++;
        break;
    }
  };

  rootFiles.forEach(countFile);

  const traverseModule = (mod: CourseModule) => {
    mod.files.forEach(countFile);
    if (mod.submodules) {
      mod.submodules.forEach(traverseModule);
    }
  };

  modules.forEach(traverseModule);
  return stats;
}

function countTotalFiles(modules: CourseModule[], rootFiles: DriveFile[]): number {
  let count = rootFiles.length;
  const traverse = (mod: CourseModule) => {
    count += mod.files.length;
    if (mod.submodules) {
      mod.submodules.forEach(traverse);
    }
  };
  modules.forEach(traverse);
  return count;
}

export async function getCourseCatalogTree(courseSlug: string): Promise<CourseTree> {
  const course = getCourseBySlug(courseSlug);
  if (!course) {
    throw new Error(`Unknown course slug: ${courseSlug}`);
  }

  // GitHub Markdown Roadmaps don't need Google Drive
  if (course.sourceType === 'github_markdown') {
    return {
      courseSlug: course.slug,
      courseTitle: course.title,
      isExternalMarkdown: true,
      markdownSourceUrl: course.githubRawUrl,
      modules: [],
      rootFiles: [],
      totalFiles: 1,
      stats: { videos: 0, pdfs: 0, labs: 0, docs: 1, others: 0 },
      isMock: false,
    };
  }

  // Check cache first
  const cacheKey = `tree-${courseSlug}-${course.folderId}`;
  const cached = memoryCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const apiKey = process.env.GOOGLE_DRIVE_API_KEY;

  // If no API key configured or fallback is needed, return mock catalog
  if (!apiKey || apiKey === 'your_google_drive_api_key_here') {
    const fallback = MOCK_CATALOG[courseSlug] || generateGenericMockCourse(courseSlug, course.title, course.folderId);
    return fallback;
  }

  try {
    const { files: rootFiles, submodules } = await buildFolderTreeRecursive(course.folderId!, apiKey);
    const stats = calculateTreeStats(submodules, rootFiles);
    const totalFiles = countTotalFiles(submodules, rootFiles);

    const result: CourseTree = {
      courseSlug: course.slug,
      courseTitle: course.title,
      rootFolderId: course.folderId,
      modules: submodules,
      rootFiles,
      totalFiles,
      stats,
      lastSynced: new Date().toISOString(),
      isMock: false,
    };

    memoryCache.set(cacheKey, {
      data: result,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return result;
  } catch (error) {
    console.warn(`[DriveSync] Error fetching live Drive data for ${courseSlug}, falling back to mock:`, error);
    const fallback = MOCK_CATALOG[courseSlug] || generateGenericMockCourse(courseSlug, course.title, course.folderId);
    return fallback;
  }
}

export async function getAllCatalogTrees(): Promise<Record<string, CourseTree>> {
  const result: Record<string, CourseTree> = {};

  for (const course of ALL_COURSES) {
    try {
      result[course.slug] = await getCourseCatalogTree(course.slug);
    } catch (err) {
      console.error(`Failed to load tree for ${course.slug}:`, err);
      result[course.slug] = MOCK_CATALOG[course.slug] || generateGenericMockCourse(course.slug, course.title, course.folderId);
    }
  }

  return result;
}

export function generateGenericMockCourse(slug: string, title: string, folderId?: string): CourseTree {
  return {
    courseSlug: slug,
    courseTitle: title,
    rootFolderId: folderId,
    totalFiles: 6,
    isMock: true,
    stats: { videos: 2, pdfs: 2, labs: 1, docs: 1, others: 0 },
    rootFiles: [
      {
        id: `${slug}-overview`,
        name: `00 - ${title} Overview.pdf`,
        mimeType: 'application/pdf',
        size: 3200000,
        formattedSize: '3.1 MB',
        modifiedTime: new Date().toISOString(),
        fileType: 'pdf',
        description: 'Comprehensive course overview and syllabus.',
      },
    ],
    modules: [
      {
        id: `${slug}-mod-1`,
        name: 'Module 01: Core Theory & Architecture',
        files: [
          {
            id: `${slug}-vid-1`,
            name: '1.1 Theoretical Framework & Threat Modeling.mp4',
            mimeType: 'video/mp4',
            size: 195000000,
            formattedSize: '186 MB',
            duration: '28:30',
            modifiedTime: new Date().toISOString(),
            fileType: 'video',
            description: 'In-depth conceptual lecture and architectural breakdown.',
          },
          {
            id: `${slug}-pdf-1`,
            name: 'Module 01 Study Notes & Standards.pdf',
            mimeType: 'application/pdf',
            size: 4500000,
            formattedSize: '4.3 MB',
            modifiedTime: new Date().toISOString(),
            fileType: 'pdf',
            description: 'Detailed study notes and reference material.',
          },
        ],
      },
      {
        id: `${slug}-mod-2`,
        name: 'Module 02: Hands-On Exercises & Labs',
        files: [
          {
            id: `${slug}-vid-2`,
            name: '2.1 Walkthrough: Practical Lab Demonstration.mp4',
            mimeType: 'video/mp4',
            size: 240000000,
            formattedSize: '228 MB',
            duration: '34:10',
            modifiedTime: new Date().toISOString(),
            fileType: 'video',
            description: 'Live terminal walk-through of the lab challenge.',
          },
          {
            id: `${slug}-lab-1`,
            name: `${slug}-Hands-On-Lab-Pack.zip`,
            mimeType: 'application/zip',
            size: 52000000,
            formattedSize: '49.6 MB',
            modifiedTime: new Date().toISOString(),
            fileType: 'lab',
            description: 'Practical challenge assets and exercise configs.',
          },
        ],
      },
    ],
  };
}
