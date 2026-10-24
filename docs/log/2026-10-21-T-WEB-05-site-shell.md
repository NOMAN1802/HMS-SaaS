# T-WEB-05 (with T-WEB-03 shell keys): site shell

- **Date:** 2026-10-21
- **Commit:** this commit
- **Implements:** tasks T-WEB-05, T-WEB-03 (shell keys); FR-WEB-NAV-*, FR-WEB-GEN-004, FR-WEB-GEN-005, FR-WEB-GEN-007, FR-WEB-GEN-010; AT-WEB-004, AT-WEB-005, AT-WEB-034 (menu), AT-WEB-055; decisions C-060, C-062, P-023, P-032

## What was built

Every site page now has the shell: a top bar with emergency and hotline numbers inside and outside Dhaka as `tel:` links, email, secondary links and the language switch; a sticky header with the logo, main navigation, a departments dropdown and "Book appointment"; a mobile menu dialog below the extra-large breakpoint; the demo notice; the footer with contacts, link columns and social links; and a phone-only bottom bar with "Call" and "Book". All of it is driven by `site.json`, so the CMS can change it later.

## Files

| File                                                                                                                 | Purpose                                                                                                                                |
| -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/site/src/components/top-bar.tsx`                                                                               | Phone numbers, email, top links, language switch                                                                                       |
| `apps/site/src/components/site-header.tsx`, `nav-dropdown.tsx`, `mobile-menu.tsx`                                    | Header, departments dropdown (details/summary), phone menu                                                                             |
| `apps/site/src/components/site-footer.tsx`, `phone-action-bar.tsx`, `demo-notice.tsx`                                | Footer, bottom call/book bar, demo notice                                                                                              |
| `apps/site/src/components/logo.tsx`, `site-link.tsx`, `container.tsx`, `nav-types.ts`, `language-links.tsx`          | Shared shell parts                                                                                                                     |
| `apps/site/src/i18n/locale.ts`                                                                                       | Page locale as the shared `Locale` type                                                                                                |
| `apps/site/app/[locale]/layout.tsx`, `page.tsx`                                                                      | Shell around every page; `<main id="main">` moved to the layout                                                                        |
| `apps/site/public/brand/bytespate-mark.png`                                                                          | Placeholder tenant logo (C-060)                                                                                                        |
| `packages/i18n/src/messages/site/*.ts`                                                                               | `shell.*` keys in English and Bangla                                                                                                   |
| `packages/ui/src/icons/icon-names.ts`, `primitives/button-styles.ts` (+ `Icon.tsx`, `Button.tsx`, tests, `index.ts`) | Icon names and button classes moved out of `'use client'` modules so server components can call `isIconName()` and `buttonClassName()` |
| `apps/site/e2e/shell.spec.ts`                                                                                        | Shell journeys                                                                                                                         |

## Decisions applied

- The language switch is two links to the same path in the other locale, so it works without JavaScript (P-023). Language names come from the catalog, not code (Bangla only in `packages/i18n`).
- Hiding the demo notice lasts for the page view only; the site stores nothing in the browser (NFR-WEB-SEC-001).
- The departments dropdown uses `details`/`summary`, so links are reachable without JavaScript; a small script closes it on Escape or an outside click.
- Footer headings set `text-on-primary` explicitly because the base styles color headings with the heading token.

## Verification

| Command                                                                                                       | Result                                                   |
| ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `pnpm turbo run lint typecheck test --filter=@hms/site --filter=@hms/i18n --filter=@hms/ui --filter=@hms/web` | 15 of 15 tasks                                           |
| `CI=true pnpm --filter @hms/site test:e2e` (production build)                                                 | 12 passed (routing, headers, axe in both locales, shell) |
| `pnpm boundaries:check`, `pnpm format:check`                                                                  | Clean                                                    |
| Screenshots at 1366 px (Bangla) and 390 px (English)                                                          | Reviewed                                                 |

## Known limitations

- Links to pages not built yet (doctors, departments, ...) return 404 until T-WEB-06..12.
- The language switch drops query strings (filters); filter pages can add them back if needed.
- Deploy impact: none.

## How to debug

- "Attempted to call X() from the server but X is on the client": a server component imports a function from a `'use client'` module; move the function to a plain module (as done for `isIconName`, `buttonClassName`).
- axe "region" violations: content outside a landmark; wrap it in a labelled region or move it into `header`, `main`, `nav` or `footer`.
