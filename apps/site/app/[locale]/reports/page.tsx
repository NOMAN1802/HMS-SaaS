// Online report: how it works and a lookup by report number and mobile; in WEB-A the result is a
// demo message (FR-WEB-REP-001). Report delivery rules with dues are Q-013. Implements: T-WEB-11.
import { isLocale } from '@hms/i18n';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Container } from '../../../src/components/container';
import { PageHeader } from '../../../src/components/page-header';
import { ServiceForm } from '../../../src/components/service-form';
import { digits } from '../../../src/format';

interface Params {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return { title: t('reports.title'), description: t('reports.intro') };
}

export default async function ReportsPage({ params }: Params) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const steps = [t('reports.step1'), t('reports.step2'), t('reports.step3')];

  return (
    <>
      <PageHeader title={t('reports.title')} intro={t('reports.intro')} />
      <Container className="grid gap-10 py-10 lg:grid-cols-[1fr_1.4fr]">
        <section aria-labelledby="how-heading">
          <h2 id="how-heading" className="mb-4 text-xl font-semibold">
            {t('reports.howHeading')}
          </h2>
          <ol className="flex flex-col gap-4">
            {steps.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-pill bg-primary text-on-primary">
                  {digits(index + 1, locale)}
                </span>
                <span className="pt-1">{step}</span>
              </li>
            ))}
          </ol>
        </section>
        <section
          aria-labelledby="lookup-heading"
          className="rounded-panel border border-border bg-surface p-6 sm:p-8"
        >
          <h2 id="lookup-heading" className="mb-6 text-2xl font-semibold">
            {t('reports.lookupHeading')}
          </h2>
          <ServiceForm
            fields={[
              {
                name: 'reference',
                label: t('reports.reference'),
                hint: t('reports.referenceHint'),
                kind: 'text',
                required: true,
              },
              {
                name: 'phone',
                label: t('form.phone'),
                hint: t('form.phoneHint'),
                kind: 'tel',
                required: true,
              },
            ]}
            submitLabel={t('reports.lookup')}
            demoTitle={t('reports.demoTitle')}
            demoBody={t('reports.demoBody')}
          />
        </section>
      </Container>
    </>
  );
}
