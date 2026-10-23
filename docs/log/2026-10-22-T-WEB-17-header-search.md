# T-WEB-17: header search bar with live results

- **Date:** 2026-10-22
- **Commit:** this commit
- **Implements:** task T-WEB-17; FR-WEB-SRCH-001; FR-WEB-NAV-*

## What was built

The search button in the header no longer leaves the page. It opens a bar under the header; as the visitor types, matches show under it grouped by type (three per group), with a link to every result on the search page. The search index is a static JSON file per language (`/<locale>/search-index.json`), built at build time and fetched the first time the bar opens, so pages do not carry the index in their HTML. A skeleton shows while it loads; if it fails, the bar links to the search page.

Escape, a click outside, the button again or a page change closes the bar, and Escape returns focus to the button. The arrow keys move between the input and the results. Without JavaScript the button stays a plain link to `/search`, and a modified click (new tab) still opens the page.

## Files

| File                                                | Purpose                                                         |
| --------------------------------------------------- | --------------------------------------------------------------- |
| `apps/site/src/components/header-search.tsx`        | Toggle, bar, lazy index load, grouped live results              |
| `apps/site/src/components/search-groups.ts`         | Groups and matching shared by the search page and the bar       |
| `apps/site/app/[locale]/search-index.json/route.ts` | Static index per language                                       |
| `apps/site/src/components/site-header.tsx`          | Uses the header search instead of the link                      |
| `apps/site/src/components/site-search.tsx`          | Uses the shared groups and matching                             |
| `apps/site/app/motion.css`                          | The bar drops in from under the header (200 ms)                 |
| `packages/i18n/src/messages/site/*.ts`              | `search.close`, `search.seeAll`, `search.none`, `search.failed` |
| `apps/site/e2e/search.spec.ts`                      | Bar opens in place, live results, Escape, result click, axe     |

## Verification

| Command                                               | Result   |
| ----------------------------------------------------- | -------- |
| `pnpm --filter @hms/site typecheck` and `lint`        | Clean    |
| `playwright test search` against the production build | 7 passed |

## Known limitations

- The bar shows at most three matches per group; the search page lists the rest.
- Deploy impact: none (one more static file per language in the build output).

## How to debug

- The bar stays on the skeleton: open `/<locale>/search-index.json` directly; it must return JSON. The proxy matcher skips paths with a dot, so the locale middleware never touches it.
- Matching differs from the search page: both use `matchEntries` in `search-groups.ts`.
