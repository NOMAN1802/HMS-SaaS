// All departments as a card grid (FR-WEB-DEP-001). Implements: T-WEB-08.
import { isLocale } from '@hms/i18n';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Container } from '../../../src/components/container';
import { DepartmentCard } from '../../../src/components/department-card';
import { PageHeader } from '../../../src/components/page-header';
import { listDepartments } from '../../../src/content';

interface Params {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return { title: t('departments.title'), description: t('departments.intro') };
}

export default async function DepartmentsPage({ params }: Params) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  return (
    <>
      <PageHeader title={t('departments.title')} intro={t('departments.intro')} />
      <Container className="py-10">
        <h2 className="sr-only">{t('departments.title')}</h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {listDepartments().map((department) => (
            <li key={department.slug}>
              <DepartmentCard department={department} locale={locale} />
            </li>
          ))}
        </ul>
      </Container>
    </>
  );
}
