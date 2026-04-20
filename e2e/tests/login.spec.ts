import { expect } from '@playwright/test';
import { test } from '../fixtures/auth.fixture';

test.describe('Login', () => {
  test('shows login form', async ({ page }) => {
    // Clear storage so we start unauthenticated
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());

    await page.goto('/login');
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('shows error for wrong password', async ({ page }) => {
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());

    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@cryptogate.dev');
    await page.getByLabel('Password').fill('WrongPassword!');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page.getByRole('alert')).toContainText(/invalid/i);
  });

  test('redirects to dashboard after login', async ({ page }) => {
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());

    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@cryptogate.dev');
    await page.getByLabel('Password').fill('Admin1234!');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL('/');
  });
});
