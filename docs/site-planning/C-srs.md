# C — Software requirements (public website)

| Control    | Value                                                                   |
| ---------- | ----------------------------------------------------------------------- |
| Document   | C Requirements for `apps/site`                                          |
| Version    | 0.1.0-draft                                                             |
| Status     | Draft-for-review                                                        |
| Owner role | Tech lead + product owner                                               |
| Updated    | 2026-10-21                                                              |
| Verify key | T = automated test, U = UAT / manual review, A = analysis or inspection |

Requirement IDs use `FR-WEB-<AREA>-nnn` and `NFR-WEB-<AREA>-nnn`. All requirements are for **WEB-A** unless marked otherwise. "Mock" means data from the content adapter (P-026), never a network call.

## 1. Global

| ID             | Requirement                                                                                                                                                                                                                                           | Status                                            | Verify |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ------ |
| FR-WEB-GEN-001 | Every page exists at `/bn/...` and `/en/...`; `/` redirects to `/bn`. The language switch keeps the visitor on the same page and scroll context.                                                                                                      | PROPOSED (P-023)                                  | T      |
| FR-WEB-GEN-002 | All interface text comes from the site catalog; all content text comes from the content adapter in the page language. A missing translation fails the build.                                                                                          | CONFIRMED (C-062), PROPOSED (P-024, P-025)        | T      |
| FR-WEB-GEN-003 | Digits, money and dates are formatted only with `@hms/i18n` (Bangla digits in Bangla, lakh/crore grouping, taka sign).                                                                                                                                | CONFIRMED (C-057, C-059)                          | T      |
| FR-WEB-GEN-004 | A "Demo content" notice is visible on every page; no testimonial, accreditation seal, award or statistic is presented as real.                                                                                                                        | PROPOSED (P-032)                                  | U      |
| FR-WEB-GEN-005 | The emergency number and the main hotline are reachable from every page in one tap (`tel:` links).                                                                                                                                                    | PROPOSED                                          | T      |
| FR-WEB-GEN-006 | Every form ends in a local demo confirmation and states that nothing was sent. No form submits to a server.                                                                                                                                           | CONFIRMED (C-063)                                 | T      |
| FR-WEB-GEN-007 | Hospital identity, theme, navigation, footer and page sections come from content data (`site.json`, `pages/*.json`) in the CMS format, never from component code, so every part can later be edited in the CMS (C-072, [C2](C2-cms-requirements.md)). | CONFIRMED (C-067, C-072), format PROPOSED (P-040) | T, A   |
| FR-WEB-GEN-009 | An `appointmentRequest` section (name, phone, department, preferred date) can be placed on any page, article or story; in WEB-A it ends in the demo confirmation (FR-WEB-GEN-006).                                                                    | CONFIRMED (C-074, R1 X23)                         | T      |
| FR-WEB-GEN-010 | Site settings hold separate hotlines for inside and outside Dhaka, both shown in the top bar and contact page with `tel:` links.                                                                                                                      | CONFIRMED (C-074, R1 X30)                         | T      |
| FR-WEB-GEN-008 | Pages render their sections in stored order through a section registry; a hidden section is not rendered; an unknown section type fails the build in WEB-A.                                                                                           | PROPOSED (P-036)                                  | T      |

## 2. Shell and navigation

| ID             | Requirement                                                                                                                                                                                                   | Status   | Verify |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------ |
| FR-WEB-NAV-001 | Top bar: emergency number, hotline, email, language switch, "Patient portal" link (shows a "coming soon" page in WEB-A).                                                                                      | PROPOSED | T      |
| FR-WEB-NAV-002 | Header: logo, primary navigation (Find a doctor, Departments, Centres, Health packages, Patients and visitors, Articles, Contact), and a "Book appointment" call to action. Departments opens a grouped menu. | PROPOSED | U      |
| FR-WEB-NAV-003 | Below 1280 px the navigation collapses into a menu button that opens a full-height panel with focus trapped and Escape to close.                                                                              | PROPOSED | T      |
| FR-WEB-NAV-004 | Footer: contact, branches, quick links, legal links, "Powered by Bytespate" (C-060).                                                                                                                          | PROPOSED | U      |
| FR-WEB-NAV-005 | A skip link to main content; landmarks (`header`, `nav`, `main`, `footer`).                                                                                                                                   | PROPOSED | T      |

