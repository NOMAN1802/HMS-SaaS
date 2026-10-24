// Patient and visitor guide with anchored parts (patient rights, admission and payment, discharge
// checklist, ...), FAQ and a call-back request (FR-WEB-SVC-003, FR-WEB-SVC-005, X25, AT-WEB-057).
// Implements: T-WEB-12, T-WEB-17.
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
    ? withAlternates(
        '/patients-and-visitors',
        locale,
        contentPageMetadata('patients-and-visitors', locale),
      )
    : {};
}

export default async function PatientsAndVisitorsPage({ params }: Params) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  return <ContentPage name="patients-and-visitors" locale={locale} />;
}
