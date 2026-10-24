// Next chamber and leave against a given today (the browser's), so a static build never fixes
// "Today" to the build day. Implements: T-WEB-15 (review fix 2026-10-22), FR-WEB-DOC-006.
import { describe, expect, it } from 'vitest';
import { backOn, currentOrNextLeave, nextChamber, type ChamberSession } from './availability';

// Sunday and Thursday at 10 am, Tuesday at 4 pm; 2026-10-22 is a Thursday.
const sessions: ChamberSession[] = [
  { day: 'sun', start: '10:00', branch: 'Gulshan' },
  { day: 'tue', start: '16:00', branch: 'Dhanmondi' },
  { day: 'thu', start: '10:00', branch: 'Gulshan' },
];
const timetable = { sessions, leave: [{ from: '2026-11-01', to: '2026-11-03' }] };

describe('nextChamber', () => {
  it('says today on a session day', () => {
    expect(nextChamber(timetable, '2026-10-22')).toMatchObject({ relative: 'today', day: 'thu' });
  });

  it('moves on to the next session day when today has none', () => {
    expect(nextChamber(timetable, '2026-10-23')).toMatchObject({
      date: '2026-10-25',
      day: 'sun',
      relative: null,
      start: '10:00',
    });
    expect(nextChamber(timetable, '2026-10-24')).toMatchObject({ relative: 'tomorrow' });
  });

  it('skips leave days', () => {
    expect(nextChamber(timetable, '2026-10-30')?.date).toBe('2026-11-05');
  });
});

describe('leave', () => {
  it('gives the return day only while on leave', () => {
    expect(backOn(timetable, '2026-11-02')).toBe('2026-11-04');
    expect(backOn(timetable, '2026-11-04')).toBeNull();
  });

  it('keeps an upcoming leave and drops one that has ended', () => {
    expect(currentOrNextLeave(timetable, '2026-10-22')?.from).toBe('2026-11-01');
    expect(currentOrNextLeave(timetable, '2026-11-04')).toBeUndefined();
  });
});
