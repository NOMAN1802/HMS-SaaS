// Careers: open positions with department, type, branch and closing date (FR-WEB-INF-004).
// Applying is not part of WEB-A; the page says so. Implements: T-WEB-12.
import type { JobOpening } from '@hms/contracts';
import { isLocale } from '@hms/i18n';
import { Alert } from '@hms/ui';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Container } from '../../../src/components/container';
import { PageHeader } from '../../../src/components/page-header';
import { getBranch, listJobs, localize } from '../../../src/content';
import { formatLongDate } from '../../../src/i18n/clock';
import { withAlternates } from '../../../src/seo';

interface Params {
  params: Promise<{ locale: string }>;
}

const JOB_TYPE_KEY = {
  'full-time': 'careers.type.fullTime',
  'part-time': 'careers.type.partTime',
  contract: 'careers.type.contract',
} as const satisfies Record<JobOpening['type'], string>;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return withAlternates('/careers', locale, {
    title: t('careers.title'),
    description: t('careers.intro'),
  });
}

export default async function CareersPage({ params }: Params) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  return (
    <>
      <PageHeader title={t('careers.title')} intro={t('careers.intro')} />
      <Container className="flex flex-col gap-6 py-10">
        <Alert tone="info">{t('careers.demoNote')}</Alert>
        <ul className="reveal-list grid gap-4 md:grid-cols-2">
          {listJobs().map((job) => {
            const branch = getBranch(job.location);
            return (
              <li
                key={job.id}
                className="flex flex-col gap-2 rounded-panel border border-border bg-surface p-5"
              >
                <h2 className="text-lg font-semibold">{localize(job.title, locale)}</h2>
                <p className="text-sm text-text-muted">
                  {localize(job.department, locale)} . {t(JOB_TYPE_KEY[job.type])}
                  {branch ? ` . ${localize(branch.area, locale)}` : ''}
                </p>
                <p>{localize(job.summary, locale)}</p>
                <p className="text-sm text-text-muted">
                  {t('careers.closing', { date: formatLongDate(t, job.closingOn, locale) })}
                </p>
              </li>
            );
          })}
        </ul>
      </Container>
    </>
  );
}
