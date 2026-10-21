// Sections that show a slice of a collection: departments, centres, featured doctors, packages,
// branches and articles (E section 2). Each reads the collection through the content adapter, so
// the CMS can reorder or hide the section without code changes (C-072). Implements: T-WEB-06.
import type { LocalizedText, MenuItem, SectionOf } from '@hms/contracts';
import type { Locale } from '@hms/i18n';
import type { ReactNode } from 'react';
import {
  featuredDoctors,
  getCentre,
  getDoctor,
  listArticles,
  listBranches,
  listDepartments,
  listPackagesAll,
  localize,
} from '../content';
import { ArticleCard } from '../components/article-card';
import { BranchCard } from '../components/branch-card';
import { CentreCard } from '../components/centre-card';
import { Container } from '../components/container';
import { DepartmentCard } from '../components/department-card';
import { DoctorCard } from '../components/doctor-card';
import { toDoctorSummary } from '../content/doctor-summary';
import { PackageCard } from '../components/package-card';
import { SectionHeading } from '../components/section-heading';

interface Props {
  locale: Locale;
}

function heading(
  props: { heading: LocalizedText; text?: LocalizedText },
  locale: Locale,
  viewAll?: MenuItem,
) {
  return {
    heading: localize(props.heading, locale),
    text: props.text ? localize(props.text, locale) : undefined,
    action: viewAll ? { label: localize(viewAll.label, locale), href: viewAll.href } : undefined,
  };
}

function Band({ children, muted = false }: { children: ReactNode; muted?: boolean }) {
  return (
    <section className={`py-12 sm:py-16 ${muted ? 'bg-surface' : ''}`}>
      <Container>{children}</Container>
    </section>
  );
}

export function DepartmentGridSection({
  section,
  locale,
}: Props & { section: SectionOf<'departmentGrid'> }) {
  const { props } = section;
  return (
    <Band muted>
      <SectionHeading {...heading(props, locale, props.viewAll)} />
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {listDepartments()
          .slice(0, props.count)
          .map((department) => (
            <li key={department.slug}>
              <DepartmentCard department={department} locale={locale} />
            </li>
          ))}
      </ul>
    </Band>
  );
}

export function CentreCardsSection({
  section,
  locale,
}: Props & { section: SectionOf<'centreCards'> }) {
  const { props } = section;
  const centres = props.centres.map(getCentre).filter((centre) => centre !== undefined);
  return (
    <Band>
      <SectionHeading {...heading(props, locale)} />
      <ul className="grid gap-6 md:grid-cols-3">
        {centres.map((centre) => (
          <li key={centre.slug}>
            <CentreCard centre={centre} locale={locale} />
          </li>
        ))}
      </ul>
    </Band>
  );
}

export function FeaturedDoctorsSection({
  section,
  locale,
}: Props & { section: SectionOf<'featuredDoctors'> }) {
  const { props } = section;
  const doctors =
    props.doctors === 'featured'
      ? featuredDoctors()
      : props.doctors.map(getDoctor).filter((doctor) => doctor !== undefined);
  return (
    <Band muted>
      <SectionHeading {...heading(props, locale, props.viewAll)} />
      {/* Horizontal scroll with snap on small screens instead of an auto-playing carousel. The
          row is positioned so screen-reader-only labels inside cards stay clipped by it. */}
      <ul className="relative -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
        {doctors.slice(0, 8).map((doctor) => (
          <li key={doctor.slug} className="w-80 shrink-0 snap-start sm:w-auto">
            <DoctorCard doctor={toDoctorSummary(doctor, locale)} locale={locale} />
          </li>
        ))}
      </ul>
    </Band>
  );
}

export function PackageShowcaseSection({
  section,
  locale,
}: Props & { section: SectionOf<'packageShowcase'> }) {
  const { props } = section;
  return (
    <Band>
      <SectionHeading {...heading(props, locale, props.viewAll)} />
      <ul className="relative -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 lg:grid-cols-3">
        {listPackagesAll()
          .slice(0, props.count)
          .map((item) => (
            <li key={item.slug} className="w-72 shrink-0 snap-start sm:w-auto">
              <PackageCard item={item} locale={locale} />
            </li>
          ))}
      </ul>
    </Band>
  );
}

export function BranchCardsSection({
  section,
  locale,
}: Props & { section: SectionOf<'branchCards'> }) {
  return (
    <Band muted>
      <SectionHeading {...heading(section.props, locale)} />
      <ul className="grid gap-6 md:grid-cols-3">
        {listBranches().map((branch) => (
          <li key={branch.slug}>
            <BranchCard branch={branch} locale={locale} />
          </li>
        ))}
      </ul>
    </Band>
  );
}

export function ArticleListSection({
  section,
  locale,
}: Props & { section: SectionOf<'articleList'> }) {
  const { props } = section;
  return (
    <Band>
      <SectionHeading {...heading(props, locale, props.viewAll)} />
      <ul className="grid gap-6 md:grid-cols-3">
        {listArticles()
          .slice(0, props.count)
          .map((article) => (
            <li key={article.slug}>
              <ArticleCard article={article} locale={locale} />
            </li>
          ))}
      </ul>
    </Band>
  );
}
