import crypto from 'crypto';

function getSecret(): string {
  const secret = process.env.API_KEY_SECRET;
  if (!secret) {
    throw new Error('API_KEY_SECRET is not set in environment variables.');
  }
  return secret;
}

/**
 * Generate a random 40-char alphanumeric API key
 */
export function generateApiKey(): string {
  return crypto
    .randomBytes(20)
    .toString('hex')
    .slice(0, 40);
}

/**
 * HMAC-SHA256 hash of a raw key.
 * Only the hash is stored in the database.
 */
export function hashApiKey(rawKey: string): string {
  return crypto
    .createHmac('sha256', getSecret())
    .update(rawKey)
    .digest('hex');
}

export function verifyApiKey(incoming: string, storedHash: string): boolean {
  const incomingHash = hashApiKey(incoming);
  try {
    return crypto.timingSafeEqual(
      Buffer.from(incomingHash, 'hex'),
      Buffer.from(storedHash, 'hex'),
    );
  } catch {
    return false;
  }
}