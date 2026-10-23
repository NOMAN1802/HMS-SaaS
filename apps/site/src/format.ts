// Display formatting for the site, always through @hms/i18n so Bangla pages get Bangla digits,
// lakh grouping and the taka sign (FR-WEB-GEN-003, C-057, C-059). Implements: T-WEB-06.
import { formatDate, formatMoney, toLocaleDigits, type Locale } from '@hms/i18n';

/** A taka amount with the sign in the page's digits; whole-taka prices drop the zero paisa, as
 * hospital price lists do ("Tk 3,500" rather than "Tk 3,500.00"). */
export function money(amount: string, locale: Locale): string {
  const text = formatMoney(amount, locale, { symbol: 'sign' });
  return amount.endsWith('.00') ? text.replace(/[.][0\u09e6]{2}$/, '') : text;
}

/** A calendar date (YYYY-MM-DD) as DD-MM-YYYY in the page's digits, read in Dhaka time. */
export function calendarDate(isoDate: string, locale: Locale): string {
  return formatDate(`${isoDate}T12:00:00+06:00`, locale);
}

/** Digits in a time, count or code shown in the page's script. */
export function digits(value: string | number, locale: Locale): string {
  return toLocaleDigits(String(value), locale);
}

/** Today's date in Dhaka as YYYY-MM-DD. Static pages read it at build time. */
export function todayInDhaka(now: Date = new Date()): string {
  // Bangladesh is UTC+6 all year, so a fixed offset is exact.
  return new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString().slice(0, 10);
}
