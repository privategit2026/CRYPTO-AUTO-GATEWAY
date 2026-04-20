import { describe, expect, it } from 'vitest';
import { generateApiKey, sha256 } from '../src/utils/apiKey.js';

describe('api key generator', () => {
  it('creates a valid key + preview + hash triple', () => {
    const { plaintext, keyHash, keyPreview } = generateApiKey();
    expect(plaintext.startsWith('pk_live_')).toBe(true);
    expect(plaintext.length).toBeGreaterThan(40);
    expect(keyHash).toBe(sha256(plaintext));
    expect(keyPreview.startsWith('pk_live_')).toBe(true);
    expect(keyPreview).toContain('•');
    expect(keyPreview).not.toEqual(plaintext);
  });

  it('emits unique keys', () => {
    const a = generateApiKey();
    const b = generateApiKey();
    expect(a.plaintext).not.toEqual(b.plaintext);
    expect(a.keyHash).not.toEqual(b.keyHash);
  });
});
