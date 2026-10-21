// All branches with address, hours and phone (FR-WEB-INF-001). Implements: T-WEB-12.
import { isLocale } from '@hms/i18n';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { BranchCard } from '../../../src/components/branch-card';
import { Container } from '../../../src/components/container';
import { PageHeader } from '../../../src/components/page-header';
import { listBranches } from '../../../src/content';

interface Params {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return { title: t('branches.title'), description: t('branches.intro') };
}

export default async function BranchesPage({ params }: Params) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  return (
    <>
      <PageHeader title={t('branches.title')} intro={t('branches.intro')} />
      <Container className="py-10">
        <h2 className="sr-only">{t('branches.title')}</h2>
        <ul className="grid gap-6 md:grid-cols-3">
          {listBranches().map((branch) => (
            <li key={branch.slug}>
              <BranchCard branch={branch} locale={locale} />
            </li>
          ))}
        </ul>
      </Container>
    </>
  );
}
