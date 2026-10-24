# T-WEB-18: image import types for a fresh checkout

- **Date:** 2026-10-24
- **Commit:** this commit
- **Implements:** task T-WEB-18 (fix)

## What was fixed

CI on the v0.2.0 release PR (#21) failed at `apps/web` typecheck: `brand.tsx` imports the brand mark PNG (so the `/staff` base path applies, #20), and TypeScript found no type for `.png` imports. Next declares them in `next-env.d.ts`, which `next build` or `next dev` generates and `.gitignore` excludes. Locally the file existed, so typecheck passed; a fresh checkout has none.

`apps/web/src/image-types.d.ts` references `next/image-types/global` directly, so the types no longer depend on a generated file.

## Files

| File                            | Change                               |
| ------------------------------- | ------------------------------------ |
| `apps/web/src/image-types.d.ts` | New: reference to Next's image types |

## Commands

| Command                                                                                 | Result           |
| --------------------------------------------------------------------------------------- | ---------------- |
| `tsc --noEmit` in `apps/web` with `next-env.d.ts` and `.next` removed (before the fix)  | Same error as CI |
| Same, after the fix                                                                     | Clean            |
| Clean worktree: `pnpm install --frozen-lockfile`, `pnpm turbo run build lint typecheck` | See the PR       |

## Known limitations

- Deploy impact: none.

## How to debug

- A type error that CI shows and local runs do not: suspect a generated, git-ignored file (`next-env.d.ts`, `.next/types`). Reproduce by moving them aside, or in a clean `git worktree`.
