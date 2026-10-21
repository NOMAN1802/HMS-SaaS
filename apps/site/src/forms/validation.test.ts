import { describe, expect, it } from 'vitest';
import { contactErrors, isMobileNumber, normalizePhone } from './validation';

describe('mobile numbers (FR-WEB-BOOK-003)', () => {
  it('accepts 11-digit numbers starting 013 to 019, with or without +88', () => {
    expect(isMobileNumber('01712345678')).toBe(true);
    expect(isMobileNumber('+8801712345678')).toBe(true);
    expect(isMobileNumber('017-1234 5678')).toBe(true);
  });

  it('accepts Bangla digits', () => {
    expect(isMobileNumber('০১৭১২৩৪৫৬৭৮')).toBe(true);
    expect(normalizePhone('০১৭১২৩৪৫৬৭৮')).toBe('01712345678');
  });

  it('rejects short, landline and unknown-prefix numbers', () => {
    expect(isMobileNumber('0171234567')).toBe(false);
    expect(isMobileNumber('0291234567')).toBe(false);
    expect(isMobileNumber('01212345678')).toBe(false);
  });
});

describe('contact errors', () => {
  it('reports missing and invalid fields', () => {
    expect(contactErrors({ name: ' ', phone: '' })).toEqual({
      name: 'required',
      phone: 'required',
    });
    expect(contactErrors({ name: 'Rahim', phone: '123' })).toEqual({ phone: 'invalidPhone' });
    expect(contactErrors({ name: 'Rahim', phone: '01712345678' })).toEqual({});
  });
});
