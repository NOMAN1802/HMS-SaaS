# T-WEB-10: booking wizard (mock)

- **Date:** 2026-10-21
- **Commit:** this commit
- **Implements:** task T-WEB-10; FR-WEB-BOOK-001..004, FR-WEB-GEN-006; AT-WEB-030..032, AT-WEB-034 (keyboard), AT-WEB-050 (no booking on leave days); BW-W02

## What was built

`/book-appointment` is a four-step wizard: choose a doctor (filtered by department), a date and time, enter name and mobile (Bangla digits accepted) with an optional reason, then review and confirm. Coming from a doctor's "Book" button (`?doctor=<slug>`) preselects the doctor and starts at the date step. Dates are the next 14 days on which the doctor has a session and is not on leave; times step through each session by the doctor's slot length. Confirming shows a demo message; nothing is sent.

## Files

| File                                               | Purpose                                                                   |
| -------------------------------------------------- | ------------------------------------------------------------------------- |
| `apps/site/src/booking/slots.ts` (+ test)          | Weekday of a date, bookable dates, slots by `slotMinutes`, leave handling |
| `apps/site/src/components/booking-wizard.tsx`      | Wizard with one component per step and a pure step check                  |
| `apps/site/app/[locale]/book-appointment/page.tsx` | Prepares doctors and schedules in the page language                       |
| `packages/i18n/src/messages/site/*.ts`             | `booking` keys                                                            |
| `apps/site/e2e/booking.spec.ts`                    | Preselection, 20-minute slots, validation, Bangla digits, no request, axe |

## Verification

| Command                                                 | Result                                          |
| ------------------------------------------------------- | ----------------------------------------------- |
| `pnpm turbo run lint typecheck test --filter=@hms/site` | All tasks successful (slot unit tests included) |
| `CI=true pnpm --filter @hms/site test:e2e`              | 49 passed                                       |

## Known limitations

- No real availability, serial numbers or SMS: those need the ERP scheduling module (WEB-C, FR-SCH-003).
- "Today" is the visitor's clock converted to Dhaka time.
- Deploy impact: none.

## How to debug

- No dates offered: the doctor's `schedule` weekdays and `leave` ranges in `content/doctors.json`; `bookableDates()` looks 14 days ahead.
- Wrong times: `slotsOn()` steps by `slotMinutes` and drops a slot that would end after the session end.
