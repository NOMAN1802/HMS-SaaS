// Centres of excellence (FR-WEB-DEP-003). Implements: T-WEB-08.
import { isLocale } from '@hms/i18n';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CentreCard } from '../../../src/components/centre-card';
import { Container } from '../../../src/components/container';
import { PageHeader } from '../../../src/components/page-header';
import { listCentres } from '../../../src/content';
import { withAlternates } from '../../../src/seo';

interface Params {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return withAlternates('/centres', locale, {
    title: t('centres.title'),
    description: t('centres.intro'),
  });
}

export default async function CentresPage({ params }: Params) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  return (
    <>
      <PageHeader title={t('centres.title')} intro={t('centres.intro')} />
      <Container className="py-10">
        <h2 className="sr-only">{t('centres.title')}</h2>
        <ul className="reveal-list grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listCentres().map((centre) => (
            <li key={centre.slug}>
              <CentreCard centre={centre} locale={locale} />
            </li>
          ))}
        </ul>
      </Container>
    </>
  );
}
