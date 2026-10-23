// Loads the site catalog for the locale in the URL. Content text (doctors, departments, pages)
// does not come from here: it comes from content data in the page language (C-070).
// Implements: T-WEB-01, P-024.
import { siteMessages } from '@hms/i18n';
import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  return { locale, messages: siteMessages[locale], timeZone: 'Asia/Dhaka' };
});
