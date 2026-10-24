// Site-wide search in a real browser. Implements: T-WEB-17 acceptance; AT-WEB-058.
import { expect, test } from '@playwright/test';
import { scan } from './a11y';

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

test('the header search opens a bar with live results instead of leaving the page', async ({
  page,
}) => {
  await page.goto('/en/about');
  await page.getByTestId('header-search-toggle').click();
  await expect(page).toHaveURL(/\/en\/about$/);
  const bar = page.getByTestId('header-search');
  await bar.getByRole('searchbox').fill('card');
  await expect(bar.getByRole('region', { name: 'Doctors' })).toContainText('Dr. Farhana Rahman');
  await expect(bar.getByRole('region', { name: 'Departments' })).toContainText('Cardiology');
  await page.keyboard.press('Escape');
  await expect(bar).toBeHidden();
  await expect(page.getByTestId('header-search-toggle')).toBeFocused();
});

test('a header search result opens its page and closes the bar', async ({ page }) => {
  await page.goto('/bn');
  await page.getByTestId('header-search-toggle').click();
  const bar = page.getByTestId('header-search');
  await bar.getByRole('searchbox').fill('কার্ড');
  await bar.getByRole('region', { name: 'ডিপার্টমেন্ট' }).getByRole('link').first().click();
  await expect(page).toHaveURL(/\/bn\/departments\//);
  await expect(bar).toBeHidden();
});

test('the header search bar has no accessibility violations', async ({ page }) => {
  await page.goto('/en');
  await page.getByTestId('header-search-toggle').click();
  await page.getByTestId('header-search').getByRole('searchbox').fill('card');
  await expect(page.getByTestId('header-search').getByRole('region').first()).toBeVisible();
  const results = await scan(page, '[data-testid="header-search"]');
  expect(results.violations).toEqual([]);
});

test('the search page has no accessibility violations', async ({ page }) => {
  await page.goto('/bn/search?q=কার্ড');
  const results = await scan(page);
  expect(results.violations).toEqual([]);
});
