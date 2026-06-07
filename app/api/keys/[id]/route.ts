/**
 * DELETE /api/keys/[id]  — revoke an API key by its DB id
 *
 * Requires a valid user session. Users can only revoke their own keys.
 */

import { db } from '@/lib/db';
import { apiKeys } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const existing = await db.query.apiKeys.findFirst({
    where: and(
      eq(apiKeys.id,     id),
      eq(apiKeys.userId, session.user.id),
    ),
  });

  if (!existing) {
    return Response.json({ error: 'Key not found.' }, { status: 404 });
  }

  if (existing.revokedAt) {
    return Response.json({ error: 'Key is already revoked.' }, { status: 409 });
  }

  await db
    .update(apiKeys)
    .set({ revokedAt: new Date() })
    .where(eq(apiKeys.id, id));

  return Response.json({ message: 'Key revoked successfully.' });
}