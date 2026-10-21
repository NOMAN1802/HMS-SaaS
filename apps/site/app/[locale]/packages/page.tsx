// Health packages with category tabs (FR-WEB-PKG-001). Every price is labelled as a sample
// (FR-WEB-PKG-003, Q-078). Implements: T-WEB-09.
import { isLocale } from '@hms/i18n';
import { Tabs } from '@hms/ui';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Container } from '../../../src/components/container';
import { PackageCard } from '../../../src/components/package-card';
import { PageHeader } from '../../../src/components/page-header';
import { listPackages, packageCategoriesInUse } from '../../../src/content';
import { packageCategoryKey } from '../../../src/i18n/category-labels';

interface Params {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return { title: t('packages.title'), description: t('packages.intro') };
}

export default async function PackagesPage({ params }: Params) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale });

  const grid = (items: ReturnType<typeof listPackages>) => (
    <ul className="grid gap-6 pt-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li key={item.slug}>
          <PackageCard item={item} locale={locale} />
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <PageHeader title={t('packages.title')} intro={t('packages.intro')} />
      <Container className="py-10">
        <h2 className="sr-only">{t('packages.title')}</h2>
        <Tabs
          label={t('packages.categories')}
          tabs={[
            { id: 'all', label: t('packages.all'), content: grid(listPackages()) },
            ...packageCategoriesInUse().map((category) => ({
              id: category,
              label: t(packageCategoryKey[category]),
              content: grid(listPackages(category)),
            })),
          ]}
        />
      </Container>
    </>
  );
}
