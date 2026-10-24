// Notices, newest first (FR-WEB-INF-003). Implements: T-WEB-12.
import { isLocale } from '@hms/i18n';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Container } from '../../../src/components/container';
import { PageHeader } from '../../../src/components/page-header';
import { listNotices, localize, localizeRich } from '../../../src/content';
import { formatLongDate } from '../../../src/i18n/clock';
import { withAlternates } from '../../../src/seo';

interface Params {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return withAlternates('/notices', locale, {
    title: t('notices.title'),
    description: t('notices.intro'),
  });
}

export default async function NoticesPage({ params }: Params) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  return (
    <>
      <PageHeader title={t('notices.title')} intro={t('notices.intro')} />
      <Container className="py-10">
        <ul className="flex max-w-3xl flex-col gap-4">
          {listNotices().map((notice) => (
            <li key={notice.id} className="rounded-panel border border-border bg-surface p-5">
              <h2 className="text-lg font-semibold">{localize(notice.title, locale)}</h2>
              <p className="mb-2 text-sm text-text-muted">
                <time dateTime={notice.publishedOn}>
                  {formatLongDate(t, notice.publishedOn, locale)}
                </time>
              </p>
              {localizeRich(notice.body, locale).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </li>
          ))}
        </ul>
      </Container>
    </>
  );
}
