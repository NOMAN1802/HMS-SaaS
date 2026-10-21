// Doctor directory and profile in a real browser. Implements: T-WEB-07 acceptance; AT-WEB-010,
// AT-WEB-011, AT-WEB-012, AT-WEB-014, AT-WEB-050 (leave notice), AT-WEB-051 (related doctors).
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('filters by department and branch together and keeps them in the URL', async ({ page }) => {
  await page.goto('/en/doctors');
  await expect(page.getByTestId('doctor-count')).toHaveText('24 doctors found');
  await page.getByLabel('Department').selectOption('cardiology');
  await page.getByLabel('Branch').selectOption('dhanmondi');
  await expect(page).toHaveURL(/department=cardiology/);
  await expect(page).toHaveURL(/branch=dhanmondi/);
  await expect(page.getByTestId('doctor-count')).toHaveText('1 doctor found');

  // A shared link restores the same filters (AT-WEB-011).
  await page.goto('/en/doctors?department=cardiology&branch=dhanmondi');
  await expect(page.getByTestId('doctor-count')).toHaveText('1 doctor found');
  await expect(
    page.getByTestId('doctor-results').getByRole('link', { name: 'Dr. Farhana Rahman' }),
  ).toBeVisible();
});

test('searches by interest and shows the empty state (AT-WEB-010, AT-WEB-014)', async ({
  page,
}) => {
  await page.goto('/en/doctors');
  await page.getByLabel('Name, speciality or interest').fill('migraine');
  await expect(page.getByTestId('doctor-results')).toContainText('Neurology');
  await page.getByLabel('Name, speciality or interest').fill('zzzz');
  await expect(page.getByTestId('doctor-count')).toHaveText('0 doctors found');
  await expect(page.getByText('No doctor matches your search')).toBeVisible();
});

test('the profile shows the schedule with Bangla digits on /bn (AT-WEB-012)', async ({ page }) => {
  await page.goto('/bn/doctors/farhana-rahman');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('ডা. ফারহানা রহমান');
  await expect(page.getByTestId('schedule')).toContainText('০৯:০০');
  await page.goto('/en/doctors/farhana-rahman');
  await expect(page.getByTestId('schedule')).toContainText('09:00');
});

test('a doctor on leave shows the leave notice (AT-WEB-050)', async ({ page }) => {
  await page.goto('/en/doctors/tanvir-ahmed');
  await expect(page.getByTestId('leave-notice')).toContainText('on leave');
});

test('related doctors exclude the doctor and start with the same department (AT-WEB-051)', async ({
  page,
}) => {
  await page.goto('/en/doctors/farhana-rahman');
  const related = page
    .getByRole('region', { name: 'Related doctors' })
    .or(page.locator('section[aria-labelledby="related-heading"]'));
  await expect(related.getByRole('heading', { level: 3 }).first()).toHaveText('Dr. Tanvir Ahmed');
  await expect(related.getByText('Dr. Farhana Rahman')).toHaveCount(0);
});

for (const path of ['/bn/doctors', '/en/doctors/farhana-rahman']) {
  test(`${path} has no accessibility violations`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}
