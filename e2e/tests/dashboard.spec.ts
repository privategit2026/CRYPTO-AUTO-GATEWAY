import { expect } from '@playwright/test';
import { test } from '../fixtures/auth.fixture';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows stat cards', async ({ page }) => {
    await expect(page.getByTestId('stat-card-deposits')).toBeVisible();
    await expect(page.getByTestId('stat-card-volume')).toBeVisible();
    await expect(page.getByTestId('stat-card-wallets')).toBeVisible();
    await expect(page.getByTestId('stat-card-users')).toBeVisible();
  });

  test('desktop sidebar nav links are visible', async ({ page }) => {
    for (const label of ['Dashboard', 'Deposits', 'Wallets', 'Users', 'Transactions', 'API Keys', 'Activity', 'Settings']) {
      await expect(page.getByRole('navigation').getByRole('link', { name: label })).toBeVisible();
    }
  });

  test('mobile bottom nav is visible at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    const bottomNav = page.getByTestId('bottom-nav');
    await expect(bottomNav).toBeVisible();
    await expect(bottomNav.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(bottomNav.getByRole('link', { name: 'Incoming' })).toBeVisible();
    await expect(bottomNav.getByRole('link', { name: 'Logs' })).toBeVisible();
    await expect(bottomNav.getByRole('link', { name: 'Wallets' })).toBeVisible();
  });

  test('mobile bottom nav Incoming link navigates to deposits', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.getByTestId('bottom-nav').getByRole('link', { name: 'Incoming' }).click();
    await expect(page).toHaveURL('/deposits');
  });
});
