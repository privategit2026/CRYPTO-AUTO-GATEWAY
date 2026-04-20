import { test as base } from '@playwright/test';
import { STORAGE_STATE } from '../config';

/**
 * Authenticated test fixture.
 * Every test that uses this fixture starts with a logged-in browser context.
 */
export const test = base.extend({
  storageState: STORAGE_STATE,
});

export { expect } from '@playwright/test';
