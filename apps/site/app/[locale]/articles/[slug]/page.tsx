// Article page: category, date, author link, body as paragraphs, and a call-back request with the
// article's department preselected (FR-WEB-INF-003, X23, AT-WEB-054). Implements: T-WEB-12,
// T-WEB-17.
import { isLocale } from '@hms/i18n';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AppointmentRequestForm } from '../../../../src/components/appointment-request-form';
import { Container } from '../../../../src/components/container';
import { ImageSlot } from '../../../../src/components/image-slot';
import { PageHeader } from '../../../../src/components/page-header';
import {
  getArticle,
  getDoctor,
  listArticles,
  listDepartments,
  localize,
  localizeRich,
} from '../../../../src/content';
import { formatLongDate } from '../../../../src/i18n/clock';
import { Link } from '../../../../src/i18n/navigation';
import { withAlternates } from '../../../../src/seo';

interface Params {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return listArticles().map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = getArticle(slug);
  if (!article || !isLocale(locale)) return {};
  return withAlternates(`/articles/${slug}`, locale, {
    title: localize(article.title, locale),
    description: localize(article.excerpt, locale),
  });
}

export default async function ArticlePage({ params }: Params) {
  const { locale, slug } = await params;
  const article = getArticle(slug);
  if (!isLocale(locale) || !article) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const author = article.author ? getDoctor(article.author) : undefined;
  const departments = listDepartments().map((d) => ({
    value: d.slug,
    label: localize(d.name, locale),
  }));

  return (
    <>
      <PageHeader
        title={localize(article.title, locale)}
        intro={localize(article.excerpt, locale)}
        crumbs={[{ label: t('articles.title'), href: '/articles' }]}
      >
        <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-muted">
          <span>{localize(article.category, locale)}</span>
          <time dateTime={article.publishedOn}>
            {formatLongDate(t, article.publishedOn, locale)}
          </time>
          {author ? (
            <span>
              {t('articles.by')}{' '}
              <Link
                href={`/doctors/${author.slug}`}
                className="font-medium text-primary hover:underline"
              >
                {localize(author.name, locale)}
              </Link>
            </span>
          ) : null}
        </p>
      </PageHeader>
      <Container className="py-10">
        <article className="mx-auto flex max-w-3xl flex-col gap-6">
          <ImageSlot
            image={article.image}
            locale={locale}
            ratio="wide"
            icon="newspaper"
            className="rounded-panel"
          />
          <div className="flex flex-col gap-4 text-lg leading-relaxed">
            {localizeRich(article.body, locale).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <p className="text-sm text-text-muted">{t('articles.disclaimer')}</p>
        </article>
        <section
          aria-labelledby="request-heading"
          className="mx-auto mt-12 max-w-3xl rounded-panel border border-border bg-surface p-6 sm:p-8"
          data-section="appointmentRequest"
        >
          <h2 id="request-heading" className="mb-2 text-2xl font-semibold">
            {t('department.requestHeading')}
          </h2>
          <p className="mb-6 text-text-muted">{t('department.requestText')}</p>
          <AppointmentRequestForm departments={departments} department={article.department} />
        </section>
      </Container>
    </>
  );
}
