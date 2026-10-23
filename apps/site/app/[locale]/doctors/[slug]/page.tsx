// Doctor profile (FR-WEB-DOC-004..007): header with photo slot, qualifications and languages;
// book, call and share actions (C-085); a leave notice when the doctor is or will soon be on leave
// (X19, chosen in the browser against today, see leave-notice.tsx); About,
// Education and Experience tabs; the weekly schedule; and related doctors (X20).
// Implements: T-WEB-07, T-WEB-15, T-WEB-17.
import { isLocale, type Locale } from '@hms/i18n';
import { buttonClassName, Icon, Tabs } from '@hms/ui';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Container } from '../../../../src/components/container';
import { DoctorGrid } from '../../../../src/components/doctor-directory';
import { ImageSlot } from '../../../../src/components/image-slot';
import { LeaveNotice } from '../../../../src/components/leave-notice';
import { PageHeader } from '../../../../src/components/page-header';
import { ShareButton } from '../../../../src/components/share-button';
import { ScheduleTable } from '../../../../src/components/schedule-table';
import {
  getDepartment,
  getDoctor,
  getSite,
  listDoctors,
  localize,
  localizeRich,
  relatedDoctors,
} from '../../../../src/content';
import { toDoctorSummary } from '../../../../src/content/doctor-summary';
import { digits, money } from '../../../../src/format';
import { Link } from '../../../../src/i18n/navigation';
import { languageKey } from '../../../../src/i18n/labels';
import { withAlternates } from '../../../../src/seo';

interface Params {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return listDoctors().map((doctor) => ({ slug: doctor.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  const doctor = getDoctor(slug);
  if (!doctor || !isLocale(locale)) return {};
  return withAlternates(`/doctors/${slug}`, locale, {
    title: localize(doctor.name, locale),
    description: `${localize(doctor.title, locale)}. ${localize(doctor.qualifications, locale)}`,
  });
}

function Years({ from, to, locale }: { from: number; to?: number; locale: Locale }) {
  return <span dir="ltr">{digits(to ? `${from}-${to}` : `${from}-`, locale)}</span>;
}

export default async function DoctorPage({ params }: Params) {
  const { locale, slug } = await params;
  const doctor = getDoctor(slug);
  if (!isLocale(locale) || !doctor) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const department = getDepartment(doctor.department);
  const { hotline } = getSite().settings.contacts;
  const name = localize(doctor.name, locale);
  const languages = doctor.languages.map((code) => t(languageKey[code])).join(', ');

  return (
    <>
      <PageHeader
        title={name}
        crumbs={[
          { label: t('doctors.title'), href: '/doctors' },
          ...(department
            ? [
                {
                  label: localize(department.name, locale),
                  href: `/departments/${department.slug}`,
                },
              ]
            : []),
        ]}
      />
      <Container className="grid gap-10 py-10 lg:grid-cols-[20rem_1fr]">
        <aside className="flex flex-col gap-4">
          <ImageSlot
            image={doctor.image}
            locale={locale}
            ratio="portrait"
            icon="user"
            className="rounded-panel"
            priority
          />
          <Link
            href={`/book-appointment?doctor=${doctor.slug}`}
            className={buttonClassName('primary', 'lg')}
          >
            <Icon name="calendar" size={20} />
            {t('doctor.book')}
          </Link>
          <a href={`tel:${hotline.tel}`} className={buttonClassName('secondary', 'lg')}>
            <Icon name="phone" size={20} />
            {t('doctor.callHotline')} {hotline.display}
          </a>
          <ShareButton title={localize(doctor.name, locale)} />
        </aside>
        <div className="flex min-w-0 flex-col gap-8">
          <div className="flex flex-col gap-2">
            <p className="text-xl font-medium">{localize(doctor.title, locale)}</p>
            {department ? (
              <Link
                href={`/departments/${department.slug}`}
                className="w-fit font-medium text-primary hover:underline"
              >
                {localize(department.name, locale)}
              </Link>
            ) : null}
            <p className="text-text-muted">{localize(doctor.qualifications, locale)}</p>
            <p className="text-text-muted">{t('doctor.speaks', { languages })}</p>
            {doctor.fee ? (
              <p>
                {t('doctor.fee')}: <strong>{money(doctor.fee, locale)}</strong>{' '}
                <span className="text-sm text-text-muted">({t('common.samplePrice')})</span>
              </p>
            ) : null}
          </div>
          <LeaveNotice
            locale={locale}
            leave={doctor.leave.map(({ from, to, message }) => ({
              from,
              to,
              ...(message ? { message: localize(message, locale) } : {}),
            }))}
          />
          <section
            aria-labelledby="schedule-heading"
            className="rounded-panel border border-border bg-surface p-5"
          >
            <h2 id="schedule-heading" className="mb-3 text-xl font-semibold">
              {t('doctor.schedule')}
            </h2>
            <ScheduleTable doctor={doctor} locale={locale} />
          </section>
          <Tabs
            label={t('doctor.profileTabs')}
            tabs={[
              {
                id: 'about',
                label: t('doctor.about'),
                content: (
                  <div className="flex max-w-prose flex-col gap-4 py-4">
                    {localizeRich(doctor.about, locale).map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                    <h3 className="text-lg font-semibold">{t('doctor.interests')}</h3>
                    <ul className="flex flex-wrap gap-2">
                      {doctor.interests.map((interest) => (
                        <li
                          key={interest.en}
                          className="rounded-pill bg-primary-soft px-3 py-1 text-sm text-primary"
                        >
                          {localize(interest, locale)}
                        </li>
                      ))}
                    </ul>
                  </div>
                ),
              },
              {
                id: 'education',
                label: t('doctor.education'),
                content: (
                  <ul className="flex flex-col gap-3 py-4">
                    {doctor.education.map((entry) => (
                      <li key={entry.degree.en + entry.year}>
                        <p className="font-medium">{localize(entry.degree, locale)}</p>
                        <p className="text-sm text-text-muted">
                          {localize(entry.institution, locale)}, {digits(entry.year, locale)}
                        </p>
                      </li>
                    ))}
                  </ul>
                ),
              },
              {
                id: 'experience',
                label: t('doctor.experience'),
                content: (
                  <ul className="flex flex-col gap-3 py-4">
                    {doctor.experience.map((entry) => (
                      <li key={entry.role.en + entry.from}>
                        <p className="font-medium">{localize(entry.role, locale)}</p>
                        <p className="text-sm text-text-muted">
                          {localize(entry.place, locale)},{' '}
                          <Years from={entry.from} to={entry.to} locale={locale} />
                        </p>
                      </li>
                    ))}
                  </ul>
                ),
              },
            ]}
          />
        </div>
      </Container>
      <section aria-labelledby="related-heading" className="bg-surface py-12">
        <Container>
          <h2 id="related-heading" className="mb-6 text-2xl font-semibold">
            {t('doctor.related')}
          </h2>
          <DoctorGrid
            doctors={relatedDoctors(doctor).map((related) => toDoctorSummary(related, locale))}
          />
        </Container>
      </section>
    </>
  );
}
