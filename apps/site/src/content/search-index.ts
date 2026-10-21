// Build-time index for the site-wide search (FR-WEB-SRCH-001, X28): one entry per doctor,
// department, centre, package, test and article, with the label in the page language and the
// search terms in both languages, normalized. The static page ships it to the browser; there is
// no search server in WEB-A. Implements: T-WEB-17.
import type { LocalizedText } from '@hms/contracts';
import type { Locale } from '@hms/i18n';
import {
  getDepartment,
  listArticles,
  listCentres,
  listDepartments,
  listDoctors,
  listPackagesAll,
  listTests,
} from './index';
import { localize } from './localize';
import { normalizeQuery } from './normalize';

export const searchKinds = [
  'doctor',
  'department',
  'centre',
  'package',
  'test',
  'article',
] as const;
export type SearchKind = (typeof searchKinds)[number];

export interface SearchEntry {
  kind: SearchKind;
  label: string;
  detail: string;
  href: string;
  terms: string;
}

function both(text: LocalizedText | string | undefined): string[] {
  if (text === undefined) return [];
  return typeof text === 'string' ? [text] : [text.bn, text.en];
}

const terms = (...texts: (LocalizedText | string | undefined)[]) =>
  normalizeQuery(texts.flatMap(both).join(' '));

export function buildSearchIndex(locale: Locale): SearchEntry[] {
  const doctors = listDoctors().map((doctor) => {
    const department = getDepartment(doctor.department);
    return {
      kind: 'doctor' as const,
      label: localize(doctor.name, locale),
      detail: department ? localize(department.name, locale) : localize(doctor.title, locale),
      href: `/doctors/${doctor.slug}`,
      terms: terms(doctor.name, doctor.title, department?.name, ...doctor.interests),
    };
  });
  const departments = listDepartments().map((department) => ({
    kind: 'department' as const,
    label: localize(department.name, locale),
    detail: localize(department.summary, locale),
    href: `/departments/${department.slug}`,
    terms: terms(department.name, department.summary, ...department.services),
  }));
  const centres = listCentres().map((centre) => ({
    kind: 'centre' as const,
    label: localize(centre.name, locale),
    detail: localize(centre.summary, locale),
    href: `/centres/${centre.slug}`,
    terms: terms(centre.name, centre.summary),
  }));
  const packages = listPackagesAll().map((item) => ({
    kind: 'package' as const,
    label: localize(item.name, locale),
    detail: localize(item.audience, locale),
    href: `/packages/${item.slug}`,
    terms: terms(
      item.code,
      item.name,
      item.summary,
      ...item.groups.flatMap((group) => group.tests),
    ),
  }));
  const tests = listTests().map((test) => ({
    kind: 'test' as const,
    label: localize(test.name, locale),
    detail: test.code,
    href: `/tests?q=${encodeURIComponent(test.code)}`,
    terms: terms(test.code, test.name),
  }));
  const articles = listArticles().map((article) => ({
    kind: 'article' as const,
    label: localize(article.title, locale),
    detail: localize(article.category, locale),
    href: `/articles/${article.slug}`,
    terms: terms(article.title, article.excerpt, article.category),
  }));
  return [...doctors, ...departments, ...centres, ...packages, ...tests, ...articles];
}
