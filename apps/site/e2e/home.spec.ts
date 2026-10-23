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
    'service-strip',
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

// Featured doctors and packages are user-driven sliders (C-084, APG carousel pattern).
test('the doctor slider moves with its buttons and with keyboard focus', async ({ page }) => {
  await page.goto('/en');
  const slider = page.locator('[aria-labelledby="doctors-heading"]');
  await expect(slider).toHaveAttribute('aria-roledescription', 'Carousel');
  const slides = slider.locator('[data-slide]');
  await expect(slides.first()).toHaveAttribute('aria-label', '1 of 8');
  const previous = slider.getByRole('button', { name: 'Previous' });
  const next = slider.getByRole('button', { name: 'Next' });
  await expect(previous).toBeDisabled();

  await next.click();
  await expect(slides.nth(4)).toBeInViewport();
  await expect(slides.first()).not.toBeInViewport();
  await expect(previous).toBeEnabled();
  await previous.click();
  await expect(slides.first()).toBeInViewport();

  // Tabbing into a card off screen slides it into view.
  await slides.nth(6).getByRole('link').first().focus();
  await expect(slides.nth(6)).toBeInViewport();
  // Shift+Tab back out of the second screenful lands on a card that is slid back into view
  // (the slide must be mapped to its screenful, not passed to Embla as one).
  await slides.nth(4).getByRole('link').first().focus();
  await page.keyboard.press('Shift+Tab');
  await expect(page.locator(':focus')).toBeInViewport();
  await expect(slides.nth(3)).toBeInViewport();
});

test('slide labels use Bangla words and digits', async ({ page }) => {
  await page.goto('/bn');
  const slides = page.locator('[aria-labelledby="packages-heading"] [data-slide]');
  await expect(slides.first()).toHaveAttribute('aria-label', /^[০-৯]+টির মধ্যে ১$/);
});
