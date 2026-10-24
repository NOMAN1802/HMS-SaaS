# T-WEB-11: patient service forms (mock)

- **Date:** 2026-10-21
- **Commit:** this commit
- **Implements:** task T-WEB-11; FR-WEB-REP-001, FR-WEB-SVC-001, FR-WEB-SVC-002, FR-WEB-GEN-006; AT-WEB-033

## What was built

`/reports` explains how online reports work and has a lookup by report number and mobile. `/sample-collection` takes a home sample collection request (contact, area, date, address, tests). `/feedback` takes anonymous or named feedback with a rating in words. All three use one configurable mock form that validates required fields and mobile numbers (Bangla digits accepted) and ends in a demo message; nothing is sent.

## Files

| File                                                                                         | Purpose                                     |
| -------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `apps/site/src/components/service-form.tsx`                                                  | Field-list driven mock form                 |
| `apps/site/app/[locale]/reports/page.tsx`, `sample-collection/page.tsx`, `feedback/page.tsx` | The three service pages                     |
| `packages/i18n/src/messages/site/*.ts`                                                       | `reports`, `sample`, `feedback` keys        |
| `apps/site/e2e/services.spec.ts`                                                             | Validation, demo messages, no requests, axe |

## Verification

| Command                                                                    | Result               |
| -------------------------------------------------------------------------- | -------------------- |
| `pnpm turbo run lint typecheck test --filter=@hms/site --filter=@hms/i18n` | All tasks successful |
| `CI=true pnpm --filter @hms/site test:e2e`                                 | 55 passed            |

## Known limitations

- Real report delivery depends on Q-013 (reports with dues) and the portal (EP-27); form delivery to staff is T-CMS-09.
- Deploy impact: none.

## How to debug

- A form never confirms: a required field is empty or the mobile number fails `isMobileNumber()`; errors show under each field.
