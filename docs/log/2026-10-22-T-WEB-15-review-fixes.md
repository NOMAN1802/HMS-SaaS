# T-WEB-15: review fixes (carousel focus, language switch, filters, dates after the build, field alignment)

- **Date:** 2026-10-22
- **Commit:** this commit
- **Implements:** task T-WEB-15 (review of WEB-A); touches T-WEB-05, T-WEB-07, T-WEB-11; FR-WEB-GEN-001, FR-WEB-DOC-001..003, FR-WEB-DOC-006, AT-WEB-004, AT-WEB-011

## What was fixed

Six defects found in review, and one owner request (7):

1. **Carousel focus went off screen.** Shift+Tab out of the second screenful of doctor cards focused links that stayed hidden. The focus handler passed a slide index to Embla's `scrollTo`, which takes a snap (screenful) index. It now looks the slide up in Embla's slide registry and scrolls to its snap. Embla's own focus handling (`watchFocus`) is off so only one handler moves the track, and reduced motion still jumps.
2. **The language switch dropped the query.** `/en/book-appointment?doctor=farhana-rahman` switched to `/bn/book-appointment` and restarted the doctor choice; searches and directory filters were lost too. The links now carry the query string. It is read from `location` with `useSyncExternalStore` (empty on the server, so the built HTML links to the bare page), not `useSearchParams`: on a static page that needs a Suspense boundary which replaces the links after hydration, and a click made during the swap was lost (seen as a flaky test). The directory updates the URL with `router.replace`, which fires no event, so a click re-reads the query and navigates with the fresh one if it changed.
3. **Directory filters disagreed with the URL.** After filtering to Cardiology, the header's Doctors link changed the URL to `/en/doctors` but the list still showed cardiologists, because the filters read the URL only on mount. The directory now remembers the query strings it wrote; any other URL change (header link, back, forward) resets the filters from the URL. Its own writes are skipped so a fast typist does not lose characters to a late URL update.
4. **"Next chamber" was frozen at the build day.** It was worked out during static generation, so a Thursday build said "Today, 10 am" for Dr. Kamrul Hasan on Friday. The doctor summary now carries the weekly sessions and leave dates; the card works out the next chamber and the "back on" day in the browser. Before that, the built HTML lists the doctor's chamber days, which are true on any day. The profile's leave notice had the same problem and is now chosen in the browser as well.
5. **Date pickers failed hydration on a later day.** The HTML held the build day's 14 options while the browser built options from its own today: React error #418 on sample collection and the callback form. The new `useToday` hook is null on the server and during hydration and today's Dhaka date afterwards, so the choices appear once the page has hydrated. The booking wizard uses it too.

6. **Inputs in a row did not line up.** `Field` put the hint between the label and the control, so on the booking details step (and the callback, contact and service forms) the mobile number input sat lower than the name input beside it. The hint now goes under the control, after the error, so controls and errors line up across a row. It is still announced with the control through `aria-describedby`. The staff app uses no hints, so only the site changes.

7. **Department pictures were small and soft.** The picture sat in the left column at 824 x 412 and was served at 640 px wide (the default `sizes` assumes a third of the screen). It now spans the page width above the columns at 2:1 (1216 x 608 at 1280 px), edge to edge at 16:9 on a phone, with `sizes` matching and `priority`, since it is the page's largest paint. Checked with Playwright on all 12 departments at 1280 and 360 px: loaded, full size, no sideways scroll.

## Files

| File                                                    | Purpose                                                                   |
| ------------------------------------------------------- | ------------------------------------------------------------------------- |
| `apps/site/src/i18n/use-today.ts`                       | New: today in Dhaka in the browser, null on the server                    |
| `apps/site/src/content/availability.ts`                 | New: leave lookups, next chamber, back-on day; imports no content         |
| `apps/site/src/content/availability.test.ts`            | New: next chamber on and off session days, leave skipping, return day     |
| `apps/site/src/content/doctor-summary.ts`               | Carries sessions and leave instead of build-time next chamber and back-on |
| `apps/site/src/content/index.ts`                        | Re-exports the leave lookups from `availability.ts`                       |
| `apps/site/src/components/doctor-card.tsx`              | Client component; next chamber and leave note from `useToday`             |
| `apps/site/src/components/leave-notice.tsx`             | New: profile leave notice chosen in the browser                           |
| `apps/site/app/[locale]/doctors/[slug]/page.tsx`        | Uses `LeaveNotice`                                                        |
| `apps/site/src/components/carousel.tsx`                 | Slide to snap mapping, `watchFocus: false`                                |
| `apps/site/src/components/language-links.tsx`           | Links keep the query string                                               |
| `apps/site/src/components/doctor-directory.tsx`         | Filters follow outside URL changes                                        |
| `apps/site/src/components/service-form.tsx`             | Date choices from `useToday`                                              |
| `apps/site/src/components/appointment-request-form.tsx` | Date choices from `useToday`                                              |
| `apps/site/src/components/booking-wizard.tsx`           | Bookable dates from `useToday`                                            |
| `packages/ui/src/primitives/Field.tsx`                  | Error and then hint under the control                                     |
| `apps/site/app/[locale]/departments/[slug]/page.tsx`    | Full-width department picture                                             |
| `apps/site/e2e/*.spec.ts`                               | Regression tests for all five (home, shell, doctors, services)            |

## Verification

| Command                                        | Result                                                               |
| ---------------------------------------------- | -------------------------------------------------------------------- |
| `tsc --noEmit` and `pnpm lint` (site)          | Clean                                                                |
| `pnpm test` (site)                             | 36 passed                                                            |
| `playwright test` against the production build | 99 passed (7 timed out at load average 8 and passed on rerun)        |
| `playwright test shell --repeat-each=5`        | 30 passed (the language tests, after dropping the Suspense boundary) |

The new end-to-end tests set the browser clock (`page.clock.setFixedTime`): Thursday versus Friday for the next chamber, and five days after the build for the date pickers, which also fail on any hydration error.

## Known limitations

- Without JavaScript, the date pickers have only the "choose" option and cards show chamber days instead of the next chamber. The forms are demo-only and need JavaScript anyway.
- The language links show the bare URL in the page source; the query is added after hydration.
- Deploy impact: none.

## How to debug

- Anything showing a stale day: it must read `useToday()`, never `todayInDhaka()` during render of a statically built page.
- Hydration error #418 on a page with dates: something rendered a date-dependent value on the server. Look for `todayInDhaka()` outside an event handler or `useToday`.
- Filters snap back while typing: check `written` in `doctor-directory.tsx`; each `router.replace` must push its query string first.
