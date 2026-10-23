// Outpatient (OPD) consultation hours by weekday for a department, written the way hospitals in
// Bangladesh write them ("sokal 9-ta - bikal 5-ta" in Bangla script) (FR-WEB-DEP-004, X33, AT-WEB-052).
// Implements: T-WEB-08, T-WEB-15, T-WEB-17.
import type { Department } from '@hms/contracts';
import type { Locale } from '@hms/i18n';
import { useTranslations } from 'next-intl';
import { formatClockRange } from '../i18n/clock';
import { weekdayKey } from '../i18n/labels';

export function OpdHours({ department, locale }: { department: Department; locale: Locale }) {
  const t = useTranslations();
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm" data-testid="opd-hours">
      {department.opdHours.map((row) => (
        <div key={row.day} className="contents">
          <dt className="font-medium">{t(weekdayKey[row.day])}</dt>
          <dd className="text-text-muted">
            {row.sessions
              .map((session) => formatClockRange(t, session.start, session.end, locale))
              .join(', ')}
          </dd>
        </div>
      ))}
    </dl>
  );
}
