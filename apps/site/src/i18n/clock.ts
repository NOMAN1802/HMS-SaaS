// Everyday time and date wording for the public site: "bikal 5-ta" / "5 pm" and
// "2 October 2026" in the page script, the way hospitals in Bangladesh write chamber hours and
// notices. All words come from the site catalog; digits follow the page language.
// Implements: T-WEB-15 (design polish, critique 2026-10-21), FR-WEB-GEN-003.
import type { Locale } from '@hms/i18n';
import type { useTranslations } from 'next-intl';
import { addDays, weekdayOf } from '../booking/slots';
import { digits } from '../format';
import { weekdayKey } from './labels';

type Translate = ReturnType<typeof useTranslations>;

const MONTH_KEYS = [
  'common.month.jan',
  'common.month.feb',
  'common.month.mar',
  'common.month.apr',
  'common.month.may',
  'common.month.jun',
  'common.month.jul',
  'common.month.aug',
  'common.month.sep',
  'common.month.oct',
  'common.month.nov',
  'common.month.dec',
] as const;

/** Bangla names the part of the day; English uses am and pm. */
function periodKey(hour: number, locale: Locale) {
  if (locale === 'en') return hour < 12 ? 'common.period.am' : 'common.period.pm';
  if (hour >= 4 && hour < 12) return 'common.period.morning';
  if (hour >= 12 && hour < 15) return 'common.period.noon';
  if (hour >= 15 && hour < 18) return 'common.period.afternoon';
  if (hour >= 18 && hour < 20) return 'common.period.evening';
  return 'common.period.night';
}

/** "HH:mm" to "bikal 5-ta", "sokal 9:30" (in Bangla script), "5 pm" or "9:30 am". */
export function formatClock(t: Translate, time: string, locale: Locale): string {
  const [hour = 0, minute = 0] = time.split(':').map(Number);
  const values = {
    hour: digits(hour % 12 || 12, locale),
    period: t(periodKey(hour, locale)),
  };
  if (minute === 0) return t('common.clock.hour', values);
  return t('common.clock.hourMinute', {
    ...values,
    minute: digits(String(minute).padStart(2, '0'), locale),
  });
}

export function formatClockRange(t: Translate, start: string, end: string, locale: Locale) {
  return `${formatClock(t, start, locale)} - ${formatClock(t, end, locale)}`;
}

function parts(isoDate: string) {
  const [year = '', month = '1', day = '1'] = isoDate.split('-');
  return {
    year,
    month: MONTH_KEYS[Number(month) - 1] ?? MONTH_KEYS[0],
    day: String(Number(day)),
  };
}

/** "YYYY-MM-DD" to "2 October 2026", with month name and digits in the page language. */
export function formatLongDate(t: Translate, isoDate: string, locale: Locale): string {
  const { year, month, day } = parts(isoDate);
  return t('common.date.long', {
    day: digits(day, locale),
    month: t(month),
    year: digits(year, locale),
  });
}

/** "YYYY-MM-DD" to "2 October" in the page language, for dates in the coming weeks. */
export function formatDayMonth(t: Translate, isoDate: string, locale: Locale): string {
  const { month, day } = parts(isoDate);
  return t('common.date.dayMonth', { day: digits(day, locale), month: t(month) });
}

/** The next `count` days from `today` as choices labelled "Saturday, 24 October" (page language). */
export function dayOptions(t: Translate, locale: Locale, today: string, count = 14) {
  return Array.from({ length: count }, (_, offset) => {
    const date = addDays(today, offset);
    return {
      value: date,
      label: `${t(weekdayKey[weekdayOf(date)])}, ${formatDayMonth(t, date, locale)}`,
    };
  });
}
