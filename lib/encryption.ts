import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
// In a real application, this should be stored securely in an environment variable
// and never hardcoded. For this demo, we use a constant or fallback to a string.
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'vidsphere_secure_key_32_bytes_123'; // Must be exactly 32 bytes

// Ensure the key is exactly 32 bytes (256 bits)
const getValidKey = () => {
  if (ENCRYPTION_KEY.length === 32) return Buffer.from(ENCRYPTION_KEY);
  return Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));
};

export function encrypt(text: string): string {
  if (!text) return text;
  
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, getValidKey(), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  
  // Format: iv:authTag:encryptedData
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
  if (!encryptedText) return encryptedText;
  
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) return encryptedText; // Not encrypted or malformed
    
    const [ivHex, authTagHex, encryptedHex] = parts;
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = createDecipheriv(ALGORITHM, getValidKey(), iv);
    
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedText; // Fallback to returning the text (might be unencrypted)
  }
}
