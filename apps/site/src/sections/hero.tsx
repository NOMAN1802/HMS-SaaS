// Home hero: the page's h1, a supporting line, the doctor and department search, popular links
// and the hero image slot (F section 3, FR-WEB-HOME-*). Implements: T-WEB-06.
import type { SectionOf } from '@hms/contracts';
import type { Locale } from '@hms/i18n';
import { Icon } from '@hms/ui';
import { useTranslations } from 'next-intl';
import {
  getDepartment,
  getSite,
  listDepartments,
  listDoctors,
  localize,
  normalizeQuery,
} from '../content';
import { Container } from '../components/container';
import { HeroSearch, type SearchSuggestion } from '../components/hero-search';
import { ImageSlot } from '../components/image-slot';
import { SiteLink } from '../components/site-link';

function suggestionsFor(locale: Locale): SearchSuggestion[] {
  const departments = listDepartments().map((department) => ({
    kind: 'department' as const,
    label: localize(department.name, locale),
    detail: localize(department.summary, locale),
    href: `/departments/${department.slug}`,
    terms: normalizeQuery(
      [department.name, ...(department.keywords ?? [])]
        .flatMap((text) => [text.bn, text.en])
        .join(' '),
    ),
  }));
  const doctors = listDoctors().map((doctor) => {
    const department = getDepartment(doctor.department);
    return {
      kind: 'doctor' as const,
      label: localize(doctor.name, locale),
      detail: department ? localize(department.name, locale) : localize(doctor.title, locale),
      href: `/doctors/${doctor.slug}`,
      terms: normalizeQuery(
        [doctor.name, department?.name, ...doctor.interests]
          .flatMap((text) => (text ? [text.bn, text.en] : []))
          .join(' '),
      ),
    };
  });
  return [...departments, ...doctors];
}

export function HeroSection({ section, locale }: { section: SectionOf<'hero'>; locale: Locale }) {
  const t = useTranslations();
  const { props } = section;
  const { emergency } = getSite().settings.contacts;
  return (
    <section className="bg-linear-to-b from-primary-soft to-bg">
      <Container className="grid items-center gap-10 py-12 lg:grid-cols-2 lg:py-20">
        <div className="flex flex-col gap-6">
          <h1 className="text-4xl font-semibold text-balance sm:text-5xl">
            {localize(props.heading, locale)}
          </h1>
          <p className="max-w-xl text-lg text-text-muted">{localize(props.text, locale)}</p>
          {props.search ? <HeroSearch suggestions={suggestionsFor(locale)} /> : null}
          {props.popularLinks.length > 0 ? (
            <p className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-text-muted">{t('search.popular')}:</span>
              {props.popularLinks.map((link) => (
                <SiteLink
                  key={link.href}
                  href={link.href}
                  className="rounded-pill border border-border-strong bg-surface px-3 py-1 hover:border-primary hover:text-primary"
                >
                  {localize(link.label, locale)}
                </SiteLink>
              ))}
            </p>
          ) : null}
          <a
            href={`tel:${emergency.tel}`}
            className="inline-flex w-fit items-center gap-2 font-ui font-semibold text-danger underline-offset-4 hover:underline"
            data-testid="hero-emergency"
          >
            <Icon name="siren" size={18} />
            {t('hero.emergencyLine', { number: emergency.display })}
          </a>
        </div>
        <div className="hidden lg:block">
          <ImageSlot
            image={props.image}
            locale={locale}
            ratio="card"
            icon="stethoscope"
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="rounded-panel shadow-overlay"
          />
        </div>
      </Container>
    </section>
  );
}
