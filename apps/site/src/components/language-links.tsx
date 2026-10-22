'use client';
// Language switch as two links to the same page in the other language, so it works without
// JavaScript and each language has its own URL (P-023, FR-WEB-GEN-001, AT-WEB-004). The links
// keep the query string, so a chosen doctor, a search or directory filters survive the switch.
// The query is only known in the browser (the pages are built ahead of time): the built HTML
// links to the bare page and the browser adds the query after hydration. It is read from
// `location` rather than `useSearchParams`, which on a static page needs a Suspense boundary
// that swaps the links for new ones after hydration and can swallow a click made meanwhile.
// Filters update the URL without an event, so a click also re-reads the query.
// Implements: T-WEB-05, T-WEB-15.
import { useTranslations } from 'next-intl';
import { useSyncExternalStore, type MouseEvent } from 'react';
import { Link, usePathname, useRouter } from '../i18n/navigation';
import { useSiteLocale } from '../i18n/locale';

// Each language is named in its own script so a visitor can find theirs (C-062).
const LANGUAGES = [
  { locale: 'bn-BD', labelKey: 'shell.languageBangla', lang: 'bn' },
  { locale: 'en', labelKey: 'shell.languageEnglish', lang: 'en' },
] as const;

function subscribe(onChange: () => void) {
  window.addEventListener('popstate', onChange);
  return () => window.removeEventListener('popstate', onChange);
}

const browserQuery = () => window.location.search.slice(1);
const serverQuery = () => '';

export function LanguageLinks({ className }: { className?: string }) {
  const t = useTranslations();
  const locale = useSiteLocale();
  const pathname = usePathname();
  const router = useRouter();
  const query = useSyncExternalStore(subscribe, browserQuery, serverQuery);
  const withQuery = (search: string) => (search ? `${pathname}?${search}` : pathname);

  function follow(event: MouseEvent<HTMLAnchorElement>, target: (typeof LANGUAGES)[number]) {
    const fresh = browserQuery();
    if (fresh === query) return;
    event.preventDefault();
    router.push(withQuery(fresh), { locale: target.locale });
  }

  return (
    <nav aria-label={t('shell.language')} className={className}>
      <ul className="flex items-center gap-1">
        {LANGUAGES.map((language) => {
          const current = language.locale === locale;
          return (
            <li key={language.locale}>
              <Link
                href={withQuery(query)}
                locale={language.locale}
                lang={language.lang}
                aria-current={current ? 'true' : undefined}
                onClick={(event) => follow(event, language)}
                className={`inline-flex min-h-8 items-center rounded-control px-2 font-ui text-sm ${
                  current ? 'bg-on-primary text-heading' : 'underline-offset-4 hover:underline'
                }`}
              >
                {t(language.labelKey)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
