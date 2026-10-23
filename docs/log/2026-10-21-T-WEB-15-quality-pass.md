# T-WEB-15: WEB-A quality pass

- **Date:** 2026-10-21
- **Commit:** this commit
- **Implements:** task T-WEB-15; AT-WEB-001, AT-WEB-035, NFR-WEB-ACC-001, NFR-WEB-RESP-001; H section 2

## What was built

A quality suite that loads every page in the sitemap (both languages) and checks status 200, exactly one h1, the right `lang` and no console or page errors; runs axe on every page type in Bangla and English; and checks that no page type scrolls sideways on a 360 px phone. The phone check found the health package tabs overflowing by 224 px; the shared `Tabs` component now scrolls its tab row instead (this also protects the staff app). The implementation plan records the status of every site task.

## Files

| File                                            | Purpose                                                  |
| ----------------------------------------------- | -------------------------------------------------------- |
| `apps/site/e2e/quality.spec.ts`                 | Sitemap smoke, axe per page type, 360 px overflow        |
| `packages/ui/src/primitives/Tabs.tsx`           | Tab row scrolls horizontally; tabs do not shrink or wrap |
| `docs/site-planning/G-implementation-plan.md`   | Section 8: task status                                   |
| `docs/log/2026-10-21-T-WEB-14-image-prompts.md` | Corrected test count                                     |

## Verification

| Command                                           | Result                                                                              |
| ------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `pnpm turbo run lint typecheck test` (whole repo) | 49 of 49 tasks                                                                      |
| `CI=true pnpm --filter @hms/site test:e2e`        | 68 passed (all sitemap pages in both languages, axe on 26 page types x 2 languages) |
| `CI=true pnpm --filter @hms/web test:e2e`         | 21 passed (staff app unaffected by the Tabs change)                                 |
| `pnpm boundaries:check`, `pnpm format:check`      | Clean                                                                               |

## Known limitations

- RG-W1 needs the product owner: UAT-WEB-001..006, including the Bangla copy review (Q-079), a phone walk-through and a screen reader pass.
- Lighthouse mobile budgets (NFR-WEB-PERF-001) were not measured in this environment; run Lighthouse on `/bn`, `/bn/doctors` and one profile before RG-W1.
- Deploy impact: none.

## How to debug

- The sitemap smoke reports the failing path in the assertion message; open it in `pnpm --filter @hms/site dev`.
- A sideways-scroll failure names the page; look for fixed widths or rows that do not wrap at 360 px.
