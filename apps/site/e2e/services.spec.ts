// Patient service forms in a real browser: each validates, ends in the demo message and sends
// nothing. Implements: T-WEB-11 acceptance; AT-WEB-033.
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

function watchRequests(page: Page): string[] {
  const requests: string[] = [];
  page.on('request', (request) => {
    if (request.method() !== 'GET') requests.push(request.url());
  });
  return requests;
}

test('report lookup validates and shows the demo result', async ({ page }) => {
  await page.goto('/en/reports');
  const requests = watchRequests(page);
  await page.getByRole('button', { name: 'Find my report' }).click();
  await expect(page.locator('p', { hasText: 'Please fill in this field.' }).first()).toBeVisible();
  await page.getByLabel('Report number').fill('RPT-102938');
  await page.getByLabel('Mobile number').fill('01812345678');
  await page.getByRole('button', { name: 'Find my report' }).click();
  await expect(page.getByTestId('demo-confirmation')).toBeVisible();
  expect(requests).toEqual([]);
});

test('home sample collection needs an address and a date', async ({ page }) => {
  await page.goto('/bn/sample-collection');
  const requests = watchRequests(page);
  await page.getByLabel('আপনার নাম').fill('রহিম উদ্দিন');
  await page.getByLabel('মোবাইল নম্বর').fill('০১৯১২৩৪৫৬৭৮');
  await page.getByLabel('কোন দিন আসতে চান').selectOption({ index: 2 });
  await page.getByRole('button', { name: 'রিকোয়েস্ট পাঠান' }).click();
  await expect(page.locator('p', { hasText: 'এই ঘরটি পূরণ করুন।' })).toHaveCount(1);
  await page.getByRole('textbox', { name: 'ঠিকানা' }).fill('বাড়ি ১, সড়ক ২, উত্তরা');
  await page.getByRole('button', { name: 'রিকোয়েস্ট পাঠান' }).click();
  await expect(page.getByTestId('demo-confirmation')).toBeVisible();
  expect(requests).toEqual([]);
});

test('feedback accepts an anonymous message', async ({ page }) => {
  await page.goto('/en/feedback');
  await page.getByLabel('How was your visit?').selectOption('4');
  await page.getByRole('textbox', { name: 'Message' }).fill('The waiting area was clean.');
  await page.getByRole('button', { name: 'Send feedback' }).click();
  await expect(page.getByTestId('demo-confirmation')).toBeVisible();
});

for (const path of ['/bn/reports', '/en/sample-collection', '/bn/feedback']) {
  test(`${path} has no accessibility violations`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}
