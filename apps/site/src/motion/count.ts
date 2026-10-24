// Frames of a counting stat ("0+" up to "1,200+"), in the page's digits. Pure, so the count-up
// component only schedules frames and writes text. Implements: T-WEB-15, C-083.
import { formatNumber, toLocaleDigits, type Locale } from '@hms/i18n';

export interface CountParts {
  prefix: string;
  target: number;
  suffix: string;
  grouped: boolean;
}

/** Splits a stat value into the number to count and the text around it; null when there is no
 * whole number to count (a value like "24/7" is shown as it is). */
export function countParts(value: string): CountParts | null {
  const match = /^(\D*)(\d{1,3}(?:,\d{3})+|\d+)(\D*)$/.exec(value.trim());
  if (!match) return null;
  const [, prefix = '', number = '', suffix = ''] = match;
  return {
    prefix,
    target: Number(number.replaceAll(',', '')),
    suffix,
    grouped: number.includes(','),
  };
}

/** Strong ease-out, so the count slows as it lands on the real value. */
export function easeOutCubic(progress: number): number {
  const clamped = Math.min(Math.max(progress, 0), 1);
  return 1 - (1 - clamped) ** 3;
}

/** The text shown at `progress` (0 to 1) of the count. */
export function countText(parts: CountParts, progress: number, locale: Locale): string {
  const current = Math.round(parts.target * easeOutCubic(progress));
  const number = parts.grouped
    ? formatNumber(String(current), locale)
    : toLocaleDigits(String(current), locale);
  return `${parts.prefix}${number}${parts.suffix}`;
}
