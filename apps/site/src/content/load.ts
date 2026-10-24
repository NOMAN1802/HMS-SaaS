// Reads the mock content files and validates them once, when the module is first imported during
// the build. A malformed file, an unknown section type or a dangling slug throws, so the build
// fails instead of shipping a broken page (FR-WEB-GEN-008, AT-WEB-003). WEB-B replaces this module
// with one that reads the published CMS snapshot (P-026, P-040). Implements: T-WEB-04, C-070.
import {
  articleSchema,
  branchSchema,
  centreSchema,
  departmentSchema,
  doctorSchema,
  guideSectionSchema,
  healthPackageSchema,
  jobOpeningSchema,
  noticeSchema,
  pageSchema,
  siteSchema,
  testPriceSchema,
  type GuideSection,
  type Notice,
  type Page,
} from '@hms/contracts';
import articlesJson from '../../content/articles.json';
import branchesJson from '../../content/branches.json';
import centresJson from '../../content/centres.json';
import departmentsJson from '../../content/departments.json';
import doctorsJson from '../../content/doctors.json';
import guideJson from '../../content/guide.json';
import jobsJson from '../../content/jobs.json';
import noticesJson from '../../content/notices.json';
import packagesJson from '../../content/packages.json';
import aboutJson from '../../content/pages/about.json';
import emergencyJson from '../../content/pages/emergency.json';
import homeJson from '../../content/pages/home.json';
import patientsJson from '../../content/pages/patients-and-visitors.json';
import portalJson from '../../content/pages/portal.json';
import siteJson from '../../content/site.json';
import testsJson from '../../content/tests.json';
import { findReferenceErrors, type ContentSet } from './references';

export const pageNames = ['home', 'about', 'patients-and-visitors', 'emergency', 'portal'] as const;
export type PageName = (typeof pageNames)[number];

export interface Content extends ContentSet {
  pages: Record<PageName, Page>;
  notices: Notice[];
  guide: GuideSection[];
}

interface Parser<T> {
  safeParse(
    data: unknown,
  ):
    | { success: true; data: T }
    | { success: false; error: { issues: { path: PropertyKey[]; message: string }[] } };
}

function parse<T>(file: string, schema: Parser<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  const issues = result.error.issues
    .slice(0, 10)
    .map((issue) => `  ${issue.path.map(String).join('.')}: ${issue.message}`)
    .join('\n');
  throw new Error(`Invalid content in content/${file}:\n${issues}`);
}

/** Parses and cross-checks a full content set; exported so tests can feed broken fixtures. */
export function buildContent(raw: RawContent): Content {
  const pages = Object.fromEntries(
    pageNames.map((name) => [name, parse(`pages/${name}.json`, pageSchema, raw.pages[name])]),
  ) as Record<PageName, Page>;
  const content: Content = {
    site: parse('site.json', siteSchema, raw.site),
    pages,
    departments: parse('departments.json', departmentSchema.array(), raw.departments),
    centres: parse('centres.json', centreSchema.array(), raw.centres),
    doctors: parse('doctors.json', doctorSchema.array(), raw.doctors),
    packages: parse('packages.json', healthPackageSchema.array(), raw.packages),
    tests: parse('tests.json', testPriceSchema.array(), raw.tests),
    branches: parse('branches.json', branchSchema.array(), raw.branches),
    articles: parse('articles.json', articleSchema.array(), raw.articles),
    notices: parse('notices.json', noticeSchema.array(), raw.notices),
    jobs: parse('jobs.json', jobOpeningSchema.array(), raw.jobs),
    guide: parse('guide.json', guideSectionSchema.array(), raw.guide),
  };
  const errors = findReferenceErrors(content);
  if (errors.length > 0) throw new Error(`Broken content references:\n  ${errors.join('\n  ')}`);
  return content;
}

export interface RawContent {
  site: unknown;
  pages: Record<PageName, unknown>;
  departments: unknown;
  centres: unknown;
  doctors: unknown;
  packages: unknown;
  tests: unknown;
  branches: unknown;
  articles: unknown;
  notices: unknown;
  jobs: unknown;
  guide: unknown;
}

export const rawContent: RawContent = {
  site: siteJson,
  pages: {
    home: homeJson,
    about: aboutJson,
    'patients-and-visitors': patientsJson,
    emergency: emergencyJson,
    portal: portalJson,
  },
  departments: departmentsJson,
  centres: centresJson,
  doctors: doctorsJson,
  packages: packagesJson,
  tests: testsJson,
  branches: branchesJson,
  articles: articlesJson,
  notices: noticesJson,
  jobs: jobsJson,
  guide: guideJson,
};

export const content: Content = buildContent(rawContent);
