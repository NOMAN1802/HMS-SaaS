// Find a doctor (FR-WEB-DOC-001..003). The directory reads its filters from the URL on the client;
// the unfiltered list is the server-rendered fallback, so the page is useful without JavaScript.
// Implements: T-WEB-07.
import { isLocale } from '@hms/i18n';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { Container } from '../../../src/components/container';
import { DoctorDirectory, DoctorGrid } from '../../../src/components/doctor-directory';
import { PageHeader } from '../../../src/components/page-header';
import { listBranches, listDepartments, listDoctors, localize } from '../../../src/content';
import { toDoctorSummary } from '../../../src/content/doctor-summary';
import { withAlternates } from '../../../src/seo';

interface Params {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return withAlternates('/doctors', locale, {
    title: t('doctors.title'),
    description: t('doctors.intro'),
  });
}

export default async function DoctorsPage({ params }: Params) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const doctors = listDoctors().map((doctor) => toDoctorSummary(doctor, locale));
  const departments = listDepartments().map((d) => ({
    value: d.slug,
    label: localize(d.name, locale),
  }));
  const branches = listBranches().map((b) => ({ value: b.slug, label: localize(b.area, locale) }));

  return (
    <>
      <PageHeader title={t('doctors.title')} intro={t('doctors.intro')} />
      <Container className="py-10">
        <h2 className="sr-only">{t('doctors.results')}</h2>
        <Suspense fallback={<DoctorGrid doctors={doctors} />}>
          <DoctorDirectory doctors={doctors} departments={departments} branches={branches} />
        </Suspense>
      </Container>
    </>
  );
}
