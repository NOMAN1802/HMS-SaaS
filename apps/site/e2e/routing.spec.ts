// Locale routing, security headers and accessibility of the scaffold, in a real browser.
// Implements: T-WEB-01 acceptance; AT-WEB-001 (partial), AT-WEB-006, AT-WEB-035 (partial).
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('the root redirects to the Bangla site', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/bn$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'bn-BD');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('the English site renders in English', async ({ page }) => {
  await page.goto('/en');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Care that knows you by name' }),
  ).toBeVisible();
});

test('an unprefixed path gets the language prefix', async ({ page }) => {
  await page.goto('/doctors');
  await expect(page).toHaveURL(/\/bn\/doctors$/);
});

test('responses carry an enforced CSP and no x-powered-by', async ({ request }) => {
  const response = await request.get('/en');
  const headers = response.headers();
  expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
  expect(headers['content-security-policy-report-only']).toBeUndefined();
  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['x-powered-by']).toBeUndefined();
});

test('the site sets no cookies (NFR-WEB-SEC-001)', async ({ page, context }) => {
  await page.goto('/');
  await page.goto('/en');
  expect(await context.cookies()).toEqual([]);
});

for (const path of ['/bn', '/en']) {
  test(`${path} has no accessibility violations and no CSP errors`, async ({ page }) => {
    const cspErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error' && /Content Security Policy/i.test(message.text())) {
        cspErrors.push(message.text());
      }
    });
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
    expect(cspErrors).toEqual([]);
  });
}
