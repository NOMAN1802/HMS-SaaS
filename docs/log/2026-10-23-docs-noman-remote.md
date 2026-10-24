# Docs: noman remote renamed to NOMAN1802/HMS-SaaS

- **Date:** 2026-10-23
- **Commit:** this commit
- **Implements:** task T-OPS-01 (git and deployment docs)

## What changed

GitHub reported on every push that `NOMAN1802/HMS-ERP` (the `noman` backup remote) has moved to `NOMAN1802/HMS-SaaS`. The local remote and the docs now use the new address.

This also closes a gap in `docs/DEPLOYMENT.md` section 5: "the server clones `NOMAN1802/HMS-SaaS`, which is not one of the three configured remotes". It is the `noman` remote under its new name, so `main` reaches the server through the usual push to all three remotes. Checked with `git ls-remote`: `noman` has the same `main` (9ce62b8) and `dev` (5d2f426) as `origin`. The gap row is removed and the deploy flow (section 3, step 3) names the repository.

## Files

| File                   | Change                                                     |
| ---------------------- | ---------------------------------------------------------- |
| `CLAUDE.md`            | Remote table and the `git remote add` line use the new URL |
| `docs/GIT_WORKFLOW.md` | Remote table                                               |
| `docs/DEPLOYMENT.md`   | Deploy flow names the repository; gap row removed          |

## Commands

| Command                                                              | Result                   |
| -------------------------------------------------------------------- | ------------------------ |
| `git remote set-url noman https://github.com/NOMAN1802/HMS-SaaS.git` | Done (local clone only)  |
| `git ls-remote --heads noman dev main`                               | Same commits as `origin` |
| `pnpm format:check`                                                  | Clean                    |

## Known limitations

- Other clones still have the old URL; GitHub redirects for now. Fix with `git remote set-url noman https://github.com/NOMAN1802/HMS-SaaS.git`.
- Deploy impact: none.

## How to debug

- A push to `noman` prints "This repository moved": the clone still has the old URL; run the command above.
