import { NextRequest, NextResponse } from 'next/server';
import { isDriveConfigured } from '@/lib/drive';
import { MOCK_CATALOG } from '@/lib/mockData';
import { DriveFile } from '@/types';

function findMockFile(fileId: string): DriveFile | undefined {
  for (const tree of Object.values(MOCK_CATALOG)) {
    for (const f of tree.rootFiles) {
      if (f.id === fileId) return f;
    }
    for (const mod of tree.modules) {
      for (const f of mod.files) {
        if (f.id === fileId) return f;
      }
      if (mod.submodules) {
        for (const sub of mod.submodules) {
          for (const f of sub.files) {
            if (f.id === fileId) return f;
          }
        }
      }
    }
  }
  return undefined;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
  const configured = isDriveConfigured();

  // Check if this is a known mock file first
  const mockFile = findMockFile(fileId);

  // If mock mode or mock file, serve native mock content
  if (!configured || mockFile) {
    if (mockFile?.sampleContent) {
      return new NextResponse(mockFile.sampleContent, {
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    if (mockFile?.fileType === 'markdown' || mockFile?.name.endsWith('.md')) {
      const fallbackMarkdown = `# ${mockFile.name}

## Tactical Course Overview
This lesson is part of **${mockFile.name.replace(/\.[^/.]+$/, '')}**.

- **File Type:** ${mockFile.fileType.toUpperCase()}
- **Estimated Study Time:** 25 mins
- **Status:** Interactive Lesson

---

### Core Objectives
1. Understand the theoretical threat vectors and network behaviors.
2. Review security compliance frameworks and mitigation strategies.
3. Apply practical command-line techniques in a sandbox environment.

\`\`\`bash
# Diagnostic command check
whoami && id
uname -a
ip a
\`\`\`

> [!TIP]
> Use the "Mark Lesson Complete" button at the top right to track your progress across the course workspace.
`;
      return new NextResponse(fallbackMarkdown, {
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // For mock videos, provide demo metadata or placeholder
    if (mockFile?.fileType === 'video') {
      return NextResponse.json({
        type: 'video_mock',
        fileId,
        title: mockFile.name,
        duration: mockFile.duration || '30:00',
        message: 'Mock video stream loaded. Connect your GOOGLE_DRIVE_API_KEY in .env.local to stream original Drive video assets natively.',
      });
    }

    // For mock PDFs
    if (mockFile?.fileType === 'pdf') {
      return NextResponse.json({
        type: 'pdf_mock',
        fileId,
        title: mockFile.name,
        size: mockFile.formattedSize,
        message: 'Mock PDF loaded. Connect your GOOGLE_DRIVE_API_KEY in .env.local to stream original Drive PDF assets natively.',
      });
    }
  }

  // Live Google Drive Fetch
  try {
    const rangeHeader = req.headers.get('range');
    const driveUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`;

    const headers: Record<string, string> = {};
    if (rangeHeader) {
      headers['Range'] = rangeHeader;
    }

    const driveRes = await fetch(driveUrl, { headers });

    if (!driveRes.ok) {
      // If file is a Google Doc/Sheet/Slide, attempt export to PDF
      if (driveRes.status === 403 || driveRes.status === 400) {
        const exportUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=application/pdf&key=${apiKey}`;
        const exportRes = await fetch(exportUrl);
        if (exportRes.ok) {
          const buffer = await exportRes.arrayBuffer();
          return new NextResponse(buffer, {
            status: 200,
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': 'inline',
              'Cache-Control': 'public, max-age=86400',
            },
          });
        }
      }

      return NextResponse.json(
        { error: `Google Drive API error: ${driveRes.statusText}` },
        { status: driveRes.status }
      );
    }

    const contentType = driveRes.headers.get('content-type') || 'application/octet-stream';
    const contentLength = driveRes.headers.get('content-length');
    const contentRange = driveRes.headers.get('content-range');
    const acceptRanges = driveRes.headers.get('accept-ranges') || 'bytes';

    const responseHeaders: Record<string, string> = {
      'Content-Type': contentType,
      'Accept-Ranges': acceptRanges,
      'Cache-Control': 'public, max-age=86400',
    };

    if (contentLength) responseHeaders['Content-Length'] = contentLength;
    if (contentRange) responseHeaders['Content-Range'] = contentRange;

    // Stream the body directly
    return new NextResponse(driveRes.body, {
      status: driveRes.status,
      headers: responseHeaders,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to stream content from Google Drive' },
      { status: 500 }
    );
  }
}
