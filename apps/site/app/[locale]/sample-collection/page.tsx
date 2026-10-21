// Home sample collection request (FR-WEB-SVC-001): contact, address, area, preferred date and the
// tests needed; ends in a demo message. Implements: T-WEB-11.
import { isLocale } from '@hms/i18n';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Container } from '../../../src/components/container';
import { PageHeader } from '../../../src/components/page-header';
import { ServiceForm } from '../../../src/components/service-form';
import { listBranches, localize } from '../../../src/content';
import { withAlternates } from '../../../src/seo';

interface Params {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return withAlternates('/sample-collection', locale, {
    title: t('sample.title'),
    description: t('sample.intro'),
  });
}

export default async function SampleCollectionPage({ params }: Params) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const areas = listBranches().map((branch) => ({
    value: branch.slug,
    label: localize(branch.area, locale),
  }));

  return (
    <>
      <PageHeader title={t('sample.title')} intro={t('sample.intro')} />
      <Container className="py-10">
        <div className="max-w-3xl rounded-panel border border-border bg-surface p-6 sm:p-8">
          <ServiceForm
            fields={[
              { name: 'name', label: t('form.name'), kind: 'text', required: true },
              {
                name: 'phone',
                label: t('form.phone'),
                hint: t('form.phoneHint'),
                kind: 'tel',
                required: true,
              },
              { name: 'area', label: t('sample.area'), kind: 'select', options: areas },
              { name: 'date', label: t('form.preferredDate'), kind: 'date', required: true },
              { name: 'address', label: t('sample.address'), kind: 'textarea', required: true },
              {
                name: 'tests',
                label: t('sample.tests'),
                hint: t('sample.testsHint'),
                kind: 'textarea',
              },
            ]}
            submitLabel={t('sample.submit')}
            demoTitle={t('form.demoTitle')}
            demoBody={t('form.demoBody')}
          />
        </div>
      </Container>
    </>
  );
}
