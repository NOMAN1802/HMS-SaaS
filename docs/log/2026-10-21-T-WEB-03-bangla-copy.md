# T-WEB-03: natural Bangla copy

- **Date:** 2026-10-21
- **Commit:** this commit
- **Implements:** task T-WEB-03 (catalog wording), UAT-WEB-003 first pass; Q-079 (still open for final review)

## What was built

The Bangla text on the site now reads the way people in Bangladesh talk about hospitals. Everyday English loanwords are written in Bangla script (ডাক্তার, টেস্ট, রিপোর্ট, ব্রাঞ্চ, ডিপার্টমেন্ট, সিরিয়াল, মেসেজ, ফিডব্যাক, হেলথ টিপস), and medical abbreviations and degrees use Latin letters as they are printed on prescriptions and reports (ECG, ICU, CBC, HbA1c, MBBS, FCPS, OPD). Some department names use the common short forms (গাইনি ও অবস, ডেন্টাল). The home tagline became "আপনজনের মতো যত্ন". English text did not change.

## Files

| File                                       | Purpose                                           |
| ------------------------------------------ | ------------------------------------------------- |
| `packages/i18n/src/messages/site/bn-BD.ts` | Interface text rewritten                          |
| `apps/site/content/**/*.json`              | Bangla content text rewritten (English unchanged) |
| `apps/site/e2e/*.spec.ts`                  | Bangla labels in tests follow the new wording     |

## Decisions applied

- Bangla script stays the default; Latin is used only for abbreviations people read in Latin.
- The content was rewritten with a phrase map outside the repo, then checked for broken words (no two Bangla vowel signs in a row).

## Verification

| Command                                                                    | Result               |
| -------------------------------------------------------------------------- | -------------------- |
| `pnpm turbo run lint typecheck test --filter=@hms/site --filter=@hms/i18n` | All tasks successful |
| `CI=true pnpm --filter @hms/site test:e2e`                                 | 68 passed            |

## Known limitations

- Final wording still needs the product owner's review (Q-079). Deploy impact: none.

## How to debug

- A word looks broken: search the content for two Bangla vowel signs in a row.
