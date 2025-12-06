# End-to-End Testing with Playwright

This directory contains end-to-end (E2E) tests for the Farm Poultry application using Playwright.

## Test Structure

- `homepage.spec.ts` - Tests for homepage functionality
- `auth.spec.ts` - Tests for authentication flows
- `products.spec.ts` - Tests for product browsing and filtering
- `checkout.spec.ts` - Tests for checkout process
- `admin.spec.ts` - Tests for admin dashboard and management
- `profile.spec.ts` - Tests for user profile page
- `contact.spec.ts` - Tests for contact form

## Running Tests

### Run all tests
```bash
npm run test:e2e
```

### Run tests in UI mode (interactive)
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Run tests in debug mode
```bash
npm run test:e2e:debug
```

### View test report
```bash
npm run test:e2e:report
```

## Configuration

Tests are configured in `playwright.config.ts`. The configuration includes:

- **Base URL**: `http://localhost:3000` (or set `PLAYWRIGHT_TEST_BASE_URL` env variable)
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Auto-start server**: Development server starts automatically before tests
- **Retries**: 2 retries on CI, 0 locally
- **Screenshots**: Captured on failure
- **Traces**: Collected on first retry

## Test Environment

Before running tests:

1. Ensure the development server can start (`npm run dev`)
2. Set up environment variables in `.env.local` if needed
3. Make sure Supabase is configured (tests may need database access)

## Writing New Tests

1. Create a new `.spec.ts` file in the `e2e/` directory
2. Use Playwright's test API:
   ```typescript
   import { test, expect } from '@playwright/test';
   
   test('my test', async ({ page }) => {
     await page.goto('/');
     await expect(page).toHaveTitle(/expected title/i);
   });
   ```

## Best Practices

- Use descriptive test names
- Group related tests with `test.describe()`
- Use `test.beforeEach()` for common setup
- Wait for elements to be visible before interacting
- Use `page.waitForTimeout()` sparingly (prefer waiting for elements)
- Make tests independent (don't rely on test execution order)

## CI/CD Integration

Tests can be run in CI/CD pipelines. The configuration automatically:
- Runs in headless mode on CI
- Retries failed tests
- Generates HTML reports
- Captures screenshots and traces on failure

