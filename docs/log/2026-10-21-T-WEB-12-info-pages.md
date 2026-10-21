# T-WEB-12 (with X21, X23, X25): information pages

- **Date:** 2026-10-21
- **Commit:** this commit
- **Implements:** tasks T-WEB-12, T-WEB-17 (X21 branch pages with branch doctor search, X23 call-back on articles, X25 patient guide anchors); FR-WEB-SVC-003..005, FR-WEB-INF-001..007, FR-WEB-GEN-010; AT-WEB-001 (information routes), AT-WEB-033 (contact), AT-WEB-042, AT-WEB-055..057

## What was built

About, patient and visitor guide, emergency and portal pages are built entirely from stored sections. Branches have a list and a page each with units, services, hours, phone, branch head, a map placeholder and a doctor search limited to that branch. Contact lists every hotline (inside and outside Dhaka), email and branch numbers, with a mock contact form. Articles have a list and detail with author link and a call-back request; notices and careers are listed. Any unknown path under a locale shows a localized not-found page with status 404.

## Files

| File                                                                                                           | Purpose                                                                        |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `apps/site/src/components/content-page.tsx`                                                                    | Title band plus stored sections, and page metadata from SEO fields             |
| `apps/site/app/[locale]/{about,patients-and-visitors,emergency,portal}/page.tsx`                               | CMS-built pages                                                                |
| `apps/site/app/[locale]/branches/page.tsx`, `branches/[slug]/page.tsx`                                         | Branch list and detail                                                         |
| `apps/site/app/[locale]/contact/page.tsx`, `src/components/contact-form.tsx`                                   | Contact page and mock form                                                     |
| `apps/site/app/[locale]/articles/page.tsx`, `articles/[slug]/page.tsx`, `notices/page.tsx`, `careers/page.tsx` | Articles, notices, careers                                                     |
| `apps/site/app/[locale]/not-found.tsx`, `[...rest]/page.tsx`                                                   | Localized 404                                                                  |
| `apps/site/src/components/doctor-directory.tsx`                                                                | Branch filter hidden when a page passes no branch options                      |
| `packages/i18n/src/messages/site/*.ts`                                                                         | Keys for these pages                                                           |
| `apps/site/e2e/pages.spec.ts`                                                                                  | Every route in both languages, anchors, branch doctors, contact form, 404, axe |

## Verification

| Command                                                                    | Result               |
| -------------------------------------------------------------------------- | -------------------- |
| `pnpm turbo run lint typecheck test --filter=@hms/site --filter=@hms/i18n` | All tasks successful |
| `CI=true pnpm --filter @hms/site test:e2e`                                 | 46 passed            |
| `pnpm boundaries:check`, `pnpm format:check`                               | Clean                |

## Known limitations

- The map is a placeholder (no third-party map script in WEB-A, P-029).
- Careers has no application form (not in WEB-A scope).
- Deploy impact: none.

## How to debug

- A CMS page section is missing: `hidden` in `content/pages/<page>.json`.
- An unknown path shows the framework 404 instead of the localized one: check `app/[locale]/[...rest]/page.tsx` and that `proxy.ts` added the locale prefix.
