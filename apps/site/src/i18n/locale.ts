// The page locale as the shared `Locale` type, for server and client components. next-intl hands
// back a plain string; this narrows it once. Implements: T-WEB-05, P-023.
import { defaultLocale, isLocale, type Locale } from '@hms/i18n';
import { useLocale } from 'next-intl';
import { getLocale } from 'next-intl/server';

export async function pageLocale(): Promise<Locale> {
  const locale = await getLocale();
  return isLocale(locale) ? locale : defaultLocale;
}

export function useSiteLocale(): Locale {
  const locale = useLocale();
  return isLocale(locale) ? locale : defaultLocale;
}
