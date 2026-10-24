// Appointment dates and times from a doctor's weekly schedule: a date is bookable when the doctor
// has a session on that weekday and is not on leave; times step through each session by the
// doctor's slot length (FR-WEB-BOOK-002, FR-SCH-003 shape, AT-WEB-030, AT-WEB-050). Pure and
// data-free, so the booking wizard runs it in the browser. Implements: T-WEB-10.
import type { Weekday } from '@hms/contracts';

export interface ScheduleRow {
  day: Weekday;
  start: string;
  end: string;
  place: string;
}

export interface BookableDoctor {
  slotMinutes: number;
  schedule: ScheduleRow[];
  leave: { from: string; to: string }[];
}

export interface Slot {
  time: string;
  place: string;
}

const BY_UTC_DAY: readonly Weekday[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function parseIso(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00Z`);
}

export function weekdayOf(isoDate: string): Weekday {
  return BY_UTC_DAY[parseIso(isoDate).getUTCDay()] as Weekday;
}

export function addDays(isoDate: string, days: number): string {
  const date = parseIso(isoDate);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function isOnLeave(doctor: BookableDoctor, isoDate: string): boolean {
  return doctor.leave.some((leave) => leave.from <= isoDate && isoDate <= leave.to);
}

/** Bookable dates from `fromIso` (inclusive) over the next `days` days. */
export function bookableDates(doctor: BookableDoctor, fromIso: string, days = 14): string[] {
  const workingDays = new Set(doctor.schedule.map((row) => row.day));
  const dates: string[] = [];
  for (let offset = 0; offset < days; offset += 1) {
    const date = addDays(fromIso, offset);
    if (workingDays.has(weekdayOf(date)) && !isOnLeave(doctor, date)) dates.push(date);
  }
  return dates;
}

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
};

const toTime = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

/** Start times on a date; a slot must end by the session end. Empty on leave days. */
export function slotsOn(doctor: BookableDoctor, isoDate: string): Slot[] {
  if (isOnLeave(doctor, isoDate)) return [];
  const day = weekdayOf(isoDate);
  return doctor.schedule
    .filter((row) => row.day === day)
    .flatMap((row) => {
      const slots: Slot[] = [];
      const end = toMinutes(row.end);
      for (
        let start = toMinutes(row.start);
        start + doctor.slotMinutes <= end;
        start += doctor.slotMinutes
      ) {
        slots.push({ time: toTime(start), place: row.place });
      }
      return slots;
    });
}
