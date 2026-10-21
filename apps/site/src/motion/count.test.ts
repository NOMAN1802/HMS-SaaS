// Count-up frames for the stats section (C-083). Implements: T-WEB-15.
import { describe, expect, it } from 'vitest';
import { countParts, countText, easeOutCubic } from './count';

describe('countParts', () => {
  it('splits the number from the text around it', () => {
    expect(countParts('12')).toEqual({ prefix: '', target: 12, suffix: '', grouped: false });
    expect(countParts('1,200+')).toEqual({ prefix: '', target: 1200, suffix: '+', grouped: true });
  });

  it('leaves values without one whole number alone', () => {
    expect(countParts('24/7')).toBeNull();
    expect(countParts('ISO')).toBeNull();
  });
});

describe('countText', () => {
  const parts = countParts('1,200+');
  if (!parts) throw new Error('parts expected');

  it('starts at zero and lands on the real value', () => {
    expect(countText(parts, 0, 'en')).toBe('0+');
    expect(countText(parts, 1, 'en')).toBe('1,200+');
  });

  it('uses the page digits', () => {
    expect(countText(parts, 1, 'bn-BD')).toBe('১,২০০+');
  });

  it('eases out and clamps', () => {
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5);
    expect(easeOutCubic(2)).toBe(1);
    expect(easeOutCubic(-1)).toBe(0);
  });
});
