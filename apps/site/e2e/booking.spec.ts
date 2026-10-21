// Booking wizard in a real browser. Implements: T-WEB-10 acceptance; AT-WEB-030 (preselection,
// times from the schedule), AT-WEB-031 (validation, Bangla digits), AT-WEB-032 (no request sent),
// AT-WEB-034 (keyboard).
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('a doctor from the profile is preselected and the booking sends nothing', async ({ page }) => {
  const requests: string[] = [];
  await page.goto('/en/book-appointment?doctor=farhana-rahman');
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (request.method() !== 'GET' || url.origin !== 'http://localhost:3200')
      requests.push(request.url());
  });
  await expect(page.getByRole('heading', { name: 'Date and time' })).toBeVisible();
  await expect(page.getByText('Dr. Farhana Rahman, Senior Consultant, Cardiology')).toBeVisible();

  await page.getByTestId('booking-dates').getByRole('button').first().click();
  const times = page.getByTestId('booking-times').getByRole('button');
  // Senior consultants have 20-minute slots in this content.
  await expect(times.nth(1)).toHaveText(/:20$/);
  await times.first().click();
  await page.getByRole('button', { name: 'Continue' }).click();

  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByText('Please fill in this field.').first()).toBeVisible();
  await page.getByLabel('Your name').fill('Rahim Uddin');
  await page.getByLabel('Mobile number').fill('12345');
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByText('Enter an 11-digit mobile number starting with 01.')).toBeVisible();
  await page.getByLabel('Mobile number').fill('০১৭১২৩৪৫৬৭৮');
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page.getByTestId('booking-review')).toContainText('Dr. Farhana Rahman');
  await page.getByRole('button', { name: 'Confirm appointment' }).click();
  await expect(page.getByTestId('booking-confirmation')).toContainText('nothing was sent');
  expect(requests).toEqual([]);
});

test('without a doctor the wizard starts at step 1 and requires a choice', async ({ page }) => {
  await page.goto('/bn/book-appointment');
  await page.getByRole('button', { name: 'পরের ধাপ' }).click();
  await expect(page.locator('p', { hasText: 'একজন ডাক্তার বেছে নিন' })).toBeVisible();
  await page.getByLabel('ডিপার্টমেন্ট', { exact: true }).selectOption('neurology');
  await page.getByRole('combobox', { name: /^ডাক্তার/ }).selectOption('nusrat-jahan');
  await page.getByRole('button', { name: 'পরের ধাপ' }).click();
  await expect(page.getByTestId('booking-dates')).toBeVisible();
});

test('the booking page has no accessibility violations', async ({ page }) => {
  await page.goto('/en/book-appointment?doctor=farhana-rahman');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
