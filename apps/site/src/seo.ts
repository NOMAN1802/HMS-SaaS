// Search engine helpers: the public origin and per-page canonical and language alternates
// (FR-WEB-SEO-001, AT-WEB-040). The site is served at the root of the existing web host (C-075).
// Implements: T-WEB-13.
import type { Metadata } from 'next';
import { localePrefixes } from './i18n/routing';

export const SITE_ORIGIN = 'https://healthcare.bytespate.com';

function localized(prefix: string, path: string): string {
  return path === '/' ? prefix : `${prefix}${path}`;
}

/** Adds the canonical URL for this language and alternates for both (`/bn/...`, `/en/...`). */
export function withAlternates(path: string, locale: string, metadata: Metadata): Metadata {
  const prefix = locale === 'en' ? localePrefixes.en : localePrefixes['bn-BD'];
  return {
    ...metadata,
    alternates: {
      canonical: localized(prefix, path),
      languages: {
        'bn-BD': localized(localePrefixes['bn-BD'], path),
        en: localized(localePrefixes.en, path),
        'x-default': localized(localePrefixes['bn-BD'], path),
      },
    },
  };
}