## 3. Home

| ID              | Requirement                                                                                                                                      | Status   | Verify |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ------ |
| FR-WEB-HOME-001 | Hero with headline, image slot, and one search field that suggests doctors and departments as the visitor types.                                 | PROPOSED | T      |
| FR-WEB-HOME-002 | Quick actions: Find a doctor, Book appointment, Health packages, Online report, Test prices, Emergency.                                          | PROPOSED | U      |
| FR-WEB-HOME-003 | Sections: departments grid, centres of excellence, featured doctors, packages, branches, patient guide teaser, latest articles, emergency strip. | PROPOSED | U      |

## 4. Doctors

| ID             | Requirement                                                                                                                                                                                                                            | Status                    | Verify |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ------ |
| FR-WEB-DOC-001 | Directory with text search (name, speciality, interest), filters for department and branch, result count announced to screen readers, and an empty state.                                                                              | PROPOSED                  | T      |
| FR-WEB-DOC-002 | Filter state is kept in the URL query so a filtered list can be shared.                                                                                                                                                                | PROPOSED                  | T      |
| FR-WEB-DOC-003 | Doctor card: photo slot, name, designation, department, branch, "View profile", "Book appointment".                                                                                                                                    | PROPOSED                  | U      |
| FR-WEB-DOC-004 | Profile: photo slot, name, designation, qualifications, languages spoken, about, education, experience, special interests, chamber location, weekly schedule (day, time range), and "Book appointment" that pre-selects the doctor.    | PROPOSED                  | T      |
| FR-WEB-DOC-005 | Each doctor has a stable slug URL.                                                                                                                                                                                                     | PROPOSED                  | T      |
| FR-WEB-DOC-006 | A doctor with a current or upcoming leave shows "On leave until <date>" and an optional message on the card and profile; booking for leave dates is not offered. WEB-A data is mock; WEB-B reads ERP schedule exceptions (FR-CMS-021). | CONFIRMED (C-074, R1 X19) | T      |
| FR-WEB-DOC-007 | A profile lists up to four related doctors (same department first, then same branch), excluding the current doctor.                                                                                                                    | CONFIRMED (C-074, R1 X20) | T      |

## 5. Departments and centres

| ID             | Requirement                                                                                                                                                       | Status                    | Verify |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ------ |
| FR-WEB-DEP-001 | Department list grouped or searchable; each item has an icon, name and short summary.                                                                             | PROPOSED                  | U      |
| FR-WEB-DEP-002 | Department page: overview, services and procedures, facilities, doctors of the department, location and contact, "Book appointment" pre-selecting the department. | PROPOSED                  | T      |
| FR-WEB-DEP-003 | Centres of excellence: list and detail, each linking its departments and doctors.                                                                                 | PROPOSED                  | U      |
| FR-WEB-DEP-004 | Each department shows its OPD consultation hours (sessions per weekday, for example morning and evening) and the OPD location.                                    | CONFIRMED (C-074, R1 X33) | T      |

## 6. Packages and prices

| ID             | Requirement                                                                                                                                                                                     | Status                    | Verify |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ------ |
| FR-WEB-PKG-001 | Package list with category filter (health check, women, men, senior, child, vaccine, corporate).                                                                                                | PROPOSED                  | T      |
| FR-WEB-PKG-002 | Package detail: who it is for, included tests grouped by category, preparation instructions, sample price, "Book" call to action.                                                               | PROPOSED                  | U      |
| FR-WEB-PKG-003 | Prices show the "sample price" label until Q-078 is answered.                                                                                                                                   | OPEN-guarded (Q-078)      | T      |
| FR-WEB-PKG-004 | A package shows its code, the total of its tests if bought separately, the package price and the saving, and an optional doctor's fee note; the list page can show these as a comparison table. | CONFIRMED (C-074, R1 X26) | T      |
| FR-WEB-TST-001 | Test price list: search by test name or code, filter by category and branch, sample price, preparation note.                                                                                    | PROPOSED (R1 X2)          | T      |

