import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { buildApp } from '../src/app.js';

describe('GET /api/health', () => {
  const app = buildApp();

  it('returns a healthy envelope', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.service).toBe('cryptogate-api');
    expect(typeof res.body.data.time).toBe('string');
  });
});

describe('404 handler', () => {
  const app = buildApp();
  it('responds with a consistent error envelope', async () => {
    const res = await request(app).get('/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('NOT_FOUND');
  });
});

describe('auth-guarded route without token', () => {
  const app = buildApp();
  it('returns 401', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
