// Root layout of the public website, one per locale (`/bn`, `/en`). Sets the document language,
// loads the design tokens and fonts, and provides the site catalog to client components.
// Every page gets the shell: page-change progress bar, top bar, header, demo notice, footer and
// the phone action bar.
// Implements: T-WEB-01, T-WEB-05, T-WEB-15, FR-WEB-GEN-001, FR-WEB-NAV-005 (skip link), P-023, P-028.
import { htmlLang } from '@hms/i18n';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { ReactNode } from 'react';
import { DemoNotice } from '../../src/components/demo-notice';
import { NavigationProgress } from '../../src/components/navigation-progress';
import { PhoneActionBar } from '../../src/components/phone-action-bar';
import { SiteFooter } from '../../src/components/site-footer';
import { SiteHeader } from '../../src/components/site-header';
import { TopBar } from '../../src/components/top-bar';
import { getSite, localize } from '../../src/content';
import { routing } from '../../src/i18n/routing';
import { SITE_ORIGIN } from '../../src/seo';
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
  const site = getSite();
  const name = hasLocale(routing.locales, locale)
    ? localize(site.settings.hospitalName, locale)
    : '';
  return {
    metadataBase: new URL(SITE_ORIGIN),
    title: { default: name || t('meta.title'), template: `%s | ${name}` },
    description: t('meta.description'),
    // Demo content must not be indexed (FR-WEB-SEO-002, P-032); real content turns the notice off.
    robots: site.notice.enabled ? { index: false, follow: false } : undefined,
  };
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
  const site = getSite();

  return (
    <html lang={htmlLang(locale)}>
      <body>
        <a
          href="#main"
          className="sr-only rounded-control bg-primary px-4 py-2 text-on-primary focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
        >
          {t('shell.skipToContent')}
        </a>
        <NextIntlClientProvider>
          <NavigationProgress />
          <TopBar site={site} locale={locale} />
          <SiteHeader site={site} locale={locale} />
          {site.notice.enabled ? <DemoNotice text={localize(site.notice.text, locale)} /> : null}
          <main id="main" tabIndex={-1} className="focus:outline-none">
            {children}
          </main>
          <SiteFooter site={site} locale={locale} />
          <PhoneActionBar site={site} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
