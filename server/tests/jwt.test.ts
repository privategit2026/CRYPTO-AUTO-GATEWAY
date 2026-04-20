import { describe, expect, it } from 'vitest';
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from '../src/utils/jwt.js';

describe('jwt utils', () => {
  it('round-trips an access token', () => {
    const token = signAccessToken({ sub: 'u1', email: 'a@b.c', role: 'ADMIN' });
    const decoded = verifyAccessToken(token);
    expect(decoded.sub).toBe('u1');
    expect(decoded.email).toBe('a@b.c');
    expect(decoded.role).toBe('ADMIN');
  });

  it('round-trips a refresh token', () => {
    const token = signRefreshToken({ sub: 'u2' });
    const decoded = verifyRefreshToken(token);
    expect(decoded.sub).toBe('u2');
  });

  it('rejects a tampered access token', () => {
    const token = signAccessToken({ sub: 'u1', email: 'a@b.c', role: 'ADMIN' });
    const bad = token.slice(0, -1) + (token.at(-1) === 'A' ? 'B' : 'A');
    expect(() => verifyAccessToken(bad)).toThrow();
  });
});
