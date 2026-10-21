'use client';
// Language switch as two links to the same page in the other language, so it works without
// JavaScript and each language has its own URL (P-023, FR-WEB-GEN-001, AT-WEB-004).
// Implements: T-WEB-05.
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '../i18n/navigation';
import { useSiteLocale } from '../i18n/locale';

// Each language is named in its own script so a visitor can find theirs (C-062).
const LANGUAGES = [
  { locale: 'bn-BD', labelKey: 'shell.languageBangla', lang: 'bn' },
  { locale: 'en', labelKey: 'shell.languageEnglish', lang: 'en' },
] as const;

export function LanguageLinks({ className }: { className?: string }) {
  const t = useTranslations();
  const locale = useSiteLocale();
  const pathname = usePathname();
  return (
    <nav aria-label={t('shell.language')} className={className}>
      <ul className="flex items-center gap-1">
        {LANGUAGES.map((language) => {
          const current = language.locale === locale;
          return (
            <li key={language.locale}>
              <Link
                href={pathname}
                locale={language.locale}
                lang={language.lang}
                aria-current={current ? 'true' : undefined}
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
