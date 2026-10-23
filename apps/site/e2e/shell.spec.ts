// The site shell in a real browser: one-tap phone numbers, the language switch keeping the page,
// the demo notice, and keyboard use of the mobile menu. Implements: T-WEB-05 acceptance;
// AT-WEB-004, AT-WEB-005, AT-WEB-034 (menu), AT-WEB-055, FR-WEB-GEN-004.
import { expect, test } from '@playwright/test';

test('emergency and both hotlines are tel: links on the page (AT-WEB-005, AT-WEB-055)', async ({
  page,
}) => {
  await page.goto('/en');
  await expect(page.getByTestId('emergency-call')).toHaveAttribute('href', /^tel:\+?\d+$/);
  const tel = page.locator('a[href^="tel:"]');
  expect(await tel.count()).toBeGreaterThanOrEqual(4);
  await expect(page.getByRole('contentinfo').getByText(/Outside Dhaka/)).toBeVisible();
});

test('the language switch keeps the current page (AT-WEB-004)', async ({ page }) => {
  await page.goto('/bn');
  await page
    .getByRole('navigation', { name: 'ভাষা' })
    .getByRole('link', { name: 'English' })
    .click();
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('the demo notice is shown and can be hidden (FR-WEB-GEN-004)', async ({ page }) => {
  await page.goto('/en');
  await expect(page.getByTestId('demo-notice')).toContainText('Demo content');
  await page.getByRole('button', { name: 'Hide notice' }).click();
  await expect(page.getByTestId('demo-notice')).toHaveCount(0);
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('the menu opens and closes with the keyboard (AT-WEB-034)', async ({ page }) => {
    await page.goto('/en');
    const menu = page.getByRole('button', { name: 'Menu' });
    await menu.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: 'Menu' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('link', { name: 'Doctors' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('call and book stay one tap away', async ({ page }) => {
    await page.goto('/en');
    const bar = page.getByTestId('phone-action-bar');
    await expect(bar.getByRole('link', { name: 'Hotline' })).toHaveAttribute('href', /^tel:/);
    await expect(bar.getByRole('link', { name: 'Book' })).toBeVisible();
  });
});
