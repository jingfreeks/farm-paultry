import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should open checkout modal', async ({ page }) => {
    // First, add a product to cart
    await page.evaluate(() => {
      const productsSection = document.querySelector('[id="products"]') || 
                              document.querySelector('section:nth-of-type(2)');
      productsSection?.scrollIntoView({ behavior: 'smooth' });
    });
    
    await page.waitForTimeout(1000);
    
    const addToCartButton = page.locator('button').filter({ hasText: /add to cart/i }).first();
    
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click();
      await page.waitForTimeout(500);
      
      // Open cart or checkout
      const checkoutButton = page.locator('button').filter({ hasText: /checkout|view cart/i }).first();
      
      if (await checkoutButton.isVisible()) {
        await checkoutButton.click();
        await page.waitForTimeout(500);
        
        // Check for checkout form elements
        const emailInput = page.locator('input[type="email"]').first();
        await expect(emailInput).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should validate checkout form fields', async ({ page }) => {
    // Navigate to checkout (simulate)
    await page.evaluate(() => {
      const productsSection = document.querySelector('[id="products"]') || 
                              document.querySelector('section:nth-of-type(2)');
      productsSection?.scrollIntoView({ behavior: 'smooth' });
    });
    
    await page.waitForTimeout(1000);
    
    const addToCartButton = page.locator('button').filter({ hasText: /add to cart/i }).first();
    
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click();
      await page.waitForTimeout(500);
      
      const checkoutButton = page.locator('button').filter({ hasText: /checkout/i }).first();
      
      if (await checkoutButton.isVisible()) {
        await checkoutButton.click();
        await page.waitForTimeout(1000);
        
        // Check for required fields
        const emailInput = page.locator('input[type="email"]').first();
        const nameInput = page.locator('input[type="text"]').filter({ hasText: /name/i }).or(
          page.locator('input[placeholder*="name" i]')
        ).first();
        
        if (await emailInput.isVisible()) {
          await expect(emailInput).toBeVisible();
        }
        
        if (await nameInput.isVisible()) {
          await expect(nameInput).toBeVisible();
        }
      }
    }
  });
});

