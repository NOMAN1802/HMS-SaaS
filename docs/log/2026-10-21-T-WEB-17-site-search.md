# T-WEB-17 (X28): site-wide search

- **Date:** 2026-10-21
- **Commit:** this commit
- **Implements:** task T-WEB-17 (X28 site-wide search); FR-WEB-SRCH-001; AT-WEB-058

## What was built

`/search` finds doctors, departments, centres, health packages, tests and articles from one box, in Bangla or English, with Bangla or Latin digits. Results are grouped by type and the query stays in the URL. The index is built at build time per language and shipped with the static page; there is no search server. The header has a search link on every page, and a test result opens the test price list already filtered by its code.

## Files

| File                                                                          | Purpose                                                               |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `apps/site/src/content/search-index.ts`                                       | Build-time index: label in the page language, terms in both languages |
| `apps/site/src/components/site-search.tsx`                                    | Grouped client search with the query in the URL                       |
| `apps/site/app/[locale]/search/page.tsx`                                      | Search page (not indexed by search engines)                           |
| `apps/site/src/components/site-header.tsx`                                    | Header search link                                                    |
| `apps/site/src/components/test-price-list.tsx`, `app/[locale]/tests/page.tsx` | Test list reads `?q=` on load                                         |
| `packages/ui/src/index.ts`                                                    | Exports `iconButtonClassName` for icon-only links                     |
| `packages/i18n/src/messages/site/*.ts`                                        | `search` keys                                                         |
| `apps/site/e2e/search.spec.ts`                                                | Grouped results in both languages, Bangla digits, header link, axe    |

## Verification

| Command                                                                                     | Result               |
| ------------------------------------------------------------------------------------------- | -------------------- |
| `pnpm turbo run lint typecheck test --filter=@hms/site --filter=@hms/i18n --filter=@hms/ui` | All tasks successful |
| `CI=true pnpm --filter @hms/site test:e2e`                                                  | 61 passed            |

## Known limitations

- The index grows with content; with CMS data (WEB-B) a server search endpoint may replace it.
- Deploy impact: none.

## How to debug

- Something is not found: check which fields feed `terms` for that kind in `search-index.ts`; queries shorter than two characters show a hint instead of results.
