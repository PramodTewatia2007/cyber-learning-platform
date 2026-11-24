import { NextRequest, NextResponse } from 'next/server';
import { getR2Client } from '@/lib/r2';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'cyber-lms-library';
const NEXT_PUBLIC_R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  const { key } = await params;
  const objectKey = key.join('/');
  const { searchParams } = new URL(req.url);
  const isDownload = searchParams.get('download') === 'true';

  // If public R2 custom domain is configured, redirect directly
  if (NEXT_PUBLIC_R2_PUBLIC_URL) {
    const baseUrl = NEXT_PUBLIC_R2_PUBLIC_URL.replace(/\/$/, '');
    return NextResponse.redirect(`${baseUrl}/${objectKey}`);
  }

  const s3 = getR2Client();

  // If R2 is not configured, return an informative fallback payload
  if (!s3) {
    const filename = objectKey.split('/').pop() || 'resource';
    if (objectKey.endsWith('.pdf')) {
      return new NextResponse(
        `%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000099 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n162\n%%EOF`,
        {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': isDownload ? `attachment; filename="${filename}"` : 'inline',
          },
        }
      );
    }

    if (objectKey.endsWith('.md') || objectKey.endsWith('.txt')) {
      return new NextResponse(
        `# ${filename}\n\n### Self-Owned LMS Storage Info\nThis course asset is part of the optional Cloudflare R2 cloud storage pipeline (\`${objectKey}\`).\n\n- **Native Google Drive Access:** All original course documents, notes, and lab files can be accessed directly inside this course via the **Google Drive Files & Labs** folder button in the sidebar (zero setup needed).\n- **Cloudflare R2 Migration (Optional):** If you wish to migrate your files to Cloudflare R2, configure your bucket credentials in \`.env.local\` and run \`npm run migrate\`.`,
        {
          headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
          },
        }
      );
    }

    return new NextResponse(
      `CYBERSECURITY LMS // CLOUDFLARE R2 ASSET PROXY\nAsset: ${objectKey}\nStatus: Ready for migration.\nTo serve live binaries, run: npm run migrate`,
      {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}.txt"`,
        },
      }
    );
  }

  try {
    const rangeHeader = req.headers.get('range');
    const filename = objectKey.split('/').pop() || 'cyber-asset';

    // If download requested, redirect to a secure presigned attachment URL
    if (isDownload) {
      const presignedUrl = await getSignedUrl(
        s3,
        new GetObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: objectKey,
          ResponseContentDisposition: `attachment; filename="${encodeURIComponent(filename)}"`,
        }),
        { expiresIn: 300 }
      );
      return NextResponse.redirect(presignedUrl);
    }

    // Stream directly from R2 with Range support
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: objectKey,
      Range: rangeHeader || undefined,
    });

    const s3Res = await s3.send(command);
    const contentType = s3Res.ContentType || 'application/octet-stream';

    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=86400',
    };

    if (s3Res.ContentLength) headers['Content-Length'] = String(s3Res.ContentLength);
    if (s3Res.ContentRange) headers['Content-Range'] = s3Res.ContentRange;

    const status = rangeHeader && s3Res.ContentRange ? 206 : 200;

    return new NextResponse(s3Res.Body as any, {
      status,
      headers,
    });
  } catch (err: any) {
    console.error(`R2 media proxy error for "${objectKey}":`, err.message);
    return NextResponse.json(
      { error: `Could not retrieve asset from R2: ${err.message}` },
      { status: 404 }
    );
  }
}
