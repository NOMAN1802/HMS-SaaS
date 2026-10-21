// A doctor reduced to what a card and the directory filter need, with text already in the page
// language. Built on the server so client components get small plain props instead of the
// content set (T-WEB-06 rule). Implements: T-WEB-07, FR-WEB-DOC-001..003.
import type { Doctor, ImageRef } from '@hms/contracts';
import type { Locale } from '@hms/i18n';
import { todayInDhaka } from '../format';
import { getBranch, getDepartment, leaveOn } from './index';
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
  onLeave: boolean;
  image: ImageRef;
  /** Name, title, department, qualifications and interests in both languages, normalized. */
  terms: string;
}

export function toDoctorSummary(
  doctor: Doctor,
  locale: Locale,
  today = todayInDhaka(),
): DoctorSummary {
  const department = getDepartment(doctor.department);
  const branches = doctor.branches.map(getBranch).filter((branch) => branch !== undefined);
  const searchable = [
    doctor.name,
    doctor.title,
    doctor.qualifications,
    department?.name,
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
    onLeave: leaveOn(doctor, today) !== undefined,
    image: doctor.image,
    terms: normalizeQuery(searchable.flatMap((text) => (text ? [text.bn, text.en] : [])).join(' ')),
  };
}
