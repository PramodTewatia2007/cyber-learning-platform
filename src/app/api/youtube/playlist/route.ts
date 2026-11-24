import { NextRequest, NextResponse } from 'next/server';
import { getPlaylistVideos, parseResourceLink } from '@/lib/youtube';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, courseId, moduleName = 'Video Lectures', autoInsert = false } = body;

    if (!url) {
      return NextResponse.json({ error: 'Playlist URL or ID is required' }, { status: 400 });
    }

    const parsed = parseResourceLink(url);
    const playlistId = parsed.type === 'youtube_playlist' ? parsed.id : url.trim();

    if (!playlistId) {
      return NextResponse.json({ error: 'Could not extract a valid YouTube playlist ID' }, { status: 400 });
    }

    const videos = await getPlaylistVideos(playlistId);

    // If autoInsert and courseId requested, insert to Supabase
    let insertedCount = 0;
    if (autoInsert && courseId) {
      const supabase = await getSupabaseServerClient();
      if (supabase) {
        const rowsToInsert = videos.map((v, idx) => ({
          course_id: courseId,
          module_name: moduleName,
          title: v.title,
          lesson_type: 'youtube_video',
          youtube_video_id: v.videoId,
          duration_text: v.duration || null,
          sort_order: idx + 1,
        }));

        const { error } = await supabase.from('lessons').insert(rowsToInsert);
        if (!error) {
          insertedCount = rowsToInsert.length;
        } else {
          console.warn('Failed to insert lessons to Supabase:', error.message);
        }
      }
    }

    return NextResponse.json({
      success: true,
      playlistId,
      totalVideos: videos.length,
      insertedCount,
      videos,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch YouTube playlist' },
      { status: 500 }
    );
  }
}
