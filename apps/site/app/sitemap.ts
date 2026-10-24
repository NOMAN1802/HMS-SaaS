// sitemap.xml: every public page in both languages with its alternate (FR-WEB-SEO-002,
// AT-WEB-041). Implements: T-WEB-13.
import type { MetadataRoute } from 'next';
import {
  listArticles,
  listBranches,
  listCentres,
  listDepartments,
  listDoctors,
  listPackagesAll,
} from '../src/content';
import { localePrefixes } from '../src/i18n/routing';
import { SITE_ORIGIN } from '../src/seo';

const STATIC_PATHS = [
  '/',
  '/doctors',
  '/departments',
  '/centres',
  '/packages',
  '/tests',
  '/book-appointment',
  '/reports',
  '/sample-collection',
  '/feedback',
  '/patients-and-visitors',
  '/emergency',
  '/branches',
  '/contact',
  '/articles',
  '/notices',
  '/about',
  '/careers',
  '/portal',
];

function url(prefix: string, path: string): string {
  return `${SITE_ORIGIN}${prefix}${path === '/' ? '' : path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    ...STATIC_PATHS,
    ...listDoctors().map((doctor) => `/doctors/${doctor.slug}`),
    ...listDepartments().map((department) => `/departments/${department.slug}`),
    ...listCentres().map((centre) => `/centres/${centre.slug}`),
    ...listPackagesAll().map((item) => `/packages/${item.slug}`),
    ...listBranches().map((branch) => `/branches/${branch.slug}`),
    ...listArticles().map((article) => `/articles/${article.slug}`),
  ];
  return paths.flatMap((path) =>
    Object.values(localePrefixes).map((prefix) => ({
      url: url(prefix, path),
      alternates: {
        languages: {
          'bn-BD': url(localePrefixes['bn-BD'], path),
          en: url(localePrefixes.en, path),
        },
      },
    })),
  );
}
