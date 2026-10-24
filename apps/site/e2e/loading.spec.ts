// Loading states (T-WEB-15): parts that render in the browser ship a skeleton in their server
// HTML; a slow page change shows the progress bar; forms show a pending state before the
// confirmation; photos end fully shown with no placeholder left behind them.
import { expect, test } from '@playwright/test';

test('booking and search ship a skeleton instead of an empty area', async ({ request }) => {
  for (const path of ['/bn/book-appointment', '/bn/search']) {
    const html = await (await request.get(path)).text();
    expect(html, path).toContain('data-testid="loading"');
    expect(html, path).toContain('data-skeleton');
  }
});

test('a slow page change shows the progress bar, then the page', async ({ page }) => {
  // Next prefetches a page in segments: the route tree (small, it carries the loading screen) and
  // the page content. Hold the content, as on a slow phone connection; the tree arrives at once.
  await page.route(
    (url) => url.pathname === '/en/doctors' && url.searchParams.has('_rsc'),
    async (route) => {
      const segment = (await route.request().allHeaders())['next-router-segment-prefetch'] ?? '';
      if (!segment.startsWith('/_tree')) await new Promise((resolve) => setTimeout(resolve, 2500));
      await route.continue();
    },
  );
  const tree = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === '/en/doctors' &&
      response.request().headers()['next-router-segment-prefetch'] === '/_tree',
  );
  await page.goto('/en');
  await tree;
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Doctors' })
    .click();
  const bar = page.getByRole('progressbar', { name: 'Loading...' });
  await expect(bar).toBeVisible();
  await expect(bar).toHaveAttribute('aria-busy', 'true');
  await expect(page.getByRole('heading', { level: 1, name: 'Find a doctor' })).toBeVisible({
    timeout: 10_000,
  });
  await expect(page.getByTestId('nav-progress')).toHaveCount(0);
});

test('a form shows that it is sending before it confirms', async ({ page }) => {
  await page.goto('/en/reports');
  await page.getByLabel('Report number').fill('RPT-102938');
  await page.getByLabel('Mobile number').fill('01812345678');
  await page.getByRole('button', { name: 'Find my report' }).click();
  const sending = page.getByRole('button', { name: 'Sending...' });
  await expect(sending).toBeVisible();
  await expect(sending).toBeDisabled();
  await expect(page.locator('form[aria-busy="true"]')).toHaveCount(1);
  await expect(page.getByTestId('demo-confirmation')).toBeVisible();
});

test('photos end fully shown with no placeholder behind them', async ({ page }) => {
  await page.goto('/bn/departments/cardiology', { waitUntil: 'networkidle' });
  const photo = page.locator('main img').first();
  await expect(photo).toHaveCSS('opacity', '1');
  await expect(
    photo.locator('xpath=preceding-sibling::span[contains(@class, "skeleton")]'),
  ).toHaveCount(0);
});

test('static pages ship their content, not a loading screen', async ({ request }) => {
  const html = await (await request.get('/en/departments')).text();
  expect(html).toContain('<h1');
  expect(html).not.toContain('data-testid="loading"');
});
