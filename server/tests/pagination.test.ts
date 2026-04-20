import { describe, expect, it } from 'vitest';
import {
  basePaginationSchema,
  resolveSortField,
  toPaginationParams,
} from '../src/utils/pagination.js';

describe('pagination utils', () => {
  it('applies defaults', () => {
    const parsed = basePaginationSchema.parse({});
    expect(parsed.page).toBe(1);
    expect(parsed.limit).toBe(20);
    expect(parsed.sortOrder).toBe('desc');
  });

  it('coerces numeric strings from query params', () => {
    const parsed = basePaginationSchema.parse({ page: '3', limit: '50' });
    expect(parsed.page).toBe(3);
    expect(parsed.limit).toBe(50);
  });

  it('converts to skip/take', () => {
    const parsed = basePaginationSchema.parse({ page: '4', limit: '25' });
    const params = toPaginationParams(parsed);
    expect(params.skip).toBe(75);
    expect(params.take).toBe(25);
  });

  it('resolves safe sort fields against a whitelist', () => {
    const allowed = ['createdAt', 'name'] as const;
    expect(resolveSortField('name', allowed, 'createdAt')).toBe('name');
    expect(resolveSortField('--drop-table--', allowed, 'createdAt')).toBe('createdAt');
    expect(resolveSortField(undefined, allowed, 'createdAt')).toBe('createdAt');
  });
});
