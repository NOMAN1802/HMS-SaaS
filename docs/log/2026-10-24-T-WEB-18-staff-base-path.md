# T-WEB-18: staff app under /staff, and one local origin for both apps

- **Date:** 2026-10-24
- **Commit:** this commit
- **Implements:** task T-WEB-18; FR-WEB-ROUTE-002, FR-WEB-ROUTE-006, NFR-WEB-SEC-002; C-076, C-080, P-043, P-044 (revised), P-045, P-047; AT-WEB-065, AT-WEB-067 (header part)

## What was built

- **Staff app under `/staff`:** `apps/web` sets `basePath: '/staff'`. Pages, links, router targets and `/_next` assets move under it with no page changes. The brand mark is now imported instead of given as a `/brand/...` string, because `next/image` does not add the base path to string sources.
- **Staff security headers (P-047):** the site's header builder moved to `@hms/ui/security` (both apps may import `@hms/ui`; no boundary change) and gained a `connectSources` option. The staff app sends the same enforced CSP, `X-Frame-Options: DENY`, `Referrer-Policy`, `nosniff` and `Permissions-Policy`, with `connect-src` allowing the API origin from `NEXT_PUBLIC_API_URL`, plus `X-Robots-Tag: noindex, nofollow` (P-045).
- **Old bookmarks:** the site redirects `/login` and `/choose-hospital` to `/staff/...` (308). On the shared host those paths reach the site, so the redirect lives there. The site's proxy and `robots.txt` already left `/staff` alone (T-WEB-01, T-WEB-13).
- **Dev proxy (P-044 revised, owner 2026-10-24: "1 and 2"):** `apps/dev-proxy` is a small dependency-free Node proxy that `pnpm dev` starts on `http://localhost:3000`. `/staff` goes to the staff app (3100), everything else to the site (3200), websocket upgrades included, like nginx on the server. Each app still answers on its own port. `.env.example` adds `http://localhost:3000` to `CORS_ORIGINS`.

## Files

| File                                                    | Change                                                                |
| ------------------------------------------------------- | --------------------------------------------------------------------- |
| `apps/web/next.config.ts`                               | `basePath`, shared security headers, `X-Robots-Tag`                   |
| `apps/web/src/components/brand.tsx`                     | Imported brand mark                                                   |
| `apps/web/e2e/staff-path.spec.ts`                       | New: served under /staff with assets; headers                         |
| `apps/web/e2e/auth-shell.spec.ts`, `ui-gallery.spec.ts` | URLs under `/staff`                                                   |
| `packages/ui/src/security/headers.ts` (+ test)          | Moved from `apps/site/src/security`; `connectSources` option          |
| `packages/ui/package.json`                              | `./security` export                                                   |
| `apps/site/next.config.ts`                              | Imports `@hms/ui/security`; `/login` and `/choose-hospital` redirects |
| `apps/site/e2e/seo.spec.ts`                             | Redirect test                                                         |
| `apps/dev-proxy/`                                       | New: development proxy                                                |
| `.env.example`                                          | `CORS_ORIGINS` adds the proxy origin                                  |
| `README.md`, site planning A, D, G                      | Dev URLs, P-044 revised, task status                                  |
| `docs/DEPLOYMENT.md`                                    | Section 5: what the release needs on the server (Q-087)               |

## Commands

| Command                                                              | Result                                                                                                                                                        |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm turbo run build lint typecheck`                                | 40 of 40 tasks                                                                                                                                                |
| `pnpm boundaries:check`                                              | No violations                                                                                                                                                 |
| `pnpm turbo run test` (local dev Postgres)                           | 23 of 23 tasks (ui: 170 tests)                                                                                                                                |
| `CI=1 playwright test` in `apps/web`                                 | 23 passed                                                                                                                                                     |
| `CI=1 playwright test` in `apps/site`                                | 101 passed                                                                                                                                                    |
| Production servers behind the proxy, curl and Chromium               | `/` -> `/bn`; `/staff` -> login; `/login` 308 -> `/staff/login`; assets load; staff headers present; no console errors besides the expected 401 session check |
| API with `CORS_ORIGINS` including `http://localhost:3000`, preflight | `Access-Control-Allow-Origin: http://localhost:3000`, credentials true                                                                                        |

## Known limitations

- **Release gate (Q-087):** merged to `dev` only. The release that carries it to `main` needs the project lead's agreement and the nginx change in `docs/DEPLOYMENT.md` section 5. The public site is not deployed yet, so until it is, nginx must redirect `/` to `/staff`.
- A local `.env` copied from the old example still has `CORS_ORIGINS=http://localhost:3100`; add `,http://localhost:3000` to sign in through the proxy.
- The e2e suites keep testing each app on its own port; the joined host is checked by hand (AT-WEB-060 on staging).
- Deploy impact: web image rebuild and nginx change at release time (see above). No new env var on the server, no migration.

## How to debug

- Staff page loads without styles or scripts: the request went to `/_next/...` instead of `/staff/_next/...`; something builds a URL by hand. Use router navigation or imported assets.
- `localhost:3000` shows "Nothing answers on port ...": that app has not started yet or crashed; check its `pnpm dev` output.
- Sign-in through `localhost:3000/staff` fails with a CORS error: `CORS_ORIGINS` in the local `.env` is missing `http://localhost:3000`.
