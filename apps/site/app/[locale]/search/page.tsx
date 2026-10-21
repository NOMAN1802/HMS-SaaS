// Site-wide search page (FR-WEB-SRCH-001, X28). The index is built at build time per language.
// Implements: T-WEB-17.
import { isLocale } from '@hms/i18n';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { Container } from '../../../src/components/container';
import { PageHeader } from '../../../src/components/page-header';
import { SiteSearch } from '../../../src/components/site-search';
import { buildSearchIndex } from '../../../src/content/search-index';

interface Params {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return { title: t('search.title'), robots: { index: false } };
}

export default async function SearchPage({ params }: Params) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  return (
    <>
      <PageHeader title={t('search.title')} />
      <Container className="py-10">
        <Suspense>
          <SiteSearch index={buildSearchIndex(locale)} />
        </Suspense>
      </Container>
    </>
  );
}
