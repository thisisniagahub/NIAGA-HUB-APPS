import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  
  test('redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/');
    // HashRouter handling
    await expect(page).toHaveURL(/.*#\/login/);
    await expect(page.locator('text=Sign in to your operating system')).toBeVisible();
  });

  test('login works with admin credentials', async ({ page }) => {
    await page.goto('/#/login');
    
    // Fill credentials (using the hardcoded admin creds from the app)
    await page.fill('input[type="email"]', 'admin@startupos.com');
    await page.fill('input[type="password"]', 'admin123');
    
    // Click login
    await page.click('button[type="submit"]');

    // Expect redirect to Dashboard
    await expect(page).toHaveURL(/.*#\/$/);
    await expect(page.locator('text=Founder Control Center')).toBeVisible();
  });

  test('displays error on invalid credentials', async ({ page }) => {
    await page.goto('/#/login');
    
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpass'); // wrong pass
    await page.click('button[type="submit"]');

    // Expect error message
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });
});