## 7. Booking (mock)

| ID              | Requirement                                                                                                                                                                               | Status            | Verify |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------ |
| FR-WEB-BOOK-001 | Four steps with a visible step indicator: 1 department and doctor, 2 date and time from the doctor's mock weekly schedule, 3 patient name, phone and optional note, 4 review and confirm. | PROPOSED          | T      |
| FR-WEB-BOOK-002 | A doctor or department passed in the URL pre-selects step 1.                                                                                                                              | PROPOSED          | T      |
| FR-WEB-BOOK-003 | Field validation with messages in the page language; the phone field accepts Bangla or Latin digits (BD mobile format).                                                                   | PROPOSED          | T      |
| FR-WEB-BOOK-004 | Confirmation shows a sample reference and says clearly that this is a demo and no appointment was made. Real booking is FR-POR-002 (WEB-C).                                               | CONFIRMED (C-063) | T      |

## 8. Patient services (mock)

| ID             | Requirement                                                                                                                                                                                                 | Status                    | Verify |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ------ |
| FR-WEB-REP-001 | Online report page: explains how reports will be delivered, and a lookup form (reference and phone) that returns a demo "report ready" state with no real data. Real delivery is FR-POR-003 (WEB-C, Q-033). | PROPOSED (R1 X1)          | T      |
| FR-WEB-SVC-001 | Home sample collection request form (mock).                                                                                                                                                                 | PROPOSED (R1 X4)          | T      |
| FR-WEB-SVC-002 | Feedback form (mock) with category and rating.                                                                                                                                                              | PROPOSED (R1 X10)         | T      |
| FR-WEB-SVC-003 | Patient and visitor guide: admission, discharge, visiting hours and rules, what to bring, ward and cabin types without prices, international patients with a query form (mock).                             | PROPOSED (R1 X8, X9, X11) | U      |
| FR-WEB-SVC-004 | Emergency page: 24-hour number, ambulance number, what to do, location.                                                                                                                                     | PROPOSED                  | U      |
| FR-WEB-SVC-005 | The guide includes patient rights and responsibilities, an admission and payment guide, and a discharge checklist, as anchored sections that can be linked directly.                                        | CONFIRMED (C-074, R1 X25) | U      |

## 9. Information pages

| ID              | Requirement                                                                                                                                                                                                                                       | Status                    | Verify |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ------ |
| FR-WEB-INF-001  | Branches: list with address, opening hours, hotline, services, map placeholder; branch detail.                                                                                                                                                    | PROPOSED (R1 X3)          | U      |
| FR-WEB-INF-002  | Contact page with branch contacts and a contact form (mock).                                                                                                                                                                                      | PROPOSED                  | T      |
| FR-WEB-INF-003  | Articles: list with category filter and detail page; notices list.                                                                                                                                                                                | PROPOSED (R1 X13, X14)    | U      |
| FR-WEB-INF-004  | About and careers (open positions list, mock).                                                                                                                                                                                                    | PROPOSED                  | U      |
| FR-WEB-INF-005  | Not-found page in both languages with search and links to main sections.                                                                                                                                                                          | PROPOSED                  | T      |
| FR-WEB-INF-006  | "Patient portal" link leads to a "coming soon" page explaining what the portal will offer (EP-27).                                                                                                                                                | PROPOSED                  | U      |
| FR-WEB-INF-007  | A branch page shows the branch head, its units (with floor or address), opening hours, phones, a map placeholder and a doctor search limited to that branch.                                                                                      | CONFIRMED (C-074, R1 X21) | T      |
| FR-WEB-SRCH-001 | One site-wide search (header and a results page) finds doctors, departments, centres, packages, tests and articles in the page language, grouped by type, with Bangla and Latin digits accepted. WEB-A uses a build-time static index; no server. | CONFIRMED (C-074, R1 X28) | T      |

## 10. Search engines

