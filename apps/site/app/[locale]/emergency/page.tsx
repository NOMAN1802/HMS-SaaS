// Emergency: what to do, call buttons and questions (FR-WEB-SVC-004). Implements: T-WEB-12.
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
  return isLocale(locale) ? contentPageMetadata('emergency', locale) : {};
}

export default async function EmergencyPage({ params }: Params) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  return <ContentPage name="emergency" locale={locale} />;
}
