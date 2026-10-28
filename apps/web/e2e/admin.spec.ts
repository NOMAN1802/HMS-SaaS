// Temporary passwords and hospital administration in a real browser (T-ACC-05; FR-ACC-007,
// FR-ACC-008; SCR-22). The API is the contract-valid mock; texts come from the catalogs.
import AxeBuilder from '@axe-core/playwright';
import { messages } from '@hms/i18n';
import { expect, type Page, test } from '@playwright/test';
import { installMockApi, newWorld, type MockWorld } from './support/mock-api';

const bn = messages['bn-BD'];
const ADMIN_PERMISSIONS = ['admin.user.manage', 'admin.role.manage'];

async function signIn(page: Page, world: MockWorld) {
  await page.goto('/staff/login');
  await page.getByLabel(bn.login.usernameLabel).fill(world.username);
  await page.getByLabel(bn.login.passwordLabel).fill(world.password);
  await page.getByRole('button', { name: bn.login.submit }).click();
}

test('a temporary password must be replaced before the shell (FR-ACC-007)', async ({ page }) => {
  const world = newWorld({ mustChangePassword: true });
  await installMockApi(page, world);
  await signIn(page, world);

  await expect(page).toHaveURL(/\/staff\/change-password$/);
  await expect(page.getByText(bn.changePassword.forced)).toBeVisible();
  await page.getByLabel(bn.changePassword.current).fill(world.password);
  await page
    .getByRole('textbox', { name: bn.changePassword.next, exact: true })
    .fill('my own new password');
  await page.getByLabel(bn.changePassword.repeat).fill('my own new password');
  await page.getByRole('button', { name: bn.changePassword.submit }).click();

  await expect(page).toHaveURL(/\/staff$/);
});

test('the two new passwords must match', async ({ page }) => {
  const world = newWorld({ mustChangePassword: true });
  await installMockApi(page, world);
  await signIn(page, world);
  await page.getByLabel(bn.changePassword.current).fill(world.password);
  await page
    .getByRole('textbox', { name: bn.changePassword.next, exact: true })
    .fill('my own new password');
  await page.getByLabel(bn.changePassword.repeat).fill('something else entirely');
  await page.getByRole('button', { name: bn.changePassword.submit }).click();
  await expect(page.getByText(bn.changePassword.mismatch)).toBeVisible();
});

test('an administrator adds a user with a temporary password', async ({ page }) => {
  const world = newWorld({ permissions: ADMIN_PERMISSIONS });
  await installMockApi(page, world);
  await signIn(page, world);

  await page.getByRole('link', { name: bn.nav.users }).first().click();
  await expect(page.getByRole('heading', { name: bn.admin.usersTitle, level: 1 })).toBeVisible();
  await expect(page.getByText('Karim Hossain')).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  await page.getByRole('button', { name: bn.admin.addUser }).click();
  await page.getByLabel(bn.admin.username).fill('selina');
  await page.getByLabel(bn.admin.displayName).fill('Selina Akter');
  await page.getByLabel(bn.admin.temporaryPasswordLabel).fill('temporary pass 1');
  await page.getByRole('checkbox', { name: /Cashier/ }).check();
  await page.getByRole('button', { name: bn.admin.create }).click();

  await expect(page.getByText('Selina Akter')).toBeVisible();
  await expect(page.getByText(bn.admin.mustChange)).toBeVisible();
});

test('an administrator creates a role from a template', async ({ page }) => {
  const world = newWorld({ permissions: ADMIN_PERMISSIONS });
  await installMockApi(page, world);
  await signIn(page, world);

  await page.getByRole('link', { name: bn.nav.roles }).first().click();
  await page.getByRole('button', { name: bn.admin.addRole }).click();
  await page.getByLabel(bn.admin.fromTemplate).selectOption('ADM');
  await page.getByLabel(bn.admin.roleCode).fill('DEPUTY_ADMIN');
  await page.getByRole('button', { name: bn.admin.create }).click();

  await expect(page.getByText('DEPUTY_ADMIN')).toBeVisible();
});

test('staff without administration permissions see no admin links', async ({ page }) => {
  const world = newWorld();
  await installMockApi(page, world);
  await signIn(page, world);
  await expect(page).toHaveURL(/\/staff$/);
  await expect(page.getByRole('link', { name: bn.nav.users })).toHaveCount(0);
});
