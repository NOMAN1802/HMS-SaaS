// Picks the page language out of content text. Content stores `{ bn, en }`; the site locale is
// `bn-BD` or `en` (C-062, E section 1). Implements: T-WEB-04, P-025.
import type { LocalizedRichText, LocalizedText } from '@hms/contracts';
import type { Locale } from '@hms/i18n';

export function localize(text: LocalizedText, locale: Locale): string {
  return locale === 'en' ? text.en : text.bn;
}

export function localizeRich(text: LocalizedRichText, locale: Locale): string[] {
  return locale === 'en' ? text.en : text.bn;
}
