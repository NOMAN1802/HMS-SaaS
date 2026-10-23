// Centre of excellence page: overview, highlights, the departments it brings together and their
// doctors (FR-WEB-DEP-003). Implements: T-WEB-08.
import { isLocale } from '@hms/i18n';
import { Icon } from '@hms/ui';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Container } from '../../../../src/components/container';
import { DepartmentCard } from '../../../../src/components/department-card';
import { DoctorGrid } from '../../../../src/components/doctor-directory';
import { ImageSlot } from '../../../../src/components/image-slot';
import { PageHeader } from '../../../../src/components/page-header';
import {
  doctorsInDepartment,
  getCentre,
  getDepartment,
  listCentres,
  localize,
  localizeRich,
} from '../../../../src/content';
import { toDoctorSummary } from '../../../../src/content/doctor-summary';
import { withAlternates } from '../../../../src/seo';

interface Params {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return listCentres().map((centre) => ({ slug: centre.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  const centre = getCentre(slug);
  if (!centre || !isLocale(locale)) return {};
  return withAlternates(`/centres/${slug}`, locale, {
    title: localize(centre.name, locale),
    description: localize(centre.summary, locale),
  });
}

export default async function CentrePage({ params }: Params) {
  const { locale, slug } = await params;
  const centre = getCentre(slug);
  if (!isLocale(locale) || !centre) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const departments = centre.departments.map(getDepartment).filter((d) => d !== undefined);
  const doctors = centre.departments
    .flatMap(doctorsInDepartment)
    .map((doctor) => toDoctorSummary(doctor, locale));

  return (
    <>
      <PageHeader
        title={localize(centre.name, locale)}
        intro={localize(centre.summary, locale)}
        crumbs={[{ label: t('centres.title'), href: '/centres' }]}
      />
      <Container className="grid gap-10 py-10 lg:grid-cols-2">
        <ImageSlot
          image={centre.image}
          locale={locale}
          icon="heartbeat"
          className="rounded-panel"
        />
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 text-lg">
            {localizeRich(centre.overview, locale).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <section aria-labelledby="highlights-heading">
            <h2 id="highlights-heading" className="mb-3 text-xl font-semibold">
              {t('centre.highlights')}
            </h2>
            <ul className="flex flex-col gap-2">
              {centre.highlights.map((highlight) => (
                <li key={highlight.en} className="flex items-start gap-2">
                  <Icon name="check" size={20} className="mt-0.5 shrink-0 text-primary" />
                  {localize(highlight, locale)}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </Container>
      <section aria-labelledby="centre-departments" className="py-8">
        <Container>
          <h2 id="centre-departments" className="mb-6 text-2xl font-semibold">
            {t('centre.departments')}
          </h2>
          <ul className="reveal-list grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {departments.map((department) => (
              <li key={department.slug}>
                <DepartmentCard department={department} locale={locale} />
              </li>
            ))}
          </ul>
        </Container>
      </section>
      <section aria-labelledby="centre-doctors" className="bg-surface py-12">
        <Container>
          <h2 id="centre-doctors" className="mb-6 text-2xl font-semibold">
            {t('centre.doctors')}
          </h2>
          <DoctorGrid doctors={doctors} />
        </Container>
      </section>
    </>
  );
}
