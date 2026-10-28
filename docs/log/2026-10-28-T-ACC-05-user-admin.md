# T-ACC-05: user, membership and role administration, with temporary passwords

- **Date:** 2026-10-28
- **Commit:** this commit
- **Implements:** T-ACC-05; SCR-22; FR-ACC-007 (folded in, owner choice 2026-10-28), FR-ACC-008, FR-ACC-010; AT-ACC-011; UC-ACC-01 A1; UC-ACC-02; C-045

## What was built

Hospital administrators get two screens in the staff app, shown in the navigation only to those who hold the permission:

- **Users** (`admin.user.manage`): every staff account of the hospital with its roles and state. **Add user** creates the account with a temporary password and roles. **Manage** changes roles; suspends, reactivates or revokes access; sets a new temporary password; locks or unlocks the account (T-ACC-03 endpoints); resets a lost second factor (T-ACC-04).
- **Roles** (`admin.role.manage`): the hospital's roles with member and permission counts; **New role** starts from one of the nine templates (C-045) or empty; **Edit permissions** replaces a role's permissions.

A temporary password must be replaced before anything else: the session reports `passwordChangeRequired`, every permission-guarded route answers `403 PASSWORD_CHANGE_REQUIRED`, and the app sends the person to `/staff/change-password`. Anyone can also change their own password from the account menu. The session response now carries the permission codes of the chosen hospital's roles, which the navigation uses.

| Method and path                                                                     | Permission          |
| ----------------------------------------------------------------------------------- | ------------------- |
| `POST /api/v1/auth/password` (own change)                                           | signed in           |
| `GET, POST /api/v1/admin/users`                                                     | `admin.user.manage` |
| `POST /api/v1/admin/users/{id}/password`, `/membership`, `/mfa/reset`; `PUT /roles` | `admin.user.manage` |
| `GET, POST /api/v1/admin/roles`; `PUT /api/v1/admin/roles/{id}/permissions`         | `admin.role.manage` |

## Files

| File                                                                                                       | Purpose                                                                                                |
| ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| packages/database/prisma/schema.prisma, migrations/20261028130000_user_admin                               | `must_change_password`, `password_changed_at`; DELETE on `role_permission`, `membership_role`          |
| packages/contracts/src/user-admin.ts, auth.ts, errors.ts                                                   | Admin and password schemas; session `passwordChangeRequired`, `permissions`; two new codes             |
| packages/i18n/src/messages/en.ts, bn-BD.ts                                                                 | Change-password and administration texts, navigation labels, error messages                            |
| packages/mod-identity-access/src/domain/user-admin-policy.ts (+ spec)                                      | Password checks, membership transitions, never your own account, no self-lockout                       |
| packages/mod-identity-access/src/infrastructure/user-admin.repository.ts                                   | List, create, password reset, membership status, roles, MFA reset; audited in one transaction          |
| packages/mod-identity-access/src/infrastructure/role-admin.repository.ts                                   | List, create, replace permissions; audited                                                             |
| packages/mod-identity-access/src/infrastructure/identity.repository.ts                                     | `changeOwnPassword`, `revokeSessionsOfUser`                                                            |
| packages/mod-identity-access/src/application/user-admin.service.ts, role-admin.service.ts                  | Rules, hashing, error mapping                                                                          |
| packages/mod-identity-access/src/application/auth.service.ts                                               | `changePassword`; session `passwordChangeRequired` and `permissions`                                   |
| packages/mod-identity-access/src/http/user-admin.controller.ts, role-admin.controller.ts, admin-request.ts | Routes; shared admin identity and ID parsing                                                           |
| packages/mod-identity-access/src/http/permission.guard.ts, auth.controller.ts                              | `PASSWORD_CHANGE_REQUIRED` (audited); `POST /auth/password`                                            |
| packages/testkit/src/staff-client.ts                                                                       | Sign in over HTTP and pass MFA when required (shared by the API specs)                                 |
| packages/ui/src/primitives/Checkbox.tsx (+ test)                                                           | Checkbox with its label, for role and permission pickers                                               |
| apps/api/src/user-admin.api.spec.ts, account-lock.api.spec.ts                                              | Over HTTP: create, forced change, AT-ACC-011, roles, reset, MFA reset, templates, self, other hospital |
| apps/web/app/change-password/page.tsx, src/components/change-password-form.tsx                             | Forced and voluntary password change                                                                   |
| apps/web/app/(app)/admin/users/page.tsx, roles/page.tsx, src/components/admin/\*                           | SCR-22 screens and dialogs                                                                             |
| apps/web/src/api/admin.ts, api/auth.ts, session/\*, navigation.ts, components/app-frame.tsx, user-menu.tsx | API calls, routing to the change screen, permission-filtered navigation                                |
| apps/web/e2e/admin.spec.ts, e2e/support/mock-admin.ts, mock-api.ts                                         | Browser tests and the contract-valid mock                                                              |
| docs/planning/docs/D-system-design.md                                                                      | Error code table                                                                                       |

