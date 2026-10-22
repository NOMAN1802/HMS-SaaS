# T-WEB-15: loading states and skeletons

- **Date:** 2026-10-22
- **Commit:** this commit
- **Implements:** task T-WEB-15 (polish follow-up); F section 7 (loading states); NFR-WEB-ACC-001

## What was built

- **`Skeleton` primitive** in `@hms/ui`: a shimmering placeholder block (`skeleton` utility), hidden from assistive technology, still for reduced motion. Shared, so the staff app can use it too.
- **Skeletons** for the two parts that render in the browser because they read the URL: the booking wizard and the site search. Before, both showed an empty area until the script ran. A `LoadingRegion` wrapper announces "Loading..." in the page language (`role="status"`).
- **Page-change progress bar** (`NavigationProgress` in the layout): a thin teal bar that starts on a link click, slows as it waits, and finishes when the new page is on screen. It appears only when a change takes over 150 ms, so prefetched pages never flash it.
- **Photo loading** (`LoadingImage` inside `ImageSlot`): the frame shimmers until the photo loads, then the photo fades in. The server HTML shows the photo as-is, and a photo already loaded before hydration is never hidden.
- **Sending state** on the contact, appointment request and service forms and the booking confirm (`useDemoSubmit`): button spinner and "Sending...", the form marked `aria-busy`, the button disabled. WEB-A sends nothing (P-032), so a 700 ms pause stands in for the request WEB-B adds.

## Decisions applied

- No route `loading.tsx`. Tried first and removed: with a loading boundary, Next sends every static page as a skeleton with the real content in a hidden block swapped in by script. No-script readers saw only skeletons, the axe check sometimes ran before the swap (no h1), and the catch-all not-found page answered 200 instead of 404 (caught by the e2e suite). The progress bar gives the same feedback without touching the HTML.
- The e2e motion helper treats a cancelled animation as finished (`Promise.allSettled`); a photo fade replaced mid-way rejects its `finished` promise.

## Files

| File                                                                                            | Purpose                                              |
| ----------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `packages/ui/src/primitives/Skeleton.tsx`, `Skeleton.test.tsx`, `styles/index.css`, `index.ts`  | Skeleton primitive and shimmer utility               |
| `apps/site/src/components/skeletons.tsx`, `loading-region.tsx`                                  | Booking and search skeletons, spoken loading status  |
| `apps/site/src/components/navigation-progress.tsx`, `app/[locale]/layout.tsx`, `app/motion.css` | Page-change progress bar                             |
| `apps/site/src/components/loading-image.tsx`, `image-slot.tsx`                                  | Photo shimmer and fade-in                            |
| `apps/site/src/forms/use-demo-submit.ts` and the four forms                                     | Sending state                                        |
| `apps/site/app/[locale]/book-appointment/page.tsx`, `search/page.tsx`                           | Skeleton Suspense fallbacks                          |
| `packages/i18n/src/messages/site/*.ts`                                                          | `common.loading`, `form.sending`                     |
| `apps/site/e2e/loading.spec.ts`, `e2e/motion.spec.ts`                                           | Loading-state tests; cancellation-safe settle helper |
| `docs/site-planning/F-ui-ux-design.md`                                                          | Loading states table                                 |

## Verification

| Command                                                                                     | Result                                |
| ------------------------------------------------------------------------------------------- | ------------------------------------- |
| `pnpm turbo run lint typecheck test --filter=@hms/site --filter=@hms/ui --filter=@hms/i18n` | All tasks successful                  |
| `next build`                                                                                | Success, 166 static pages             |
| `playwright test` against `next start` on port 3201                                         | 86 passed                             |
| `playwright test e2e/loading.spec.ts --repeat-each=8`                                       | 40 passed (the timing test is stable) |
| Screenshots: booking with scripts off, centre cards with photos held back                   | Reviewed                              |

## Known limitations

- The progress bar follows link clicks; a page change started by code (`router.push`) shows no bar. The site has none today.
- Deploy impact: none.

## How to debug

- The progress bar never shows in a test: Next prefetches linked pages; hold only the page segment (header `next-router-segment-prefetch` not `/_tree`) and wait for the tree prefetch before clicking (see `e2e/loading.spec.ts`).
- A photo stays faint: its load event never fired and it was not complete at hydration; check the image URL.
- A new `MISSING_MESSAGE`: the site reads the built catalog; run `pnpm --filter @hms/i18n build`.
