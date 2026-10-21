// Test prices (FR-WEB-TST-001): the server formats every row (money with the taka sign and lakh
// grouping, digits in the page language) and the client filters them. Implements: T-WEB-09.
import { isLocale } from '@hms/i18n';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Container } from '../../../src/components/container';
import { PageHeader } from '../../../src/components/page-header';
import { TestPriceList, type TestRow } from '../../../src/components/test-price-list';
import { listTests, localize, normalizeQuery } from '../../../src/content';
import { digits, money } from '../../../src/format';
import { testCategoryKey } from '../../../src/i18n/category-labels';

interface Params {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return { title: t('tests.title'), description: t('tests.intro') };
}

export default async function TestsPage({ params }: Params) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const rows: TestRow[] = listTests().map((test) => ({
    code: test.code,
    codeDisplay: digits(test.code, locale),
    name: localize(test.name, locale),
    category: test.category,
    categoryLabel: t(testCategoryKey[test.category]),
    price: money(test.price, locale),
    reportTime: localize(test.reportTime, locale),
    preparation: test.preparation ? localize(test.preparation, locale) : '',
    terms: normalizeQuery(`${test.code} ${test.name.bn} ${test.name.en}`),
  }));
  const categories = Object.entries(testCategoryKey).map(([value, key]) => ({
    value,
    label: t(key),
  }));

  return (
    <>
      <PageHeader title={t('tests.title')} intro={t('tests.intro')} />
      <Container className="py-10">
        <h2 className="sr-only">{t('tests.title')}</h2>
        <TestPriceList rows={rows} categories={categories} />
      </Container>
    </>
  );
}
