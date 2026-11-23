import { NextRequest, NextResponse } from 'next/server';
import { getCourseCatalogTree, isDriveConfigured, getAllCatalogTrees } from '@/lib/drive';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const courseSlug = searchParams.get('courseSlug');
  const all = searchParams.get('all');

  const configured = isDriveConfigured();

  try {
    if (all === 'true') {
      const allTrees = await getAllCatalogTrees();
      return NextResponse.json({
        success: true,
        isConfigured: configured,
        trees: allTrees,
      });
    }

    if (!courseSlug) {
      return NextResponse.json(
        { success: false, error: 'Missing required query parameter: courseSlug' },
        { status: 400 }
      );
    }

    const tree = await getCourseCatalogTree(courseSlug);
    return NextResponse.json({
      success: true,
      isConfigured: configured,
      tree,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to retrieve folder contents',
        isConfigured: configured,
      },
      { status: 500 }
    );
  }
}
