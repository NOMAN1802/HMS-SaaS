// Root layout of the public website, one per locale (`/bn`, `/en`). Sets the document language,
// loads the design tokens and fonts, and provides the site catalog to client components.
// Implements: T-WEB-01, FR-WEB-GEN-001, FR-WEB-NAV-005 (skip link), P-023, P-028.
import { htmlLang } from '@hms/i18n';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { ReactNode } from 'react';
import { routing } from '../../src/i18n/routing';
import '../globals.css';

interface LocaleParams {
  params: Promise<{ locale: string }>;
}

// Prerender both languages at build time (P-028).
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return { title: t('meta.title'), description: t('meta.description') };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleParams & { children: ReactNode }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  // Keeps the page static: next-intl reads the locale from here instead of request headers.
  setRequestLocale(locale);
  const t = await getTranslations({ locale });

  return (
    <html lang={htmlLang(locale)}>
      <body>
        <a
          href="#main"
          className="sr-only rounded-control bg-primary px-4 py-2 text-on-primary focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
        >
          {t('shell.skipToContent')}
        </a>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
