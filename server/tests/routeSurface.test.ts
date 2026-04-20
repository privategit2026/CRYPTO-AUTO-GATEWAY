import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';

/** Enumerate the routes registered on the app and assert the important
 *  ones are present. Guards against accidental drop during refactors. */
describe('route surface', () => {
  const app = buildApp();

  const registered: Array<{ method: string; path: string }> = [];
  const walk = (stack: any[], prefix = '') => {
    for (const layer of stack) {
      if (layer.route) {
        for (const m of Object.keys(layer.route.methods)) {
          registered.push({ method: m.toUpperCase(), path: `${prefix}${layer.route.path}` });
        }
      } else if (layer.name === 'router' && layer.handle?.stack) {
        const match = layer.regexp?.source
          ?.replace('\\/?(?=\\/|$)', '')
          .replace(/^\^\\\//, '/')
          .replace(/\\\//g, '/');
        walk(layer.handle.stack, match ?? prefix);
      }
    }
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  walk((app as any)._router.stack);

  const has = (method: string, path: string) =>
    registered.some((r) => r.method === method && r.path.endsWith(path));

  it('exposes auth surface', () => {
    expect(has('POST', '/login')).toBe(true);
    expect(has('POST', '/register')).toBe(true);
    expect(has('GET', '/me')).toBe(true);
    expect(has('POST', '/refresh')).toBe(true);
    expect(has('POST', '/logout')).toBe(true);
  });

  it('exposes users CRUD', () => {
    expect(has('GET', '/')).toBe(true);
    expect(has('POST', '/')).toBe(true);
    expect(has('GET', '/:id')).toBe(true);
    expect(has('PATCH', '/:id')).toBe(true);
    expect(has('DELETE', '/:id')).toBe(true);
  });

  it('exposes deposit advance-status', () => {
    expect(has('POST', '/:id/advance-status')).toBe(true);
  });

  it('exposes dashboard endpoints', () => {
    expect(has('GET', '/summary')).toBe(true);
    expect(has('GET', '/recent-deposits')).toBe(true);
    expect(has('GET', '/network-health')).toBe(true);
  });

  it('exposes health', () => {
    expect(has('GET', '/api/health')).toBe(true);
  });
});
