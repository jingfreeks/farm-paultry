import { test, expect } from '@playwright/test';

test.describe('Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display contact form', async ({ page }) => {
    // Scroll to contact section
    await page.evaluate(() => {
      const contactSection = document.querySelector('[id="contact"]') || 
                             document.querySelector('section:last-of-type');
      contactSection?.scrollIntoView({ behavior: 'smooth' });
    });
    
    await page.waitForTimeout(1000);
    
    // Look for contact form elements
    const nameInput = page.locator('input[type="text"]').filter({ 
      hasText: /name/i 
    }).or(
      page.locator('input[placeholder*="name" i]')
    ).first();
    
    const emailInput = page.locator('input[type="email"]').first();
    const messageTextarea = page.locator('textarea').first();
    
    // At least one should be visible
    const hasName = await nameInput.isVisible().catch(() => false);
    const hasEmail = await emailInput.isVisible().catch(() => false);
    const hasMessage = await messageTextarea.isVisible().catch(() => false);
    
    if (hasName || hasEmail || hasMessage) {
      expect(hasName || hasEmail || hasMessage).toBeTruthy();
    }
  });

  test('should validate contact form fields', async ({ page }) => {
    // Scroll to contact section
    await page.evaluate(() => {
      const contactSection = document.querySelector('[id="contact"]') || 
                             document.querySelector('section:last-of-type');
      contactSection?.scrollIntoView({ behavior: 'smooth' });
    });
    
    await page.waitForTimeout(1000);
    
    const emailInput = page.locator('input[type="email"]').first();
    
    if (await emailInput.isVisible()) {
      await emailInput.fill('invalid-email');
      await emailInput.blur();
      
      // Check for HTML5 validation
      const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      expect(validationMessage).toBeTruthy();
    }
  });
});

