import { test as setup } from '@playwright/test';
import { STORAGE_STATE, TEST_USER } from '../config';

/**
 * Global setup: log in once and save auth state so all test projects
 * can reuse the authenticated session without re-logging in.
 */
setup('authenticate', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('Email').fill(TEST_USER.email);
  await page.getByLabel('Password').fill(TEST_USER.password);
  await page.getByRole('button', { name: /sign in/i }).click();

  // Wait for redirect to dashboard
  await page.waitForURL('/');

  // Save the authenticated state
  await page.context().storageState({ path: STORAGE_STATE });
});
