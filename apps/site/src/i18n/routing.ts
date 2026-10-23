// Locale routing for the public site. Unlike the staff app, the language is part of the URL so
// each page is indexable and shareable in both languages (P-023). Bangla is the default (C-062).
// Implements: T-WEB-01, FR-WEB-GEN-001.
import { defaultLocale, locales } from '@hms/i18n';
import { defineRouting } from 'next-intl/routing';

/** URL prefix per locale; also used by forms that must work without JavaScript. */
export const localePrefixes = { 'bn-BD': '/bn', en: '/en' } as const;

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: {
    mode: 'always',
    prefixes: localePrefixes,
  },
  // Bangla first for every new visitor (C-062, FR-WEB-GEN-001): the browser language and a
  // locale cookie are not used, so `/` always opens `/bn` and the site sets no cookies.
  localeDetection: false,
  localeCookie: false,
});
