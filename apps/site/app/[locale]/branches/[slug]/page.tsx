// Branch page: head of branch, units and where they are, hours, phone, services, a map slot and a
// doctor search limited to this branch (FR-WEB-INF-001, FR-WEB-INF-007, X21, AT-WEB-056).
// Implements: T-WEB-12, T-WEB-17.
import { isLocale } from '@hms/i18n';
import { Icon } from '@hms/ui';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { Container } from '../../../../src/components/container';
import { DoctorDirectory, DoctorGrid } from '../../../../src/components/doctor-directory';
import { ImageSlot } from '../../../../src/components/image-slot';
import { PageHeader } from '../../../../src/components/page-header';
import {
  doctorsAtBranch,
  getBranch,
  listBranches,
  listDepartments,
  localize,
} from '../../../../src/content';
import { toDoctorSummary } from '../../../../src/content/doctor-summary';
import { withAlternates } from '../../../../src/seo';

interface Params {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return listBranches().map((branch) => ({ slug: branch.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  const branch = getBranch(slug);
  if (!branch || !isLocale(locale)) return {};
  return withAlternates(`/branches/${slug}`, locale, {
    title: localize(branch.name, locale),
    description: localize(branch.address, locale),
  });
}

export default async function BranchPage({ params }: Params) {
  const { locale, slug } = await params;
  const branch = getBranch(slug);
  if (!isLocale(locale) || !branch) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const doctors = doctorsAtBranch(slug).map((doctor) => toDoctorSummary(doctor, locale));
  const departmentSlugs = new Set(doctors.map((doctor) => doctor.departmentSlug));
  const departments = listDepartments()
    .filter((department) => departmentSlugs.has(department.slug))
    .map((department) => ({ value: department.slug, label: localize(department.name, locale) }));

  return (
    <>
      <PageHeader
        title={localize(branch.name, locale)}
        intro={localize(branch.address, locale)}
        crumbs={[{ label: t('branches.title'), href: '/branches' }]}
      />
      <Container className="grid gap-10 py-10 lg:grid-cols-[1fr_22rem]">
        <div className="flex min-w-0 flex-col gap-8">
          <ImageSlot
            image={branch.image}
            locale={locale}
            ratio="banner"
            icon="hospital-building"
            className="rounded-panel"
          />
          <section aria-labelledby="units-heading">
            <h2 id="units-heading" className="mb-4 text-2xl font-semibold">
              {t('branch.units')}
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2" data-testid="branch-units">
              {branch.units.map((unit) => (
                <li
                  key={unit.name.en}
                  className="rounded-panel border border-border bg-surface p-4"
                >
                  <p className="font-medium">{localize(unit.name, locale)}</p>
                  <p className="text-sm text-text-muted">{localize(unit.location, locale)}</p>
                </li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="branch-services-heading">
            <h2 id="branch-services-heading" className="mb-4 text-2xl font-semibold">
              {t('branch.services')}
            </h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {branch.services.map((service) => (
                <li key={service.en} className="flex items-start gap-2">
                  <Icon name="check" size={20} className="mt-0.5 shrink-0 text-primary" />
                  {localize(service, locale)}
                </li>
              ))}
            </ul>
          </section>
        </div>
        <aside className="flex flex-col gap-6">
          <section
            aria-labelledby="contact-heading"
            className="flex flex-col gap-3 rounded-panel border border-border bg-surface p-5"
          >
            <h2 id="contact-heading" className="text-lg font-semibold">
              {t('branch.contact')}
            </h2>
            <p className="flex items-start gap-2 text-sm">
              <Icon name="clock" size={18} className="mt-0.5 shrink-0 text-primary" />
              {localize(branch.hours, locale)}
            </p>
            <a
              href={`tel:${branch.phone.tel}`}
              className="flex items-center gap-2 font-medium text-primary hover:underline"
            >
              <Icon name="phone" size={18} />
              {branch.phone.display}
            </a>
            <p className="text-sm text-text-muted">
              {t('branch.head')}: {localize(branch.head.name, locale)},{' '}
              {localize(branch.head.title, locale)}
            </p>
          </section>
          <div
            role="img"
            aria-label={t('branch.mapPlaceholder')}
            className="flex aspect-square items-center justify-center rounded-panel border border-dashed border-border-strong bg-primary-soft text-center text-sm text-text-muted"
          >
            <span className="flex flex-col items-center gap-2 p-6">
              <Icon name="map-pin" size={32} className="text-primary" />
              {t('branch.mapPlaceholder')}
            </span>
          </div>
        </aside>
      </Container>
      <section aria-labelledby="branch-doctors-heading" className="bg-surface py-12">
        <Container>
          <h2 id="branch-doctors-heading" className="mb-6 text-2xl font-semibold">
            {t('branch.doctors')}
          </h2>
          <Suspense fallback={<DoctorGrid doctors={doctors} />}>
            <DoctorDirectory doctors={doctors} departments={departments} branches={[]} />
          </Suspense>
        </Container>
      </section>
    </>
  );
}
