import catalogData from '@/data/catalog.json';
import { CatalogManifest, CatalogCourse, TrackConfig, SearchResultItem, LessonItem } from '@/types';

const catalog = catalogData as unknown as CatalogManifest;

export function getCatalog(): CatalogManifest {
  return catalog;
}

export function getAllCourses(): CatalogCourse[] {
  return Object.values(catalog.courses || {});
}

export function getCourse(slug: string): CatalogCourse | undefined {
  return catalog.courses?.[slug];
}

export function getTrack(trackId: string): TrackConfig | undefined {
  return catalog.tracks?.find(t => t.id === trackId);
}

export function getRecommendedPath(): CatalogCourse[] {
  const slugs = [
    'cybersecurity-fundamentals',
    'ethical-hacking-scratch',
    'red-team-roadmap',
    'ceh-study-materials',
    'ceh-labs-practical',
    'offsec-resources',
    'blue-team-books',
  ];

  return slugs
    .map(s => catalog.courses?.[s])
    .filter(Boolean) as CatalogCourse[];
}

export function searchCatalog(query: string): SearchResultItem[] {
  const q = (query || '').trim().toLowerCase();
  if (!q) return [];

  const results: SearchResultItem[] = [];

  for (const course of Object.values(catalog.courses || {})) {
    // Match course level
    if (
      course.title.toLowerCase().includes(q) ||
      course.description.toLowerCase().includes(q) ||
      course.tags.some(t => t.toLowerCase().includes(q))
    ) {
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

    // Match root lessons
    for (const lesson of course.rootLessons) {
      if (
        lesson.title.toLowerCase().includes(q) ||
        lesson.name.toLowerCase().includes(q) ||
        lesson.description?.toLowerCase().includes(q)
      ) {
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
          snippet: lesson.description || `${lesson.fileType.toUpperCase()} • ${lesson.formattedSize || lesson.duration || ''}`,
          youtubeId: lesson.youtubeId,
          r2Key: lesson.r2Key,
        });
      }
    }

    // Match modules and lessons
    for (const mod of course.modules) {
      if (mod.name.toLowerCase().includes(q)) {
        results.push({
          id: mod.id,
          title: mod.name,
          type: 'module',
          courseSlug: course.slug,
          courseTitle: course.title,
          trackTitle: course.trackTitle,
          accent: course.trackAccent,
          moduleName: mod.name,
          snippet: `Module with ${mod.lessons.length} lessons`,
        });
      }

      for (const lesson of mod.lessons) {
        if (
          lesson.title.toLowerCase().includes(q) ||
          lesson.name.toLowerCase().includes(q) ||
          lesson.description?.toLowerCase().includes(q)
        ) {
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
            moduleName: mod.name,
            snippet: `${lesson.fileType.toUpperCase()} • ${lesson.formattedSize || lesson.duration || ''}`,
            youtubeId: lesson.youtubeId,
            r2Key: lesson.r2Key,
          });
        }
      }
    }
  }

  // Deduplicate and cap to 30 items
  return Array.from(new Map(results.map(r => [r.id, r])).values()).slice(0, 30);
}
