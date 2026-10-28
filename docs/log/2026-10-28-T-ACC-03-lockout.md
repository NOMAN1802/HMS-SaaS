# T-ACC-03: account lockout, login rate limit and lock diagnostics

- **Date:** 2026-10-28
- **Commit:** this commit
- **Implements:** T-ACC-03; UC-ACC-02; FR-ACC-004, FR-ACC-005, FR-ACC-010, FR-SUP-003, NFR-SEC-005; AT-ACC-006, AT-ACC-007, AT-ACC-008; C-032; ADR-004

## What was built

Five wrong passwords lock an account for 15 minutes (C-032). The lock is set under a row lock, so wrong passwords sent in parallel are all counted. A running lock is never extended, and after it ends the counter starts again. Login is rate limited per client IP (200 per 15 minutes) and per account (10 per 15 minutes), answered as `429 RATE_LIMITED` with a `Retry-After` header. Every argon2 hash and verify now goes through one process-wide cap (2 at a time, 32 waiting, then `503 SERVICE_UNAVAILABLE`).

Hospital administrators (`admin.user.manage`) get three endpoints for the accounts of their own hospital:

| Method and path                            | Purpose                                                                                        |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `GET /api/v1/admin/users/{userId}/lock`    | Lock diagnostics: status, reason code, note, time, who locked, last 20 login events with IP    |
| `POST /api/v1/admin/users/{userId}/lock`   | Lock the account (`LOCKED_ADMIN`, no end time); open sessions end at once. Body `{ "reason" }` |
| `POST /api/v1/admin/users/{userId}/unlock` | Unlock a temporary or admin lock and clear the counter. Body `{ "reason" }`                    |

## Files

| File                                                                              | Purpose                                                                                         |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| packages/platform/src/rate-limiter.ts                                             | `RateLimiter` interface and a bounded in-memory fixed-window store                              |
| packages/platform/src/concurrency-limiter.ts                                      | `createConcurrencyLimiter`: max running tasks plus a bounded queue                              |
| packages/platform/src/problem-details.filter.ts                                   | `Retry-After` header from `retryAfterSeconds`; 429 maps to `RATE_LIMITED`                       |
| packages/platform/src/limits.spec.ts, platform.spec.ts                            | Unit tests for both limiters; 429 problem with `Retry-After` over HTTP                          |
| packages/contracts/src/errors.ts                                                  | `RATE_LIMITED` (429), `INVALID_TRANSITION` (409)                                                |
| packages/contracts/src/account-lock.ts                                            | Lock request and lock status (diagnostics) schemas                                              |
| packages/i18n/src/messages/en.ts, bn-BD.ts                                        | Messages for the two new codes                                                                  |
| packages/database/prisma/schema.prisma, migrations/20261028090000_account_lockout | `locked_at`, `lock_note`, `locked_by_user_id`; CHECKs on `lock_reason` codes and note length    |
| packages/mod-identity-access/src/domain/lockout-policy.ts (+ spec)                | Pure rules: state after a failure, admin lock, unlock, allowed transitions, no self-change      |
| packages/mod-identity-access/src/application/login-throttle.ts                    | Per-IP and per-account login limits before the password check                                   |
| packages/mod-identity-access/src/application/auth.config.ts                       | `lockout` (env `LOGIN_LOCKOUT_ATTEMPTS`, `LOGIN_LOCKOUT_MINUTES`) and `loginRateLimits`         |
| packages/mod-identity-access/src/application/auth.service.ts                      | Throttle, lock after failures, `auth.account.locked` event, clear on success                    |
| packages/mod-identity-access/src/application/account-lock.service.ts              | Admin status, lock and unlock                                                                   |
| packages/mod-identity-access/src/http/account-lock.controller.ts                  | The three admin routes                                                                          |
| packages/mod-identity-access/src/infrastructure/identity.repository.ts            | `applyFailedLogin` (SELECT ... FOR UPDATE), `clearFailedLogins`                                 |
| packages/mod-identity-access/src/infrastructure/account-lock.repository.ts        | Hospital-scoped lookup, conditional lock change plus audit event, recent login events           |
| packages/mod-identity-access/src/infrastructure/password-hasher.ts                | argon2 behind the concurrency cap                                                               |
| packages/mod-identity-access/src/application/auth.service.spec.ts                 | Lockout, parallel failures, expiry, clear on success, `RATE_LIMITED`                            |
| apps/api/src/account-lock.api.spec.ts                                             | AT-ACC-006..008 over HTTP: diagnostics, admin lock, unlock, self, other hospital, 409, 403, 429 |
| apps/api/src/auth.api.spec.ts, permissions.api.spec.ts                            | Config gains `lockout` and `loginRateLimits`                                                    |
| .env.example, docs/planning/docs/K-docker-design.md, D-system-design.md           | New optional env vars; `RATE_LIMITED` is built                                                  |

## Decisions applied

