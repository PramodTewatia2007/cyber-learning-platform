import { NextRequest, NextResponse } from 'next/server';
import { getDriveCourseModules, getDriveFolderEmbedUrl, isDriveConfigured } from '@/lib/drive';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) {
  const { folderId } = await params;

  if (!folderId) {
    return NextResponse.json({ error: 'Folder ID is required' }, { status: 400 });
  }

  const configured = isDriveConfigured();
  const fallbackEmbedUrl = getDriveFolderEmbedUrl(folderId);

  if (!configured) {
    return NextResponse.json({
      configured: false,
      folderId,
      embedUrl: fallbackEmbedUrl,
      modules: [],
      message: 'Google Drive API key not configured. Using zero-config folder embed view.',
    });
  }

  try {
    const modules = await getDriveCourseModules(folderId);

    return NextResponse.json({
      configured: true,
      folderId,
      embedUrl: fallbackEmbedUrl,
      modules,
      totalModules: modules.length,
      totalFiles: modules.reduce((acc, m) => acc + m.lessons.length, 0),
    });
  } catch (err: any) {
    return NextResponse.json({
      configured: false,
      folderId,
      embedUrl: fallbackEmbedUrl,
      modules: [],
      error: err.message || 'Failed to fetch Drive folder contents',
    });
  }
}
