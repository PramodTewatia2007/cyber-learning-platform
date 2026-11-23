import { NextRequest, NextResponse } from 'next/server';
import { TRACKS, ALL_COURSES, getTrackByCourseSlug } from '@/config/sources';
import { getAllCatalogTrees } from '@/lib/drive';
import { SearchResultItem, DriveFile, CourseModule } from '@/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get('q') || '').trim().toLowerCase();

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  const results: SearchResultItem[] = [];
  const catalogTrees = await getAllCatalogTrees();

  // 1. Search Course Titles & Descriptions
  for (const course of ALL_COURSES) {
    const track = getTrackByCourseSlug(course.slug);
    const accent = track?.accent || '#10B981';
    const trackTitle = track?.title || 'Cybersecurity';

    const matchesCourseTitle = course.title.toLowerCase().includes(query);
    const matchesCourseDesc = course.description.toLowerCase().includes(query);
    const matchesTags = course.tags.some((tag) => tag.toLowerCase().includes(query));

    if (matchesCourseTitle || matchesCourseDesc || matchesTags) {
      results.push({
        id: `course-${course.slug}`,
        title: course.title,
        type: 'course',
        courseSlug: course.slug,
        courseTitle: course.title,
        trackTitle,
        accent,
        snippet: course.description,
      });
    }

    // 2. Search Lessons & Modules inside this course's catalog tree
    const tree = catalogTrees[course.slug];
    if (tree) {
      // Search root files
      for (const file of tree.rootFiles) {
        if (file.name.toLowerCase().includes(query) || file.description?.toLowerCase().includes(query)) {
          results.push({
            id: file.id,
            title: file.name,
            type: 'lesson',
            fileType: file.fileType,
            courseSlug: course.slug,
            courseTitle: course.title,
            trackTitle,
            accent,
            snippet: file.description || `${file.fileType.toUpperCase()} • ${file.formattedSize || ''}`,
          });
        }
      }

      // Search modules and module files
      const searchModules = (modules: CourseModule[]) => {
        for (const mod of modules) {
          if (mod.name.toLowerCase().includes(query)) {
            results.push({
              id: mod.id,
              title: mod.name,
              type: 'module',
              courseSlug: course.slug,
              courseTitle: course.title,
              trackTitle,
              accent,
              moduleId: mod.id,
              moduleName: mod.name,
              snippet: `Module containing ${mod.files.length} lesson assets`,
            });
          }

          for (const file of mod.files) {
            if (file.name.toLowerCase().includes(query) || file.description?.toLowerCase().includes(query)) {
              results.push({
                id: file.id,
                title: file.name,
                type: 'lesson',
                fileType: file.fileType,
                courseSlug: course.slug,
                courseTitle: course.title,
                trackTitle,
                accent,
                moduleId: mod.id,
                moduleName: mod.name,
                snippet: file.description || `${file.fileType.toUpperCase()} • ${file.formattedSize || ''}`,
              });
            }
          }

          if (mod.submodules) {
            searchModules(mod.submodules);
          }
        }
      };

      searchModules(tree.modules);
    }
  }

  // Deduplicate and limit to 40 results
  const unique = Array.from(new Map(results.map((r) => [r.id, r])).values()).slice(0, 40);

  return NextResponse.json({
    query,
    count: unique.length,
    results: unique,
  });
}
