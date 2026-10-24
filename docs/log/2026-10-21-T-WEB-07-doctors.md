# T-WEB-07 (with T-WEB-17 doctor features): find a doctor and doctor profiles

- **Date:** 2026-10-21
- **Commit:** this commit
- **Implements:** tasks T-WEB-07, T-WEB-17 (X19 leave notice, X20 related doctors); FR-WEB-DOC-001..007; AT-WEB-010..014, AT-WEB-050, AT-WEB-051

## What was built

`/doctors` lists all 24 doctors with a search box (name, speciality, qualification or interest, in Bangla or English, Bangla digits accepted) and department and branch filters. Filters are kept in the URL, so a shared link restores them. Each doctor has a profile at `/doctors/<slug>` with the photo slot, title, department, qualifications, spoken languages, a sample fee, book and call buttons, a leave notice when the doctor is on or about to go on leave, the weekly chamber schedule in the page's digits, About/Education/Experience tabs and up to four related doctors.

## Files

| File                                                                 | Purpose                                                                       |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `apps/site/app/[locale]/doctors/page.tsx`, `doctors/[slug]/page.tsx` | Directory and profile routes (all 48 profiles prerendered)                    |
| `apps/site/src/components/doctor-directory.tsx`                      | Client filters mirrored to the URL; server-rendered full list as fallback     |
| `apps/site/src/components/doctor-card.tsx`                           | Now presentational over `DoctorSummary` so the client directory can render it |
| `apps/site/src/content/doctor-summary.ts`                            | Doctor reduced to card and filter fields in the page language                 |
| `apps/site/src/components/schedule-table.tsx`, `page-header.tsx`     | Schedule table (stacked on phones), breadcrumb and title band                 |
| `apps/site/src/i18n/labels.ts`                                       | Literal catalog keys for weekdays and spoken languages                        |
| `packages/i18n/src/messages/site/*.ts`                               | `doctors`, `doctor`, weekday, language and breadcrumb keys                    |
| `apps/site/e2e/doctors.spec.ts`                                      | Filters and URL, search, empty state, digits, leave, related, axe             |

## Decisions applied

- Filters live in component state and are mirrored to the URL. Reading them back from the URL lost a filter changed before the previous URL update finished (caught by the e2e test).
- The leave notice shows for current and upcoming leave, using the content message when there is one.

## Verification

| Command                                                                    | Result               |
| -------------------------------------------------------------------------- | -------------------- |
| `pnpm turbo run lint typecheck test --filter=@hms/site --filter=@hms/i18n` | All tasks successful |
| `CI=true pnpm --filter @hms/site test:e2e`                                 | 22 passed            |
| Screenshots of `/en/doctors` and `/bn/doctors/tanvir-ahmed`                | Reviewed             |

## Known limitations

- Leave and "on leave" badges use the build date (static pages).
- Deploy impact: none.

## How to debug

- A doctor is missing from a filter: check `department` and `branches` in `content/doctors.json` and `toDoctorSummary()`.
- The page shows the whole list and ignores the URL: JavaScript failed to load; the fallback grid is intentional.
