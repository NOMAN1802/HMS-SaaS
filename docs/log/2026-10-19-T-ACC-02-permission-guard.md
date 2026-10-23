# T-ACC-02: roles, permissions and the route permission guard

- **Date:** 2026-10-19
- **Commit:** this commit
- **Implements:** T-ACC-02; FR-ACC-008 (roles from templates, data model), FR-ACC-009, FR-SAA-004, AT-SAA-002; C-009, C-029, C-042, C-045; ADR-003; D section 7.2

## What was built

Every API route now needs exactly one marker: `@Public()`, `@AllowWithoutTenant()` or the new `@RequirePermission(...codes)`. The new global `PermissionGuard` runs after `TenantGuard`. It checks that the hospital has the module (`403 ENTITLEMENT_MISSING`) and then that the membership's roles grant every listed code (`403 PERMISSION_DENIED`). A route with no marker is refused, and a test over the real `AppModule` fails if any route lacks one. Every refusal writes an `authz.access.denied` audit event with the route, the required and missing codes and the correlation ID.

The permission catalogue (C00 section 8) is now typed in `@hms/contracts`, so a misspelled code fails typecheck. Roles, role permissions, membership roles and module entitlements are stored per hospital, with RLS. The nine first-release role templates (C-045) live in `@hms/authz`, and `createRolesFromTemplates` copies them into a hospital.

## Files

| File                                                                               | Purpose                                                                                                          |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| packages/contracts/src/permissions.ts                                              | Permission catalogue, code to module map, `coreModules`, schemas                                                 |
| packages/contracts/src/errors.ts                                                   | `ENTITLEMENT_MISSING` (403)                                                                                      |
| packages/authz/src/evaluate-access.ts                                              | Pure decision: entitlement first, then every required code                                                       |
| packages/authz/src/role-templates.ts                                               | RCP, CSH, BSV, DOC, LBT, LBA, FIN, ADM, MGT templates                                                            |
| packages/database/prisma/schema.prisma                                             | `Role`, `RolePermission`, `MembershipRole`, `TenantEntitlement`                                                  |
| packages/database/prisma/migrations/20261019100000_roles_permissions/migration.sql | Tables, composite tenant FKs, code format CHECKs, RLS policies                                                   |
| packages/mod-identity-access/src/http/decorators.ts                                | `@RequirePermission`                                                                                             |
| packages/mod-identity-access/src/http/route-markers.ts                             | `readRouteMarker` (guard) and `findRoutesWithoutMarker` (route audit)                                            |
| packages/mod-identity-access/src/http/permission.guard.ts                          | Global `PermissionGuard` with default deny and audited refusals                                                  |
| packages/mod-identity-access/src/infrastructure/access.repository.ts               | Loads granted codes and entitlements; writes the denial audit event                                              |
| packages/mod-identity-access/src/infrastructure/role-templates.repository.ts       | `createRolesFromTemplates` for tenant provisioning                                                               |
| packages/mod-identity-access/src/identity-access.module.ts                         | Registers the fourth global guard                                                                                |
| packages/testkit/src/identity.ts                                                   | `grantPermissions`, `seedEntitlements`                                                                           |
| packages/i18n/src/messages/en.ts, bn-BD.ts                                         | `ENTITLEMENT_MISSING` message in both languages                                                                  |
| apps/api/src/route-markers.spec.ts                                                 | Fails if any route of the real API has no marker                                                                 |
| apps/api/src/permissions.api.spec.ts                                               | Guard over HTTP and PostgreSQL: allow, both 403s, all-codes, default deny, cashier template, cross-hospital role |
| apps/api/src/auth.api.spec.ts                                                      | Probe route now needs `audit.view`; seeded users hold it                                                         |
| packages/database/src/roles.int.test.ts                                            | RLS on the new tables, cross-hospital role assignment refused, CHECKs                                            |
| docs/planning/docs/D-system-design.md                                              | Section 7.2 updated to what was built                                                                            |

## Decisions applied

