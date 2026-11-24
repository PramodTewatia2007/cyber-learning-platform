import { CatalogCourse, DbCourse, DbLesson } from '@/types';
import { getCourse as getCatalogCourse } from '@/lib/catalog';
import { getSupabaseServerClient, isSupabaseServerConfigured } from '@/lib/supabase/server';

export async function fetchCourseBySlug(slug: string): Promise<CatalogCourse | null> {
  // 1. Check unified catalog (loaded from drive_assets.json & video_links.json)
  const catalogMatch = getCatalogCourse(slug);
  if (catalogMatch) {
    return catalogMatch;
  }

  // 2. Try Supabase if configured for custom admin courses
  if (isSupabaseServerConfigured()) {
    try {
      const supabase = await getSupabaseServerClient();
      if (supabase) {
        const { data: dbCourse } = await supabase
          .from('courses')
          .select('*, track:tracks(*), lessons(*)')
          .eq('slug', slug)
          .eq('is_published', true)
          .maybeSingle();

        if (dbCourse) {
          const track = dbCourse.track;
          const lessons: DbLesson[] = dbCourse.lessons || [];

          // Group lessons by module_name
          const modulesMap = new Map<string, any[]>();
          lessons.forEach((l) => {
            const modName = l.module_name || 'Core Modules';
            if (!modulesMap.has(modName)) {
              modulesMap.set(modName, []);
            }
            modulesMap.get(modName)!.push({
              id: l.id,
              name: l.title,
              title: l.title,
              fileType: l.lesson_type === 'youtube_video' ? 'video' : 'document',
              source: l.lesson_type === 'youtube_video' ? 'youtube' : 'gdrive',
              youtubeId: l.youtube_video_id || undefined,
              gdriveFileId: l.gdrive_file_id || undefined,
              duration: l.duration_text || undefined,
              order: l.sort_order,
            });
          });

          const modules = Array.from(modulesMap.entries()).map(([name, les], idx) => ({
            id: `mod-${idx}`,
            name,
            lessons: les,
          }));

          return {
            id: dbCourse.id,
            slug: dbCourse.slug,
            title: dbCourse.title,
            trackId: dbCourse.track_id || '',
            trackTitle: track?.title || 'Cybersecurity',
            trackAccent: track?.accent_color || '#10B981',
            description: dbCourse.description || '',
            accentColor: track?.accent_color || '#10B981',
            sourceType: dbCourse.source_type,
            gdriveFolderId: dbCourse.gdrive_folder_id || undefined,
            youtubePlaylistId: dbCourse.youtube_playlist_id || undefined,
            markdownUrl: dbCourse.markdown_url || undefined,
            recommendedStep: dbCourse.recommended_step || undefined,
            isPublished: dbCourse.is_published,
            modules,
            rootLessons: [],
            stats: {
              videos: lessons.filter((l) => l.lesson_type === 'youtube_video').length,
              pdfs: 0,
              labs: 0,
              docs: lessons.filter((l) => l.lesson_type !== 'youtube_video').length,
            },
            totalLessons: lessons.length,
          };
        }
      }
    } catch (err) {
      console.warn('Could not fetch course from Supabase, falling back:', err);
    }
  }

  return null;
}
