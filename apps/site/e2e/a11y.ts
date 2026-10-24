// Accessibility scan for the end-to-end specs (AT-WEB-035). Even with reduced motion the site keeps
// a 200 ms cross-fade on page headers and wizard steps (C-083), and axe run inside that window
// measures half-transparent text and reports false contrast failures, so every scan first waits
// for the page's entrance animations to end. Implements: T-WEB-15.
import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

/** Waits for every time-based animation to end; scroll-driven and repeating ones never end. A
 * cancelled animation (a photo fade replaced mid-way) counts as ended. */
export async function settle(page: Page) {
  await page.evaluate(() =>
    Promise.allSettled(
      document
        .getAnimations()
        .filter(
          (animation) =>
            animation.timeline === document.timeline &&
            animation.effect?.getTiming().iterations !== Infinity,
        )
        .map((animation) => animation.finished),
    ),
  );
}

/** Axe results for the page, or for the part matching `selector`, once it has settled. */
export async function scan(page: Page, selector?: string) {
  await settle(page);
  const builder = new AxeBuilder({ page });
  return (selector ? builder.include(selector) : builder).analyze();
}
