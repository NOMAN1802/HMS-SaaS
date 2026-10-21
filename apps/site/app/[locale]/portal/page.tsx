// Patient portal "coming soon" page; the portal itself is EP-27 (FR-WEB-INF-006).
// Implements: T-WEB-12.
import { isLocale } from '@hms/i18n';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { ContentPage, contentPageMetadata } from '../../../src/components/content-page';

interface Params {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? contentPageMetadata('portal', locale) : {};
}

export default async function PortalPage({ params }: Params) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  return <ContentPage name="portal" locale={locale} />;
}
