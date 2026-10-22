# T-WEB-15: hero slideshow, scroll reveal and five motion packages

- **Date:** 2026-10-22
- **Commit:** this commit
- **Implements:** task T-WEB-15; decision C-085 (extends C-083, C-084); FR-WEB-HOME-_, FR-WEB-NAV-_

## What was built

| Package (pinned)            | Where                                      | What it does                                                                                                                                                                                                                        |
| --------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `motion` 13.5.1             | Home hero, every page                      | Hero slideshow: four pictures cross-fade with a slow zoom, a link chip and a progress line; previous, pause and next buttons. Scroll reveal: every section below the first screen fades and rises in, card lists follow one by one. |
| `lottie-web` 5.13.0 (light) | Contact, call-back, service forms, booking | A hand-made success tick (`src/motion/success-tick.json`) draws itself above the success message.                                                                                                                                   |
| `react-fast-marquee` 1.6.5  | Home, under the quick actions              | New `serviceStrip` section: ten services and facilities drift across; screen readers get one plain list.                                                                                                                            |
| `sonner` 2.0.8              | Doctor profiles, articles                  | New share button: system share sheet on phones, otherwise copies the link and shows a "Link copied" toast.                                                                                                                          |
| `vaul` 1.1.2                | Phone and tablet menu                      | The menu is a bottom sheet that can be dragged down to close.                                                                                                                                                                       |

Three new hero pictures (`hero-paediatrics`, `hero-ward`, `hero-imaging`, 1200 x 900 WebP, fingerprinted) were generated with ChatGPT from the prompts added to `content/image-prompts.md`.

The CSS scroll-timeline reveal of C-083 is removed; it only ran in Chromium browsers and moved too little to notice. The new reveal hides only parts still below the fold, only after hydration, and clears its inline styles once shown; print shows everything.

Reduced motion: the slideshow never plays by itself and has no pause button or zoom, the strip sits still in wrapped rows, the tick is drawn finished, and the reveal is skipped.

## Files

| File                                                                        | Purpose                                               |
| --------------------------------------------------------------------------- | ----------------------------------------------------- |
| `apps/site/src/components/hero-slides.tsx`, `src/sections/hero.tsx`         | Slideshow; hero passes server-rendered pictures       |
| `apps/site/src/components/scroll-reveal.tsx`, `app/[locale]/layout.tsx`     | Scroll reveal, mounted once in the layout             |
| `apps/site/src/motion/use-reduced-motion.ts`                                | Hydration-safe reduced-motion hook                    |
| `apps/site/src/components/success-tick.tsx`, `src/motion/success-tick.json` | Lottie tick and `FormSuccess`; used by the four forms |
| `apps/site/src/components/service-strip.tsx`, `src/sections/*`              | Marquee section and its registry entry                |
| `apps/site/src/components/share-button.tsx`                                 | Share button and `SiteToaster`                        |
| `apps/site/src/components/mobile-menu.tsx`                                  | Vaul drawer                                           |
| `apps/site/app/motion.css`                                                  | CSS reveal removed; print fallback                    |
| `packages/contracts/src/website.ts`                                         | Optional hero `slides`; `serviceStrip` section        |
| `apps/site/src/content/references.ts`                                       | Checks strip icons and slide links                    |
| `apps/site/content/pages/home.json`, `public/images/hero-*`                 | Slides and strip content; three pictures              |
| `packages/ui/src/icons/*`                                                   | `pause`, `play`, `share`, `link` icons                |
| `packages/i18n/src/messages/site/*.ts`                                      | `hero.slideshow/pause/play`, `share.*`                |
| `apps/site/e2e/motion-packages.spec.ts`, `e2e/home.spec.ts`                 | New behaviour; section order includes the strip       |
| `docs/site-planning/F-ui-ux-design.md`, `A-...md`, `E-...md`                | Section 7 tables, C-085, content model                |

## Verification

| Command                                                          | Result                                                                                                    |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `pnpm turbo run lint typecheck test` (site, ui, i18n, contracts) | 15 tasks successful                                                                                       |
| Full Playwright suite against the production build               | 95 passed (two of three full runs; the other had three 30 s timeouts at load average 7, which pass alone) |
| `e2e/motion-packages.spec.ts` alone, three runs                  | 7 passed each time                                                                                        |

The slideshow test drives Playwright's fake clock and steps it a second at a time, so hydration timing does not matter; the reveal test waits for the card to be marked pending before checking it is transparent.

## Known limitations

- The first pass hit React error 418 (hydration mismatch) because Motion's `useReducedMotion` reads the setting during the first render; `use-reduced-motion.ts` fixes it. Use that hook, not Motion's, in prerendered components.
- The marquee and Sonner inject inline styles; fine under the current CSP (`style-src 'unsafe-inline'`), to revisit if styles ever get a nonce.
- Deploy impact: none (new npm dependencies only, built into the static output).

## How to debug

- A section stays invisible: look for `data-reveal-pending` on it; the reveal waits for 12 percent of it to be in view. Reduced motion skips the reveal entirely.
- The slideshow does not move: it pauses while hovered or focused, when the tab is hidden, after the pause button, and always under reduced motion.
- The tick shows but does not animate: the Lottie player loads on demand; check the network tab for the `lottie_light` chunk.
