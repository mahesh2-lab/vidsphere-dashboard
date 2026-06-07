import crypto from 'crypto';

const SECRET = process.env.API_KEY_SECRET!;

/**
 * Generates a new raw API key.
 * Format: sk_<64 hex chars>
 */
export function generateApiKey(): string {
  const random = crypto.randomBytes(32).toString('hex');
  return `sk_${random}`;
}

/**
 * HMAC-SHA256 hash of a raw key.
 * Only the hash is stored in the database.
 */
export function hashApiKey(rawKey: string): string {
  return crypto
    .createHmac('sha256', SECRET)
    .update(rawKey)
    .digest('hex');
}

/**
 * Constant-time comparison to prevent timing attacks.
 */
export function verifyApiKey(incoming: string, storedHash: string): boolean {
  const incomingHash = hashApiKey(incoming);
  try {
    return crypto.timingSafeEqual(
      Buffer.from(incomingHash, 'hex'),
      Buffer.from(storedHash,   'hex'),
    );
  } catch {
    // Buffer lengths differ — key is invalid
    return false;
  }
}