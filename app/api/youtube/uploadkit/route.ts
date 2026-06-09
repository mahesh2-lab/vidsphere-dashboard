

import { db } from '@/lib/db';
import { youtubeAccount, uploads } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { validateApiKey } from '@/features/developers/services/validatekey';
import { oauth2Client } from '@/features/youtube/services/google';
import { decrypt } from '@/lib/utils/encryption';
import { google } from 'googleapis';
import path from 'path';

export async function POST(req: Request) {
  // ── 1. Authenticate ────────────────────────────────────────────────────────
  const rawKey   = req.headers.get('x-api-key');
  const keyRecord = await validateApiKey(rawKey);

  if (!keyRecord) {
    return Response.json(
      { error: 'Invalid or revoked API key.' },
      { status: 401 },
    );
  }

  // ── 2. Read metadata from headers (no body parse yet) ──────────────────────
  const filename   = req.headers.get('x-filename');
  const mimeType   = req.headers.get('content-type');
  const fileSizeRaw = req.headers.get('content-length');

  if (!filename || !mimeType || !fileSizeRaw) {
    return Response.json(
      { error: 'x-filename, content-type, and content-length headers are required.' },
      { status: 400 },
    );
  }

  const fileSize = parseInt(fileSizeRaw, 10);
  if (isNaN(fileSize) || fileSize <= 0) {
    return Response.json(
      { error: 'content-length must be a positive integer.' },
      { status: 400 },
    );
  }

  const ALLOWED_MIME_TYPES = [
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska',
    'video/webm',
  ];
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return Response.json(
      { error: `Unsupported file type: ${mimeType}` },
      { status: 415 },
    );
  }

  const title = path.basename(filename, path.extname(filename));

  // ── 3. Fetch the user's linked YouTube account ─────────────────────────────
  const ytAccount = await db.query.youtubeAccount.findFirst({
    where: eq(youtubeAccount.userId, keyRecord.userId),
  });

  if (!ytAccount) {
    return Response.json(
      { error: 'No YouTube account connected. Go to VidSphere dashboard and sync your channel.' },
      { status: 404 },
    );
  }

  // ── 4. Refresh the OAuth access token ─────────────────────────────────────
  if (!ytAccount.refreshToken) {
    return Response.json(
      { error: 'No refresh token available. Please reconnect your YouTube channel on VidSphere.' },
      { status: 400 },
    );
  }

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
    console.error("uploadkit token refresh error:", err);
    return Response.json(
      { error: 'Failed to refresh YouTube token. Please reconnect your channel on VidSphere.' },
      { status: 502 },
    );
  }

  // ── 5. Initialise resumable upload session with YouTube ────────────────────
  const initRes = await fetch(
    'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
    {
      method: 'POST',
      headers: {
        Authorization:             `Bearer ${accessToken}`,
        'Content-Type':            'application/json',
        'X-Upload-Content-Type':   mimeType,
        'X-Upload-Content-Length': String(fileSize),
      },
      body: JSON.stringify({
        snippet: { title, description: '' },
        status:  { privacyStatus: 'unlisted' },
      }),
    },
  );

  if (!initRes.ok) {
    const errText = await initRes.text();
    return Response.json(
      { error: `YouTube refused the upload session: ${errText}` },
      { status: 502 },
    );
  }

  const uploadUrl = initRes.headers.get('location');
  if (!uploadUrl) {
    return Response.json(
      { error: 'YouTube did not return an upload URL.' },
      { status: 502 },
    );
  }

  // ── 6. Save the refreshed token (only after successful init) ───────────────
  await db
    .update(youtubeAccount)
    .set({ accessToken })
    .where(eq(youtubeAccount.userId, keyRecord.userId));

  // ── 7. Create DB record ────────────────────────────────────────────────────
  const [record] = await db
    .insert(uploads)
    .values({
      userId:        keyRecord.userId,
      title,
      privacyStatus: 'unlisted',
      status:        'uploading',
    })
    .returning({ id: uploads.id });

  // ── 8. Pipe request body stream directly to YouTube ────────────────────────
  //    The video bytes are never buffered — they flow:
  //    [client] → [VidSphere edge] → [Google]
  const uploadRes = await fetch(uploadUrl, {
    method:  'PUT',
    headers: {
      'Content-Type':   mimeType,
      'Content-Length': String(fileSize),
    },
    body:   req.body,
    // @ts-ignore — required for streaming in Node 18+ fetch
    duplex: 'half',
  });

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    await db
      .update(uploads)
      .set({ status: 'failed', errorMessage: errText })
      .where(eq(uploads.id, record.id));

    return Response.json(
      { error: `YouTube upload failed: ${errText}` },
      { status: 502 },
    );
  }

  // ── 9. Parse YouTube's confirmed video ID ──────────────────────────────────
  const ytData = await uploadRes.json() as { id?: string };

  if (!ytData.id) {
    await db
      .update(uploads)
      .set({ status: 'failed', errorMessage: 'YouTube returned no video ID.' })
      .where(eq(uploads.id, record.id));

    return Response.json(
      { error: 'YouTube did not return a video ID after upload.' },
      { status: 502 },
    );
  }

  // ── 10. Mark upload as completed ──────────────────────────────────────────
  await db
    .update(uploads)
    .set({
      status:      'completed',
      videoId:     ytData.id,
      completedAt: new Date(),
    })
    .where(eq(uploads.id, record.id));

  // ── 11. Return only the DB record ID ──────────────────────────────────────
  return Response.json({ id: record.id }, { status: 201 });
}