- **C-032:** 5 failures, 15 minutes, auto-unlock; an administrator may unlock sooner. Values come from env with the C-032 defaults until per-hospital policy versions exist (T-PLT-05, CP-12).
- **UC-ACC-02:** `ACTIVE -> LOCKED_TEMPORARY | LOCKED_ADMIN -> ACTIVE`; an administrator cannot lock or unlock their own account (`403 PERMISSION_DENIED`).
- **T-ACC-01 review rule kept:** the password is still checked before the lock state, so `ACCOUNT_LOCKED` (with `lockedUntil`) is only told to someone who typed the correct password. Wrong passwords during a lock keep answering `INVALID_CREDENTIALS`.
- **FR-ACC-010:** an admin lock revokes open sessions through the existing trigger `user_account_access_removed`; a temporary lock also stops open sessions, as `isAccountUsable` already did.
- **Chosen in this task:**
  - Rate limits live in memory, because each hospital runs one API process (ADR-023, owner choice 2026-10-28). T-PLT-03 swaps in a Valkey store behind the same `RateLimiter` interface.
  - The IP limit is wide (200 per 15 minutes) because a hospital's staff usually share one public IP; the account limit (10) and the lockout (5) stop guessing.
  - Unknown usernames are counted per account too, so the answer does not reveal which usernames exist.
  - Refused (429) attempts are not written to `auth_event`: a flood would fill the append-only table. The request log line still shows them.
  - `lock_reason` is a code (`FAILED_LOGINS`, `ADMIN_ACTION`) checked by the database; the administrator's free text goes to `lock_note` and to the audit event's `reason`.
  - The "source" of FR-ACC-004 is the list of recent login events with their IP addresses and correlation IDs.
  - Lock and unlock change the row only from allowed states (condition inside the UPDATE): a disabled account can be neither, so an unlock can never bring it back (`409 INVALID_TRANSITION`).
  - An account outside the administrator's hospital, or a malformed ID, answers `404 NOT_FOUND`.

## Verification

| Command                                                                                           | Result                                                                      |
| ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `vitest run src/limits.spec.ts src/platform.spec.ts` in `@hms/platform`                           | 14 passed (limiters, 429 with `Retry-After`)                                |
| `vitest run src/domain src/http` in `@hms/mod-identity-access`                                    | 27 passed                                                                   |
| `pnpm turbo run build lint typecheck`                                                             | all tasks successful                                                        |
| `pnpm boundaries:check`                                                                           | no dependency violations (511 modules)                                      |
| `vitest run` in `@hms/i18n`, `@hms/contracts`; `src/route-markers.spec.ts src/http` in `@hms/api` | 29, 13 and 10 passed (catalog parity for the new codes; every route marked) |
| `prisma migrate diff` (schema before vs after)                                                    | Prisma part of the migration matches the schema                             |

The database tests (`auth.service.spec.ts`, `account-lock.api.spec.ts`, `auth.api.spec.ts`, `permissions.api.spec.ts`) need PostgreSQL. The local PostgreSQL on this machine refused the `.env` credentials, so CI runs them.

## Known limitations

- Rate-limit counters are per process and reset on restart. With more than one API process each has its own counters, until T-PLT-03.
- A temporary lock also ends the user's open sessions, so someone typing 5 wrong passwords for a username can log that user out (they can log in again after 15 minutes or after an admin unlock). Keeping open sessions during a temporary lock would change the T-ACC-01 review rule and is left for the owner to decide.
- No admin screen yet; the endpoints are used by T-ACC-05.
- Per-hospital lockout values (CP-12) wait for policy versions (T-PLT-05).
- The new Bangla messages are proposals until a native speaker reviews them (Q-050).

## Deploy impact

- Migration `20261028090000_account_lockout`: expand-only (three nullable columns, two CHECKs on `user_account`).
- New optional env vars `LOGIN_LOCKOUT_ATTEMPTS` and `LOGIN_LOCKOUT_MINUTES` (defaults 5 and 15). No new service, build step or CORS change.

## How to debug

- **Why is a user locked:** `GET /api/v1/admin/users/{id}/lock` as an administrator, or `SELECT status, failed_attempts, locked_at, locked_until, lock_reason, lock_note, locked_by_user_id FROM hms.user_account WHERE id = '<id>'`. Recent attempts: `SELECT occurred_at, action, outcome, reason, ip_address FROM hms.auth_event WHERE user_id = '<id>' ORDER BY occurred_at DESC LIMIT 20`.
- **Who locked or unlocked:** `audit_event` with `action IN ('admin.user.locked', 'admin.user.unlocked')` and `target_id = '<id>'` (inside `withTenant`).
- **429 on login:** wait `Retry-After` seconds, or restart the API to clear the in-memory counters. Many users behind one IP hitting 200 per 15 minutes means the IP limit in `DEFAULT_LOGIN_RATE_LIMITS` needs raising.
- **503 on login under load:** the argon2 queue (32) is full; see `password-hasher.ts`.
- **Locally:** `pnpm db:deploy`, then `pnpm --filter @hms/api exec vitest run src/account-lock.api.spec.ts`.
