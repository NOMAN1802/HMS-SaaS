// Keyboard and accessibility checks for the shared primitives, in a real browser.
// Implements: T-UI-01, ADR-022 section 8 (each primitive: keyboard contract and an axe check).
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// RA HA I-KAR MA, the start of the Bangla name in the gallery sample data.
const BANGLA_QUERY = '\u09B0\u09B9\u09BF';

test.beforeEach(async ({ page }) => {
  await page.goto('/staff/dev/ui');
  await expect(page.getByRole('heading', { name: 'UI gallery', level: 1 })).toBeVisible();
});

test('the gallery has no accessibility violations', async ({ page }) => {
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test('uses the heading and body font tokens', async ({ page }) => {
  const fonts = await page.evaluate(() => ({
    heading: getComputedStyle(document.querySelector('h1') as Element).fontFamily,
    body: getComputedStyle(document.body).fontFamily,
  }));
  expect(fonts.heading).toContain('TikTok Sans Variable');
  expect(fonts.body).toContain('Geist Variable');
});

test('dialog: keyboard open, focus stays inside, Escape closes and focus returns', async ({
  page,
}) => {
  const opener = page.getByRole('button', { name: 'Add note' });
  await opener.focus();
  await page.keyboard.press('Enter');

  const dialog = page.getByRole('dialog', { name: 'Visit note' });
  await expect(dialog).toBeVisible();
  for (let i = 0; i < 6; i += 1) {
    await expect(dialog.locator(':focus')).toHaveCount(1);
    await page.keyboard.press('Tab');
  }

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
});

test('dialog: closing with unsaved text asks first and Stay keeps the note', async ({ page }) => {
  await page.getByRole('button', { name: 'Add note' }).click();
  await page.getByLabel('Note', { exact: true }).fill('Allergic to penicillin');
  await page.keyboard.press('Escape');

  const confirm = page.getByRole('dialog', { name: 'Discard this note?' });
  await expect(confirm).toBeVisible();
  await confirm.getByRole('button', { name: 'Stay' }).click();
  await expect(confirm).toBeHidden();
  await expect(page.getByLabel('Note', { exact: true })).toHaveValue('Allergic to penicillin');

  await page.keyboard.press('Escape');
  await page
    .getByRole('dialog', { name: 'Discard this note?' })
    .getByRole('button', { name: 'Discard' })
    .click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('menu: arrows move, disabled item is skipped, Escape returns focus', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Invoice actions' });
  await trigger.focus();
  await page.keyboard.press('ArrowDown');

  await expect(page.getByRole('menu', { name: 'Invoice actions' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Print receipt' })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menuitem', { name: 'Cancel invoice' })).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(page.getByRole('menu')).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('tabs: arrow keys move focus and select', async ({ page }) => {
  await page.getByRole('tab', { name: 'Visits' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Invoices' })).toBeFocused();
  await expect(page.getByRole('tab', { name: 'Invoices' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(page.getByText('Invoices appear here.')).toBeVisible();
  await page.keyboard.press('End');
  await expect(page.getByRole('tab', { name: 'Reports' })).toBeFocused();
});

test('combobox: type, arrow, Enter selects', async ({ page }) => {
  const input = page.getByRole('combobox', { name: 'Find patient' });
  await input.fill('rah');

  const listbox = page.getByRole('listbox', { name: 'Patients' });
  await expect(listbox).toBeVisible();
  await expect(listbox.getByRole('option')).toHaveCount(2);

  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('selected')).toHaveText('Rahim Uddin');
  await expect(input).toHaveValue('Rahim Uddin');
});

test('combobox: finds Bangla names and submits scanner input with Enter', async ({ page }) => {
  const input = page.getByRole('combobox', { name: 'Find patient' });
  await input.fill(BANGLA_QUERY);
  // Both Bangla sample names start with these letters.
  await expect(page.getByRole('listbox', { name: 'Patients' }).getByRole('option')).toHaveCount(2);

  await input.fill('01700000001');
  await expect(page.getByText('No patients found')).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('submitted')).toHaveText('01700000001');
});

test('toast: appears in the notification list and is accessible', async ({ page }) => {
  await page.getByRole('button', { name: 'Success toast' }).click();
  const list = page.getByRole('region', { name: 'Notifications' });
  await expect(list).toContainText('Payment saved');

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);

  await list.getByRole('button', { name: 'Dismiss' }).click();
  await expect(list).toHaveCount(0);
});

test('does not overflow horizontally at phone width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
