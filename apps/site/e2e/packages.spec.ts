// Packages and test prices in a real browser. Implements: T-WEB-09 acceptance; AT-WEB-020,
// AT-WEB-021, AT-WEB-022, AT-WEB-053.
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('package prices use lakh grouping and the taka sign in both languages (AT-WEB-020)', async ({
  page,
}) => {
  await page.goto('/en/packages/executive-health-check');
  const table = page.getByTestId('package-price-table');
  await expect(table).toContainText('৳ 13,950.00');
  await expect(table).toContainText('৳ 9,800.00');
  await expect(table).toContainText('৳ 4,150.00');
  await page.goto('/bn/packages/executive-health-check');
  await expect(page.getByTestId('package-price-table')).toContainText('৳ ১৩,৯৫০.০০');
});

test('every package card says the price is a sample (AT-WEB-021)', async ({ page }) => {
  await page.goto('/en/packages');
  const panel = page.getByRole('tabpanel');
  await expect(panel.getByText('Sample price')).toHaveCount(10);
});

test('category tabs filter packages', async ({ page }) => {
  await page.goto('/en/packages');
  await page.getByRole('tab', { name: 'Women' }).click();
  await expect(page.getByRole('tabpanel').getByRole('heading', { level: 3 })).toHaveText([
    "Women's wellness package",
  ]);
});

test('test search works by code, Bangla name and Bangla digits (AT-WEB-022)', async ({ page }) => {
  await page.goto('/en/tests');
  await expect(page.getByTestId('test-count')).toHaveText('40 tests');
  await page.getByLabel('Test name or code').fill('lab-cbc');
  await expect(page.getByTestId('test-count')).toHaveText('1 test');
  await page.goto('/bn/tests');
  await page.getByLabel('পরীক্ষার নাম বা কোড').fill('এফটি৪');
  await expect(page.getByTestId('test-table')).toContainText('BIO-FT');
});

for (const path of ['/bn/packages', '/en/packages/women-wellness', '/bn/tests']) {
  test(`${path} has no accessibility violations`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}
