# T-WEB-14: image slots and AI prompt list

- **Date:** 2026-10-21
- **Commit:** this commit
- **Implements:** task T-WEB-14; decisions C-065, C-071, P-032; F section 6

## What was built

`apps/site/content/image-prompts.md` lists one prompt for each of the 63 image slots used in the content (hero, guide, emergency band, about, 12 departments, 6 centres, 24 doctor portraits, 7 package categories, 3 branches, 6 articles, and the logo note), with size, where it is used and a shared style line. Generated images go to `apps/site/public/images/<slot>.webp` and are switched on by setting `src` on the slot in the content; until then each slot shows a token-colored placeholder (built in T-WEB-06). A unit test fails if any slot in the content has no prompt.

## Files

| File                                          | Purpose                                                                       |
| --------------------------------------------- | ----------------------------------------------------------------------------- |
| `apps/site/content/image-prompts.md`          | Prompt list (generated from the content by a one-off script outside the repo) |
| `apps/site/src/content/image-prompts.test.ts` | Every content slot has a prompt                                               |

## Decisions applied

- Doctor portraits are prompts for fictional people; alt text already says "illustration, not a real photo" (P-032).
- The logo slot is not generated: the hospital's real logo replaces the Bytespate placeholder (C-060).

## Verification

| Command                                                 | Result                               |
| ------------------------------------------------------- | ------------------------------------ |
| `pnpm turbo run lint typecheck test --filter=@hms/site` | All tasks successful (26 unit tests) |

## Known limitations

- No images are generated in this task. Deploy impact: none.

## How to debug

- The prompt test fails after adding content: add a `### \`<slot>\``entry to`image-prompts.md`.
- An image does not show: `src` must match `/images/<name>.webp|jpg|png` (schema rule) and the file must exist in `public/images`.
