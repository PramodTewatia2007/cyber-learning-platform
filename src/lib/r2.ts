import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'cyber-lms-library';
const NEXT_PUBLIC_R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;

let s3ClientInstance: S3Client | null = null;

export function isR2Configured(): boolean {
  return Boolean(
    (R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY) ||
    NEXT_PUBLIC_R2_PUBLIC_URL
  );
}

export function getR2Client(): S3Client | null {
  if (s3ClientInstance) return s3ClientInstance;

  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    return null;
  }

  s3ClientInstance = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });

  return s3ClientInstance;
}

/**
 * Resolves the client URL to access a media asset.
 * If NEXT_PUBLIC_R2_PUBLIC_URL is configured, serves directly via CDN.
 * Otherwise, routes through the internal streaming/presigned proxy /api/media/[...key]
 */
export function getMediaUrl(r2Key: string): string {
  if (!r2Key) return '';

  if (NEXT_PUBLIC_R2_PUBLIC_URL) {
    const baseUrl = NEXT_PUBLIC_R2_PUBLIC_URL.replace(/\/$/, '');
    const cleanKey = r2Key.replace(/^\//, '');
    return `${baseUrl}/${cleanKey}`;
  }

  // Internal proxy route
  return `/api/media/${encodeURI(r2Key)}`;
}

/**
 * Generates an authorized, short-lived presigned download URL for private R2 buckets.
 */
export async function getPresignedR2Url(
  r2Key: string,
  downloadFilename?: string,
  expiresInSeconds = 3600
): Promise<string> {
  // If public CDN is configured, return direct link
  if (NEXT_PUBLIC_R2_PUBLIC_URL) {
    return getMediaUrl(r2Key);
  }

  const s3 = getR2Client();
  if (!s3) {
    // Fallback to internal media proxy
    return getMediaUrl(r2Key);
  }

  const disposition = downloadFilename
    ? `attachment; filename="${encodeURIComponent(downloadFilename)}"`
    : undefined;

  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: r2Key,
    ResponseContentDisposition: disposition,
  });

  return await getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
}
