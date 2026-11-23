import { NextRequest, NextResponse } from 'next/server';
import { isDriveConfigured } from '@/lib/drive';
import { MOCK_CATALOG } from '@/lib/mockData';
import { DriveFile } from '@/types';

function findFileAcrossCatalog(fileId: string): DriveFile | undefined {
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

  const fileInfo = findFileAcrossCatalog(fileId);
  const filename = fileInfo?.name || `cyber-lab-asset-${fileId}.zip`;

  // If live Google Drive configured and not a pure mock ID
  if (configured && (!fileInfo || !fileInfo.id.includes('-'))) {
    try {
      const driveUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`;
      const driveRes = await fetch(driveUrl);

      if (driveRes.ok) {
        const contentType = driveRes.headers.get('content-type') || 'application/octet-stream';
        return new NextResponse(driveRes.body, {
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
          },
        });
      }
    } catch (err) {
      console.warn('Drive download error, falling back to mock asset:', err);
    }
  }

  // Fallback: Generate an informative, real downloadable asset archive or instruction package
  const readmeContent = `# CYBERSECURITY LMS // LAB ASSET ARCHIVE
File: ${filename}
Asset ID: ${fileId}
Generated: ${new Date().toISOString()}

============================================================
INSTRUCTIONS & LAB TOPOLOGY
============================================================
1. This is a local development mock download package for "${filename}".
2. To download the original live binary from Google Drive, provide a valid
   GOOGLE_DRIVE_API_KEY in your .env.local file.
3. If this is a PCAP or OVA image, verify MD5/SHA256 checksums before loading
   into VMware Workstation or VirtualBox.

SECURITY NOTICE:
All offensive lab exercises must be run exclusively inside isolated host-only
virtual machine networks. Never execute adversary emulation payloads against
unauthorized external networks.
`;

  return new NextResponse(readmeContent, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename.replace(/\.(zip|ova|iso)$/i, '-INSTRUCTIONS.txt'))}"`,
    },
  });
}
