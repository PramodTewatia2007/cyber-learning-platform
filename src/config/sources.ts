import {
  SOURCE_TRACKS as RAW_TRACKS,
  ALL_SOURCE_COURSES as RAW_COURSES,
  getSourceCourseBySlug as rawGetCourseBySlug,
  getSourceTrackByCourseSlug as rawGetTrackByCourseSlug,
} from './sources.mjs';

export interface SourceCourseConfig {
  slug: string;
  title: string;
  trackId: string;
  driveFolderId?: string;
  sourceType: 'drive_folder' | 'github_markdown';
  githubRawUrl?: string;
  description: string;
  accentColor: string;
  recommendedStep?: number;
  tags: string[];
  dedupTargetSlug?: string;
}

export interface SourceTrackConfig {
  id: string;
  title: string;
  subtitle: string;
  accent: string;
  accentBg: string;
  borderAccent: string;
  icon: string;
  courses: SourceCourseConfig[];
}

export const SOURCE_TRACKS: SourceTrackConfig[] = RAW_TRACKS as SourceTrackConfig[];
export const ALL_SOURCE_COURSES: SourceCourseConfig[] = RAW_COURSES as SourceCourseConfig[];

export function getSourceCourseBySlug(slug: string): SourceCourseConfig | undefined {
  return rawGetCourseBySlug(slug) as SourceCourseConfig | undefined;
}

export function getSourceTrackByCourseSlug(slug: string): SourceTrackConfig | undefined {
  return rawGetTrackByCourseSlug(slug) as SourceTrackConfig | undefined;
}

// Aliases for compatibility
export const TRACKS = SOURCE_TRACKS;
export const ALL_COURSES = ALL_SOURCE_COURSES;
export const getCourseBySlug = getSourceCourseBySlug;
export const getTrackByCourseSlug = getSourceTrackByCourseSlug;

export function getRecommendedPath(): SourceCourseConfig[] {
  return [
    getSourceCourseBySlug('cybersecurity-fundamentals')!,
    getSourceCourseBySlug('ethical-hacking-scratch')!,
    getSourceCourseBySlug('red-team-roadmap')!,
    getSourceCourseBySlug('ceh-study-materials')!,
    getSourceCourseBySlug('ceh-labs-practical')!,
    getSourceCourseBySlug('offsec-resources')!,
    getSourceCourseBySlug('blue-team-books')!,
  ].filter(Boolean);
}
