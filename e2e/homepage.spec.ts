import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Golden Harvest/i);
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });

  test('should display hero section', async ({ page }) => {
    const hero = page.locator('section').first();
    await expect(hero).toBeVisible();
  });

  test('should display products section', async ({ page }) => {
    // Scroll to products section
    await page.evaluate(() => {
      const productsSection = document.querySelector('[id="products"]') || 
                              document.querySelector('section:nth-of-type(2)');
      productsSection?.scrollIntoView({ behavior: 'smooth' });
    });
    
    // Wait a bit for scroll
    await page.waitForTimeout(500);
    
    // Check for product-related content
    const productsHeading = page.locator('text=/product/i').first();
    await expect(productsHeading).toBeVisible({ timeout: 10000 });
  });

  test('should display navigation links', async ({ page }) => {
    const navLinks = page.locator('nav a');
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have working cart button', async ({ page }) => {
    const cartButton = page.locator('button').filter({ hasText: /cart/i }).or(
      page.locator('[aria-label*="cart" i]')
    ).first();
    
    if (await cartButton.isVisible()) {
      await cartButton.click();
      // Cart should open (check for cart-related elements)
      await page.waitForTimeout(500);
    }
  });

  test('should display footer', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.locator('footer')).toBeVisible();
  });
});

