// About the hospital, built from content/pages/about.json (FR-WEB-INF-004). Implements: T-WEB-12.
import { isLocale } from '@hms/i18n';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { ContentPage, contentPageMetadata } from '../../../src/components/content-page';
import { withAlternates } from '../../../src/seo';

interface Params {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale)
    ? withAlternates('/about', locale, contentPageMetadata('about', locale))
    : {};
}

export default async function AboutPage({ params }: Params) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  return <ContentPage name="about" locale={locale} />;
}
