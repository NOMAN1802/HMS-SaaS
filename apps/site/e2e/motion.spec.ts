// Motion layer (C-083, C-085, T-WEB-15): with motion allowed, the page settles in and leaves no
// transform behind, sections reveal as they scroll in and the header gains its shadow on scroll; with reduced
// motion nothing moves. The stats count-up is unit tested, as the stats section is hidden in the
// current content. The other specs run with reduced motion (playwright.config.ts), so this file is
// the one that sees motion.
import { expect, test } from '@playwright/test';
import { scan, settle } from './a11y';

// At the top of the page the shadow is either absent or still fully transparent.
const NO_SHADOW = /^(none|rgba\(0, 0, 0, 0\) 0px 0px 0px 0px, rgba\(0, 0, 0, 0\) 0px 0px 0px 0px)$/;

test.describe('with motion allowed', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' } });

  test('the hero settles in and leaves no transform behind', async ({ page }) => {
    await page.goto('/bn');
    const heading = page.getByRole('heading', { level: 1 });
    await settle(page);
    await expect(heading).toHaveCSS('opacity', '1');
    await expect(heading).toHaveCSS('translate', 'none');
    // The emergency line keeps its repeating ring.
    const ring = await page
      .getByTestId('hero-emergency')
      .locator('.ping')
      .evaluate((element) => getComputedStyle(element, '::after').animationName);
    expect(ring).toBe('site-ping');
  });

  test('sections reveal on scroll and the header gains its shadow', async ({ page }) => {
    await page.goto('/bn');
    await settle(page);
    const header = page.locator('header').first();
    await expect(header).toHaveCSS('box-shadow', NO_SHADOW);
    // Once the page hydrates, a card below the fold waits transparent (scroll-reveal.tsx, C-085).
    const card = page.locator('.reveal-list > li').last();
    await expect(card).toHaveAttribute('data-reveal-pending', '');
    await expect(card).toHaveCSS('opacity', '0');
    await card.scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, 200);
    await expect(card).toHaveCSS('opacity', '1');
    await expect(card).not.toHaveAttribute('data-reveal-pending');
    await expect(header).not.toHaveCSS('box-shadow', NO_SHADOW);
  });

  test('the moving parts never push a 360 px phone sideways', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    for (const path of ['/bn', '/bn/emergency', '/bn/doctors']) {
      await page.goto(path);
      const width = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(width, path).toBeLessThanOrEqual(360);
    }
  });

  test('the home page stays axe clean once every section has revealed', async ({ page }) => {
    await page.goto('/bn');
    await settle(page);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.evaluate(() => window.scrollTo(0, 0));
    const results = await scan(page);
    expect(results.violations).toEqual([]);
  });
});

test('reduced motion keeps the page still', async ({ page }) => {
  await page.goto('/bn');
  const moving = await page.evaluate(() =>
    document
      .getAnimations()
      .map((animation) => (animation as CSSAnimation).animationName)
      .filter((name) => name !== 'site-fade' && name !== 'site-elevate'),
  );
  expect(moving).toEqual([]);
});
