// Health articles, newest first (FR-WEB-INF-003). Implements: T-WEB-12.
import { isLocale } from '@hms/i18n';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArticleCard } from '../../../src/components/article-card';
import { Container } from '../../../src/components/container';
import { PageHeader } from '../../../src/components/page-header';
import { listArticles } from '../../../src/content';

interface Params {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return { title: t('articles.title'), description: t('articles.intro') };
}

export default async function ArticlesPage({ params }: Params) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  return (
    <>
      <PageHeader title={t('articles.title')} intro={t('articles.intro')} />
      <Container className="py-10">
        <h2 className="sr-only">{t('articles.title')}</h2>
        <ul className="grid gap-6 md:grid-cols-3">
          {listArticles().map((article) => (
            <li key={article.slug}>
              <ArticleCard article={article} locale={locale} />
            </li>
          ))}
        </ul>
      </Container>
    </>
  );
}
