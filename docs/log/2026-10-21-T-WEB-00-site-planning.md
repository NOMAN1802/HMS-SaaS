# T-WEB-00: public website planning pack

- **Date:** 2026-10-21
- **Commit:** this commit
- **Implements:** task T-WEB-00 (planning only, no code), epics EP-31 (public website) and EP-32 (website CMS), decisions C-061..C-074

## What was built

A planning pack for the public, patient-facing hospital website (`apps/site`) and the website CMS, in the same format as the ERP pack. It records the product owner's decisions (separate app, Bangla and English, mock data first, Continental-style layout in HMS style, a website per tenant, owner-editable content, no mobile app) and the full research on six Bangladeshi hospital sites. A developer can now pick up T-WEB-01 from `docs/site-planning/G-implementation-plan.md`.

## Files

| File                                                    | Purpose                                                                          |
| ------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `docs/site-planning/README.md`                          | Index, relationship to the ERP pack, ground rules                                |
| `docs/site-planning/A-decisions-and-questions.md`       | C-061..C-074, P-023..P-042, Q-071..Q-085, AS-017..AS-020                         |
| `docs/site-planning/B-business-requirements.md`         | Objectives, scope per release (WEB-A, WEB-B, WEB-C), workflows, success measures |
| `docs/site-planning/C-srs.md`                           | FR-WEB-* and NFR-WEB-* requirements                                              |
| `docs/site-planning/C2-cms-requirements.md`             | FR-CMS-* requirements for the website CMS                                        |
| `docs/site-planning/D-system-design.md`                 | `apps/site` architecture, i18n routing, content adapter, CMS design, security    |
| `docs/site-planning/E-content-model.md`                 | Content entities, section catalog, CMS storage outline                           |
| `docs/site-planning/F-ui-ux-design.md`                  | Page inventory, wireframes, components, image slots                              |
| `docs/site-planning/G-implementation-plan.md`           | Tasks T-WEB-00..17 and T-CMS-01..09, DoR/DoD, traceability, release gate RG-W1   |
| `docs/site-planning/H-test-plan.md`                     | AT-WEB-* and UAT-WEB-* cases                                                     |
| `docs/site-planning/research/R1-competitor-analysis.md` | Six competitor sites: stacks, data models, features X1..X36, lessons             |

## Decisions applied

- IDs continue the ERP numbering (C-061, P-023, Q-071, EP-31) so they can be merged into A2/A3 on approval; until then this pack is authoritative only for the public website.
- Competitor research is passive and public-only; nothing is copied, and secrets seen in competitor URLs are not recorded.

## Verification

| Command                                         | Result                      |
| ----------------------------------------------- | --------------------------- |
| `pnpm exec prettier --check docs/site-planning` | All matched files formatted |

## Known limitations

- P-023, P-024, P-026, P-028..P-034, P-036..P-042 are still proposals for the tech lead.
- Open: Q-074 (body map), Q-075 (hosting and domains), Q-076 (analytics and chat), Q-078 (price publication), Q-079 (Bangla review), Q-080..Q-083 (CMS roles, design freedom, plan limits, editor mock).
- 37 of 264 research pages have no REA Evidence record (REA `execution_failure`); their structure was captured separately.

## How to debug

Planning only. If a requirement looks wrong, check its decision ID in `A-decisions-and-questions.md`, then the source row in R1.
