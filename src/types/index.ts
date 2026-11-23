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

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  formattedSize?: string;
  modifiedTime?: string;
  fileType: FileType;
  webViewLink?: string;
  iconLink?: string;
  description?: string;
  duration?: string;
  sampleContent?: string;
}

export interface CourseModule {
  id: string;
  name: string;
  order?: number;
  files: DriveFile[];
  submodules?: CourseModule[];
  folderId?: string;
}

export interface CourseStats {
  videos: number;
  pdfs: number;
  labs: number;
  docs: number;
  others: number;
}

export interface CourseTree {
  courseSlug: string;
  courseTitle: string;
  rootFolderId?: string;
  isExternalMarkdown?: boolean;
  markdownSourceUrl?: string;
  modules: CourseModule[];
  rootFiles: DriveFile[];
  totalFiles: number;
  stats: CourseStats;
  lastSynced?: string;
  isMock?: boolean;
}

export interface CourseSource {
  slug: string;
  title: string;
  trackId: string;
  folderId?: string;
  sourceType: 'drive_folder' | 'github_markdown';
  githubRawUrl?: string;
  description: string;
  accentColor: string;
  recommendedStep?: number;
  tags: string[];
}

export interface TrackConfig {
  id: string;
  title: string;
  subtitle: string;
  accent: string;
  accentBg: string;
  borderAccent: string;
  icon: string;
  courses: CourseSource[];
}

export interface SearchResultItem {
  id: string;
  title: string;
  type: 'course' | 'module' | 'lesson';
  fileType?: FileType;
  courseSlug: string;
  courseTitle: string;
  trackTitle: string;
  accent: string;
  moduleId?: string;
  moduleName?: string;
  snippet?: string;
}

export interface UserProgress {
  completedLessons: string[]; // array of file IDs
  lessonNotes: Record<string, string>; // fileId -> notes markdown
  lastAccessedLesson?: {
    courseSlug: string;
    fileId: string;
    lessonTitle: string;
    timestamp: number;
  };
  roadmapCompletedCheckboxes: string[]; // array of checkbox IDs/hashes
}
