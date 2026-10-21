// Field checks shared by the site's mock forms (appointment request, booking, report lookup,
// feedback). Pure functions so they are unit tested once; forms never send anything in WEB-A
// (FR-WEB-GEN-006). Implements: T-WEB-06, FR-WEB-BOOK-003.
import { toLatinDigits } from '../content/normalize';

/** Digits only, Latin, without a leading +88 or 88 country code. */
export function normalizePhone(value: string): string {
  const digits = toLatinDigits(value).replace(/[\s-]/g, '');
  return digits.replace(/^\+?88(?=01)/, '');
}

/** A Bangladeshi mobile number: 11 digits starting with 013 to 019; Bangla digits accepted. */
export function isMobileNumber(value: string): boolean {
  return /^01[3-9]\d{8}$/.test(normalizePhone(value));
}

export function isFilled(value: string): boolean {
  return value.trim().length > 0;
}

export type FieldError = 'required' | 'invalidPhone';

/** Validates a name-and-phone pair, the core of every patient contact form. */
export function contactErrors(values: { name: string; phone: string }) {
  const errors: Partial<Record<'name' | 'phone', FieldError>> = {};
  if (!isFilled(values.name)) errors.name = 'required';
  if (!isFilled(values.phone)) errors.phone = 'required';
  else if (!isMobileNumber(values.phone)) errors.phone = 'invalidPhone';
  return errors;
}
