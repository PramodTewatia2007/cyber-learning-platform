import { NextRequest, NextResponse } from 'next/server';
import { getAllLessons } from '@/utils/lessonBuilder';
import { SearchResultItem, FileType } from '@/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get('q') || '').trim().toLowerCase();

  if (!query) {
    return NextResponse.json({ query: '', count: 0, results: [] });
  }

  const allLessons = getAllLessons();
  const results: SearchResultItem[] = [];

  for (const lesson of allLessons) {
    if (
      lesson.title.toLowerCase().includes(query) ||
      lesson.track.toLowerCase().includes(query) ||
      (lesson.course && lesson.course.toLowerCase().includes(query))
    ) {
      const hasVideos = lesson.videos.length > 0;
      const hasPdfs = lesson.pdfs.length > 0;
      const hasLabs = lesson.labs.length > 0;
      const fileType: FileType = hasVideos ? 'video' : hasPdfs ? 'pdf' : hasLabs ? 'lab' : 'document';

      results.push({
        id: lesson.id,
        title: lesson.title,
        type: 'lesson',
        fileType,
        source: hasVideos ? 'youtube' : 'gdrive',
        courseSlug: lesson.trackId,
        courseTitle: lesson.course || lesson.track,
        trackTitle: lesson.track,
        accent: lesson.trackAccent,
        snippet: `${lesson.track} • ${hasVideos ? 'Video' : hasPdfs ? 'PDF' : hasLabs ? 'Lab' : 'Note'}`
      });

      if (results.length >= 30) break;
    }
  }

  return NextResponse.json({
    query,
    count: results.length,
    results,
  });
}
