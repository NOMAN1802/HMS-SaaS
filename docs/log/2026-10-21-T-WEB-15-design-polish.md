# T-WEB-15: design critique and polish

- **Date:** 2026-10-21
- **Commit:** this commit
- **Implements:** task T-WEB-15 (quality pass follow-up); FR-WEB-DOC-001, FR-WEB-DOC-006, FR-WEB-GEN-003, FR-WEB-SVC-004, FR-WEB-SRCH-001; NFR-WEB-RESP-001

## What was built

An independent design critique (two separate reviews: design director and automated detector) scored the site 19/32 and listed one P0, three P1 and one P2 issue. This pass fixes all of them, with the owner's choices: the chamber-day timetable as the site's signature and everyday Bangla formats.

- Emergency first: on `/emergency` the call buttons come before the steps; the home hero has an emergency call line; the emergency quick action is red with its word.
- Symptom search: each department has symptom keywords ("বুকে ব্যথা", "chest pain"), used by the directory, hero search and site search; a search that finds nobody offers the emergency number, the hotline and the department list.
- Doctor cards: compact cards showing the next chamber (today, tomorrow or the weekday, the time and the branch) and the fee, with one booking button; a doctor on leave shows the return date.
- One booking word in Bangla (সিরিয়াল নিন); the phone bar says Hotline and Book and steps aside on the booking page.
- Everyday formats: chamber times as "সকাল ৯টা - দুপুর ১টা" / "9 am - 1 pm", dates as "২ অক্টোবর ২০২৬", prices without zero paisa ("৳ ৩,৫০০"); the request forms use a day picker instead of the native date input.
- Layout: departments two per row on phones, doctors and packages as snap rows, no empty strip above the footer, package page has a booking button and no department field, readable bio width, shorter English header labels, a dark placeholder on the dark emergency band.

## Files

| File                                                                                                                            | Purpose                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `apps/site/src/i18n/clock.ts`                                                                                                   | Everyday times, long dates and day-picker options from catalog words                           |
| `apps/site/src/content/doctor-summary.ts`, `src/components/doctor-card.tsx`                                                     | Next chamber, fee, return date; compact card                                                   |
| `apps/site/src/components/doctor-directory.tsx`                                                                                 | Empty state with emergency, hotline and departments                                            |
| `apps/site/src/sections/hero.tsx`, `content-sections.tsx`, `collection-sections.tsx`                                            | Emergency line, red emergency action, dark placeholder, phone grids and snap rows              |
| `apps/site/src/components/phone-action-bar.tsx`                                                                                 | Client component; hidden on the booking page                                                   |
| `apps/site/src/components/appointment-request-form.tsx`, `service-form.tsx`                                                     | Day picker; optional department                                                                |
| `apps/site/src/components/opd-hours.tsx`, `schedule-table.tsx`, `booking-wizard.tsx`, article, notice, career and profile pages | Everyday times and dates                                                                       |
| `apps/site/src/format.ts`                                                                                                       | Whole-taka prices without zero paisa                                                           |
| `packages/contracts/src/website.ts`, `apps/site/content/*.json`                                                                 | Optional department `keywords`; booking word; emergency section order; label fixes             |
| `packages/i18n/src/messages/site/*.ts`                                                                                          | Month, period, clock, date, chamber, leave, emergency and help keys                            |
| `apps/site/e2e/*.spec.ts`                                                                                                       | Updated formats; new tests for emergency order, symptom search, chamber line, leave, phone bar |
| `.gitignore`                                                                                                                    | Ignores the local `.impeccable/` critique archive                                              |

## Decisions applied

- Time and date words live in the catalog; code keeps only ASCII.
- Snap rows are positioned (`relative`) so screen-reader-only labels inside cards stay clipped; without it the page scrolled sideways by about 2,000 px on phones (caught by the quality suite).

## Verification

| Command                                                                                            | Result                                                                                                         |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `pnpm turbo run lint typecheck test --filter=@hms/site --filter=@hms/i18n --filter=@hms/contracts` | All tasks successful                                                                                           |
| `CI=true pnpm --filter @hms/site test:e2e`                                                         | 73 passed                                                                                                      |
| `impeccable detect` on `apps/site/app`, `apps/site/src`                                            | Clean                                                                                                          |
| Screenshots: `/bn` 1366, `/bn/doctors` 390, `/bn/emergency` 1366, `/bn` 390 mid-page               | Reviewed                                                                                                       |
| `pnpm turbo run lint typecheck test` (whole repo)                                                  | 45 of 49; `@hms/mod-identity-access` needs the local Postgres, which was not running; unrelated to this change |

## Known limitations

- "Today" on cards is the build date (static pages).
- Deploy impact: none.

## How to debug

- A card shows no next chamber: the doctor has no session in the next 14 days outside leave.
- A symptom search finds nothing: add the word to that department's `keywords` in `content/departments.json`.
