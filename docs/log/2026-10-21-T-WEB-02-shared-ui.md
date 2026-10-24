# T-WEB-02: shared UI additions for the public site

- **Date:** 2026-10-21
- **Commit:** this commit
- **Implements:** task T-WEB-02; decision P-031; EP-31

## What was built

`@hms/ui` gains the icons the public site needs (departments, contact, booking, social links, language) and `buttonClassName(variant, size, className)`, which gives a link the exact classes of the matching `Button`, so a call-to-action link stays a link. `Button` itself now uses the same helper, so the two cannot drift.

## Files

| File                                             | Purpose                                                               |
| ------------------------------------------------ | --------------------------------------------------------------------- |
| `packages/ui/src/icons/Icon.tsx` (+ test)        | 53 new icon names (36 from the draft, 17 social, layout and language) |
| `packages/ui/src/primitives/Button.tsx` (+ test) | `buttonClassName`; `Button` uses it                                   |
| `packages/ui/src/index.ts`                       | Exports `buttonClassName`                                             |

## Decisions applied

- Icons still come only through `Icon` (ADR-022 rule 6); per-icon subpath imports keep the bundle to used glyphs.
- Brand logos (Facebook, YouTube and others) are used only as link icons with a visible or accessible text label.

## Verification

| Command                                                                   | Result                           |
| ------------------------------------------------------------------------- | -------------------------------- |
| `pnpm --filter @hms/ui test`                                              | 24 files, 159 tests passed       |
| `pnpm --filter @hms/ui lint build`                                        | Clean                            |
| `pnpm turbo run lint typecheck test --filter=@hms/web --filter=@hms/site` | 9 of 9 tasks                     |
| `CI=true pnpm --filter @hms/web test:e2e` (production build)              | 21 passed (staff app unaffected) |

## Known limitations

- No `Container` or `Card` primitives yet; site-only layout components stay in `apps/site` (P-031).
- Deploy impact: none.

## How to debug

- "Glyph is undefined" at render: the name is missing from `ICONS`, or the import path under `@phosphor-icons/react/dist/csr/` is wrong.
- The site does not see a new icon: rebuild `@hms/ui` (`pnpm --filter @hms/ui build`); apps read its `dist`.
