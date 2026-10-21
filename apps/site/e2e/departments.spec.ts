// Departments and centres in a real browser. Implements: T-WEB-08 acceptance; AT-WEB-013,
// AT-WEB-052, AT-WEB-054 (call-back form on a department page).
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('the departments page lists every department', async ({ page }) => {
  await page.goto('/en/departments');
  await expect(page.getByRole('main').locator('a[href^="/en/departments/"]')).toHaveCount(12);
});

test('a department page lists exactly its doctors (AT-WEB-013)', async ({ page }) => {
  await page.goto('/en/departments/cardiology');
  const doctors = page.locator('section[aria-labelledby="doctors-heading"]');
  await expect(doctors.getByRole('heading', { level: 3 })).toHaveText([
    'Dr. Farhana Rahman',
    'Dr. Tanvir Ahmed',
  ]);
});

test('OPD hours use the page digits (AT-WEB-052)', async ({ page }) => {
  await page.goto('/bn/departments/cardiology');
  await expect(page.getByTestId('opd-hours')).toContainText('শনিবার');
  await expect(page.getByTestId('opd-hours')).toContainText('সকাল ৯টা');
});

test('the call-back form validates and sends nothing (AT-WEB-054)', async ({ page }) => {
  const requests: string[] = [];
  await page.goto('/en/departments/cardiology');
  page.on('request', (request) => {
    if (request.method() !== 'GET') requests.push(request.url());
  });
  await expect(page.getByLabel('Department', { exact: true })).toHaveValue('cardiology');
  await page.getByRole('button', { name: 'Request a call back' }).click();
  await expect(page.getByText('Please fill in this field.').first()).toBeVisible();
  await page.getByLabel('Your name').fill('Rahim Uddin');
  await page.getByLabel('Mobile number').fill('০১৭১২৩৪৫৬৭৮');
  await page.getByRole('button', { name: 'Request a call back' }).click();
  await expect(page.getByTestId('demo-confirmation')).toBeVisible();
  expect(requests).toEqual([]);
});

test('a centre page links its departments and doctors', async ({ page }) => {
  await page.goto('/en/centres/mother-child');
  await expect(page.getByRole('link', { name: /Paediatrics/ })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Dr. Rokeya Sultana' })).toBeVisible();
});

for (const path of ['/bn/departments/cardiology', '/en/centres/heart-centre']) {
  test(`${path} has no accessibility violations`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}
