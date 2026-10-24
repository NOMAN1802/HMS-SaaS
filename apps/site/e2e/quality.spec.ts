// WEB-A quality pass (T-WEB-15, H section 2): every page in the sitemap renders in both languages
// without console errors; every page type is axe clean in both languages; no page type shows the
// same picture twice; and no page type scrolls sideways on a 360 px phone.
// Implements: AT-WEB-001, AT-WEB-035, NFR-WEB-ACC-001, NFR-WEB-RESP-001.
import { expect, test } from '@playwright/test';
import { scan } from './a11y';

const ORIGIN = 'https://healthcare.bytespate.com';

// One page per template, so axe and layout checks stay fast while covering every page type.
const TEMPLATES = [
  '',
  '/doctors',
  '/doctors/farhana-rahman',
  '/departments',
  '/departments/cardiology',
  '/centres',
  '/centres/heart-centre',
  '/packages',
  '/packages/executive-health-check',
  '/tests',
  '/book-appointment',
  '/reports',
  '/sample-collection',
  '/feedback',
  '/patients-and-visitors',
  '/emergency',
  '/branches',
  '/branches/gulshan',
  '/contact',
  '/articles',
  '/articles/heart-attack-warning-signs',
  '/notices',
  '/about',
  '/careers',
  '/portal',
  '/search',
];

test('every sitemap page renders with one h1, the right language and no console errors', async ({
  page,
  request,
}) => {
  test.setTimeout(180_000);
  const sitemap = await (await request.get('/sitemap.xml')).text();
  const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) =>
    (match[1] as string).replace(ORIGIN, ''),
  );
  expect(paths.length).toBeGreaterThan(100);
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`${page.url()}: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`${page.url()}: ${error.message}`));
  for (const path of paths) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
    await expect(page.getByRole('heading', { level: 1 }), path).toHaveCount(1);
    await expect(page.locator('html'), path).toHaveAttribute(
      'lang',
      path.startsWith('/en') ? 'en' : 'bn-BD',
    );
  }
  expect(errors).toEqual([]);
});

for (const prefix of ['/bn', '/en']) {
  test(`every page type is axe clean under ${prefix} (AT-WEB-035)`, async ({ page }) => {
    test.setTimeout(180_000);
    for (const path of TEMPLATES) {
      await page.goto(`${prefix}${path}`);
      const results = await scan(page);
      expect(results.violations, `${prefix}${path}`).toEqual([]);
    }
  });
}

// Each card and page shows its own picture: one image slot must not stand in for another (T-WEB-14).
// Hidden tab panels repeat cards by design, so only visible images count.
test('no page type shows the same picture twice', async ({ page }) => {
  test.setTimeout(180_000);
  for (const path of TEMPLATES) {
    await page.goto(`/bn${path}`);
    const shown = await page.$$eval('img', (images) =>
      images
        .filter((image) => image.checkVisibility())
        .map((image) => decodeURIComponent(image.src).match(/\/images\/([a-z0-9-]+)\.webp/)?.[1])
        .filter((name) => name !== undefined),
    );
    const repeated = shown.filter((name, index) => shown.indexOf(name) !== index);
    expect(repeated, `/bn${path}`).toEqual([]);
  }
});

test.describe('on a 360 px phone', () => {
  test.use({ viewport: { width: 360, height: 780 } });

  test('no page type scrolls sideways (NFR-WEB-RESP-001)', async ({ page }) => {
    test.setTimeout(180_000);
    for (const path of TEMPLATES) {
      await page.goto(`/bn${path}`);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `/bn${path}`).toBeLessThanOrEqual(0);
    }
  });
});
