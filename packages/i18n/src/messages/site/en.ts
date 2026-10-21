// English catalog for the public website (apps/site): fixed interface text only. Hospital
// content (names, doctors, departments, pages) is tenant data and comes from content files or
// the CMS, never from here (C-070, P-024). Source of truth for site keys; the Bangla catalog is
// typed against it. Implements: T-WEB-01 (skeleton), extended in T-WEB-03.
export const siteEn = {
  meta: {
    title: 'Hospital website',
    description: 'A hospital website built on HMS.',
  },
  shell: {
    skipToContent: 'Skip to main content',
  },
  placeholder: {
    heading: 'Our new website is on its way',
    body: 'This is a demo website. Pages are being built.',
  },
} as const;

type Widen<T> = { -readonly [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };

/** The shape every site catalog must have. */
export type SiteMessages = Widen<typeof siteEn>;
