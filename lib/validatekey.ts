import { db } from '@/lib/db';
import { apiKeys } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifyApiKey } from '@/lib/apikey';

export type ApiKeyRecord = typeof apiKeys.$inferSelect;

/**
 * Validates an incoming raw API key string.
 * Uses prefix-based lookup to avoid a full table scan,
 * then constant-time HMAC comparison against each candidate.
 *
 * Returns the matched key record, or null if invalid/revoked.
 */
export async function validateApiKey(
  rawKey: string | null,
): Promise<ApiKeyRecord | null> {
  if (!rawKey || !rawKey.startsWith('sk_')) return null;

  const prefix = rawKey.slice(0, 10);

  const candidates = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.prefix, prefix));

  if (candidates.length === 0) return null;

  const matched = candidates.find((c) => verifyApiKey(rawKey, c.keyHash));
  if (!matched) return null;

  if (matched.revokedAt) return null;

  // Update lastUsedAt
  await db.update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, matched.id));

  return matched;
}