// ==============================================================================
// CYBERSECURITY LEARNING PLATFORM (LMS) - TYPE DEFINITIONS
// ==============================================================================

export type FileType =
  | 'video'
  | 'pdf'
  | 'document'
  | 'note'
  | 'presentation'
  | 'spreadsheet'
  | 'markdown'
  | 'lab'
  | 'archive'
  | 'audio'
  | 'image'
  | 'folder'
  | 'unknown';

export type LessonSource = 'youtube' | 'gdrive' | 'markdown';
export type CourseSourceType = 'gdrive_folder' | 'youtube_playlist' | 'hybrid' | 'markdown';
export type UserRole = 'student' | 'admin';

// ------------------------------------------------------------------------------
// Supabase Database Models
// ------------------------------------------------------------------------------

export interface Profile {
  id: string;
  email: string;
  full_name?: string | null;
  role: UserRole;
  created_at: string;
}

export interface DbTrack {
  id: string;
  slug: string;
  title: string;
  accent_color: string;
  description?: string | null;
  sort_order: number;
  created_at: string;
}

export interface DbCourse {
  id: string;
  track_id?: string | null;
  slug: string;
  title: string;
  description?: string | null;
  source_type: CourseSourceType;
  gdrive_folder_id?: string | null;
  youtube_playlist_id?: string | null;
  markdown_url?: string | null;
  recommended_step?: number | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  // Joined fields
  track?: DbTrack | null;
  lessons?: DbLesson[];
}

export interface DbLesson {
  id: string;
  course_id: string;
  module_name: string;
  title: string;
  lesson_type: 'youtube_video' | 'gdrive_file' | 'markdown';
  youtube_video_id?: string | null;
  gdrive_file_id?: string | null;
  duration_text?: string | null;
  sort_order: number;
  created_at: string;
}

export interface DbUserProgress {
  id: string;
  user_id: string;
  course_slug: string;
  item_key: string;
  completed: boolean;
  updated_at: string;
}

export interface DbLessonNote {
  id: string;
  user_id: string;
  item_key: string;
  content: string;
  is_bookmarked: boolean;
  updated_at: string;
}

export interface DbBrokenLinkReport {
  id: string;
  user_id?: string | null;
  course_slug: string;
  item_title: string;
  details?: string | null;
  status: 'open' | 'resolved';
  created_at: string;
}

// ------------------------------------------------------------------------------
// Google Drive Ingestion Types
// ------------------------------------------------------------------------------

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  formattedSize?: string;
  modifiedTime?: string;
  fileType: FileType;
  previewUrl: string;
  downloadUrl: string;
}

export interface DriveFolderTree {
  folderId: string;
  folderName: string;
  files: DriveFileItem[];
  submodules: DriveFolderTree[];
}

// ------------------------------------------------------------------------------
// LMS Unified Presentation Models
// ------------------------------------------------------------------------------

export interface LessonItem {
  id: string; // file_id
  fileId?: string; // permanent file_id
  name: string;
  title: string;
  displayTitle?: string;
  moduleName?: string;
  fileType: FileType;
  source: LessonSource;
  gdriveFileId?: string;
  view_url?: string;
  embed_url?: string;
  download_url?: string;
  previewUrl?: string;
  downloadUrl?: string;
  youtubeId?: string;
  youtubeThumbnail?: string;
  size_mb?: number;
  size?: number;
  formattedSize?: string;
  duration_min?: number;
  duration?: string;
  subtitleUrl?: string;
  content?: string;
  modifiedTime?: string;
  description?: string;
  isPendingUpload?: boolean;
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
  totalSize?: number;
  formattedTotalSize?: string;
}

export interface CatalogCourse {
  id?: string;
  slug: string;
  title: string;
  trackId: string;
  trackTitle: string;
  trackAccent: string;
  description: string;
  accentColor: string;
  sourceType: CourseSourceType;
  gdriveFolderId?: string;
  youtubePlaylistId?: string;
  markdownUrl?: string;
  recommendedStep?: number;
  tags?: string[];
  isPublished?: boolean;
  isRoadmap?: boolean;
  modules: CourseModule[];
  rootLessons: LessonItem[];
  stats: CourseStats;
  totalLessons: number;
}

export interface TrackConfig {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  accent: string;
  accentBg?: string;
  borderAccent?: string;
  icon?: string;
  courses: CatalogCourse[];
}

export interface SearchResultItem {
  id: string;
  title: string;
  type: 'course' | 'module' | 'lesson';
  fileType?: FileType;
  source?: LessonSource;
  courseSlug: string;
  courseTitle: string;
  trackTitle: string;
  accent: string;
  moduleId?: string;
  moduleName?: string;
  snippet?: string;
  youtubeId?: string;
  gdriveFileId?: string;
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
  totalSizeBytes?: number;
  formattedTotalSize?: string;
  tracks: TrackConfig[];
  courses: Record<string, CatalogCourse>;
}

// ------------------------------------------------------------------------------
// Unified Lesson Models (Flat Title-Based Architecture)
// ------------------------------------------------------------------------------

export interface LessonVideoItem {
  file_id: string;
  title: string;
  clean_title: string;
  filename?: string;
  size_mb?: number;
  duration_min?: number;
  embed_url?: string;
  view_url?: string;
  download_url?: string;
  youtubeRedirectUrl: string;
  subtitleUrl?: string;
}

export interface LessonPdfItem {
  file_id: string;
  title: string;
  clean_title: string;
  filename?: string;
  size_mb?: number;
  view_url?: string;
  embed_url?: string;
  download_url?: string;
}

export interface LessonNoteItem {
  file_id: string;
  title: string;
  clean_title: string;
  filename?: string;
  content?: string;
  is_url?: boolean;
  type?: string;
  view_url?: string;
  embed_url?: string;
  download_url?: string;
}

export interface LessonLabItem {
  file_id: string;
  title: string;
  clean_title: string;
  filename?: string;
  size_mb?: number;
  type?: string;
  view_url?: string;
  download_url?: string;
}

export interface UnifiedLesson {
  id: string;
  trackId: string;
  track: string;
  trackAccent: string;
  course: string;
  subfolder?: string;
  title: string;
  order: number;
  videos: LessonVideoItem[];
  pdfs: LessonPdfItem[];
  notes: LessonNoteItem[];
  labs: LessonLabItem[];
}

export interface TrackMeta {
  id: string;
  title: string;
  accent: string;
  description?: string;
  lessonCount: number;
}

