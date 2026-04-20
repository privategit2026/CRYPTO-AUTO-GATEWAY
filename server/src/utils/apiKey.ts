import { randomBytes, createHash } from 'node:crypto';

/**
 * Generate a plaintext API key like `pk_live_<32 random hex chars>`. The
 * plaintext is only ever returned to the caller on create — we store the
 * SHA-256 hash and a short preview suffix for subsequent reads.
 */
export interface GeneratedApiKey {
  plaintext: string;
  keyHash: string;
  keyPreview: string;
}

const PREFIX = 'pk_live_';

export const sha256 = (input: string): string =>
  createHash('sha256').update(input).digest('hex');

export const generateApiKey = (): GeneratedApiKey => {
  const secret = randomBytes(24).toString('hex'); // 48 chars of entropy
  const plaintext = `${PREFIX}${secret}`;
  const keyHash = sha256(plaintext);
  // Preview shows the prefix + last 4 chars of the secret (never the middle).
  const tail = secret.slice(-4);
  const keyPreview = `${PREFIX}${'•'.repeat(8)}${tail}`;
  return { plaintext, keyHash, keyPreview };
};
