import crypto from 'crypto';

function getSecret(): string {
  const secret = process.env.API_KEY_SECRET;
  if (!secret) {
    throw new Error('API_KEY_SECRET is not set in environment variables.');
  }
  return secret;
}

const BASE62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

function generateBase62(length: number): string {
  let result = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += BASE62[randomBytes[i] % 62];
  }
  return result;
}

/**
 * Generate a random 40-char API key with prefix
 */
export function generateApiKey(): string {
  const envPrefix = process.env.NODE_ENV === 'production' ? 'live_' : 'test_';
  return `vs_${envPrefix}${generateBase62(32)}`;
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