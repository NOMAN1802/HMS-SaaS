# CMS owner decisions

- **Date:** 2026-10-25
- **Commit:** this commit
- **Implements:** C-086..C-090; EP-32 planning

## What changed

Recorded the owner answers: one person edits and publishes, ready-made sections, editable branding with selectable themes and curated fonts, public price visibility selected by the hospital with finance controlling ERP prices, and separate customer installations on customer domains. Subscription plan restrictions no longer apply. Updated website requirements, architecture and task blockers to match.

## Files

The five documents in `docs/site-planning/` updated are A (decisions), C2 (CMS requirements), D (system design), G (implementation plan) and README (overview).

## Decisions applied

C-086..C-090 supersede conflicting earlier website proposals. The owner's previous hold on the SaaS question is resolved by the new installation direction.

## Verification

- Reviewed decision references, answered question rows and CMS task blockers.
- `git diff --check`: passed.
- Application tests are unnecessary for documentation-only changes.

## Known limitations

CMS implementation has not started. Exact themes, font options and technical upload limits need implementation design. ERP-wide historical SaaS planning and existing isolation code have not been migrated; this update records the new direction in the website planning pack.

## How to debug

Start with A C-086..C-090 when older proposals conflict. Customer installation configuration requires separately reviewed development work.

Deploy impact: none. No runtime, migration or server configuration changes.
