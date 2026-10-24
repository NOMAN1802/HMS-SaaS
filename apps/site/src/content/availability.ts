// When a doctor can be seen: leave lookups (FR-WEB-DOC-006) and the next chamber from a weekly
// timetable. These depend on today's date, and the site is built ahead of time, so the doctor
// card and the profile's leave notice work them out in the browser; that is why this module is
// kept apart from the content adapter and imports no content. Dates are YYYY-MM-DD in Asia/Dhaka.
// Implements: T-WEB-04, T-WEB-07, T-WEB-15.
import type { Weekday } from '@hms/contracts';
import { addDays, weekdayOf } from '../booking/slots';

export interface LeavePeriod {
  from: string;
  to: string;
}

export interface ChamberSession {
  day: Weekday;
  start: string;
  /** Branch area in the page language. */
  branch: string;
}

export interface NextChamber {
  date: string;
  day: Weekday;
  /** Today or tomorrow, so the card can say so in words. */
  relative: 'today' | 'tomorrow' | null;
  start: string;
  branch: string;
}

const RELATIVE: readonly NextChamber['relative'][] = ['today', 'tomorrow'];

/** The leave period covering `isoDate`, if any. */
export function leaveOn<T extends LeavePeriod>(doctor: { leave: T[] }, isoDate: string) {
  return doctor.leave.find((leave) => leave.from <= isoDate && isoDate <= leave.to);
}

/** Leave that has not ended yet, so the notice also shows before the leave starts. */
export function currentOrNextLeave<T extends LeavePeriod>(doctor: { leave: T[] }, isoDate: string) {
  return [...doctor.leave]
    .filter((leave) => leave.to >= isoDate)
    .sort((a, b) => a.from.localeCompare(b.from))[0];
}

/** The day the doctor is back, when on leave on `today`. */
export function backOn(doctor: { leave: LeavePeriod[] }, today: string): string | null {
  const leave = leaveOn(doctor, today);
  return leave ? addDays(leave.to, 1) : null;
}

/** The first session from today on that is not on a leave day, looking two weeks ahead. */
export function nextChamber(
  doctor: { sessions: ChamberSession[]; leave: LeavePeriod[] },
  today: string,
): NextChamber | null {
  for (let offset = 0; offset < 14; offset += 1) {
    const date = addDays(today, offset);
    if (leaveOn(doctor, date)) continue;
    const day = weekdayOf(date);
    const session = doctor.sessions.find((item) => item.day === day);
    if (!session) continue;
    return {
      date,
      day,
      relative: RELATIVE[offset] ?? null,
      start: session.start,
      branch: session.branch,
    };
  }
  return null;
}
