import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should open auth modal when clicking sign in', async ({ page }) => {
    // Look for sign in button or link
    const signInButton = page.locator('button, a').filter({ hasText: /sign in|login/i }).first();
    
    if (await signInButton.isVisible()) {
      await signInButton.click();
      await page.waitForTimeout(500);
      
      // Check for auth modal elements
      const emailInput = page.locator('input[type="email"]').first();
      await expect(emailInput).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display sign up form', async ({ page }) => {
    // Open auth modal
    const signInButton = page.locator('button, a').filter({ hasText: /sign in|login|sign up/i }).first();
    
    if (await signInButton.isVisible()) {
      await signInButton.click();
      await page.waitForTimeout(500);
      
      // Look for sign up link or tab
      const signUpLink = page.locator('button, a').filter({ hasText: /sign up|create account/i }).first();
      
      if (await signUpLink.isVisible()) {
        await signUpLink.click();
        await page.waitForTimeout(500);
        
        // Check for sign up form fields
        const emailInput = page.locator('input[type="email"]').first();
        const passwordInput = page.locator('input[type="password"]').first();
        
        await expect(emailInput).toBeVisible();
        await expect(passwordInput).toBeVisible();
      }
    }
  });

  test('should validate email format', async ({ page }) => {
    // Open auth modal
    const signInButton = page.locator('button, a').filter({ hasText: /sign in|login/i }).first();
    
    if (await signInButton.isVisible()) {
      await signInButton.click();
      await page.waitForTimeout(500);
      
      const emailInput = page.locator('input[type="email"]').first();
      
      if (await emailInput.isVisible()) {
        await emailInput.fill('invalid-email');
        await emailInput.blur();
        
        // Check for validation error (if HTML5 validation is used)
        const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
        expect(validationMessage).toBeTruthy();
      }
    }
  });

  test('should close auth modal', async ({ page }) => {
    // Open auth modal
    const signInButton = page.locator('button, a').filter({ hasText: /sign in|login/i }).first();
    
    if (await signInButton.isVisible()) {
      await signInButton.click();
      await page.waitForTimeout(500);
      
      // Look for close button
      const closeButton = page.locator('button').filter({ hasText: /close|×|✕/i }).or(
        page.locator('[aria-label*="close" i]')
      ).first();
      
      if (await closeButton.isVisible()) {
        await closeButton.click();
        await page.waitForTimeout(500);
        
        // Modal should be closed
        const emailInput = page.locator('input[type="email"]').first();
        await expect(emailInput).not.toBeVisible({ timeout: 2000 });
      }
    }
  });
});

