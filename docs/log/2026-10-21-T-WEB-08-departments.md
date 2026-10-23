# T-WEB-08 (with X33 OPD hours): departments and centres

- **Date:** 2026-10-21
- **Commit:** this commit
- **Implements:** tasks T-WEB-08, T-WEB-17 (X33 OPD hours, X23 call-back on department pages); FR-WEB-DEP-001..004, FR-WEB-GEN-009; AT-WEB-013, AT-WEB-052, AT-WEB-054

## What was built

`/departments` shows all twelve departments. Each department page has its overview, services, facilities, where to find it, the centre it belongs to, outpatient hours by weekday in the page's digits, exactly its doctors, and a call-back request with the department preselected. `/centres` lists the six centres of excellence; each centre page shows highlights, its departments and their doctors.

## Files

| File                                                                         | Purpose                                                             |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `apps/site/app/[locale]/departments/page.tsx`, `departments/[slug]/page.tsx` | Department list and detail                                          |
| `apps/site/app/[locale]/centres/page.tsx`, `centres/[slug]/page.tsx`         | Centre list and detail                                              |
| `apps/site/src/components/opd-hours.tsx`                                     | OPD hours by weekday                                                |
| `packages/i18n/src/messages/site/*.ts`                                       | `departments`, `department`, `centres`, `centre` keys               |
| `apps/site/e2e/departments.spec.ts`                                          | Lists, exact doctors, OPD digits, call-back form sends nothing, axe |

## Verification

| Command                                                                    | Result               |
| -------------------------------------------------------------------------- | -------------------- |
| `pnpm turbo run lint typecheck test --filter=@hms/site --filter=@hms/i18n` | All tasks successful |
| `CI=true pnpm --filter @hms/site test:e2e`                                 | 29 passed            |

## Known limitations

- Deploy impact: none.

## How to debug

- A department shows the wrong doctors: the doctor's `department` slug in `content/doctors.json`.
- The call-back form shows no confirmation: check `contactErrors()` in `src/forms/validation.ts` for the entered phone.
