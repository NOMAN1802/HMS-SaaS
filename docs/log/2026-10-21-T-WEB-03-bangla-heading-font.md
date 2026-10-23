# T-WEB-03: Bangla heading font for the public site

- **Date:** 2026-10-21
- **Commit:** this commit
- **Implements:** task T-WEB-03 (Bangla presentation); decision C-082

## What was built

Bangla headings on the public website now use Hind Siliguri (600 and 700, Bangla subset only, self-hosted from `@fontsource/hind-siliguri`). The owner chose it after comparing nine options next to the Tiro Bangla body text. Latin headings stay TikTok Sans, body text stays Tiro Bangla, and the staff app is unchanged.

## Files

| File                                              | Purpose                                                                    |
| ------------------------------------------------- | -------------------------------------------------------------------------- |
| `apps/site/app/globals.css`                       | Imports the two Bangla weights and overrides `--font-heading` for the site |
| `apps/site/package.json`, `pnpm-lock.yaml`        | `@fontsource/hind-siliguri` 5.3.0 (same version line as the other fonts)   |
| `docs/site-planning/A-decisions-and-questions.md` | C-082                                                                      |

## Verification

| Command                                                   | Result                                                                 |
| --------------------------------------------------------- | ---------------------------------------------------------------------- |
| `pnpm turbo run lint typecheck test --filter=@hms/site`   | All tasks successful                                                   |
| `CI=true pnpm --filter @hms/site test:e2e`                | 68 passed                                                              |
| Built CSS                                                 | One `--font-heading` definition with Hind Siliguri; font files bundled |
| Screenshots of `/bn` (1366 px) and a doctor page (390 px) | Reviewed                                                               |

## Known limitations

- Deploy impact: none (fonts are served by the site itself; CSP unchanged).

## How to debug

- Headings fall back to Noto Sans Bengali: the `@fontsource/hind-siliguri` imports in `globals.css` are missing or the package is not installed.
