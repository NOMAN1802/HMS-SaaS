# T-PLT-07, T-PLT-08, T-ACC-02 (plan): API request pipeline, permission guard, response envelope

- **Date:** 2026-10-18
- **Commit:** this commit
- **Implements:** plans T-PLT-07, T-PLT-08 and sharpens T-ACC-02; FR-ACC-009, NFR-OBS-001, NFR-SEC-005, FR-AUD-006; ADR-005, ADR-021

## What was built

A planning change only, no code. The plan covered NestJS guards, interceptors and the validation pipe only loosely: there was no middleware task, no fixed order for the request layers, no rule for how a route declares its permission, and no common shape for success responses. Now:

- D §8.6 defines the API request pipeline in order (Express middleware, Nest middleware, guards, interceptors, pipes, controller, exception filter). G task T-PLT-07 builds the middleware part.
- D §7.2 specifies the route permission guard: an `@RequirePermission` decorator, a global `PermissionGuard`, and default deny for unmarked routes. G task T-ACC-02 now names these in its outcome and acceptance criteria.
- D §8.2 specifies one success body shape, `{ data, meta }`, added by a global `ResponseEnvelopeInterceptor`. G task T-PLT-08 builds it and moves the existing auth endpoints and web client to it.

## Files

| File                                         | Purpose                                                                                           |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| docs/planning/docs/D-system-design.md        | §7.2 route permission guard; §8.2 success body and pagination shape; §8.3 413/429 codes; new §8.6 |
| docs/planning/docs/G-implementation-plan.md  | New tasks T-PLT-07 and T-PLT-08; T-ACC-02 outcome and acceptance sharpened                        |
| docs/planning/docs/C-srs/C00-srs-overview.md | §9 lists the proposed `PAYLOAD_TOO_LARGE` and `RATE_LIMITED` codes                                |

## Decisions applied

- Middleware never authorizes and never queries the database; it runs before routing and cannot see route metadata. Authorization stays in guards (D §7.2).
- Rate limiting is a guard, not middleware, because its key needs the session and route. Login limits stay in T-ACC-03.
- Request context uses `AsyncLocalStorage` so logs, audit and outbox read the correlation and tenant IDs without threading them through every call.
- An incoming `X-Request-Id` is accepted only when it is short and uses safe characters, to block log injection.
- Permission guard: every handler carries exactly one explicit marker (`@RequirePermission`, `@Public`, `@AllowWithoutTenant`); an unmarked route is refused, so a forgotten decorator cannot open a route. Record scope and state checks stay in the application layer (they need the record).
- Response envelope: success responses are wrapped as `{ data, meta }`; errors are not wrapped and stay RFC 9457 problem details (already built, and the standard the web client parses). Both carry `correlationId`. The interceptor validates against the contract first, so undeclared fields never leave the API (ADR-005).
- The two new error codes are PROPOSED; the integrator appends them to `packages/contracts` when T-PLT-07 is implemented.

## Verification

| Command                                 | Result                                                                      |
| --------------------------------------- | --------------------------------------------------------------------------- |
| `npx prettier@3.9.10 --check docs/log/` | The two new or changed log files pass; `docs/planning/` is prettier-ignored |

## Known limitations

- The 1 MB body limit and the per-session rate limit values are proposals; they need confirming before T-PLT-07 is ready (G §4).
- T-PLT-08 is a breaking change for the existing auth endpoints (`/auth/login`, `/auth/session`, `/auth/session/membership`, `/auth/preferences`) and for `apps/web/src/api/client.ts`. They must move in the same PR, and the OpenAPI document is regenerated.
- Already built and unchanged: CORS, cookie parser and trust proxy in `apps/api/src/http/configure-app.ts`; `SessionGuard`, `CsrfGuard`, `TenantGuard` and the `@Public`/`@AllowWithoutTenant` decorators in `packages/mod-identity-access/src/http/`; `ProblemDetailsFilter`.

## How to debug

When these are built and a request misbehaves, check the order in D §8.6 first: a check that needs the session must be a guard (layer 6 or later), not middleware. A `403 PERMISSION_DENIED` on a new route usually means a missing `@RequirePermission` marker. A `500 INTERNAL_ERROR` on a route that worked before usually means its result no longer matches its contract schema; the log line has the schema error. Find a single request across logs, problem bodies and audit rows by its `correlationId`.
