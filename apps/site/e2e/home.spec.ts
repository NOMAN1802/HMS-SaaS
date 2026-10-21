// Home page in a real browser: hero search suggestions in both languages and sections rendered in
// stored order. Implements: T-WEB-06 acceptance ("card" suggests Cardiology and its doctors),
// AT-WEB-008 (order and hidden sections).
import { expect, test } from '@playwright/test';

test('searching "card" suggests Cardiology and its doctors', async ({ page }) => {
  await page.goto('/en');
  await page.getByLabel('Search doctors and departments').fill('card');
  const search = page.getByRole('search');
  await expect(search.getByRole('link', { name: /Cardiology/ }).first()).toBeVisible();
  await expect(search.getByRole('link', { name: /Farhana Rahman/ })).toBeVisible();
});

test('the Bangla search matches Bangla text', async ({ page }) => {
  await page.goto('/bn');
  await page.getByLabel('ডাক্তার বা ডিপার্টমেন্ট খুঁজুন').fill('কার্ডিও');
  await expect(
    page
      .getByRole('search')
      .getByRole('link', { name: /কার্ডিওলজি/ })
      .first(),
  ).toBeVisible();
});

test('home sections render in the stored order (AT-WEB-008)', async ({ page }) => {
  await page.goto('/en');
  const order = await page
    .locator('[data-section-id]')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-section-id')));
  expect(order).toEqual([
    'hero',
    'quick-actions',
    'departments',
    'centres',
    'doctors',
    'packages',
    'branches',
    'guide',
    'articles',
    'emergency',
  ]);
});

test('the hero offers an emergency call line', async ({ page }) => {
  await page.goto('/en');
  await expect(page.getByTestId('hero-emergency')).toHaveAttribute('href', /^tel:/);
});
