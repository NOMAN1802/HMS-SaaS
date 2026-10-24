// Feedback and complaints (FR-WEB-SVC-002): optional contact details, branch, a rating in words
// and the message; ends in a demo message. Implements: T-WEB-11.
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
  return withAlternates('/feedback', locale, {
    title: t('feedback.title'),
    description: t('feedback.intro'),
  });
}

export default async function FeedbackPage({ params }: Params) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const branches = listBranches().map((branch) => ({
    value: branch.slug,
    label: localize(branch.area, locale),
  }));
  const ratings = [
    { value: '5', label: t('feedback.rating5') },
    { value: '4', label: t('feedback.rating4') },
    { value: '3', label: t('feedback.rating3') },
    { value: '2', label: t('feedback.rating2') },
    { value: '1', label: t('feedback.rating1') },
  ];

  return (
    <>
      <PageHeader title={t('feedback.title')} intro={t('feedback.intro')} />
      <Container className="py-10">
        <div className="max-w-3xl rounded-panel border border-border bg-surface p-6 sm:p-8">
          <ServiceForm
            fields={[
              { name: 'name', label: t('feedback.nameOptional'), kind: 'text' },
              {
                name: 'phone',
                label: t('feedback.phoneOptional'),
                hint: t('form.phoneHint'),
                kind: 'tel',
              },
              { name: 'branch', label: t('form.branch'), kind: 'select', options: branches },
              { name: 'rating', label: t('feedback.rating'), kind: 'select', options: ratings },
              { name: 'message', label: t('form.message'), kind: 'textarea', required: true },
            ]}
            submitLabel={t('feedback.submit')}
            demoTitle={t('feedback.demoTitle')}
            demoBody={t('form.demoBody')}
          />
        </div>
      </Container>
    </>
  );
}
