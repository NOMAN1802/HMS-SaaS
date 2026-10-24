// Catalog keys for values stored as codes in content (weekday, spoken language). The keys are
// written out in full so the catalog usage test can find each one (AT-WEB-002).
// Implements: T-WEB-07.
import type { DoctorLanguage, Weekday } from '@hms/contracts';

export const weekdayKey = {
  sat: 'common.weekday.sat',
  sun: 'common.weekday.sun',
  mon: 'common.weekday.mon',
  tue: 'common.weekday.tue',
  wed: 'common.weekday.wed',
  thu: 'common.weekday.thu',
  fri: 'common.weekday.fri',
} as const satisfies Record<Weekday, string>;

export const languageKey = {
  bn: 'common.language.bn',
  en: 'common.language.en',
  hi: 'common.language.hi',
  ar: 'common.language.ar',
} as const satisfies Record<DoctorLanguage, string>;
