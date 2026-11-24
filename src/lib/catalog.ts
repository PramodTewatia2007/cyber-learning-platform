import {
  getUnifiedCatalog,
  getAllTracks as getTracksFromLoader,
  getAllCourses as getCoursesFromLoader,
  getCourseBySlug as getCourseFromLoader,
  searchCatalog as searchCatalogLoader,
} from '@/utils/catalogLoader';
import { CatalogManifest, CatalogCourse, TrackConfig, SearchResultItem } from '@/types';

export function getCatalog(): CatalogManifest {
  const { tracks, courses } = getUnifiedCatalog();
  const allCoursesList = Object.values(courses);

  let totalVideos = 0;
  let totalPdfs = 0;
  let totalLabs = 0;
  let totalDocs = 0;

  for (const c of allCoursesList) {
    totalVideos += c.stats.videos;
    totalPdfs += c.stats.pdfs;
    totalLabs += c.stats.labs;
    totalDocs += c.stats.docs;
  }

  const totalLessons = totalVideos + totalPdfs + totalLabs + totalDocs;

  return {
    version: '3.0.0',
    generatedAt: new Date().toISOString(),
    totalTracks: tracks.length,
    totalCourses: allCoursesList.length,
    totalLessons,
    totalVideos,
    totalPdfs,
    totalLabs,
    totalDocs,
    formattedTotalSize: '3.2 GB',
    tracks,
    courses,
  };
}

export function getAllCourses(): CatalogCourse[] {
  return getCoursesFromLoader();
}

export function getCourse(slug: string): CatalogCourse | undefined {
  return getCourseFromLoader(slug);
}

export function getTrack(trackId: string): TrackConfig | undefined {
  return getTracksFromLoader().find((t: TrackConfig) => t.id === trackId);
}

export function getRecommendedPath(): CatalogCourse[] {
  const slugs = [
    'cybersecurity-fundamentals',
    'ethical-hacking-scratch',
    'red-team-roadmap',
    'ceh-study-materials',
    'ceh-labs',
    'red-team-resources',
    'offsec-resources',
    'blue-team-books',
    'soc-resources',
  ];

  return slugs
    .map((s) => getCourseFromLoader(s))
    .filter(Boolean) as CatalogCourse[];
}

export function searchCatalog(query: string): SearchResultItem[] {
  return searchCatalogLoader(query);
}