- **Default deny (D section 7.2):** no marker means 403, so a forgotten decorator can never open a route.
- **Entitlement before permission (FR-SAA-004):** an entitlement never grants a permission, and both are needed.
- **Templates (C-045, C01 section 5):** only the nine first-release templates. The cashier issues invoices and records payments with two separate codes (C-042). The doctor cannot record payments (C-009). The administrator gets no clinical actions. Nobody gets `billing.eligibility.override` (disabled, Q-005).
- **Chosen in this task:**
  - Entitlement modules are named after the `mod-*` packages (D section 5): visits and orders belong to `clinical`, practitioners to `patients`. A `core` module (users, roles, configuration, audit, support grants) needs no entitlement row, because a hospital cannot work without it.
  - Every refusal is audited, not only "sensitive" ones: at the route there is no business record to judge sensitivity by, and refusals are rare.
  - Controller-level `@RequirePermission` codes are merged with handler codes (all required), rather than overridden, so a handler can only narrow access, never widen it.
  - A stored code that is no longer in the catalogue grants nothing (fail closed). The database checks only the code format, so the catalogue can change without a migration.
  - The management viewer template starts empty: its `report.view.<area>` codes arrive with the reporting module.

## Verification

| Command                                                                                           | Result                                                                |
| ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `pnpm turbo run build lint typecheck`                                                             | 37 successful, 37 total                                               |
| `pnpm boundaries:check`                                                                           | no dependency violations (264 modules)                                |
| `vitest run` in `@hms/contracts`, `@hms/authz`, `@hms/i18n`, `@hms/web`                           | 13, 12, 26 and 18 passed                                              |
| `vitest run src/http/route-markers.spec.ts src/domain` in `@hms/mod-identity-access`              | 19 passed                                                             |
| `vitest run src/route-markers.spec.ts src/http/request-pipeline.spec.ts src/health` in `@hms/api` | 11 passed (every real route has a marker)                             |
| `prisma migrate diff --from-schema <before> --to-schema prisma/schema.prisma --script`            | Prisma part of the migration generated from the schema, so they match |

The database tests (`permissions.api.spec.ts`, `auth.api.spec.ts`, `roles.int.test.ts`, the RLS coverage check in `with-tenant.int.test.ts`) need PostgreSQL. This machine has none, so CI runs them.

## Known limitations

- No permission cache yet: the guard reads roles and entitlements from PostgreSQL on every guarded request (one short transaction, two indexed queries). The Valkey cache of D section 7.2 follows with T-PLT-03.
- No role or user administration yet (T-ACC-05). The app role has no DELETE on `role_permission` or `membership_role`; T-ACC-05 adds it with audited changes.
- `hms_app` can still write `tenant_entitlement` (default grants), because tests and the future provisioning path run as `hms_app`. Restricting it to the control plane (`hms_control`) comes with tenant provisioning (FR-SAA-002).
- Facility and department scope on memberships (FR-ACC-008) and segregation-of-duty pairs (FR-ACC-011, CP-24, pairs OPEN) are not built: both need the loaded record and arrive with the first command that checks them.
- Existing hospitals have no roles or entitlements after the migration, so every `@RequirePermission` route refuses their users until roles are assigned. No such route exists yet.

## Deploy impact

- Migration `20261019100000_roles_permissions`: expand-only (four new tables, policies and CHECKs; no change to existing tables), no long locks.
- No new environment variable, service, build step or CORS change.

## How to debug

- **Unexpected 403:** query `audit_event` where `action = 'authz.access.denied'` for the membership. `reason` says `ENTITLEMENT_MISSING`, `PERMISSION_DENIED` or `NO_ROUTE_MARKER`; `details.route`, `details.required` and `details.missing` say exactly what was missing; `correlation_id` matches the `X-Request-Id` response header and the request log line.
- **What a membership holds:** `SELECT rp.permission_code FROM hms.role_permission rp JOIN hms.membership_role mr ON mr.tenant_id = rp.tenant_id AND mr.role_id = rp.role_id WHERE mr.membership_id = '<id>'` inside a `withTenant` context (RLS hides everything otherwise).
- **Route audit test fails:** it prints `Controller.handler` of each unmarked route; add the right marker.
- **Locally:** `pnpm services:up`, `pnpm db:deploy`, then `pnpm --filter @hms/api exec vitest run src/permissions.api.spec.ts`.
