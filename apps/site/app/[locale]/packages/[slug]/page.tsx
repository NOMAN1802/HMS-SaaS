// Health package page: what is included by group, preparation, and a price table comparing the
// tests bought one by one with the package rate and the saving (FR-WEB-PKG-002, -004, X26,
// AT-WEB-053), with a call-back request to book it. Implements: T-WEB-09, T-WEB-17.
import { isLocale } from '@hms/i18n';
import { buttonClassName, Icon } from '@hms/ui';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AppointmentRequestForm } from '../../../../src/components/appointment-request-form';
import { Container } from '../../../../src/components/container';
import { ImageSlot } from '../../../../src/components/image-slot';
import { PageHeader } from '../../../../src/components/page-header';
import {
  getPackage,
  listDepartments,
  listPackagesAll,
  localize,
  packageSaving,
} from '../../../../src/content';
import { digits, money } from '../../../../src/format';
import { packageCategoryKey } from '../../../../src/i18n/category-labels';
import { withAlternates } from '../../../../src/seo';

interface Params {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return listPackagesAll().map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  const item = getPackage(slug);
  if (!item || !isLocale(locale)) return {};
  return withAlternates(`/packages/${slug}`, locale, {
    title: localize(item.name, locale),
    description: localize(item.summary, locale),
  });
}

export default async function PackagePage({ params }: Params) {
  const { locale, slug } = await params;
  const item = getPackage(slug);
  if (!isLocale(locale) || !item) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const departments = listDepartments().map((d) => ({
    value: d.slug,
    label: localize(d.name, locale),
  }));

  return (
    <>
      <PageHeader
        title={localize(item.name, locale)}
        intro={localize(item.summary, locale)}
        crumbs={[{ label: t('packages.title'), href: '/packages' }]}
      >
        <p className="mt-4 flex flex-wrap gap-2 font-ui text-sm">
          <span className="rounded-pill bg-surface px-3 py-1">
            {t('common.packageCode', { code: digits(item.code, locale) })}
          </span>
          <span className="rounded-pill bg-surface px-3 py-1">
            {t(packageCategoryKey[item.category])}
          </span>
          <span className="rounded-pill bg-surface px-3 py-1">
            {localize(item.audience, locale)}
          </span>
        </p>
      </PageHeader>
      <Container className="grid gap-10 py-10 lg:grid-cols-[1fr_24rem]">
        <div className="flex min-w-0 flex-col gap-8">
          <ImageSlot
            image={item.image}
            locale={locale}
            ratio="wide"
            icon="package"
            className="rounded-panel"
          />
          <section aria-labelledby="included-heading">
            <h2 id="included-heading" className="mb-4 text-2xl font-semibold">
              {t('package.included')}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {item.groups.map((group) => (
                <div
                  key={group.title.en}
                  className="rounded-panel border border-border bg-surface p-5"
                >
                  <h3 className="mb-3 font-semibold">{localize(group.title, locale)}</h3>
                  <ul className="flex flex-col gap-2">
                    {group.tests.map((test) => (
                      <li key={test.en} className="flex items-start gap-2 text-sm">
                        <Icon name="check" size={18} className="mt-0.5 shrink-0 text-primary" />
                        {localize(test, locale)}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
          {item.preparation.length > 0 ? (
            <section aria-labelledby="prep-heading">
              <h2 id="prep-heading" className="mb-4 text-2xl font-semibold">
                {t('package.preparation')}
              </h2>
              <ul className="flex list-disc flex-col gap-2 ps-6">
                {item.preparation.map((step) => (
                  <li key={step.en}>{localize(step, locale)}</li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
        <aside className="flex flex-col gap-6">
          <section
            aria-labelledby="price-heading"
            className="rounded-panel border border-border bg-surface p-5"
          >
            <h2 id="price-heading" className="mb-3 text-lg font-semibold">
              {t('package.price')}
            </h2>
            <table className="w-full text-sm" data-testid="package-price-table">
              <tbody>
                <tr className="border-b border-border">
                  <th scope="row" className="py-2 text-start font-normal text-text-muted">
                    {t('package.separateTotal')}
                  </th>
                  <td className="py-2 text-end line-through">
                    {money(item.separatePrice, locale)}
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <th scope="row" className="py-2 text-start font-medium">
                    {t('package.packagePrice')}
                  </th>
                  <td className="py-2 text-end font-heading text-xl font-semibold text-heading">
                    {money(item.price, locale)}
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="py-2 text-start font-medium text-primary">
                    {t('package.saving')}
                  </th>
                  <td className="py-2 text-end font-medium text-primary">
                    {money(packageSaving(item), locale)}
                  </td>
                </tr>
              </tbody>
            </table>
            <p className="mt-2 font-ui text-xs text-text-muted">{t('common.samplePrice')}</p>
            {item.doctorFeeNote ? (
              <p className="mt-3 text-sm text-text-muted">{localize(item.doctorFeeNote, locale)}</p>
            ) : null}
            <a href="#request" className={buttonClassName('primary', 'lg', 'mt-4 w-full')}>
              {t('package.requestHeading')}
            </a>
          </section>
        </aside>
      </Container>
      <section id="request" aria-labelledby="request-heading" className="scroll-mt-24 pb-12">
        <Container>
          <div className="max-w-3xl rounded-panel border border-border bg-surface p-6 sm:p-8">
            <h2 id="request-heading" className="mb-2 text-2xl font-semibold">
              {t('package.requestHeading')}
            </h2>
            <p className="mb-6 text-text-muted">{t('package.requestText')}</p>
            <AppointmentRequestForm departments={departments} showDepartment={false} />
          </div>
        </Container>
      </section>
    </>
  );
}
