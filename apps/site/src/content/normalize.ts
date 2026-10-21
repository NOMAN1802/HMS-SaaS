// Text helpers with no content data, safe to import from client components (search box, forms)
// without pulling the content files into the browser bundle. Implements: T-WEB-04, T-WEB-06.

const BANGLA_DIGITS = /[০-৯]/g;

/** Bangla digits to Latin, so "০১৭" and "017" compare equal (FR-WEB-SRCH-001, FR-WEB-BOOK-003). */
export function toLatinDigits(value: string): string {
  return value.replace(BANGLA_DIGITS, (digit) => String(digit.charCodeAt(0) - 0x09e6));
}

/** Lowercase, Latin digits and single spaces, so "Card", "card" and Bangla digits all match. */
export function normalizeQuery(value: string): string {
  return toLatinDigits(value).toLowerCase().replace(/\s+/g, ' ').trim();
}
