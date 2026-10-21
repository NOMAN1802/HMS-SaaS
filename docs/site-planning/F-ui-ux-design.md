# F — UI/UX design (public website)

| Control    | Value                                                                          |
| ---------- | ------------------------------------------------------------------------------ |
| Document   | F UI/UX design for `apps/site`                                                 |
| Version    | 0.1.0-draft                                                                    |
| Status     | Proposal                                                                       |
| Owner role | UX lead + product owner                                                        |
| Updated    | 2026-10-21                                                                     |
| Applies    | [DESIGN.md](../../DESIGN.md) and ADR-022, with the public-site exception P-027 |

## 1. Design direction

**"The Welcoming Front Door."** The ERP is the quiet front desk; the website is the door patients walk through first. Same voice, warmer surface: generous white space, photography of people and places (P-027), the same teal that means "you can act here", and the same Bangla-first typography.

What carries over unchanged from DESIGN.md: tokens (Clinical Teal primary, Signal Cyan accent, Mist neutrals), fonts (TikTok Sans and Noto Sans Bengali headings, Geist and Tiro Bangla body), radius scale (6 / 8 px), motion grammar, focus ring, the One Meaning Rule, the Word Beside The Color Rule, no faux bold, Longer Bangla Rule, Logo Quarantine.

What is different on the site (P-027): photography and illustration are allowed; section backgrounds may use `primary-soft`, `accent-soft` and a deep `heading`-color band; display headline sizes are larger than in the ERP; cards may use the overlay shadow on hover only.

Layout reference: the structure of continental.health (C-064), as observed in R1 section 1. Nothing is copied.

## 2. Page inventory

| Route                                       | Page                         | Main components                                                                                                                     | Requirements         |
| ------------------------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| `/`                                         | Home                         | Hero search, quick actions, department grid, centres, featured doctors, packages, branches, guide teaser, articles, emergency strip | FR-WEB-HOME-*        |
| `/doctors`                                  | Find a doctor                | Search, department and branch filters, result count, doctor cards                                                                   | FR-WEB-DOC-001..003  |
| `/doctors/[slug]`                           | Doctor profile               | Profile header, tabs (About, Education, Experience), schedule table, book button                                                    | FR-WEB-DOC-004       |
| `/departments`, `/departments/[slug]`       | Departments                  | Grid; detail with services, doctors                                                                                                 | FR-WEB-DEP-001, -002 |
| `/centres`, `/centres/[slug]`               | Centres of excellence        | Cards; detail                                                                                                                       | FR-WEB-DEP-003       |
| `/packages`, `/packages/[slug]`             | Health packages              | Category tabs, package cards, detail with test groups                                                                               | FR-WEB-PKG-*         |
| `/tests`                                    | Test prices                  | Search, category filter, table on desktop, stacked rows on phone                                                                    | FR-WEB-TST-001       |
| `/book-appointment`                         | Book appointment             | Step indicator, four steps, demo confirmation                                                                                       | FR-WEB-BOOK-*        |
| `/reports`                                  | Online report                | Explainer, lookup form, demo result                                                                                                 | FR-WEB-REP-001       |
| `/sample-collection`                        | Home sample collection       | Request form                                                                                                                        | FR-WEB-SVC-001       |
| `/feedback`                                 | Feedback                     | Form                                                                                                                                | FR-WEB-SVC-002       |
| `/patients-and-visitors`                    | Patient and visitor guide    | Anchored sections, query form                                                                                                       | FR-WEB-SVC-003       |
| `/emergency`                                | Emergency                    | Big call buttons, steps, location                                                                                                   | FR-WEB-SVC-004       |
| `/branches`, `/branches/[slug]`             | Branches                     | Cards, detail with map placeholder                                                                                                  | FR-WEB-INF-001       |
| `/contact`                                  | Contact                      | Branch contacts, form                                                                                                               | FR-WEB-INF-002       |
| `/articles`, `/articles/[slug]`, `/notices` | Articles and notices         | Cards, article layout                                                                                                               | FR-WEB-INF-003       |
| `/about`, `/careers`                        | About, careers               | Content, job list                                                                                                                   | FR-WEB-INF-004       |
| `/portal`                                   | Patient portal (coming soon) | Explainer                                                                                                                           | FR-WEB-INF-006       |
| (any)                                       | Not found                    | Search, links                                                                                                                       | FR-WEB-INF-005       |

All routes exist under `/bn` and `/en`.

## 3. Wireframes (desktop 1366, simplified)

### Shell

```text
+---------------------------------------------------------------------------------+
| [!] Emergency 10XXX   Hotline 10XXX   info@demo.example      Portal  [বাংলা|EN] |  top bar, heading-color band
+---------------------------------------------------------------------------------+
| [LOGO CareSpate]              Doctors  Departments v  Centres  Packages          |
|                               Patients & visitors  Articles  Contact [Book appt] |  header, sticky
+---------------------------------------------------------------------------------+
| Demo content: names, prices and schedules on this site are samples.          [x] |  demo notice
```

### Home

