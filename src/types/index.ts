export type FileType =
  | 'video'
  | 'pdf'
  | 'document'
  | 'presentation'
  | 'spreadsheet'
  | 'markdown'
  | 'lab'
  | 'archive'
  | 'audio'
  | 'image'
  | 'unknown';

export type StorageSource = 'r2' | 'youtube' | 'local_markdown';

export interface LessonItem {
  id: string;
  name: string;
  title: string;
  fileType: FileType;
  source: StorageSource;
  r2Key?: string;
  youtubeId?: string;
  youtubeThumbnail?: string;
  size?: number;
  formattedSize?: string;
  duration?: string;
  modifiedTime?: string;
  description?: string;
  isPendingUpload?: boolean; // Skipped video waiting for YouTube ID
  order?: number;
}

export interface CourseModule {
  id: string;
  name: string;
  order?: number;
  lessons: LessonItem[];
  submodules?: CourseModule[];
}

export interface CourseStats {
  videos: number;
  pdfs: number;
  labs: number;
  docs: number;
  totalSize: number;
  formattedTotalSize: string;
}

export interface CatalogCourse {
  slug: string;
  title: string;
  trackId: string;
  trackTitle: string;
  trackAccent: string;
  description: string;
  accentColor: string;
  recommendedStep?: number;
  tags: string[];
  driveFolderId?: string;
  r2Prefix?: string;
  isRoadmap?: boolean;
  modules: CourseModule[];
  rootLessons: LessonItem[];
  stats: CourseStats;
  totalLessons: number;
  pendingVideoCount?: number;
}

export interface TrackConfig {
  id: string;
  title: string;
  subtitle: string;
  accent: string;
  accentBg: string;
  borderAccent: string;
  icon: string;
  courses: CatalogCourse[];
}

export interface CatalogManifest {
  version: string;
  generatedAt: string;
  totalTracks: number;
  totalCourses: number;
  totalLessons: number;
  totalVideos: number;
  totalPdfs: number;
  totalLabs: number;
  totalDocs: number;
  totalSizeBytes: number;
  formattedTotalSize: string;
  tracks: TrackConfig[];
  courses: Record<string, CatalogCourse>;
}

export interface YouTubeVideoEntry {
  courseSlug: string;
  modulePath: string;
  title: string;
  originalFilename: string;
  originalSizeMB: number;
  youtubeId: string;
  duration?: string;
  thumbnailUrl?: string;
  addedAt?: string;
}

export interface SearchResultItem {
  id: string;
  title: string;
  type: 'course' | 'module' | 'lesson';
  fileType?: FileType;
  source?: StorageSource;
  courseSlug: string;
  courseTitle: string;
  trackTitle: string;
  accent: string;
  moduleName?: string;
  snippet?: string;
  youtubeId?: string;
  r2Key?: string;
}
