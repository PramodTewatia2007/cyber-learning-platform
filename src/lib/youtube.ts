// ==============================================================================
// YOUTUBE & SMART LINK PARSER UTILITIES
// ==============================================================================

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || process.env.GOOGLE_DRIVE_API_KEY;

export interface ParsedLinkResult {
  type: 'youtube_video' | 'youtube_playlist' | 'gdrive_folder' | 'gdrive_file' | 'markdown' | 'unknown';
  id?: string;
  url?: string;
}

/**
 * Universal Smart Link Parser
 * Parses any standard YouTube or Google Drive link and returns the exact ID
 */
export function parseResourceLink(input: string): ParsedLinkResult {
  if (!input) return { type: 'unknown' };
  const str = input.trim();

  // YouTube Playlist
  const playlistMatch = str.match(/[?&]list=([a-zA-Z0-9_-]+)/i) || str.match(/^PL[a-zA-Z0-9_-]+$/i);
  if (playlistMatch) {
    return { type: 'youtube_playlist', id: playlistMatch[1] || playlistMatch[0] };
  }

  // YouTube Video
  const ytVideoMatch =
    str.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/i) ||
    str.match(/^[\w-]{11}$/);
  if (ytVideoMatch) {
    return { type: 'youtube_video', id: ytVideoMatch[1] || ytVideoMatch[0] };
  }

  // Google Drive Folder
  const driveFolderMatch =
    str.match(/drive\.google\.com\/drive\/(?:u\/\d+\/)?folders\/([a-zA-Z0-9_-]+)/i) ||
    (str.length >= 25 && str.length <= 45 && !str.includes('/') ? [null, str] : null);
  if (driveFolderMatch && driveFolderMatch[1]) {
    return { type: 'gdrive_folder', id: driveFolderMatch[1] };
  }

  // Google Drive File
  const driveFileMatch =
    str.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i) ||
    str.match(/[?&]id=([a-zA-Z0-9_-]+)/i);
  if (driveFileMatch && driveFileMatch[1]) {
    return { type: 'gdrive_file', id: driveFileMatch[1] };
  }

  // Markdown URL
  if (str.startsWith('http') && (str.endsWith('.md') || str.includes('raw.githubusercontent.com'))) {
    return { type: 'markdown', url: str };
  }

  return { type: 'unknown' };
}

export interface YouTubePlaylistItem {
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  duration?: string;
  position: number;
}

export function isYouTubeConfigured(): boolean {
  return Boolean(YOUTUBE_API_KEY && YOUTUBE_API_KEY.trim() !== '');
}

/**
 * Fetches all videos from an Unlisted or Public YouTube playlist using YouTube Data API v3
 */
export async function getPlaylistVideos(playlistId: string): Promise<YouTubePlaylistItem[]> {
  if (!playlistId) return [];

  const apiKey = YOUTUBE_API_KEY;
  if (!apiKey) {
    // Return sample playlist items if no key is configured
    return [
      {
        videoId: '3Kq1MIfTWCE',
        title: 'Passive Reconnaissance: OSINT, Shodan & Subfinder',
        description: 'Deep dive into passive intelligence gathering and asset discovery.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
        duration: '38:40',
        position: 1,
      },
      {
        videoId: '4t4kBkMsDbQ',
        title: 'Active Reconnaissance: Nmap Scripting Engine (NSE) Mastery',
        description: 'Advanced port scanning, banner grabbing, and custom NSE vulnerability scripts.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80',
        duration: '44:15',
        position: 2,
      },
      {
        videoId: 'WnNCNUjhqxE',
        title: 'Scanning Networks: Three-Way Handshake & FIN Scans',
        description: 'TCP flag manipulation, firewall evasion, and stealth probing.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80',
        duration: '32:10',
        position: 3,
      },
    ];
  }

  const videos: YouTubePlaylistItem[] = [];
  let pageToken: string | null = null;

  try {
    do {
      const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
      url.searchParams.set('part', 'snippet,contentDetails');
      url.searchParams.set('playlistId', playlistId);
      url.searchParams.set('maxResults', '50');
      url.searchParams.set('key', apiKey);
      if (pageToken) url.searchParams.set('pageToken', pageToken);

      const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
      if (!res.ok) {
        throw new Error(`YouTube API error: ${res.status}`);
      }

      const data = await res.json();
      const items = data.items || [];

      for (const item of items) {
        const snippet = item.snippet;
        const videoId = snippet?.resourceId?.videoId;
        if (!videoId) continue;

        videos.push({
          videoId,
          title: snippet.title || 'Untitled Lecture',
          description: snippet.description || '',
          thumbnailUrl:
            snippet.thumbnails?.high?.url ||
            snippet.thumbnails?.medium?.url ||
            snippet.thumbnails?.default?.url,
          position: snippet.position ?? videos.length + 1,
        });
      }

      pageToken = data.nextPageToken || null;
    } while (pageToken);

    return videos;
  } catch (err: any) {
    console.warn(`[YouTube API] Error fetching playlist ${playlistId}:`, err);
    throw err;
  }
}
