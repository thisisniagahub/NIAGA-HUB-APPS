import { test, expect } from '@playwright/test';

test.describe('Core Application Modules', () => {
  
  // Login before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/login');
    await page.fill('input[type="email"]', 'admin@startupos.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Founder Control Center')).toBeVisible();
  });

  test('can navigate to Ideation module', async ({ page }) => {
    // Click sidebar link
    await page.click('a[href="#/ideation"]');
    
    // Verify header
    await expect(page.locator('h1')).toContainText('Ideation & Innovation');
    
    // Check for unique element (e.g., input area)
    await expect(page.locator('textarea[placeholder*="Describe your startup idea"]')).toBeVisible();
  });

  test('can navigate to Billing page', async ({ page }) => {
    // Navigate via URL or UI (testing URL direct access here)
    await page.goto('/#/billing');
    
    await expect(page.locator('text=Upgrade your Operating System')).toBeVisible();
    await expect(page.locator('text=Growth')).toBeVisible();
  });

  test('global chat assistant opens', async ({ page }) => {
    // Find the floating action button
    const fab = page.locator('button:has(svg.lucide-sparkles)'); // Assuming sparkle icon
    await fab.click();

    // Check if chat window opens
    await expect(page.locator('text=StartupOS Copilot')).toBeVisible();
    await expect(page.locator('text=Ask me anything')).toBeVisible();
  });
});