// Home page: the sections stored in content/pages/home.json, in order, through the section
// registry, so the CMS can edit, reorder or hide each part (C-072, FR-WEB-GEN-007).
// Implements: T-WEB-06, FR-WEB-HOME-*.
import { isLocale } from '@hms/i18n';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getPage, localize } from '../../src/content';
import { SectionList } from '../../src/sections/registry';
import { withAlternates } from '../../src/seo';

interface HomeParams {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: HomeParams): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { seo } = getPage('home');
  return withAlternates('/', locale, {
    title: { absolute: localize(seo.title, locale) },
    description: localize(seo.description, locale),
  });
}

export default async function HomePage({ params }: HomeParams) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  return <SectionList sections={getPage('home').sections} locale={locale} />;
}
