import { db } from '@/lib/db';
import { youtubeAccount, uploads } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { validateApiKey } from '@/features/developers/services/validatekey';
import { oauth2Client } from '@/features/youtube/services/google';
import { decrypt } from '@/lib/utils/encryption';
import { google } from 'googleapis';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // ── 1. Authenticate API Key ──────────────────────────────────────────────
  const rawKey = req.headers.get('x-api-key');
  const keyRecord = await validateApiKey(rawKey);

  if (!keyRecord) {
    return Response.json(
      { error: 'Invalid or revoked API key.' },
      { status: 401 },
    );
  }

  const { id } = await params;
  if (!id) {
    return Response.json({ error: 'Upload ID is required.' }, { status: 400 });
  }

  // ── 2. Find the upload in the database ───────────────────────────────────
  const uploadRecord = await db.query.uploads.findFirst({
    where: and(
      eq(uploads.id, id),
      eq(uploads.userId, keyRecord.userId)
    ),
  });

  if (!uploadRecord) {
    return Response.json(
      { error: 'Upload not found or you do not have permission.' },
      { status: 404 },
    );
  }

  // ── 3. If no videoId is attached yet, return DB status only ──────────────
  if (!uploadRecord.videoId) {
    return Response.json({
      id: uploadRecord.id,
      title: uploadRecord.title,
      databaseStatus: uploadRecord.status,
      errorMessage: uploadRecord.errorMessage,
      youtubeStatus: null,
    });
  }

  // ── 4. Fetch the user's linked YouTube account ─────────────────────────────
  const ytAccount = await db.query.youtubeAccount.findFirst({
    where: eq(youtubeAccount.userId, keyRecord.userId),
  });

  if (!ytAccount || !ytAccount.refreshToken) {
    // If the YouTube account was disconnected, we can't query YouTube directly.
    return Response.json({
      id: uploadRecord.id,
      videoId: uploadRecord.videoId,
      title: uploadRecord.title,
      databaseStatus: uploadRecord.status,
      youtubeStatus: null,
      error: 'YouTube channel is disconnected.',
    });
  }

  // ── 5. Refresh the OAuth access token ─────────────────────────────────────
  let accessToken: string;
  try {
    const decryptedRefreshToken = decrypt(ytAccount.refreshToken);
    const decryptedAccessToken = ytAccount.accessToken ? decrypt(ytAccount.accessToken) : null;
    oauth2Client.setCredentials({
      refresh_token: decryptedRefreshToken,
      access_token:  decryptedAccessToken,
    });
    const { credentials } = await oauth2Client.refreshAccessToken();
    if (!credentials.access_token) throw new Error('No access token returned.');
    accessToken = credentials.access_token;
  } catch (err) {
    console.error("Status check token refresh error:", err);
    return Response.json({
      id: uploadRecord.id,
      videoId: uploadRecord.videoId,
      title: uploadRecord.title,
      databaseStatus: uploadRecord.status,
      youtubeStatus: null,
      error: 'Failed to authenticate with YouTube.',
    });
  }

  // ── 6. Fetch YouTube Processing Status ────────────────────────────────────
  try {
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    
    const ytResponse = await youtube.videos.list({
      part: ['status', 'processingDetails'],
      id: [uploadRecord.videoId],
    });

    const ytVideo = ytResponse.data.items?.[0];

    if (!ytVideo) {
      return Response.json({
        id: uploadRecord.id,
        videoId: uploadRecord.videoId,
        title: uploadRecord.title,
        databaseStatus: uploadRecord.status,
        youtubeStatus: 'not_found',
      });
    }

    // Processing status can be: processing, processingFailed, processingStarted, succeeded
    // Upload status can be: deleted, failed, processed, rejected, uploaded
    return Response.json({
      id: uploadRecord.id,
      videoId: uploadRecord.videoId,
      title: uploadRecord.title,
      databaseStatus: uploadRecord.status,
      youtubeStatus: {
        uploadStatus: ytVideo.status?.uploadStatus, // e.g. "processed"
        privacyStatus: ytVideo.status?.privacyStatus,
        rejectionReason: ytVideo.status?.rejectionReason,
        processingStatus: ytVideo.processingDetails?.processingStatus, // e.g. "processing"
      }
    });
  } catch (error: any) {
    console.error('Error fetching YouTube status:', error);
    return Response.json({
      id: uploadRecord.id,
      videoId: uploadRecord.videoId,
      title: uploadRecord.title,
      databaseStatus: uploadRecord.status,
      youtubeStatus: null,
      error: 'Failed to fetch status from YouTube API',
    });
  }
}
