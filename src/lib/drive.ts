import { CourseModule, DriveFileItem, DriveFolderTree, FileType, LessonItem } from '@/types';

const GOOGLE_DRIVE_API_KEY = process.env.GOOGLE_DRIVE_API_KEY;

export function isDriveConfigured(): boolean {
  return Boolean(
    GOOGLE_DRIVE_API_KEY &&
    GOOGLE_DRIVE_API_KEY.trim() !== '' &&
    !GOOGLE_DRIVE_API_KEY.includes('your_google_drive_api_key')
  );
}

export function classifyDriveFileType(mimeType?: string, filename: string = ''): FileType {
  const m = (mimeType || '').toLowerCase();
  const f = filename.toLowerCase();

  if (m.startsWith('video/') || f.endsWith('.mp4') || f.endsWith('.mkv') || f.endsWith('.webm') || f.endsWith('.mov')) {
    return 'video';
  }
  if (m === 'application/pdf' || f.endsWith('.pdf')) {
    return 'pdf';
  }
  if (
    m.includes('word') ||
    m.includes('document') ||
    f.endsWith('.docx') ||
    f.endsWith('.doc') ||
    f.endsWith('.rtf')
  ) {
    return 'document';
  }
  if (
    m.includes('presentation') ||
    m.includes('powerpoint') ||
    f.endsWith('.pptx') ||
    f.endsWith('.ppt')
  ) {
    return 'presentation';
  }
  if (
    m.includes('spreadsheet') ||
    m.includes('excel') ||
    f.endsWith('.xlsx') ||
    f.endsWith('.xls') ||
    f.endsWith('.csv')
  ) {
    return 'spreadsheet';
  }
  if (
    m === 'text/markdown' ||
    f.endsWith('.md') ||
    f.endsWith('.markdown')
  ) {
    return 'markdown';
  }
  if (
    f.endsWith('.zip') ||
    f.endsWith('.ova') ||
    f.endsWith('.iso') ||
    f.endsWith('.vmdk') ||
    f.endsWith('.tar.gz') ||
    f.endsWith('.7z') ||
    f.endsWith('.pcap') ||
    f.endsWith('.pcapng')
  ) {
    return 'lab';
  }
  if (m.startsWith('image/') || f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.svg')) {
    return 'image';
  }
  if (m.startsWith('text/') || f.endsWith('.txt')) {
    return 'document';
  }

  return 'document';
}

export function formatBytes(bytes?: number): string {
  if (!bytes || isNaN(bytes)) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function getDrivePreviewUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

export function getDriveDownloadUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

export function getDriveFolderEmbedUrl(folderId: string): string {
  return `https://drive.google.com/embeddedfolderview?id=${folderId}#list`;
}

// In-memory cache for fast folder retrieval (revalidate: 3600)
interface CacheEntry {
  timestamp: number;
  data: CourseModule[];
}
const folderCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 3600 * 1000;

/**
 * Recursively fetches all files and subfolders from Google Drive API v3
 * and converts them into structured CourseModules with LessonItems.
 */
export async function getDriveCourseModules(folderId: string): Promise<CourseModule[]> {
  if (!isDriveConfigured() || !folderId) {
    return [];
  }

  // Check cache
  const cached = folderCache.get(folderId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const modules = await fetchFolderRecursive(folderId, 'Core Modules');
    folderCache.set(folderId, {
      timestamp: Date.now(),
      data: modules,
    });
    return modules;
  } catch (err) {
    console.warn(`[Google Drive API] Error indexing folder ${folderId}:`, err);
    return [];
  }
}

async function fetchFolderRecursive(
  folderId: string,
  moduleName: string,
  depth: number = 0,
  visited: Set<string> = new Set()
): Promise<CourseModule[]> {
  if (depth > 5 || visited.has(folderId)) return [];
  visited.add(folderId);

  const apiKey = GOOGLE_DRIVE_API_KEY;
  let pageToken: string | null = null;
  const currentLessons: LessonItem[] = [];
  const subModules: CourseModule[] = [];

  do {
    const url = new URL('https://www.googleapis.com/drive/v3/files');
    url.searchParams.set('q', `'${folderId}' in parents and trashed = false`);
    url.searchParams.set('fields', 'nextPageToken, files(id, name, mimeType, size, modifiedTime)');
    url.searchParams.set('pageSize', '1000');
    url.searchParams.set('key', apiKey!);
    if (pageToken) url.searchParams.set('pageToken', pageToken);

    const res = await fetch(url.toString(), {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`Drive API responded with status ${res.status}`);
    }

    const data = await res.json();
    const items = data.files || [];

    for (const item of items) {
      if (item.mimeType === 'application/vnd.google-apps.folder') {
        const nested = await fetchFolderRecursive(item.id, item.name, depth + 1, visited);
        subModules.push(...nested);
      } else {
        const fileType = classifyDriveFileType(item.mimeType, item.name);
        const sizeNum = item.size ? parseInt(item.size, 10) : undefined;

        currentLessons.push({
          id: `gdrive-${item.id}`,
          name: item.name,
          title: item.name.replace(/\.[^.]+$/, '').replace(/^[0-9]+[_\s.-]*/, '').replace(/[_-]/g, ' '),
          fileType,
          source: 'gdrive',
          gdriveFileId: item.id,
          previewUrl: getDrivePreviewUrl(item.id),
          downloadUrl: getDriveDownloadUrl(item.id),
          size: sizeNum,
          formattedSize: formatBytes(sizeNum),
          modifiedTime: item.modifiedTime,
        });
      }
    }

    pageToken = data.nextPageToken || null;
  } while (pageToken);

  const result: CourseModule[] = [];

  if (currentLessons.length > 0) {
    result.push({
      id: `mod-${folderId}`,
      name: moduleName,
      lessons: currentLessons,
    });
  }

  result.push(...subModules);
  return result;
}

/**
 * Fetches plain text or markdown file content directly via Drive alt=media
 */
export async function fetchDriveFileText(fileId: string): Promise<string | null> {
  if (!isDriveConfigured() || !fileId) return null;

  try {
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${GOOGLE_DRIVE_API_KEY}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}
