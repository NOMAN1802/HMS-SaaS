// Catalog keys for package and test categories, written out in full so the catalog usage test
// finds each one (AT-WEB-002). Implements: T-WEB-09.
import type { PackageCategory, TestCategory } from '@hms/contracts';

export const packageCategoryKey = {
  general: 'packages.category.general',
  women: 'packages.category.women',
  men: 'packages.category.men',
  senior: 'packages.category.senior',
  child: 'packages.category.child',
  vaccine: 'packages.category.vaccine',
  corporate: 'packages.category.corporate',
} as const satisfies Record<PackageCategory, string>;

export const testCategoryKey = {
  pathology: 'tests.category.pathology',
  biochemistry: 'tests.category.biochemistry',
  imaging: 'tests.category.imaging',
  cardiology: 'tests.category.cardiology',
  other: 'tests.category.other',
} as const satisfies Record<TestCategory, string>;
