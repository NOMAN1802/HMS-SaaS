# T-WEB-09 (with X26 package price table): health packages and test prices

- **Date:** 2026-10-21
- **Commit:** this commit
- **Implements:** tasks T-WEB-09, T-WEB-17 (X26); FR-WEB-PKG-001..004, FR-WEB-TST-001; AT-WEB-020..022, AT-WEB-053; Q-078 (sample label)

## What was built

`/packages` shows the ten health packages with category tabs. Each package page lists what is included by group, preparation, and a price table comparing the tests bought one by one with the package price and the saving, labelled as a sample, plus a call-back request to book it. `/tests` lists the 40 test prices with search by name or code in either language (Bangla digits accepted) and a category filter; a table on wide screens and stacked rows on phones.

## Files

| File                                                                          | Purpose                                                               |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `apps/site/app/[locale]/packages/page.tsx`, `packages/[slug]/page.tsx`        | Package list (tabs) and detail                                        |
| `apps/site/app/[locale]/tests/page.tsx`, `src/components/test-price-list.tsx` | Server-formatted rows, client search and filter                       |
| `apps/site/src/i18n/category-labels.ts`                                       | Literal catalog keys for package and test categories                  |
| `packages/i18n/src/messages/site/*.ts`                                        | `packages`, `package`, `tests` keys                                   |
| `apps/site/e2e/packages.spec.ts`                                              | Money format in both languages, sample labels, tabs, test search, axe |

## Verification

| Command                                                                    | Result               |
| -------------------------------------------------------------------------- | -------------------- |
| `pnpm turbo run lint typecheck test --filter=@hms/site --filter=@hms/i18n` | All tasks successful |
| `CI=true pnpm --filter @hms/site test:e2e`                                 | 36 passed            |
| Screenshots of `/bn/tests` (390 px) and a package page (1366 px)           | Reviewed             |

## Known limitations

- Publishing real prices waits for Q-078. Deploy impact: none.

## How to debug

- A wrong saving: `packageSaving()` in `src/content/index.ts` (integer paisa); the content must keep `price` at or below `separatePrice` (checked at build).
