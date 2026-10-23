// Information pages in a real browser. Implements: T-WEB-12 acceptance; AT-WEB-001 (routes in
// both languages), AT-WEB-033 (contact form), AT-WEB-042, AT-WEB-055, AT-WEB-056, AT-WEB-057.
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const ROUTES = [
  '/about',
  '/patients-and-visitors',
  '/emergency',
  '/portal',
  '/branches',
  '/branches/gulshan',
  '/contact',
  '/articles',
  '/articles/dengue-season-care',
  '/notices',
  '/careers',
];

for (const prefix of ['/bn', '/en']) {
  test(`every information page renders under ${prefix} (AT-WEB-001)`, async ({ page }) => {
    for (const route of ROUTES) {
      const response = await page.goto(`${prefix}${route}`);
      expect(response?.status(), route).toBe(200);
      await expect(page.getByRole('heading', { level: 1 }), route).toBeVisible();
    }
  });
}

test('the guide anchors are linkable (AT-WEB-057)', async ({ page }) => {
  for (const id of ['patient-rights', 'admission-payment', 'discharge-checklist']) {
    await page.goto(`/en/patients-and-visitors#${id}`);
    await expect(page.locator(`#${id}`)).toBeVisible();
  }
});

test('a branch page lists only its doctors and its units (AT-WEB-056)', async ({ page }) => {
  await page.goto('/en/branches/uttara');
  await expect(page.getByTestId('branch-units')).toContainText('Dental clinic');
  const results = page.getByTestId('doctor-results');
  await expect(results.getByRole('link', { name: 'Dr. Sabina Yasmin' })).toBeVisible();
  await expect(results.getByRole('link', { name: 'Dr. Farhana Rahman' })).toHaveCount(0);
  await expect(page.getByLabel('Branch', { exact: true })).toHaveCount(0);
});

test('the contact page shows both hotlines and sends nothing (AT-WEB-033, AT-WEB-055)', async ({
  page,
}) => {
  const requests: string[] = [];
  await page.goto('/en/contact');
  page.on('request', (request) => {
    if (request.method() !== 'GET') requests.push(request.url());
  });
  await expect(page.getByTestId('contact-phones')).toContainText('Outside Dhaka');
  await page.getByLabel('Your name').fill('Rahim Uddin');
  await page.getByLabel('Mobile number').fill('01712345678');
  await page.getByRole('textbox', { name: 'Message' }).fill('What are the visiting hours?');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByTestId('demo-confirmation')).toBeVisible();
  expect(requests).toEqual([]);
});

test('an unknown path shows the localized not-found page with 404 (AT-WEB-042)', async ({
  page,
}) => {
  const response = await page.goto('/bn/no-such-page');
  expect(response?.status()).toBe(404);
  await expect(page.locator('html')).toHaveAttribute('lang', 'bn-BD');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('পেজটি পাওয়া যায়নি');
});

for (const path of [
  '/bn/patients-and-visitors',
  '/en/contact',
  '/en/branches/gulshan',
  '/bn/careers',
]) {
  test(`${path} has no accessibility violations`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}

test('the emergency page puts the call buttons first (critique P0)', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('/bn/emergency');
  const call = page.getByRole('main').getByRole('link', { name: /ইমার্জেন্সিতে কল করুন/ });
  await expect(call).toBeInViewport();
});
