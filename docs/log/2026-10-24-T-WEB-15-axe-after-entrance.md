# T-WEB-15: accessibility scans wait for entrance animations

- **Date:** 2026-10-24
- **Commit:** this commit
- **Implements:** task T-WEB-15; AT-WEB-035

## What was fixed

CI on `dev` failed after #18 (a docs-only change) in the site's axe checks: colour contrast on the booking page and a package page, with text measured at colours such as `#cccdcd` on white (ratio 1.59). Even with reduced motion the site keeps a 200 ms cross-fade on page headers (`.enter-stagger`) and wizard steps (`.enter-step`) (C-083). When axe ran inside that window it measured half-transparent text. The pages themselves pass; the failure depended on timing, which is why #17 passed and the next run did not.

`settle()` (wait for every finite, time-based animation to end) moves from `motion.spec.ts` into a shared helper, and a `scan(page, selector?)` helper runs axe only after it. All 12 axe checks use `scan`.

## Files

| File                                 | Change                                                    |
| ------------------------------------ | --------------------------------------------------------- |
| `apps/site/e2e/a11y.ts`              | New: `settle` and `scan`                                  |
| `apps/site/e2e/*.spec.ts` (11 files) | Axe checks call `scan`; `motion.spec.ts` imports `settle` |

## Commands

| Command                                  | Result                             |
| ---------------------------------------- | ---------------------------------- |
| `pnpm lint`, `tsc --noEmit` (site)       | Clean                              |
| `playwright test quality -g "axe clean"` | 2 passed                           |
| CI e2e on the PR (production build)      | The check that matters; see the PR |

## Known limitations

- Locally, `playwright.config.ts` uses `pnpm dev` unless `CI` is set; the development server is slow and fell over under `--repeat-each`. Use `CI=1` (production build, `pnpm build` first) to reproduce CI.
- Deploy impact: none (tests only).

## How to debug

- A contrast failure with washed-out colours (light grey on white) in an axe check: the scan ran during an animation. Use `scan` from `e2e/a11y.ts`, never `new AxeBuilder(...).analyze()` directly.
