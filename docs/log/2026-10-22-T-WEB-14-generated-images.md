# T-WEB-14: generated images for every slot

- **Date:** 2026-10-22
- **Commit:** this commit
- **Implements:** task T-WEB-14; decisions C-065, C-071, P-032; F section 6

## What was built

Every image slot in the content now has a real picture (65 images), generated with ChatGPT from `apps/site/content/image-prompts.md` and reviewed one by one: the hero, guide, emergency band and team photo, 12 departments, 6 centres, 10 packages, 3 branches, 6 article illustrations and 24 doctor portraits. Each image is cropped to its slot size and saved as WebP (about 50 to 120 KB). The logo slot stays the brand mark (C-060).

- File names carry a content fingerprint, `public/images/<slot>-<hash8>.webp`, so a replaced image gets a new URL and no browser, image-optimizer or CDN cache keeps the old one (found when the first ambulance was replaced).
- Doctor portraits are AI images of fictional people; their alt text already says so (P-032). Each prompt gives the doctor a distinct look (hair, glasses, beard, clothing) on one shared backdrop, so the directory reads as one hospital's staff photos rather than 24 copies of one face.

## Changes to the prompt list

- The emergency band is shown as a 4:3 card, so its slot is now 1200 x 900 (was 1600 x 500), and its prompt is built around the band's dark teal with one red beacon.
- Article prompts are illustrations throughout (they also asked for "photorealistic").
- Four scenes were reworded after or ahead of content-filter refusals (paediatric chest exam, two ultrasound scenes, child height check): same idea, fully dressed people.
- Branches got distinct buildings (Dhanmondi lakeside brick, Uttara tower); the first versions were the same building three times.

## Other changes

- Detail-page image frames now match their images: department pages use a new 2:1 `feature` frame (the department images are 2:1), package and branch pages use 16:9. The 3:1 `banner` frame cut people's heads off and is removed.
- Packages had one picture per category, so four packages (basic, executive, diabetes, heart) showed the same image, twice side by side on the home page. Executive, diabetes and heart now have their own slots and pictures; a quality test fails if any page type shows the same visible picture twice (hidden tab panels repeat cards by design and are not counted).
- Each image was generated in its own ChatGPT conversation. The first ten portraits came from one long conversation and drifted towards the same face; they were regenerated one per conversation.

## Files

| File                                                                     | Purpose                                              |
| ------------------------------------------------------------------------ | ---------------------------------------------------- |
| `apps/site/public/images/*.webp`                                         | The generated images, fingerprinted                  |
| `apps/site/content/**/*.json`                                            | `src` set on every slot                              |
| `apps/site/content/image-prompts.md`                                     | Naming rule, band size, reworded and new prompts     |
| `apps/site/e2e/quality.spec.ts`                                          | No page type shows the same picture twice            |
| `docs/site-planning/F-ui-ux-design.md`                                   | Emergency band size and description                  |
| `apps/site/src/components/image-slot.tsx`                                | `feature` (2:1) frame added, unused `banner` removed |
| `apps/site/app/[locale]/{departments,packages,branches}/[slug]/page.tsx` | Frames matched to the images                         |

## Verification

| Command                                                                                                            | Result               |
| ------------------------------------------------------------------------------------------------------------------ | -------------------- |
| `pnpm turbo run lint typecheck test --filter=@hms/site`                                                            | All tasks successful |
| `next build`                                                                                                       | Success, 166 pages   |
| `playwright test` against `next start` on port 3201                                                                | 81 passed            |
| Content check: every slot except the logo has a `src`                                                              | 65 of 65             |
| Review: contact sheets of all 62 images; screenshots of `/bn`, `/bn/doctors`, department, package and branch pages | Reviewed             |

## Known limitations

- Images are AI-generated stand-ins for the demo; a hospital replaces them with its own photography through the CMS later.
- Deploy impact: none (static files in `public/`).

## How to debug

- An image does not change after replacing it: the file name must change too; regenerate the fingerprint (first 8 hex characters of the WebP's SHA-256) and update `src`.
- A slot shows the placeholder: its `src` is missing or the file is not in `public/images`.
