// Department page (FR-WEB-DEP-002, FR-WEB-DEP-004): overview, services, facilities, where to find
// it, OPD hours (X33), exactly the doctors of this department (AT-WEB-013) and a call-back request
// with the department preselected (X23). Implements: T-WEB-08, T-WEB-17.
import { isLocale } from '@hms/i18n';
import { Icon } from '@hms/ui';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AppointmentRequestForm } from '../../../../src/components/appointment-request-form';
import { Container } from '../../../../src/components/container';
import { DoctorGrid } from '../../../../src/components/doctor-directory';
import { ImageSlot } from '../../../../src/components/image-slot';
import { OpdHours } from '../../../../src/components/opd-hours';
import { PageHeader } from '../../../../src/components/page-header';
import {
  doctorsInDepartment,
  getCentre,
  getDepartment,
  listDepartments,
  localize,
  localizeRich,
} from '../../../../src/content';
import { toDoctorSummary } from '../../../../src/content/doctor-summary';
import { Link } from '../../../../src/i18n/navigation';
import { withAlternates } from '../../../../src/seo';

interface Params {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return listDepartments().map((department) => ({ slug: department.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  const department = getDepartment(slug);
  if (!department || !isLocale(locale)) return {};
  return withAlternates(`/departments/${slug}`, locale, {
    title: localize(department.name, locale),
    description: localize(department.summary, locale),
  });
}

export default async function DepartmentPage({ params }: Params) {
  const { locale, slug } = await params;
  const department = getDepartment(slug);
  if (!isLocale(locale) || !department) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const centre = department.centre ? getCentre(department.centre) : undefined;
  const doctors = doctorsInDepartment(slug).map((doctor) => toDoctorSummary(doctor, locale));
  const departments = listDepartments().map((d) => ({
    value: d.slug,
    label: localize(d.name, locale),
  }));

  return (
    <>
      <PageHeader
        title={localize(department.name, locale)}
        intro={localize(department.summary, locale)}
        crumbs={[{ label: t('departments.title'), href: '/departments' }]}
      />
      <Container className="grid gap-10 py-10 lg:grid-cols-[1fr_22rem]">
        <div className="flex min-w-0 flex-col gap-8">
          <ImageSlot
            image={department.image}
            locale={locale}
            ratio="banner"
            icon="stethoscope"
            className="rounded-panel"
          />
          <div className="flex flex-col gap-4 text-lg">
            {localizeRich(department.overview, locale).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <section aria-labelledby="services-heading">
            <h2 id="services-heading" className="mb-4 text-2xl font-semibold">
              {t('department.services')}
            </h2>
            <ul className="reveal-list grid gap-3 sm:grid-cols-2">
              {department.services.map((service) => (
                <li key={service.en} className="flex items-start gap-2">
                  <Icon name="check" size={20} className="mt-0.5 shrink-0 text-primary" />
                  {localize(service, locale)}
                </li>
              ))}
            </ul>
          </section>
          {department.facilities.length > 0 ? (
            <section aria-labelledby="facilities-heading">
              <h2 id="facilities-heading" className="mb-4 text-2xl font-semibold">
                {t('department.facilities')}
              </h2>
              <ul className="flex flex-wrap gap-2">
                {department.facilities.map((facility) => (
                  <li
                    key={facility.en}
                    className="rounded-pill bg-primary-soft px-3 py-1 text-sm text-primary"
                  >
                    {localize(facility, locale)}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
        <aside className="flex flex-col gap-6">
          <section
            aria-labelledby="where-heading"
            className="rounded-panel border border-border bg-surface p-5"
          >
            <h2 id="where-heading" className="mb-2 text-lg font-semibold">
              {t('department.where')}
            </h2>
            <p className="flex items-start gap-2 text-text-muted">
              <Icon name="map-pin" size={18} className="mt-1 shrink-0" />
              {localize(department.floor, locale)}
            </p>
            {centre ? (
              <p className="mt-3 text-sm">
                {t('department.partOf')}{' '}
                <Link
                  href={`/centres/${centre.slug}`}
                  className="font-medium text-primary hover:underline"
                >
                  {localize(centre.name, locale)}
                </Link>
              </p>
            ) : null}
          </section>
          <section
            aria-labelledby="opd-heading"
            className="rounded-panel border border-border bg-surface p-5"
          >
            <h2 id="opd-heading" className="mb-3 text-lg font-semibold">
              {t('department.opdHours')}
            </h2>
            <OpdHours department={department} locale={locale} />
          </section>
        </aside>
      </Container>
      <section aria-labelledby="doctors-heading" className="bg-surface py-12">
        <Container>
          <h2 id="doctors-heading" className="mb-6 text-2xl font-semibold">
            {t('department.doctors')}
          </h2>
          <DoctorGrid doctors={doctors} />
        </Container>
      </section>
      <section aria-labelledby="request-heading" className="py-12">
        <Container>
          <div className="max-w-3xl rounded-panel border border-border bg-surface p-6 sm:p-8">
            <h2 id="request-heading" className="mb-2 text-2xl font-semibold">
              {t('department.requestHeading')}
            </h2>
            <p className="mb-6 text-text-muted">{t('department.requestText')}</p>
            <AppointmentRequestForm departments={departments} department={slug} />
          </div>
        </Container>
      </section>
    </>
  );
}
