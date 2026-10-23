// Site-wide search in a real browser. Implements: T-WEB-17 acceptance; AT-WEB-058.
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('"card" finds doctors and departments, grouped (AT-WEB-058)', async ({ page }) => {
  await page.goto('/en/search?q=card');
  await expect(page.getByTestId('search-group-doctor')).toContainText('Dr. Farhana Rahman');
  await expect(page.getByTestId('search-group-department')).toContainText('Cardiology');
});

test('the Bangla word finds the same department', async ({ page }) => {
  await page.goto('/bn/search');
  await page.getByLabel('ডাক্তার বা ডিপার্টমেন্ট খুঁজুন').fill('কার্ড');
  await expect(page.getByTestId('search-group-department')).toContainText('কার্ডিওলজি');
  await expect(page).toHaveURL(/q=/);
});

test('"ecg" finds packages and tests; a Bangla-digit code finds the test', async ({ page }) => {
  await page.goto('/en/search?q=ecg');
  await expect(page.getByTestId('search-group-package')).toBeVisible();
  await expect(page.getByTestId('search-group-test')).toContainText('ECG (12 lead)');
  await page.goto('/bn/search?q=ft৪');
  await expect(page.getByTestId('search-group-test')).toContainText('FT4');
  await page.getByTestId('search-group-test').getByRole('link').first().click();
  await expect(page.getByTestId('test-count')).toHaveText('১টি টেস্ট');
});

test('the header search link opens the search page', async ({ page }) => {
  await page.goto('/en');
  await page.getByRole('banner').getByRole('link', { name: 'Search the site' }).click();
  await expect(page).toHaveURL(/\/en\/search$/);
});

test('the search page has no accessibility violations', async ({ page }) => {
  await page.goto('/bn/search?q=কার্ড');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
