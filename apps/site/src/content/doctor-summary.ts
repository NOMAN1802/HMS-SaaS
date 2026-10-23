// A doctor reduced to what a card and the directory filter need, with text already in the page
// language: the weekly chambers (day, time, branch), leave dates and the fee, because that is how
// patients in Bangladesh choose a doctor (critique 2026-10-21, signature: chamber-day timetable).
// Built on the server so client components get small plain props instead of the content set.
// Which chamber is next, and whether the doctor is on leave today, depend on today's date, so
// they are worked out in the browser (availability.ts): a value worked out during the static
// build would say "Today" for the build day forever.
// Implements: T-WEB-07, T-WEB-15, FR-WEB-DOC-001..003, FR-WEB-DOC-006.
import type { Doctor, ImageRef } from '@hms/contracts';
import type { Locale } from '@hms/i18n';
import { money } from '../format';
import type { ChamberSession, LeavePeriod } from './availability';
import { getBranch, getDepartment } from './index';
import { localize } from './localize';
import { normalizeQuery } from './normalize';

export interface DoctorSummary {
  slug: string;
  name: string;
  title: string;
  department: string;
  departmentSlug: string;
  branches: string;
  branchSlugs: string[];
  /** The weekly timetable, in content order. */
  sessions: ChamberSession[];
  leave: LeavePeriod[];
  fee: string | null;
  image: ImageRef;
  /** Name, title, department, symptoms, qualifications and interests in both languages. */
  terms: string;
}

export function toDoctorSummary(doctor: Doctor, locale: Locale): DoctorSummary {
  const department = getDepartment(doctor.department);
  const branches = doctor.branches.map(getBranch).filter((branch) => branch !== undefined);
  const searchable = [
    doctor.name,
    doctor.title,
    doctor.qualifications,
    department?.name,
    ...(department?.keywords ?? []),
    ...doctor.interests,
  ];
  return {
    slug: doctor.slug,
    name: localize(doctor.name, locale),
    title: localize(doctor.title, locale),
    department: department ? localize(department.name, locale) : '',
    departmentSlug: doctor.department,
    branches: branches.map((branch) => localize(branch.area, locale)).join(', '),
    branchSlugs: doctor.branches,
    sessions: doctor.schedule.map((session) => {
      const branch = getBranch(session.branch);
      return {
        day: session.day,
        start: session.start,
        branch: branch ? localize(branch.area, locale) : '',
      };
    }),
    leave: doctor.leave.map(({ from, to }) => ({ from, to })),
    fee: doctor.fee ? money(doctor.fee, locale) : null,
    image: doctor.image,
    terms: normalizeQuery(searchable.flatMap((text) => (text ? [text.bn, text.en] : [])).join(' ')),
  };
}