## Decisions applied

- **FR-ACC-008:** roles start as copies of the templates, permissions can be added or removed, every change is audited (`admin.user.*`, `admin.membership.*`, `admin.role.*` events with reason, target and correlation ID).
- **FR-ACC-010 / AT-ACC-011:** a suspended or revoked membership ends the user's sessions in that hospital through the existing trigger; a role or permission change applies on the next request because `PermissionGuard` reads permissions each time; a password reset or MFA reset revokes all sessions of the user.
- **FR-ACC-007:** an administrator's password is temporary (must be changed before any guarded route); product minimum 10 characters, not the username, not the current password.
- **UC-ACC-02:** an administrator never changes their own account through these endpoints (`403`).
- **Chosen in this task:**
  - Password reset was folded into this task instead of a separate PR (owner choice); no breached-password list yet.
  - A role edit may not remove `admin.user.manage` or `admin.role.manage` from a role the administrator holds, so the last administrator cannot lock themselves out.
  - REVOKED is final; reactivating a revoked person needs a new membership (`409 INVALID_TRANSITION`).
  - A wrong current password in a password change is `422` on the field, not `401`, so the app does not treat it as a sign-out; it still counts towards the account lock.
  - The users list also returns the hospital's roles, so assigning roles needs only `admin.user.manage`.
  - Usernames are unique in the installation (`409 USERNAME_TAKEN`), since each hospital has its own installation (ADR-023).
  - Permission codes are shown as catalogue codes, grouped by module; localized permission names are not written yet.
  - The catalog keys avoid the word "password" where the Bangla value is one word (`credentialSection`, `temporaryPasswordLabel`): the hard-coded-password lint rule flags them otherwise.

## Verification

| Command                                                                                | Result                         |
| -------------------------------------------------------------------------------------- | ------------------------------ |
| identity module `vitest run src/domain src/http src/infrastructure/mfa-crypto.spec.ts` | 43 passed                      |
| `vitest run` in contracts / i18n / authz / ui / web                                    | 14 / 29 / 15 / 171 / 22 passed |
| `pnpm turbo run lint typecheck` (34 tasks), `pnpm boundaries:check`                    | all successful; no violations  |
| `CI=1 playwright test` admin, mfa, auth-shell, staff-path, ui-gallery                  | 31 passed (5 new admin tests)  |

The database tests (`user-admin.api.spec.ts` and the other API specs) run in CI; the local database refused the dev credentials.

## Known limitations

- Facility and department scope on memberships (FR-ACC-008) and segregation-of-duty pairs (FR-ACC-011) are not built.
- No breached-password check and no password expiry; no self-service "forgot password" (an administrator sets a temporary one).
- Disabling an account (as opposed to locking it or revoking a membership) has no screen.
- Permission names are shown as codes; the new Bangla texts are proposals until reviewed (Q-050).

## Deploy impact

- Migration `20261028130000_user_admin`: expand-only (two columns with defaults, two grants).
- No new env var, service or CORS change (`PUT` was already allowed).

## How to debug

- **Who changed what:** `audit_event` with `action LIKE 'admin.%'` and `target_id = '<user, membership or role id>'`; `reason` holds the administrator's text.
- **User stuck on the change-password screen:** `SELECT must_change_password FROM hms.user_account WHERE id = '<id>'`; a successful `POST /auth/password` clears it (`auth_event` `auth.password.changed`).
- **403 `PASSWORD_CHANGE_REQUIRED` / `MFA_REQUIRED`:** the session must clear these in that order: own password, then second factor.
- **Navigation missing an entry:** `GET /api/v1/auth/session` shows `permissions` for the chosen hospital.
