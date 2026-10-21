# T-WEB-15: sliders and list motion

- **Date:** 2026-10-22
- **Commit:** this commit
- **Implements:** task T-WEB-15 (polish follow-up); decision C-084; FR-WEB-HOME-*, FR-WEB-DOC-001, FR-WEB-SRCH-001

## What was built

- **Embla Carousel sliders** on the home page for featured doctors and health packages: one row with previous and next buttons, swipe or drag, snapping a screenful at a time, never auto-playing. Slides are labelled "1 of 8" in the page language and digits; the region is named by its section heading (APG carousel pattern). Keyboard focus moving to a card off screen slides it into view. Reduced motion jumps instead of sliding. Before the script runs the row is a plain horizontal scroll, so every card stays reachable.
- **AutoAnimate** on the doctor directory and the site search results: cards glide out, in and into their new places when a filter or query changes. It turns itself off for reduced motion.
- **Docs:** F section 7 lists every motion effect (where and why), the libraries in use and the ones considered and rejected (typewriter libraries break Bangla conjuncts).

## Files

| File                                                                   | Purpose                                                        |
| ---------------------------------------------------------------------- | -------------------------------------------------------------- |
| `apps/site/src/components/carousel.tsx`                                | Embla slider: buttons, labelled slides, focus follow, fallback |
| `apps/site/src/sections/collection-sections.tsx`                       | Featured doctors and packages use the slider                   |
| `apps/site/src/components/doctor-directory.tsx`, `site-search.tsx`     | AutoAnimate on the result lists                                |
| `packages/i18n/src/messages/site/en.ts`, `bn-BD.ts`                    | `common.carousel.*` labels                                     |
| `apps/site/package.json`, `pnpm-lock.yaml`                             | `embla-carousel-react` 8.6.0, `@formkit/auto-animate` 0.10.0   |
| `apps/site/e2e/home.spec.ts`                                           | Slider buttons, focus follow, Bangla slide labels              |
| `docs/site-planning/F-ui-ux-design.md`, `A-decisions-and-questions.md` | F section 7 and C-084                                          |

## Decisions applied

- C-084: Embla for sliders, AutoAnimate for changing lists, everything else stays CSS (C-083).
- The slider viewport is positioned (`relative`) so screen-reader-only labels inside cards stay clipped; without it the home page scrolled sideways by about 1,700 px on a 360 px phone (caught by the quality suite).
- When focus lands in a hidden slide the viewport's own scroll is reset, so the browser's focus scrolling never fights Embla's track position.

## Verification

| Command                                                                    | Result               |
| -------------------------------------------------------------------------- | -------------------- |
| `pnpm turbo run lint typecheck test --filter=@hms/site --filter=@hms/i18n` | All tasks successful |
| `next build`                                                               | Success              |
| `playwright test` against `next start` on port 3201                        | All passed (80)      |
| Screenshots: doctor slider at 1366 and 390                                 | Reviewed             |

## Known limitations

- Deploy impact: none (two new npm dependencies, installed by the normal build).

## How to debug

- The slider shows no buttons: every slide fits on screen, so there is nothing to scroll; this is intended.
- The page scrolls sideways on phones: something inside a clipping row is absolutely positioned while the row is not; give the row `relative`.
- A list does not glide: the `ref` from `useAutoAnimate` must sit on the direct parent of the keyed items.
