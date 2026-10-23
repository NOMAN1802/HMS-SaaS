// Weekly chamber schedule: day, time range, branch and room, with digits in the page language
// (FR-WEB-DOC-004, AT-WEB-012). A table on wide screens, stacked rows on phones (F section 3).
// Implements: T-WEB-07.
import type { Doctor } from '@hms/contracts';
import type { Locale } from '@hms/i18n';
import { useTranslations } from 'next-intl';
import { getBranch, localize } from '../content';
import { formatClockRange } from '../i18n/clock';
import { weekdayKey } from '../i18n/labels';

export function ScheduleTable({ doctor, locale }: { doctor: Doctor; locale: Locale }) {
  const t = useTranslations();
  return (
    <table className="w-full text-start text-sm" data-testid="schedule">
      <caption className="sr-only">{t('doctor.schedule')}</caption>
      <thead className="hidden sm:table-header-group">
        <tr className="border-b border-border text-text-muted">
          <th scope="col" className="py-2 text-start font-medium">
            {t('doctor.day')}
          </th>
          <th scope="col" className="py-2 text-start font-medium">
            {t('doctor.time')}
          </th>
          <th scope="col" className="py-2 text-start font-medium">
            {t('doctor.place')}
          </th>
        </tr>
      </thead>
      <tbody>
        {doctor.schedule.map((row) => {
          const branch = getBranch(row.branch);
          return (
            <tr
              key={`${row.day}-${row.start}`}
              className="grid grid-cols-2 gap-x-4 border-b border-border py-3 sm:table-row sm:py-0"
            >
              <th scope="row" className="text-start font-medium sm:py-3">
                {t(weekdayKey[row.day])}
              </th>
              <td className="sm:py-3">{formatClockRange(t, row.start, row.end, locale)}</td>
              <td className="col-span-2 text-text-muted sm:py-3">
                {branch ? `${localize(branch.name, locale)}, ` : ''}
                {localize(row.room, locale)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
