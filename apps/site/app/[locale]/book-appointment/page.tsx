// Book an appointment (mock, FR-WEB-BOOK-*). The server prepares each doctor's name, department
// and schedule in the page language; the wizard computes dates and times in the browser.
// Implements: T-WEB-10.
import { isLocale } from '@hms/i18n';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { BookingWizard, type BookingDoctor } from '../../../src/components/booking-wizard';
import { Container } from '../../../src/components/container';
import { PageHeader } from '../../../src/components/page-header';
import { BookingSkeleton } from '../../../src/components/skeletons';
import {
  getBranch,
  getDepartment,
  listDepartments,
  listDoctors,
  localize,
} from '../../../src/content';
import { withAlternates } from '../../../src/seo';

interface Params {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return withAlternates('/book-appointment', locale, {
    title: t('booking.title'),
    description: t('booking.intro'),
  });
}

export default async function BookAppointmentPage({ params }: Params) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const doctors: BookingDoctor[] = listDoctors().map((doctor) => {
    const department = getDepartment(doctor.department);
    return {
      slug: doctor.slug,
      name: localize(doctor.name, locale),
      title: localize(doctor.title, locale),
      departmentSlug: doctor.department,
      departmentName: department ? localize(department.name, locale) : '',
      slotMinutes: doctor.slotMinutes,
      leave: doctor.leave.map(({ from, to }) => ({ from, to })),
      schedule: doctor.schedule.map((row) => {
        const branch = getBranch(row.branch);
        return {
          day: row.day,
          start: row.start,
          end: row.end,
          place: `${branch ? localize(branch.name, locale) : ''}, ${localize(row.room, locale)}`,
        };
      }),
    };
  });
  const departments = listDepartments().map((d) => ({
    value: d.slug,
    label: localize(d.name, locale),
  }));

  return (
    <>
      <PageHeader title={t('booking.title')} intro={t('booking.intro')} />
      <Container className="py-10">
        <div className="max-w-4xl rounded-panel border border-border bg-surface p-6 sm:p-8">
          {/* The wizard reads the URL, so it renders in the browser; the skeleton holds its place. */}
          <Suspense fallback={<BookingSkeleton />}>
            <BookingWizard doctors={doctors} departments={departments} />
          </Suspense>
        </div>
      </Container>
    </>
  );
}
