// The motion packages of C-085 in a real browser: the hero slideshow (Motion) morphs on its own,
// pauses under the pointer and never plays with reduced motion; the services strip
// (react-fast-marquee) gives screen readers one plain list; the success tick (Lottie) follows a sent form; the share
// button copies the link and confirms with a toast (Sonner); the phone menu is a drawer (Vaul).
// Implements: T-WEB-15, C-085.
import { expect, test } from '@playwright/test';
import { scan } from './a11y';

test.describe('with motion allowed', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' } });

  test('the hero slideshow morphs to the next picture and pauses under the pointer', async ({
    page,
  }) => {
    await page.clock.install();
    await page.goto('/en');
    const slides = page.getByTestId('hero-slides');
    const current = slides.locator('[data-active]');
    await expect(current).toHaveAttribute('aria-label', '1 of 4');
    await expect(slides.getByRole('button')).toHaveCount(0);
    // Steps the clock a second at a time, so it does not matter when hydration starts the timer.
    await expect
      .poll(
        async () => {
          await page.clock.runFor(1000);
          return current.getAttribute('aria-label');
        },
        { timeout: 20_000 },
      )
      .toBe('2 of 4');
    await slides.hover();
    await expect(slides).not.toHaveAttribute('data-playing');
    await page.clock.runFor(7000);
    await expect(current).toHaveAttribute('aria-label', '2 of 4');
    await page.mouse.move(0, 0);
    await expect(slides).toHaveAttribute('data-playing', 'true');
    // Each picture after the first links to the service it shows.
    await current.getByRole('link', { name: 'Child health' }).click();
    await expect(page).toHaveURL(/\/en\/departments\/paediatrics$/);
  });

  test('the services strip moves but is read once as a list', async ({ page }) => {
    await page.goto('/bn');
    const strip = page.getByTestId('service-strip');
    await expect(strip.getByRole('listitem')).toHaveCount(10);
    await expect(strip.locator('.rfm-marquee-container')).toBeVisible();
  });
});

test('with reduced motion the slideshow waits and the strip sits still', async ({ page }) => {
  await page.clock.install();
  await page.goto('/en');
  const slides = page.getByTestId('hero-slides');
  await page.clock.runFor(7000);
  await expect(slides.locator('[data-active]')).toHaveAttribute('aria-label', '1 of 4');
  await expect(slides).not.toHaveAttribute('data-playing');
  await expect(page.getByTestId('service-strip').locator('.rfm-marquee-container')).toBeHidden();
});

test('a sent form shows the success tick', async ({ page }) => {
  await page.goto('/en/contact');
  await page.getByLabel('Your name').fill('Rahim Uddin');
  await page.getByLabel('Mobile number').fill('01712345678');
  await page.getByRole('textbox', { name: 'Message' }).fill('What are the visiting hours?');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByTestId('success-tick').locator('svg')).toBeVisible();
  await expect(page.getByTestId('demo-confirmation')).toBeVisible();
});

test('the share button copies the link and confirms with a toast', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/en/articles/dengue-season-care');
  await page.getByTestId('share-button').click();
  await expect(page.getByText('Link copied. Paste it anywhere to share.')).toBeVisible();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toMatch(/\/en\/articles\/dengue-season-care$/);
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('the menu drawer is axe clean and closes with its button', async ({ page }) => {
    await page.goto('/en');
    await page.getByRole('button', { name: 'Menu' }).click();
    const drawer = page.getByRole('dialog', { name: 'Menu' });
    await expect(drawer.getByRole('link', { name: 'Doctors' })).toBeVisible();
    const results = await scan(page, '[data-testid="mobile-menu"]');
    expect(results.violations).toEqual([]);
    await drawer.getByRole('button', { name: 'Close menu' }).click();
    await expect(drawer).toBeHidden();
  });
});