| ID             | Requirement                                                                                                                             | Status   | Verify |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------ |
| FR-WEB-SEO-001 | Per-page title and description in the page language; `hreflang` alternates for bn and en; canonical URLs.                               | PROPOSED | T      |
| FR-WEB-SEO-002 | `sitemap.xml` covering both languages and `robots.txt`. In WEB-A both disallow indexing, because the content is demo content.           | PROPOSED | T      |
| FR-WEB-SEO-003 | Structured data (schema.org `Hospital`, `Physician`, `MedicalClinic`) prepared in templates; emitted only when content is real (WEB-B). | PROPOSED | A      |

## 11. Non-functional requirements

| ID                | Requirement                                                                                                                                                                     | Status                    | Verify |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ------ |
| NFR-WEB-PERF-001  | Lighthouse mobile performance >= 90 on home, directory and profile; LCP <= 2.5 s; CLS <= 0.1.                                                                                   | PROPOSED (SM-W03)         | T      |
| NFR-WEB-PERF-002  | First-load JavaScript for content pages kept small: interactive parts (search, filters, wizard, menu) are client components; everything else is server-rendered static HTML.    | PROPOSED                  | A      |
| NFR-WEB-ACC-001   | WCAG 2.2 AA: axe clean in both languages; keyboard-only use of menu, search, filters and wizard; visible focus; 44 px touch targets.                                            | PROPOSED (as NFR-ACC-001) | T, U   |
| NFR-WEB-I18N-001  | Layouts survive Bangla strings about 30 percent longer than English (DESIGN.md Longer Bangla Rule).                                                                             | CONFIRMED (C-052)         | U      |
| NFR-WEB-SEC-001   | Enforced CSP and security headers (P-029); no third-party scripts in WEB-A; no cookies and no data stored in browser storage in WEB-A.                                          | PROPOSED                  | T      |
| NFR-WEB-SEC-002   | Shared-host safety (C-080): both apps send an enforced CSP; CMS content is structured fields only and is rendered as text, never as HTML; the site loads no third-party script. | CONFIRMED (C-080)         | T, A   |
| NFR-WEB-MAINT-001 | Reuse guardrails and boundary rules (P-030) pass in CI; shared pieces go to `packages/ui`.                                                                                      | PROPOSED                  | T      |
| NFR-WEB-RESP-001  | Layouts reviewed at 360, 768, 1366 and 1920 px.                                                                                                                                 | PROPOSED                  | U      |

## 12. Routing and staff access (one host)

Applies to WEB-A, except where a row depends on the CMS (EP-32). Design: D section 13.

| ID               | Requirement                                                                                                                                                                                                  | Status                   | Verify |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------ | ------ |
| FR-WEB-ROUTE-001 | `healthcare.bytespate.com/` shows the public website (redirect to `/bn`) to every visitor without login. No public page asks for a login.                                                                    | CONFIRMED (C-075)        | T      |
| FR-WEB-ROUTE-002 | Every staff screen is under `/staff`. Opening `/staff` while signed out shows the login at `/staff/login`; old paths `/login` and `/choose-hospital` redirect there.                                         | CONFIRMED (C-076), P-043 | T      |
| FR-WEB-ROUTE-003 | After login (and choosing a hospital when the account has several), the user lands by permission: ERP only -> ERP home; website only -> CMS home `/staff/website`; both -> the choice screen `/staff/start`. | CONFIRMED (C-077), P-046 | T      |
| FR-WEB-ROUTE-004 | A user who holds both ERP and website permissions can switch between ERP and CMS from the staff shell without logging in again. Users with one side only never see the switch.                               | CONFIRMED (C-077)        | T      |
| FR-WEB-ROUTE-005 | Opening a CMS URL without a website permission, or an ERP URL without any ERP permission, shows the "no access" state; the API rejects the call regardless of the screen.                                    | CONFIRMED (C-077, C-079) | T      |
| FR-WEB-ROUTE-006 | `/staff` is not indexed: the site's `robots.txt` disallows it and every staff response carries `X-Robots-Tag: noindex, nofollow`. The site's locale routing never redirects a `/staff` path.                 | CONFIRMED (C-076), P-045 | T      |
| FR-WEB-ROUTE-007 | Accounts with `website.content.publish`, `website.theme.edit` or `website.settings.edit` must complete two-factor login; login rate limiting and lockout (C-032) apply to `/staff/login`.                    | CONFIRMED (C-081)        | T      |
