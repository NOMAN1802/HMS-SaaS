// A doctor reduced to what a card and the directory filter need, with text already in the page
// language: the next chamber (day, time, branch) and the fee, because that is how patients in
// Bangladesh choose a doctor (critique 2026-10-21, signature: chamber-day timetable).
// Built on the server so client components get small plain props instead of the content set.
// Implements: T-WEB-07, T-WEB-15, FR-WEB-DOC-001..003, FR-WEB-DOC-006.
import type { Doctor, ImageRef, Weekday } from '@hms/contracts';
import type { Locale } from '@hms/i18n';
import { addDays, weekdayOf } from '../booking/slots';
import { money, todayInDhaka } from '../format';
import { getBranch, getDepartment, leaveOn } from './index';
import { localize } from './localize';
import { normalizeQuery } from './normalize';

export interface NextChamber {
  date: string;
  day: Weekday;
  /** Today or tomorrow, so the card can say so in words. */
  relative: 'today' | 'tomorrow' | null;
  start: string;
  branch: string;
}

export interface DoctorSummary {
  slug: string;
  name: string;
  title: string;
  department: string;
  departmentSlug: string;
  branches: string;
  branchSlugs: string[];
  /** Date the doctor is back, when on leave today. */
  backOn: string | null;
  nextChamber: NextChamber | null;
  fee: string | null;
  image: ImageRef;
  /** Name, title, department, symptoms, qualifications and interests in both languages. */
  terms: string;
}

const RELATIVE: readonly NextChamber['relative'][] = ['today', 'tomorrow'];

/** The first session from today on that is not on a leave day, looking two weeks ahead. */
export function nextChamber(doctor: Doctor, locale: Locale, today: string): NextChamber | null {
  for (let offset = 0; offset < 14; offset += 1) {
    const date = addDays(today, offset);
    if (leaveOn(doctor, date)) continue;
    const day = weekdayOf(date);
    const row = doctor.schedule.find((session) => session.day === day);
    if (!row) continue;
    const branch = getBranch(row.branch);
    return {
      date,
      day,
      relative: RELATIVE[offset] ?? null,
      start: row.start,
      branch: branch ? localize(branch.area, locale) : '',
    };
  }
  return null;
}

export function toDoctorSummary(
  doctor: Doctor,
  locale: Locale,
  today = todayInDhaka(),
): DoctorSummary {
  const department = getDepartment(doctor.department);
  const branches = doctor.branches.map(getBranch).filter((branch) => branch !== undefined);
  const leave = leaveOn(doctor, today);
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
    backOn: leave ? addDays(leave.to, 1) : null,
    nextChamber: nextChamber(doctor, locale, today),
    fee: doctor.fee ? money(doctor.fee, locale) : null,
    image: doctor.image,
    terms: normalizeQuery(searchable.flatMap((text) => (text ? [text.bn, text.en] : [])).join(' ')),
  };
}