```text
+------------------------------------------+--------------------------------------+
| Care that knows you by name              |                                      |
| One line of supporting text              |        [ hero image slot ]           |
| [ Search doctor, department ...  ][Go]   |        hero-main                     |
| Popular: Cardiology  Child care  Eye     |                                      |
+------------------------------------------+--------------------------------------+
| [Find a doctor] [Book appointment] [Packages] [Online report] [Test prices] [SOS] |  quick actions
+---------------------------------------------------------------------------------+
| Our departments                                                    View all ->  |
| [icon Cardiology] [icon Neurology] [icon Orthopaedics] [icon Paediatrics] ...   |  4 x 3 grid
+---------------------------------------------------------------------------------+
| Centres of excellence     [ image card ][ image card ][ image card ]            |
+---------------------------------------------------------------------------------+
| Meet our specialists  [<]  [doctor card][doctor card][doctor card][doctor card] [>]
+---------------------------------------------------------------------------------+
| Health packages   [All][Women][Men][Senior][Child][Vaccine]                      |
| [package card ৳ sample] [package card] [package card]                           |
+---------------------------------------------------------------------------------+
| Our branches  [branch card] [branch card] [branch card]                         |
+---------------------------------------------------------------------------------+
| Patients & visitors teaser  | Latest articles [card][card][card]                |
+---------------------------------------------------------------------------------+
| 24-hour emergency  [Call 10XXX]  [Ambulance]                                     |  primary band
+---------------------------------------------------------------------------------+
| footer: contact | branches | quick links | legal | Powered by Bytespate         |
```

### Find a doctor

```text
| Find a doctor                                                                   |
| [ Search by name, speciality or interest            ]                           |
| Department: [All v]   Branch: [All v]                       24 doctors found    |
| [photo] Dr. Sample Name        [photo] ...        [photo] ...                    |
|         Senior Consultant                                                        |
|         Cardiology . Gulshan                                                     |
|         [View profile] [Book]                                                    |
```

### Doctor profile

```text
| [photo slot]  Dr. Sample Name                                                    |
|               Senior Consultant, Cardiology                                      |
|               MBBS, FCPS (Medicine) . Speaks Bangla, English                     |
|               [Book appointment]  [Call hotline]                                 |
| [About] [Education] [Experience]          | Chamber schedule                     |
| tab content                               | Sat 09:00-13:00  Level 3, OPD 2      |
|                                           | Mon 17:00-21:00  ...                 |
```

### Book appointment

```text
| Book an appointment   (1) Doctor  (2) Date & time  (3) Your details  (4) Review  |
| Step 2: [ week strip: Sat 25 | Sun 26 | Mon 27 ... ]                             |
|         [09:00][09:15][09:30] ... (from the doctor's schedule, slotMinutes)      |
|                                              [Back]            [Continue]        |
```

### Phone (360)

Top bar collapses to an emergency button and the language switch; the header shows logo, a "Book" button and a menu button; the quick actions become a two-column grid; carousels become horizontal scroll with snap; tables become stacked rows; a sticky bottom bar offers Call and Book.

## 4. Components

| Component              | Where                                                                                                                | Built from                                                  |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Button, link-as-button | everywhere                                                                                                           | `Button`, `buttonClassName` (`@hms/ui`)                     |
| Text field, form field | search, forms                                                                                                        | `TextInput`, `Field`                                        |
| Select-like filter     | directory, tests                                                                                                     | `Combobox` or a filter chip row of `Button`                 |
| Tabs                   | profile, packages                                                                                                    | `Tabs`                                                      |
| Menu / mobile panel    | header                                                                                                               | `Menu`, `Dialog` (full-height variant)                      |
| Language switch        | top bar                                                                                                              | `LanguageSwitch`                                            |
| Toast / alert          | demo confirmations                                                                                                   | `Alert` (not toast: confirmations are important, DESIGN.md) |
| Site-only              | header, footer, section heading, department card, doctor card, package card, branch card, step indicator, image slot | `apps/site/src/components`                                  |

## 5. Accessibility and language

- Bangla is reviewed first at 360, 768 and 1366 px; every text block is checked with Bangla about 30 percent longer.
- Every icon sits beside a word. The emergency color is the Danger action red only on the call button, with the word "Emergency".
- Carousels: no auto-play; previous and next buttons with labels; keyboard and swipe.
- Forms: labels above fields, errors in words, required marked in text.

## 6. Image slots and AI prompt list (C-065)

WEB-A ships tokenized SVG placeholders. During T-WEB-14 a file `apps/site/content/image-prompts.md` is written with one prompt per slot; generated files go to `apps/site/public/images/<slot>.webp` and are referenced from content `ImageRef.src`.

| Slot                      | Used on                   | Size (px)  | Prompt direction                                                                                                                          |
| ------------------------- | ------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `hero-main`               | Home hero                 | 1200 x 900 | Bangladeshi doctor and patient in a bright modern consultation room, natural light, teal and white palette, warm and calm, photorealistic |
| `centre-<slug>` (x6)      | Centre cards              | 800 x 600  | The relevant care setting (cardiac lab, maternity suite, ...), no identifiable patients                                                   |
| `department-<slug>` (x12) | Department pages          | 1200 x 600 | Clinical equipment or a care moment for that department                                                                                   |
| `doctor-<slug>` (x24)     | Doctor cards and profiles | 600 x 750  | Portrait of a fictional doctor, neutral background; marked as an illustration in alt text                                                 |
| `branch-<slug>` (x3)      | Branch cards              | 800 x 500  | Exterior of a modern hospital building in Dhaka, daytime                                                                                  |
| `package-<category>` (x7) | Package cards             | 800 x 500  | Health-check scene matching the category                                                                                                  |
| `article-<slug>` (x6)     | Articles                  | 1200 x 630 | Editorial illustration for the topic                                                                                                      |
| `emergency-band`          | Emergency strip           | 1600 x 500 | Ambulance bay at dusk, motion blur, no faces                                                                                              |

AI-generated faces of "doctors" are illustrations, not real staff; alt text says so (P-032).
