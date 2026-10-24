# T-WEB-01: public site scaffold

- **Date:** 2026-10-21
- **Commit:** this commit
- **Implements:** task T-WEB-01; FR-WEB-GEN-001, FR-WEB-NAV-005 (skip link), NFR-WEB-SEC-001, NFR-WEB-MAINT-001; decisions C-061, C-062, P-023, P-024 (skeleton), P-028, P-029, P-030, P-034

## What was built

A new Next.js 16 app, `apps/site` (`@hms/site`, port 3200), for the public hospital website. Every page lives under `/bn` or `/en`; `/` and unprefixed paths redirect to `/bn`. Pages are prerendered as static HTML in both languages, use the HMS tokens and fonts from `@hms/ui/styles.css`, and are served with an enforced Content-Security-Policy and security headers. The home page is a placeholder until T-WEB-06. The same reuse lint rules and a dependency boundary now apply to the site as to the staff app, and CI runs the site's browser tests.

## Files

| File                                                                                                        | Purpose                                                                                       |
| ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `apps/site/package.json`, `tsconfig.json`, `postcss.config.mjs`, `vitest.config.ts`, `playwright.config.ts` | App setup, same pinned versions as `apps/web`                                                 |
| `apps/site/next.config.ts`                                                                                  | next-intl plugin, standalone output, no `x-powered-by`, security headers on every path        |
| `apps/site/proxy.ts`                                                                                        | Locale routing (Next 16 proxy convention)                                                     |
| `apps/site/src/i18n/routing.ts`, `navigation.ts`, `request.ts`                                              | Locales `bn-BD` and `en` with `/bn` and `/en` prefixes; locale-aware links; site catalog load |
| `apps/site/src/security/headers.ts` (+ test)                                                                | CSP and header set, pure function with unit tests                                             |
| `apps/site/app/[locale]/layout.tsx`, `page.tsx`                                                             | Root layout per locale (lang, metadata, skip link, static params); placeholder home           |
| `apps/site/app/globals.css`                                                                                 | Tailwind + `@hms/ui` tokens and fonts                                                         |
| `apps/site/e2e/routing.spec.ts`                                                                             | Redirects, English rendering, headers, no cookies, axe and CSP console checks in both locales |
| `apps/site/AGENTS.md`                                                                                       | Next.js agent notice written by `next dev` (committed, as in `apps/web`)                      |
| `packages/i18n/src/messages/site/en.ts`, `bn-BD.ts`                                                         | Site catalog skeleton (meta, skip link, placeholder), separate from the staff catalog         |
| `packages/i18n/src/index.ts`                                                                                | New exports `siteMessages`, `SiteMessages`                                                    |
| `packages/i18n/src/site-catalog.test.ts`                                                                    | Key parity, no empty strings, same arguments, every key used in `apps/site`                   |
| `packages/config-eslint/index.js` (+ `guardrails.test.js`)                                                  | Web guardrails also cover `apps/site/**`; site e2e exempt; new site test cases                |
| `.dependency-cruiser.cjs`                                                                                   | Rule `site-allowed-packages-only` (only ui, i18n, contracts)                                  |
| `.github/workflows/ci.yml`                                                                                  | Builds the site and runs its Playwright tests in the e2e job                                  |
| `.gitignore`, `README.md`                                                                                   | Ignore `apps/site/next-env.d.ts`; layout lists `apps/site`                                    |
| `docs/site-planning/C-srs.md`, `D-system-design.md`                                                         | Locale detection and cookie behavior corrected to what was built (see below)                  |

## Decisions applied

- **Bangla first without detection:** next-intl's default browser-language detection sent English browsers from `/` to `/en`, contradicting FR-WEB-GEN-001. `localeDetection: false` and `localeCookie: false` make `/` always open `/bn` and mean the site sets no cookies. D section 5 and NFR-WEB-SEC-001 now say so.
- **CSP spike result (D section 9):** pages are statically generated, so per-request nonces are not possible; Next.js inlines its bootstrap scripts. The enforced policy allows inline scripts but blocks `eval` (allowed only in `next dev` for React Refresh), all third-party origins, framing, plugins and foreign form targets.
- The site catalog is a separate `siteMessages` export so marketing text never enters the staff catalog (P-024). It holds only interface text; hospital content comes from content data (C-070, T-WEB-04).

## Verification

| Command                                                 | Result                                                                                                       |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `pnpm --filter @hms/i18n test`                          | 3 files, 29 tests passed (incl. site catalog)                                                                |
| `pnpm --filter @hms/config-eslint test`                 | 18 passed (incl. 2 site guardrail cases)                                                                     |
| `pnpm --filter @hms/site test`                          | 4 passed (security headers)                                                                                  |
| `pnpm turbo run build --filter=@hms/site...`            | Built; `/bn-BD` and `/en` prerendered (SSG)                                                                  |
| `CI=true pnpm --filter @hms/site test:e2e` (production) | 7 passed                                                                                                     |
| `pnpm --filter @hms/site test:e2e` (dev server)         | 7 passed                                                                                                     |
| `pnpm turbo run lint typecheck test`                    | 49 of 49 tasks successful (staff app unaffected)                                                             |
| `pnpm boundaries:check`                                 | No violations; a temporary `@hms/database` import from the site was rejected by `site-allowed-packages-only` |
| `eslint` on a temporary raw `<button>` in `apps/site`   | Rejected by the guardrail                                                                                    |
| `pnpm format:check`                                     | All files formatted                                                                                          |

## Known limitations

- `eslint.config.js` still gives browser globals only to `apps/web` and `packages/ui`; a local editor hook blocked that config edit. Add `apps/site/**/*.{ts,tsx}` there when site client code first uses `window` or `document` (T-WEB-05).
- The T-WEB-02 draft (`packages/ui` icons and `buttonClassName`) is in `git stash` (`T-WEB-02 draft: icons and buttonClassName`), not in this commit.
- The site catalog has only the scaffold keys; T-WEB-03 adds the full catalog. No content layer, shell or real pages yet.
- Deploy impact: a new app and a new CI step; no env vars, no migrations, nothing deployed.

## How to debug

- Wrong language on `/`: check `localeDetection` and `localeCookie` in `apps/site/src/i18n/routing.ts`, and that `proxy.ts` matches the path.
- A blank page or blocked script in the console: the CSP in `apps/site/src/security/headers.ts`; the e2e test lists CSP console errors.
- `MISSING_MESSAGE` errors: the key is missing from `packages/i18n/src/messages/site/*`; rebuild `@hms/i18n` (`pnpm --filter @hms/i18n build`), since the app reads its `dist`.
