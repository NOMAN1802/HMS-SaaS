// The site's content adapter: every page reads content through these functions and never from
// the JSON files directly, so WEB-B can swap the source for the CMS snapshot without page changes
// (P-026). Lookups, filters and small derived values (saving, leave, related doctors) live here so
// they are unit tested once. Implements: T-WEB-04, FR-WEB-DOC-001..007, FR-WEB-PKG-004,
// FR-WEB-TST-001, FR-WEB-INF-007.
import type {
  Article,
  Branch,
  Centre,
  Department,
  Doctor,
  HealthPackage,
  LocalizedText,
  PackageCategory,
  Page,
  TestCategory,
  TestPrice,
} from '@hms/contracts';
import { content, type PageName } from './load';

export { localize, localizeRich } from './localize';
export { pageNames, type PageName } from './load';

export const getSite = () => content.site;
export const getPage = (name: PageName): Page => content.pages[name];

export const listDepartments = (): Department[] => content.departments;
export const getDepartment = (slug: string) => content.departments.find((d) => d.slug === slug);
export const listCentres = (): Centre[] => content.centres;
export const getCentre = (slug: string) => content.centres.find((c) => c.slug === slug);
export const listBranches = (): Branch[] => content.branches;
export const getBranch = (slug: string) => content.branches.find((b) => b.slug === slug);
export const listArticles = (): Article[] =>
  [...content.articles].sort((a, b) => b.publishedOn.localeCompare(a.publishedOn));
export const getArticle = (slug: string) => content.articles.find((a) => a.slug === slug);
export const listNotices = () =>
  [...content.notices].sort((a, b) => b.publishedOn.localeCompare(a.publishedOn));
export const listJobs = () => content.jobs;
export const listGuide = () => content.guide;
export const getDoctor = (slug: string) => content.doctors.find((d) => d.slug === slug);
export const listPackagesAll = (): HealthPackage[] => content.packages;
export const getPackage = (slug: string) => content.packages.find((p) => p.slug === slug);

const BANGLA_DIGITS = /[০-৯]/g;

/** Lowercase, Latin digits and single spaces, so "Card", "card" and Bangla digits all match. */
export function normalizeQuery(value: string): string {
  return value
    .replace(BANGLA_DIGITS, (digit) => String(digit.charCodeAt(0) - 0x09e6))
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function matches(query: string, texts: (LocalizedText | string | undefined)[]): boolean {
  if (!query) return true;
  return texts.some((text) => {
    if (!text) return false;
    const values = typeof text === 'string' ? [text] : [text.bn, text.en];
    return values.some((value) => normalizeQuery(value).includes(query));
  });
}

export interface DoctorFilter {
  query?: string;
  department?: string;
  branch?: string;
}

/** Directory search over name, title, department, qualifications and interests, both languages. */
export function listDoctors(filter: DoctorFilter = {}): Doctor[] {
  const query = normalizeQuery(filter.query ?? '');
  return content.doctors.filter((doctor) => {
    if (filter.department && doctor.department !== filter.department) return false;
    if (filter.branch && !doctor.branches.includes(filter.branch)) return false;
    const department = getDepartment(doctor.department);
    return matches(query, [
      doctor.name,
      doctor.title,
      doctor.qualifications,
      department?.name,
      ...doctor.interests,
    ]);
  });
}

export const doctorsInDepartment = (slug: string) => listDoctors({ department: slug });
export const doctorsAtBranch = (slug: string) => listDoctors({ branch: slug });
export const featuredDoctors = () => content.doctors.filter((d) => d.featured);

/** Same department first, then doctors who share a branch; never the doctor themself (X20). */
export function relatedDoctors(doctor: Doctor, limit = 4): Doctor[] {
  const others = content.doctors.filter((d) => d.slug !== doctor.slug);
  const sameDepartment = others.filter((d) => d.department === doctor.department);
  const sameBranch = others.filter(
    (d) =>
      d.department !== doctor.department && d.branches.some((b) => doctor.branches.includes(b)),
  );
  return [...sameDepartment, ...sameBranch].slice(0, limit);
}

/** The leave period covering `isoDate` (YYYY-MM-DD in Asia/Dhaka), if any (FR-WEB-DOC-006). */
export function leaveOn(doctor: Doctor, isoDate: string) {
  return doctor.leave.find((leave) => leave.from <= isoDate && isoDate <= leave.to);
}

/** Leave that has not ended yet, so the notice also shows before the leave starts. */
export function currentOrNextLeave(doctor: Doctor, isoDate: string) {
  return [...doctor.leave]
    .filter((leave) => leave.to >= isoDate)
    .sort((a, b) => a.from.localeCompare(b.from))[0];
}

export function listPackages(category?: PackageCategory): HealthPackage[] {
  return category ? content.packages.filter((p) => p.category === category) : content.packages;
}

/** Package categories that have at least one package, in content order. */
export function packageCategoriesInUse(): PackageCategory[] {
  return [...new Set(content.packages.map((p) => p.category))];
}

function toPaisa(amount: string): bigint {
  return BigInt(amount.replace('.', ''));
}

function fromPaisa(paisa: bigint): string {
  const text = paisa.toString().padStart(3, '0');
  return `${text.slice(0, -2)}.${text.slice(-2)}`;
}

/** Separate total minus package price, exact (FR-WEB-PKG-004); computed, never stored. */
export function packageSaving(item: HealthPackage): string {
  return fromPaisa(toPaisa(item.separatePrice) - toPaisa(item.price));
}

export interface TestFilter {
  query?: string;
  category?: TestCategory;
}

export function listTests(filter: TestFilter = {}): TestPrice[] {
  const query = normalizeQuery(filter.query ?? '');
  return content.tests.filter(
    (test) =>
      (!filter.category || test.category === filter.category) &&
      matches(query, [test.code, test.name]),
  );
}
