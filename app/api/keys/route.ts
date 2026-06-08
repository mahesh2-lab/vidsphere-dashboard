/**
 * GET  /api/keys  — list all keys for the authenticated user
 * POST /api/keys  — create a new API key
 *
 * Both routes require a valid user session (Better Auth).
 * The raw key is returned ONCE on creation and never stored.
 */

import { db } from '@/lib/db';
import { apiKeys, youtubeAccount } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateApiKey, hashApiKey } from '@/lib/apikey';
import { auth } from '@/lib/auth'; // your Better Auth instance
import { headers } from 'next/headers';

// ── GET /api/keys ──────────────────────────────────────────────────────────────
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const keys = await db
    .select({
      id:         apiKeys.id,
      name:       apiKeys.name,
      prefix:     apiKeys.prefix,
      revokedAt:  apiKeys.revokedAt,
      lastUsedAt: apiKeys.lastUsedAt,
      createdAt:  apiKeys.createdAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.userId, session.user.id))
    .orderBy(apiKeys.createdAt);

  return Response.json({ keys });
}

// ── POST /api/keys ─────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const ytAccount = await db.query.youtubeAccount.findFirst({
    where: eq(youtubeAccount.userId, session.user.id),
  });

  if (!ytAccount) {
    return Response.json(
      { error: 'You must connect your YouTube account before generating API keys.' },
      { status: 403 }
    );
  }

  const body = await req.json() as { name?: string };
  const name = body.name?.trim();

  if (!name) {
    return Response.json({ error: 'Key name is required.' }, { status: 400 });
  }

  const rawKey = generateApiKey();
  const keyHash = hashApiKey(rawKey);
  const prefix  = rawKey.slice(0, 12);

  const [record] = await db
    .insert(apiKeys)
    .values({
      userId:  session.user.id,
      name,
      keyHash,
      prefix,
    })
    .returning({
      id:        apiKeys.id,
      name:      apiKeys.name,
      createdAt: apiKeys.createdAt,
    });

  return Response.json(
    {
      id:        record.id,
      name:      record.name,
      key:       rawKey, // shown ONCE — never returned again
      createdAt: record.createdAt,
      message:   'Store this key safely. It will not be shown again.',
    },
    { status: 201 },
  );
}