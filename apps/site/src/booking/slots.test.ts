import { describe, expect, it } from 'vitest';
import { addDays, bookableDates, slotsOn, weekdayOf, type BookableDoctor } from './slots';

// 2026-10-24 is a Saturday.
const doctor: BookableDoctor = {
  slotMinutes: 20,
  schedule: [
    { day: 'sat', start: '09:00', end: '10:00', place: 'Gulshan, room 305' },
    { day: 'mon', start: '17:00', end: '17:50', place: 'Dhanmondi, room 212' },
  ],
  leave: [{ from: '2026-10-26', to: '2026-10-27' }],
};

describe('dates', () => {
  it('knows weekdays and adds days across months', () => {
    expect(weekdayOf('2026-10-24')).toBe('sat');
    expect(addDays('2026-10-30', 3)).toBe('2026-11-02');
  });

  it('offers only scheduled weekdays outside leave (AT-WEB-050)', () => {
    expect(bookableDates(doctor, '2026-10-24', 14)).toEqual([
      '2026-10-24',
      '2026-10-31',
      '2026-11-02',
    ]);
  });
});

describe('slots (AT-WEB-030)', () => {
  it('steps by slotMinutes and never runs past the session end', () => {
    expect(slotsOn(doctor, '2026-10-24').map((slot) => slot.time)).toEqual([
      '09:00',
      '09:20',
      '09:40',
    ]);
    expect(slotsOn(doctor, '2026-11-02').map((slot) => slot.time)).toEqual(['17:00', '17:20']);
  });

  it('returns nothing on a leave day or a day without a session', () => {
    expect(slotsOn(doctor, '2026-10-26')).toEqual([]);
    expect(slotsOn(doctor, '2026-10-25')).toEqual([]);
  });
});
