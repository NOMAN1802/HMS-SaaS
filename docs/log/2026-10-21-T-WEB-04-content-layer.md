# T-WEB-04: content layer and mock data

- **Date:** 2026-10-21
- **Commit:** this commit
- **Implements:** task T-WEB-04; FR-WEB-GEN-007, FR-WEB-GEN-008, AT-WEB-003; decisions C-069, C-070, C-072, P-025, P-026, P-036, P-040; E content model

## What was built

The public site now has its whole fictional CareSpate hospital as content data in the CMS format: site settings, theme, navigation and footer (`site.json`), five pages made of typed sections (`pages/*.json`) and the collections (12 departments, 6 centres, 24 doctors, 10 packages, 40 test prices, 3 branches, 6 articles, 4 notices, 4 jobs, 7 guide sections), every text in Bangla and English. Zod schemas for all of it live in `@hms/contracts` (`website.ts`) so the future CMS editor and API share them. The site reads content only through the adapter in `apps/site/src/content`, which validates every file and every cross-reference when it is first imported, so broken content fails the build.

## Files

| File                                                  | Purpose                                                                                                              |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `packages/contracts/src/website.ts` (+ test)          | Value types (localized text, money, time, safe links, image slots), site, 17 section types, page, collections        |
| `apps/site/content/*.json`, `content/pages/*.json`    | Fictional CareSpate content (C-069, P-032), CMS format (P-040)                                                       |
| `apps/site/src/content/load.ts`                       | Imports and validates the files; `buildContent()` for tests                                                          |
| `apps/site/src/content/references.ts`                 | Unknown slugs, duplicate keys, unknown icons, schedule and leave order, package price above separate total           |
| `apps/site/src/content/index.ts`                      | Adapter API: lookups, doctor and test search (both languages, Bangla digits), related doctors, leave, package saving |
| `apps/site/src/content/localize.ts`                   | Picks `bn` or `en` text for the page locale                                                                          |
| `apps/site/src/content/content.test.ts`               | Content valid; broken fixtures fail; search, filters, leave, saving                                                  |
| `packages/ui/src/icons/Icon.tsx` (+ test), `index.ts` | `isIconName()` so content icon names are checked at build                                                            |
| `apps/site/package.json`                              | Depends on `@hms/contracts`                                                                                          |

## Decisions applied

- Content text is never HTML: rich text is a list of paragraphs, and links must be site paths, `tel:`, `mailto:` or `https:` (C-080, NFR-WEB-SEC-002). Image sources are limited to `/images/*`.
- Money is a two-decimal string and the package saving is computed in integer paisa (ADR-007); it is never stored.
- Doctor "Tanvir Ahmed" has leave from 2026-10-20 to 2026-10-30 so the leave notice shows in the demo; "Imran Hossain" has a future leave.
- Phone numbers are `09600-000xxx` samples, the email uses `.example`, and addresses say "sample address", so nothing points at a real hospital.
- The content was produced by a one-off generator script outside the repo; the JSON files are the source from now on (they become CMS records in WEB-B).

## Verification

| Command                                                                                          | Result                              |
| ------------------------------------------------------------------------------------------------ | ----------------------------------- |
| `pnpm --filter @hms/contracts test`                                                              | 9 passed                            |
| `pnpm turbo run lint typecheck test --filter=@hms/site --filter=@hms/ui --filter=@hms/contracts` | All tasks successful; site 17 tests |

## Known limitations

- Bangla content text is a proposal awaiting native review (Q-079).
- Pages do not render the content yet (T-WEB-05 onwards).
- Deploy impact: none.

## How to debug

- Build fails with "Invalid content in content/<file>": the message lists the field paths; fix the JSON.
- "Broken content references": a slug in one file does not exist in another (for example a doctor's `department`).
- "unknown icon": the name is not in `ICONS` in `packages/ui/src/icons/Icon.tsx`; add the icon there and rebuild `@hms/ui`.
